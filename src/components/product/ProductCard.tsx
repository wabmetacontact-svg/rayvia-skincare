"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/StarRating";
import { formatINR, discountPercent } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const off = discountPercent(product.price, product.mrp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-ink/10 bg-white shadow-[0_12px_40px_-16px_rgba(17,17,17,0.1)] transition-all duration-500 hover:shadow-[0_24px_60px_-20px_rgba(17,17,17,0.18)]"
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-beige"
      >
        {off > 0 && (
          <Badge variant="gold" className="absolute left-3 top-3 z-10">
            {off}% OFF
          </Badge>
        )}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <Badge variant="success" className="bg-success/15 text-success">
            In Stock
          </Badge>
        </div>
        <div className="h-full w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-ink/80 to-transparent p-4 transition-transform duration-500 group-hover:translate-y-0">
          <span className="text-xs font-semibold text-cream">View Details</span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-dark">
            {product.size}
          </span>
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} size={13} />
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 font-heading text-lg font-bold leading-snug transition-colors hover:text-gold-dark">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{product.tagline}</p>

        <ul className="mt-3 space-y-1">
          {product.benefits.slice(0, 2).map((b) => (
            <li key={b} className="flex items-start gap-1.5 text-xs text-ink-soft">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-bold">{formatINR(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-muted line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            {off > 0 && (
              <p className="text-xs font-semibold text-success">
                You save {formatINR(product.mrp - product.price)}
              </p>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-beige px-2 py-1 text-[10px] font-medium text-ink-soft">
            <ShieldCheck className="h-3 w-3 text-success" /> Dermatologically tested
          </span>
          <span className="flex items-center gap-1 rounded-full bg-beige px-2 py-1 text-[10px] font-medium text-ink-soft">
            <Truck className="h-3 w-3 text-gold" /> Free shipping
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="gold"
            className="flex-1"
            onClick={() => addItem(product)}
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => addItem(product)}
            asChild
          >
            <Link href="/checkout">
              <Zap className="h-4 w-4" />
              Buy Now
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
