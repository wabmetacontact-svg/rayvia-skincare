"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

const BASE_ANNOUNCEMENTS = [
  "Use code RAYVIA10 for 10% off",
  "Clinically inspired • Dermatologically tested",
  "Cruelty-free • Vegan • Made in India",
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { freeShippingAbove } = useSettings();

  const freeShippingText = freeShippingAbove === 0
    ? "Free shipping on ALL orders!"
    : `Free shipping on orders above ₹${freeShippingAbove}`;

  const announcements = [freeShippingText, ...BASE_ANNOUNCEMENTS];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement marquee */}
      <div className="overflow-hidden bg-ink text-cream">
        <div className="flex w-max animate-marquee py-2">
          {[...announcements, ...announcements].map((a, i) => (
            <span
              key={i}
              className="mx-8 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] opacity-80"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          scrolled ? "glass shadow-[0_4px_24px_-12px_rgba(17,17,17,0.12)]" : "bg-cream/80 backdrop-blur-md"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="lg:hidden -ml-1 rounded-full p-2 text-ink hover:bg-ink/5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 lg:order-none order-1">
            <span className="font-heading text-2xl font-bold tracking-tight text-ink">
              Rayvia<span className="text-gold-dark">Beauty</span>
            </span>
            <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-gold" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/products"
              className="hidden sm:flex rounded-full p-2.5 text-ink hover:bg-ink/5"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={openCart}
              className="relative rounded-full p-2.5 text-ink hover:bg-ink/5"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-cream p-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-bold text-ink">
                  Rayvia<span className="text-gold-dark">Beauty</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 hover:bg-ink/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-beige p-4">
                <p className="text-sm font-semibold text-ink">Need help?</p>
                <p className="mt-1 text-sm text-muted">{SITE.phone}</p>
                <p className="text-sm text-muted">{SITE.email}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
