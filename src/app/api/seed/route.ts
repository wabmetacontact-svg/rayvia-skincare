import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, coupons, reviews } from "@/db/schema";
import { products as productData } from "@/lib/products";
import { reviews as reviewData } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * Seed the database with products, coupons and reviews.
 * POST /api/seed  (idempotent — skips existing records)
 */
export async function POST() {
  try {
    // Seed products
    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      await db.insert(products).values(
        productData.map((p) => ({
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          price: String(p.price),
          mrp: String(p.mrp),
          size: p.size,
          image: p.image,
          gallery: p.gallery as any,
          rating: String(p.rating),
          reviewCount: p.reviewCount,
          benefits: p.benefits as any,
          ingredients: p.ingredients as any,
          usage: p.usage as any,
          faqs: p.faqs as any,
          inStock: p.inStock,
          featured: p.featured,
        }))
      );
    }

    // Seed coupons
    const existingCoupons = await db.select().from(coupons);
    if (existingCoupons.length === 0) {
      await db.insert(coupons).values([
        { code: "RAYVIA10", type: "percent", value: "10", minOrder: "0", active: true },
        { code: "RAYVIA15", type: "percent", value: "15", minOrder: "999", active: true },
        { code: "WELCOME20", type: "percent", value: "20", minOrder: "1499", active: true },
      ]);
    }

    // Seed reviews
    const existingReviews = await db.select().from(reviews);
    if (existingReviews.length === 0) {
      await db.insert(reviews).values(
        reviewData.map((r) => ({
          name: r.name,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verified: true,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
