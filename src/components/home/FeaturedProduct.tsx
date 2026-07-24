"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/StarRating";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";
import { formatINR, discountPercent } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";

export function FeaturedProduct({ product }: { product: Product }) {
  const { addItem } = useCart();
  if (!product) return null;
  const off = discountPercent(product.price, product.mrp);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <Reveal>
            <div className="group relative aspect-square overflow-hidden rounded-[32px] border border-ink/10 bg-cream">
              {off > 0 && (
                <Badge variant="gold" className="absolute left-5 top-5 z-10">
                  {off}% OFF
                </Badge>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </Reveal>

          {/* Content */}
          <Reveal delay={0.15}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Best Seller
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">
                {product.name}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <StarRating rating={product.rating} showValue />
                <span className="text-sm text-muted">
                  {product.reviewCount.toLocaleString("en-IN")} reviews
                </span>
              </div>
              <p className="mt-5 text-base leading-relaxed text-muted">
                {product.description}
              </p>

              <ul className="mt-6 space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-baseline gap-3">
                <span className="font-heading text-3xl font-bold">
                  {formatINR(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-lg text-muted line-through">
                    {formatINR(product.mrp)}
                  </span>
                )}
                {off > 0 && (
                  <Badge variant="success">{off}% OFF</Badge>
                )}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="gold" className="group flex-1">
                  <Link href={`/products/${product.slug}`}>
                    View Product
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => addItem(product)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
