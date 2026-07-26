/**
 * /addcard — Add a payment card to a DoorDash account (authorized only).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { requireAuthorized } from "../utils/guards.js";
import { listAccounts } from "../doordash/manager.js";
import { getClient, ensureAuthenticated, saveSession } from "../doordash/manager.js";

export const data = new SlashCommandBuilder()
  .setName("addcard")
  .setDescription("Add a payment card to a DoorDash account (authorized only)")
  .addStringOption((opt) =>
    opt
      .setName("number")
      .setDescription("Card number (16 digits)")
      .setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName("exp_month").setDescription("Expiry month (MM)").setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName("exp_year").setDescription("Expiry year (YYYY)").setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName("cvc").setDescription("CVC / CVV").setRequired(true),
  )
  .addIntegerOption((opt) =>
    opt
      .setName("account_id")
      .setDescription("DoorDash account ID (default: primary)")
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireAuthorized(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  const cardNumber = interaction.options.getString("number", true).replace(/\s/g, "");
  const expMonth = interaction.options.getString("exp_month", true);
  const expYear = interaction.options.getString("exp_year", true);
  const cvc = interaction.options.getString("cvc", true);
  const accountIdOpt = interaction.options.getInteger("account_id");

  // Validate card number
  if (!/^\d{13,19}$/.test(cardNumber)) {
    await interaction.editReply("❌ Invalid card number format.");
    return;
  }

  try {
    let ddClient;
    if (accountIdOpt) {
      ddClient = await getClient(accountIdOpt);
    } else {
      const { getPrimaryClient } = await import("../doordash/manager.js");
      ddClient = await getPrimaryClient();
    }

    const authResult = await ensureAuthenticated(ddClient);
    if (!authResult.ok) {
      await interaction.editReply(
        `❌ DoorDash login failed: ${authResult.message}`,
      );
      return;
    }

    const result = await ddClient.account.addCard({
      cardNumber,
      expMonth,
      expYear,
      cvc,
    });

    await saveSession(ddClient);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Card Added")
      .addFields(
        {
          name: "Card",
          value: `${result.brand} ending in **${result.last4}**`,
          inline: true,
        },
        { name: "Account", value: ddClient.email, inline: true },
      )
      .setFooter({ text: "Card stored securely in DoorDash" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: any) {
    await interaction.editReply(`❌ Failed to add card: ${err.message}`);
  }
}
