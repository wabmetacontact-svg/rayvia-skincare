import { getAllProductsFromDb } from "@/lib/product-service";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeader } from "@/components/sections/PageHeader";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { Newsletter } from "@/components/home/Newsletter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products",
  description:
    "Explore Rayvia's premium tan removal skincare range — de-tan scrub, face pack and brightening serum, clinically-inspired and dermatologically tested.",
};

export default async function ProductsPage() {
  const products = await getAllProductsFromDb();

  return (
    <>
      <PageHeader
        eyebrow="The Collection"
        title="Premium Tan Removal Range"
        subtitle="Three carefully crafted products designed to remove tan, brighten skin and restore your natural glow. Premium quality, honest prices."
      />
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <TrustBadges />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
