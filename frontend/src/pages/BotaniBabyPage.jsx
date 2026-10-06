import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Baby, Droplets, Heart, Leaf, MoonStar, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";

const babyRituals = [
  { slug: "baby-wash", label: "Baby wash", eyebrow: "Bath time", copy: "A soft, simple cleanse for tiny hands, sleepy toes, and warm everyday baths.", icon: Droplets, tone: "bg-[#dce9e2]" },
  { slug: "baby-butter", label: "Baby butter", eyebrow: "After the bath", copy: "Comforting moisture that melts into delicate skin and makes room for a little extra closeness.", icon: Heart, tone: "bg-[#f1e5d6]" },
  { slug: "baby-oil", label: "Baby oil", eyebrow: "Quiet moments", copy: "A silky botanical blend for gentle massage, bonding, and an unhurried bedtime ritual.", icon: MoonStar, tone: "bg-[#dfe3ee]" },
  { slug: "diaper-balm", label: "Diaper balm", eyebrow: "Everyday comfort", copy: "A protective layer of plant-forward care made for the moments that need extra tenderness.", icon: ShieldCheck, tone: "bg-[#e8e3d5]" },
];

const BotaniBabyPage = () => {
  const { fetchProductsByBrand, products, loading } = useProductStore();
  const [active, setActive] = useState("all");

  useEffect(() => { fetchProductsByBrand("botani-eve"); }, [fetchProductsByBrand]);

  const visibleProducts = useMemo(() => {
    const categories = new Set(babyRituals.map(({ slug }) => slug));
    return products.filter((product) => active === "all" ? categories.has(product.category) : product.category === active);
  }, [active, products]);

  const chooseRitual = (slug) => {
    setActive(slug);
    document.querySelector("#baby-products")?.scrollIntoView({ behavior: "smooth" });
  };

  return <main className="min-h-screen bg-[#fbfaf6] text-[#27352b]">
    <p className="bg-[#526a5a] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[11px]">Tender botanical care · Made for little rituals</p>

    <header className="border-b border-[#d8dfd8] bg-[#fffefa]/95]">
      <div className="mx-auto grid max-w-7xl grid-cols-[3.5rem_1fr_3.5rem] items-center px-4 py-4 sm:grid-cols-[6rem_1fr_6rem] sm:px-8 sm:py-5">
        <Link to="/brands/botani-eve" className="inline-flex items-center gap-2 justify-self-start text-xs font-bold uppercase tracking-[0.14em] text-[#536258]"><ArrowLeft size={17} /><span className="hidden sm:inline">Botani Eve</span></Link>
        <Link to="/brands/botani-eve" className="justify-self-center whitespace-nowrap text-center"><span className="block font-serif text-2xl font-semibold tracking-[0.08em] text-[#263b31] sm:text-4xl">BOTANI EVE</span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.36em] text-[#718074]">Rooted in ritual</span></Link>
        <div className="flex items-center justify-self-end gap-3 text-[#314b3b]"><Link to="/account" aria-label="Account"><UserRound className="hidden sm:block" size={19} /></Link><Link to="/cart" aria-label="Shopping bag"><ShoppingBag size={19} /></Link></div>
      </div>
      <nav className="botani-nav mx-auto flex max-w-5xl items-center justify-start gap-7 overflow-x-auto px-5 pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#667469] sm:justify-center">
        <Link to="/brands/botani-eve" className="whitespace-nowrap">Shop all</Link><Link to="/brands/botani-eve/bath-body" className="whitespace-nowrap">Bath &amp; body</Link><Link to="/brands/botani-eve/seasonal" className="whitespace-nowrap">Seasonal</Link><Link to="/brands/botani-eve/men" className="whitespace-nowrap">Men</Link><span className="whitespace-nowrap border-b border-[#526a5a] pb-1 text-[#314b3b]">Baby</span><Link to="/brands/botani-eve/lip-gloss" className="whitespace-nowrap">Lip gloss</Link><Link to="/brands/botani-eve/home-scents" className="whitespace-nowrap">Home scents</Link>
      </nav>
    </header>

    <section className="relative isolate overflow-hidden bg-[#e8f0e9]">
      <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute -right-24 -top-20 h-96 w-96 rounded-full bg-[#f5e9d8]/80 blur-2xl" />
      <div className="relative mx-auto grid max-w-7xl md:min-h-[620px] md:grid-cols-[1fr_0.9fr]">
        <div className="z-10 flex items-center px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-[#92aa98]/45 bg-white/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#526a5a]"><Sparkles size={14} /> Botani Eve baby</div><h1 className="mt-7 max-w-xl font-serif text-5xl leading-[0.97] tracking-[-0.035em] text-[#2f493b] sm:text-7xl">Tender care for<br /><em className="font-normal text-[#7d9b84]">little beginnings.</em></h1><p className="mt-7 max-w-lg text-base leading-7 text-[#5f7166] sm:text-lg">Gentle bath, moisture, and comfort essentials designed to make everyday care feel calm, close, and beautifully simple.</p><a href="#baby-products" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#526a5a] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#405648]">Shop baby care <ArrowRight size={17} /></a></div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden sm:min-h-[460px] md:min-h-full" aria-label="Botani Eve gentle baby care">
          <div className="absolute left-[8%] top-[12%] h-60 w-60 rounded-full border border-white/70" /><Leaf className="absolute right-[2%] top-[8%] h-52 w-52 rotate-[32deg] text-[#a9c0ad]/55" strokeWidth={0.6} /><MoonStar className="absolute left-[18%] top-[19%] text-[#d3ba8d]" size={34} strokeWidth={1} />
          <div className="absolute bottom-[13%] left-[10%] right-[8%] h-12 rounded-[50%] bg-[#617264]/20 blur-xl" />
          <div className="absolute bottom-[18%] left-[15%] z-10 flex h-48 w-32 -rotate-3 items-center justify-center rounded-[2rem] bg-gradient-to-r from-[#c8d8cd] to-[#edf3ee] shadow-[0_24px_55px_rgba(62,87,70,0.22)]"><BottleLabel product="BABY OIL" /></div>
          <div className="absolute bottom-[17%] left-[42%] z-20 flex h-64 w-40 rotate-2 items-center justify-center rounded-[2.4rem] bg-gradient-to-r from-[#f7efe1] to-[#e7d6bd] shadow-[0_26px_60px_rgba(86,75,55,0.2)]"><BottleLabel product="BABY WASH" /></div>
          <div className="absolute bottom-[17%] right-[6%] z-10 flex h-28 w-40 -rotate-2 items-center justify-center rounded-[2.5rem] bg-[#f3f0e7] shadow-[0_24px_50px_rgba(62,87,70,0.18)]"><BottleLabel product="BABY BUTTER" /></div>
        </div>
      </div>
    </section>

    <section className="border-y border-[#d8dfd8] bg-white"><div className="mx-auto grid max-w-7xl divide-y divide-[#e2e6e0] px-5 py-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8"><Promise icon={Leaf} title="Botanical care" copy="Thoughtfully made for gentle routines" /><Promise icon={Heart} title="Made with tenderness" copy="Comfort-first everyday essentials" /><Promise icon={MoonStar} title="Calmer moments" copy="Simple rituals from bath to bedtime" /></div></section>

    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7d9b84]">From bath to bedtime</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">A little ritual for every need.</h2></div><p className="max-w-sm text-sm leading-6 text-[#687168]">Explore the routine one comforting step at a time, or shop the complete baby collection below.</p></div>
      <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{babyRituals.map(({ slug, label, eyebrow, copy, icon: Icon, tone }) => <button key={slug} onClick={() => chooseRitual(slug)} className={`${tone} group flex min-h-[330px] flex-col rounded-[1.75rem] p-7 text-left transition hover:-translate-y-1 hover:shadow-xl`}><Icon size={34} strokeWidth={1.2} className="text-[#526a5a]" /><div className="mt-auto pt-12"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#68806e]">{eyebrow}</p><h3 className="mt-3 font-serif text-3xl">{label}</h3><p className="mt-3 text-sm leading-6 text-[#59665d]">{copy}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#526a5a]">Explore <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></div></button>)}</div>
    </section>

    <section id="baby-products" className="border-y border-[#d8dfd8] bg-[#f2f6f1] px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7d9b84]">Botani Eve baby</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">The complete collection</h2></div><p className="max-w-md text-sm leading-6 text-[#687168]">Gentle essentials for bathing, moisturizing, protecting, and winding down.</p></div><div className="mt-8 flex gap-2 overflow-x-auto pb-3"><Filter active={active === "all"} onClick={() => setActive("all")}>Shop all</Filter>{babyRituals.map((item) => <Filter key={item.slug} active={active === item.slug} onClick={() => setActive(item.slug)}>{item.label}</Filter>)}</div>{loading ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-[#dfe8df]" />)}</div> : visibleProducts.length ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="mt-9 rounded-[1.75rem] border border-dashed border-[#adbfaf] bg-white/60 px-6 py-14 text-center"><Baby className="mx-auto text-[#7d9b84]" /><h3 className="mt-4 font-serif text-2xl">Something gentle is on the way</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687168]">Baby products will appear here as soon as they are added in Brand Studio.</p></div>}</div></section>

    <section className="bg-[#526a5a] px-5 py-16 text-center text-white sm:px-8"><Heart className="mx-auto text-[#f0dcc0]" strokeWidth={1.2} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#d7e2d9]">Made for closeness</p><h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Soft skin, sleepy smiles, and care that becomes part of the memory.</h2></section>
  </main>;
};

const BottleLabel = ({ product }) => <div className="border border-[#526a5a]/25 px-4 py-6 text-center text-[#375044]"><span className="font-serif text-base leading-none">BOTANI<br />EVE</span><small className="mt-3 block text-[7px] font-bold tracking-[0.16em]">{product}</small></div>;
const Promise = ({ icon: Icon, title, copy }) => <div className="px-5 py-3"><Icon className="mx-auto text-[#7d9b84]" size={19} /><p className="mt-2 text-xs font-bold uppercase tracking-[0.17em]">{title}</p><p className="mt-1 text-sm text-[#737d74]">{copy}</p></div>;
const Filter = ({ active, onClick, children }) => <button onClick={onClick} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-[#526a5a] bg-[#526a5a] text-white" : "border-[#c6d2c7] bg-white text-[#506055] hover:border-[#7d9b84]"}`}>{children}</button>;

export default BotaniBabyPage;
