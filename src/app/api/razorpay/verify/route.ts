import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { db, ensureDbInitialized } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateOrderId, generateTrackingNumber, estimatedDeliveryDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutData,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify HMAC SHA256 signature if Razorpay Secret Key is configured
    if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Payment verification failed. Signature mismatch." },
          { status: 400 }
        );
      }
    }

    let existingOrder: typeof orders.$inferSelect | undefined;

    if (razorpay_order_id) {
      const found = await db
        .select()
        .from(orders)
        .where(eq(orders.razorpayOrderId, razorpay_order_id))
        .limit(1);

      if (found.length > 0) {
        existingOrder = found[0];
      }
    }

    if (existingOrder) {
      const isExistingCod = existingOrder.paymentMethod === "cod";
      const [updated] = await db
        .update(orders)
        .set({
          paymentStatus: isExistingCod ? "advance_paid" : "paid",
          status: "placed",
          razorpayPaymentId: razorpay_payment_id || existingOrder.razorpayPaymentId,
        })
        .where(eq(orders.id, existingOrder.id))
        .returning();

      return NextResponse.json({
        success: true,
        order: {
          ...updated,
          estimatedDelivery: updated.estimatedDelivery ? updated.estimatedDelivery.toISOString() : null,
        },
      });
    }

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
      paymentMethod = "upi",
    } = checkoutData || {};

    const orderId = generateOrderId();
    const trackingNumber = generateTrackingNumber();
    const estDelivery = estimatedDeliveryDate(5);

    const isCod = paymentMethod === "cod";
    const totalNum = Number(total || 0);
    const advanceAmountVal = isCod ? Math.min(totalNum > 0 ? totalNum : 99, 99) : 0;
    const effectivePaymentMethod = isCod ? "cod" : paymentMethod;
    const effectivePaymentStatus = isCod ? "advance_paid" : "paid";

    const [createdOrder] = await db
      .insert(orders)
      .values({
        orderId,
        customerName: customerName || "Customer",
        phone: phone || "9999999999",
        email: email || "customer@example.com",
        address: address || "Delivery Address",
        city: city || "City",
        state: state || "State",
        pincode: pincode || "110001",
        items: (items || []) as any,
        subtotal: String(subtotal || 0),
        discount: String(discount ?? 0),
        shipping: String(shipping ?? 0),
        total: String(total || 0),
        couponCode: couponCode || null,
        paymentMethod: effectivePaymentMethod,
        paymentStatus: effectivePaymentStatus,
        advanceAmount: String(advanceAmountVal),
        status: "placed",
        trackingNumber,
        courierName: "Delhivery Express",
        estimatedDelivery: estDelivery,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      order: {
        ...createdOrder,
        estimatedDelivery: estDelivery.toISOString(),
      },
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify and process order." },
      { status: 500 }
    );
  }
}
