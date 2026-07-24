import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/reviews",
    "/faqs",
    "/track-order",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
  ];

  const productRoutes = products.map((p) => `/products/${p.slug}`);

  const allRoutes = [...staticRoutes, ...productRoutes];

  return allRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
