"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster />
    </CartProvider>
  );
}
