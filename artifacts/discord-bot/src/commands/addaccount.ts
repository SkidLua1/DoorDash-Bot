/**
 * /addaccount — Add a DoorDash account (authorized users only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireAuthorized } from "../utils/guards.js";
import { addDdAccount } from "../db/index.js";
import { getClient, ensureAuthenticated, saveSession } from "../doordash/manager.js";

export const data = new SlashCommandBuilder()
  .setName("addaccount")
  .setDescription("Add a DoorDash account to the bot (authorized only)")
  .addStringOption((opt) =>
    opt
      .setName("email")
      .setDescription("DoorDash account email")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName("password")
      .setDescription("DoorDash account password")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName("name")
      .setDescription("Friendly label for this account (e.g. 'Account 1')")
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireAuthorized(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  const email = interaction.options.getString("email", true);
  const password = interaction.options.getString("password", true);
  const name = interaction.options.getString("name") ?? email.split("@")[0];

  try {
    // Save encrypted to DB
    const accountId = await addDdAccount(
      name,
      email,
      password,
      interaction.user.id,
    );

    // Try to login immediately
    const client = await getClient(accountId);
    const authResult = await ensureAuthenticated(client);

    let statusField: string;
    if (authResult.ok) {
      await saveSession(client);
      statusField = "✅ Logged in successfully";
    } else if (authResult.message.includes("MFA")) {
      statusField = `⚠️ MFA required — check your email/phone for a verification code`;
    } else {
      statusField = `⚠️ Login issue: ${authResult.message}`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Account Added")
      .addFields(
        { name: "Account", value: name, inline: true },
        { name: "Email", value: email, inline: true },
        { name: "ID", value: `#${accountId}`, inline: true },
        { name: "Status", value: statusField },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: any) {
    await interaction.editReply(`❌ Failed to add account: ${err.message}`);
  }
}
