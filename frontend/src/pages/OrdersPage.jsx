import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Box, CalendarDays, MapPin, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import axios from "../lib/axios";

const statusStyles = {
  placed: "bg-[#f5ead2] text-[#8a6826]",
  processing: "bg-[#e7eee3] text-[#526b57]",
  shipped: "bg-[#e4edf1] text-[#466473]",
  delivered: "bg-[#dcebdd] text-[#3f6647]",
  cancelled: "bg-[#f3e2df] text-[#895149]",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/orders").then(({ data }) => setOrders(data.orders || [])).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your orders")).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f8f6ef] pb-20">
      <section className="border-b border-[#ded8ca] bg-[#eef1e8] px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Your purchases</p><h1 className="mt-3 font-serif text-4xl text-[#203128] sm:text-6xl">Orders &amp; deliveries</h1><p className="mt-4 max-w-2xl leading-7 text-[#657168]">Follow every thoughtful find from confirmation to your doorstep.</p></div></section>

      <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
        {loading ? <div className="grid gap-5">{[1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.75rem] bg-[#e6e9df]" />)}</div> : error ? <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</div> : !orders.length ? <EmptyOrders /> : (
          <div className="space-y-6">{orders.map((order) => <OrderCard key={order._id} order={order} />)}</div>
        )}
      </section>
    </main>
  );
};

const OrderCard = ({ order }) => {
  const address = order.shippingAddress;
  return <article className="overflow-hidden rounded-[1.75rem] border border-[#ded8ca] bg-white shadow-[0_15px_45px_rgba(49,75,59,0.07)]">
    <header className="flex flex-col justify-between gap-4 border-b border-[#e7e1d6] bg-[#fbfaf6] px-6 py-5 sm:flex-row sm:items-center">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#78907b]">Order {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</p><p className="mt-1 flex items-center gap-2 text-sm text-[#687168]"><CalendarDays size={15} /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p></div>
      <span className={`w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${statusStyles[order.fulfillmentStatus] || statusStyles.placed}`}>{order.fulfillmentStatus}</span>
    </header>
    <div className="grid gap-7 p-6 lg:grid-cols-[1fr_auto]">
      <div className="space-y-4">{order.products.map((item) => {
        const product = item.product;
        const image = item.image || product?.images?.[0] || product?.image;
        return <div key={item._id} className="flex items-center gap-4">{image ? <img src={image} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#eef1e8]"><Box className="text-[#78907b]" /></span>}<div><p className="font-serif text-lg text-[#27352b]">{item.name || product?.name || "Product"}</p><p className="mt-1 text-sm text-[#747c75]">Qty {item.quantity} · ${Number(item.price).toFixed(2)}</p></div></div>;
      })}</div>
      <div className="min-w-64 space-y-4 rounded-2xl bg-[#f4f3ed] p-5">
        <div className="flex justify-between gap-8"><span className="text-sm text-[#747c75]">Total</span><strong className="font-serif text-xl text-[#b58a34]">${Number(order.totalAmount).toFixed(2)}</strong></div>
        {address?.line1 && <div className="flex gap-3 border-t border-[#dddace] pt-4 text-sm text-[#687168]"><MapPin size={17} className="mt-0.5 shrink-0 text-[#78907b]" /><span>{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.postalCode}</span></div>}
        {order.trackingNumber && <div className="flex gap-3 border-t border-[#dddace] pt-4 text-sm"><Truck size={17} className="text-[#78907b]" /><span><strong className="block text-[#43503f]">{order.carrier || "Shipment"}</strong><span className="text-[#687168]">{order.trackingNumber}</span></span></div>}
      </div>
    </div>
  </article>;
};

const EmptyOrders = () => <div className="rounded-[2rem] border border-[#ded8ca] bg-white/70 px-6 py-20 text-center"><span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e7eee3] text-[#607660]"><PackageCheck size={38} strokeWidth={1.3} /></span><h2 className="mt-7 font-serif text-3xl text-[#203128]">Your first order is waiting to be discovered.</h2><p className="mx-auto mt-3 max-w-md leading-7 text-[#68746b]">When you place an order, its progress and delivery details will appear here.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#314b3b] px-7 py-3.5 text-sm font-semibold text-white">Start shopping <ArrowRight size={16} /></Link></div>;

export default OrdersPage;
