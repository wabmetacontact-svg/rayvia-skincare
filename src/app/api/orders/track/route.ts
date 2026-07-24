import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ORDER_STATUSES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orderId, phone } = await req.json();

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: "Order ID and phone number are required" },
        { status: 400 }
      );
    }

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.orderId, orderId.toUpperCase()),
        eq(orders.phone, phone)
      ),
    });

    if (!order) {
      return NextResponse.json(
        { error: "No order found with these details. Please check and try again." },
        { status: 404 }
      );
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
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
