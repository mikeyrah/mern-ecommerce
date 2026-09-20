import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Droplets, Leaf, Search, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";
import { botaniCollections } from "../data/brands";

const categories = [
  { label: "Shop All", filter: "all" },
  { label: "Bath & Body", filter: "bath-body" },
  { label: "Seasonal", filter: "seasonal" },
  { label: "Men", filter: "men" },
  { label: "Baby", filter: "baby" },
  { label: "Lip Gloss", filter: "lip-gloss" },
];

const rituals = [
  {
    title: "Bath & body",
    copy: "Bar soaps, bath bombs, balms, polishes, and scrubs for everyday care.",
    group: "bath-body",
    tone: "bg-[#dfe9db]",
    icon: Sparkles,
  },
  {
    title: "For him",
    copy: "Grounded essentials including beard oil, whipped butter, and massage oil.",
    group: "men",
    tone: "bg-[#efe5d5]",
    icon: Leaf,
  },
  {
    title: "Lip ritual",
    copy: "Original and seasonal glosses made for effortless shine.",
    group: "lip-gloss",
    tone: "bg-[#e5dfeb]",
    icon: Droplets,
  },
];

const BotaniEvePage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [activeGroup, setActiveGroup] = useState("all");
  const [activeCollection, setActiveCollection] = useState("all");

  useEffect(() => {
    fetchProductsByBrand("botani-eve");
  }, [fetchProductsByBrand]);

  const availableCollections = useMemo(
    () => activeGroup === "all" ? botaniCollections : botaniCollections.filter((item) => item.group === activeGroup),
    [activeGroup]
  );

  const visibleProducts = useMemo(() => {
    if (activeCollection !== "all") return products.filter((product) => product.category === activeCollection);
    if (activeGroup === "all") return products;
    const groupCategories = new Set(botaniCollections.filter((item) => item.group === activeGroup).map((item) => item.slug));
    return products.filter((product) => groupCategories.has(product.category));
  }, [activeCollection, activeGroup, products]);

  const selectGroup = (group) => {
    setActiveGroup(group);
    setActiveCollection("all");
    document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f8f6ef] text-[#203128]">
      <p className="bg-[#314b3b] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8f6ef]">
        Botanical care, thoughtfully made · Free shipping over $75
      </p>

      <header className="border-b border-[#d9ded5] bg-[#fbfaf6]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button className="text-[#314b3b] md:hidden" aria-label="Search">
            <Search size={20} />
          </button>
          <Link to="/brands/botani-eve" className="text-center">
            <span className="block font-serif text-3xl font-semibold tracking-[0.08em] text-[#294233] sm:text-4xl">BOTANI EVE</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.36em] text-[#718074]">Rooted in ritual</span>
          </Link>
          <div className="flex items-center gap-4 text-[#314b3b]">
            <Search className="hidden md:block" size={20} />
            <UserRound size={20} />
            <ShoppingBag size={20} />
          </div>
        </div>

        <nav className="botani-nav mx-auto flex max-w-5xl items-center justify-start gap-7 overflow-x-auto px-5 pb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#46584c] sm:justify-center sm:px-8" aria-label="Botani Eve shop categories">
          {categories.map((category) => (
            <button key={category.label} type="button" onClick={() => selectGroup(category.filter)} className={`whitespace-nowrap border-b pb-1 transition ${activeGroup === category.filter ? "border-[#314b3b] text-[#203128]" : "border-transparent hover:text-[#9a6d45]"}`}>
              {category.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="botani-hero relative isolate overflow-hidden">
        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 px-7 py-20 sm:px-12 lg:px-20">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6d806f]">The everyday ritual</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] text-[#203128] sm:text-7xl">
              Skin care that feels like coming home.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#58675d] sm:text-lg">
              Plant-forward formulas, comforting textures, and simple rituals created to bring your skin—and your day—back into balance.
            </p>
            <a href="#collection" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#314b3b] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263d30]">
              Shop Botani Eve <ArrowRight size={17} />
            </a>
          </div>

          <div className="botani-still-life relative min-h-[430px] self-stretch md:min-h-[560px]" aria-label="Botani Eve botanical skincare collection">
            <div className="botani-sun" />
            <div className="botani-leaf botani-leaf-one" />
            <div className="botani-leaf botani-leaf-two" />
            <div className="botani-bottle botani-bottle-tall">
              <span>BOTANI<br />EVE</span>
              <small>BODY OIL</small>
            </div>
            <div className="botani-bottle botani-bottle-short">
              <span>BOTANI<br />EVE</span>
              <small>DAILY DEW</small>
            </div>
            <div className="botani-jar">
              <span>BOTANI EVE</span>
              <small>RESTORE</small>
            </div>
          </div>
        </div>
      </section>

      <section id="rituals" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Shop by ritual</p>
          <h2 className="mt-3 font-serif text-4xl text-[#203128] sm:text-5xl">Care for every part of you</h2>
          <p className="mt-4 leading-7 text-[#647168]">No complicated routines. Just considered formulas for face, body, and quieter moments.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {rituals.map(({ title, copy, group, tone, icon: Icon }) => (
            <button type="button" key={title} onClick={() => selectGroup(group)} className={`${tone} group rounded-[1.75rem] p-8 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(49,75,59,0.12)]`}>
              <Icon size={25} strokeWidth={1.5} className="text-[#506755]" />
              <h3 className="mt-16 font-serif text-3xl text-[#263b2e]">{title}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-[#5f6c63]">{copy}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#3f5947]">Explore <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => selectGroup("baby")} className="group mt-5 grid w-full overflow-hidden rounded-[1.75rem] bg-[#e8eee7] text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(49,75,59,0.12)] sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="p-8 sm:p-10">
            <Leaf size={25} strokeWidth={1.5} className="text-[#66806c]" />
            <h3 className="mt-8 font-serif text-3xl text-[#263b2e]">Gentle care for baby</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f6c63]">Soft, comforting essentials for delicate skin—from bath time to bedtime.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#3f5947]">Explore baby care <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
          </div>
          <div className="flex min-h-44 items-center justify-center bg-[#d7e2d5] px-14 text-[#4f6b56] sm:min-h-full">
            <span className="rounded-full border border-[#8fa393] p-7 font-serif text-3xl">Baby</span>
          </div>
        </button>
      </section>

      <section id="collection" className="border-y border-[#dce0d8] bg-white/70 px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">The collection</p>
              <h2 className="mt-3 font-serif text-4xl text-[#203128] sm:text-5xl">Botanical essentials</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#6a756d]">Small-batch care designed for consistency, comfort, and a little everyday beauty.</p>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter Botani Eve collections">
            <button type="button" onClick={() => setActiveCollection("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === "all" ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055] hover:border-[#718674]"}`}>
              All {activeGroup === "all" ? "products" : categories.find((item) => item.filter === activeGroup)?.label}
            </button>
            {availableCollections.map((collection) => (
              <button type="button" key={collection.slug} onClick={() => setActiveCollection(collection.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === collection.slug ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055] hover:border-[#718674]"}`}>
                {collection.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#e8ece5]" />)}
            </div>
          ) : visibleProducts.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#bfcbbf] bg-[#f2f5ef] px-6 py-14 text-center">
              <Leaf className="mx-auto text-[#78907b]" strokeWidth={1.5} />
              <h3 className="mt-4 font-serif text-2xl text-[#314b3b]">This collection is taking root</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68746b]">Products assigned to this collection will appear here as soon as they are added.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#314b3b] px-5 py-16 text-center text-[#f8f6ef] sm:px-8">
        <Leaf className="mx-auto text-[#b9caae]" strokeWidth={1.4} />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#c5d1bd]">The Botani Eve promise</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Thoughtful ingredients. Unhurried rituals. Care that meets you where you are.</h2>
      </section>
    </main>
  );
};

export default BotaniEvePage;
