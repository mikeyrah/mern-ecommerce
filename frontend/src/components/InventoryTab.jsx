import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Check, PackageCheck, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const InventoryTab = () => {
  const { products, updateInventory } = useProductStore();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const metrics = useMemo(() => ({
    tracked: products.filter((product) => product.trackInventory).length,
    low: products.filter((product) => product.trackInventory && product.stock > 0 && product.stock <= product.lowStockThreshold).length,
    out: products.filter((product) => product.trackInventory && product.stock === 0).length,
    units: products.filter((product) => product.trackInventory).reduce((sum, product) => sum + product.stock, 0),
  }), [products]);

  const visible = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.sku} ${product.brand}`.toLowerCase().includes(search.toLowerCase());
    const matchesView = view === "all" || (view === "low" && product.trackInventory && product.stock > 0 && product.stock <= product.lowStockThreshold) || (view === "out" && product.trackInventory && product.stock === 0) || (view === "untracked" && !product.trackInventory);
    return matchesSearch && matchesView;
  }), [products, search, view]);

  const draftFor = (product) => drafts[product._id] || { stock: product.stock ?? 0, lowStockThreshold: product.lowStockThreshold ?? 5, sku: product.sku || "", trackInventory: Boolean(product.trackInventory) };
  const setDraft = (product, field, value) => setDrafts((current) => ({ ...current, [product._id]: { ...draftFor(product), [field]: value } }));
  const save = async (product) => {
    setSaving(product._id);
    if (await updateInventory(product._id, draftFor(product))) setDrafts((current) => { const next = { ...current }; delete next[product._id]; return next; });
    setSaving(null);
  };

  return <section className="mx-auto max-w-6xl">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Boxes} label="Tracked products" value={metrics.tracked} /><Metric icon={PackageCheck} label="Units on hand" value={metrics.units} /><Metric icon={AlertTriangle} label="Low stock" value={metrics.low} warning /><Metric icon={AlertTriangle} label="Out of stock" value={metrics.out} danger /></div>
    <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#e1dacb] bg-white p-5 shadow-sm lg:flex-row lg:items-center"><div><p className="section-kicker text-[#7c9279]">Stock room</p><h2 className="mt-2 font-serif text-3xl text-[#27352b]">Inventory control</h2></div><label className="relative w-full lg:max-w-xs"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c9279]" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className="w-full rounded-full border border-[#dcd5c5] py-3 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-[#e6eee3]" /></label></div>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{[["all", "All products"], ["low", "Low stock"], ["out", "Out of stock"], ["untracked", "Not tracked"]].map(([id, label]) => <button key={id} onClick={() => setView(id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ${view === id ? "border-[#6f856c] bg-[#6f856c] text-white" : "border-[#d9d3c5] bg-white text-[#687064]"}`}>{label}</button>)}</div>
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#e1dacb] bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[880px] w-full"><thead className="bg-[#f3eee2] text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#687064]"><tr><th className="px-5 py-4">Product</th><th className="px-4 py-4">Tracking</th><th className="px-4 py-4">SKU</th><th className="px-4 py-4">On hand</th><th className="px-4 py-4">Low at</th><th className="px-5 py-4">Status</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-[#ebe5d9]">{visible.map((product) => { const draft = draftFor(product); const isLow = draft.trackInventory && Number(draft.stock) > 0 && Number(draft.stock) <= Number(draft.lowStockThreshold); const isOut = draft.trackInventory && Number(draft.stock) === 0; return <tr key={product._id} className="hover:bg-[#fcfaf5]"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={product.images?.[0] || product.image} alt="" className="h-11 w-11 rounded-xl object-cover" /><div><p className="max-w-52 truncate text-sm font-semibold text-[#354139]">{product.name}</p><p className="text-xs capitalize text-[#858c85]">{product.brand?.replaceAll("-", " ")}</p></div></div></td><td className="px-4 py-4"><button onClick={() => setDraft(product, "trackInventory", !draft.trackInventory)} className={draft.trackInventory ? "text-[#6f856c]" : "text-[#aaa89f]"} aria-label={`Toggle inventory tracking for ${product.name}`}>{draft.trackInventory ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}</button></td><td className="px-4 py-4"><input value={draft.sku} onChange={(event) => setDraft(product, "sku", event.target.value)} className="w-28 rounded-lg border border-[#ddd6c8] px-3 py-2 text-sm uppercase" placeholder="SKU" /></td><td className="px-4 py-4"><input type="number" min="0" step="1" disabled={!draft.trackInventory} value={draft.stock} onChange={(event) => setDraft(product, "stock", event.target.value)} className="w-20 rounded-lg border border-[#ddd6c8] px-3 py-2 text-sm disabled:bg-[#f1f0ec]" /></td><td className="px-4 py-4"><input type="number" min="0" step="1" disabled={!draft.trackInventory} value={draft.lowStockThreshold} onChange={(event) => setDraft(product, "lowStockThreshold", event.target.value)} className="w-20 rounded-lg border border-[#ddd6c8] px-3 py-2 text-sm disabled:bg-[#f1f0ec]" /></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${!draft.trackInventory ? "bg-[#efeee9] text-[#777a75]" : isOut ? "bg-[#f3e2df] text-[#895149]" : isLow ? "bg-[#f5ead2] text-[#8a6826]" : "bg-[#e2eee1] text-[#4d6c53]"}`}>{!draft.trackInventory ? "Not tracked" : isOut ? "Out of stock" : isLow ? "Low stock" : "In stock"}</span></td><td className="px-5 py-4"><button onClick={() => save(product)} disabled={saving === product._id} className="inline-flex items-center gap-1 rounded-full bg-[#314b3b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check size={14} /> {saving === product._id ? "Saving" : "Save"}</button></td></tr>; })}</tbody></table></div>{!visible.length && <p className="py-14 text-center text-sm text-[#687064]">No products match this inventory view.</p>}</div>
  </section>;
};

const Metric = ({ icon: Icon, label, value, warning, danger }) => <div className="relative overflow-hidden rounded-2xl border border-[#e1dacb] bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-[#7c9279]">{label}</p><p className={`mt-2 text-3xl font-bold ${danger ? "text-[#9a554b]" : warning ? "text-[#a4772b]" : "text-[#27352b]"}`}>{value}</p><Icon className="absolute -bottom-3 -right-2 h-20 w-20 text-[#b58a34] opacity-15" /></div>;

export default InventoryTab;
