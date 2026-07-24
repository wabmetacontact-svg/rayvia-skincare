"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  Tag,
  CreditCard,
  Banknote,
  Wallet,
  ShieldCheck,
  Lock,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR, discountPercent } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  email: z.string().email("Enter a valid email"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Enter a valid pincode").max(6),
  paymentMethod: z.enum(["cod", "upi", "card"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const STEPS = ["Details", "Address", "Payment"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cod" },
  });

  const shipping = subtotal >= SITE.freeShippingAbove || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discount) + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        applyCoupon(data.code, data.discount);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Something went wrong");
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items,
          subtotal,
          discount,
          shipping,
          total,
          couponCode: coupon?.code,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        clearCart();
        router.push(`/order-success?orderId=${result.order.orderId}`);
      } else {
        alert(result.error || "Failed to place order");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream px-4">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-beige">
            <ShoppingBag className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted">Add some products to checkout</p>
          <Button asChild variant="gold" className="mt-6">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Checkout</h1>
          {/* Stepper */}
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    i <= step ? "bg-gold text-ink" : "bg-ink/10 text-muted"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    i <= step ? "text-ink" : "text-muted"
                  }`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 ${i < step ? "bg-gold" : "bg-ink/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 0: Details */}
              {step === 0 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-heading text-lg font-bold">Customer Details</h2>
                  <div>
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      {...register("customerName")}
                      className="mt-1.5"
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className="mt-1.5"
                        placeholder="10-digit mobile number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="mt-1.5"
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    className="mt-2 w-full"
                    onClick={() => {
                      const name = watch("customerName");
                      const phone = watch("phone");
                      const email = watch("email");
                      if (name && phone && email) setStep(1);
                    }}
                  >
                    Continue to Address
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 1: Address */}
              {step === 1 && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-heading text-lg font-bold">Delivery Address</h2>
                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      {...register("address")}
                      className="mt-1.5"
                      placeholder="House no, street, area, landmark"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        className="mt-1.5"
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        className="mt-1.5"
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      {...register("pincode")}
                      className="mt-1.5"
                      placeholder="6-digit pincode"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(0)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="gold"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        const address = watch("address");
                        const city = watch("city");
                        const state = watch("state");
                        const pincode = watch("pincode");
                        if (address && city && state && pincode) setStep(2);
                      }}
                    >
                      Continue to Payment
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-heading text-lg font-bold">Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive", icon: Banknote },
                      { value: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm & more", icon: Wallet },
                      { value: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex", icon: CreditCard },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-[16px] border-2 p-4 transition-colors ${
                          watch("paymentMethod") === method.value
                            ? "border-gold bg-gold/5"
                            : "border-ink/10 hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          {...register("paymentMethod")}
                          value={method.value}
                        />
                        <method.icon className="h-5 w-5 text-gold-dark" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{method.label}</p>
                          <p className="text-xs text-muted">{method.desc}</p>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            watch("paymentMethod") === method.value
                              ? "border-gold"
                              : "border-ink/20"
                          }`}
                        >
                          {watch("paymentMethod") === method.value && (
                            <div className="h-2.5 w-2.5 rounded-full bg-gold" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {watch("paymentMethod") === "upi" && (
                    <Input placeholder="Enter UPI ID (e.g. name@bank)" className="mt-2" />
                  )}
                  {watch("paymentMethod") === "card" && (
                    <div className="space-y-3 rounded-[16px] bg-cream p-4">
                      <Input placeholder="Card Number" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVV" type="password" />
                      </div>
                      <Input placeholder="Name on Card" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-[12px] bg-success/10 px-4 py-2.5 text-xs text-success">
                    <ShieldCheck className="h-4 w-4" />
                    Your payment is secure and encrypted
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="flex-1"
                      disabled={placing}
                    >
                      {placing ? (
                        "Placing Order..."
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Place Order • {formatINR(total)}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[24px] border border-ink/10 bg-white p-6">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>

              {/* Items */}
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-beige">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-semibold leading-tight">{item.name}</p>
                      <p className="text-xs text-muted">{item.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-ink/15">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-ink/5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-ink/5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 border-t border-ink/10 pt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-[12px] bg-success/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-success" />
                      <span className="text-sm font-semibold text-success">{coupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="h-10"
                    />
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                )}
                <p className="mt-1.5 text-xs text-muted">
                  Try <span className="font-semibold text-gold-dark">RAYVIA10</span> for 10% off
                </p>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
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
                  <span className={shipping === 0 ? "text-success" : ""}>
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-ink/10 pt-3">
                  <span className="font-heading text-base font-bold">Total</span>
                  <span className="font-heading text-xl font-bold">{formatINR(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-[12px] bg-cream px-4 py-2.5 text-xs text-muted">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure checkout • 100% protected
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
