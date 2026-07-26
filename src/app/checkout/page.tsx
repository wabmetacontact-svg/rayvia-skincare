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
  QrCode,
  Smartphone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15),
  email: z.string().email("Enter a valid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Enter a valid 6-digit pincode").max(6),
  paymentMethod: z.enum(["cod", "upi", "card"]),
  upiId: z.string().optional(),
  upiApp: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardName: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const STEPS = ["Details", "Address", "Payment"] as const;

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "phonepe", name: "PhonePe", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "paytm", name: "Paytm", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "bhim", name: "BHIM / Other", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

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

  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "upi",
      upiApp: "gpay",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const productShippingTotal = items.reduce((sum, i) => sum + Number(i.shippingCharge ?? 0) * i.quantity, 0);
  const shipping = productShippingTotal > 0
    ? productShippingTotal
    : (subtotal >= SITE.freeShippingAbove || subtotal === 0 ? 0 : 49);
  const total = Math.max(0, subtotal - discount) + shipping;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

  const processOrderPlacement = async (checkoutData: CheckoutForm) => {
    setPlacing(true);
    try {
      const isCod = checkoutData.paymentMethod === "cod";
      const chargeAmount = isCod ? Math.min(total, 99) : total;

      // Online Payment via Razorpay Gateway (UPI / Card / COD Advance)
      const resOrder = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: chargeAmount,
          receipt: `rcpt_${Date.now()}`,
          checkoutData: {
            ...checkoutData,
            items,
            subtotal,
            discount,
            shipping,
            total,
            couponCode: coupon?.code,
          },
        }),
      });

      const orderData = await resOrder.json();
      if (!resOrder.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment gateway order");
      }

      // If Razorpay live keys are not configured yet, complete test transaction smoothly
      if (orderData.isMock) {
        const resVerify = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
            checkoutData: {
              ...checkoutData,
              items,
              subtotal,
              discount,
              shipping,
              total,
              couponCode: coupon?.code,
            },
          }),
        });
        const verifyData = await resVerify.json();
        if (verifyData.success) {
          clearCart();
          router.push(`/order-success?orderId=${verifyData.order.orderId}`);
        } else {
          alert(verifyData.error || "Order creation failed");
        }
        return;
      }

      // Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: SITE.name,
        description: isCod
          ? `COD Advance Token Payment (₹${Math.min(total, 99)})`
          : `Order Payment for ${items.length} item(s)`,
        order_id: orderData.id,
        prefill: {
          name: checkoutData.customerName,
          email: checkoutData.email,
          contact: checkoutData.phone,
        },
        theme: {
          color: "#D4AF37",
        },
        handler: async function (response: any) {
          try {
            const resVerify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkoutData: {
                  ...checkoutData,
                  items,
                  subtotal,
                  discount,
                  shipping,
                  total,
                  couponCode: coupon?.code,
                },
              }),
            });
            const verifyData = await resVerify.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/order-success?orderId=${verifyData.order.orderId}`);
            } else {
              alert(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            console.error("Payment handler error:", err);
            alert("Error processing payment. Please contact support.");
          }
        },
      };

      const razorpayWindow = new (window as any).Razorpay(options);

      if (orderData.websiteOrderId) {
        const pollInterval = setInterval(async () => {
          try {
            const res = await fetch(`/api/orders/${orderData.websiteOrderId}`);
            if (res.ok) {
              const data = await res.json();
              if (
                data?.order?.paymentStatus === "paid" ||
                data?.order?.paymentStatus === "advance_paid"
              ) {
                clearInterval(pollInterval);
                try {
                  razorpayWindow.close();
                } catch {}
                clearCart();
                router.push(`/order-success?orderId=${orderData.websiteOrderId}`);
              }
            }
          } catch {
            // ignore polling errors
          }
        }, 2500);

        setTimeout(() => clearInterval(pollInterval), 12 * 60 * 1000);
      }

      razorpayWindow.open();
    } catch (error) {
      console.error("Checkout submission error:", error);
      alert(error instanceof Error ? error.message : "Checkout error");
    } finally {
      setPlacing(false);
    }
  };

  const onSubmit = (data: CheckoutForm) => {
    void processOrderPlacement(data);
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
                      if (name && phone && email) {
                        setStep(1);
                      } else {
                        alert("Please fill in customer name, phone number, and email");
                      }
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
                        if (address && city && state && pincode) {
                          setStep(2);
                        } else {
                          alert("Please fill in address, city, state and pincode");
                        }
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
                  className="space-y-5"
                >
                  <h2 className="font-heading text-lg font-bold">Select Payment Method</h2>

                  <div className="space-y-3">
                    {[
                      {
                        value: "upi",
                        label: "Razorpay UPI (Fastest)",
                        desc: "GPay, PhonePe, Paytm, BHIM & QR Code",
                        icon: Wallet,
                        badge: "Popular",
                      },
                      {
                        value: "card",
                        label: "Credit / Debit Card",
                        desc: "Visa, Mastercard, RuPay, Amex via Razorpay",
                        icon: CreditCard,
                      },
                      {
                        value: "cod",
                        label: "Cash on Delivery (Partial Advance)",
                        desc: "Pay ₹99 advance to confirm COD order, balance on delivery",
                        icon: Banknote,
                        badge: "₹99 Advance",
                      },
                    ].map((method) => (
                      <div
                        key={method.value}
                        onClick={() => setValue("paymentMethod", method.value as any)}
                        className={`flex cursor-pointer items-center gap-3 rounded-[18px] border-2 p-4 transition-all ${
                          paymentMethod === method.value
                            ? "border-gold bg-gold/5 shadow-sm"
                            : "border-ink/10 hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          {...register("paymentMethod")}
                          value={method.value}
                        />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-ink">{method.label}</p>
                            {method.badge && (
                              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted">{method.desc}</p>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            paymentMethod === method.value
                              ? "border-gold bg-gold"
                              : "border-ink/20"
                          }`}
                        >
                          {paymentMethod === method.value && (
                            <Check className="h-3.5 w-3.5 text-ink" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COD Advance Payment Box */}
                  {paymentMethod === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 rounded-[20px] border border-amber-300 bg-amber-50/80 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-sm">
                          ₹99
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                            Cash on Delivery Advance Policy
                          </p>
                          <p className="text-xs text-amber-900 mt-0.5">
                            To confirm your COD order & prevent delivery failures, an advance token payment of <strong>{formatINR(Math.min(total, 99))}</strong> is required.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-3.5 border border-amber-200 text-xs space-y-1.5 text-ink">
                        <div className="flex justify-between">
                          <span className="text-muted">Advance Online Payment:</span>
                          <span className="font-bold text-gold-dark">{formatINR(Math.min(total, 99))}</span>
                        </div>
                        <div className="flex justify-between border-t border-amber-100 pt-1.5">
                          <span className="text-muted">Balance Cash on Delivery:</span>
                          <span className="font-bold text-ink">{formatINR(Math.max(0, total - Math.min(total, 99)))}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* UPI Details Box */}
                  {paymentMethod === "upi" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 rounded-[20px] border border-gold/30 bg-gold/5 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">
                        Instant Razorpay UPI Gateway
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setSelectedUpiApp(app.id);
                              setValue("upiApp", app.id);
                              const phoneVal = watch("phone");
                              if (phoneVal) setValue("upiId", `${phoneVal}@upi`);
                            }}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                              selectedUpiApp === app.id
                                ? `${app.color} ring-2 ring-gold`
                                : "border-ink/10 bg-white text-ink hover:bg-cream"
                            }`}
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            {app.name}
                          </button>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="upiId" className="text-xs">
                          Or Enter UPI ID / VPA
                        </Label>
                        <Input
                          id="upiId"
                          {...register("upiId")}
                          placeholder="e.g. yourname@okicici or mobile@upi"
                          className="mt-1 bg-white text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-ink/10">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-gold-dark" />
                          <span className="text-xs font-semibold">Instant Scan & Pay via Razorpay</span>
                        </div>
                        <span className="text-xs text-success font-bold">Safe & Verified</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Card Details Box */}
                  {paymentMethod === "card" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 rounded-[20px] border border-ink/10 bg-cream p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Credit / Debit Card via Razorpay
                      </p>
                      <div>
                        <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                        <Input
                          id="cardNumber"
                          {...register("cardNumber")}
                          placeholder="4532 •••• •••• 8910"
                          maxLength={19}
                          className="mt-1 bg-white font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExpiry" className="text-xs">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            {...register("cardExpiry")}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="mt-1 bg-white text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv" className="text-xs">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="password"
                            {...register("cardCvv")}
                            placeholder="123"
                            maxLength={4}
                            className="mt-1 bg-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName" className="text-xs">Name on Card</Label>
                        <Input
                          id="cardName"
                          {...register("cardName")}
                          placeholder="As printed on card"
                          className="mt-1 bg-white text-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2 rounded-[12px] bg-success/10 px-4 py-3 text-xs font-medium text-success">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Razorpay 256-bit Encrypted • Direct Bank Settlement</span>
                  </div>

                  <div className="flex gap-3 pt-2">
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
                      className="flex-1 font-bold"
                      disabled={placing}
                    >
                      {placing ? (
                        "Opening Razorpay Gateway..."
                      ) : paymentMethod === "cod" ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Pay {formatINR(Math.min(total, 99))} & Confirm COD Order
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Pay & Place Order • {formatINR(total)}
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
            <div className="rounded-[24px] border border-ink/10 bg-white p-6 shadow-soft">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>

              {/* Items */}
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1 no-scrollbar">
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
                      className="h-10 text-sm"
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
                Razorpay Secured • 100% Protected
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
