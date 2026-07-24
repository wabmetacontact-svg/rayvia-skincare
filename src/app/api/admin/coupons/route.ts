import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const rows = await db.select().from(coupons).orderBy(asc(coupons.id));
  return NextResponse.json({ coupons: rows });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const [created] = await db
      .insert(coupons)
      .values({
        code: String(body.code ?? "").trim().toUpperCase(),
        type: String(body.type ?? "percent"),
        value: String(Number(body.value ?? 0)),
        minOrder: String(Number(body.minOrder ?? 0)),
        active: Boolean(body.active),
      })
      .returning();
    return NextResponse.json({ success: true, coupon: created });
  } catch (error) {
    console.error("Admin coupon create error", error);
    return NextResponse.json({ error: "Failed to create coupon." }, { status: 500 });
  }
}
