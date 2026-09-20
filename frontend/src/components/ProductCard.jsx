import React from 'react'
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

 const ProductCard = ({product}) => {
    const { user } = useUserStore();
    const { addToCart } = useCartStore();
    const handleAddToCart = () => {
        if(!user) {
            toast.error("Please login to add products to cart", { id: "login" });
            return;
        } else {
            addToCart(product);
        }
    };

  return (
    <div className='flex w-full relative flex-col overflow-hidden rounded-2xl border border-[#e1dacb] bg-white shadow-[0_12px_28px_rgba(73,65,43,0.08)]'>
        <Link to={`/products/${product._id}`} className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
            {(product.isNew || (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000) && <span className="absolute left-3 top-3 z-10 rounded-full bg-[#314b3b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">New</span>}
            <img className='object-cover w-full transition duration-500 hover:scale-105' src={product.images?.[0] || product.image} alt={product.name} />
            <div className='absolute inset-0 bg-black bg-opacity-20' />
        </Link>

        <div className='mt-4 px-5 pb-5'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#7C9279]'>{product.brand?.replaceAll('-', ' ') || 'The Krafted Charm'}</p>
            <Link to={`/products/${product._id}`}><h5 className='mt-1 text-xl font-semibold tracking-tight text-[#27352b] hover:text-[#6f856c]'>{product.name}</h5></Link>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#7a817b]"><Star size={14} className="fill-[#b58a34] text-[#b58a34]" /><span>{Number(product.ratingAverage || 0).toFixed(1)} ({product.ratingCount || 0})</span></div>
            <div className='mt-2 mb-5 flex items-center justify-between'>
                <p>
                <span className='text-3xl font-bold text-[#B58A34]'>${Number(product.price || 0).toFixed(2)}</span>
                </p>
            </div>
            <button
            className='flex items-center justify-center rounded-lg bg-[#6f856c] px-5 py-2.5 text-center text-sm
            font-medium
            text-white hover:bg-[#586d55] focus:outline-none focus:ring-4 focus:ring-[#dce7d9]'
            onClick={handleAddToCart}
            >
                <ShoppingCart size={22} className='mr-2' />
                Add to cart
            </button>
        </div>
    </div>
  );
};

export default ProductCard
