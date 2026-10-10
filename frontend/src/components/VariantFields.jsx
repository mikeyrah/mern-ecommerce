import { Plus, Trash2 } from "lucide-react";

const blankVariant = () => ({ label: "", sku: "", price: "", trackInventory: false, stock: 0, image: "" });

const VariantFields = ({ variantName, variants, onChange }) => {
  const updateVariant = (index, field, value) => onChange({
    variantName,
    variants: variants.map((variant, itemIndex) => itemIndex === index ? { ...variant, [field]: value } : variant),
  });
  const removeVariant = (index) => onChange({ variantName, variants: variants.filter((_, itemIndex) => itemIndex !== index) });

  return <section className="sm:col-span-2 rounded-2xl border border-[#dcd5c5] bg-white p-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <label className="min-w-52 flex-1 text-sm font-semibold">Option name
        <input value={variantName} onChange={(event) => onChange({ variantName: event.target.value, variants })} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Size, shade, scent…" />
      </label>
      <button type="button" onClick={() => onChange({ variantName: variantName || "Option", variants: [...variants, blankVariant()] })} className="inline-flex items-center gap-2 rounded-full border border-[#6f856c] px-4 py-2.5 text-sm font-semibold text-[#526b57]"><Plus size={16} /> Add choice</button>
    </div>
    {variants.length ? <div className="mt-5 space-y-4">{variants.map((variant, index) => <div key={variant._id || index} className="grid gap-3 rounded-xl bg-[#f8f6ef] p-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto]">
      <label className="text-xs font-semibold">Choice
        <input required value={variant.label} onChange={(event) => updateVariant(index, "label", event.target.value)} className="mt-1.5 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Lavender, 8 oz, Medium…" />
      </label>
      <label className="text-xs font-semibold">SKU
        <input value={variant.sku || ""} onChange={(event) => updateVariant(index, "sku", event.target.value)} className="mt-1.5 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Optional" />
      </label>
      <label className="text-xs font-semibold">Price
        <input min="0" step="0.01" type="number" value={variant.price ?? ""} onChange={(event) => updateVariant(index, "price", event.target.value)} className="mt-1.5 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Base price" />
      </label>
      <button type="button" onClick={() => removeVariant(index)} className="self-end rounded-lg p-2.5 text-[#92584d] hover:bg-[#f3e2df]" aria-label={`Remove ${variant.label || "choice"}`}><Trash2 size={18} /></button>
      <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={Boolean(variant.trackInventory)} onChange={(event) => updateVariant(index, "trackInventory", event.target.checked)} className="accent-[#6f856c]" /> Track inventory for this choice</label>
      {variant.trackInventory && <label className="text-xs font-semibold">Stock
        <input min="0" step="1" type="number" value={variant.stock ?? 0} onChange={(event) => updateVariant(index, "stock", event.target.value)} className="mt-1.5 w-full rounded-lg border px-3 py-2 font-normal" />
      </label>}
    </div>)}</div> : <p className="mt-4 text-sm text-[#7a827c]">Add choices only when this product is sold in multiple sizes, shades, scents, or styles.</p>}
  </section>;
};

export default VariantFields;
