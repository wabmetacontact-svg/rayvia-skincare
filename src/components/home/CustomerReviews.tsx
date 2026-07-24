"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StarRating } from "@/components/product/StarRating";
import { Reveal } from "@/components/Reveal";
import { reviews } from "@/lib/reviews";

export function CustomerReviews() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customer Love"
          title="Loved by 50,000+ Indians"
          subtitle="Real reviews from real customers who transformed their skin with Rayvia."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={(i % 3) * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-full flex-col rounded-[20px] border border-ink/10 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(17,17,17,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <Quote className="h-8 w-8 text-gold/30" />
                  <StarRating rating={review.rating} size={14} />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold">{review.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  "{review.comment}"
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold-dark">
                    {review.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{review.name}</p>
                    <p className="text-xs text-muted">{review.location}</p>
                  </div>
                  <span className="text-xs text-muted">{review.date}</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
