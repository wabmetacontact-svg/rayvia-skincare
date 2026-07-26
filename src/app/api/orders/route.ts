import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { generateOrderId, generateTrackingNumber, estimatedDeliveryDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      paymentMethod,
    } = body;

    if (!customerName || !phone || !email || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const trackingNumber = generateTrackingNumber();
    const estDelivery = estimatedDeliveryDate(5);

    const isCod = paymentMethod === "cod";
    const totalNum = Number(total || 0);
    const advanceAmountVal = isCod ? Math.min(totalNum > 0 ? totalNum : 99, 99) : 0;

    const [order] = await db
      .insert(orders)
      .values({
        orderId,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        items: items as any,
        subtotal: String(subtotal),
        discount: String(discount ?? 0),
        shipping: String(shipping ?? 0),
        total: String(total),
        couponCode: couponCode || null,
        paymentMethod: paymentMethod || "cod",
        paymentStatus: isCod ? "advance_paid" : "paid",
        advanceAmount: String(advanceAmountVal),
        status: "placed",
        trackingNumber,
        courierName: "Delhivery Express",
        estimatedDelivery: estDelivery,
      })
      .returning();

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        estimatedDelivery: estDelivery.toISOString(),
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
