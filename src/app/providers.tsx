"use client";

import { Suspense, type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MetaPixelEvents } from "@/components/analytics/MetaPixelEvents";

import { SettingsProvider } from "@/context/SettingsContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <MetaPixelEvents />
        </Suspense>
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </CartProvider>
    </SettingsProvider>
  );
}
