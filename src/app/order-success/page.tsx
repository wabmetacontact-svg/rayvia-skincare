"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Download,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { SITE } from "@/lib/constants";

type OrderData = {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; price: number; quantity: number; image: string; size?: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  paymentMethod: string;
  paymentStatus: string;
  advanceAmount?: number | string | null;
  status: string;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
  createdAt: string;
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);

          // Meta Pixel Purchase Event
          if (typeof window !== "undefined" && (window as any).fbq) {
            try {
              (window as any).fbq("track", "Purchase", {
                value: Number(data.order.total),
                currency: "INR",
                content_type: "product",
                contents: (data.order.items || []).map((item: any) => ({
                  id: item.id || item.slug,
                  quantity: item.quantity,
                })),
              });
            } catch {
              // ignore
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-gold" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream px-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-muted">We couldn't find your order details.</p>
          <Button asChild variant="gold" className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted">
            Thank you, {order.customerName.split(" ")[0]}! Your order has been placed successfully.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
              Order ID
            </span>
            <span className="font-heading text-lg font-bold">{order.orderId}</span>
          </div>
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-[24px] border border-ink/10 bg-white p-6 sm:p-8"
        >
          {/* Delivery info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[16px] bg-cream p-4">
              <Truck className="h-5 w-5 text-gold-dark" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Estimated Delivery
              </p>
              <p className="mt-0.5 text-sm font-bold text-success">
                {formatDate(order.estimatedDelivery)}
              </p>
            </div>
            <div className="rounded-[16px] bg-cream p-4">
              <Package className="h-5 w-5 text-gold-dark" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Tracking Number
              </p>
              <p className="mt-0.5 text-sm font-bold">{order.trackingNumber}</p>
              <p className="text-xs text-muted">{order.courierName}</p>
            </div>
            <div className="rounded-[16px] bg-cream p-4">
              <MapPin className="h-5 w-5 text-gold-dark" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Delivery To
              </p>
              <p className="mt-0.5 text-sm font-bold">{order.city}</p>
              <p className="text-xs text-muted">{order.pincode}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 border-t border-ink/10 pt-6">
            <h2 className="font-heading text-base font-bold">Order Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-beige">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice summary */}
          <div className="mt-6 border-t border-ink/10 pt-6">
            <h2 className="font-heading text-base font-bold">Invoice Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span className={order.shipping == 0 ? "text-success" : ""}>
                  {order.shipping == 0 ? "FREE" : formatINR(order.shipping)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="font-heading text-base font-bold">Total Order Amount</span>
                <span className="font-heading text-xl font-bold">{formatINR(order.total)}</span>
              </div>

              {order.paymentMethod === "cod" ? (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs text-amber-900">
                    <span>Advance Token Paid Online:</span>
                    <span className="font-bold text-gold-dark">
                      {formatINR(Number(order.advanceAmount || 99))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-ink border-t border-amber-200/60 pt-1.5">
                    <span>Cash Due Upon Delivery:</span>
                    <span className="text-amber-950">
                      {formatINR(Math.max(0, Number(order.total) - Number(order.advanceAmount || 99)))}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between text-xs text-muted pt-1">
                <span>Payment Method</span>
                <span className="font-semibold uppercase">
                  {order.paymentMethod === "cod" ? "Cash on Delivery (Partial COD)" : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Payment Status</span>
                <span className="font-semibold capitalize text-success">
                  {order.paymentStatus === "advance_paid"
                    ? "₹99 Advance Paid"
                    : order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg" className="flex-1">
              <Link href={`/track-order?orderId=${order.orderId}`}>
                <Truck className="h-4 w-4" />
                Track Your Order
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={handlePrint} className="sm:w-auto">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Invoice</span>
            </Button>
          </div>
        </motion.div>

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-[20px] border border-ink/10 bg-white p-6"
        >
          <h3 className="font-heading text-base font-bold">What happens next?</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Package, title: "Order Processing", desc: "We're preparing your order with care." },
              { icon: Truck, title: "Shipment", desc: "You'll get a tracking link once it ships." },
              { icon: Calendar, title: "Delivery", desc: `Expected by ${formatDate(order.estimatedDelivery)}.` },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-5 w-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted">
          A confirmation email has been sent to {order.email}. For any queries, contact{" "}
          {SITE.email} or {SITE.phone}.
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-cream">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-gold" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
