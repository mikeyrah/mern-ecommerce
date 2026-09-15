import React from 'react'
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('/analytics');
        setAnalyticsData({
          users: 0,
          products: 0,
          totalSales: 0,
          totalRevenue: 0,
          ...response.data.analyticsData,
        });
        setDailySalesData(
          (response.data.dailySalesData || []).map((day) => ({
            name: day._id,
            sales: day.sales || 0,
            revenue: day.revenue || 0,
          }))
        );
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error.response?.data?.message || 'Unable to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div className='mx-auto max-w-6xl rounded-2xl bg-white p-8 text-center text-[#596259]'>Loading your brand insights…</div>;
  }

  if (error) {
    return <div className='mx-auto max-w-6xl rounded-2xl bg-red-50 p-4 text-center text-red-700'>{error}</div>;
  }

  return (
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      <AnalyticsCard
        title='Total Users'
        value={Number(analyticsData.users || 0).toLocaleString()}
        icon={Users}
        color='from-emerald-500 to-teal-700'
        />
      <AnalyticsCard
        title='Total Products'
        value={Number(analyticsData.products || 0).toLocaleString()}
        icon={Package}
        color='from-emerald-500 to-green-700'
        />
      <AnalyticsCard
        title='Total Orders'
        value={Number(analyticsData.totalSales || 0).toLocaleString()}
        icon={ShoppingCart}
        color='from-emerald-500 to-cyan-700'
        />
      <AnalyticsCard
        title='Total Revenue'
        value={`$${Number(analyticsData.totalRevenue || 0).toLocaleString()}`}
        icon={DollarSign}
        color='from-emerald-500 to-lime-700'
        />
  </div>
  <motion.div
    className='bg-white rounded-2xl p-6 shadow-[0_12px_30px_rgba(68,62,45,0.08)] border border-[#e1dacb]'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.25 }}
    >
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={dailySalesData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' stroke='#D1D5DB' />
          <YAxis yAxisId='left' stroke='#D1D5DB' />
          <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
          <Tooltip />
          <Legend />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='sales'
            stroke='#10B981'
            activeDot={{ r: 8 }}
            name='Sales'
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='revenue'
            stroke='#3B82F6'
            activeDot={{ r: 8 }}
            name='Revenue'
          />
        </LineChart>
        </ResponsiveContainer>
    </motion.div>
  </div>
  )
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon }) => {
  return (
    <motion.div
      className='bg-white rounded-2xl p-6 shadow-[0_12px_30px_rgba(68,62,45,0.08)] overflow-hidden relative border border-[#e1dacb]'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between'>
        <div className='z-10'>
          <p className='text-[#7C9279] text-sm mb-1 font-semibold'>{title}</p>
          <h3 className='text-[#27352b] text-3xl font-bold'>{value}</h3>
        </div>
        </div>
       <div className='absolute inset-0 bg-gradient-to-br from-[#e6eee3] to-[#f7ecd4] opacity-70' />
       <div className='absolute -bottom-4 -right-4 text-[#B58A34] opacity-25'>
        <Icon className='h-32 w-32' />
       </div>
    </motion.div>
  );
};
