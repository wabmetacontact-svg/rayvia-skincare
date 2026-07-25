import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_demo12345";

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "demo_secret_12345";

    // If live/test Razorpay keys aren't set, return mock order for seamless testing
    if (keyId === "rzp_test_demo12345" || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        success: true,
        id: `order_mock_${Date.now()}`,
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        keyId,
        isMock: true,
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      isMock: false,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay payment order." },
      { status: 500 }
    );
  }
}
