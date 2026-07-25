import { Hero } from "@/components/home/Hero";
import { ProductsShowcase } from "@/components/home/ProductsShowcase";
import { Benefits } from "@/components/home/Benefits";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { Ingredients } from "@/components/home/Ingredients";
import { FeaturedProduct } from "@/components/home/FeaturedProduct";
import { WhyRayvia } from "@/components/home/WhyRayvia";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FAQ } from "@/components/home/FAQ";
import { Newsletter } from "@/components/home/Newsletter";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { getAllProductsFromDb } from "@/lib/product-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProductsFromDb();
  const featured = products.find((p) => p.featured) ?? products[0];

  return (
    <>
      <Hero />
      <div className="bg-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </div>
      <ProductsShowcase products={products} />
      <Benefits />
      <BeforeAfter />
      {featured && <FeaturedProduct product={featured} />}
      <Ingredients />
      <WhyRayvia />
      <CustomerReviews />
      <FAQ />
      <Newsletter />
    </>
  );
}
