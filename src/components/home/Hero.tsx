"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-beige blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        {/* Text */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-dark" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
              Premium Tan Removal Skincare
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Reveal Your
            <br />
            <span className="gold-text">Natural Glow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            Clinically-inspired, dermatologically-tested tan removal products
            crafted for modern Indian skin. Premium quality, honest prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" variant="gold" className="group">
              <Link href="/products">
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Discover Rayvia</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex items-center gap-6"
          >
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-1 text-sm text-muted">
                <span className="font-semibold text-ink">4.8/5</span> from 3,600+ reviews
              </p>
            </div>
            <div className="h-10 w-px bg-ink/10" />
            <div>
              <p className="font-heading text-2xl font-bold">10K+</p>
              <p className="text-xs text-muted">Happy customers</p>
            </div>
          </motion.div>
        </div>

        {/* Hero Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-ink/10 shadow-[0_40px_80px_-30px_rgba(17,17,17,0.3)]">
            <video
              src="/videos/hero-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent pointer-events-none" />
          </div>

          {/* Floating card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-6 -left-2 w-56 rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-soft backdrop-blur-lg sm:-left-6 z-10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold">Visible results</p>
                <p className="text-xs text-muted">in just 7 days</p>
              </div>
            </div>
          </motion.div>

          {/* Floating rating card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute -right-2 top-8 rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-soft backdrop-blur-lg sm:-right-6 z-10"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-1 text-xs font-semibold">Trusted by 10,000+</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
