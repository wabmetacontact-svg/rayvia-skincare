import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, mrp: number): number {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `RAY${ts}${rand}`;
}

export function generateTrackingNumber(): string {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `DPK${num}`;
}

export function estimatedDeliveryDate(days = 5): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ORDER_STATUSES = [
  { key: "placed", label: "Order Placed", icon: "package" },
  { key: "packed", label: "Packed", icon: "box" },
  { key: "shipped", label: "Shipped", icon: "truck" },
  { key: "out_for_delivery", label: "Out For Delivery", icon: "bike" },
  { key: "delivered", label: "Delivered", icon: "check" },
] as const;

export type OrderStatusKey = (typeof ORDER_STATUSES)[number]["key"];
