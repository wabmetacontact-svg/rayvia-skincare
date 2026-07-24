import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUSES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, id.toUpperCase()),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
