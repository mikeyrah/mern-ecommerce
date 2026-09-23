import React from 'react';
import { useCartStore } from '../stores/useCartStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, ShoppingBag } from 'lucide-react';
import CartItem from '../components/CartItem';
import PeopleAlsoBought from '../components/PeopleAlsoBought';
import OrderSummary from '../components/OrderSummary';
import GiftCouponCard from '../components/GiftCouponCard';

const CartPage = () => {
    const { cart } = useCartStore();

  return (
    <main className='min-h-[75vh] bg-[#f8f6ef] pb-20'>
        <section className='border-b border-[#ded8ca] bg-[#eef1e8] px-5 py-12 sm:px-8 sm:py-16'>
            <div className='mx-auto max-w-7xl'>
                <p className='text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]'>Your selection</p>
                <div className='mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
                    <div>
                        <h1 className='font-serif text-4xl text-[#203128] sm:text-6xl'>Your shopping bag</h1>
                        <p className='mt-3 text-sm leading-6 text-[#657168] sm:text-base'>{cart.length ? `${cart.reduce((count, item) => count + item.quantity, 0)} thoughtfully chosen item${cart.reduce((count, item) => count + item.quantity, 0) === 1 ? "" : "s"}, ready when you are.` : "A quiet space for the things that catch your eye."}</p>
                    </div>
                    {cart.length > 0 && <div className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#58705e]'><LockKeyhole size={16} /> Secure checkout</div>}
                </div>
            </div>
        </section>

        <div className='mx-auto max-w-7xl px-5 sm:px-8'>
    <div className='mt-10 gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start xl:gap-12'>
<motion.div
    className='min-w-0'
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    >
        {cart.length === 0 ? (
            <EmptyCartUI />
        ) : (
            <div className='space-y-4'>
                {cart.map((item) => (
                    <CartItem key={item._id} item={item} />
                ))}
            </div>
        )}
        {cart.length > 0 && <PeopleAlsoBought />}
    </motion.div>

    {cart.length > 0 && (
        <motion.div
        className='mt-8 space-y-5 lg:sticky lg:top-28 lg:mt-0'
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        >
            <OrderSummary />
            <GiftCouponCard />
        </motion.div>
    )}
    </div>
        </div>
    </main>
  );
};

export default CartPage;

const EmptyCartUI = () => (
    <motion.div
    className='flex flex-col items-center justify-center rounded-[2rem] border border-[#ded8ca] bg-white/70 px-6 py-20 text-center shadow-[0_18px_50px_rgba(49,75,59,0.06)]'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    >
        <span className='flex h-24 w-24 items-center justify-center rounded-full bg-[#e7eee3] text-[#607660]'><ShoppingBag size={38} strokeWidth={1.3} /></span>
        <p className='mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#78907b]'>Your next ritual awaits</p>
        <h3 className='mt-3 font-serif text-3xl text-[#203128] sm:text-4xl'>Your bag is ready for something beautiful.</h3>
        <p className='mt-3 max-w-md leading-7 text-[#68746b]'>Explore small-batch skincare, handmade pieces, and sweet celebrations from our family of brands.</p>
        <Link
        className='mt-7 inline-flex items-center gap-2 rounded-full bg-[#314b3b] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263d30]'
        to='/'
        >
            Explore the collection <ArrowRight size={16} />
        </Link>
    </motion.div>
);
