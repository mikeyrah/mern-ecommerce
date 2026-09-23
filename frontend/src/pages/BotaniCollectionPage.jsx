import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Baby, Flower2, Leaf, Search, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { botaniCollections } from "../data/brands";
import { useProductStore } from "../stores/useProductStore";

const pageConfigs = {
  seasonal: {
    eyebrow: "Limited seasonal rituals",
    title: "Made for this moment.",
    description: "Small-batch scents, colors, and textures inspired by the season—here for a beautiful time, not a long time.",
    categories: ["seasonal-hard-bar-soap", "seasonal-bath-bombs", "seasonal-lip-gloss"],
    icon: Sparkles,
    hero: "bg-[#eee3d6]",
    art: "bg-[#dcc5ad]",
    accent: "text-[#815f45]",
  },
  men: {
    eyebrow: "Botani Eve for men",
    title: "Simple care. Grounded confidence.",
    description: "Straightforward daily essentials made to condition, soften, and restore—from beard care to full-body moisture.",
    categories: ["men", "mens-beard-oil", "whipped-butter", "mens-massage-oil"],
    icon: Leaf,
    hero: "bg-[#dde4dc]",
    art: "bg-[#aebdaf]",
    accent: "text-[#3f5d48]",
  },
  baby: {
    eyebrow: "Botani Eve baby",
    title: "Tender care for delicate skin.",
    description: "Comforting bath and body essentials created for gentle routines, tiny toes, and the softest everyday moments.",
    categories: ["baby-wash", "baby-butter", "baby-oil", "diaper-balm"],
    icon: Baby,
    hero: "bg-[#e8eee7]",
    art: "bg-[#ceddce]",
    accent: "text-[#58715d]",
  },
  "lip-gloss": {
    eyebrow: "The gloss edit",
    title: "A little shine, naturally.",
    description: "Comfortable, polished glosses in original favorites and limited seasonal shades for an effortless finishing touch.",
    categories: ["lip-gloss", "seasonal-lip-gloss"],
    icon: Flower2,
    hero: "bg-[#f0e2df]",
    art: "bg-[#d9bdb9]",
    accent: "text-[#875f61]",
  },
};

const BotaniCollectionPage = () => {
  const { collection } = useParams();
  const config = pageConfigs[collection];
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [activeCollection, setActiveCollection] = useState("all");

  useEffect(() => {
    if (config) fetchProductsByBrand("botani-eve");
  }, [config, fetchProductsByBrand]);

  useEffect(() => setActiveCollection("all"), [collection]);

  const collectionOptions = useMemo(() => {
    if (!config) return [];
    return config.categories.map((slug) => botaniCollections.find((item) => item.slug === slug)).filter(Boolean);
  }, [config]);

  const visibleProducts = useMemo(() => {
    if (!config) return [];
    const allowed = new Set(config.categories);
    if (collection === "men") allowed.add("mens-whipped-butter");
    return products.filter((product) => {
      if (activeCollection === "all") return allowed.has(product.category);
      return product.category === activeCollection || (activeCollection === "whipped-butter" && product.category === "mens-whipped-butter");
    });
  }, [activeCollection, collection, config, products]);

  if (!config) {
    return <main className="min-h-[70vh] bg-[#f8f6ef] px-6 py-32 text-center"><h1 className="font-serif text-4xl text-[#203128]">Collection not found</h1><Link to="/brands/botani-eve" className="mt-6 inline-flex text-sm font-semibold text-[#58715d]">Return to Botani Eve</Link></main>;
  }

  const ArtIcon = config.icon;

  return (
    <main className="min-h-screen bg-[#f8f6ef] text-[#203128]">
      <p className="bg-[#314b3b] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8f6ef]">Botanical care, thoughtfully made · Free shipping over $75</p>

      <header className="border-b border-[#d9ded5] bg-[#fbfaf6]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/brands/botani-eve" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#526457]"><ArrowLeft size={17} /> <span className="hidden sm:inline">Botani Eve</span></Link>
          <Link to="/brands/botani-eve" className="text-center"><span className="block font-serif text-3xl font-semibold tracking-[0.08em] text-[#294233] sm:text-4xl">BOTANI EVE</span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.36em] text-[#718074]">Rooted in ritual</span></Link>
          <div className="flex items-center gap-4 text-[#314b3b]"><Search size={19} /><UserRound className="hidden sm:block" size={19} /><ShoppingBag size={19} /></div>
        </div>
        <nav className="botani-nav mx-auto flex max-w-5xl items-center justify-start gap-7 overflow-x-auto px-5 pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#667469] sm:justify-center" aria-label="Botani Eve collections">
          <Link to="/brands/botani-eve" className="whitespace-nowrap hover:text-[#314b3b]">Shop all</Link>
          <Link to="/brands/botani-eve/bath-body" className="whitespace-nowrap hover:text-[#314b3b]">Bath &amp; body</Link>
          <Link to="/brands/botani-eve/seasonal" className="whitespace-nowrap hover:text-[#314b3b]">Seasonal</Link>
          <Link to="/brands/botani-eve/men" className={`whitespace-nowrap ${collection === "men" ? "border-b border-[#314b3b] pb-1 text-[#203128]" : "hover:text-[#314b3b]"}`}>Men</Link>
          <Link to="/brands/botani-eve/baby" className={`whitespace-nowrap ${collection === "baby" ? "border-b border-[#314b3b] pb-1 text-[#203128]" : "hover:text-[#314b3b]"}`}>Baby</Link>
          <Link to="/brands/botani-eve/lip-gloss" className={`whitespace-nowrap ${collection === "lip-gloss" ? "border-b border-[#314b3b] pb-1 text-[#203128]" : "hover:text-[#314b3b]"}`}>Lip gloss</Link>
          <Link to="/brands/botani-eve/home-scents" className="whitespace-nowrap hover:text-[#314b3b]">Home scents</Link>
        </nav>
      </header>

      <section className={`overflow-hidden ${config.hero}`}>
        <div className="mx-auto grid max-w-7xl md:grid-cols-[1fr_0.85fr]">
          <div className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
            <p className={`text-xs font-bold uppercase tracking-[0.24em] ${config.accent}`}>{config.eyebrow}</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-[#203128] sm:text-6xl">{config.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5c6c61]">{config.description}</p>
          </div>
          <div className={`relative flex min-h-72 items-center justify-center overflow-hidden md:min-h-full ${config.art}`}>
            <div className="absolute -right-12 -top-16 h-72 w-72 rounded-full bg-white/35" />
            <div className="absolute bottom-[12%] left-[12%] h-36 w-36 rounded-full border border-white/45" />
            <ArtIcon className={`relative z-10 h-36 w-36 ${config.accent}`} strokeWidth={0.65} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Explore the collection</p><h2 className="mt-3 font-serif text-4xl capitalize text-[#203128] sm:text-5xl">{collection.replaceAll("-", " ")}</h2></div>
          <p className="max-w-md text-sm leading-6 text-[#67746b]">Choose a product line or browse the complete collection.</p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-3" aria-label={`Filter ${collection.replaceAll("-", " ")} products`}>
          <button type="button" onClick={() => setActiveCollection("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === "all" ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055]"}`}>Shop all</button>
          {collectionOptions.map((option) => <button type="button" key={option.slug} onClick={() => setActiveCollection(option.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === option.slug ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055] hover:border-[#718674]"}`}>{option.label}</button>)}
        </div>

        {loading ? (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#e2e9df]" />)}</div>
        ) : visibleProducts.length ? (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <div className="mt-9 rounded-[1.75rem] border border-dashed border-[#bfcbbf] bg-[#f1f4ee] px-6 py-14 text-center"><ArtIcon className={`mx-auto ${config.accent}`} strokeWidth={1.2} /><h3 className="mt-4 font-serif text-2xl text-[#314b3b]">This collection is being prepared</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68746b]">Products will appear here as soon as they are added in the Brand Studio.</p></div>
        )}
      </section>
    </main>
  );
};

export default BotaniCollectionPage;
