import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Leaf, Loader, ShoppingBag, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

const Stars = ({ value = 0, size = 18 }) => (
  <span className="inline-flex" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} className={star <= Math.round(value) ? "fill-[#b58a34] text-[#b58a34]" : "fill-transparent text-[#c9c4b7]"} />)}
  </span>
);

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return [...new Set([...(product.images || []), product.image].filter(Boolean))];
  }, [product]);

  const isRecentlyAdded = product && (product.isNew || (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000);
  const isOutOfStock = product.trackInventory && Number(product.stock) <= 0;
  const isLowStock = product.trackInventory && product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToBag = () => {
    if (isOutOfStock) return toast.error("This product is currently out of stock");
    if (!user) return toast.error("Please sign in to add this product to your bag");
    addToCart(product);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Please sign in to leave a review");
    setReviewing(true);
    try {
      const { data } = await axios.post(`/products/${id}/reviews`, { rating, comment });
      setProduct(data.product);
      setComment("");
      toast.success("Your review is now live");
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
          <p className="mt-6 text-3xl font-semibold text-[#314b3b]">${Number(product.price).toFixed(2)}</p>
          {isOutOfStock ? <p className="mt-3 text-sm font-semibold text-[#92584d]">Currently out of stock</p> : isLowStock ? <p className="mt-3 text-sm font-semibold text-[#9a742d]">Only {product.stock} left in stock</p> : product.trackInventory ? <p className="mt-3 text-sm font-semibold text-[#607660]">In stock and ready to ship</p> : null}
          <p className="mt-6 text-base leading-7 text-[#5e6961]">{product.description}</p>

          <button type="button" onClick={handleAddToBag} disabled={isOutOfStock} className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#314b3b] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#263d30] disabled:cursor-not-allowed disabled:bg-[#aaa9a2]"><ShoppingBag size={19} /> {isOutOfStock ? "Sold out" : "Add to bag"}</button>
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
              <p className="section-kicker text-[#7c9279]">Live testimonials</p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">What customers are saying</h2>
              <div className="mt-6 flex items-center gap-4"><span className="font-serif text-5xl">{Number(product.ratingAverage || 0).toFixed(1)}</span><div><Stars value={product.ratingAverage} /><p className="mt-1 text-sm text-[#707971]">Based on {product.ratingCount || 0} verified customer review{product.ratingCount === 1 ? "" : "s"}</p></div></div>

              <form onSubmit={submitReview} className="mt-9 rounded-2xl border border-[#ddd8cc] bg-[#f8f6ef] p-5">
                <h3 className="font-serif text-2xl">Share your experience</h3>
                {user ? <><div className="mt-4 flex gap-1" aria-label="Choose star rating">{[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`}><Star size={25} className={star <= rating ? "fill-[#b58a34] text-[#b58a34]" : "text-[#bbb6aa]"} /></button>)}</div><textarea required value={comment} onChange={(event) => setComment(event.target.value)} rows="4" maxLength="1000" className="mt-4 w-full rounded-xl border border-[#d8d2c5] bg-white p-3 text-sm outline-none focus:border-[#7c9279]" placeholder="Tell others what you loved..." /><button disabled={reviewing} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#6f856c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{reviewing && <Loader size={15} className="animate-spin" />} Publish review</button></> : <p className="mt-3 text-sm text-[#687269]"><Link to="/login" className="font-semibold underline">Sign in</Link> to leave a star rating and review.</p>}
              </form>
            </div>

            <div className="space-y-4">
              {product.reviews?.length ? [...product.reviews].reverse().map((review) => <article key={review._id} className="rounded-2xl border border-[#e0dbcf] bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-[#314b3b]">{review.username}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#849087]">Verified customer</p></div><Stars value={review.rating} size={16} /></div><p className="mt-5 leading-7 text-[#5f6962]">“{review.comment}”</p><time className="mt-4 block text-xs text-[#8a918c]">{new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time></article>) : <div className="rounded-[2rem] border border-dashed border-[#c9cfc5] bg-[#f2f5ef] px-8 py-16 text-center"><Leaf className="mx-auto text-[#7c9279]" /><h3 className="mt-4 font-serif text-2xl">Be the first to share your ritual</h3><p className="mt-2 text-sm text-[#6d776f]">Customer testimonials will appear here live after they are submitted.</p></div>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
