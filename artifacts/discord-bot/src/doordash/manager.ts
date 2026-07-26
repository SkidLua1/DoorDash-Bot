/**
 * DoorDash multi-account manager.
 * Loads accounts from DB, manages sessions in memory, saves sessions back to DB.
 */

import { db } from "@workspace/db";
import { ddAccountsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CookieJar } from "./client/cookies.js";
import { DoorDashSession } from "./client/session.js";
import { HttpClient } from "./client/http.js";
import { TrafficLogger } from "./logging/traffic.js";
import { GraphQLClient } from "./api/graphql.js";
import { CheckoutAPI } from "./api/checkout.js";
import { GroupAPI } from "./api/group.js";
import { AccountAPI } from "./api/account.js";
import { LoginFlow } from "./auth/login.js";
import { decrypt } from "../utils/encrypt.js";

export interface DoorDashClient {
  accountId: number;
  email: string;
  session: DoorDashSession;
  http: HttpClient;
  gql: GraphQLClient;
  checkout: CheckoutAPI;
  group: GroupAPI;
  account: AccountAPI;
  login: LoginFlow;
}

/** Cache of active HTTP clients keyed by accountId */
const clientCache = new Map<number, DoorDashClient>();

/** Build a fresh DoorDash client for a DB account row. */
async function buildClient(
  accountId: number,
  email: string,
  encryptedPassword: string,
  sessionJson: unknown,
): Promise<DoorDashClient> {
  const logger = new TrafficLogger();

  let sessionData: any = undefined;
  try {
    sessionData =
      typeof sessionJson === "string"
        ? JSON.parse(sessionJson)
        : sessionJson ?? undefined;
  } catch {}

  const session = new DoorDashSession(sessionData);
  const http = new HttpClient(session.cookieJar, logger);
  await http.init();

  const gql = new GraphQLClient(http, session);
  const checkout = new CheckoutAPI(gql, session);
  const group = new GroupAPI(gql);
  const account = new AccountAPI(gql, http);
  const login = new LoginFlow(http, session);

  return { accountId, email, session, http, gql, checkout, group, account, login };
}

/** Get (or create) a client for the given DB account ID. */
export async function getClient(accountId: number): Promise<DoorDashClient> {
  if (clientCache.has(accountId)) {
    return clientCache.get(accountId)!;
  }

  const rows = await db
    .select()
    .from(ddAccountsTable)
    .where(eq(ddAccountsTable.id, accountId))
    .limit(1);

  const row = rows[0];
  if (!row) throw new Error(`DoorDash account #${accountId} not found.`);

  const password = decrypt(row.encryptedPassword);
  const client = await buildClient(accountId, row.email, password, row.sessionJson);
  clientCache.set(accountId, client);
  return client;
}

/** Get the first active DoorDash account. */
export async function getPrimaryClient(): Promise<DoorDashClient> {
  const rows = await db
    .select()
    .from(ddAccountsTable)
    .where(eq(ddAccountsTable.isActive, true))
    .limit(1);

  if (!rows.length) {
    throw new Error("No DoorDash accounts configured. Use /addaccount first.");
  }

  return getClient(rows[0].id);
}

/** List all active DoorDash accounts. */
export async function listAccounts(): Promise<
  { id: number; name: string; email: string }[]
> {
  const rows = await db
    .select({
      id: ddAccountsTable.id,
      name: ddAccountsTable.name,
      email: ddAccountsTable.email,
    })
    .from(ddAccountsTable)
    .where(eq(ddAccountsTable.isActive, true));

  return rows;
}

/** Save session data back to DB after use. */
export async function saveSession(client: DoorDashClient): Promise<void> {
  const sessionData = client.session.export();
  await db
    .update(ddAccountsTable)
    .set({ sessionJson: sessionData as any })
    .where(eq(ddAccountsTable.id, client.accountId));
}

/** Ensure client is authenticated, log in if needed. */
export async function ensureAuthenticated(
  client: DoorDashClient,
): Promise<{ ok: boolean; message: string; mfaToken?: string }> {
  if (client.session.isAuthenticated()) {
    return { ok: true, message: "Already authenticated." };
  }

  // Get password from DB
  const rows = await db
    .select({ encryptedPassword: ddAccountsTable.encryptedPassword })
    .from(ddAccountsTable)
    .where(eq(ddAccountsTable.id, client.accountId))
    .limit(1);

  if (!rows.length) return { ok: false, message: "Account not found." };

  const password = decrypt(rows[0].encryptedPassword);
  const result = await client.login.login(client.email, password);

  if (result.status === "success") {
    await saveSession(client);
    return { ok: true, message: "Logged in successfully." };
  }

  if (result.status === "mfa_required") {
    return {
      ok: false,
      message: result.message,
      mfaToken: result.mfaToken,
    };
  }

  return { ok: false, message: result.message };
}

/** Remove a client from cache (force re-init on next use). */
export function evictClient(accountId: number): void {
  const client = clientCache.get(accountId);
  if (client) {
    client.http.close().catch(() => {});
    clientCache.delete(accountId);
  }
}
