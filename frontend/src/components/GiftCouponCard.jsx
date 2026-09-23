import React from 'react'
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { BadgePercent, Check, X } from 'lucide-react';

const GiftCouponCard = () => {
    const [userInputCode, setUserInputCode] = useState('');
    const { coupon, isCouponApplied, applyCoupon, getCoupon, removeCoupon } = useCartStore();

    useEffect(() => {
        getCoupon();
    }, [getCoupon]);

    useEffect(() => {
        if(coupon) setUserInputCode(coupon.code);
    }, [coupon]);

    const handleApplyCoupon = async () => {
        if (!userInputCode.trim()) return;
        await applyCoupon(userInputCode.trim());
    }

    const handleRemoveCoupon = () => {
        removeCoupon();
    }
  return (
    <motion.div
    className='space-y-5 rounded-[1.5rem] border border-[#d9d3c5] bg-[#fbfaf6] p-6 shadow-[0_12px_35px_rgba(70,63,43,0.06)]'
    initial={{ opacity: 0, y:20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    >
        <div className='space-y-4'>
            <div>
                <label htmlFor='voucher' className='mb-2 flex items-center gap-2 text-sm font-semibold text-[#3e4b41]'>
                    <BadgePercent size={17} className='text-[#78907b]' /> Gift card or offer code
                </label>
                <input
                type='text'
                id='voucher'
                className='block w-full rounded-xl border border-[#d8d2c5] bg-white p-3 text-sm text-[#314038] placeholder-[#9a9f99] outline-none transition focus:border-[#7c9279] focus:ring-4 focus:ring-[#e6eee3]'
                placeholder='Enter your code'
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value)}
                required
                />
            </div>

            <motion.button
            type='button'
            className='flex w-full items-center justify-center rounded-full border border-[#718674] px-5 py-3 text-sm font-semibold text-[#506657] transition hover:bg-[#e8eee5] focus:outline-none focus:ring-4 focus:ring-[#e6eee3]'
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyCoupon}
            >
                Apply Code
            </motion.button>
        </div>
        {isCouponApplied && coupon && (
            <div className='rounded-xl border border-[#cbd8c8] bg-[#edf4ea] p-4'>
                <h3 className='flex items-center gap-2 text-sm font-semibold text-[#3f5a45]'><Check size={16} /> Code applied</h3>
                <p className='mt-1 text-sm text-[#66736a]'>{coupon.code} · {coupon.discountPercentage}% off</p>

                <motion.button
                type='button'
                className='mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8a5148] hover:text-[#6f3e37]'
                whileTap={{ scale: 0.98 }}
                onClick={handleRemoveCoupon}
                >
                    <X size={14} /> Remove code
                </motion.button>
            </div>
        )}

        {coupon && !isCouponApplied && (
            <div className='border-t border-[#e2ddd2] pt-4'>
                <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-[#78907b]'>Your available offer</h3>
                <p className='mt-2 text-sm text-[#68746b]'>
                    {coupon.code} - {coupon.discountPercentage}% off
                </p>
            </div>
        )}
    </motion.div>
  );
};

export default GiftCouponCard
