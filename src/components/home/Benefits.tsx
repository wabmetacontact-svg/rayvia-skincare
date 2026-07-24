import { Sun, Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/Reveal";

const BENEFITS = [
  {
    icon: Sun,
    title: "Removes Sun Tan",
    desc: "Gently lifts away stubborn tan and pigmentation caused by sun exposure.",
  },
  {
    icon: Sparkles,
    title: "Brightens Skin",
    desc: "Evens out skin tone and reveals a visibly brighter, more radiant complexion.",
  },
  {
    icon: Droplets,
    title: "Deeply Hydrates",
    desc: "Nourishes and hydrates the skin barrier, leaving it soft and supple.",
  },
  {
    icon: ShieldCheck,
    title: "Gentle & Safe",
    desc: "Dermatologically tested, cruelty-free and suitable for all skin types.",
  },
];

export function Benefits() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why It Works"
          title="Science-backed tan removal"
          subtitle="Every Rayvia product is formulated with clinically-proven actives that deliver visible results without compromising on skin safety."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.1}>
              <div className="group h-full rounded-[20px] border border-ink/10 bg-cream p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_16px_40px_-16px_rgba(17,17,17,0.15)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                  <b.icon className="h-6 w-6 text-gold-dark" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
