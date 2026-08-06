"use client";

import { ShieldCheck, Truck, Leaf, RefreshCw } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function TrustBadges() {
  const { freeShippingAbove } = useSettings();

  const freeShippingDesc = freeShippingAbove === 0
    ? "On all orders"
    : `On orders above ₹${freeShippingAbove}`;

  const BADGES = [
    { icon: ShieldCheck, title: "Dermatologically Tested", desc: "Safe for all skin types" },
    { icon: Truck, title: "Free Shipping", desc: freeShippingDesc },
    { icon: Leaf, title: "Cruelty-Free & Vegan", desc: "Never tested on animals" },
    { icon: RefreshCw, title: "7-Day Returns", desc: "Hassle-free returns" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {BADGES.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige">
            <Icon className="h-5 w-5 text-gold-dark" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
