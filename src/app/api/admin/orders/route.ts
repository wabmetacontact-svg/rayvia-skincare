import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ orders: [] });
  }
}
