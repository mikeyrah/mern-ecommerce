import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../lib/axios';
import { useCartStore } from '../stores/useCartStore';
import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import ReactConfetti from 'react-confetti';

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const [message, setMessage] = useState("Confirming your payment…");
  const [orderId, setOrderId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("shipping");
  const [pickupLocation, setPickupLocation] = useState("");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || hasConfirmed.current) {
      if (!sessionId) setMessage("Missing checkout session information.");
      return;
    }

    hasConfirmed.current = true;
    axios.post("/payments/checkout-success", { sessionId })
      .then(({ data }) => {
        clearCart();
        setOrderId(data.orderId);
        setDeliveryMethod(data.deliveryMethod || "shipping");
        setPickupLocation(data.pickupLocation || "");
        setMessage(data.message || "Payment successful. Your order is confirmed.");
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || "Unable to confirm this payment.");
      });
  }, [clearCart, searchParams]);

  return (
    <div className='h-screen flex items-center justify-center px-4'>
      <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={700}
        gravity={0.1}
        style={{ zIndex: 99 }}
      />

      <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
        <div className='p-6 sm:p-8'>
          <div className='flex justify-center'>
            <CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
            Purchase Successful!
          </h1>

          <p className='text-gray-300 text-center mb-2'>
            {message}
          </p>
          <p className='text-emerald-400 text-center text-sm mb-6'>
            Check your email for the order confirmation and receipt.
          </p>
          <div className='bg-gray-700 rounded-lg p-4 mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>Order number</span>
              <span className='text-sm font-semibold text-emerald-400'>
                {orderId ? `#${orderId.slice(-6).toUpperCase()}` : "Processing"}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-400'>{deliveryMethod === "pickup" ? "Fulfillment" : "Estimated delivery"}</span>
              <span className='text-right text-sm font-semibold text-emerald-400'>{deliveryMethod === "pickup" ? (pickupLocation || "Local pickup") : "3-5 business days"}</span>
            </div>
          </div>

          <div className='space-y-4'>
            <button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg
            transition duration-300 flex items-center justify-center'>
              <HandHeart className='mr-2' size={18} />
              Thanks for trusting us!
            </button>
            <Link to='/' className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg
            transition duration-300 flex items-center justify-center'>
              Continue Shopping
              <ArrowRight className='ml-2' size={18} />
            </Link>
            {orderId && <Link to='/orders' className='flex w-full items-center justify-center rounded-lg border border-emerald-600 px-4 py-2 font-bold text-emerald-400 transition hover:bg-gray-700'>View my orders</Link>}
          </div>
          </div>
        </div>
      </div>
  );
};

export default PurchaseSuccessPage;
