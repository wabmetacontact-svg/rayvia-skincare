import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home as HomeIcon } from "lucide-react";
import {
  getAllProductsFromDb,
  getProductBySlugFromDb,
  getRelatedProductsFromDb,
} from "@/lib/product-service";
import type { Product } from "@/lib/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CustomerReviews } from "@/components/home/CustomerReviews";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await getAllProductsFromDb();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugFromDb(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

const jsonLd = (product: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.image,
  brand: { "@type": "Brand", name: "Rayvia" },
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: product.price,
    availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
});

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugFromDb(slug);

  if (!product) notFound();

  const related = await getRelatedProductsFromDb(slug);

  return (
    <>
      <div className="border-b border-ink/10 bg-cream">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-sm text-muted sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-ink">
            <HomeIcon className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-ink">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{product.name}</span>
        </div>
      </div>

      <section className="bg-cream py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <ProductGallery
                images={product.gallery.length ? product.gallery : [product.image]}
                name={product.name}
                price={product.price}
                mrp={product.mrp}
              />
            </Reveal>
            <Reveal delay={0.15}>
              <ProductInfo product={product} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What's Inside"
            title="Key Ingredients"
            subtitle="Clinically-proven actives combined with soothing botanicals."
            align="left"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {product.ingredients.map((ing, i) => (
              <Reveal key={ing.name} delay={i * 0.08}>
                <div className="flex gap-4 rounded-[20px] border border-ink/10 bg-cream p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
                    <span className="font-heading text-lg font-bold text-gold-dark">
                      {ing.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold">{ing.name}</h3>
                    <p className="mt-1 text-sm text-muted">{ing.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How To Use"
            title="Simple steps, visible results"
          />
          <div className="mt-10 space-y-4">
            {product.usage.map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="flex gap-4 rounded-[20px] border border-ink/10 bg-white p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-heading text-sm font-bold text-ink">
                    {i + 1}
                  </div>
                  <p className="pt-1 text-sm text-ink-soft">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Questions" title="Product FAQs" />
          <Reveal className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {product.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <CustomerReviews />

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Complete Your Routine"
            title="You may also like"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <StickyBuyBar product={product} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(product)) }}
      />
    </>
  );
}
