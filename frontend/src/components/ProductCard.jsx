import React from 'react'
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';

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
        <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
            <img className='object-cover w-full' src={product.image} alt='product image' />
            <div className='absolute inset-0 bg-black bg-opacity-20' />
        </div>

        <div className='mt-4 px-5 pb-5'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#7C9279]'>{product.brand?.replaceAll('-', ' ') || 'The Krafted Charm'}</p>
            <h5 className='mt-1 text-xl font-semibold tracking-tight text-[#27352b]'>{product.name}</h5>
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
