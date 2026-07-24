import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { mapProductRow } from "@/lib/product-service";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function parseLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseJson(value: unknown, fallback: unknown[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function payloadToValues(body: Record<string, unknown>) {
  return {
    slug: String(body.slug ?? "").trim().toLowerCase(),
    name: String(body.name ?? "").trim(),
    tagline: String(body.tagline ?? "").trim(),
    description: String(body.description ?? "").trim(),
    price: String(Number(body.price ?? 0)),
    mrp: String(Number(body.mrp ?? 0)),
    size: String(body.size ?? "100g").trim(),
    image: String(body.image ?? "").trim(),
    gallery: parseLines(body.gallery) as unknown,
    rating: String(Number(body.rating ?? 4.8)),
    reviewCount: Number(body.reviewCount ?? 0),
    benefits: parseLines(body.benefits) as unknown,
    ingredients: parseJson(body.ingredients, []) as unknown,
    usage: parseLines(body.usage) as unknown,
    faqs: parseJson(body.faqs, []) as unknown,
    inStock: Boolean(body.inStock),
    featured: Boolean(body.featured),
  };
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const rows = await db.select().from(products).orderBy(asc(products.id));
  return NextResponse.json({ products: rows.map(mapProductRow) });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const values = payloadToValues(body);
    if (!values.slug || !values.name || !values.image) {
      return NextResponse.json({ error: "Slug, name and image are required." }, { status: 400 });
    }
    const [created] = await db.insert(products).values(values).returning();
    return NextResponse.json({ success: true, product: mapProductRow(created) });
  } catch (error) {
    console.error("Admin product create error", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
