import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import FeaturedProducts from "../components/FeaturedProducts";
import { useProductStore } from "../stores/useProductStore";
import { brands } from "../data/brands";
import CategoryItem from "../components/CategoryItem";

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-Shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, loading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <main className="brand-shell overflow-hidden">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8 sm:pt-16">
        <p className="section-kicker text-[#B58A34]">The Stewart-Tate &amp; Co. collective</p>
        <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="max-w-3xl font-serif text-5xl leading-[0.96] text-[#27352b] sm:text-7xl">
              Beautiful things, <em className="font-normal text-[#7C9279]">thoughtfully</em> made.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#596259]">
              Discover a collection of small-batch skincare, handmade apparel, and celebratory treats—each created with care by our family of brands.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#e2dac7] bg-[#f3eee2] p-7 shadow-[0_20px_60px_rgba(78,70,47,0.12)]">
            <Sparkles className="text-[#B58A34]" size={25} />
            <p className="mt-5 font-serif text-3xl leading-tight text-[#27352b]">One house. Three distinct expressions of craft.</p>
            <a href="#our-brands" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#586d55]">Meet our brands <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section id="our-brands" className="border-y border-[#e4ddcd] bg-white/60 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="section-kicker text-[#B58A34]">Our house of brands</p><h2 className="mt-2 font-serif text-4xl text-[#27352b]">A collection for every kind of joy.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-[#687064]">Choose a brand to enter its dedicated storefront and browse its unique collection.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {brands.map((brand) => (
              <Link key={brand.slug} to={`/brands/${brand.slug}`} className="brand-card group" style={{ "--brand-accent": brand.accent, "--brand-soft": brand.soft }}>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: brand.accent }}>Stewart-Tate &amp; Co.</p>
                <h3 className="mt-7 font-serif text-3xl text-[#27352b]">{brand.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#596259]">{brand.description}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: brand.accent }}>Explore {brand.name} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <p className="section-kicker text-[#7C9279]">The Krafted Charm edit</p>
        <h2 className="mt-2 font-serif text-4xl text-[#27352b]">Everyday pieces with a personal touch.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => <CategoryItem category={category} key={category.name} />)}
        </div>
      </section>

      {!loading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
    </main>
  );
};

export default HomePage;
