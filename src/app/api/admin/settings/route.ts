import { NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/db";
import { settings } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    await ensureDbInitialized();

    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const s of allSettings) {
      settingsMap[s.key] = s.value;
    }

    const freeShippingAbove = settingsMap["free_shipping_above"] !== undefined
      ? Number(settingsMap["free_shipping_above"])
      : SITE.freeShippingAbove;

    const flatShippingFee = settingsMap["flat_shipping_fee"] !== undefined
      ? Number(settingsMap["flat_shipping_fee"])
      : 49;

    return NextResponse.json({
      freeShippingAbove: isNaN(freeShippingAbove) ? SITE.freeShippingAbove : freeShippingAbove,
      flatShippingFee: isNaN(flatShippingFee) ? 49 : flatShippingFee,
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    await ensureDbInitialized();

    const body = await req.json();
    const { freeShippingAbove, flatShippingFee } = body;

    const updates: { key: string; value: string }[] = [];

    if (freeShippingAbove !== undefined && freeShippingAbove !== null) {
      const val = String(Math.max(0, Number(freeShippingAbove) || 0));
      updates.push({ key: "free_shipping_above", value: val });
    }

    if (flatShippingFee !== undefined && flatShippingFee !== null) {
      const val = String(Math.max(0, Number(flatShippingFee) || 0));
      updates.push({ key: "flat_shipping_fee", value: val });
    }

    for (const item of updates) {
      const existing = await db.select().from(settings).where(eq(settings.key, item.key));
      if (existing.length > 0) {
        await db.update(settings).set({ value: item.value }).where(eq(settings.key, item.key));
      } else {
        await db.insert(settings).values({ key: item.key, value: item.value });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Admin settings POST error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
