/**
 * /removeuser — Remove an authorized user (owner only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireOwner } from "../utils/guards.js";
import { removeAuthorizedUser } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("removeuser")
  .setDescription("Revoke a user's access to bot commands (owner only)")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("User to remove").setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireOwner(interaction))) return;

  const target = interaction.options.getUser("user", true);

  const removed = await removeAuthorizedUser(target.id);

  const embed = new EmbedBuilder()
    .setColor(removed ? 0xed4245 : 0xfee75c)
    .setTitle(removed ? "✅ User Removed" : "⚠️ User Not Found")
    .setDescription(
      removed
        ? `**${target.tag}** can no longer use bot commands.`
        : `**${target.tag}** was not in the authorized list.`,
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
