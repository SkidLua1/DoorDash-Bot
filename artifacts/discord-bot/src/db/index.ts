/**
 * Bot-specific database helpers.
 */

import { db } from "@workspace/db";
import {
  botConfigTable,
  authorizedUsersTable,
  userCreditsTable,
  ddAccountsTable,
  ordersTable,
  touchesTable,
  stripeSessionsTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { encrypt } from "../utils/encrypt.js";

// ── Bot config ────────────────────────────────────────────────────────────────

export async function initOwner(ownerDiscordId: string): Promise<void> {
  const existing = await db.select().from(botConfigTable).limit(1);
  if (existing.length > 0) return;

  await db.insert(botConfigTable).values({ ownerDiscordId });
  // Owner gets free credits to start
  await ensureCredits(ownerDiscordId);
}

export async function transferOwnership(newOwnerDiscordId: string): Promise<void> {
  const existing = await db.select().from(botConfigTable).limit(1);
  if (existing.length > 0) {
    await db.update(botConfigTable).set({ ownerDiscordId: newOwnerDiscordId });
  } else {
    await db.insert(botConfigTable).values({ ownerDiscordId: newOwnerDiscordId });
  }
}

// ── Authorized users ──────────────────────────────────────────────────────────

export async function addAuthorizedUser(
  discordId: string,
  discordUsername: string,
  addedBy: string,
): Promise<boolean> {
  const existing = await db
    .select()
    .from(authorizedUsersTable)
    .where(eq(authorizedUsersTable.discordId, discordId))
    .limit(1);

  if (existing.length > 0) return false; // already exists

  await db
    .insert(authorizedUsersTable)
    .values({ discordId, discordUsername, addedBy });

  return true;
}

export async function removeAuthorizedUser(discordId: string): Promise<boolean> {
  const result = await db
    .delete(authorizedUsersTable)
    .where(eq(authorizedUsersTable.discordId, discordId));

  return (result.rowCount ?? 0) > 0;
}

export async function listAuthorizedUsers(): Promise<
  { discordId: string; discordUsername: string; addedAt: Date }[]
> {
  return db
    .select({
      discordId: authorizedUsersTable.discordId,
      discordUsername: authorizedUsersTable.discordUsername,
      addedAt: authorizedUsersTable.addedAt,
    })
    .from(authorizedUsersTable);
}

// ── Credits ───────────────────────────────────────────────────────────────────

export async function ensureCredits(discordId: string): Promise<void> {
  await db
    .insert(userCreditsTable)
    .values({ discordId, balance: 0 })
    .onConflictDoNothing();
}

export async function getCredits(discordId: string): Promise<number> {
  await ensureCredits(discordId);
  const rows = await db
    .select({ balance: userCreditsTable.balance })
    .from(userCreditsTable)
    .where(eq(userCreditsTable.discordId, discordId))
    .limit(1);

  return rows[0]?.balance ?? 0;
}

export async function addCredits(
  discordId: string,
  amount: number,
): Promise<number> {
  await ensureCredits(discordId);
  const rows = await db
    .update(userCreditsTable)
    .set({
      balance: sql`${userCreditsTable.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(userCreditsTable.discordId, discordId))
    .returning({ balance: userCreditsTable.balance });

  return rows[0]?.balance ?? 0;
}

export async function deductCredits(
  discordId: string,
  amount: number,
): Promise<boolean> {
  const current = await getCredits(discordId);
  if (current < amount) return false;

  await db
    .update(userCreditsTable)
    .set({
      balance: sql`${userCreditsTable.balance} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(userCreditsTable.discordId, discordId));

  return true;
}

// ── DoorDash accounts ─────────────────────────────────────────────────────────

export async function addDdAccount(
  name: string,
  email: string,
  password: string,
  addedBy: string,
): Promise<number> {
    // Check for duplicate email before inserting to give a clear error message
    const existing = await db
      .select({ id: ddAccountsTable.id })
      .from(ddAccountsTable)
      .where(eq(ddAccountsTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`An account with email ${email} is already registered.`);
    }

    const encryptedPassword = encrypt(password);
    const rows = await db
      .insert(ddAccountsTable)
      .values({ name, email, encryptedPassword, addedBy })
      .returning({ id: ddAccountsTable.id });

    return rows[0].id;
    }

export async function getDdAccounts(): Promise<
  { id: number; name: string; email: string; isActive: boolean }[]
> {
  return db
    .select({
      id: ddAccountsTable.id,
      name: ddAccountsTable.name,
      email: ddAccountsTable.email,
      isActive: ddAccountsTable.isActive,
    })
    .from(ddAccountsTable);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function saveOrder(params: {
  discordId: string;
  orderUuid: string;
  ddAccountId: number;
  groupOrderUrl?: string;
  storeName?: string;
  totalCents: number;
  creditsUsed: number;
  status: string;
  trackingUrl?: string;
}): Promise<void> {
  await db.insert(ordersTable).values(params);
}

// ── Touches ───────────────────────────────────────────────────────────────────

export async function saveTouch(params: {
  discordId: string;
  discordUsername: string;
  photoUrl: string;
  messageId: string;
  channelId: string;
  guildId: string;
  note?: string;
}): Promise<void> {
  await db.insert(touchesTable).values(params);
}

// ── Stripe sessions ───────────────────────────────────────────────────────────

export async function createStripeSession(
  discordId: string,
  stripeSessionId: string,
  creditsAmount: number,
  amountCents: number,
): Promise<void> {
  await db.insert(stripeSessionsTable).values({
    discordId,
    stripeSessionId,
    creditsAmount,
    amountCents,
  });
}

export async function completeStripeSession(
  stripeSessionId: string,
): Promise<{ discordId: string; creditsAmount: number } | null> {
  const rows = await db
    .update(stripeSessionsTable)
    .set({ status: "completed" })
    .where(eq(stripeSessionsTable.stripeSessionId, stripeSessionId))
    .returning({
      discordId: stripeSessionsTable.discordId,
      creditsAmount: stripeSessionsTable.creditsAmount,
      status: stripeSessionsTable.status,
    });

  const row = rows[0];
  if (!row) return null;

  return { discordId: row.discordId, creditsAmount: row.creditsAmount };
}
