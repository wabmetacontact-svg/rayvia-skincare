import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: "Read Rayvia's privacy policy to understand how we collect, use and protect your personal information.",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, phone number, shipping address and payment details when you place an order or create an account. We also collect usage data through cookies and analytics tools to improve our services.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to process orders, provide customer support, send order updates, personalise your experience, improve our products and services, and send promotional communications (with your consent). We never sell your personal data to third parties.",
  },
  {
    title: "Payment Security",
    content:
      "All payments are processed through secure, PCI-DSS compliant payment gateways including Razorpay. We do not store your complete credit/debit card details on our servers. Your payment information is encrypted and transmitted securely.",
  },
  {
    title: "Data Sharing",
    content:
      "We share your information only with trusted service providers who assist in operating our business, such as shipping partners (Delhivery, Bluedart), payment processors and analytics providers. These partners are bound by confidentiality obligations.",
  },
  {
    title: "Cookies",
    content:
      "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, analyse traffic and serve relevant content. You can manage cookie preferences through your browser settings.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications at any time. To exercise these rights, contact us at " + SITE.email + ".",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal information only for as long as necessary to fulfil the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Your privacy is important to us. This policy explains how we collect, use and protect your information."
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
                  Questions about this policy? Email us at{" "}
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
