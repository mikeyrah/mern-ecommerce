export const blogPosts = [
  {
    slug: "the-art-of-an-everyday-ritual",
    category: "Living well",
    title: "The art of an everyday ritual",
    excerpt: "A beautiful routine does not have to be elaborate. It only needs to help you return to yourself.",
    date: "September 24, 2026",
    readTime: "4 min read",
    accent: "#6f856c",
    soft: "#dfe8db",
    pullQuote: "The best rituals are the ones that fit gently into the life you already have.",
    sections: [
      ["Begin with one small pause", "Choose a moment that already exists: the quiet after a shower, the first cup of tea, or the few minutes before bed. Attach one thoughtful action to it. A body butter, a candle, or a favorite piece of clothing can become a cue to slow down."],
      ["Let your senses lead", "Texture, scent, warmth, and color help an ordinary routine feel intentional. Keep the things you love within reach and give yourself permission to enjoy them without waiting for a special occasion."],
      ["Make room for change", "Ritual is not rigidity. What restores you in one season may shift in the next. Keep what feels grounding, release what feels like another obligation, and let the practice grow with you."],
    ],
  },
  {
    slug: "inside-botani-eves-small-batch-philosophy",
    category: "Behind the brand",
    title: "Inside Botani Eve’s small-batch philosophy",
    excerpt: "Why considered quantities, sensory details, and a slower pace shape every Botani Eve collection.",
    date: "September 17, 2026",
    readTime: "5 min read",
    accent: "#9a6d45",
    soft: "#eadfce",
    pullQuote: "Small batches leave room for attention—the kind you can feel in the finished ritual.",
    sections: [
      ["Made with attention", "Working in considered runs creates space to notice the details: how a texture settles, how a scent opens, and how each product feels in the hand. It is a practical choice and a creative one."],
      ["Collections that follow the season", "Botani Eve’s core rituals offer consistency, while seasonal releases make room for play. Warm spice, orchard fruit, soft florals, and grounding botanicals can mark a moment without crowding the everyday collection."],
      ["Care beyond the formula", "The experience includes more than what is inside the jar. Clear instructions, thoughtful presentation, and responsive customer care are all part of making a product feel personal."],
    ],
  },
  {
    slug: "a-gentler-way-to-welcome-autumn",
    category: "Seasonal notes",
    title: "A gentler way to welcome autumn",
    excerpt: "Warm light, layered textures, and botanical comfort for the softer days ahead.",
    date: "September 10, 2026",
    readTime: "3 min read",
    accent: "#783f2f",
    soft: "#e8d1bc",
    pullQuote: "A season can change the atmosphere of a room—and the pace of a day.",
    sections: [
      ["Change the light first", "As evenings arrive earlier, softer pools of light can make home feel welcoming. A candle near the place where you unwind is often enough to shift the mood."],
      ["Layer comfort, not clutter", "A hand cream by the sink, a favorite throw, or a bath soak set out before you need it creates comfort without asking for a full seasonal reset."],
      ["Choose a scent memory", "Look for one note that feels like the season to you—fig, spice, woods, fruit, or something green. Let it repeat quietly through the spaces and routines you use most."],
    ],
  },
];

export const getBlogPost = (slug) => blogPosts.find((post) => post.slug === slug);
