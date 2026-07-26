/**
 * /touch — Member-facing command. Requires a photo attachment to vouch.
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { saveTouch } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("touch")
  .setDescription("Vouch that this service is real (photo required)")
  .addAttachmentOption((opt) =>
    opt
      .setName("photo")
      .setDescription("Photo proof (selfie, screenshot, etc.)")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName("note")
      .setDescription("Optional message with your vouch")
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const attachment = interaction.options.getAttachment("photo", true);
  const note = interaction.options.getString("note") ?? undefined;

  // Validate it's an image
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (
    !attachment.contentType ||
    !imageTypes.some((t) => attachment.contentType!.startsWith(t.split("/")[0]))
  ) {
    await interaction.editReply(
      "❌ Please attach a valid image file (JPEG, PNG, GIF, or WebP).",
    );
    return;
  }

  if (!interaction.guildId) {
    await interaction.editReply("❌ This command must be used in a server.");
    return;
  }

  // Save to DB
  await saveTouch({
    discordId: interaction.user.id,
    discordUsername: interaction.user.username,
    photoUrl: attachment.url,
    messageId: interaction.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    note,
  });

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Touch Submitted")
    .setDescription(
      `**${interaction.user.displayName}** vouches this service is real!`,
    )
    .setImage(attachment.url)
    .setTimestamp();

  if (note) {
    embed.addFields({ name: "Note", value: note });
  }

  embed.setFooter({ text: `Vouched by ${interaction.user.tag}` });

  await interaction.editReply({ embeds: [embed] });
}
