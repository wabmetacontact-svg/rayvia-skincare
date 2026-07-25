export type Product = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  benefits: string[];
  ingredients: { name: string; desc: string }[];
  usage: string[];
  faqs: { q: string; a: string }[];
  inStock: boolean;
  featured: boolean;
  size: string;
  shippingCharge?: number;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "glow-renew-de-tan-scrub",
    name: "Glow Renew De-Tan Scrub",
    tagline: "Brightening exfoliating scrub",
    description:
      "A luxurious cream-based scrub that gently buffs away dead skin and stubborn tan. Enriched with kojic acid, niacinamide and walnut shell powder, it reveals visibly brighter, smoother and more even-toned skin after every wash.",
    price: 499,
    mrp: 799,
    image: "/images/products/glow-renew-de-tan-scrub.png",
    gallery: [
      "/images/products/glow-renew-de-tan-scrub.png",
      "/images/products/glow-renew-de-tan-scrub-2.png",
      "/images/products/glow-renew-de-tan-scrub-3.png",
    ],
    rating: 4.8,
    reviewCount: 1240,
    benefits: [
      "Removes sun tan & dead skin cells",
      "Evens out skin tone & texture",
      "Reduces dark spots & pigmentation",
      "Leaves skin soft, smooth & glowing",
    ],
    ingredients: [
      { name: "Kojic Acid", desc: "Lightens tan & pigmentation by inhibiting melanin." },
      { name: "Niacinamide 5%", desc: "Brightens, balances oil & strengthens barrier." },
      { name: "Walnut Shell Powder", desc: "Gentle physical exfoliant for smooth skin." },
      { name: "Aloe Vera Extract", desc: "Soothes, hydrates & calms irritation." },
    ],
    usage: [
      "On damp face, apply a small amount of scrub.",
      "Gently massage in circular motions for 60 seconds.",
      "Rinse thoroughly with lukewarm water.",
      "Use 2-3 times a week for best results.",
    ],
    faqs: [
      { q: "Is this scrub suitable for sensitive skin?", a: "Yes. It uses gentle, round walnut particles and soothing aloe. Patch test recommended for highly sensitive skin." },
      { q: "How often should I use it?", a: "Use 2-3 times per week. Over-exfoliation can cause irritation." },
      { q: "Can men use this scrub?", a: "Absolutely. Rayvia is formulated for all skin types and genders." },
    ],
    inStock: true,
    featured: true,
    size: "100g",
  },
  {
    id: 2,
    slug: "radiance-de-tan-face-pack",
    name: "Radiance De-Tan Face Pack",
    tagline: "Clay-based brightening mask",
    description:
      "A cooling clay mask that draws out impurities and lightens tan in minutes. Formulated with kaolin clay, liquorice extract and vitamin C, it delivers an instant glow while deeply cleansing pores.",
    price: 599,
    mrp: 899,
    image: "/images/products/radiance-de-tan-face-pack.png",
    gallery: [
      "/images/products/radiance-de-tan-face-pack.png",
      "/images/products/radiance-de-tan-face-pack-2.png",
      "/images/products/radiance-de-tan-face-pack-3.png",
    ],
    rating: 4.7,
    reviewCount: 860,
    benefits: [
      "Instant de-tan & brightening effect",
      "Deep cleanses pores & removes impurities",
      "Reduces dullness & revives radiance",
      "Cools & refreshes tired skin",
    ],
    ingredients: [
      { name: "Kaolin Clay", desc: "Draws out impurities & excess oil without drying." },
      { name: "Liquorice Extract", desc: "Natural skin lightener that fades tan." },
      { name: "Vitamin C", desc: "Antioxidant that brightens & boosts collagen." },
      { name: "Cucumber Extract", desc: "Cools, soothes & hydrates the skin." },
    ],
    usage: [
      "Apply an even layer on clean, dry face.",
      "Leave on for 10-15 minutes until dry.",
      "Rinse off with gentle circular motions.",
      "Follow with a moisturiser. Use once or twice a week.",
    ],
    faqs: [
      { q: "Will it dry out my skin?", a: "No. Kaolin clay is non-stripping and the formula includes hydrating cucumber extract." },
      { q: "How soon will I see results?", a: "Most users notice an instant glow and lighter tan after the first use." },
      { q: "Can it be used on the body?", a: "It is formulated for the face but works well on the neck and underarms too." },
    ],
    inStock: true,
    featured: true,
    size: "120g",
  },
  {
    id: 3,
    slug: "even-tone-de-tan-serum",
    name: "Even Tone De-Tan Serum",
    tagline: "Daily brightening treatment",
    description:
      "A lightweight, fast-absorbing serum that fades tan and dark spots over time. Powered by tranexamic acid, alpha arbutin and vitamin E, it delivers an even, luminous complexion with daily use.",
    price: 699,
    mrp: 999,
    image: "/images/products/even-tone-de-tan-serum.png",
    gallery: [
      "/images/products/even-tone-de-tan-serum.png",
      "/images/products/even-tone-de-tan-serum-2.png",
      "/images/products/even-tone-de-tan-serum-3.png",
    ],
    rating: 4.9,
    reviewCount: 1530,
    benefits: [
      "Fades dark spots & uneven tan",
      "Evens skin tone with daily use",
      "Hydrates & plumps the skin",
      "Protects against environmental damage",
    ],
    ingredients: [
      { name: "Tranexamic Acid 3%", desc: "Reduces pigmentation & melasma effectively." },
      { name: "Alpha Arbutin 2%", desc: "Inhibits melanin to lighten dark spots." },
      { name: "Vitamin E", desc: "Antioxidant that nourishes & repairs skin." },
      { name: "Hyaluronic Acid", desc: "Deeply hydrates & plumps the skin." },
    ],
    usage: [
      "After cleansing, apply 3-4 drops to face & neck.",
      "Gently pat into skin until fully absorbed.",
      "Follow with moisturiser and SPF in the morning.",
      "Use daily, AM & PM, for visible results in 4 weeks.",
    ],
    faqs: [
      { q: "Can I use this with other actives?", a: "Yes, but avoid pairing with retinol on the same night. Layer with moisturiser." },
      { q: "Is it safe for daily use?", a: "Yes. The formula is gentle and designed for daily AM/PM use." },
      { q: "Should I use sunscreen with this?", a: "Always. Brightening actives increase sun sensitivity, so SPF is essential." },
    ],
    inStock: true,
    featured: true,
    size: "30ml",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(slug: string, limit = 2): Product[] {
  return products.filter((p) => p.slug !== slug).slice(0, limit);
}
