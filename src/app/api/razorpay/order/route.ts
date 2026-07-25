import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { generateOrderId, generateTrackingNumber, estimatedDeliveryDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt, checkoutData } = await req.json();

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_demo12345";

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "demo_secret_12345";

    const isMock = keyId === "rzp_test_demo12345" || !process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_mock_${Date.now()}`;
    let orderAmount = Math.round(Number(amount) * 100);

    if (!isMock) {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await instance.orders.create({
        amount: orderAmount,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      });
      razorpayOrderId = order.id;
      orderAmount = Number(order.amount);
    }

    // Pre-create pending order in DB so that async QR/UPI payments are tracked immediately
    const websiteOrderId = generateOrderId();
    const trackingNumber = generateTrackingNumber();
    const estDelivery = estimatedDeliveryDate(5);

    if (checkoutData) {
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
      } = checkoutData;

      await db.insert(orders).values({
        orderId: websiteOrderId,
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
        total: String(total || amount || 0),
        couponCode: couponCode || null,
        paymentMethod: paymentMethod === "cod" ? "cod" : `razorpay_${paymentMethod}`,
        paymentStatus: "pending",
        status: "pending_payment",
        trackingNumber,
        courierName: "Delhivery Express",
        estimatedDelivery: estDelivery,
        razorpayOrderId,
      });
    }

    return NextResponse.json({
      success: true,
      id: razorpayOrderId,
      websiteOrderId,
      amount: orderAmount,
      currency: "INR",
      keyId,
      isMock,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay payment order." },
      { status: 500 }
    );
  }
}
