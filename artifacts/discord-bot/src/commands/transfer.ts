/**
 * /transfer — Transfer bot ownership to another user (owner only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { requireOwner } from "../utils/guards.js";
import { transferOwnership } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("transfer")
  .setDescription("Transfer bot ownership to another user (owner only)")
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("User to become the new owner")
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireOwner(interaction))) return;

  const target = interaction.options.getUser("user", true);

  if (target.id === interaction.user.id) {
    await interaction.reply({
      content: "❌ You are already the owner.",
      ephemeral: true,
    });
    return;
  }

  if (target.bot) {
    await interaction.reply({
      content: "❌ Cannot transfer ownership to a bot.",
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("⚠️ Confirm Ownership Transfer")
    .setDescription(
      `Are you sure you want to transfer bot ownership to **${target.tag}**?\n\n**This cannot be undone.** You will lose owner access immediately.`,
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_transfer")
      .setLabel("✅ Yes, Transfer")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel_transfer")
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Secondary),
  );

  const reply = await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });

  let btn;
  try {
    btn = await reply.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
    });
  } catch {
    await interaction.editReply({
      content: "⏱️ Transfer cancelled (timed out).",
      embeds: [],
      components: [],
    });
    return;
  }

  if (btn.customId === "cancel_transfer") {
    await btn.update({
      content: "❌ Transfer cancelled.",
      embeds: [],
      components: [],
    });
    return;
  }

  await transferOwnership(target.id);

  await btn.update({
    embeds: [
      new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("✅ Ownership Transferred")
        .setDescription(
          `Bot ownership has been transferred to **${target.tag}**.\nYou no longer have owner privileges.`,
        )
        .setTimestamp(),
    ],
    components: [],
  });
}
