"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { discountPercent } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  price,
  mrp,
}: {
  images: string[];
  name: string;
  price: number;
  mrp: number;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const off = discountPercent(price, mrp);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="group relative aspect-square overflow-hidden rounded-[24px] border border-ink/10 bg-beige"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {off > 0 && (
          <Badge variant="gold" className="absolute left-4 top-4 z-10">
            {off}% OFF
          </Badge>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: zoomed ? 1.15 : 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold text-ink-soft backdrop-blur">
          Hover to zoom
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative aspect-square w-20 overflow-hidden rounded-2xl border-2 transition-all ${
              active === i ? "border-gold" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
