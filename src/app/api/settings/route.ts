import { NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
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
    console.error("Fetch settings error:", error);
    return NextResponse.json({
      freeShippingAbove: SITE.freeShippingAbove,
      flatShippingFee: 49,
    });
  }
}
