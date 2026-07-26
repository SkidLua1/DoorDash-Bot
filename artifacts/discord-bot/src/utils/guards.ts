/**
 * Authorization guards for Discord bot commands.
 * Hierarchy: Owner > Authorized Users > Everyone (touch only)
 */

import { db } from "@workspace/db";
import {
  botConfigTable,
  authorizedUsersTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { CommandInteraction } from "discord.js";

export async function getOwner(): Promise<string | null> {
  const rows = await db.select().from(botConfigTable).limit(1);
  return rows[0]?.ownerDiscordId ?? null;
}

export async function isOwner(discordId: string): Promise<boolean> {
  const owner = await getOwner();
  return owner === discordId;
}

export async function isAuthorized(discordId: string): Promise<boolean> {
  if (await isOwner(discordId)) return true;

  const rows = await db
    .select()
    .from(authorizedUsersTable)
    .where(eq(authorizedUsersTable.discordId, discordId))
    .limit(1);

  return rows.length > 0;
}

/** Deny handler — sends ephemeral error and returns false. */
export async function requireOwner(
  interaction: CommandInteraction,
): Promise<boolean> {
  const ok = await isOwner(interaction.user.id);
  if (!ok) {
    await interaction.reply({
      content: "❌ This command is restricted to the bot owner.",
      ephemeral: true,
    });
  }
  return ok;
}

export async function requireAuthorized(
  interaction: CommandInteraction,
): Promise<boolean> {
  const ok = await isAuthorized(interaction.user.id);
  if (!ok) {
    await interaction.reply({
      content: "❌ You are not authorized to use this command.",
      ephemeral: true,
    });
  }
  return ok;
}
