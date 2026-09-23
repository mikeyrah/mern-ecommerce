import React from 'react'
import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from '../stores/useCartStore';
import { Link } from 'react-router-dom';

const CartItem = ({item}) => {
    const { removeFromCart, updateQuantity } = useCartStore()

  return (
    <article className='rounded-[1.5rem] border border-[#dfd8c9] bg-white p-4 shadow-[0_12px_35px_rgba(70,63,43,0.06)] transition hover:shadow-[0_18px_45px_rgba(70,63,43,0.1)] sm:p-5'>
        <div className='grid grid-cols-[6rem_minmax(0,1fr)] gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6'>
        <Link to={`/products/${item._id}`} className='self-stretch overflow-hidden rounded-2xl bg-[#eef1e8]'>
            <img className='h-full min-h-32 w-full object-cover transition duration-500 hover:scale-105' src={item.images?.[0] || item.image} alt={item.name} />
        </Link>
        <div className='min-w-0 self-center'>
            <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-[#78907b]'>{item.brand?.replaceAll('-', ' ') || 'The Krafted Charm'}</p>
            <Link to={`/products/${item._id}`} className='mt-1 block font-serif text-xl text-[#27352b] transition hover:text-[#6f856c] sm:text-2xl'>{item.name}</Link>
            <p className='mt-2 line-clamp-2 text-sm leading-6 text-[#707970]'>{item.description}</p>
            <button className='mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#996052] transition hover:text-[#783f2f]' onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name} from cart`}><Trash size={14} /> Remove</button>
        </div>
        <div className='col-span-2 flex items-center justify-between border-t border-[#ece7dd] pt-4 sm:col-span-1 sm:block sm:min-w-32 sm:border-0 sm:pt-0 sm:text-right'>
            <div className='inline-flex items-center gap-3 rounded-full border border-[#d8d5ca] bg-[#faf9f5] p-1'>
                <button
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4f6053] transition hover:bg-[#e6ede2] focus:outline-none focus:ring-2 focus:ring-[#9bad99]'
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                aria-label={`Decrease ${item.name} quantity`}
                >
                    <Minus size={14} />
                </button>
                <p className='min-w-4 text-center text-sm font-semibold text-[#314b3b]'>{item.quantity}</p>
                <button
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4f6053] transition hover:bg-[#e6ede2] focus:outline-none focus:ring-2 focus:ring-[#9bad99]'
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                aria-label={`Increase ${item.name} quantity`}
                >
                    <Plus size={14} />
                </button>
            </div>
            <p className='font-serif text-xl font-semibold text-[#b58a34] sm:mt-4'>${(Number(item.price) * item.quantity).toFixed(2)}</p>
            <p className='hidden text-xs text-[#8a918b] sm:block'>${Number(item.price).toFixed(2)} each</p>
        </div>
        </div>
    </article>
  )
}

export default CartItem
