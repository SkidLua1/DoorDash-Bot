/**
 * /credits — Show your credit balance.
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireAuthorized } from "../utils/guards.js";
import { getCredits } from "../db/index.js";

export const data = new SlashCommandBuilder()
  .setName("credits")
  .setDescription("Check your credit balance");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireAuthorized(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  const balance = await getCredits(interaction.user.id);

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("💰 Credit Balance")
    .setDescription(`You have **${balance} credits**.`)
    .addFields({
      name: "How credits work",
      value:
        "• 10 credits = $5.00\n• Each order costs 10 credits\n• Max cart total: $50 (incl. taxes & delivery)\n• Use `/buycredits` to top up",
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
