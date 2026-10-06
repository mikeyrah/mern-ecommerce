import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import ProductCard from "../components/ProductCard";

const brandLabels = { "botani-eve": "Botani Eve", "the-krafted-charm": "The Krafted Charm", "the-velvet-bakery": "The Velvet Bakery" };
const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => ({ q: params.get("q") || "", brand: params.get("brand") || "", category: params.get("category") || "", minPrice: params.get("minPrice") || "", maxPrice: params.get("maxPrice") || "", inStock: params.get("inStock") === "true", sort: params.get("sort") || "relevance" }), [params]);
  const [queryDraft, setQueryDraft] = useState(filters.q);
  const [data, setData] = useState({ products: [], total: 0, filters: { brands: [], categories: [] } });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => { setQueryDraft(filters.q); }, [filters.q]);
  useEffect(() => {
    setLoading(true);
    axios.get("/products/search/catalog", { params: Object.fromEntries([...params.entries()]) })
      .then(({ data: response }) => { setData(response); if (!response.total) axios.get("/products/recommendations").then(({ data: recs }) => setRecommendations(recs.products || [])).catch(() => {}); else setRecommendations([]); })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to search products"))
      .finally(() => setLoading(false));
  }, [params]);

  const update = (name, value) => { const next = new URLSearchParams(params); if (value === "" || value === false) next.delete(name); else next.set(name, String(value)); next.delete("page"); setParams(next); };
  const submit = (event) => { event.preventDefault(); update("q", queryDraft.trim()); };
  const clear = () => { setQueryDraft(""); setParams({}); };
  const activeCount = [filters.brand, filters.category, filters.minPrice, filters.maxPrice, filters.inStock].filter(Boolean).length;

  return <main className="min-h-screen bg-[#f8f6ef] text-[#27352b]">
    <section className="border-b border-[#ded8ca] bg-[#eef1e8] px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Discover the collective</p><h1 className="mt-3 font-serif text-4xl sm:text-6xl">Find something thoughtfully made.</h1><form onSubmit={submit} className="relative mt-8 max-w-3xl"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#718674]" /><input value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} maxLength="100" autoFocus placeholder="Search products, brands, or collections" className="w-full rounded-full border border-[#cfd8cc] bg-white py-4 pl-14 pr-28 text-base outline-none shadow-sm focus:ring-4 focus:ring-[#dce7d9]" /><button className="absolute right-2 top-2 rounded-full bg-[#314b3b] px-5 py-2.5 text-sm font-semibold text-white">Search</button></form></div></section>

    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-[#687168]">{loading ? "Searching…" : `${data.total} product${data.total === 1 ? "" : "s"}${filters.q ? ` for “${filters.q}”` : ""}`}</p>{(filters.q || activeCount > 0) && <button onClick={clear} className="mt-1 text-xs font-bold text-[#8c6826] underline underline-offset-4">Clear search and filters</button>}</div><div className="flex gap-2"><button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 rounded-full border border-[#cfd5ca] bg-white px-4 py-2.5 text-sm font-semibold lg:hidden"><SlidersHorizontal size={17} /> Filters {activeCount > 0 && `(${activeCount})`}</button><select value={filters.sort} onChange={(event) => update("sort", event.target.value)} className="rounded-full border border-[#cfd5ca] bg-white px-4 py-2.5 text-sm font-semibold"><option value="relevance">Best match</option><option value="newest">Newest</option><option value="popular">Most popular</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="hidden lg:block"><Filters filters={filters} options={data.filters} update={update} /></aside><div>{loading ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{[0,1,2,3,4,5].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-2xl bg-[#e2e8df]" />)}</div> : data.products.length ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{data.products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div><div className="rounded-[2rem] border border-dashed border-[#bfcbbf] bg-white/60 px-8 py-14 text-center"><Search className="mx-auto text-[#78907b]" size={34} /><h2 className="mt-4 font-serif text-3xl">No exact matches yet</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#687168]">Try a broader phrase, remove a filter, or explore these pieces from across the collective.</p></div>{recommendations.length > 0 && <><h3 className="mt-10 font-serif text-3xl">You may also like</h3><div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{recommendations.map((product) => <ProductCard key={product._id} product={product} />)}</div></>}</div>}</div></div>
    </section>
    {mobileFilters && <div className="fixed inset-0 z-[70] bg-black/35 lg:hidden" onClick={() => setMobileFilters(false)}><aside className="ml-auto h-full w-[min(88vw,360px)] overflow-y-auto bg-[#fbfaf6] p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Filter products</h2><button onClick={() => setMobileFilters(false)} aria-label="Close filters"><X /></button></div><div className="mt-7"><Filters filters={filters} options={data.filters} update={update} /></div><button onClick={() => setMobileFilters(false)} className="mt-7 w-full rounded-full bg-[#314b3b] py-3 font-semibold text-white">View {data.total} results</button></aside></div>}
  </main>;
};

const Filters = ({ filters, options, update }) => <div className="space-y-7"><div className="flex items-center gap-2 font-serif text-xl"><Filter size={18} /> Refine</div><FilterSelect label="Brand" value={filters.brand} onChange={(value) => update("brand", value)}><option value="">All brands</option>{(options.brands || []).map((brand) => <option key={brand} value={brand}>{brandLabels[brand] || brand}</option>)}</FilterSelect><FilterSelect label="Collection" value={filters.category} onChange={(value) => update("category", value)}><option value="">All collections</option>{(options.categories || []).map((category) => <option key={category} value={category}>{category.replaceAll("-", " ")}</option>)}</FilterSelect><div><p className="text-sm font-semibold">Price range</p><div className="mt-2 grid grid-cols-2 gap-2"><input type="number" min="0" value={filters.minPrice} onChange={(event) => update("minPrice", event.target.value)} placeholder="Min" className="w-full rounded-xl border border-[#d8d2c5] bg-white px-3 py-2.5 text-sm" /><input type="number" min="0" value={filters.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} placeholder="Max" className="w-full rounded-xl border border-[#d8d2c5] bg-white px-3 py-2.5 text-sm" /></div></div><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={filters.inStock} onChange={(event) => update("inStock", event.target.checked)} className="h-4 w-4 accent-[#6f856c]" /> In-stock products only</label></div>;
const FilterSelect = ({ label, value, onChange, children }) => <label className="block text-sm font-semibold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8d2c5] bg-white px-3 py-2.5 font-normal capitalize">{children}</select></label>;
export default SearchPage;
