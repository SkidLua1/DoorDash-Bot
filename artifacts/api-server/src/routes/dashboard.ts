/**
 * Dashboard API routes — owner-only stats and management.
 * Protected by DASHBOARD_TOKEN env var.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  botConfigTable,
  authorizedUsersTable,
  userCreditsTable,
  ddAccountsTable,
  ordersTable,
  touchesTable,
  stripeSessionsTable,
} from "@workspace/db/schema";
import { eq, desc, count, sum } from "drizzle-orm";

const router = Router();

// ── Auth middleware ───────────────────────────────────────────────────────────

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-dashboard-token"] ?? req.query["token"];
  const expected = process.env.DASHBOARD_TOKEN || process.env.SESSION_SECRET;

  if (!expected || token !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.use("/dashboard", authMiddleware);

// ── Stats overview ────────────────────────────────────────────────────────────

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      [ordersRow],
      [usersRow],
      [touchesRow],
      [accountsRow],
      [creditsRow],
      [revenueRow],
    ] = await Promise.all([
      db.select({ total: count() }).from(ordersTable),
      db.select({ total: count() }).from(authorizedUsersTable),
      db.select({ total: count() }).from(touchesTable),
      db.select({ total: count() }).from(ddAccountsTable).where(eq(ddAccountsTable.isActive, true)),
      db.select({ total: sum(userCreditsTable.balance) }).from(userCreditsTable),
      db.select({ total: sum(stripeSessionsTable.amountCents) })
        .from(stripeSessionsTable)
        .where(eq(stripeSessionsTable.status, "completed")),
    ]);

    res.json({
      totalOrders: Number(ordersRow?.total ?? 0),
      totalAuthorizedUsers: Number(usersRow?.total ?? 0),
      totalTouches: Number(touchesRow?.total ?? 0),
      activeAccounts: Number(accountsRow?.total ?? 0),
      totalCreditsHeld: Number(creditsRow?.total ?? 0),
      totalRevenueCents: Number(revenueRow?.total ?? 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────

router.get("/dashboard/orders", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 50)), 100);
    const offset = parseInt(String(req.query.offset ?? 0));

    const rows = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── DoorDash accounts ─────────────────────────────────────────────────────────

router.get("/dashboard/accounts", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: ddAccountsTable.id,
        name: ddAccountsTable.name,
        email: ddAccountsTable.email,
        isActive: ddAccountsTable.isActive,
        addedBy: ddAccountsTable.addedBy,
        createdAt: ddAccountsTable.createdAt,
      })
      .from(ddAccountsTable)
      .orderBy(desc(ddAccountsTable.createdAt));

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/dashboard/accounts/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select({ isActive: ddAccountsTable.isActive })
      .from(ddAccountsTable)
      .where(eq(ddAccountsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    await db
      .update(ddAccountsTable)
      .set({ isActive: !row.isActive })
      .where(eq(ddAccountsTable.id, id));

    res.json({ ok: true, isActive: !row.isActive });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Authorized users ──────────────────────────────────────────────────────────

router.get("/dashboard/users", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(authorizedUsersTable)
      .orderBy(desc(authorizedUsersTable.addedAt));

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Touches ───────────────────────────────────────────────────────────────────

router.get("/dashboard/touches", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(touchesTable)
      .orderBy(desc(touchesTable.createdAt))
      .limit(50);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Credits per user ──────────────────────────────────────────────────────────

router.get("/dashboard/credits", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(userCreditsTable)
      .orderBy(desc(userCreditsTable.balance));

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Bot config ────────────────────────────────────────────────────────────────

router.get("/dashboard/config", async (_req, res) => {
  try {
    const rows = await db.select().from(botConfigTable).limit(1);
    res.json(rows[0] ?? null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
