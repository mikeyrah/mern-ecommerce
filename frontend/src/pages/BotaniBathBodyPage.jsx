import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bath, Droplets, Leaf, Search, ShoppingBag, Sparkles, UserRound, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { botaniCollections } from "../data/brands";
import { useProductStore } from "../stores/useProductStore";

const bathBodyCollections = botaniCollections.filter((collection) => collection.group === "bath-body");

const collectionCards = [
  { slug: "hard-bar-soap", label: "Hard bar soap", note: "A satisfying start to your daily cleanse.", icon: Bath, tone: "bg-[#dbe5d7]" },
  { slug: "butter-balm", label: "Butter balm", note: "Rich, comforting care for your body ritual.", icon: Leaf, tone: "bg-[#eadfce]" },
  { slug: "bath-bombs", label: "Bath bombs", note: "A little joy for slower, softer bath time.", icon: Droplets, tone: "bg-[#dce5e3]" },
  { slug: "body-polish", label: "Body polish", note: "A smoothing step for renewed-feeling skin.", icon: Sparkles, tone: "bg-[#e8dfd6]" },
  { slug: "sugar-scrub", label: "Sugar scrub", note: "An everyday ritual with a polished finish.", icon: Waves, tone: "bg-[#e4e2d2]" },
];

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

  const chooseCollection = (slug) => {
    setActiveCollection(slug);
    document.querySelector("#bath-products")?.scrollIntoView({ behavior: "smooth" });
  };

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
        <nav className="botani-nav mx-auto flex max-w-4xl items-center justify-start gap-7 overflow-x-auto px-5 pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#667469] sm:justify-center" aria-label="Botani Eve collections">
          <Link to="/brands/botani-eve" className="whitespace-nowrap hover:text-[#314b3b]">Shop all</Link>
          <span className="whitespace-nowrap border-b border-[#314b3b] pb-1 text-[#203128]">Bath &amp; body</span>
          <Link to="/brands/botani-eve/seasonal" className="whitespace-nowrap hover:text-[#314b3b]">Seasonal</Link>
          <Link to="/brands/botani-eve/men" className="whitespace-nowrap hover:text-[#314b3b]">Men</Link>
          <Link to="/brands/botani-eve/baby" className="whitespace-nowrap hover:text-[#314b3b]">Baby</Link>
          <Link to="/brands/botani-eve/lip-gloss" className="whitespace-nowrap hover:text-[#314b3b]">Lip gloss</Link>
        </nav>
      </header>

      <section className="overflow-hidden bg-[#e5ebe0]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[1fr_0.85fr]">
          <div className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#708474]">Bath &amp; body</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-[#203128] sm:text-6xl">Turn everyday care into a ritual.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#5c6c61]">Cleansing bars, nourishing balms, joyful bath bombs, and smoothing body treatments made for skin that deserves a slower moment.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#bath-products" className="inline-flex items-center gap-2 rounded-full bg-[#314b3b] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263d30]">Shop the collection <ArrowRight size={16} /></a>
              <a href="#bath-rituals" className="text-sm font-semibold text-[#526457] underline decoration-[#9bab9c] underline-offset-4">Explore each ritual</a>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden bg-[#cad8c4] md:min-h-full">
            <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-[#f6f0da]/80" />
            <div className="absolute bottom-[12%] left-[8%] h-24 w-48 -rotate-6 rounded-[2rem] bg-[#a7bba4]/80 shadow-[0_20px_45px_rgba(39,62,46,0.12)]" />
            <Leaf className="absolute left-[18%] top-[18%] h-28 w-28 rotate-[-24deg] text-[#58745f]" strokeWidth={0.8} />
            <Droplets className="absolute bottom-[16%] right-[18%] h-32 w-32 text-[#6f8d79]" strokeWidth={0.65} />
            <div className="absolute bottom-[20%] left-[32%] flex h-40 w-28 rotate-3 items-center justify-center rounded-[1.5rem] bg-[#f5f1df] shadow-[0_24px_50px_rgba(39,62,46,0.2)]">
              <span className="text-center font-serif text-lg leading-none text-[#34513d]">BOTANI<br />EVE<small className="mt-3 block text-[7px] font-sans tracking-[0.18em]">BODY POLISH</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dce2d9] bg-[#fbfaf6]">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#dce2d9] px-5 py-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="px-5 py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#56705d]">Small-batch care</p><p className="mt-1 text-sm text-[#707a73]">Made with attention to every detail</p></div>
          <div className="px-5 py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#56705d]">Five body rituals</p><p className="mt-1 text-sm text-[#707a73]">From cleansing to smoothing</p></div>
          <div className="px-5 py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#56705d]">Thoughtfully yours</p><p className="mt-1 text-sm text-[#707a73]">Care for ordinary, beautiful days</p></div>
        </div>
      </section>

      <section id="bath-rituals" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Shop by ritual</p>
          <h2 className="mt-3 font-serif text-4xl text-[#203128] sm:text-5xl">A collection for every kind of care</h2>
          <p className="mt-4 text-base leading-7 text-[#67746b]">Build a body ritual that feels like your own, one thoughtful step at a time.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {collectionCards.map(({ slug, label, note, icon: Icon, tone }) => (
            <button type="button" key={slug} onClick={() => chooseCollection(slug)} className={`${tone} group flex min-h-72 flex-col rounded-[1.5rem] p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(49,75,59,0.13)]`}>
              <Icon size={27} strokeWidth={1.3} className="text-[#56705d]" />
              <div className="mt-auto">
                <h3 className="font-serif text-2xl leading-tight text-[#294233]">{label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#68736b]">{note}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#496151]">Shop now <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="bath-products" className="border-t border-[#dce2d9] bg-white/60 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
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
        </div>
      </section>

      <section className="overflow-hidden bg-[#314b3b] text-[#f8f6ef]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <div className="relative min-h-72 bg-[#738a73]">
            <div className="absolute left-[18%] top-[16%] h-44 w-44 rounded-full border border-white/30" />
            <Leaf className="absolute bottom-[16%] left-[32%] h-36 w-36 -rotate-12 text-[#d9e4d4]" strokeWidth={0.6} />
            <Droplets className="absolute right-[18%] top-[20%] h-28 w-28 text-[#c8d8c8]" strokeWidth={0.6} />
          </div>
          <div className="flex items-center px-7 py-16 sm:px-12 lg:px-16">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#bdcfba]">Made for the pause</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Your routine can be a place to return to yourself.</h2><p className="mt-6 max-w-lg leading-7 text-[#dce5da]">Botani Eve bath and body care is designed around the pleasure of slowing down—beautiful textures, intentional moments, and care that fits real life.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BotaniBathBodyPage;
