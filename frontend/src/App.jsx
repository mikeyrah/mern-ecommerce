import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import LoadingSpinner from './components/LoadingSpinner';
import AdminPage from './pages/AdminPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import PurchaseSuccessPage from './pages/PurchaseSuccessPage';
import PurchaseCancelPage from './pages/PurchaseCancelPage';
import BrandPage from './pages/BrandPage';
import { useCartStore } from './stores/useCartStore';

import Navbar from './components/Navbar';
import { useUserStore } from './stores/useUserStore';

function App() {
  const {user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems, getCoupon, clearCart } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  useEffect(() => {
    if (user) {
      getCartItems();
      getCoupon();
    } else {
      clearCart();
    }
  }, [user, getCartItems, getCoupon, clearCart]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className='min-h-screen bg-[#fcfaf5] text-[#27352b] relative overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 
          bg-[radial-gradient(ellipse_at_top,_rgba(230,238,227,0.9)_0%,_rgba(252,250,245,0.8)_45%,_rgba(250,246,236,0.9)_100%)]" />
        </div>
      </div>

      <div className='relative z-50 pt-20'>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/secret-dashboard' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
        <Route path='/category/:category' element={ <CategoryPage /> } />
        <Route path='/brands/:brand' element={<BrandPage />} />
        <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-cancel' element={<PurchaseCancelPage />} />
      </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App
