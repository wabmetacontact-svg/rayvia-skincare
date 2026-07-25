import { PageHeader } from "@/components/sections/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { WhyRayvia } from "@/components/home/WhyRayvia";
import { Newsletter } from "@/components/home/Newsletter";
import { Sparkles, Heart, FlaskConical, Leaf } from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Rayvia — a premium Indian skincare brand on a mission to make effective, ethical and luxurious tan removal accessible to everyone.",
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Our Mission",
    desc: "To empower every Indian to feel confident in their own skin by delivering clinically-inspired, results-driven skincare that is both luxurious and accessible.",
  },
  {
    icon: FlaskConical,
    title: "Our Science",
    desc: "Every formula is developed with dermatologically-tested, clinically-proven actives at effective concentrations — never diluted, never compromised.",
  },
  {
    icon: Leaf,
    title: "Our Promise",
    desc: "100% cruelty-free, vegan-friendly and free from parabens, sulphates and harmful chemicals. Made responsibly in India.",
  },
  {
    icon: Heart,
    title: "Our Community",
    desc: "Built on real feedback from real customers. Over 10,000 Indians trust Rayvia for their daily skincare ritual.",
  },
];

const STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "4.8★", label: "Average Rating" },
  { value: "3", label: "Flagship Products" },
  { value: "100%", label: "Cruelty-Free" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Skincare that feels like luxury, works like science"
        subtitle="Rayvia was born from a simple belief — that premium, effective skincare should be accessible to every Indian. We blend clinically-proven actives with the finest botanicals to deliver visible results."
      />

      {/* Stats */}
      <section className="bg-cream py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <Reveal key={s.label}>
                <div className="rounded-[20px] border border-ink/10 bg-white p-6 text-center">
                  <p className="font-heading text-3xl font-bold gold-text">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="prose prose-lg max-w-none">
              <h2 className="font-heading text-2xl font-bold">Born in India, made for India</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Rayvia was founded with a clear vision: to create premium tan removal
                products that actually work for Indian skin. We understood that Indian
                skin is unique — prone to pigmentation, sun damage and uneven tone — and
                deserved formulations tailored to these needs.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                Our team of dermatologists and formulation scientists spent over two years
                perfecting each product. We sourced the finest clinically-proven actives —
                kojic acid, tranexamic acid, alpha arbutin, niacinamide — and combined them
                with soothing botanicals like aloe vera, liquorice and cucumber.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                The result? A range of just three carefully selected products that deliver
                visible results from the very first use. No clutter, no compromise — just
                honest, premium skincare.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Our values, in every drop"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="flex h-full gap-5 rounded-[20px] border border-ink/10 bg-white p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/10">
                    <v.icon className="h-6 w-6 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WhyRayvia />
      <Newsletter />
    </>
  );
}
