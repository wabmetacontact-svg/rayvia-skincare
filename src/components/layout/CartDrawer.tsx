"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR, discountPercent } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const remainingForFreeShip = Math.max(0, SITE.freeShippingAbove - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / SITE.freeShippingAbove) * 100);

  const productShippingTotal = items.reduce((sum, i) => sum + Number(i.shippingCharge ?? 0) * i.quantity, 0);
  const shippingFee = productShippingTotal > 0
    ? productShippingTotal
    : (remainingForFreeShip > 0 && subtotal > 0 ? 49 : 0);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        applyCoupon(data.code, data.discount);
        setCode("");
      } else {
        setError(data.error || "Invalid coupon code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="border-b border-ink/10">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-beige">
              <ShoppingBag className="h-8 w-8 text-muted" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted">
              Discover our premium tan removal range
            </p>
            <Button asChild className="mt-6" variant="gold">
              <Link href="/products" onClick={closeCart}>
                Shop Now
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-ink/10 px-6 py-3">
              {remainingForFreeShip > 0 ? (
                <p className="flex items-center gap-2 text-xs text-ink-soft">
                  <Truck className="h-4 w-4 text-gold" />
                  Add{" "}
                  <span className="font-semibold text-ink">
                    {formatINR(remainingForFreeShip)}
                  </span>{" "}
                  more for free shipping
                </p>
              ) : (
                <p className="flex items-center gap-2 text-xs font-semibold text-success">
                  <Truck className="h-4 w-4" />
                  You've unlocked free shipping!
                </p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <motion.div
                  className="h-full rounded-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShipProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 py-3"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-beige"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold leading-snug hover:text-gold-dark"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted">{item.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border border-ink/15">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-ink/5"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-ink/5"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatINR(item.price * item.quantity)}
                          </p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-muted line-through">
                              {formatINR(item.mrp * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Coupon */}
              <div className="mt-4 rounded-2xl bg-beige p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="h-4 w-4 text-gold" />
                  Coupon Code
                </p>
                {coupon ? (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-success">{coupon.code}</p>
                      <p className="text-xs text-muted">
                        Saved {formatINR(coupon.discount)}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter code"
                      className="h-10"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={loading}
                    >
                      {loading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                <p className="mt-2 text-xs text-muted">
                  Try <span className="font-semibold text-gold-dark">RAYVIA10</span> for 10% off
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-ink/10 px-6 py-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-soft">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? "text-success" : ""}>
                    {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="font-heading text-base font-bold">Total</span>
                <span className="font-heading text-xl font-bold">
                  {formatINR(total + shippingFee)}
                </span>
              </div>
              <Button asChild size="lg" className="mt-4 w-full" variant="gold">
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted">
                Secure checkout • COD available • Easy returns
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
