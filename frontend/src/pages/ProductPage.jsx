import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, Leaf, Loader, ShoppingBag, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import Seo from "../components/Seo";

const Stars = ({ value = 0, size = 18 }) => (
  <span className="inline-flex" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} className={star <= Math.round(value) ? "fill-[#b58a34] text-[#b58a34]" : "fill-transparent text-[#c9c4b7]"} />)}
  </span>
);

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { isSaved, toggleWishlist } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewAccess, setReviewAccess] = useState({ loading: false, eligible: false, review: null });

  useEffect(() => {
    setLoading(true);
    setSelectedVariantId("");
    axios.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) { setReviewAccess({ loading: false, eligible: false, review: null }); return; }
    setReviewAccess((current) => ({ ...current, loading: true }));
    axios.get(`/products/${id}/review-eligibility`)
      .then(({ data }) => {
        setReviewAccess({ loading: false, eligible: data.eligible, review: data.review });
        if (data.review) { setRating(data.review.rating); setComment(data.review.comment); }
      })
      .catch(() => setReviewAccess({ loading: false, eligible: false, review: null }));
  }, [id, user]);

  const images = useMemo(() => {
    if (!product) return [];
    return [...new Set([...(product.images || []), product.image].filter(Boolean))];
  }, [product]);

  const selectedVariant = product?.variants?.find((variant) => variant._id === selectedVariantId) || null;
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;

  const isRecentlyAdded = product && (product.isNew || (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000);
  const isOutOfStock = Boolean(selectedVariant ? selectedVariant.trackInventory && Number(selectedVariant.stock) <= 0 : product?.variants?.length ? product.variants.every((variant) => variant.trackInventory && Number(variant.stock) <= 0) : product?.trackInventory && Number(product.stock) <= 0);
  const isLowStock = Boolean(selectedVariant ? selectedVariant.trackInventory && selectedVariant.stock > 0 && selectedVariant.stock <= product.lowStockThreshold : !product?.variants?.length && product?.trackInventory && product.stock > 0 && product.stock <= product.lowStockThreshold);
  const saved = product ? isSaved(product._id) : false;

  const handleAddToBag = () => {
    if (isOutOfStock) return toast.error("This product is currently out of stock");
    if (!user) return toast.error("Please sign in to add this product to your bag");
    if (product.variants?.length && !selectedVariant) return toast.error(`Please choose a ${product.variantName || "product option"}`);
    addToCart(product, selectedVariant);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Please sign in to leave a review");
    setReviewing(true);
    try {
      const { data } = await axios.post(`/products/${id}/reviews`, { rating, comment });
      setProduct(data.product);
      setReviewAccess({ loading: false, eligible: true, review: { rating, comment, status: "pending" } });
      toast.success(data.message || "Your review is awaiting approval");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit review");
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f6ef]"><Loader className="animate-spin text-[#6f856c]" /></main>;
  if (!product) return <main className="min-h-[70vh] bg-[#f8f6ef] px-6 py-32 text-center"><h1 className="font-serif text-4xl text-[#27352b]">Product not found</h1><Link to="/" className="mt-5 inline-block text-[#6f856c]">Return home</Link></main>;

  return (
    <main className="min-h-screen bg-[#f8f6ef] text-[#27352b]">
      <Seo title={product.name} description={(product.description || `Shop ${product.name} from Stewart-Tate & Co.`).slice(0, 160)} image={images[0]} type="product" path={`/products/${product._id}`} schema={{ "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description || product.name, image: images, sku: product.sku || product._id, brand: { "@type": "Brand", name: product.brand?.replaceAll("-", " ") || "Stewart-Tate & Co." }, offers: { "@type": "Offer", priceCurrency: "USD", price: Number(product.price).toFixed(2), availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", url: new URL(`/products/${product._id}`, window.location.origin).toString() }, ...(product.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.ratingAverage).toFixed(1), reviewCount: product.ratingCount }, review: (product.reviews || []).map((review) => ({ "@type": "Review", author: { "@type": "Person", name: review.username }, reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 }, reviewBody: review.comment, datePublished: review.createdAt })) } : {}) }} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
            {images.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${selectedImage === index ? "border-[#6f856c]" : "border-transparent"}`}><img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}
          </div>
          <div className="order-1 relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#ebece6] sm:order-2 lg:min-h-[620px]">
            {isRecentlyAdded && <span className="absolute left-5 top-5 z-10 rounded-full bg-[#314b3b] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">New</span>}
            <img src={images[selectedImage] || product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover lg:min-h-[620px]" />
          </div>
        </div>

        <div className="lg:py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7c9279]">{product.brand?.replaceAll("-", " ")}</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-[#27352b] sm:text-6xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3"><Stars value={product.ratingAverage} /><a href="#reviews" className="text-sm text-[#667168] underline underline-offset-4">{product.ratingCount || 0} review{product.ratingCount === 1 ? "" : "s"}</a></div>
          <p className="mt-6 text-3xl font-semibold text-[#314b3b]">${Number(displayPrice).toFixed(2)}</p>
          {product.variants?.length ? <fieldset className="mt-7"><legend className="text-sm font-bold text-[#43503f]">Choose {product.variantName || "an option"}</legend><div className="mt-3 flex flex-wrap gap-2">{product.variants.map((variant) => { const unavailable = variant.trackInventory && Number(variant.stock) <= 0; return <button type="button" key={variant._id} disabled={unavailable} onClick={() => setSelectedVariantId(variant._id)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${selectedVariantId === variant._id ? "border-[#314b3b] bg-[#314b3b] text-white" : "border-[#cfc8ba] bg-white text-[#526057]"}`}>{variant.label}{variant.price !== undefined && variant.price !== null ? ` · $${Number(variant.price).toFixed(2)}` : ""}{unavailable ? " · Sold out" : ""}</button>; })}</div></fieldset> : null}
          {isOutOfStock ? <p className="mt-3 text-sm font-semibold text-[#92584d]">Currently out of stock</p> : isLowStock ? <p className="mt-3 text-sm font-semibold text-[#9a742d]">Only {selectedVariant ? selectedVariant.stock : product.stock} left in stock</p> : (selectedVariant?.trackInventory || (!product.variants?.length && product.trackInventory)) ? <p className="mt-3 text-sm font-semibold text-[#607660]">In stock and ready to ship</p> : null}
          <p className="mt-6 text-base leading-7 text-[#5e6961]">{product.description}</p>

          <div className="mt-8 grid grid-cols-[1fr_auto] gap-3"><button type="button" onClick={handleAddToBag} disabled={isOutOfStock} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#314b3b] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#263d30] disabled:cursor-not-allowed disabled:bg-[#aaa9a2]"><ShoppingBag size={19} /> {isOutOfStock ? "Sold out" : "Add to bag"}</button><button type="button" onClick={() => user ? toggleWishlist(product) : toast.error("Please sign in to save favorites")} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} className={`flex h-14 w-14 items-center justify-center rounded-full border bg-white ${saved ? "border-[#a15f6c] text-[#a15f6c]" : "border-[#cfc8ba] text-[#657168]"}`}><Heart className={saved ? "fill-current" : ""} /></button></div>
          <p className="mt-3 text-center text-xs text-[#7a827c]">Thoughtfully packed and prepared for you</p>

          <div className="mt-9 divide-y divide-[#d8d4c9] border-y border-[#d8d4c9]">
            <details open className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">Full details <ChevronDown className="transition group-open:rotate-180" size={18} /></summary><p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#657067]">{product.details || product.description}</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">Ingredients <ChevronDown className="transition group-open:rotate-180" size={18} /></summary>{product.ingredients?.length ? <ul className="mt-4 flex flex-wrap gap-2">{product.ingredients.map((ingredient) => <li key={ingredient} className="rounded-full bg-[#e7ede4] px-3 py-1.5 text-sm text-[#506055]">{ingredient}</li>)}</ul> : <p className="mt-4 text-sm text-[#657067]">Ingredient details will be added soon.</p>}</details>
          </div>
        </div>
      </section>

      <section id="reviews" className="border-t border-[#ded9cd] bg-white/70 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
                <p className="section-kicker text-[#7c9279]">Verified testimonials</p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">What customers are saying</h2>
              <div className="mt-6 flex items-center gap-4"><span className="font-serif text-5xl">{Number(product.ratingAverage || 0).toFixed(1)}</span><div><Stars value={product.ratingAverage} /><p className="mt-1 text-sm text-[#707971]">Based on {product.ratingCount || 0} verified customer review{product.ratingCount === 1 ? "" : "s"}</p></div></div>

              <form onSubmit={submitReview} className="mt-9 rounded-2xl border border-[#ddd8cc] bg-[#f8f6ef] p-5">
                <h3 className="font-serif text-2xl">Share your experience</h3>
                {!user ? <p className="mt-3 text-sm text-[#687269]"><Link to="/login" className="font-semibold underline">Sign in</Link> to review a product you purchased.</p> : reviewAccess.loading ? <p className="mt-3 flex items-center gap-2 text-sm text-[#687269]"><Loader size={15} className="animate-spin" /> Checking your purchase…</p> : reviewAccess.eligible ? <>{reviewAccess.review && <p className={`mt-4 rounded-xl px-3 py-2 text-xs font-semibold ${reviewAccess.review.status === "approved" ? "bg-[#e4efe2] text-[#55705a]" : reviewAccess.review.status === "rejected" ? "bg-[#f3e2df] text-[#895149]" : "bg-[#f5ead2] text-[#8a6826]"}`}>Your review is {reviewAccess.review.status}. You can update it below; edits return to moderation.</p>}<div className="mt-4 flex gap-1" aria-label="Choose star rating">{[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`}><Star size={25} className={star <= rating ? "fill-[#b58a34] text-[#b58a34]" : "text-[#bbb6aa]"} /></button>)}</div><textarea required value={comment} onChange={(event) => setComment(event.target.value)} rows="4" maxLength="1000" className="mt-4 w-full rounded-xl border border-[#d8d2c5] bg-white p-3 text-sm outline-none focus:border-[#7c9279]" placeholder="Tell others what you loved..." /><div className="mt-2 flex items-center justify-between text-xs text-[#858c86]"><span>Verified purchase</span><span>{comment.length}/1000</span></div><button disabled={reviewing} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#6f856c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{reviewing && <Loader size={15} className="animate-spin" />} {reviewAccess.review ? "Update review" : "Submit for approval"}</button></> : <p className="mt-3 rounded-xl bg-[#f1eee6] p-4 text-sm leading-6 text-[#687269]">Reviews are reserved for verified purchases. Once you purchase this product, you can share your experience here.</p>}
              </form>
            </div>

            <div className="space-y-4">
              {product.reviews?.length ? [...product.reviews].reverse().map((review) => <article key={review._id} className="rounded-2xl border border-[#e0dbcf] bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-[#314b3b]">{review.username}</p>{review.verifiedPurchase && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#849087]">Verified purchase</p>}</div><Stars value={review.rating} size={16} /></div><p className="mt-5 leading-7 text-[#5f6962]">“{review.comment}”</p><time className="mt-4 block text-xs text-[#8a918c]">{new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time></article>) : <div className="rounded-[2rem] border border-dashed border-[#c9cfc5] bg-[#f2f5ef] px-8 py-16 text-center"><Leaf className="mx-auto text-[#7c9279]" /><h3 className="mt-4 font-serif text-2xl">Be the first to share your ritual</h3><p className="mt-2 text-sm text-[#6d776f]">Approved reviews from verified customers will appear here.</p></div>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
