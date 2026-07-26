import { NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/db";
import { orders, products, coupons, reviews, newsletter } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  await ensureDbInitialized();

  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) NOT NULL DEFAULT '0';`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(64);`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(64);`);
  } catch {}

  const productCount = await safeQuery(
    () => db.select({ count: sql<number>`count(*)` }).from(products),
    [{ count: 0 }]
  );
  const orderCount = await safeQuery(
    () => db.select({ count: sql<number>`count(*)` }).from(orders),
    [{ count: 0 }]
  );
  const couponCount = await safeQuery(
    () => db.select({ count: sql<number>`count(*)` }).from(coupons),
    [{ count: 0 }]
  );
  const newsletterCount = await safeQuery(
    () => db.select({ count: sql<number>`count(*)` }).from(newsletter),
    [{ count: 0 }]
  );
  const revenue = await safeQuery(
    () =>
      db
        .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders),
    [{ total: "0" }]
  );

  const latestOrders = await safeQuery(
    () => db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    []
  );
  const latestReviews = await safeQuery(
    () => db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(20),
    []
  );
  const subscribers = await safeQuery(
    () =>
      db.select().from(newsletter).orderBy(desc(newsletter.createdAt)).limit(100),
    []
  );

  return NextResponse.json({
    stats: {
      products: Number(productCount[0]?.count ?? 0),
      orders: Number(orderCount[0]?.count ?? 0),
      coupons: Number(couponCount[0]?.count ?? 0),
      subscribers: Number(newsletterCount[0]?.count ?? 0),
      revenue: Number(revenue[0]?.total ?? 0),
    },
    latestOrders,
    latestReviews,
    subscribers,
  });
}
