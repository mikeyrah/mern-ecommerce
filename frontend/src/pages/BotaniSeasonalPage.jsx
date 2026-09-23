import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Clock3,
  Flower2,
  Leaf,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";

const seasonalCollections = [
  {
    slug: "seasonal-hard-bar-soap",
    label: "Seasonal soaps",
    eyebrow: "The cleansing ritual",
    description: "Creamy small-batch bars wrapped in the warm, grounding notes of the season.",
    icon: Leaf,
    tone: "bg-[#d9b792]",
    ink: "text-[#67472f]",
  },
  {
    slug: "seasonal-bath-bombs",
    label: "Seasonal bath bombs",
    eyebrow: "The soaking ritual",
    description: "Fizzy, fragrant moments made for early sunsets and nowhere else to be.",
    icon: Bath,
    tone: "bg-[#b9c4ad]",
    ink: "text-[#3d5642]",
  },
  {
    slug: "seasonal-lip-gloss",
    label: "Seasonal lip gloss",
    eyebrow: "The finishing ritual",
    description: "Comfortable shine in limited shades inspired by berries, spice, and soft light.",
    icon: Flower2,
    tone: "bg-[#c99c94]",
    ink: "text-[#6f4141]",
  },
];

const BotaniSeasonalPage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [activeCollection, setActiveCollection] = useState("all");

  useEffect(() => {
    fetchProductsByBrand("botani-eve");
  }, [fetchProductsByBrand]);

  const visibleProducts = useMemo(() => {
    const seasonalSlugs = new Set(seasonalCollections.map(({ slug }) => slug));
    return products.filter((product) =>
      activeCollection === "all"
        ? seasonalSlugs.has(product.category)
        : product.category === activeCollection
    );
  }, [activeCollection, products]);

  const chooseCollection = (slug) => {
    setActiveCollection(slug);
    document.querySelector("#seasonal-products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#2d352c]">
      <p className="bg-[#783f2f] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fff8ed] sm:text-[11px]">
        The autumn edit · Poured, pressed, and polished in limited batches
      </p>

      <header className="border-b border-[#ded2c1] bg-[#fbf7ef]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/brands/botani-eve" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5b665c]">
            <ArrowLeft size={17} /> <span className="hidden sm:inline">Botani Eve</span>
          </Link>
          <Link to="/brands/botani-eve" className="text-center">
            <span className="block font-serif text-3xl font-semibold tracking-[0.08em] text-[#294233] sm:text-4xl">BOTANI EVE</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.36em] text-[#718074]">Rooted in ritual</span>
          </Link>
          <div className="flex items-center gap-4 text-[#314b3b]">
            <Search size={19} />
            <UserRound className="hidden sm:block" size={19} />
            <ShoppingBag size={19} />
          </div>
        </div>
        <nav className="botani-nav mx-auto flex max-w-5xl items-center justify-start gap-7 overflow-x-auto px-5 pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#667469] sm:justify-center" aria-label="Botani Eve collections">
          <Link to="/brands/botani-eve" className="whitespace-nowrap hover:text-[#314b3b]">Shop all</Link>
          <Link to="/brands/botani-eve/bath-body" className="whitespace-nowrap hover:text-[#314b3b]">Bath &amp; body</Link>
          <span className="whitespace-nowrap border-b border-[#783f2f] pb-1 text-[#783f2f]">Seasonal</span>
          <Link to="/brands/botani-eve/men" className="whitespace-nowrap hover:text-[#314b3b]">Men</Link>
          <Link to="/brands/botani-eve/baby" className="whitespace-nowrap hover:text-[#314b3b]">Baby</Link>
          <Link to="/brands/botani-eve/lip-gloss" className="whitespace-nowrap hover:text-[#314b3b]">Lip gloss</Link>
          <Link to="/brands/botani-eve/home-scents" className="whitespace-nowrap hover:text-[#314b3b]">Home scents</Link>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden bg-[#d9b792]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,245,218,0.7),transparent_28%),linear-gradient(115deg,rgba(120,63,47,0.08),transparent_55%)]" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl md:grid-cols-[0.95fr_1.05fr]">
          <div className="z-10 flex items-center px-7 py-20 sm:px-12 lg:px-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#81503e]/25 bg-[#f8e9d3]/55 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#754837]">
                <Sparkles size={14} /> Autumn 2026
              </div>
              <h1 className="mt-7 max-w-xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-[#342d26] sm:text-7xl">
                A softer season <em className="font-normal text-[#7b4534]">begins.</em>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#655143] sm:text-lg">
                Gather into warm spice, orchard fruit, and comforting botanicals—small-batch rituals created for the slow glow of autumn.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href="#seasonal-products" className="inline-flex items-center gap-3 rounded-full bg-[#783f2f] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#663426]">
                  Shop the autumn edit <ArrowRight size={17} />
                </a>
                <a href="#seasonal-rituals" className="text-sm font-semibold text-[#684739] underline decoration-[#a67d66] underline-offset-4">Explore the rituals</a>
              </div>
            </div>
          </div>

          <div className="seasonal-still-life relative min-h-[440px] overflow-hidden md:min-h-full" aria-label="Botani Eve autumn bath and body collection">
            <div className="absolute left-[8%] top-[10%] h-64 w-64 rounded-full bg-[#f5dfad]/70 blur-sm" />
            <Leaf className="absolute -right-5 top-[2%] h-52 w-52 rotate-[38deg] text-[#7d8d62]/70" strokeWidth={0.65} />
            <Leaf className="absolute bottom-[2%] left-[4%] h-44 w-44 -rotate-[50deg] text-[#9c673f]/55" strokeWidth={0.7} />
            <div className="absolute bottom-[13%] left-[9%] right-[7%] h-16 rounded-[50%] bg-[#6a3c2e]/20 blur-xl" />

            <div className="absolute bottom-[18%] left-[15%] z-10 flex h-32 w-48 -rotate-6 items-center justify-center rounded-[2.5rem] bg-[#a8b291] shadow-[0_28px_55px_rgba(73,47,33,0.22)]">
              <div className="text-center text-[#324535]"><span className="font-serif text-lg tracking-[0.08em]">BOTANI EVE</span><small className="mt-2 block text-[7px] font-bold tracking-[0.22em]">HARVEST SOAK</small></div>
            </div>
            <div className="absolute bottom-[17%] left-[48%] z-20 flex h-64 w-36 rotate-3 items-center justify-center rounded-[2rem] bg-gradient-to-r from-[#7c4231] via-[#aa684f] to-[#6c382c] shadow-[0_30px_60px_rgba(73,47,33,0.3)]">
              <div className="rounded-sm border border-[#edd9bb]/45 px-5 py-8 text-center text-[#fff0dc]"><span className="font-serif text-xl leading-none">BOTANI<br />EVE</span><small className="mt-4 block text-[7px] font-bold tracking-[0.2em]">AUTUMN GLOW</small></div>
            </div>
            <div className="absolute bottom-[18%] right-[7%] z-10 flex h-40 w-32 -rotate-3 items-center justify-center rounded-[1.2rem] bg-[#efe1c8] shadow-[0_24px_50px_rgba(73,47,33,0.2)]">
              <div className="text-center text-[#704635]"><span className="font-serif text-base">BOTANI EVE</span><small className="mt-3 block text-[7px] font-bold tracking-[0.16em]">SPICED FIG</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfd3c2] bg-[#fffaf1]">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#dfd3c2] px-5 py-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="px-5 py-3"><Clock3 className="mx-auto text-[#915b45]" size={19} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#684739]">Here for a season</p><p className="mt-1 text-sm text-[#817166]">Available while each batch lasts</p></div>
          <div className="px-5 py-3"><Star className="mx-auto text-[#915b45]" size={19} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#684739]">Small-batch magic</p><p className="mt-1 text-sm text-[#817166]">Thoughtfully made in limited runs</p></div>
          <div className="px-5 py-3"><Leaf className="mx-auto text-[#915b45]" size={19} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#684739]">Botanical comfort</p><p className="mt-1 text-sm text-[#817166]">A ritual inspired by the harvest</p></div>
        </div>
      </section>

      <section id="seasonal-rituals" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a6048]">Three ways into the season</p>
            <h2 className="mt-3 font-serif text-4xl text-[#343b31] sm:text-5xl">Choose your autumn ritual</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#75685e]">Layer the collection or choose the small moment that feels most like yours.</p>
        </div>

        <div className="mt-11 grid gap-5 lg:grid-cols-3">
          {seasonalCollections.map(({ slug, label, eyebrow, description, icon: Icon, tone, ink }) => (
            <button type="button" key={slug} onClick={() => chooseCollection(slug)} className={`${tone} group relative min-h-[390px] overflow-hidden rounded-[1.75rem] p-8 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(86,57,40,0.16)]`}>
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/35" />
              <Icon className={`relative h-11 w-11 ${ink}`} strokeWidth={1.1} />
              <div className="absolute bottom-8 left-8 right-8">
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${ink}`}>{eyebrow}</p>
                <h3 className="mt-3 font-serif text-3xl leading-tight text-[#342f29]">{label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#594d44]">{description}</p>
                <span className={`mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${ink}`}>Shop the ritual <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="seasonal-products" className="border-y border-[#ded2c1] bg-[#fffaf3] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a6048]">Limited seasonal collection</p><h2 className="mt-3 font-serif text-4xl text-[#343b31] sm:text-5xl">The autumn edit</h2></div>
            <p className="max-w-md text-sm leading-6 text-[#75685e]">Made in small batches. When the season turns, so does the collection.</p>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-3" aria-label="Filter seasonal products">
            <button type="button" onClick={() => setActiveCollection("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === "all" ? "border-[#783f2f] bg-[#783f2f] text-white" : "border-[#d4c4b2] bg-white text-[#66574c] hover:border-[#9a6048]"}`}>Shop all seasonal</button>
            {seasonalCollections.map(({ slug, label }) => (
              <button type="button" key={slug} onClick={() => setActiveCollection(slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === slug ? "border-[#783f2f] bg-[#783f2f] text-white" : "border-[#d4c4b2] bg-white text-[#66574c] hover:border-[#9a6048]"}`}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#e8ded1]" />)}</div>
          ) : visibleProducts.length ? (
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div>
          ) : (
            <div className="mt-9 rounded-[1.75rem] border border-dashed border-[#cbb8a3] bg-[#f5eadc] px-6 py-16 text-center">
              <Leaf className="mx-auto text-[#9a6048]" strokeWidth={1.2} />
              <h3 className="mt-4 font-serif text-2xl text-[#553b30]">The next batch is steeping</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#79675b]">Seasonal products will appear here as soon as they are added in the Brand Studio.</p>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden bg-[#743d2f] text-[#fff7eb]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-72 bg-[#9b674d]">
            <div className="absolute left-[16%] top-[14%] h-48 w-48 rounded-full bg-[#d8b37e]/45" />
            <Leaf className="absolute bottom-[10%] left-[28%] h-44 w-44 -rotate-[32deg] text-[#d8c69d]" strokeWidth={0.55} />
            <Sparkles className="absolute right-[15%] top-[20%] h-24 w-24 text-[#f1d9a9]" strokeWidth={0.65} />
          </div>
          <div className="flex items-center px-7 py-16 sm:px-12 lg:px-16">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e4c9a8]">A note from the season</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">Keep the ritual. Let the season change around you.</h2><p className="mt-6 max-w-xl leading-7 text-[#eadbd0]">Botani Eve seasonal care is made to mark a moment—familiar comfort, a fleeting scent, and one more reason to slow down.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BotaniSeasonalPage;
