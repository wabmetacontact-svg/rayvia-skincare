import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service",
  description: "Read Rayvia's terms of service governing your use of our website and purchase of our products.",
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing and using the Rayvia website and purchasing our products, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of our website.",
  },
  {
    title: "Products and Pricing",
    content:
      "All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without prior notice. All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.",
  },
  {
    title: "Orders and Payment",
    content:
      "By placing an order, you make an offer to purchase products subject to these terms. We accept payments via UPI, credit/debit cards, net banking and Cash on Delivery (COD). Orders are confirmed only after payment is received or COD is verified.",
  },
  {
    title: "Shipping and Delivery",
    content:
      "We ship across India. Standard delivery takes 3-5 business days. Free shipping is available on orders above ₹499. A flat shipping fee of ₹49 applies to orders below ₹499. We are not liable for delays caused by shipping partners or unforeseen circumstances.",
  },
  {
    title: "Returns and Refunds",
    content:
      "We offer a 7-day return policy on unopened products in their original condition. Refunds are processed within 7-10 business days of receiving the returned product. Please refer to our Refund Policy for detailed information.",
  },
  {
    title: "Product Use",
    content:
      "Our products are for external use only. Follow the usage instructions provided on the product packaging. Discontinue use if irritation occurs. Rayvia is not liable for any adverse reactions resulting from misuse or failure to follow instructions.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content on this website, including text, images, logos, product designs and branding, is the property of Rayvia Beauty Pvt. Ltd. and protected by intellectual property laws. Unauthorised use is prohibited.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Rayvia shall not be liable for any indirect, incidental or consequential damages arising from the use of our products or website. Our total liability is limited to the purchase price of the product in question.",
  },
  {
    title: "Governing Law",
    content:
      "These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our website or purchasing our products."
      />
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[24px] border border-ink/10 bg-white p-6 sm:p-10">
              <p className="text-sm text-muted">Last updated: January 2025</p>
              <div className="mt-6 space-y-8">
                {SECTIONS.map((s, i) => (
                  <div key={i}>
                    <h2 className="font-heading text-lg font-bold">{s.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[16px] bg-cream p-5">
                <p className="text-sm text-ink-soft">
                  For any queries, contact us at{" "}
                  <a href={`mailto:${SITE.email}`} className="font-semibold text-gold-dark hover:underline">
                    {SITE.email}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
