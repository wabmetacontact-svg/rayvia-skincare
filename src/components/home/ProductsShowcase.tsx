"use client";

import type { Product } from "@/lib/products";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductsShowcase({ products }: { products: Product[] }) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Bestsellers"
          title="Tan Removal Skincare Essentials"
          subtitle="Explore our clinically-formulated products designed to lift stubborn tan, fade dark spots and restore your skin's natural radiance."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
