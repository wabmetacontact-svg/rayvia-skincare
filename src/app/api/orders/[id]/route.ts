import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db, ensureDbInitialized } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUSES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;

    let order = await db.query.orders.findFirst({
      where: eq(orders.orderId, id.toUpperCase()),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check with Razorpay directly if payment status is still pending but razorpayOrderId exists
    if (order.paymentStatus !== "paid" && order.razorpayOrderId && !order.razorpayOrderId.startsWith("order_mock_")) {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret) {
        try {
          const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });

          const payments = await instance.orders.fetchPayments(order.razorpayOrderId);
          const items = (payments as any)?.items || [];

          const successfulPayment = items.find(
            (p: any) => p.status === "captured" || p.status === "authorized"
          );

          if (successfulPayment) {
            const [updated] = await db
              .update(orders)
              .set({
                paymentStatus: "paid",
                status: "placed",
                razorpayPaymentId: successfulPayment.id,
              })
              .where(eq(orders.id, order.id))
              .returning();

            if (updated) {
              order = updated;
            }
          }
        } catch (rzpErr) {
          console.warn("Razorpay order status check fetch warning:", rzpErr);
        }
      }
    }

    const currentIdx = ORDER_STATUSES.findIndex((s) => s.key === order.status);

    return NextResponse.json({
      order: {
        ...order,
        statuses: ORDER_STATUSES.map((s, i) => ({
          ...s,
          completed: i <= currentIdx,
          current: i === currentIdx,
        })),
        currentStatusIndex: currentIdx,
      },
    });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
