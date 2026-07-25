import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { db, ensureDbInitialized } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("Razorpay webhook signature verification failed.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { event, payload: eventData } = payload || {};

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = eventData?.payment?.entity;
      const orderEntity = eventData?.order?.entity;

      const razorpayOrderId =
        paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId =
        paymentEntity?.id || null;

      if (razorpayOrderId) {
        const found = await db
          .select()
          .from(orders)
          .where(eq(orders.razorpayOrderId, razorpayOrderId))
          .limit(1);

        if (found.length > 0) {
          const targetOrder = found[0];
          if (targetOrder.paymentStatus !== "paid") {
            await db
              .update(orders)
              .set({
                paymentStatus: "paid",
                status: "placed",
                razorpayPaymentId: razorpayPaymentId || targetOrder.razorpayPaymentId,
              })
              .where(eq(orders.id, targetOrder.id));
            console.log(`[Razorpay Webhook] Order ${targetOrder.orderId} marked as paid via webhook.`);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
