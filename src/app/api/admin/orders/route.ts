import { NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/db";
import { orders } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    await ensureDbInitialized();
    try {
      const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
      return NextResponse.json({ orders: rows });
    } catch (queryErr) {
      console.warn("Admin orders GET initial query failed, running schema migration:", queryErr);
      await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) NOT NULL DEFAULT '0';`);
      await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(64);`);
      await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(64);`);
      const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
      return NextResponse.json({ orders: rows });
    }
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ orders: [] });
  }
}
