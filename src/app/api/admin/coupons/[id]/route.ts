import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db
      .update(coupons)
      .set({
        code: String(body.code ?? "").trim().toUpperCase(),
        type: String(body.type ?? "percent"),
        value: String(Number(body.value ?? 0)),
        minOrder: String(Number(body.minOrder ?? 0)),
        active: Boolean(body.active),
      })
      .where(eq(coupons.id, Number(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error("Admin coupon update error", error);
    return NextResponse.json({ error: "Failed to update coupon." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const [deleted] = await db.delete(coupons).where(eq(coupons.id, Number(id))).returning();
    if (!deleted) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin coupon delete error", error);
    return NextResponse.json({ error: "Failed to delete coupon." }, { status: 500 });
  }
}
