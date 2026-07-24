import { Award, Leaf, FlaskConical, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/Reveal";

const REASONS = [
  {
    icon: FlaskConical,
    title: "Clinically Inspired",
    desc: "Formulations developed with dermatologically-tested, clinically-proven actives.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Luxury-grade ingredients and packaging at honest, accessible prices.",
  },
  {
    icon: Leaf,
    title: "Clean & Conscious",
    desc: "Vegan, cruelty-free, and free from harmful chemicals. Made with care.",
  },
  {
    icon: HeartHandshake,
    title: "Made for India",
    desc: "Designed specifically for Indian skin tones and tropical climate conditions.",
  },
];

export function WhyRayvia() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-cream">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              The Rayvia Difference
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">
              Premium skincare, reimagined for India
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream/60">
              We believe great skincare should be effective, ethical and accessible.
              Rayvia brings you the best of science and nature in every drop.
            </p>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.1}>
              <div className="h-full rounded-[20px] border border-cream/10 bg-cream/5 p-6 transition-all duration-300 hover:border-gold/30 hover:bg-cream/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15">
                  <r.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
