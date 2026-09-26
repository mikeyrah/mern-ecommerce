import React, { useEffect } from 'react'
import { BarChart, ClipboardList, PlusCircle, ShoppingBasket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AnalyticsTab from '../components/AnalyticsTab';
import CreateProductForm from '../components/CreateProductForm';
import ProductsList from '../components/ProductsList';
import { useProductStore } from '../stores/useProductStore';
import OrdersTab from '../components/OrdersTab';

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
  const [activeTab,setActiveTab] = useState("create");
  const {fetchAllProducts} = useProductStore()

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);
  return (
    <main className='brand-shell min-h-screen px-4 py-12 sm:px-8'>
      <motion.section className='mx-auto max-w-6xl rounded-[2rem] border border-[#e1dacb] bg-white p-8 shadow-[0_16px_50px_rgba(68,62,45,0.08)] sm:p-10'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        >
          <p className='section-kicker text-[#B58A34]'>Stewart-Tate &amp; Co. operations</p>
          <div className='mt-3 flex flex-wrap items-center justify-between gap-4'><h1 className='font-serif text-4xl text-[#27352b]'>Brand Studio</h1><span className='inline-flex items-center gap-2 rounded-full bg-[#e6eee3] px-4 py-2 text-sm font-semibold text-[#586d55]'><Sparkles size={16} /> Curate with intention</span></div>
        </motion.section>

        <div className='mx-auto mt-8 flex max-w-6xl flex-wrap gap-2 rounded-2xl border border-[#e1dacb] bg-white p-2 shadow-sm'>
          {tabs.map((tab) => (
            <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-xl transition-colors duration-200 ${
              activeTab === tab.id
              ? "bg-[#6f856c] text-white shadow-sm"
              : "text-[#596259] hover:bg-[#f3eee2]"
            }`}
            >
            <tab.icon className='mr-2 h-5 w-5' />
            {tab.label}
            </button>
          ))}
        </div>
        <div className='mt-8'>{activeTab === "create" && <CreateProductForm />}{activeTab === "products" && <ProductsList />}{activeTab === "orders" && <OrdersTab />}{activeTab === "analytics" && <AnalyticsTab />}</div>

    </main>
  )
}

export default AdminPage
