import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { products } from "@/lib/products";

export function Ingredients() {
  const allIngredients = products.flatMap((p) => p.ingredients);
  const unique = allIngredients.filter(
    (ing, i, arr) => arr.findIndex((x) => x.name === ing.name) === i
  );

  return (
    <section className="bg-beige py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Clean Ingredients"
          title="Powered by nature, backed by science"
          subtitle="We source the finest clinically-proven actives and combine them with soothing botanicals for effective, gentle formulations."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {unique.map((ing, i) => (
            <Reveal key={ing.name} delay={i * 0.08}>
              <div className="group h-full rounded-[20px] border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(17,17,17,0.15)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream">
                  <span className="font-heading text-lg font-bold text-gold-dark">
                    {ing.name.charAt(0)}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-base font-bold">{ing.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{ing.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
