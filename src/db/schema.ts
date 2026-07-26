import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  tagline: varchar("tagline", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
  size: varchar("size", { length: 40 }).notNull().default("100g"),
  image: text("image").notNull(),
  gallery: jsonb("gallery").notNull().default("[]"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.80"),
  reviewCount: integer("review_count").notNull().default(0),
  benefits: jsonb("benefits").notNull().default("[]"),
  ingredients: jsonb("ingredients").notNull().default("[]"),
  usage: jsonb("usage").notNull().default("[]"),
  faqs: jsonb("faqs").notNull().default("[]"),
  shippingCharge: numeric("shipping_charge", { precision: 10, scale: 2 }).notNull().default("0"),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderId: varchar("order_id", { length: 32 }).notNull().unique(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 12 }).notNull(),
    items: jsonb("items").notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    paymentMethod: varchar("payment_method", { length: 40 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 40 }).notNull().default("pending"),
    advanceAmount: numeric("advance_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    status: varchar("status", { length: 40 }).notNull().default("placed"),
    trackingNumber: varchar("tracking_number", { length: 60 }),
    courierName: varchar("courier_name", { length: 80 }),
    estimatedDelivery: timestamp("estimated_delivery"),
    razorpayOrderId: varchar("razorpay_order_id", { length: 64 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 64 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("orders_order_id_idx").on(table.orderId),
    phoneIdx: index("orders_phone_idx").on(table.phone),
    razorpayOrderIdIdx: index("orders_razorpay_order_id_idx").on(table.razorpayOrderId),
  })
);

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull().default("percent"),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 10, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id"),
  name: varchar("name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 160 }),
  comment: text("comment").notNull(),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
