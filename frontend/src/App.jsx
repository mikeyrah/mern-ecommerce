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
import BotaniBathBodyPage from './pages/BotaniBathBodyPage';
import BotaniSeasonalPage from './pages/BotaniSeasonalPage';
import BotaniHomeScentsPage from './pages/BotaniHomeScentsPage';
import BotaniMenPage from './pages/BotaniMenPage';
import BotaniBabyPage from './pages/BotaniBabyPage';
import BotaniLipGlossPage from './pages/BotaniLipGlossPage';
import BotaniCollectionPage from './pages/BotaniCollectionPage';
import ProductPage from './pages/ProductPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import InfoPage from './pages/InfoPage';
import Footer from './components/Footer';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import { useCartStore } from './stores/useCartStore';
import { useWishlistStore } from './stores/useWishlistStore';

import Navbar from './components/Navbar';
import { useUserStore } from './stores/useUserStore';

function App() {
  const {user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems, getCoupon, clearCart } = useCartStore();
  const { fetchWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  useEffect(() => {
    if (user) {
      getCartItems();
      getCoupon();
      fetchWishlist();
    } else {
      clearCart();
      clearWishlist();
    }
  }, [user, getCartItems, getCoupon, clearCart, fetchWishlist, clearWishlist]);

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={user ? <WishlistPage /> : <Navigate to='/login' />} />
        <Route path='/secret-dashboard' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
        <Route path='/category/:category' element={ <CategoryPage /> } />
        <Route path='/brands/botani-eve/bath-body' element={<BotaniBathBodyPage />} />
        <Route path='/brands/botani-eve/seasonal' element={<BotaniSeasonalPage />} />
        <Route path='/brands/botani-eve/home-scents' element={<BotaniHomeScentsPage />} />
        <Route path='/brands/botani-eve/men' element={<BotaniMenPage />} />
        <Route path='/brands/botani-eve/baby' element={<BotaniBabyPage />} />
        <Route path='/brands/botani-eve/lip-gloss' element={<BotaniLipGlossPage />} />
        <Route path='/brands/botani-eve/:collection' element={<BotaniCollectionPage />} />
        <Route path='/brands/:brand' element={<BrandPage />} />
        <Route path='/products/:id' element={<ProductPage />} />
        <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
        <Route path='/account' element={user ? <AccountPage /> : <Navigate to='/login' />} />
        <Route path='/orders' element={user ? <OrdersPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-cancel' element={<PurchaseCancelPage />} />
        <Route path='/journal' element={<BlogPage />} />
        <Route path='/journal/:slug' element={<BlogArticlePage />} />
        {['contact', 'shipping', 'returns', 'privacy', 'terms'].map((page) => <Route key={page} path={`/${page}`} element={<InfoPage />} />)}
      </Routes>
      <Footer />
      </div>
      <Toaster />
    </div>
  )
}

export default App
