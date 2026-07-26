import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import * as schema from "./schema";
import { products as seedProducts } from "@/lib/products";
import { reviews as seedReviews } from "@/lib/reviews";

const databaseUrl = process.env.DATABASE_URL;

const isRealPgUrl =
  typeof databaseUrl === "string" &&
  (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"));

const globalForDb = globalThis as typeof globalThis & {
  __rayviaPgPool?: Pool;
  __rayviaPglite?: PGlite;
  __rayviaDb?: any;
  __rayviaDbInitPromise?: Promise<void>;
};

function initDb() {
  if (globalForDb.__rayviaDb) {
    return globalForDb.__rayviaDb;
  }

  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (isRealPgUrl) {
    const pool =
      globalForDb.__rayviaPgPool ??
      new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl?.includes("sslmode=") || isVercel ? { rejectUnauthorized: false } : undefined,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__rayviaPgPool = pool;
    }

    const dbInstance = drizzlePg(pool, { schema });
    globalForDb.__rayviaDb = dbInstance;
    return dbInstance;
  } else {
    // In Vercel serverless environment without DATABASE_URL, use in-memory PGlite.
    const pgliteTarget = isVercel ? "memory://" : "./local-db";

    let pgliteClient: PGlite;
    try {
      if (typeof window === "undefined" && !isVercel) {
        try {
          const fs = require("fs");
          const path = require("path");
          const pidPath = path.join(process.cwd(), "local-db", "postmaster.pid");
          if (fs.existsSync(pidPath)) {
            fs.unlinkSync(pidPath);
          }
        } catch {}
      }
      pgliteClient = globalForDb.__rayviaPglite ?? new PGlite(pgliteTarget);
    } catch {
      pgliteClient = new PGlite("memory://");
    }

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__rayviaPglite = pgliteClient;
    }

    const dbInstance = drizzlePglite(pgliteClient, { schema });
    globalForDb.__rayviaDb = dbInstance;

    if (!globalForDb.__rayviaDbInitPromise) {
      globalForDb.__rayviaDbInitPromise = (async () => {
        try {
          await pgliteClient.exec(`
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
              shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT '0',
              in_stock BOOLEAN NOT NULL DEFAULT true,
              featured BOOLEAN NOT NULL DEFAULT false,
              created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );

            ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT '0';

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
              advance_amount NUMERIC(10, 2) NOT NULL DEFAULT '0',
              status VARCHAR(40) NOT NULL DEFAULT 'placed',
              tracking_number VARCHAR(60),
              courier_name VARCHAR(80),
              estimated_delivery TIMESTAMP,
              razorpay_order_id VARCHAR(64),
              razorpay_payment_id VARCHAR(64),
              created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );

            ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(64);
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(64);
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) NOT NULL DEFAULT '0';

            CREATE INDEX IF NOT EXISTS orders_order_id_idx ON orders (order_id);
            CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders (phone);
            CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON orders (razorpay_order_id);

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

          // Seed default products if table is empty
          const existingProducts = await dbInstance.select().from(schema.products);
          if (existingProducts.length === 0) {
            await dbInstance.insert(schema.products).values(
              seedProducts.map((p) => ({
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

          // Seed default coupons if table is empty
          const existingCoupons = await dbInstance.select().from(schema.coupons);
          if (existingCoupons.length === 0) {
            await dbInstance.insert(schema.coupons).values([
              { code: "RAYVIA10", type: "percent", value: "10", minOrder: "0", active: true },
              { code: "RAYVIA15", type: "percent", value: "15", minOrder: "999", active: true },
              { code: "WELCOME20", type: "percent", value: "20", minOrder: "1499", active: true },
            ]);
          }

          // Seed default reviews if table is empty
          const existingReviews = await dbInstance.select().from(schema.reviews);
          if (existingReviews.length === 0) {
            await dbInstance.insert(schema.reviews).values(
              seedReviews.map((r) => ({
                name: r.name,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                verified: true,
              }))
            );
          }
        } catch (err) {
          console.error("Local database init/seed warning:", err);
        }
      })();
    }

    return dbInstance;
  }
}

export const db = initDb();

export async function ensureDbInitialized() {
  if (globalForDb.__rayviaDbInitPromise) {
    try {
      await globalForDb.__rayviaDbInitPromise;
    } catch (err) {
      console.warn("DB init wait error:", err);
    }
  }
}
