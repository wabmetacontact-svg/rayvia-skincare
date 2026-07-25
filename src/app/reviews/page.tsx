import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import { StarRating } from "@/components/product/StarRating";
import { Newsletter } from "@/components/home/Newsletter";
import { reviews } from "@/lib/reviews";
import { Quote, Star } from "lucide-react";

export const metadata = {
  title: "Reviews",
  description:
    "Read real customer reviews for Rayvia's premium tan removal skincare range. Join 10,000+ happy customers who transformed their skin.",
};

export default function ReviewsPage() {
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <>
      <PageHeader
        eyebrow="Customer Reviews"
        title="Loved by thousands"
        subtitle="Real stories from real customers who made Rayvia part of their daily ritual."
      />

      {/* Rating summary */}
      <section className="bg-cream pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-center gap-6 rounded-[24px] border border-ink/10 bg-white p-8 sm:flex-row sm:gap-10">
              <div className="text-center">
                <p className="font-heading text-5xl font-bold">{avgRating.toFixed(1)}</p>
                <div className="mt-2 flex justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">
                  Based on {reviews.length}+ reviews
                </p>
              </div>
              <div className="hidden h-20 w-px bg-ink/10 sm:block" />
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = (count / reviews.length) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-3 text-sm text-muted">{star}</span>
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-muted">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Reviews list */}
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={(i % 3) * 0.1}>
                <div className="flex h-full flex-col rounded-[20px] border border-ink/10 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(17,17,17,0.1)]">
                  <div className="flex items-center justify-between">
                    <Quote className="h-8 w-8 text-gold/30" />
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold">
                    {review.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    "{review.comment}"
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold-dark">
                      {review.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted">
                        {review.location} • {review.product}
                      </p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                      Verified
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
