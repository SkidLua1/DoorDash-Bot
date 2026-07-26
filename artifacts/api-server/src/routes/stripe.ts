/**
 * Stripe webhook + credit top-up routes.
 */

import { Router } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import {
  stripeSessionsTable,
  userCreditsTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// ── Webhook (raw body required) ───────────────────────────────────────────────

router.post(
  "/stripe/webhook",
  // express.raw is applied in app.ts for this route
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      req.log.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const discordId = session.metadata?.discord_id;
      const creditsStr = session.metadata?.credits;

      if (!discordId || !creditsStr) {
        req.log.warn({ sessionId: session.id }, "Missing metadata in Stripe session");
        res.json({ received: true });
        return;
      }

      const credits = parseInt(creditsStr);

      // Update stripe session status
      await db
        .update(stripeSessionsTable)
        .set({ status: "completed" })
        .where(eq(stripeSessionsTable.stripeSessionId, session.id));

      // Add credits to user
      await db
        .insert(userCreditsTable)
        .values({ discordId, balance: credits })
        .onConflictDoUpdate({
          target: userCreditsTable.discordId,
          set: {
            balance: sql`${userCreditsTable.balance} + ${credits}`,
            updatedAt: new Date(),
          },
        });

      req.log.info({ discordId, credits }, "Credits added after Stripe payment");
    }

    res.json({ received: true });
  },
);

// ── Simple success/cancel redirect pages ──────────────────────────────────────

router.get("/stripe/success", (_req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h1 style="color:#57F287">✅ Payment Successful!</h1>
      <p>Your credits have been added to your Discord account. You can close this tab.</p>
    </body></html>
  `);
});

router.get("/stripe/cancel", (_req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h1 style="color:#ED4245">❌ Payment Cancelled</h1>
      <p>No charge was made. You can close this tab and try again in Discord.</p>
    </body></html>
  `);
});

export default router;
