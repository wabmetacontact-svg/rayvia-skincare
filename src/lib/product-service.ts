import { db } from "@/db";
import { products as productsTable } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";
import { products as seedProducts, type Product } from "@/lib/products";

type ProductRow = typeof productsTable.$inferSelect;

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : fallback;
}

function asIngredients(value: unknown, fallback: Product["ingredients"] = []): Product["ingredients"] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const item = v as Record<string, unknown>;
      return {
        name: String(item.name ?? ""),
        desc: String(item.desc ?? ""),
      };
    })
    .filter((v) => v.name && v.desc);
}

function asFaqs(value: unknown, fallback: Product["faqs"] = []): Product["faqs"] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const item = v as Record<string, unknown>;
      return {
        q: String(item.q ?? ""),
        a: String(item.a ?? ""),
      };
    })
    .filter((v) => v.q && v.a);
}

export function mapProductRow(row: ProductRow): Product {
  const fallback = seedProducts.find((p) => p.slug === row.slug);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    mrp: Number(row.mrp),
    image: row.image,
    gallery: asStringArray(row.gallery, fallback?.gallery ?? [row.image]),
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    benefits: asStringArray(row.benefits, fallback?.benefits ?? []),
    ingredients: asIngredients(row.ingredients, fallback?.ingredients ?? []),
    usage: asStringArray(row.usage, fallback?.usage ?? []),
    faqs: asFaqs(row.faqs, fallback?.faqs ?? []),
    inStock: row.inStock,
    featured: row.featured,
    size: row.size ?? fallback?.size ?? "100g",
  };
}

export async function getAllProductsFromDb(): Promise<Product[]> {
  try {
    const rows = await db.select().from(productsTable).orderBy(desc(productsTable.featured), productsTable.id);
    return rows.length ? rows.map(mapProductRow) : seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function getProductBySlugFromDb(slug: string): Promise<Product | undefined> {
  try {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1);
    return row ? mapProductRow(row) : seedProducts.find((p) => p.slug === slug);
  } catch {
    return seedProducts.find((p) => p.slug === slug);
  }
}

export async function getRelatedProductsFromDb(slug: string, limit = 2): Promise<Product[]> {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .where(ne(productsTable.slug, slug))
      .limit(limit);
    return rows.length ? rows.map(mapProductRow) : seedProducts.filter((p) => p.slug !== slug).slice(0, limit);
  } catch {
    return seedProducts.filter((p) => p.slug !== slug).slice(0, limit);
  }
}
