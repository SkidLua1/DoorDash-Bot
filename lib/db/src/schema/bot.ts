import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Bot config (single row) ───────────────────────────────────────────────────
export const botConfigTable = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  ownerDiscordId: text("owner_discord_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Authorized users (can use bot commands) ───────────────────────────────────
export const authorizedUsersTable = pgTable("authorized_users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull().default(""),
  addedBy: text("added_by").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// ── User credits ──────────────────────────────────────────────────────────────
export const userCreditsTable = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── DoorDash accounts (multiple per bot) ──────────────────────────────────────
export const ddAccountsTable = pgTable("dd_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // friendly label e.g. "Account 1"
  email: text("email").notNull().unique(),
  encryptedPassword: text("encrypted_password").notNull(),
  sessionJson: jsonb("session_json"), // persisted cookies + state
  isActive: boolean("is_active").notNull().default(true),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  orderUuid: text("order_uuid").notNull(),
  ddAccountId: integer("dd_account_id").notNull(),
  groupOrderUrl: text("group_order_url"),
  storeName: text("store_name"),
  totalCents: integer("total_cents").notNull().default(0),
  creditsUsed: integer("credits_used").notNull().default(10),
  status: text("status").notNull().default("placed"), // placed | paid | failed
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Touches (member vouch with photo) ─────────────────────────────────────────
export const touchesTable = pgTable("touches", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  discordUsername: text("discord_username").notNull(),
  photoUrl: text("photo_url").notNull(),
  messageId: text("message_id").notNull(),
  channelId: text("channel_id").notNull(),
  guildId: text("guild_id").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Stripe checkout sessions ───────────────────────────────────────────────────
export const stripeSessionsTable = pgTable("stripe_sessions", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  creditsAmount: integer("credits_amount").notNull().default(10),
  amountCents: integer("amount_cents").notNull().default(500),
  status: text("status").notNull().default("pending"), // pending | completed | expired
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
