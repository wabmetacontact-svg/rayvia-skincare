import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, coupons, reviews } from "@/db/schema";
import { products as productData } from "@/lib/products";
import { reviews as reviewData } from "@/lib/reviews";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Seed the database with products, coupons and reviews.
 * POST /api/seed (idempotent — skips existing records)
 */
export async function POST() {
  try {
    // 1. Ensure database tables exist in target PostgreSQL database
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(120) NOT NULL UNIQUE,
        name VARCHAR(160) NOT NULL,
        tagline VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        mrp NUMERIC(10, 2) NOT NULL,
        size VARCHAR(40) NOT NULL DEFAULT '100g',
        image TEXT NOT NULL,
        gallery JSONB NOT NULL DEFAULT '[]',
        rating NUMERIC(3, 2) NOT NULL DEFAULT '4.80',
        review_count INTEGER NOT NULL DEFAULT 0,
        benefits JSONB NOT NULL DEFAULT '[]',
        ingredients JSONB NOT NULL DEFAULT '[]',
        usage JSONB NOT NULL DEFAULT '[]',
        faqs JSONB NOT NULL DEFAULT '[]',
        in_stock BOOLEAN NOT NULL DEFAULT true,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(32) NOT NULL UNIQUE,
        customer_name VARCHAR(160) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(160) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(12) NOT NULL,
        items JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) NOT NULL DEFAULT '0',
        shipping NUMERIC(10, 2) NOT NULL DEFAULT '0',
        total NUMERIC(10, 2) NOT NULL,
        coupon_code VARCHAR(40),
        payment_method VARCHAR(40) NOT NULL,
        payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
        status VARCHAR(40) NOT NULL DEFAULT 'placed',
        tracking_number VARCHAR(60),
        courier_name VARCHAR(80),
        estimated_delivery TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS orders_order_id_idx ON orders (order_id);
      CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders (phone);

      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(40) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL DEFAULT 'percent',
        value NUMERIC(10, 2) NOT NULL,
        min_order NUMERIC(10, 2) NOT NULL DEFAULT '0',
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        name VARCHAR(120) NOT NULL,
        rating INTEGER NOT NULL,
        title VARCHAR(160),
        comment TEXT NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS newsletter (
        id SERIAL PRIMARY KEY,
        email VARCHAR(160) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(80) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Seed products
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

    // 3. Seed coupons
    const existingCoupons = await db.select().from(coupons);
    if (existingCoupons.length === 0) {
      await db.insert(coupons).values([
        { code: "RAYVIA10", type: "percent", value: "10", minOrder: "0", active: true },
        { code: "RAYVIA15", type: "percent", value: "15", minOrder: "999", active: true },
        { code: "WELCOME20", type: "percent", value: "20", minOrder: "1499", active: true },
      ]);
    }

    // 4. Seed reviews
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
    const message = error instanceof Error ? error.message : "Failed to seed database";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
