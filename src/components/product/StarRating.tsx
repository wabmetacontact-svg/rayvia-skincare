"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = 16,
  className,
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= Math.round(rating) ? "fill-gold text-gold" : "fill-ink/10 text-ink/10"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-ink-soft">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
