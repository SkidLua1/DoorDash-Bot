/**
 * Discord Bot — Main entry point.
 * Registers slash commands and starts the bot.
 */

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  type ChatInputCommandInteraction,
} from "discord.js";
import { initOwner } from "./db/index.js";

// ── Load commands ─────────────────────────────────────────────────────────────

import * as touchCmd from "./commands/touch.js";
import * as creditsCmd from "./commands/credits.js";
import * as buyCreditsCmd from "./commands/buycredits.js";
import * as orderCmd from "./commands/order.js";
import * as addUserCmd from "./commands/adduser.js";
import * as removeUserCmd from "./commands/removeuser.js";
import * as listUsersCmd from "./commands/listusers.js";
import * as transferCmd from "./commands/transfer.js";
import * as addAccountCmd from "./commands/addaccount.js";
import * as addCardCmd from "./commands/addcard.js";

interface Command {
  data: { name: string; toJSON(): unknown };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

const commands: Command[] = [
  touchCmd,
  creditsCmd,
  buyCreditsCmd,
  orderCmd,
  addUserCmd,
  removeUserCmd,
  listUsersCmd,
  transferCmd,
  addAccountCmd,
  addCardCmd,
];

// ── Validate required env vars ────────────────────────────────────────────────

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is required");
if (!STRIPE_KEY) throw new Error("STRIPE_SECRET_KEY is required");
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

// ── Discord client ────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

const commandCollection = new Collection<string, Command>();
for (const cmd of commands) {
  commandCollection.set(cmd.data.name, cmd);
}

// ── Register slash commands globally ─────────────────────────────────────────

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN!);
  const body = commands.map((c) => c.data.toJSON());

  try {
    console.log(`[bot] Registering ${body.length} slash commands...`);
    await rest.put(Routes.applicationCommands(client.user!.id), { body });
    console.log("[bot] Slash commands registered.");
  } catch (err) {
    console.error("[bot] Failed to register commands:", err);
  }
}

// ── Events ────────────────────────────────────────────────────────────────────

client.once("ready", async (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  await registerCommands();

  // Init owner from env if set and not yet configured
  const ownerId = process.env.OWNER_DISCORD_ID;
  if (ownerId) {
    await initOwner(ownerId).catch(() => {});
    console.log(`[bot] Owner set to ${ownerId}`);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandCollection.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[bot] Error in /${interaction.commandName}:`, err);
    const msg = { content: "❌ An error occurred. Please try again.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

client.login(BOT_TOKEN);
