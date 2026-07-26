/**
 * /adduser — Add an authorized user (owner only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireOwner } from "../utils/guards.js";
import { addAuthorizedUser } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("adduser")
  .setDescription("Grant a user access to bot commands (owner only)")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("User to authorize").setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireOwner(interaction))) return;

  const target = interaction.options.getUser("user", true);

  if (target.bot) {
    await interaction.reply({ content: "❌ Cannot add bots.", ephemeral: true });
    return;
  }

  const added = await addAuthorizedUser(
    target.id,
    target.username,
    interaction.user.id,
  );

  const embed = new EmbedBuilder()
    .setColor(added ? 0x57f287 : 0xfee75c)
    .setTitle(added ? "✅ User Added" : "⚠️ Already Authorized")
    .setDescription(
      added
        ? `**${target.tag}** has been granted access to bot commands.`
        : `**${target.tag}** is already authorized.`,
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
