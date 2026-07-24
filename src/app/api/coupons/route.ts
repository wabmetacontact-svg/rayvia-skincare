import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Seeded coupons (also inserted via /api/seed)
const FALLBACK_COUPONS = [
  { code: "RAYVIA10", type: "percent", value: 10, minOrder: 0 },
  { code: "RAYVIA15", type: "percent", value: 15, minOrder: 999 },
  { code: "WELCOME20", type: "percent", value: 20, minOrder: 1499 },
];

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const upperCode = code.toUpperCase();

    // Try DB first
    let coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.code, upperCode), eq(coupons.active, true)),
    });

    // Fallback to seeded list
    let fallback = FALLBACK_COUPONS.find((c) => c.code === upperCode);

    const source = coupon ?? fallback;
    if (!source) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const minOrder = Number(source.minOrder ?? 0);
    if (subtotal < minOrder) {
      return NextResponse.json(
        { error: `Minimum order of ₹${minOrder} required for this coupon` },
        { status: 400 }
      );
    }

    const value = Number(source.value);
    const discount =
      source.type === "percent"
        ? Math.round((subtotal * value) / 100)
        : value;

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount,
      type: source.type,
      value,
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
