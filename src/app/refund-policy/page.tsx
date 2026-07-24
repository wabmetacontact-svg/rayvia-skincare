import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Refund Policy",
  description: "Learn about Rayvia's 7-day return and refund policy for unopened products.",
};

const STEPS = [
  {
    title: "Initiate Return",
    desc: "Contact our customer support within 7 days of delivery with your order ID and reason for return.",
  },
  {
    title: "Return Pickup",
    desc: "We will arrange for the product to be picked up from your address at no additional cost.",
  },
  {
    title: "Inspection",
    desc: "Our team inspects the returned product to ensure it is unopened and in resalable condition.",
  },
  {
    title: "Refund Processed",
    desc: "Once approved, your refund is processed within 7-10 business days to your original payment method.",
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer Care"
        title="Return & Refund Policy"
        subtitle="Your satisfaction is our priority. We offer hassle-free returns on all unopened products."
      />
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-10">
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-lg font-bold">7-Day Return Window</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Not satisfied with your purchase? You can return unopened products in their
                    original condition within 7 days of delivery for a full refund. We want you
                    to love every Rayvia product.
                  </p>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold">Eligibility</h2>
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    <li className="flex gap-2">
                      <span className="text-gold">•</span>
                      Products must be unopened, unused and in original packaging.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">•</span>
                      Return request must be raised within 7 days of delivery.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">•</span>
                      Free return pickup across India.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">•</span>
                      Damaged or defective products are eligible for free replacement.
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold">Non-Returnable Items</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    For hygiene reasons, opened or used products cannot be returned. If your
                    product arrives damaged or defective, please contact us within 48 hours of
                    delivery for a free replacement.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="mt-10">
                <h2 className="font-heading text-lg font-bold">How It Works</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {STEPS.map((step, i) => (
                    <div key={i} className="flex gap-3 rounded-[16px] bg-cream p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold font-heading text-sm font-bold text-ink">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-[16px] bg-cream p-5">
                <p className="text-sm text-ink-soft">
                  To initiate a return, email us at{" "}
                  <a href={`mailto:${SITE.email}`} className="font-semibold text-gold-dark hover:underline">
                    {SITE.email}
                  </a>{" "}
                  or call {SITE.phone} with your order ID.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
