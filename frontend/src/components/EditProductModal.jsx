import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader, Save, X } from "lucide-react";
import { botaniCollections } from "../data/brands";
import { useProductStore } from "../stores/useProductStore";

const categoriesByBrand = {
  "botani-eve": botaniCollections.map(({ slug, label }) => ({ value: slug, label })),
  "the-krafted-charm": ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"].map((value) => ({ value, label: value.replaceAll("-", " ") })),
  "the-velvet-bakery": ["cakes", "cookies", "treats"].map((value) => ({ value, label: value })),
};

const brandOptions = [
  { value: "botani-eve", label: "Botani Eve" },
  { value: "the-krafted-charm", label: "The Krafted Charm" },
  { value: "the-velvet-bakery", label: "The Velvet Bakery" },
];

const EditProductModal = ({ product, onClose }) => {
  const { updateProduct, loading } = useProductStore();
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    brand: product.brand || "the-krafted-charm",
    category: product.category,
    image: product.image,
  });

  const categoryOptions = useMemo(() => categoriesByBrand[form.brand] || [], [form.brand]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setField("image", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const wasUpdated = await updateProduct(product._id, form);
    if (wasUpdated) onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1b251f]/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="edit-product-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#ddd6c8] bg-[#fcfaf5] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker text-[#7c9279]">Product editor</p>
            <h2 id="edit-product-title" className="mt-2 font-serif text-3xl text-[#27352b]">Edit {product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#ddd6c8] p-2 text-[#596259] transition hover:bg-white" aria-label="Close product editor"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-semibold">Product name
            <input required value={form.name} onChange={(event) => setField("name", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-semibold">Brand
            <select value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value, category: "" }))} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">
              {brandOptions.map((brand) => <option key={brand.value} value={brand.value}>{brand.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Collection
            <select required value={form.category} onChange={(event) => setField("category", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">
              <option value="">Select a collection</option>
              {categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Price
            <input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setField("price", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-semibold">Replace image
            <span className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-[#dcd5c5] bg-white px-4 py-3 font-normal text-[#596259]"><ImagePlus size={18} /> Choose a new image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
          </label>
          <label className="sm:col-span-2 text-sm font-semibold">Description
            <textarea required rows="4" value={form.description} onChange={(event) => setField("description", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          </label>

          <div className="sm:col-span-2 flex flex-col-reverse gap-3 border-t border-[#e2dccf] pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-full border border-[#cfc8ba] px-5 py-2.5 text-sm font-semibold text-[#596259]">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f856c] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? <><Loader size={17} className="animate-spin" /> Saving…</> : <><Save size={17} /> Save changes</>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditProductModal;
