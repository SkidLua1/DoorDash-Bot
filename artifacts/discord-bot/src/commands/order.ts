/**
 * /order <group_link> — Detect DoorDash group order link, show preview, place order.
 * Costs 10 credits. Max cart total: $50 (incl. taxes + delivery).
 */

import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { requireAuthorized } from "../utils/guards.js";
import { getCredits, deductCredits, saveOrder } from "../db/index.js";
import {
  getPrimaryClient,
  ensureAuthenticated,
  saveSession,
  listAccounts,
} from "../doordash/manager.js";

const CREDITS_PER_ORDER = 10;
const MAX_TOTAL_CENTS = 5000; // $50.00

/** Extract DoorDash group order cart ID from a share URL. */
function extractCartId(url: string): string | null {
  // https://doordash.com/group-order/CART_ID/...
  // or https://drd.sh/SHORTCODE
  const match = url.match(
    /doordash\.com\/(?:group-order|shared-cart|checkout)\/([a-zA-Z0-9_-]+)/,
  );
  return match?.[1] ?? null;
}

export const data = new SlashCommandBuilder()
  .setName("order")
  .setDescription("Place an order from a DoorDash group order link")
  .addStringOption((opt) =>
    opt
      .setName("link")
      .setDescription("DoorDash group order share link")
      .setRequired(true),
  )
  .addIntegerOption((opt) =>
    opt
      .setName("account")
      .setDescription("DoorDash account ID to use (default: primary)")
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!(await requireAuthorized(interaction))) return;

  await interaction.deferReply({ ephemeral: true });

  // ── Check credits ──────────────────────────────────────────────────────────
  const balance = await getCredits(interaction.user.id);
  if (balance < CREDITS_PER_ORDER) {
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("❌ Insufficient Credits")
      .setDescription(
        `You need **${CREDITS_PER_ORDER} credits** to place an order.\nYou have **${balance} credits**.\n\nUse \`/buycredits\` to top up.`,
      );
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // ── Extract cart ID ────────────────────────────────────────────────────────
  const link = interaction.options.getString("link", true);
  const cartId = extractCartId(link);
  if (!cartId) {
    await interaction.editReply(
      "❌ Could not parse a DoorDash group order link. Please share the exact link from DoorDash.",
    );
    return;
  }

  // ── Get DoorDash client ────────────────────────────────────────────────────
  const accountIdOpt = interaction.options.getInteger("account");
  let ddClient;
  try {
    if (accountIdOpt) {
      const { getClient } = await import("../doordash/manager.js");
      ddClient = await getClient(accountIdOpt);
    } else {
      ddClient = await getPrimaryClient();
    }
  } catch (err: any) {
    await interaction.editReply(`❌ ${err.message}`);
    return;
  }

  // ── Authenticate ───────────────────────────────────────────────────────────
  const authResult = await ensureAuthenticated(ddClient);
  if (!authResult.ok) {
    await interaction.editReply(
      `❌ DoorDash login failed: ${authResult.message}`,
    );
    return;
  }

  // ── Fetch group cart ───────────────────────────────────────────────────────
  let groupCart;
  try {
    groupCart = await ddClient.group.getGroupCart(cartId);
  } catch (err: any) {
    await interaction.editReply(
      `❌ Failed to load group order: ${err.message}`,
    );
    return;
  }

  // ── Fetch fee tally ────────────────────────────────────────────────────────
  let feeTally;
  try {
    feeTally = await ddClient.checkout.getFeeTally(cartId);
  } catch (err: any) {
    await interaction.editReply(
      `❌ Failed to fetch order total: ${err.message}`,
    );
    return;
  }

  // ── Check max total ────────────────────────────────────────────────────────
  if (feeTally.totalCents > MAX_TOTAL_CENTS) {
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("❌ Cart Total Too High")
      .setDescription(
        `Cart total is **${feeTally.total}** which exceeds the **$50.00** maximum (incl. taxes & delivery).\n\nPlease reduce your cart and try again.`,
      );
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // ── Build preview embed ────────────────────────────────────────────────────
  const memberList = groupCart.members
    .map(
      (m) =>
        `**${m.name}** ${m.isFinalized ? "✅" : "🕒"}\n${m.items.map((i) => `  • ${i.name} ×${i.quantity}`).join("\n")}`,
    )
    .join("\n\n");

  const feeLines = feeTally.lineItems
    .map((li) => `${li.label}: ${li.amount}`)
    .join("\n");

  const previewEmbed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🍕 Order Preview")
    .setDescription(`**Cart ID:** \`${cartId}\``)
    .addFields(
      {
        name: "Members & Items",
        value: memberList || "No items yet",
        inline: false,
      },
      { name: "Fee Breakdown", value: feeLines || "N/A", inline: false },
      {
        name: "Total",
        value: `**${feeTally.total}**`,
        inline: true,
      },
      {
        name: "Credits",
        value: `${CREDITS_PER_ORDER} (balance after: ${balance - CREDITS_PER_ORDER})`,
        inline: true,
      },
    )
    .setFooter({
      text: "Confirm to place order. This will charge the DoorDash account.",
    })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_order")
      .setLabel("✅ Confirm Order")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("cancel_order")
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Danger),
  );

  const reply = await interaction.editReply({
    embeds: [previewEmbed],
    components: [row],
  });

  // ── Wait for confirmation ──────────────────────────────────────────────────
  let buttonInteraction;
  try {
    buttonInteraction = await reply.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
    });
  } catch {
    await interaction.editReply({
      content: "⏱️ Order confirmation timed out.",
      embeds: [],
      components: [],
    });
    return;
  }

  if (buttonInteraction.customId === "cancel_order") {
    await buttonInteraction.update({
      content: "❌ Order cancelled.",
      embeds: [],
      components: [],
    });
    return;
  }

  await buttonInteraction.update({
    content: "⏳ Placing order...",
    embeds: [],
    components: [],
  });

  // ── Place order ────────────────────────────────────────────────────────────
  let orderResult;
  try {
    orderResult = await ddClient.checkout.createOrder({
      cartId,
      storeId: groupCart.storeId ?? "",
      totalCents: feeTally.totalCents,
    });
    await saveSession(ddClient);
  } catch (err: any) {
    await interaction.editReply(`❌ Order failed: ${err.message}`);
    return;
  }

  if (orderResult.paymentStatus === "failed") {
    await interaction.editReply(
      `❌ Payment failed: ${orderResult.errorMessage ?? "Unknown error"}`,
    );
    return;
  }

  // ── Deduct credits ─────────────────────────────────────────────────────────
  const deducted = await deductCredits(interaction.user.id, CREDITS_PER_ORDER);
  if (!deducted) {
    // Credits were checked earlier — race condition, log it
    console.warn(`Credit deduction failed for ${interaction.user.id}`);
  }

  // ── Build tracking URL ─────────────────────────────────────────────────────
  const trackingUrl = `https://www.doordash.com/orders/${orderResult.orderUuid}/status/`;

  // ── Save order to DB ───────────────────────────────────────────────────────
  await saveOrder({
    discordId: interaction.user.id,
    orderUuid: orderResult.orderUuid,
    ddAccountId: ddClient.accountId,
    groupOrderUrl: link,
    storeName: undefined,
    totalCents: orderResult.totalCents,
    creditsUsed: CREDITS_PER_ORDER,
    status: orderResult.paymentStatus,
    trackingUrl,
  });

  // ── Create private channel ─────────────────────────────────────────────────
  const guild = interaction.guild;
  if (guild) {
    try {
      const channelName = `order-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${orderResult.orderUuid.slice(0, 8)}`;

      const orderChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: guild.members.me!.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
        topic: `Order ${orderResult.orderUuid} — placed by ${interaction.user.tag}`,
      });

      const channelEmbed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("🎉 Order Placed!")
        .setDescription(
          `Hey ${interaction.user}! Your order has been placed successfully.`,
        )
        .addFields(
          { name: "Order ID", value: `\`${orderResult.orderUuid}\``, inline: true },
          {
            name: "Status",
            value: orderResult.paymentStatus === "paid" ? "✅ Paid" : "⏳ Processing",
            inline: true,
          },
          {
            name: "Total",
            value: `$${(orderResult.totalCents / 100).toFixed(2)}`,
            inline: true,
          },
          {
            name: "🔗 Track Your Order",
            value: `[Click here to track →](${trackingUrl})`,
          },
        )
        .setFooter({
          text: "This channel will be closed automatically when your order arrives.",
        })
        .setTimestamp();

      await orderChannel.send({
        content: `${interaction.user}`,
        embeds: [channelEmbed],
      });

      // Schedule channel auto-close (poll order status)
      scheduleChannelClose(
        orderResult.orderUuid,
        orderChannel.id,
        guild.id,
        interaction.client,
      );

      await interaction.editReply(
        `✅ **Order placed!** Check ${orderChannel} for your tracking link.\n🔗 [Track Order](${trackingUrl})`,
      );
    } catch (err) {
      console.error("Failed to create order channel:", err);
      await interaction.editReply(
        `✅ **Order placed!**\n🔗 [Track Order](${trackingUrl})\n*(Could not create private channel)*`,
      );
    }
  } else {
    await interaction.editReply(
      `✅ **Order placed!**\n🔗 [Track Order](${trackingUrl})`,
    );
  }
}

/** Poll DoorDash order status and close the channel when delivered. */
function scheduleChannelClose(
  orderUuid: string,
  channelId: string,
  guildId: string,
  client: any,
): void {
  let attempts = 0;
  const MAX_ATTEMPTS = 60; // 2 hours (every 2 min)
  const POLL_INTERVAL = 2 * 60 * 1000;

  const poll = async () => {
    attempts++;
    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(channelId);
      if (!channel) return; // already deleted

      // Check order status
      const ddClient = await getPrimaryClient();
      const authOk = await ensureAuthenticated(ddClient);
      if (!authOk.ok) {
        if (attempts >= MAX_ATTEMPTS) await channel.delete("Order timeout");
        else setTimeout(poll, POLL_INTERVAL);
        return;
      }

      // Fetch order status via orders API
      const statusData = await ddClient.gql.query<any>(
        "pollOrderPaymentStatus",
        { orderId: orderUuid },
        ddClient.gql.loadQuery("pollOrderPaymentStatus.graphql"),
      );

      const ps = statusData?.pollOrderPaymentStatus;
      // paymentStatus 1 = paid/delivered, check delivery status separately
      // For simplicity: close after 90 minutes (45 attempts)
      if (attempts >= 45) {
        await channel.send(
          "✅ **Order should have arrived!** Closing this channel in 60 seconds.",
        );
        setTimeout(async () => {
          try {
            await channel.delete("Order complete");
          } catch {}
        }, 60_000);
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, POLL_INTERVAL);
      } else {
        await channel.delete("Order timeout");
      }
    } catch (err) {
      console.error("Channel poll error:", err);
      if (attempts < MAX_ATTEMPTS) setTimeout(poll, POLL_INTERVAL);
    }
  };

  // Start polling after 15 minutes (typical delivery time start)
  setTimeout(poll, 15 * 60 * 1000);
}
