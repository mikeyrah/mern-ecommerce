import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { brands, getBrand } from "../data/brands";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";

const BrandPage = () => {
  const { brand: brandSlug } = useParams();
  const brand = getBrand(brandSlug);
  const { fetchProductsByBrand, products, loading } = useProductStore();

  useEffect(() => {
    if (brand) fetchProductsByBrand(brand.slug);
  }, [brand, fetchProductsByBrand]);

  if (!brand) return <div className="brand-shell px-6 py-32 text-center">Brand not found.</div>;

  return (
    <main className="brand-shell min-h-screen px-4 py-12 sm:px-8">
      <nav className="mx-auto mb-10 flex max-w-6xl flex-wrap justify-center gap-2" aria-label="Our brands">
        {brands.map((item) => (
          <Link
            key={item.slug}
            to={`/brands/${item.slug}`}
            className={`brand-tab ${item.slug === brand.slug ? "brand-tab-active" : ""}`}
            style={item.slug === brand.slug ? { "--brand-accent": item.accent } : undefined}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#ded7c8] bg-white shadow-[0_24px_80px_rgba(68,62,45,0.12)] md:grid-cols-[1.1fr_0.9fr]">
        <div className="p-9 sm:p-14" style={{ backgroundColor: brand.soft }}>
          <p className="section-kicker" style={{ color: brand.accent }}>Stewart-Tate &amp; Co. presents</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#27352b] sm:text-6xl">{brand.name}</h1>
          <p className="mt-5 text-xl text-[#586258]">{brand.eyebrow}</p>
          <p className="mt-8 max-w-lg text-base leading-7 text-[#596259]">{brand.description}</p>
          <a href="#collection" className="brand-cta mt-10 inline-flex" style={{ backgroundColor: brand.accent }}>
            Shop the collection <ArrowRight size={17} />
          </a>
        </div>
        <div className="brand-monogram flex min-h-72 items-center justify-center p-8" style={{ backgroundColor: brand.accent }}>
          <div className="rounded-full border border-white/50 p-8 text-center text-white">
            <span className="block font-serif text-6xl">{brand.name.split(" ").map((word) => word[0]).join("")}</span>
            <span className="mt-2 block text-xs uppercase tracking-[0.28em]">Crafted with care</span>
          </div>
        </div>
      </section>
      <section id="collection" className="mx-auto mt-16 max-w-6xl">
        <p className="section-kicker" style={{ color: brand.accent }}>{brand.name} collection</p>
        <h2 className="mt-2 font-serif text-4xl text-[#27352b]">Made for your everyday rituals</h2>
        {loading ? (
          <p className="mt-8 text-[#596259]">Loading the collection…</p>
        ) : products.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#c9c1ad] bg-white p-10 text-center text-[#596259]">
            New pieces are being prepared for this collection. Please check back soon.
          </div>
        )}
      </section>
    </main>
  );
};

export default BrandPage;
