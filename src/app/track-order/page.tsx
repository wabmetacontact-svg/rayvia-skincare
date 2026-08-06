"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Box,
  Truck,
  Bike,
  CheckCircle2,
  Search,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/Reveal";
import { formatINR, formatDate, ORDER_STATUSES } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";
import Link from "next/link";

const ICONS: Record<string, typeof Package> = {
  package: Package,
  box: Box,
  truck: Truck,
  bike: Bike,
  check: CheckCircle2,
};

type OrderData = {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  total: number;
  status: string;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
  createdAt: string;
  statuses: { key: string; label: string; icon: string; completed: boolean; current: boolean }[];
};

export default function TrackOrderPage() {
  const { freeShippingAbove } = useSettings();
  const freeShippingDesc = freeShippingAbove === 0 ? "On all orders" : `On orders above ₹${freeShippingAbove}`;

  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill order ID from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get("orderId");
    if (oid) setOrderId(oid);
  }, []);
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) {
      setError("Please enter both Order ID and phone number");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Track Your Order"
        title="Order Tracking"
        subtitle="Enter your Order ID and phone number to track your shipment in real-time."
      />

      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Form */}
          <Reveal>
            <form
              onSubmit={handleTrack}
              className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="e.g. RAYXXXXXX"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              {error && (
                <p className="mt-3 rounded-[12px] bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}
              <Button type="submit" variant="gold" size="lg" className="mt-4 w-full" disabled={loading}>
                {loading ? "Tracking..." : "Track Order"}
                {!loading && <Search className="h-4 w-4" />}
              </Button>
              <p className="mt-3 text-center text-xs text-muted">
                You can find your Order ID in the confirmation email/SMS sent after your purchase.
              </p>
            </form>
          </Reveal>

          {/* Result */}
          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8"
              >
                {/* Order summary */}
                <div className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Order ID
                      </p>
                      <p className="font-heading text-lg font-bold">{order.orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Order Date
                      </p>
                      <p className="text-sm font-semibold">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Tracking timeline */}
                  <div className="mt-6">
                    <h3 className="font-heading text-base font-bold">Shipment Status</h3>
                    <div className="mt-5">
                      <div className="relative">
                        {/* Progress line */}
                        <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 bg-ink/10" />
                        <div
                          className="absolute left-5 top-5 w-0.5 bg-gold transition-all duration-700"
                          style={{
                            height: `${(order.statuses.filter((s) => s.completed).length - 1) * (100 / (order.statuses.length - 1))}%`,
                          }}
                        />
                        <div className="space-y-6">
                          {order.statuses.map((status) => {
                            const Icon = ICONS[status.icon] || Package;
                            return (
                              <div key={status.key} className="relative flex items-start gap-4">
                                <div
                                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                    status.completed
                                      ? "border-gold bg-gold text-ink"
                                      : "border-ink/15 bg-white text-muted"
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="pt-1.5">
                                  <p
                                    className={`text-sm font-semibold ${
                                      status.completed ? "text-ink" : "text-muted"
                                    }`}
                                  >
                                    {status.label}
                                  </p>
                                  {status.current && (
                                    <p className="text-xs text-gold-dark">
                                      In progress...
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking details */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[16px] bg-cream p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Tracking Number
                      </p>
                      <p className="mt-1 text-sm font-bold">{order.trackingNumber}</p>
                    </div>
                    <div className="rounded-[16px] bg-cream p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Courier
                      </p>
                      <p className="mt-1 text-sm font-bold">{order.courierName}</p>
                    </div>
                    <div className="rounded-[16px] bg-cream p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Expected Delivery
                      </p>
                      <p className="mt-1 text-sm font-bold text-success">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-cream p-4">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Delivery Address
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {order.customerName}, {order.address}, {order.city}, {order.state} -{" "}
                        {order.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Items ({order.items.length})
                    </p>
                    <div className="mt-3 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl bg-beige">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold">
                            {formatINR(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                      <span className="font-heading text-base font-bold">Total</span>
                      <span className="font-heading text-xl font-bold">
                        {formatINR(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="gold" className="flex-1">
                      <Link href="/products">
                        Continue Shopping
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/contact">Need Help?</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info cards */}
          {!order && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock, title: "Fast Delivery", desc: "3-5 business days" },
                { icon: Truck, title: "Free Shipping", desc: freeShippingDesc },
                { icon: Package, title: "Secure Packaging", desc: "Damage-free delivery" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-[16px] border border-ink/10 bg-white p-5 text-center">
                  <Icon className="mx-auto h-6 w-6 text-gold-dark" />
                  <p className="mt-2 text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
