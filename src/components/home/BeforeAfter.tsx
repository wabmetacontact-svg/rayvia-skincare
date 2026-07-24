"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/Reveal";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Real Results"
          title="See the difference"
          subtitle="Real customers. Real results. Witness the transformative power of Rayvia's tan removal range."
        />
        <Reveal className="mt-12">
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-ink/10 shadow-[0_24px_60px_-20px_rgba(17,17,17,0.25)] select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPos(((e.clientX - rect.left) / rect.width) * 100);
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPos(((e.touches[0].clientX - rect.left) / rect.width) * 100);
            }}
          >
            {/* After (full) */}
            <img
              src="https://images.pexels.com/photos/9775369/pexels-photo-9775369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"
              alt="After using Rayvia - glowing skin"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* Before (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${pos}%` }}
            >
              <img
                src="https://images.pexels.com/photos/9775369/pexels-photo-9775369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600&sat=-100&brightness=-20"
                alt="Before - dull tanned skin"
                className="absolute inset-0 h-full w-full object-cover grayscale brightness-75"
                style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }}
                draggable={false}
              />
            </div>
            {/* Labels */}
            <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-cream backdrop-blur">
              Before
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-success/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              After
            </span>
            {/* Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              style={{ left: `${pos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                  <polyline points="9 18 15 12 9 6" transform="translate(6 0)" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Drag to compare • Individual results may vary
          </p>
        </Reveal>
      </div>
    </section>
  );
}
