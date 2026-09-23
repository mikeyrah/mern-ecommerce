import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Clock3, Flame, Leaf, Search, ShoppingBag, Sparkles, UserRound, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";

const BotaniHomeScentsPage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();

  useEffect(() => {
    fetchProductsByBrand("botani-eve");
  }, [fetchProductsByBrand]);

  const candles = products.filter((product) => product.category === "candles");

  return (
    <main className="min-h-screen bg-[#f6f2e9] text-[#203128]">
      <p className="bg-[#263c31] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f8f3e8] sm:text-[11px]">
        Botanical atmosphere for the spaces you call home
      </p>

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
          <Link to="/brands/botani-eve/men" className="whitespace-nowrap hover:text-[#314b3b]">Men</Link>
          <Link to="/brands/botani-eve/baby" className="whitespace-nowrap hover:text-[#314b3b]">Baby</Link>
          <Link to="/brands/botani-eve/lip-gloss" className="whitespace-nowrap hover:text-[#314b3b]">Lip gloss</Link>
          <span className="whitespace-nowrap border-b border-[#314b3b] pb-1 text-[#203128]">Home scents</span>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden bg-[#d9ddce]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(255,247,217,0.88),transparent_26%),linear-gradient(120deg,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="relative mx-auto grid min-h-[590px] max-w-7xl md:grid-cols-[0.95fr_1.05fr]">
          <div className="z-10 flex items-center px-7 py-20 sm:px-12 lg:px-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#5d725f]">The home scent ritual</p>
              <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.96] tracking-[-0.04em] text-[#263a2d] sm:text-7xl">Let the room <em className="font-normal text-[#6f7658]">exhale.</em></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#59665c] sm:text-lg">Botanical candles poured for slow mornings, gentle evenings, and the quiet transformation of home.</p>
              <a href="#candles" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#314b3b] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263d30]">Shop candles <ArrowRight size={17} /></a>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden md:min-h-full" aria-label="Botani Eve botanical candle collection">
            <div className="absolute left-[15%] top-[10%] h-72 w-72 rounded-full bg-[#f7eac8]/65" />
            <Leaf className="absolute -right-6 top-[4%] h-56 w-56 rotate-[35deg] text-[#718469]/55" strokeWidth={0.65} />
            <Leaf className="absolute bottom-[1%] left-[2%] h-48 w-48 -rotate-[42deg] text-[#879876]/45" strokeWidth={0.65} />
            <div className="absolute bottom-[14%] left-[13%] right-[8%] h-16 rounded-[50%] bg-[#344b3a]/20 blur-xl" />
            <div className="absolute bottom-[17%] left-[16%] z-10 flex h-44 w-40 -rotate-3 flex-col items-center justify-center rounded-b-[2rem] rounded-t-xl bg-gradient-to-r from-[#6b795e] via-[#9ca68b] to-[#647258] shadow-[0_28px_55px_rgba(39,58,45,0.25)]">
              <Flame className="mb-3 text-[#f7e5b9]" size={24} strokeWidth={1.2} />
              <span className="text-center font-serif text-lg leading-none text-white">BOTANI<br />EVE</span><small className="mt-3 text-[7px] font-bold tracking-[0.2em] text-[#f0ead8]">FOREST QUIET</small>
            </div>
            <div className="absolute bottom-[16%] left-[48%] z-20 flex h-60 w-44 rotate-2 flex-col items-center justify-center rounded-b-[2.3rem] rounded-t-xl bg-gradient-to-r from-[#d5c49e] via-[#f2e6c8] to-[#c6b184] shadow-[0_32px_65px_rgba(39,58,45,0.27)]">
              <Flame className="mb-4 text-[#9a6937]" size={28} strokeWidth={1.1} />
              <span className="text-center font-serif text-xl leading-none text-[#3d523f]">BOTANI<br />EVE</span><small className="mt-4 text-[7px] font-bold tracking-[0.2em] text-[#63705c]">GOLDEN HOUR</small>
            </div>
            <div className="absolute bottom-[17%] right-[5%] z-10 flex h-40 w-36 rotate-6 flex-col items-center justify-center rounded-b-[1.8rem] rounded-t-xl bg-gradient-to-r from-[#8b6755] via-[#b68e74] to-[#7e5a49] shadow-[0_25px_50px_rgba(39,58,45,0.22)]">
              <Flame className="mb-2 text-[#f6d8a4]" size={21} strokeWidth={1.2} />
              <span className="font-serif text-base text-white">BOTANI EVE</span><small className="mt-2 text-[7px] font-bold tracking-[0.18em] text-[#f4e3d2]">EARTH &amp; AMBER</small>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d8ddcf] bg-[#fbf9f3]">
        <div className="mx-auto grid max-w-7xl divide-y divide-[#d8ddcf] px-5 py-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="px-5 py-3"><Leaf className="mx-auto text-[#60735f]" size={20} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#4c6251]">Botanical blends</p><p className="mt-1 text-sm text-[#737d74]">Scents inspired by the natural world</p></div>
          <div className="px-5 py-3"><Clock3 className="mx-auto text-[#60735f]" size={20} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#4c6251]">Made for slow hours</p><p className="mt-1 text-sm text-[#737d74]">A warm glow for unhurried moments</p></div>
          <div className="px-5 py-3"><Wind className="mx-auto text-[#60735f]" size={20} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-[#4c6251]">A softer atmosphere</p><p className="mt-1 text-sm text-[#737d74]">Fragrance that settles gently into home</p></div>
        </div>
      </section>

      <section id="candles" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#708474]">Home scents</p><h2 className="mt-3 font-serif text-4xl text-[#203128] sm:text-5xl">The candle collection</h2></div>
          <p className="max-w-md text-sm leading-6 text-[#67746b]">Light one when the day needs a softer edge, the room needs warmth, or home simply needs to feel more like you.</p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#e2e7db]" />)}</div>
        ) : candles.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{candles.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#bfc9b8] bg-[#edf0e7] px-6 py-16 text-center">
            <Flame className="mx-auto text-[#667a64]" strokeWidth={1.25} />
            <h3 className="mt-4 font-serif text-2xl text-[#314b3b]">The first pour is coming soon</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68746b]">Add a Botani Eve product to the Candles collection in Brand Studio and it will appear here.</p>
          </div>
        )}
      </section>

      <section className="overflow-hidden bg-[#2e4537] text-[#f7f4ea]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-72 bg-[#687c66]"><div className="absolute left-[20%] top-[15%] h-48 w-48 rounded-full bg-[#e8d69f]/30" /><Flame className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-[#f1dfad]" strokeWidth={0.65} /><Sparkles className="absolute right-[14%] top-[17%] text-[#d9e2ce]" strokeWidth={0.8} /></div>
          <div className="flex items-center px-7 py-16 sm:px-12 lg:px-16"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#bdcfba]">The evening ritual</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">Strike a match. Set down the day.</h2><p className="mt-6 max-w-xl leading-7 text-[#dce5da]">A candle can be a small signal: you are home, the pace can soften, and this moment belongs to you.</p></div></div>
        </div>
      </section>
    </main>
  );
};

export default BotaniHomeScentsPage;
