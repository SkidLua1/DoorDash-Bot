/**
 * /listusers — List all authorized users (owner only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireOwner } from "../utils/guards.js";
import { listAuthorizedUsers } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("listusers")
  .setDescription("List all users authorized to use bot commands (owner only)");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireOwner(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  const users = await listAuthorizedUsers();

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("👥 Authorized Users")
    .setTimestamp();

  if (users.length === 0) {
    embed.setDescription("No authorized users yet. Use `/adduser` to add one.");
  } else {
    embed.setDescription(
      users
        .map(
          (u, i) =>
            `${i + 1}. **${u.discordUsername}** (<@${u.discordId}>)\n   Added: ${u.addedAt.toLocaleDateString()}`,
        )
        .join("\n"),
    );
    embed.setFooter({ text: `${users.length} authorized user(s)` });
  }

  await interaction.editReply({ embeds: [embed] });
}
