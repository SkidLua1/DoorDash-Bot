# Hosting on bot-hosting.net

## 1. Upload your code

Go to **bot-hosting.net**, create a new server, and connect this GitHub repo:
`https://github.com/SkidLua1/DoorDash-Bot`

Set the **root directory** to:
```
artifacts/discord-bot
```

## 2. Set environment variables

In the bot-hosting.net dashboard, add the following environment variables:

| Variable | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Your bot token from [Discord Developer Portal](https://discord.com/developers/applications) |
| `OWNER_DISCORD_ID` | Your Discord user ID (enable Developer Mode → right-click yourself → Copy User ID) |
| `DATABASE_URL` | PostgreSQL connection string — free options: [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) |
| `STRIPE_SECRET_KEY` | From [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | From [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `SESSION_SECRET` | Any long random string (used for encryption) |
| `DASHBOARD_TOKEN` | Password for the owner dashboard (e.g. `qwerty`) |

> **Tip:** Copy `.env.example` as a reference for all required variables.

## 3. Set the start command

In bot-hosting.net, set:
- **Install command:** `npm install`
- **Start command:** `npm start`

`npm start` automatically compiles the TypeScript and then launches the bot.

## 4. Set up the database

The bot needs a PostgreSQL database. After setting `DATABASE_URL`, run the schema migration once from your local machine (inside this repo):

```bash
pnpm --filter @workspace/db run push
```

Or use the Drizzle CLI directly:
```bash
cd lib/db && npx drizzle-kit push
```

## 5. Invite the bot

Generate an invite link from the Discord Developer Portal with these permissions:
- `bot` scope
- `applications.commands` scope
- Permissions: **Send Messages**, **Embed Links**, **Attach Files**, **Manage Channels**, **Read Message History**

## Commands

| Command | Who can use | Description |
|---|---|---|
| `/touch` | Everyone | Vouch for yourself (requires photo) |
| `/order` | Authorized users | Place a DoorDash group order |
| `/credits` | Authorized users | Check your credit balance |
| `/buycredits` | Authorized users | Buy credits via Stripe |
| `/adduser` | Owner | Add an authorized user |
| `/removeuser` | Owner | Remove an authorized user |
| `/listusers` | Owner | List all authorized users |
| `/addaccount` | Owner | Add a DoorDash account |
| `/addcard` | Owner | Add a card to a DoorDash account |
| `/transfer` | Owner | Transfer ownership |
