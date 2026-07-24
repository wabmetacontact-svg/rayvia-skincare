"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export function StickyBuyBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/90 backdrop-blur-lg transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">{product.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-muted line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addItem(product)}
          className="px-4"
        >
          <ShoppingBag className="h-4 w-4" />
          Add
        </Button>
        <Button size="sm" variant="gold" className="px-4" asChild>
          <Link href="/checkout" onClick={() => addItem(product)}>
            <Zap className="h-4 w-4" />
            Buy Now
          </Link>
        </Button>
      </div>
    </div>
  );
}
