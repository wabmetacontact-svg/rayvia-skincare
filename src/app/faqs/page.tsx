import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Newsletter } from "@/components/home/Newsletter";
import { FAQS } from "@/lib/constants";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "FAQs",
  description:
    "Find answers to frequently asked questions about Rayvia products, shipping, returns, payments and more.",
};

export default function FAQsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help Center"
        title="Frequently asked questions"
        subtitle="Everything you need to know about Rayvia. Can't find what you're looking for? Reach out to our team."
      />
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <div className="rounded-[20px] bg-ink p-8 text-center text-cream">
              <h3 className="font-heading text-xl font-bold">Still have questions?</h3>
              <p className="mt-2 text-sm text-cream/60">
                Our customer care team is here to help, 7 days a week.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
