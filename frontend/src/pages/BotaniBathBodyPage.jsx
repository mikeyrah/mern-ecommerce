import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Droplets, Leaf, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { botaniCollections } from "../data/brands";
import { useProductStore } from "../stores/useProductStore";

const bathBodyCollections = botaniCollections.filter((collection) => collection.group === "bath-body");

const BotaniBathBodyPage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [activeCollection, setActiveCollection] = useState("all");

  useEffect(() => {
    fetchProductsByBrand("botani-eve");
  }, [fetchProductsByBrand]);

  const visibleProducts = useMemo(() => {
    const bathBodySlugs = new Set(bathBodyCollections.map((collection) => collection.slug));
    return products.filter((product) =>
      activeCollection === "all"
        ? bathBodySlugs.has(product.category)
        : product.category === activeCollection
    );
  }, [activeCollection, products]);

  return (
    <main className="min-h-screen bg-[#f8f6ef] text-[#203128]">
      <p className="bg-[#314b3b] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f8f6ef]">
        Botanical care, thoughtfully made · Free shipping over $75
      </p>

      <header className="border-b border-[#d9ded5] bg-[#fbfaf6]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/brands/botani-eve" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#526457]">
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
      </header>

      <section className="overflow-hidden bg-[#e5ebe0]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[1fr_0.85fr]">
          <div className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#708474]">Bath &amp; body</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-[#203128] sm:text-6xl">Turn everyday care into a ritual.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5c6c61]">Cleansing bars, nourishing balms, joyful bath bombs, and smoothing body treatments made for skin that deserves a slower moment.</p>
          </div>
          <div className="relative min-h-72 overflow-hidden bg-[#cad8c4] md:min-h-full">
            <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-[#f6f0da]/80" />
            <Leaf className="absolute left-[18%] top-[18%] h-28 w-28 rotate-[-24deg] text-[#58745f]" strokeWidth={0.8} />
            <Droplets className="absolute bottom-[16%] right-[18%] h-32 w-32 text-[#6f8d79]" strokeWidth={0.65} />
            <div className="absolute bottom-[20%] left-[32%] flex h-40 w-28 rotate-3 items-center justify-center rounded-[1.5rem] bg-[#f5f1df] shadow-[0_24px_50px_rgba(39,62,46,0.2)]">
              <span className="text-center font-serif text-lg leading-none text-[#34513d]">BOTANI<br />EVE<small className="mt-3 block text-[7px] font-sans tracking-[0.18em]">BODY POLISH</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Find your ritual</p>
            <h2 className="mt-3 font-serif text-4xl text-[#203128] sm:text-5xl">Bath &amp; body collection</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#67746b]">Choose a collection or browse every Botani Eve bath and body essential.</p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-3" aria-label="Filter bath and body products">
          <button type="button" onClick={() => setActiveCollection("all")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === "all" ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055]"}`}>Shop all</button>
          {bathBodyCollections.map((collection) => (
            <button type="button" key={collection.slug} onClick={() => setActiveCollection(collection.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCollection === collection.slug ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cdd5cb] bg-white text-[#506055] hover:border-[#718674]"}`}>
              {collection.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#e2e9df]" />)}</div>
        ) : visibleProducts.length ? (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <div className="mt-9 rounded-[1.75rem] border border-dashed border-[#bfcbbf] bg-[#f1f4ee] px-6 py-14 text-center">
            <Droplets className="mx-auto text-[#78907b]" strokeWidth={1.4} />
            <h3 className="mt-4 font-serif text-2xl text-[#314b3b]">This ritual is being prepared</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68746b]">Bath and body products will appear here as soon as they are added in the Brand Studio.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default BotaniBathBodyPage;
