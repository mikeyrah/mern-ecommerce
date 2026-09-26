import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader, MapPin, Package, Save, Search, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const statuses = ["placed", "processing", "shipped", "delivered", "cancelled"];

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);

  const loadOrders = async () => {
    try { const { data } = await axios.get("/orders/admin"); setOrders(data.orders || []); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const matchesStatus = filter === "all" || order.fulfillmentStatus === filter;
    const haystack = `${order.orderNumber} ${order.user?.name} ${order.user?.email}`.toLowerCase();
    return matchesStatus && haystack.includes(search.trim().toLowerCase());
  }), [filter, orders, search]);

  const updateLocal = (id, field, value) => setOrders((current) => current.map((order) => order._id === id ? { ...order, [field]: value } : order));

  const saveOrder = async (order) => {
    setSaving(order._id);
    try {
      const { data } = await axios.patch(`/orders/admin/${order._id}`, { fulfillmentStatus: order.fulfillmentStatus, trackingNumber: order.trackingNumber, carrier: order.carrier, adminNote: order.adminNote });
      setOrders((current) => current.map((item) => item._id === order._id ? data.order : item));
      toast.success("Order updated");
    } catch (error) { toast.error(error.response?.data?.message || "Unable to update order"); }
    finally { setSaving(null); }
  };

  if (loading) return <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center text-[#687064]"><Loader className="mx-auto mb-3 animate-spin" /> Loading orders…</div>;

  return <section className="mx-auto max-w-6xl">
    <div className="flex flex-col justify-between gap-5 rounded-[1.5rem] border border-[#e1dacb] bg-white p-6 shadow-sm lg:flex-row lg:items-end">
      <div><p className="section-kicker text-[#7c9279]">Fulfillment desk</p><h2 className="mt-2 font-serif text-3xl text-[#27352b]">Order management</h2><p className="mt-2 text-sm text-[#687064]">Review purchases, update fulfillment, and add shipment tracking.</p></div>
      <label className="relative block w-full lg:max-w-xs"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c9279]" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order or customer" className="w-full rounded-full border border-[#dcd5c5] bg-[#fdfcf9] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#7c9279] focus:ring-4 focus:ring-[#e6eee3]" /></label>
    </div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{["all", ...statuses].map((status) => <button key={status} onClick={() => setFilter(status)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ${filter === status ? "border-[#6f856c] bg-[#6f856c] text-white" : "border-[#d9d3c5] bg-white text-[#687064]"}`}>{status}</button>)}</div>

    <div className="mt-5 space-y-4">{visibleOrders.length ? visibleOrders.map((order) => {
      const isOpen = expanded === order._id;
      return <article key={order._id} className="overflow-hidden rounded-[1.5rem] border border-[#e1dacb] bg-white shadow-[0_10px_30px_rgba(68,62,45,0.05)]">
        <button onClick={() => setExpanded(isOpen ? null : order._id)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1.2fr_1fr_auto_auto] sm:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7c9279]">{order.orderNumber || `#${order._id.slice(-6)}`}</p><p className="mt-1 font-semibold text-[#354139]">{order.user?.name || "Customer"}</p><p className="text-xs text-[#858c85]">{order.user?.email || order.customerEmail}</p></div>
          <div><p className="text-sm text-[#687064]">{new Date(order.createdAt).toLocaleDateString()}</p><p className="mt-1 text-sm">{order.products.reduce((sum, item) => sum + item.quantity, 0)} items</p></div>
          <div><p className="font-serif text-xl font-semibold text-[#b58a34]">${Number(order.totalAmount).toFixed(2)}</p><span className="mt-1 inline-block rounded-full bg-[#e7eee3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#536c58]">{order.fulfillmentStatus}</span></div>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
        {isOpen && <div className="border-t border-[#e8e2d7] bg-[#fbfaf6] p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c9279]">Items</h3><div className="mt-3 space-y-3">{order.products.map((item) => <div key={item._id} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#eef1e8]">{item.image || item.product?.image ? <img src={item.image || item.product?.image} alt="" className="h-full w-full object-cover" /> : <Package size={18} />}</span><div><p className="font-semibold text-[#354139]">{item.name || item.product?.name}</p><p className="text-xs text-[#7c847d]">{item.quantity} × ${Number(item.price).toFixed(2)}</p></div></div>)}</div>{order.shippingAddress?.line1 && <div className="mt-4 flex gap-3 rounded-xl bg-white p-4 text-sm text-[#687064]"><MapPin size={18} className="shrink-0 text-[#7c9279]" /><span>{order.shippingAddress.name}<br />{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</span></div>}</div>
            <div className="space-y-4"><label className="block text-sm font-semibold text-[#43503f]">Fulfillment status<select value={order.fulfillmentStatus} onChange={(event) => updateLocal(order._id, "fulfillmentStatus", event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd5c5] bg-white px-4 py-3 font-normal capitalize">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><Field label="Carrier" value={order.carrier || ""} onChange={(value) => updateLocal(order._id, "carrier", value)} placeholder="USPS, UPS…" /><Field label="Tracking number" value={order.trackingNumber || ""} onChange={(value) => updateLocal(order._id, "trackingNumber", value)} placeholder="Tracking number" /></div><label className="block text-sm font-semibold text-[#43503f]">Internal note<textarea value={order.adminNote || ""} onChange={(event) => updateLocal(order._id, "adminNote", event.target.value)} rows="3" className="mt-2 w-full rounded-xl border border-[#dcd5c5] bg-white px-4 py-3 font-normal" placeholder="Visible only to administrators" /></label><button onClick={() => saveOrder(order)} disabled={saving === order._id} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#314b3b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving === order._id ? <Loader size={17} className="animate-spin" /> : <Save size={17} />} Save order</button>{order.trackingNumber && <p className="flex items-center gap-2 text-xs text-[#687064]"><Truck size={15} /> {order.carrier || "Carrier"}: {order.trackingNumber}</p>}</div>
          </div>
        </div>}
      </article>;
    }) : <div className="rounded-[1.5rem] border border-dashed border-[#cfc8ba] bg-white/60 py-16 text-center text-[#687064]">No orders match this view.</div>}</div>
  </section>;
};

const Field = ({ label, value, onChange, placeholder }) => <label className="block text-sm font-semibold text-[#43503f]">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#dcd5c5] bg-white px-4 py-3 font-normal" /></label>;

export default OrdersTab;
