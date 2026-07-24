import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUSES, type OrderStatusKey } from "@/lib/utils";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Admin API — Update order status directly in the database.
 * Requires x-admin-username and x-admin-password request headers.
 *
 * POST /api/orders/status
 * Body: { orderId, status, trackingNumber?, courierName? }
 *
 * status can be: placed | packed | shipped | out_for_delivery | delivered
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { orderId, status, trackingNumber, courierName } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ORDER_STATUSES.map((s) => s.key) as string[];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: status as OrderStatusKey };

    // Auto-update payment status when delivered
    if (status === "delivered") {
      updateData.paymentStatus = "paid";
    }

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (courierName) updateData.courierName = courierName;

    const [updated] = await db
      .update(orders)
      .set(updateData as any)
      .where(eq(orders.orderId, orderId.toUpperCase()))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order ${orderId} updated to "${status}"`,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
