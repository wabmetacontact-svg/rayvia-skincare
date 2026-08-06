"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Zap,
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/StarRating";
import { formatINR, discountPercent } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { freeShippingAbove } = useSettings();

  const freeShippingSubText = freeShippingAbove === 0 ? "All orders" : `Above ₹${freeShippingAbove}`;
  const freeShippingBannerText = freeShippingAbove === 0
    ? "Free shipping on all orders"
    : `Free shipping above ₹${freeShippingAbove}`;
  const off = discountPercent(product.price, product.mrp);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Badge variant="gold">{product.size}</Badge>
        <Badge variant="success">In Stock</Badge>
      </div>

      <h1 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-1 text-lg text-muted">{product.tagline}</p>

      <div className="mt-3 flex items-center gap-3">
        <StarRating rating={product.rating} size={16} showValue />
        <span className="text-sm text-muted">
          {product.reviewCount.toLocaleString("en-IN")} reviews
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-heading text-3xl font-bold">
          {formatINR(product.price)}
        </span>
        {product.mrp > product.price && (
          <>
            <span className="text-lg text-muted line-through">
              {formatINR(product.mrp)}
            </span>
            <Badge variant="success">{off}% OFF</Badge>
          </>
        )}
      </div>
      {off > 0 && (
        <p className="mt-1 text-sm font-semibold text-success">
          You save {formatINR(product.mrp - product.price)}
        </p>
      )}

      <p className="mt-5 text-base leading-relaxed text-ink-soft">
        {product.description}
      </p>

      {/* Benefits */}
      <div className="mt-6">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-ink-soft">
          Key Benefits
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {product.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                <Check className="h-3 w-3 text-success" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Quantity */}
      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm font-semibold">Quantity</span>
        <div className="flex items-center gap-1 rounded-full border border-ink/15">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          variant="gold"
          className="flex-1"
          onClick={() => addItem(product, qty)}
        >
          <ShoppingBag className="h-5 w-5" />
          Add to Cart
        </Button>
        <Button size="lg" className="flex-1" asChild>
          <Link href="/checkout" onClick={() => addItem(product, qty)}>
            <Zap className="h-5 w-5" />
            Buy Now
          </Link>
        </Button>
      </div>

      {/* Trust badges */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: "Free Shipping", sub: freeShippingSubText },
          { icon: RefreshCw, label: "7-Day Returns", sub: "Easy returns" },
          { icon: ShieldCheck, label: "Dermatologically Tested", sub: "Safe & gentle" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-2xl border border-ink/10 bg-white p-3 text-center"
          >
            <Icon className="h-5 w-5 text-gold-dark" />
            <span className="text-xs font-semibold leading-tight">{label}</span>
            <span className="text-[10px] text-muted">{sub}</span>
          </div>
        ))}
      </div>

      {/* Delivery estimate */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-beige p-3 text-sm text-ink-soft">
        <Truck className="h-4 w-4 text-gold-dark" />
        Get it in {SITE.shippingDays} business days • {freeShippingBannerText}
      </div>
    </div>
  );
}
