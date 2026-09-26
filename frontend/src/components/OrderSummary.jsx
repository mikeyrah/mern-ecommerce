import React, { useState } from 'react'
import {motion} from "framer-motion";
import { LockKeyhole, MapPin, MoveRight, ShoppingBag, Truck } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const OrderSummary = () => {
    const {total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
    const [deliveryMethod, setDeliveryMethod] = useState("shipping");

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedSavings = savings.toFixed(2);
    const shippingAmount = deliveryMethod === "shipping" && total < 75 ? 7 : 0;
    const checkoutTotal = total + shippingAmount;

    const handlePayment = async () => {
        try {
            const { data } = await axios.post("/payments/create-checkout-session", {
                products: cart,
                couponCode: isCouponApplied ? coupon?.code : null,
                deliveryMethod,
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
        <fieldset>
            <legend className='text-sm font-semibold text-[#354139]'>How would you like your order?</legend>
            <div className='mt-3 grid gap-3'>
                <DeliveryOption active={deliveryMethod === "shipping"} onClick={() => setDeliveryMethod("shipping")} icon={Truck} title="Ship my order" detail={total >= 75 ? "Free · 3–5 business days" : "$7.00 · 3–5 business days"} />
                <DeliveryOption active={deliveryMethod === "pickup"} onClick={() => setDeliveryMethod("pickup")} icon={MapPin} title="Local pickup" detail="Free · 970 N Oak St · 10 AM–6 PM" />
            </div>
            {deliveryMethod === "pickup" && <div className="mt-3 rounded-xl bg-[#f3eee2] px-4 py-3 text-xs leading-5 text-[#687168]"><strong className="text-[#43503f]">Stewart-Tate &amp; Co.</strong><br />970 N Oak St, Jackson, GA 30233<br />Pickup hours are 10 AM–6 PM. We’ll notify you when your order is ready.</div>}
        </fieldset>
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
            <dl className='flex items-center justify-between gap-4'>
                <dt className='text-sm text-[#687168]'>{deliveryMethod === "pickup" ? "Local pickup" : "Shipping"}</dt>
                <dd className='text-sm font-semibold text-[#607660]'>{shippingAmount ? `$${shippingAmount.toFixed(2)}` : "Free"}</dd>
            </dl>
            <dl className='flex items-end justify-between gap-4 border-t border-[#e5dfd3] pt-4'>
                <dt><span className='block font-semibold text-[#27352b]'>Estimated total</span><span className='mt-1 block text-xs text-[#858c85]'>Shipping calculated at checkout</span></dt>
                <dd className='font-serif text-2xl font-semibold text-[#b58a34]'>${checkoutTotal.toFixed(2)}</dd>
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

const DeliveryOption = ({ active, onClick, icon: Icon, title, detail }) => <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-[#6f856c] bg-[#edf3e9] ring-2 ring-[#dce7d9]" : "border-[#ddd7ca] bg-white hover:border-[#9aaa99]"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? "bg-[#6f856c] text-white" : "bg-[#efeee9] text-[#687168]"}`}><Icon size={18} /></span><span><strong className="block text-sm text-[#354139]">{title}</strong><span className="mt-0.5 block text-xs text-[#7a827b]">{detail}</span></span></button>;
