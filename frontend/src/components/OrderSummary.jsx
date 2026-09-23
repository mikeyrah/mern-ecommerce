import React from 'react'
import {motion} from "framer-motion";
import { LockKeyhole, MoveRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const OrderSummary = () => {
    const {total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    const handlePayment = async () => {
        try {
            const { data } = await axios.post("/payments/create-checkout-session", {
                products: cart,
                couponCode: isCouponApplied ? coupon?.code : null,
            });

            if (!data.url) throw new Error("Checkout URL was not returned");
            window.location.assign(data.url);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to start checkout");
        }
    }
  return (
  <motion.div
  className='overflow-hidden rounded-[1.5rem] border border-[#d9d3c5] bg-white shadow-[0_16px_45px_rgba(70,63,43,0.09)]'
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  >
    <div className='border-b border-[#e5dfd3] bg-[#eef1e8] px-6 py-5'><p className='text-xs font-bold uppercase tracking-[0.18em] text-[#718674]'>Order summary</p><h2 className='mt-1 font-serif text-2xl text-[#27352b]'>Ready for your ritual</h2></div>

    <div className='space-y-5 p-6'>
        <div className='space-y-3'>
            <dl className='flex items-center justify-between gap-4'>
                <dt className='text-sm text-[#687168]'>Subtotal</dt>
                <dd className='text-sm font-semibold text-[#354139]'>${formattedSubtotal}</dd>
            </dl>

            {savings > 0 && (
                <dl className='flex items-center justify-between gap-4'>
                    <dt className='text-sm text-[#687168]'>Savings</dt>
                    <dd className='text-sm font-semibold text-[#6f856c]'>-${formattedSavings}</dd>
                </dl>
            )}

            {coupon && isCouponApplied && (
                <dl className='flex items-center justify-between gap-4'>
                    <dt className='text-sm text-[#687168]'>Coupon ({coupon.code})</dt>
                    <dd className='text-sm font-semibold text-[#6f856c]'>-{coupon.discountPercentage}%</dd>
                </dl>
            )}
            <dl className='flex items-end justify-between gap-4 border-t border-[#e5dfd3] pt-4'>
                <dt><span className='block font-semibold text-[#27352b]'>Estimated total</span><span className='mt-1 block text-xs text-[#858c85]'>Shipping calculated at checkout</span></dt>
                <dd className='font-serif text-2xl font-semibold text-[#b58a34]'>${formattedTotal}</dd>
            </dl>
        </div>

        <motion.button
        className='flex w-full items-center justify-center gap-2 rounded-full bg-[#314b3b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263d30] focus:outline-none focus:ring-4 focus:ring-[#dce7d9]'
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}

        >
            <LockKeyhole size={16} /> Secure checkout
        </motion.button>

        <div className='flex items-center justify-center gap-2'>
            <span className='text-sm text-[#92988f]'>or</span>
            <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm font-semibold text-[#607660] transition hover:text-[#314b3b]'
            >
                Continue Shopping
                <MoveRight size={16} />
            </Link>
        </div>
        <div className='flex items-center justify-center gap-2 border-t border-[#eee9df] pt-4 text-xs text-[#80877f]'><ShoppingBag size={14} /> Your items are reserved through checkout</div>
    </div>
  </motion.div>
  );
};

export default OrderSummary;
