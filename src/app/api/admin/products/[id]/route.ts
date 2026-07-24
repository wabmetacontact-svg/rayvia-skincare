import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { mapProductRow } from "@/lib/product-service";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const body = await req.json();
    const values = payloadToValues(body);
    const [updated] = await db
      .update(products)
      .set(values)
      .where(eq(products.id, Number(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true, product: mapProductRow(updated) });
  } catch (error) {
    console.error("Admin product update error", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, Number(id)))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product delete error", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
