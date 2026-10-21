import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Glasses, ShoppingBag, Sparkles, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";

const collections = [
  { slug: "jeans", label: "Jeans", copy: "Everyday denim with character and an easy, lived-in feel." },
  { slug: "t-shirts", label: "T-Shirts", copy: "Statement tees and versatile staples made to style your way." },
  { slug: "jackets", label: "Jackets", copy: "The finishing layer that brings the whole look together." },
  { slug: "suits", label: "Suits", copy: "Polished sets for moments that call for something memorable." },
  { slug: "shoes", label: "Shoes", copy: "Comfortable pairs selected to move through every kind of day." },
  { slug: "bags", label: "Bags", copy: "Carry-all favorites with room for the things that matter." },
  { slug: "glasses", label: "Glasses", copy: "Expressive frames that add instant personality." },
];

const KraftedCharmPage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [activeCollection, setActiveCollection] = useState("all");

  useEffect(() => {
    fetchProductsByBrand("the-krafted-charm");
  }, [fetchProductsByBrand]);

  const visibleProducts = useMemo(
    () => activeCollection === "all" ? products : products.filter((product) => product.category === activeCollection),
    [activeCollection, products]
  );

  const chooseCollection = (slug) => {
    setActiveCollection(slug);
    document.querySelector("#krafted-collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#2f2923]">
      <p className="bg-[#241f1b] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8ead0]">
        Personal style, thoughtfully krafted · Free shipping over $75
      </p>

      <header className="border-b border-[#d8c8ad] bg-[#fffaf1]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Link to="/" className="text-xs font-bold uppercase tracking-[0.15em] text-[#795f3b]">Stewart-Tate &amp; Co.</Link>
          <Link to="/brands/the-krafted-charm" className="text-center">
            <span className="block font-serif text-3xl font-semibold tracking-[0.03em] text-[#31271f] sm:text-4xl">The Krafted Charm</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.34em] text-[#9b7440]">Wear it your way</span>
          </Link>
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#795f3b]"><ShoppingBag size={18} /><span className="hidden sm:inline">Bag</span></Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-7 overflow-x-auto px-5 pb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6e5d4c] sm:justify-center sm:px-8" aria-label="The Krafted Charm collections">
          <button type="button" onClick={() => chooseCollection("all")} className={`shrink-0 border-b pb-1 ${activeCollection === "all" ? "border-[#a87835] text-[#33271d]" : "border-transparent"}`}>Shop all</button>
          {collections.map((collection) => <button type="button" key={collection.slug} onClick={() => chooseCollection(collection.slug)} className={`shrink-0 border-b pb-1 transition hover:text-[#a87835] ${activeCollection === collection.slug ? "border-[#a87835] text-[#33271d]" : "border-transparent"}`}>{collection.label}</button>)}
        </nav>
      </header>

      <section className="relative isolate overflow-hidden border-b border-[#d9c7a8] bg-[#dcc39b]">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full border-[55px] border-[#efd9b5]/60" />
        <div className="absolute -bottom-32 right-[32%] h-72 w-72 rounded-full bg-[#b98a4d]/25" />
        <div className="relative mx-auto grid min-h-[570px] max-w-7xl items-center md:grid-cols-[1fr_0.9fr]">
          <div className="z-10 px-7 py-20 sm:px-12 lg:px-20">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#76542f]">The new everyday edit</p>
            <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[0.97] tracking-[-0.04em] text-[#2f251d] sm:text-7xl">A little charm changes everything.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#655240] sm:text-lg">Expressive apparel and accessories selected for real life—easy to wear, effortless to mix, and always personal.</p>
            <a href="#krafted-collection" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#2f2923] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#493a2c]">Shop the edit <ArrowRight size={17} /></a>
          </div>
          <div className="relative flex min-h-[430px] items-center justify-center self-stretch overflow-hidden md:min-h-[570px]">
            <div className="absolute h-[380px] w-[265px] rotate-6 rounded-[2.5rem] border border-white/60 bg-[#f7ead3] shadow-[0_28px_70px_rgba(69,48,27,0.18)]" />
            <div className="absolute h-[335px] w-[225px] -translate-x-10 -rotate-6 rounded-[2rem] bg-[#4c3b2f] shadow-2xl" />
            <div className="relative z-10 flex h-56 w-40 flex-col items-center justify-center rounded-t-[4.5rem] rounded-b-3xl border border-[#d6b57d] bg-[#fff8ec] text-center shadow-xl">
              <Sparkles className="text-[#b18443]" size={27} strokeWidth={1.4} />
              <span className="mt-5 font-serif text-2xl leading-tight">Krafted<br />Charm</span>
              <span className="mt-4 text-[8px] font-bold uppercase tracking-[0.28em] text-[#8b6d47]">Original style</span>
            </div>
            <div className="absolute bottom-14 right-10 z-20 rounded-full border border-[#d4b277] bg-[#f9e3b7] p-5 shadow-lg sm:right-20"><Glasses className="text-[#644a2f]" size={38} strokeWidth={1.3} /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a0743a]">Find your favorite</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">Style starts with one good piece.</h2><p className="mt-4 leading-7 text-[#746555]">Build a look around the pieces that feel most like you.</p></div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 4).map((collection, index) => (
            <button type="button" key={collection.slug} onClick={() => chooseCollection(collection.slug)} className={`group min-h-64 rounded-[1.75rem] p-7 text-left transition hover:-translate-y-1 hover:shadow-xl ${index % 2 ? "bg-[#332a24] text-[#fff8ec]" : "border border-[#decdb1] bg-[#fffaf1]"}`}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${index % 2 ? "bg-white/10 text-[#e5c58f]" : "bg-[#f0dfc3] text-[#9a6c32]"}`}>{index === 3 ? <Star size={20} /> : <Tag size={20} />}</span>
              <h3 className="mt-14 font-serif text-3xl">{collection.label}</h3>
              <p className={`mt-3 text-sm leading-6 ${index % 2 ? "text-[#d8cab9]" : "text-[#746555]"}`}>{collection.copy}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">Shop now <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
      </section>

      <section id="krafted-collection" className="border-y border-[#ddd0bb] bg-[#fffaf3] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a0743a]">The collection</p><h2 className="mt-3 font-serif text-4xl capitalize sm:text-5xl">{activeCollection === "all" ? "Made for your everyday" : collections.find((item) => item.slug === activeCollection)?.label}</h2></div><p className="max-w-sm text-sm leading-6 text-[#74685c]">Pieces added in your admin dashboard appear here automatically.</p></div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter The Krafted Charm products">
            <button type="button" onClick={() => setActiveCollection("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${activeCollection === "all" ? "border-[#332a24] bg-[#332a24] text-white" : "border-[#d7c6aa] bg-white"}`}>All pieces</button>
            {collections.map((collection) => <button type="button" key={collection.slug} onClick={() => setActiveCollection(collection.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === collection.slug ? "border-[#332a24] bg-[#332a24] text-white" : "border-[#d7c6aa] bg-white hover:border-[#aa7c42]"}`}>{collection.label}</button>)}
          </div>
          {loading ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#eadfcd]" />)}</div> : visibleProducts.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#cdbb9d] bg-[#f8efe1] px-6 py-14 text-center"><Sparkles className="mx-auto text-[#a67a42]" strokeWidth={1.3} /><h3 className="mt-4 font-serif text-2xl">This edit is being krafted</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#766757]">Add products to this category in the admin dashboard and they will appear here.</p></div>}
        </div>
      </section>

      <section className="bg-[#2f2923] px-5 py-16 text-center text-[#fff8ec] sm:px-8"><Sparkles className="mx-auto text-[#d6af74]" strokeWidth={1.3} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#d6b98d]">The Krafted Charm point of view</p><h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Wear what makes you feel unmistakably like yourself.</h2></section>
    </main>
  );
};

export default KraftedCharmPage;
