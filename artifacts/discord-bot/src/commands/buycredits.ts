/**
 * /buycredits — Buy credits via Stripe. $5 = 10 credits per purchase.
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import Stripe from "stripe";
import { requireAuthorized } from "../utils/guards.js";
import { createStripeSession } from "../db/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Prices: $5 = 10 credits. Allow multiples.
const PACKAGES = [
  { label: "10 credits — $5", credits: 10, cents: 500 },
  { label: "20 credits — $10", credits: 20, cents: 1000 },
  { label: "50 credits — $25", credits: 50, cents: 2500 },
];

export const data = new SlashCommandBuilder()
  .setName("buycredits")
  .setDescription("Purchase credits to place orders ($5 = 10 credits)")
  .addStringOption((opt) =>
    opt
      .setName("package")
      .setDescription("Credit package to buy")
      .setRequired(true)
      .addChoices(
        { name: "10 credits — $5", value: "10" },
        { name: "20 credits — $10", value: "20" },
        { name: "50 credits — $25", value: "50" },
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireAuthorized(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  const packageCredits = parseInt(interaction.options.getString("package", true));
  const pkg = PACKAGES.find((p) => p.credits === packageCredits);
  if (!pkg) {
    await interaction.editReply("❌ Invalid package selection.");
    return;
  }

  try {
    // Build the success/cancel URLs using the bot's domain (fallback to placeholder)
    const domain = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "https://example.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: pkg.cents,
            product_data: {
              name: `${pkg.credits} Bot Credits`,
              description: `${pkg.credits} credits to place DoorDash orders via the Discord bot`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        discord_id: interaction.user.id,
        discord_username: interaction.user.username,
        credits: String(pkg.credits),
      },
      success_url: `${domain}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/api/stripe/cancel`,
    });

    // Save to DB
    await createStripeSession(
      interaction.user.id,
      session.id,
      pkg.credits,
      pkg.cents,
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("💳 Complete Your Purchase")
      .setDescription(
        `Click the link below to purchase **${pkg.credits} credits** for **$${(pkg.cents / 100).toFixed(2)}**.\n\nThe link expires in 30 minutes.`,
      )
      .addFields({
        name: "Checkout Link",
        value: `[Click here to pay →](${session.url})`,
      })
      .setFooter({
        text: "Credits are added automatically after payment",
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error("Stripe error:", err);
    await interaction.editReply(
      "❌ Failed to create checkout session. Please try again.",
    );
  }
}
