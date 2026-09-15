export const brands = [
  {
    slug: "botani-eve",
    name: "Botani Eve",
    eyebrow: "Rituals for radiant skin",
    description: "Small-batch skincare made for slow, intentional moments of care.",
    accent: "#7C9279",
    soft: "#E6EEE3",
    categories: ["skincare", "body-care", "self-care"],
  },
  {
    slug: "the-krafted-charm",
    name: "The Krafted Charm",
    eyebrow: "Made to be worn your way",
    description: "Handmade apparel and everyday pieces with personal character.",
    accent: "#B58A34",
    soft: "#F6EBD2",
    categories: ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"],
  },
  {
    slug: "the-velvet-bakery",
    name: "The Velvet Bakery",
    eyebrow: "A little luxury, freshly made",
    description: "Thoughtful desserts and sweet treats for every beautiful occasion.",
    accent: "#9A6670",
    soft: "#F5E7E5",
    categories: ["cakes", "cookies", "treats"],
  },
];

export const getBrand = (slug) => brands.find((brand) => brand.slug === slug);
