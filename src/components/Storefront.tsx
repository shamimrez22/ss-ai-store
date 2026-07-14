import React, { useState, useEffect } from 'react';
import { 
  useApp, CartItem 
} from '../context/AppContext';
import { 
  ShoppingBag, Heart, ShoppingCart, User as UserIcon, 
  Search, Grid, Star, Plus, Minus, X, Trash2, ArrowRight, 
  Truck, ShieldCheck, RotateCcw, Headphones, Send, Clock, 
  Menu, Key, Shield, UserCheck, MapPin, Eye, CheckCircle2, Lock, Sparkles, LogOut, ChevronLeft, ChevronRight, RefreshCw, Home, ClipboardList, ChevronDown, UploadCloud, Facebook, Twitter, Instagram
} from 'lucide-react';
import { HomeSlider } from './HomeSlider';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { DynamicIcon } from './Icons';
import { Product, ProductVariant, Category, Order, Address } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Client-side cache to make page/tab switching 100% instant and lag-free
const storefrontCache: {
  slides?: any[];
  homeProducts?: Product[];
  homeCategories?: Category[];
} = {};

const shopCache: {
  products?: Product[];
  categories?: Category[];
  selectedCat?: string;
  priceRange?: number;
  selectedSort?: string;
  searchQuery?: string;
  flashOnly?: boolean;
  totalCount?: number;
  currentPage?: number;
} = {};

export const Storefront: React.FC = () => {
  const { 
    user, cart, wishlist, categories, siteSettings, showToast, login, registerUser, logout,
    updateCartQuantity, removeFromCart, clearCart, applyCouponCode, coupon, removeCoupon, updateProfile,
    noticeText, noticeEnabled, announcementText, announcementEnabled
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'wishlist' | 'dashboard' | 'track' | 'static'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [staticPageId, setStaticPageId] = useState<string>('about');
  
  // Modals / global interactions
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  // Parse URL Hash on mount & changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      if (hash.startsWith('#/product/')) {
        const slug = hash.replace('#/product/', '');
        setSelectedProductSlug(slug);
        setActiveTab('product');
      } else if (hash.startsWith('#/static/')) {
        const pageId = hash.replace('#/static/', '');
        setStaticPageId(pageId);
        setActiveTab('static');
      } else if (hash === '#/shop' || hash.startsWith('#/shop?')) {
        setActiveTab('shop');
      } else if (hash === '#/cart') {
        setActiveTab('cart');
      } else if (hash === '#/checkout') {
        setActiveTab('checkout');
      } else if (hash === '#/wishlist') {
        setActiveTab('wishlist');
      } else if (hash === '#/dashboard') {
        setActiveTab('dashboard');
      } else if (hash === '#/track-order') {
        setActiveTab('track');
      } else {
        setActiveTab('home');
      }
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial execution

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between text-white font-sans">
      


      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#B31312] border-b border-[#940f0f] select-none text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <button id="nav-logo" onClick={() => navigateTo('#/')} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 bg-[#FF5500] rounded-xl flex items-center justify-center border border-zinc-800/80 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <div className="relative">
                <ShoppingCart className="w-5.5 h-5.5 text-white stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00CC88] rounded-full border border-[#B31312]"></span>
              </div>
            </div>
            <div className="flex flex-col items-start leading-none text-left">
              {(() => {
                const nameParts = (siteSettings?.siteName || "BAZAR THOLE").split(' ');
                const firstPart = nameParts[0] || "BAZAR";
                const remainingParts = nameParts.slice(1).join(' ') || "THOLE";
                return (
                  <>
                    <span className="text-sm font-black tracking-wider text-white uppercase font-sans">{firstPart}</span>
                    <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase font-sans mt-0.5">{remainingParts}</span>
                  </>
                );
              })()}
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-100">
            <button id="nav-home" onClick={() => navigateTo('#/')} className={`cursor-pointer transition-all duration-200 hover:text-white px-3.5 py-2 rounded-lg ${activeTab === 'home' ? 'bg-zinc-950 text-white font-bold border border-zinc-900' : 'hover:bg-[#940f0f]/50'}`}>Home</button>
            <button id="nav-shop" onClick={() => navigateTo('#/shop')} className={`cursor-pointer transition-all duration-200 hover:text-white px-3.5 py-2 rounded-lg ${activeTab === 'shop' ? 'bg-zinc-950 text-white font-bold border border-zinc-900' : 'hover:bg-[#940f0f]/50'}`}>Shop</button>
            <button id="nav-track" onClick={() => navigateTo('#/track-order')} className={`cursor-pointer transition-all duration-200 hover:text-white px-3.5 py-2 rounded-lg ${activeTab === 'track' ? 'bg-zinc-950 text-white font-bold border border-zinc-900' : 'hover:bg-[#940f0f]/50'}`}>Tracking</button>
            <button id="nav-about" onClick={() => navigateTo('#/static/about')} className={`cursor-pointer transition-all duration-200 hover:text-white px-3.5 py-2 rounded-lg ${activeTab === 'static' && staticPageId === 'about' ? 'bg-zinc-950 text-white font-bold border border-zinc-900' : 'hover:bg-[#940f0f]/50'}`}>About</button>
            <button id="nav-contact" onClick={() => navigateTo('#/static/contact')} className={`cursor-pointer transition-all duration-200 hover:text-white px-3.5 py-2 rounded-lg ${activeTab === 'static' && staticPageId === 'contact' ? 'bg-zinc-950 text-white font-bold border border-zinc-900' : 'hover:bg-[#940f0f]/50'}`}>Contact</button>
          </nav>

          {/* Centered Search Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (activeTab !== 'shop') {
                navigateTo('#/shop');
              }
            }}
            className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-lg mx-4"
          >
            <div className="relative w-full flex items-center h-10 overflow-hidden">
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="SEARCH PREMIUM PRODUCTS & SERVICES..."
                className="w-full bg-white text-zinc-900 placeholder-zinc-500 text-[11px] font-bold px-4 py-2.5 rounded-l-md border-none focus:outline-none transition-colors h-10"
              />
              <button
                type="submit"
                className="bg-zinc-950 hover:bg-zinc-900 text-white w-11 h-10 flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm shrink-0 rounded-r-md"
              >
                <Search className="w-4 h-4 text-white stroke-[2.5px]" />
              </button>
            </div>
          </form>

          {/* Icon Controls */}
          <div className="flex items-center gap-2 lg:gap-3.5">
            {/* Clipboard tracking icon */}
            <button
              id="header-orders-track"
              onClick={() => navigateTo('#/track-order')}
              title="Track Orders"
              className="p-2 text-zinc-200 hover:text-white rounded-xl hover:bg-[#940f0f]/50 cursor-pointer transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              id="header-wishlist"
              onClick={() => navigateTo('#/wishlist')}
              className="relative p-2 text-zinc-200 hover:text-white rounded-xl hover:bg-[#940f0f]/50 cursor-pointer transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-950 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Customer Dashboard / Login Button */}
            <button
              id="header-dashboard"
              onClick={() => navigateTo('#/dashboard')}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded border border-zinc-900 cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm text-xs"
            >
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {user ? `Hi, ${user.name.split(' ')[0]}` : 'LOGIN'}
              </span>
            </button>

            {/* Shopping Cart Pill Button */}
            <button
              id="header-cart"
              onClick={() => navigateTo('#/cart')}
              className="bg-zinc-950 hover:bg-zinc-900 text-white px-4 py-2 rounded flex items-center gap-2 border border-zinc-900 shadow-lg cursor-pointer transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold font-mono flex items-center gap-0.5 text-white">
                <span>৳</span>
                <span>
                  {cart.reduce((total, item) => {
                    const variantPrice = item.variant?.price || item.product.salePrice || item.product.originalPrice;
                    return total + (variantPrice * item.quantity);
                  }, 0)}
                </span>
              </span>
            </button>

            {/* Admin Switcher option (always visible for easy navigation, prompts credentials if not logged in) */}
            <a
              id="header-admin-panel"
              href="#/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 border border-amber-500 rounded-xl text-xs font-bold text-white hover:brightness-110 shadow-md transition-all"
            >
              <Shield className="w-3.5 h-3.5 animate-pulse" />
              <span>ADMIN PANEL</span>
            </a>

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 lg:hidden text-zinc-200 hover:text-white rounded-xl cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile menu Drawer dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden border-t border-[#940f0f] bg-[#B31312] p-5 flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-zinc-100 shadow-xl"
          >
            <button onClick={() => { navigateTo('#/'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-white transition-colors">Home</button>
            <button onClick={() => { navigateTo('#/shop'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-white transition-colors">Shop</button>
            <button onClick={() => { navigateTo('#/track-order'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-white transition-colors">Tracking</button>
            <button onClick={() => { navigateTo('#/static/about'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-white transition-colors">About Us</button>
            <button onClick={() => { navigateTo('#/static/contact'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-white transition-colors">Contact Support</button>
            <a href="#/admin" className="py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-center font-bold text-xs uppercase border border-orange-500 shadow-md">
              Admin Panel Backoffice
            </a>
          </motion.div>
        )}
      </header>

      {/* 2. Page Switch Canvas */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeView onQuickView={setQuickViewProduct} key="home" />}
          {activeTab === 'shop' && (
            <ShopView 
              onQuickView={setQuickViewProduct} 
              searchPreset={headerSearch} 
              onClearSearchPreset={() => setHeaderSearch('')} 
              key="shop" 
            />
          )}
          {activeTab === 'product' && <ProductDetailsView slug={selectedProductSlug} key="product" />}
          {activeTab === 'cart' && <CartView key="cart" onNavigate={navigateTo} />}
          {activeTab === 'checkout' && <CheckoutView key="checkout" />}
          {activeTab === 'wishlist' && <WishlistView onQuickView={setQuickViewProduct} key="wishlist" />}
          {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
          {activeTab === 'track' && <TrackOrderView key="track" />}
          {activeTab === 'static' && <StaticPagesView pageId={staticPageId} key="static" />}
        </AnimatePresence>
      </main>

      {/* 3. Global Footer */}
      <footer className="bg-[#02050e] border-t border-zinc-900 text-zinc-400 font-sans text-xs pt-16 pb-24 md:pb-12 select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF5500] rounded-xl flex items-center justify-center border border-zinc-800/80 shadow-md shrink-0">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00CC88] rounded-full border border-[#02050e]"></span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#FF5500] tracking-wider leading-none">SS AI</span>
                <span className="text-base font-black text-white tracking-wider leading-none mt-0.5">STORE</span>
              </div>
            </div>
            
            <p className="leading-relaxed text-zinc-400 font-medium text-[11px] tracking-wide uppercase">
              SS AI STORE IS BANGLADESH'S TRUSTED OMNI-CHANNEL E-COMMERCE HUB. WE BRING YOU PREMIUM QUALITY PRODUCTS ACROSS FASHION, ELECTRONICS, HEALTH & BEAUTY, DAILY GROCERIES, AND LIFESTYLE ESSENTIALS DIRECTLY TO YOUR DOORSTEP WITH GUARANTEED AUTHENTICITY.
            </p>

            <div className="border-t border-zinc-800/50 my-2"></div>

            <div className="flex flex-col gap-3 font-semibold text-[11px] uppercase tracking-wider">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00cc88] shrink-0" />
                <span className="text-zinc-300">DHAKA, BANGLADESH</span>
              </div>
              <div className="flex items-center gap-3">
                <Send className="w-4 h-4 text-[#00cc88] shrink-0" />
                <span className="text-zinc-300">SUPPORT@SSAI.COM</span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones className="w-4 h-4 text-[#00cc88] shrink-0" />
                <span className="text-zinc-300">+880 1300000000</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">FOLLOW OUR CODES</span>
              <div className="flex items-center gap-2.5">
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-[#060b19] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-[#060b19] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-[#060b19] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* SHOP WITH CONFIDENCE */}
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-zinc-900">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">SHOP WITH CONFIDENCE</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#00cc88]/20 bg-[#021a11] flex items-center justify-center shrink-0">
                  <Headphones className="w-4.5 h-4.5 text-[#00cc88]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-white text-[11px] uppercase tracking-wide">24/7 HELPLINE ASSISTANCE</span>
                  <span className="text-[10px] text-zinc-400 leading-normal uppercase">DEDICATED TELEPHONE AND LIVE CHAT ASSISTANCE TO SOLVE PROBLEMS IMMEDIATELY.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#00cc88]/20 bg-[#021a11] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4.5 h-4.5 text-[#00cc88]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-white text-[11px] uppercase tracking-wide">EASY RETURN SECURITY</span>
                  <span className="text-[10px] text-zinc-400 leading-normal uppercase">STRESS-FREE REFUND OPTIONS IF PACKAGING IS UNTAMPERED OR ITEM VARIES FROM SPECIFICATIONS.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#00cc88]/20 bg-[#021a11] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#00cc88]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-white text-[11px] uppercase tracking-wide">100% VERIFIED QUALITY</span>
                  <span className="text-[10px] text-zinc-400 leading-normal uppercase">EVERY DISPATCH HAS PASSED STRICT GRADING BENCHMARKS TO MATCH PREMIUM STANDARDS.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#00cc88]/20 bg-[#021a11] flex items-center justify-center shrink-0">
                  <Lock className="w-4.5 h-4.5 text-[#00cc88]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-white text-[11px] uppercase tracking-wide">GENUINE PRODUCTS ONLY</span>
                  <span className="text-[10px] text-zinc-400 leading-normal uppercase">ZERO COUNTERFEITS. WE SOURCE DIRECTLY FROM BRANDS, MAJOR SUPPLIERS, OR FARMERS.</span>
                </div>
              </div>
            </div>
          </div>

          {/* USEFUL HYPERLINKS */}
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-zinc-900">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">USEFUL HYPERLINKS</span>
            </div>
            <div className="flex flex-col gap-3 font-semibold text-[11px] uppercase tracking-wider">
              <button onClick={() => navigateTo('#/track-order')} className="text-left hover:text-[#00cc88] text-zinc-400 cursor-pointer transition-colors">ORDER TRACKING SYSTEM</button>
              <button onClick={() => navigateTo('#/dashboard')} className="text-left hover:text-[#00cc88] text-zinc-400 cursor-pointer transition-colors">MY PROFILE PORTAL</button>
              <button onClick={() => navigateTo('#/static/about')} className="text-left hover:text-[#00cc88] text-zinc-400 cursor-pointer transition-colors">COMPANY STORY & PRINCIPLES</button>
              <button onClick={() => navigateTo('#/static/contact')} className="text-left hover:text-[#00cc88] text-zinc-400 cursor-pointer transition-colors">GET IN TOUCH / SUPPORT DESK</button>
            </div>
          </div>

          {/* DELIVERY OPERATIONAL TIMING */}
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-zinc-900">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">DELIVERY OPERATIONAL TIMING</span>
            </div>
            
            <div className="border border-zinc-900 bg-[#030a16] p-4 rounded-xl flex flex-col gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-white shrink-0" />
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider leading-tight">
                  WE DELIVER EVERYDAY DISPATCH ORDERS FROM
                </span>
              </div>
              <div className="text-xs font-black text-[#00cc88] tracking-wide">
                08:00 AM - 10:00 PM (EVERYDAY)
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">AUTHORIZED SYSTEMS & GATEWAYS</span>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#D12053] text-white text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider shadow-sm">BIKASH</span>
                <span className="bg-[#EC5A24] text-white text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider shadow-sm">NAGAD</span>
                <span className="bg-[#005e72] text-white text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider shadow-sm">SSLCOMMERZ</span>
                <span className="bg-[#27272a] text-zinc-300 text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider border border-zinc-800 shadow-sm">COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate copyright */}
        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 font-bold text-[9px] uppercase tracking-wider">
          <p>© 2026 SS AI STORE BANGLADESH. ALL LEGAL RIGHTS FULLY RESERVED.</p>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">SECURED WITH SSL 256-BIT ENCRYPTION</span>
          </div>
        </div>
      </footer>

      {/* 4. Responsive Mobile Bottom navigation bar */}
      <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 py-3.5 px-6 flex items-center justify-between shadow-2xl rounded-t-3xl select-none">
        <button
          onClick={() => navigateTo('#/')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => navigateTo('#/shop')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'shop' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Catalog</span>
        </button>

        <button
          onClick={() => navigateTo('#/cart')}
          className={`relative flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'cart' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1 w-4.5 h-4.5 bg-orange-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <span className="text-[10px] font-bold">Cart</span>
        </button>

        <button
          onClick={() => navigateTo('#/wishlist')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'wishlist' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Favorites</span>
        </button>

        <button
          onClick={() => navigateTo('#/dashboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </div>

      {/* Global Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

// --- STOREFRONT SUB-VIEWS ---

// 1. HOME VIEW
const HomeView: React.FC<{ onQuickView: (p: Product) => void }> = ({ onQuickView }) => {
  const { showToast, applyCouponCode, noticeText, noticeEnabled, announcementText, announcementEnabled } = useApp();
  const [slides, setSlides] = useState<any[]>(storefrontCache.slides || []);
  const [products, setProducts] = useState<Product[]>(storefrontCache.homeProducts || []);
  const [categories, setCategories] = useState<Category[]>(storefrontCache.homeCategories || []);
  const [loading, setLoading] = useState(!storefrontCache.homeProducts);

  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Flash Sale Countdown variables
  const [timeLeft, setTimeLeft] = useState({ hrs: 12, mins: 34, secs: 56 });

  useEffect(() => {
    // Timer interval
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        clearInterval(countdown);
        return { hrs: 0, mins: 0, secs: 0 };
      });
    }, 1000);

    // Load home elements
    Promise.all([
      fetch('/api/slides').then(res => res.json()),
      fetch('/api/products?limit=50').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([slideData, prodData, catData]) => {
      const featuredCats = catData.filter((c: Category) => c.isFeatured);
      storefrontCache.slides = slideData;
      storefrontCache.homeProducts = prodData;
      storefrontCache.homeCategories = featuredCats;

      setSlides(slideData);
      setProducts(prodData);
      setCategories(featuredCats);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });

    return () => clearInterval(countdown);
  }, []);

  if (loading) return <div className="p-24 text-center text-sm font-semibold flex items-center gap-2 justify-center"><RefreshCw className="w-5 h-5 animate-spin text-red-600" />Preparing storefront visual panels...</div>;

  const featuredProducts = products.filter(p => p.isFeatured);
  const flashProducts = products.filter(p => p.flashSaleEnabled);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-12 select-none animate-fadeIn bg-black"
    >
      {/* 1. Notice Bar */}
      {noticeEnabled && (
        <div className="max-w-7xl mx-auto px-6 w-full mt-6">
          <div className="bg-[#991b1b] text-white rounded-lg p-2.5 flex items-center gap-3 text-xs font-bold shadow-sm border border-red-800/10 overflow-hidden">
            <span className="bg-[#be123c] text-white font-extrabold text-[9px] tracking-wider px-2.5 py-1.5 rounded uppercase shrink-0">
              NOTICE
            </span>
            <div className="flex-1 overflow-hidden">
              <marquee className="text-white text-xs font-bold font-sans cursor-pointer">
                {noticeText}
              </marquee>
            </div>
          </div>
        </div>
      )}

      {/* 2. Slider & Special Offer Section */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column (Auto-play slider) */}
          <div className="lg:col-span-9 h-[18rem] md:h-[24rem] lg:h-[25rem]">
            <HomeSlider slides={slides} />
          </div>

          {/* Right Special Offer Banner */}
          <div 
            onClick={() => {
              applyCouponCode('AURA10');
            }}
            className="lg:col-span-3 h-[18rem] md:h-[24rem] lg:h-[25rem] rounded-3xl relative overflow-hidden shadow-md group border border-zinc-200/10 cursor-pointer"
          >
            {/* Background image */}
            <img 
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop" 
              alt="Special Offer AI Subscriptions" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 select-none">
              <span className="inline-flex items-center gap-1 bg-[#2d0c0c]/80 backdrop-blur-sm border border-red-500/20 text-[#f87171] font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                <span>⚡ SPECIAL OFFER</span>
              </span>
              <span className="bg-[#ef4444] text-white font-black text-[10px] px-2.5 py-1 rounded shadow-sm">
                -15% OFF
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-start select-none">
              <span className="bg-[#dc2626] text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1.5 rounded-md shadow">
                SPECIAL OFFER
              </span>
              <h3 className="text-white font-sans font-black text-sm md:text-base leading-tight mt-2.5 drop-shadow-md">
                TAP TO APPLY COUPON DISCOUNT!
              </h3>
              
              {/* Live countdown timer bar */}
              <div className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 mt-4 flex items-center justify-between gap-1 text-[10px] font-bold text-zinc-300 font-mono">
                <span className="text-zinc-400 font-sans tracking-wide">ENDS IN:</span>
                <span className="text-white flex items-center gap-1">
                  <span className="bg-zinc-800 border border-zinc-700/50 rounded px-1.5 py-0.5 text-white font-black">{timeLeft.hrs.toString().padStart(2, '0')}</span>
                  <span className="text-red-400">:</span>
                  <span className="bg-zinc-800 border border-zinc-700/50 rounded px-1.5 py-0.5 text-white font-black">{timeLeft.mins.toString().padStart(2, '0')}</span>
                  <span className="text-red-400">:</span>
                  <span className="bg-zinc-800 border border-zinc-700/50 rounded px-1.5 py-0.5 text-white font-black">{timeLeft.secs.toString().padStart(2, '0')}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Announcement Banner */}
      {announcementEnabled && (
        <div className="max-w-7xl mx-auto px-6 w-full -mt-4">
          <div className="bg-[#1c1917] border border-[#B31312]/30 rounded-xl p-3 flex items-center gap-3.5 text-xs font-semibold shadow-sm overflow-hidden select-none">
            <span className="bg-[#B31312] text-white font-black text-[9px] tracking-wider px-3 py-1.5 rounded uppercase shrink-0 font-sans">
              ANNOUNCEMENT
            </span>
            <div className="flex-1 overflow-hidden">
              <marquee className="text-white font-bold font-sans cursor-pointer pt-0.5" scrollamount="4">
                {announcementText || "📢 বাজার থোলে - বাংলাদেশের এক নম্বর ও বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম! সেরা দামে প্রিমিয়াম প্রোডাক্ট ও লাইফস্টাইল গেজেটস কিনুন সহজেই!"}
              </marquee>
            </div>
          </div>
        </div>
      )}

      {/* 4. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-2">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-black text-white tracking-wider uppercase font-sans flex items-center gap-1.5">
              FEATURED CATEGORIES
            </h2>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold tracking-wider uppercase mt-0.5">
              HANDPICKED AND FRESHLY HARVESTED ITEMS CATEGORIZED FOR SWIFT SHOPPING
            </p>
          </div>
          
          <div className="flex items-center gap-2 select-none self-end md:self-center shrink-0">
            {/* Scroll Navigation Chevrons */}
            <button 
              onClick={() => scrollCategories('left')}
              className="w-8 h-8 rounded border border-zinc-850 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollCategories('right')}
              className="w-8 h-8 rounded border border-zinc-850 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* View All Button */}
            <button 
              onClick={() => { window.location.hash = '#/shop'; }}
              className="ml-1 px-3 py-1.5 text-[10px] md:text-xs font-black text-red-500 bg-[#3a0d0d]/30 border border-red-900/50 hover:bg-[#521313]/30 rounded flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <span>EXPLORE CATALOG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Categories Scroll Area */}
        <div 
          ref={categoryScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => { window.location.hash = `#/shop?category=${cat.slug}`; }}
              className="min-w-[120px] md:min-w-[145px] flex-1 max-w-[170px] bg-[#0c0c0c] border border-zinc-900 p-3 rounded-2xl flex flex-col items-center gap-2.5 hover:shadow-lg hover:border-[#dc2626]/30 transition-all cursor-pointer text-center select-none snap-start group"
            >
              <div className="w-full aspect-square border border-zinc-900 p-1.5 bg-black rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <h3 className="font-sans font-black text-[10px] md:text-[11px] text-zinc-100 tracking-tight leading-tight line-clamp-2 uppercase">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOP SELLING PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-white tracking-wider uppercase font-sans flex items-center gap-1">
                <span>🔥</span>
                <span>TOP SELLING PRODUCTS</span>
              </h2>
              <span className="bg-amber-950/40 text-[#f59e0b] border border-amber-900/50 font-black text-[9px] tracking-wider px-2 py-0.5 rounded uppercase shrink-0">
                POPULAR
              </span>
            </div>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold tracking-wider uppercase mt-1">
              HIGHLY RECOMMENDED GROCERIES AT UNPARALLELED WHOLESALE PRICES
            </p>
          </div>

          <button
            onClick={() => { window.location.hash = '#/shop'; }}
            className="self-end md:self-center px-3.5 py-1.5 bg-[#2a1305]/30 hover:bg-[#3f1c07]/30 text-orange-500 border border-orange-950/50 font-black text-[10px] md:text-xs rounded flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
          >
            <span>MORE HOT PICKS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {featuredProducts.slice(0, 10).map(p => (
            <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
          ))}
        </div>
      </section>

      {/* 6. FLASH SELL SECTION */}
      {flashProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-black text-white tracking-wider uppercase font-sans flex items-center gap-1">
                  <span>⚡</span>
                  <span>FLASH SELL</span>
                </h2>
                <span className="bg-rose-950/40 text-rose-400 border border-rose-900/50 font-black text-[9px] tracking-wider px-2 py-0.5 rounded uppercase shrink-0 animate-pulse">
                  LIMITED TIME
                </span>
              </div>
              <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold tracking-wider uppercase mt-1">
                THE ABSOLUTE FAVORITES IN DHAKA HOUSEHOLDS RIGHT NOW
              </p>
            </div>

            <button
              onClick={() => { window.location.hash = '#/shop?flash=true'; }}
              className="self-end md:self-center px-3.5 py-1.5 bg-[#052e16]/30 hover:bg-[#15803d]/30 text-[#4ade80] border border-emerald-950/50 font-black text-[10px] md:text-xs rounded flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <span>SEE MORE SALES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {flashProducts.slice(0, 10).map(p => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

// 2. SHOP VIEW (Catalog Filter & Sort Page)
interface ShopViewProps {
  onQuickView: (p: Product) => void;
  searchPreset?: string;
  onClearSearchPreset?: () => void;
}

const ShopView: React.FC<ShopViewProps> = ({ onQuickView, searchPreset = '', onClearSearchPreset }) => {
  const [products, setProducts] = useState<Product[]>(shopCache.products || []);
  const [categories, setCategories] = useState<Category[]>(shopCache.categories || []);
  const [loading, setLoading] = useState(!shopCache.products);

  // Filter values
  const [selectedCat, setSelectedCat] = useState(shopCache.selectedCat !== undefined ? shopCache.selectedCat : '');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(shopCache.priceRange !== undefined ? shopCache.priceRange : 2000);
  const [selectedSort, setSelectedSort] = useState(shopCache.selectedSort || 'popularity');
  const [searchQuery, setSearchQuery] = useState(shopCache.searchQuery !== undefined ? shopCache.searchQuery : searchPreset);
  const [flashOnly, setFlashOnly] = useState(shopCache.flashOnly || false);

  // Pagination values
  const [currentPage, setCurrentPage] = useState(shopCache.currentPage || 1);
  const [totalCount, setTotalCount] = useState(shopCache.totalCount || 0);
  const limit = 24;

  useEffect(() => {
    setSearchQuery(searchPreset);
    setCurrentPage(1);
  }, [searchPreset]);

  const loadAll = async () => {
    // If we have no cached products, show loading spinner
    if (products.length === 0) {
      setLoading(true);
    }
    
    let url = `/api/products?sort=${selectedSort}&maxPrice=${priceRange}&limit=${limit}&page=${currentPage}`;
    if (selectedCat) url += `&category=${selectedCat}`;
    if (searchQuery) url += `&search=${searchQuery}`;
    if (flashOnly) url += `&flash=true`;

    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/categories')
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        
        // Read X-Total-Count header to get the total matching count
        const totalHeader = prodRes.headers.get('X-Total-Count');
        const count = totalHeader ? parseInt(totalHeader, 10) : prodData.length;

        // Save to client cache
        shopCache.products = prodData;
        shopCache.categories = catData;
        shopCache.selectedCat = selectedCat;
        shopCache.priceRange = priceRange;
        shopCache.selectedSort = selectedSort;
        shopCache.searchQuery = searchQuery;
        shopCache.flashOnly = flashOnly;
        shopCache.totalCount = count;
        shopCache.currentPage = currentPage;

        setProducts(prodData);
        setCategories(catData);
        setTotalCount(count);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      if (hash.includes('?category=')) {
        const catSlug = hash.split('?category=')[1].split('&')[0];
        setSelectedCat(catSlug);
        setCurrentPage(1);
      } else if (hash.includes('?flash=true')) {
        setFlashOnly(true);
        setCurrentPage(1);
      } else if (hash === '#/shop') {
        setSelectedCat('');
        setFlashOnly(false);
        setCurrentPage(1);
      }
    };

    handleHashChange(); // Run once initially
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, priceRange, selectedSort, searchQuery, flashOnly]);

  // Load products on filter/page changes
  useEffect(() => {
    loadAll();
  }, [selectedCat, priceRange, selectedSort, searchQuery, flashOnly, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col select-none text-xs">

      {/* 2. Horizontal Category Filter Pills */}
      <div className="flex flex-col gap-4 bg-[#0c0c0c] border border-zinc-900 p-5 rounded-2xl shadow-sm mb-6">
        <div className="flex flex-col gap-1 border-b border-zinc-900 pb-3">
          <span className="font-extrabold text-[10px] text-zinc-500 tracking-wider uppercase">Filter by Category</span>
          <h3 className="font-black text-xs text-white uppercase tracking-tight">Our Curated Collections</h3>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x select-none">
          <button
            id="filter-cat-all"
            onClick={() => {
              setSelectedCat('');
              window.location.hash = '#/shop';
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border cursor-pointer transition-all shrink-0 ${
              selectedCat === ''
                ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-sm shadow-red-500/10'
                : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
            }`}
          >
            EVERYTHING (সকল প্রোডাক্ট)
          </button>
          {categories.map(c => (
            <button
              id={`filter-cat-${c.slug}`}
              key={c.id}
              onClick={() => {
                setSelectedCat(c.slug);
                window.location.hash = `#/shop?category=${c.slug}`;
              }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCat === c.slug
                  ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-sm shadow-red-500/10'
                  : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search, Sort, Price & Special Toggle Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0c0c0c] border border-zinc-900 p-5 rounded-2xl shadow-sm mb-8 select-none">
        {/* Text query search */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="font-extrabold text-zinc-500 uppercase text-[9px]">Text Query Search</label>
          <div className="relative">
            <input
              id="shop-search-query"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for items..."
              className="w-full pl-8 pr-3 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:bg-black transition-all font-bold"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Pricing Caps Slider */}
        <div className="md:col-span-4 flex flex-col gap-1.5 justify-center">
          <div className="flex items-center justify-between mb-1">
            <label className="font-extrabold text-zinc-500 uppercase text-[9px]">Price Range Limit</label>
            <span className="font-black text-xs text-[#f97316]">৳10 - ৳{priceRange}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="shop-price-range"
              type="range"
              min={10}
              max={2000}
              step={10}
              value={priceRange}
              onChange={e => setPriceRange(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#dc2626]"
            />
          </div>
        </div>

        {/* Sorting Selector */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="font-extrabold text-zinc-500 uppercase text-[9px]">Sort Catalog By</label>
          <select
            id="shop-sort-seq"
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl font-bold text-xs text-zinc-100 focus:outline-none focus:border-red-600 focus:bg-black transition-all cursor-pointer"
          >
            <option value="popularity">Popularity / Rating</option>
            <option value="newest">New Arrivals Feed</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>

        {/* Special Options: Flash Sale Filter & Clear All */}
        <div className="md:col-span-2 flex items-end gap-2.5">
          {/* Flash Sale Toggle */}
          <button
            onClick={() => setFlashOnly(prev => !prev)}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all ${
              flashOnly
                ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
            }`}
          >
            <span>⚡ FLASH</span>
          </button>

          {/* Clear All button */}
          <button
            id="reset-shop-filters"
            onClick={() => {
              setSelectedCat('');
              setPriceRange(2000);
              setSelectedSort('popularity');
              setSearchQuery('');
              setFlashOnly(false);
              window.location.hash = '#/shop';
              if (onClearSearchPreset) {
                onClearSearchPreset();
              }
            }}
            className="px-3 py-2.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Shelf Grid */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-black text-sm text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
            <span>🛒</span>
            <span>PRODUCT CATALOG</span>
          </h3>
          <span className="text-[10px] md:text-xs text-red-500 bg-[#3a0d0d]/30 font-black tracking-widest uppercase px-3 py-1 rounded border border-red-900/40">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#dc2626]" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-3">Loading fresh assets...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="p-16 text-center text-zinc-400 bg-[#0d0d0d] border border-zinc-900 rounded-3xl">
                <span className="text-3xl">🥬</span>
                <h4 className="font-sans font-black text-xs text-white uppercase tracking-wider mt-4">NO ESSENTIALS FOUND</h4>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-1.5">No products found matching the query.</p>
              </div>
            )}

            {/* Smart, sleek, responsive pagination controls */}
            {(() => {
              const totalPages = Math.ceil(totalCount / limit);
              if (totalPages <= 1) return null;

              const pageNumbers = [];
              const maxPageVisible = 5;
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, startPage + maxPageVisible - 1);
              if (endPage - startPage + 1 < maxPageVisible) {
                startPage = Math.max(1, endPage - maxPageVisible + 1);
              }
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
              }

              return (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-12 pt-6 border-t border-zinc-900 select-none">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                      currentPage === 1
                        ? 'border-zinc-900 text-zinc-600 bg-transparent cursor-not-allowed'
                        : 'border-zinc-800 text-zinc-300 bg-[#18181b] hover:bg-[#27272a]'
                    }`}
                  >
                    PREV
                  </button>
                  
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => {
                          setCurrentPage(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl border text-[10px] font-black cursor-pointer transition-all ${
                          currentPage === 1
                            ? 'bg-[#dc2626] border-[#dc2626] text-white'
                            : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
                        }`}
                      >
                        1
                      </button>
                      {startPage > 2 && <span className="text-zinc-600 font-bold px-1">...</span>}
                    </>
                  )}

                  {pageNumbers.map(page => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl border text-[10px] font-black cursor-pointer transition-all ${
                        currentPage === page
                          ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-md shadow-red-500/10'
                          : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && <span className="text-zinc-600 font-bold px-1">...</span>}
                      <button
                        onClick={() => {
                          setCurrentPage(totalPages);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl border text-[10px] font-black cursor-pointer transition-all ${
                          currentPage === totalPages
                            ? 'bg-[#dc2626] border-[#dc2626] text-white'
                            : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-[#27272a]'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                      currentPage === totalPages
                        ? 'border-zinc-900 text-zinc-600 bg-transparent cursor-not-allowed'
                        : 'border-zinc-800 text-zinc-300 bg-[#18181b] hover:bg-[#27272a]'
                    }`}
                  >
                    NEXT
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>

    </div>
  );
};

// 3. PRODUCT DETAILS VIEW
const ProductDetailsView: React.FC<{ slug: string | null }> = ({ slug }) => {
  const { addToCart, wishlist, toggleWishlist, token, showToast } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadDetails = () => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setSelectedImage(data.images[0]);
        setSelectedVariant(data.variants[0] || null);
        setQuantity(1);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetails();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !token) {
      showToast('You must register or log in to post product reviews.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        showToast('Thank you! Review posted successfully.', 'success');
        setComment('');
        loadDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-24 text-center"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-red-600" /></div>;
  if (!product) return <div className="p-12 text-center text-zinc-400 font-semibold text-xs">Product Details Asset failed to index. Check slug reference.</div>;

  const isInWishlist = wishlist.some(p => p.id === product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 select-none text-xs animate-fadeIn flex flex-col gap-12">
      {/* Main product specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left image gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-[#0e0e0e] border border-zinc-900 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-4">
            <img src={selectedImage} alt={product.name} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5">
              {product.images.map((img, i) => (
                <button
                  id={`details-thumb-${i}`}
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-2xl border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-red-600 scale-105 shadow-sm bg-black' : 'border-zinc-800 hover:border-zinc-700 bg-[#0e0e0e]'
                  }`}
                >
                  <img src={img} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right product details panel */}
        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{product.category.replace('_', ' ')}</span>
              <h1 className="text-xl md:text-3xl font-black text-white tracking-tight font-sans mt-0.5 uppercase">{product.name}</h1>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'}`} />
                ))}
              </div>
              <span className="font-bold text-zinc-300">{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500 border-l border-zinc-800 pl-2">({product.reviews.length} customer feedback logs)</span>
            </div>

            {/* Price display */}
            <div className="pb-3 border-b border-zinc-900 flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-red-500 font-mono">৳{selectedVariant?.price || product.originalPrice}</span>
              {product.salePrice && <span className="text-sm text-zinc-500 line-through font-mono">৳{product.originalPrice}</span>}
            </div>

            {/* Description summary */}
            <p className="text-zinc-300 leading-relaxed font-light text-xs">{product.description}</p>

            {/* Custom variants selection */}
            {product.variants.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-2">
                <span className="font-bold text-zinc-400 text-[10px] uppercase">Curated Variant Selection</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      id={`details-variant-${v.sku}`}
                      key={v.sku}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`px-3 py-2 font-semibold rounded-xl border-2 transition-all flex flex-col text-left cursor-pointer ${
                        selectedVariant?.sku === v.sku 
                          ? 'border-red-600 bg-red-950/20 text-white shadow-sm' 
                          : 'border-zinc-800 hover:border-zinc-700 text-zinc-350 bg-black'
                      }`}
                    >
                      <span>{v.size || 'Standard'}</span>
                      {v.color && <span className="text-[10px] text-zinc-500 font-light">{v.color}</span>}
                      <span className="text-[10px] font-bold mt-1 text-white">৳{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-zinc-400">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedVariant.stock <= 0 
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-900/50' 
                    : selectedVariant.stock <= product.lowStockThreshold 
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-900/50 animate-pulse' 
                      : 'bg-red-950/80 text-red-400 border border-red-900/50'
                }`}>
                  {selectedVariant.stock <= 0 ? 'Out of stock' : selectedVariant.stock <= product.lowStockThreshold ? 'Low stock alert' : 'In stock'}
                </span>
                <span>({selectedVariant.stock} units ready for immediate shipping)</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          {selectedVariant && selectedVariant.stock > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between border border-zinc-800 bg-black rounded-xl px-2.5 py-1.5 select-none w-28 shrink-0">
                <button
                  id="details-qty-dec"
                  onClick={() => quantity > 1 && setQuantity(prev => prev - 1)}
                  disabled={quantity <= 1}
                  className="w-6 h-6 hover:bg-zinc-800 flex items-center justify-center rounded text-zinc-400 disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-white text-sm">{quantity}</span>
                <button
                  id="details-qty-inc"
                  onClick={() => quantity < selectedVariant.stock && setQuantity(prev => prev + 1)}
                  disabled={quantity >= selectedVariant.stock}
                  className="w-6 h-6 hover:bg-zinc-800 flex items-center justify-center rounded text-zinc-400 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                id="details-add-to-cart"
                onClick={() => addToCart(product, selectedVariant, quantity)}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-950/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add To Cart Shelf</span>
              </button>

              <button
                id="details-wishlist"
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0e0e0e] border border-zinc-850 text-zinc-400 hover:text-rose-500 active:scale-95 transition-colors cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-zinc-450'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-zinc-900 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form review submission */}
        <div className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-4 h-fit">
          <h3 className="text-sm font-bold text-white font-sans">Share your Feedback</h3>
          {token ? (
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase text-[9px]">Select rating stars</label>
                <select
                  id="review-rating-select"
                  value={rating}
                  onChange={e => setRating(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-zinc-800 rounded-lg bg-[#18181b] text-white"
                >
                  <option value={5}>5 Stars - Pristine Quality</option>
                  <option value={4}>4 Stars - Great Experience</option>
                  <option value={3}>3 Stars - Standard / Average</option>
                  <option value={2}>2 Stars - Needs work</option>
                  <option value={1}>1 Star - Dissatisfied</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase text-[9px]">Write comment</label>
                <textarea
                  id="review-comment-textarea"
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="px-3 py-1.5 border border-zinc-800 rounded-lg bg-[#18181b] text-white focus:outline-none focus:border-red-600 focus:bg-black font-bold text-xs"
                  placeholder="The drop is amazing..."
                  required
                />
              </div>

              <button
                id="submit-review-btn"
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase"
              >
                Submit Feedback Slip
              </button>
            </form>
          ) : (
            <p className="text-zinc-500 font-light leading-relaxed">
              You must register or log in from your Account tab to write customer reviews and ratings on these drops.
            </p>
          )}
        </div>

        {/* Reviews Listing */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-white font-sans">Active Customer Audits ({product.reviews.length})</h3>
          <div className="flex flex-col gap-4">
            {product.reviews.filter(r => r.isApproved).map(r => (
              <div key={r.id} className="p-5 bg-[#0c0c0c] border border-zinc-900 rounded-2xl shadow-sm flex flex-col gap-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-100">{r.userName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{r.date}</span>
                  </div>
                  <span className="text-amber-500 font-bold">★ {r.rating} / 5</span>
                </div>
                <p className="text-zinc-300 font-light mt-1 text-[11px]">"{r.comment}"</p>
                {r.reply && (
                  <div className="mt-2.5 p-3 bg-zinc-900 border-l-2 border-zinc-700 rounded-r-xl text-[10px] text-zinc-400 font-light">
                    <span className="font-bold text-[9px] uppercase text-zinc-300 block mb-0.5">Response from merchant:</span>
                    "{r.reply}"
                  </div>
                )}
              </div>
            ))}
            {product.reviews.length === 0 && (
              <p className="p-8 text-center text-zinc-500 font-semibold border border-zinc-900 border-dashed rounded-3xl">Be the first to audit this drop! Post your review above.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// 4. CART VIEW
const CartView: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, applyCouponCode, coupon, removeCoupon } = useApp();
  const [couponField, setCouponField] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponField) return;
    const res = await applyCouponCode(couponField);
    if (!res.success) {
      alert(res.message);
    }
  };

  const totalBeforeDiscount = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  
  // Compute coupon value
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round(totalBeforeDiscount * (coupon.value / 100));
    } else {
      couponDiscount = coupon.value;
    }
  }

  const finalAmount = Math.max(0, totalBeforeDiscount - couponDiscount);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 select-none text-xs">
      
      {/* Left panel: cart items */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h1 className="text-xl font-black text-white font-sans tracking-tight">Shopping Cart Shelf</h1>
          <button id="clear-cart-shelf" onClick={clearCart} className="text-zinc-500 hover:text-rose-500 font-bold">Empty Cart</button>
        </div>

        <div className="flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.variant.sku} className="p-4 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-900 bg-black shrink-0 flex items-center justify-center p-1">
                  <img src={item.product.images[0]} alt="cart item" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <h3 className="font-bold text-zinc-100 truncate max-w-[12rem] uppercase">{item.product.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-semibold">{item.variant.size || 'Standard'} • {item.variant.color || 'Default'}</span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{item.variant.sku}</span>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-6">
                {/* Quantity selector */}
                <div className="flex items-center justify-between border border-zinc-800 rounded-lg px-2 py-1 select-none w-24">
                  <button
                    id={`qty-dec-${item.variant.sku}`}
                    onClick={() => updateCartQuantity(item.variant.sku, item.quantity - 1)}
                    className="w-5 h-5 hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-zinc-400 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-white text-xs">{item.quantity}</span>
                  <button
                    id={`qty-inc-${item.variant.sku}`}
                    onClick={() => updateCartQuantity(item.variant.sku, item.quantity + 1)}
                    className="w-5 h-5 hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-zinc-400 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-extrabold text-sm text-white font-mono">৳{item.variant.price * item.quantity}</span>
                  <button
                    id={`remove-cart-${item.variant.sku}`}
                    onClick={() => removeFromCart(item.variant.sku)}
                    className="text-[10px] text-zinc-500 hover:text-rose-500 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="p-16 text-center text-zinc-500 border border-zinc-900 border-dashed rounded-4xl flex flex-col items-center gap-4">
              <span className="text-sm font-semibold">Your shopping cart shelf is empty.</span>
              <button onClick={() => onNavigate('#/shop')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer">Explore Products Catalog</button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: summary invoice */}
      {cart.length > 0 && (
        <div className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-6 sticky top-24 h-fit">
          <span className="font-bold text-white text-sm border-b border-zinc-900 pb-3">Operational Invoice Summary</span>

          {/* Ledger */}
          <div className="flex flex-col gap-2 leading-relaxed">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Subtotal items</span>
              <span className="font-mono">৳{totalBeforeDiscount}</span>
            </div>
            {coupon && (
              <div className="flex items-center justify-between text-rose-500">
                <span>Coupon ({coupon.code})</span>
                <span className="flex items-center gap-1.5 font-bold font-mono">
                  <span>-৳{couponDiscount}</span>
                  <button id="remove-coupon-btn" onClick={removeCoupon} className="p-0.5 hover:bg-rose-950/40 rounded"><X className="w-3 h-3 text-rose-500" /></button>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-400">
              <span>Shipping Rates</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Calculated at next step</span>
            </div>
            <div className="flex items-center justify-between font-bold text-white border-t border-zinc-900 pt-3 text-sm">
              <span>Invoice Subtotal</span>
              <span className="font-mono">৳{finalAmount}</span>
            </div>
          </div>

          {/* Coupon input form */}
          {!coupon ? (
            <form onSubmit={handleApplyCoupon} className="flex gap-2 border-t border-zinc-900 pt-5">
              <input
                id="cart-coupon-field"
                type="text"
                value={couponField}
                onChange={e => setCouponField(e.target.value)}
                placeholder="Enter Voucher e.g. BAZAR10"
                className="flex-1 px-3 py-2 bg-[#18181b] border border-zinc-800 text-white rounded-xl focus:outline-none focus:border-red-600"
              />
              <button
                id="apply-coupon-submit"
                type="submit"
                className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer"
              >
                Apply
              </button>
            </form>
          ) : (
            <div className="p-3 bg-[#3a0d0d]/30 border border-red-900/40 text-red-400 rounded-2xl font-medium">
              Voucher "{coupon.code}" successfully applied!
            </div>
          )}

          <button
            id="proceed-checkout-btn"
            onClick={() => onNavigate('#/checkout')}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-950/20 text-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>Proceed to Dispatch Steps</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

// 5. MULTI-STEP CHECKOUT VIEW (Including all required manual and API payment options)
const CheckoutView: React.FC = () => {
  const { cart, coupon, clearCart, user, token, showToast, shippingZones } = useApp();
  const [step, setStep] = useState(1); // 1 = Address info, 2 = Payment Selection & Receipt upload, 3 = Complete Confirmation

  // Form parameters
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');

  // Payment Selection states
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState('');

  // Created order confirmation cache
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      if (user.addresses && user.addresses.length > 0) {
        const ad = user.addresses[0];
        setStreetAddress(ad.streetAddress);
        setCity(ad.city);
        setState(ad.state);
        setZipCode(ad.zipCode);
      }
    }
  }, [user]);

  useEffect(() => {
    if (shippingZones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(shippingZones[0].id);
    }
  }, [shippingZones]);

  if (cart.length === 0 && step < 3) return <div className="p-12 text-center text-zinc-400 font-semibold">Your shopping cart shelf is empty. Proceed from cart tab.</div>;

  // Invoice calculations
  const totalBeforeDiscount = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      couponDiscount = Math.round(totalBeforeDiscount * (coupon.value / 100));
    } else {
      couponDiscount = coupon.value;
    }
  }

  const activeZone = shippingZones.find(z => z.id === selectedZoneId) || { cost: 10, freeShippingThreshold: 150, name: 'Standard' };
  const shippingCost = activeZone.freeShippingThreshold && (totalBeforeDiscount - couponDiscount) >= activeZone.freeShippingThreshold ? 0 : activeZone.cost;
  const finalAmount = Math.max(0, totalBeforeDiscount - couponDiscount + shippingCost);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !streetAddress || !city || !state || !zipCode) {
      showToast('All contact and address details required.', 'error');
      return;
    }
    setStep(2);
  };

  const handleOrderPlace = async () => {
    // Requirements validation
    if (['bkash', 'nagad', 'rocket', 'bank'].includes(paymentMethod) && !transactionId) {
      showToast('Manual payments require Transaction Reference ID to proceed.', 'error');
      return;
    }

    const payload = {
      items: cart.map(item => ({
        productId: item.product.id,
        variantSku: item.variant.sku,
        quantity: item.quantity,
        price: item.variant.price,
        name: item.product.name,
        image: item.product.images[0]
      })),
      shippingAddress: {
        fullName, phone, streetAddress, city, state, zipCode, country: 'Bangladesh'
      },
      paymentMethod,
      couponCode: coupon?.code,
      guestInfo: !user ? { fullName, email, phone } : undefined,
      customerId: user?.id,
      totalAmount: totalBeforeDiscount,
      shippingCost,
      discountAmount: couponDiscount,
      finalAmount,
      transactionId,
      paymentSlipUrl: paymentSlipUrl || undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedOrder(data.order);
        clearCart();
        setStep(3);
        showToast('Order placed successfully!', 'success');
      } else {
        showToast(data.message || 'Error processing checkout.', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 select-none text-xs animate-fadeIn flex flex-col gap-8">
      
      {/* Checkout progress line */}
      <div className="flex items-center justify-center gap-6 border-b border-zinc-900 pb-5">
        {[
          { label: 'Dispatch Contact Address', s: 1 },
          { label: 'Gateway & Transaction slip', s: 2 },
          { label: 'Asset Confirmation', s: 3 }
        ].map(item => (
          <div key={item.s} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border ${
              step >= item.s ? 'bg-red-600 border-red-600 text-white' : 'border-zinc-800 text-zinc-600 bg-black'
            }`}>{item.s}</span>
            <span className={`font-semibold text-[10px] uppercase tracking-wider ${step >= item.s ? 'text-red-600 font-extrabold' : 'text-zinc-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Form content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-4">
              <span className="font-bold text-white text-sm">Customer Contact Details</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">Full Name</label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">Personal Email Address</label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">Contact Phone</label>
                  <input
                    id="checkout-phone"
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    required
                  />
                </div>
              </div>

              <span className="font-bold text-white text-sm border-t border-zinc-900 pt-4">Shipping Destination (Bangladesh)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">Street Address</label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    placeholder="House 42, Road 11, Banani"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    placeholder="Dhaka"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">State Division</label>
                  <input
                    id="checkout-state"
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    placeholder="Dhaka Division"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">ZIP / Postal Code</label>
                  <input
                    id="checkout-zip"
                    type="text"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                    placeholder="1213"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase text-[9px]">Shipping Courier Zone</label>
                  <select
                    id="checkout-zone"
                    value={selectedZoneId}
                    onChange={e => setSelectedZoneId(e.target.value)}
                    className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold cursor-pointer"
                  >
                    {shippingZones.map(z => (
                      <option key={z.id} value={z.id}>{z.name} - ৳{z.cost}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                id="checkout-step1-submit"
                type="submit"
                className="mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs uppercase"
              >
                Proceed to Payment selections
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">Choose Payment Gateway Method</span>
                <p className="text-zinc-500 font-light mt-0.5">Admin can toggle active methods inside backoffice controls panel.</p>
              </div>

              {/* Payment Methods selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'cod', name: 'Cash on Delivery (COD)' },
                  { id: 'stripe', name: 'Stripe Credit/Debit (Direct)' },
                  { id: 'paypal', name: 'PayPal Smart Gateway' },
                  { id: 'bkash', name: 'bKash Manual / Direct' },
                  { id: 'nagad', name: 'Nagad Manual Transfer' },
                  { id: 'rocket', name: 'Rocket manual' },
                  { id: 'sslcommerz', name: 'SSLCommerz (Supports all cards/bKash)' },
                  { id: 'bank', name: 'Manual Bank Transfer' }
                ].map(gateway => (
                  <button
                    id={`pay-method-btn-${gateway.id}`}
                    key={gateway.id}
                    onClick={() => {
                      setPaymentMethod(gateway.id);
                      setTransactionId('');
                      setPaymentSlipUrl('');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col text-left justify-between gap-1 cursor-pointer ${
                      paymentMethod === gateway.id 
                        ? 'border-red-600 bg-red-950/20 text-white shadow-sm' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-black text-zinc-300'
                    }`}
                  >
                    <span className="font-bold text-[11px] uppercase tracking-wide">{gateway.name}</span>
                    <span className="text-[10px] text-zinc-500 font-light">Select for secure checkouts</span>
                  </button>
                ))}
              </div>

              {/* Dynamic manual directions and Transaction IDs if manual methods chosen */}
              {['bkash', 'nagad', 'rocket', 'bank'].includes(paymentMethod) && (
                <div className="p-5 bg-[#3a220d]/20 border border-amber-900/40 rounded-3xl flex flex-col gap-3 leading-relaxed text-amber-200 shadow-inner">
                  <span className="font-bold uppercase text-[10px] tracking-wide">Manual Payment Verification Instructions:</span>
                  <p className="font-light">
                    {paymentMethod === 'bkash' && 'Send total amount to bKash Merchant Number: 01711000000. Enter transaction reference code below.'}
                    {paymentMethod === 'nagad' && 'Send total amount to Nagad Merchant Number: 01811000000. Enter transaction reference code below.'}
                    {paymentMethod === 'rocket' && 'Send total amount to Rocket Merchant Number: 01911000000-1. Enter transaction reference code below.'}
                    {paymentMethod === 'bank' && 'Transfer amount to Apex City Bank, A/C: 122-3344-5566-77, Beneficiary: SS AI Store LLC. Enter transaction reference code below.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-zinc-300">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-zinc-400 uppercase text-[9px]">Transaction Reference ID</label>
                      <input
                        id="payment-transaction-id"
                        type="text"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black"
                        placeholder="e.g. TRN890214872"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-zinc-400 uppercase text-[9px]">Payment Slip Screenshot / পেমেন্ট স্লিপ ছবি</label>
                      {paymentSlipUrl ? (
                        <div className="flex gap-2.5 items-center p-2 border border-zinc-800 rounded-lg bg-[#18181b]">
                          <div className="w-12 h-12 rounded border border-zinc-800 bg-black overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={paymentSlipUrl} alt="Slip Preview" className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <label
                              htmlFor="payment-slip-file-input"
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[9px] font-bold uppercase transition-colors cursor-pointer inline-block text-center"
                            >
                              Change / পরিবর্তন
                            </label>
                            <button
                              type="button"
                              onClick={() => setPaymentSlipUrl('')}
                              className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-900/50 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer inline-block text-center"
                            >
                              Remove / মুছুন
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="payment-slip-file-input"
                          className="h-10 border border-dashed border-zinc-800 rounded-lg bg-[#18181b] hover:bg-[#27272a] flex items-center justify-center cursor-pointer gap-2 transition-colors select-none"
                        >
                          <UploadCloud className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">Upload Screenshot / ছবি আপলোড করুন</span>
                        </label>
                      )}
                      <input
                        id="payment-slip-file-input"
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentSlipUrl(reader.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic gateway mock indicator */}
              {['stripe', 'paypal', 'sslcommerz'].includes(paymentMethod) && (
                <div className="p-4 bg-red-950/30 border border-red-900/40 text-red-400 font-medium rounded-2xl">
                  Gateway smart API connection detected. Clicking "Deploy Dispatch Slip" will automatically verify checkout parameters mock-successfully.
                </div>
              )}

              <div className="flex gap-3 justify-end border-t border-zinc-900 pt-5">
                <button
                  id="checkout-step2-back"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-zinc-800 text-zinc-300 hover:bg-[#18181b] font-bold rounded-xl cursor-pointer"
                >
                  Back to Address details
                </button>
                <button
                  id="checkout-step2-submit"
                  onClick={handleOrderPlace}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Deploy Dispatch Order Slip
                </button>
              </div>
            </div>
          )}

          {step === 3 && createdOrder && (
            <div className="p-8 bg-[#0c0c0c] border border-zinc-900 rounded-4xl shadow-lg flex flex-col items-center text-center gap-6 animate-fadeIn select-none">
              <div className="w-16 h-16 bg-red-950/40 text-red-500 border border-red-900/40 rounded-3xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black text-white font-sans tracking-tight">Order Successfully Placed!</h2>
                <p className="text-zinc-500 font-light leading-relaxed">
                  Your drops booking is successfully processed in our systems ledger! Your invoice reference ID is: <span className="font-bold font-mono text-white">{createdOrder.id}</span>
                </p>
              </div>

              <div className="p-5 bg-black border border-zinc-900 rounded-3xl text-left w-full max-w-md flex flex-col gap-1.5 leading-relaxed text-zinc-300">
                <span className="font-bold text-zinc-200 uppercase tracking-wider text-[10px] mb-1">Invoice Receipt Summary:</span>
                <p>Status: <span className="text-red-500 font-bold uppercase">{createdOrder.status}</span></p>
                <p>Tracking Reference ID: <span className="text-white font-mono font-bold">{createdOrder.id}</span></p>
                <p>Destination: <span className="font-semibold text-white">{createdOrder.shippingAddress.streetAddress}, {createdOrder.shippingAddress.city}</span></p>
                <p className="mt-1 font-bold text-white border-t border-zinc-900 pt-1.5 flex justify-between">
                  <span>Grand Total amount Paid:</span>
                  <span>৳{createdOrder.finalAmount}</span>
                </p>
              </div>

              <div className="flex gap-2 w-full max-w-sm mt-2">
                <button
                  id="checkout-success-shop"
                  onClick={() => { window.location.hash = '#/shop'; }}
                  className="flex-1 py-3 border border-zinc-800 text-zinc-300 hover:bg-[#18181b] font-bold rounded-xl cursor-pointer"
                >
                  Explore More
                </button>
                <button
                  id="checkout-success-track"
                  onClick={() => { window.location.hash = `#/track-order?ref=${createdOrder.id}`; }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Track Live Shipment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Cart Items Summary (only visible on step 1 and 2) */}
        {step < 3 && (
          <div className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-5 sticky top-24 select-none">
            <span className="font-bold text-white text-sm border-b border-zinc-900 pb-3">Operational Order Summary</span>
            
            <div className="flex flex-col gap-3.5 max-h-56 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.variant.sku} className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2 items-center min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-900 bg-black shrink-0 flex items-center justify-center p-0.5">
                      <img src={item.product.images[0]} alt="checkout thumb" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-zinc-200 truncate uppercase">{item.product.name}</span>
                      <span className="text-[9px] text-zinc-500 font-semibold">{item.variant.sku}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-white shrink-0 font-mono">{item.quantity}x ৳{item.variant.price}</span>
                </div>
              ))}
            </div>

            {/* Financial math */}
            <div className="border-t border-zinc-900 pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Basket Subtotal</span>
                <span className="font-mono">৳{totalBeforeDiscount}</span>
              </div>
              {coupon && (
                <div className="flex items-center justify-between text-rose-500">
                  <span>Coupon discount</span>
                  <span className="font-mono">-৳{couponDiscount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-400">
                <span>Shipping rate</span>
                <span className="font-mono">+৳{shippingCost}</span>
              </div>
              <div className="flex items-center justify-between font-extrabold text-white text-sm border-t border-zinc-900 pt-3">
                <span>Grand Total</span>
                <span className="font-mono">৳{finalAmount}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

// 6. WISHLIST VIEW
const WishlistView: React.FC<{ onQuickView: (p: Product) => void }> = ({ onQuickView }) => {
  const { wishlist } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 select-none text-xs animate-fadeIn flex flex-col gap-6">
      <div className="flex flex-col border-b border-zinc-900 pb-3">
        <h1 className="text-xl font-black text-white font-sans tracking-tight">Your Saved Favorites Wishlist</h1>
        <p className="text-zinc-500 font-light mt-0.5">Explore or buy items you have prioritized for later drops.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map(p => (
          <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
        ))}
        {wishlist.length === 0 && (
          <p className="p-16 text-center text-zinc-500 border border-zinc-900 border-dashed rounded-4xl font-semibold col-span-4">No assets added to your wishlist favorites yet. Go catalog more!</p>
        )}
      </div>
    </div>
  );
};

// 7. USER ACCOUNT DASHBOARD VIEW
const DashboardView: React.FC = () => {
  const { user, token, login, registerUser, logout, updateProfile, showToast } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Profile forms
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Login forms
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [nameField, setNameField] = useState('');
  const [phoneField, setPhoneField] = useState('');

  // Orders lists
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetch('/api/orders/my-orders', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setMyOrders(data))
        .catch(e => console.error(e));
    }
  }, [token]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(emailField, passwordField);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await registerUser(nameField, emailField, passwordField, phoneField);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({
      name,
      phone,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  // Auth Protection - Render login panel if no token
  if (!token || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-xs select-none animate-fadeIn flex flex-col">
        {isRegisterMode ? (
          <form onSubmit={handleRegisterSubmit} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-md flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-white uppercase">Create Customer Account</h2>
              <p className="text-zinc-500 font-light">Join the minimalist catalog drop drops immediately.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Full Name</label>
              <input
                id="reg-fullname"
                type="text"
                value={nameField}
                onChange={e => setNameField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                placeholder="Sarah Jenkins"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={emailField}
                onChange={e => setEmailField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                placeholder="sarah@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Contact Phone</label>
              <input
                id="reg-phone"
                type="text"
                value={phoneField}
                onChange={e => setPhoneField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                placeholder="+8801700000000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Password</label>
              <input
                id="reg-password"
                type="password"
                value={passwordField}
                onChange={e => setPasswordField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                required
              />
            </div>
            <button id="reg-submit" type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer uppercase mt-2">Deploy Account</button>
            <button id="toggle-to-login" type="button" onClick={() => setIsRegisterMode(false)} className="text-center text-[10px] text-red-500 font-bold mt-1">Already registered? Log In</button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-md flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-white uppercase">Customer Security Login</h2>
              <p className="text-zinc-500 font-light">Access your previous orders, tracked shipments, and settings.</p>
            </div>
            <div className="p-4 bg-[#18181b] border border-zinc-850 rounded-2xl leading-normal text-zinc-400">
              <p className="font-bold text-zinc-200 text-[10px] uppercase mb-0.5">Mock Test Accounts credentials:</p>
              <p>Customer: <span className="font-bold">customer@shop.com</span> / <span className="font-semibold">customer123</span></p>
              <p>Admin Control: <span className="font-bold">admin@shop.com</span> / <span className="font-semibold">admin123</span></p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={emailField}
                onChange={e => setEmailField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                placeholder="customer@shop.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Password</label>
              <input
                id="login-password"
                type="password"
                value={passwordField}
                onChange={e => setPasswordField(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
                required
              />
            </div>
            <button id="login-submit" type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer uppercase mt-2">Open Session</button>
            <button id="toggle-to-register" type="button" onClick={() => setIsRegisterMode(true)} className="text-center text-[10px] text-red-500 font-bold mt-1">Need an account? Sign Up</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 select-none text-xs animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Left Profile details editor */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSaveProfile} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-4">
          <span className="font-bold text-white text-sm border-b border-[#18181b] pb-2 flex items-center justify-between">
            <span>Profile Details</span>
            <button id="logout-btn" type="button" onClick={logout} className="text-rose-500 font-bold text-xs">Sign Out</button>
          </span>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-zinc-400 uppercase text-[9px]">Display Name</label>
            <input
              id="dash-fullname"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-zinc-400 uppercase text-[9px]">Phone</label>
            <input
              id="dash-phone"
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
            />
          </div>

          <span className="font-bold text-zinc-400 text-[10px] uppercase border-t border-zinc-900 pt-3">Alter Password security details</span>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-zinc-400 uppercase text-[9px]">Current Password</label>
            <input
              id="dash-curr-pass"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
              placeholder="Required to modify password"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-zinc-400 uppercase text-[9px]">New Password</label>
            <input
              id="dash-new-pass"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-red-600 focus:bg-black font-semibold"
            />
          </div>

          <button
            id="dash-profile-submit"
            type="submit"
            className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer text-[10px] uppercase"
          >
            Save Account Specs
          </button>
        </form>
      </div>

      {/* Right Orders timeline history */}
      <div className="md:col-span-2 flex flex-col gap-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl p-6 shadow-sm">
        <span className="font-bold text-white text-sm border-b border-zinc-900 pb-3">Your Account History ({myOrders.length} orders)</span>

        <div className="flex flex-col gap-4">
          {myOrders.map(order => (
            <div key={order.id} className="p-4 bg-black border border-zinc-900 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-red-500 font-mono">{order.id}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    order.status === 'Delivered' ? 'bg-red-950/80 text-red-400 border border-red-900/40' : 'bg-amber-950/80 text-amber-400 border border-amber-900/40'
                  }`}>{order.status}</span>
                  <button
                    id={`track-hash-btn-${order.id}`}
                    onClick={() => { window.location.hash = `#/track-order?ref=${order.id}`; }}
                    className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] border border-zinc-850 text-zinc-300 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Track Step Timeline
                  </button>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex flex-col gap-2">
                {order.items.map((it, i) => (
                  <div key={i} className="flex gap-2 items-center justify-between">
                    <span className="font-medium text-zinc-300 uppercase">{it.name} <span className="text-[10px] text-zinc-500">({it.quantity}x)</span></span>
                    <span className="font-bold text-white font-mono">৳{it.price * it.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-900 pt-2 font-bold text-white flex justify-between">
                  <span>Grand Total amount paid:</span>
                  <span className="font-mono">৳{order.finalAmount}</span>
                </div>
              </div>
            </div>
          ))}
          {myOrders.length === 0 && (
            <p className="p-8 text-center text-zinc-500 font-semibold border border-zinc-900 border-dashed rounded-3xl">No previous orders tracked under your customer credentials.</p>
          )}
        </div>
      </div>

    </div>
  );
};

// 8. ORDER TRACKING VIEW (Dynamic Timeline Pending -> Processing -> Shipped -> Out for Delivery -> Delivered)
const TrackOrderView: React.FC = () => {
  const [refField, setRefField] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if redirect query string from hash has a tracking reference
    const hash = window.location.hash || '#/';
    if (hash.includes('?ref=')) {
      const orderId = hash.split('?ref=')[1];
      fetch(`/api/orders/track/${orderId}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setTrackedOrder(data);
          setError('');
        })
        .catch(() => {
          setError('Order details not found. Double check your reference ID.');
        });
    }
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refField) return;

    try {
      const res = await fetch(`/api/orders/track/${refField}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedOrder(data);
        setError('');
      } else {
        setError(data.message || 'Tracking failed.');
        setTrackedOrder(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stepsList = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const getStepIndex = (status: string) => stepsList.indexOf(status);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 select-none text-xs animate-fadeIn flex flex-col gap-6">
      
      {/* Tracking Search Input */}
      <form onSubmit={handleTrackSubmit} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-emerald-500 uppercase font-bold">Courier Operations Dashboard</span>
          <h2 className="text-base font-bold text-white font-sans">Shipment Ledger Tracker</h2>
        </div>
        <div className="flex gap-2">
          <input
            id="track-order-ref-input"
            type="text"
            value={refField}
            onChange={e => setRefField(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#18181b] border border-zinc-800 text-white rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-semibold"
            placeholder="Enter Order Reference ID e.g. ord-1001"
            required
          />
          <button
            id="submit-tracking"
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
          >
            Query Tracking
          </button>
        </div>
        {error && <p className="text-rose-500 font-medium">{error}</p>}
      </form>

      {/* Tracking results timeline */}
      {trackedOrder && (
        <div className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-3xl shadow-sm flex flex-col gap-8 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Ledger Registry</span>
              <span className="font-extrabold text-sm text-white font-mono">{trackedOrder.id}</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-xl uppercase tracking-wider">{trackedOrder.status}</span>
          </div>

          {/* Graphical timeline */}
          <div className="relative flex justify-between items-center border-b border-zinc-900 pb-8 mt-4">
            <div className="absolute left-4 right-4 h-1.5 bg-zinc-800 z-0 top-1/2 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute left-4 h-1.5 bg-emerald-600 z-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-500" 
              style={{ width: `${(getStepIndex(trackedOrder.status) / (stepsList.length - 1)) * 95}%` }}
            />

            {stepsList.map((stepName, idx) => {
              const activeIdx = getStepIndex(trackedOrder.status);
              const isPastOrCurrent = idx <= activeIdx;
              return (
                <div key={stepName} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border transition-all ${
                    isPastOrCurrent ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-black border-zinc-800 text-zinc-650'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${isPastOrCurrent ? 'text-emerald-500' : 'text-zinc-500'}`}>{stepName}</span>
                </div>
              );
            })}
          </div>

          {/* Audit Logs Steps */}
          <div className="flex flex-col gap-4">
            <span className="font-bold text-zinc-400 text-[10px] uppercase">Shipment Activity timeline</span>
            <div className="flex flex-col gap-3">
              {trackedOrder.trackingTimeline.map((step: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-3 bg-black border border-zinc-900 rounded-2xl select-none">
                  <div className="w-8 h-8 rounded-xl bg-[#18181b] border border-zinc-850 flex items-center justify-center shrink-0 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span className="font-extrabold text-zinc-100">{step.status}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{new Date(step.date).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-400 font-light mt-0.5">{step.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 9. STATIC INFORMATIONAL PAGES VIEW
const StaticPagesView: React.FC<{ pageId: string }> = ({ pageId }) => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 select-none text-xs leading-relaxed animate-fadeIn bg-[#0c0c0c] border border-zinc-900 rounded-4xl p-8 shadow-sm flex flex-col gap-6 text-zinc-350">
      
      {pageId === 'about' && (
        <div className="flex flex-col gap-4 font-light text-left">
          <h1 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">About Our Creations Philosophy</h1>
          <p className="text-zinc-300">
            Welcome to ✨ SS AI Store, where premium e-commerce converges with high-fidelity digital craftsmanship. Founded in 2026, we specialize in curation workflows that prioritize premium product authenticity, lifestyle gadgets, and guaranteed customer satisfaction.
          </p>
          <p className="text-zinc-300">
            Every keyboard switch, wool blending pattern, and face elixir variant is handpicked by our corporate aesthetic staff to ensure you receive pristine utility items built to stand historical trials. We operate our own express dispatch pipelines directly connecting with international and domestic logistics.
          </p>
        </div>
      )}

      {pageId === 'contact' && (
        <div className="flex flex-col gap-5">
          <h1 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">Direct Support Care</h1>
          <p className="text-zinc-400 font-light">
            If you have an issue with checking out, manual bKash transaction upload delays, or need custom logistics help, draft a helpline ticket below.
          </p>
          <form onSubmit={e => { e.preventDefault(); alert('Helpline care ticket queued successfully.'); }} className="flex flex-col gap-3 font-light text-zinc-300">
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase text-[9px]">Full Name</label>
                <input id="contact-form-name" type="text" className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-emerald-600 font-semibold" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-400 uppercase text-[9px]">Email Address</label>
                <input id="contact-form-email" type="email" className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-emerald-600 font-semibold" required />
              </div>
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="font-bold text-zinc-400 uppercase text-[9px]">Draft query</label>
              <textarea id="contact-form-msg" rows={4} className="px-3 py-1.5 bg-[#18181b] border border-zinc-800 text-white rounded-lg focus:outline-none focus:border-emerald-600 font-semibold" required />
            </div>
            <button id="contact-submit" type="submit" className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer">Queue Care Ticket</button>
          </form>
        </div>
      )}

      {pageId === 'faq' && (
        <div className="flex flex-col gap-5">
          <h1 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">Frequently Asked Questions (FAQ)</h1>
          <div className="flex flex-col gap-4 font-light text-zinc-300 leading-normal text-left">
            <div>
              <p className="font-bold text-zinc-100 text-xs mb-1">How long does manual payment slip validation take?</p>
              <p>Manual bKash, Nagad, or bank transfers are verified by our backoffice administrative team within 1 to 2 business hours. You will see your live timeline shift from "Pending" to "Processing" immediately upon verification.</p>
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-xs mb-1">Are bKash and Nagad payments fully secure?</p>
              <p>Yes. Transactions use direct cellular protocol reference hashes which can be securely traced directly back to the Central Bank of Bangladesh network. Zero fraud vulnerability.</p>
            </div>
          </div>
        </div>
      )}

      {pageId === 'privacy' && (
        <div className="flex flex-col gap-4 font-light text-zinc-300 text-left">
          <h1 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">Privacy & Cookie Protocols</h1>
          <p>
            We process transaction parameters securely using end-to-end encrypted SSL mechanisms. We never share customer profiles, addresses, or purchase history ledgers with third-party tracking corporations.
          </p>
        </div>
      )}

      {pageId === 'refund' && (
        <div className="flex flex-col gap-4 font-light text-zinc-300 text-left">
          <h1 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">Zero-Risk Return Guidelines</h1>
          <p>
            If your custom drops item arrives with variant defects, simply draft a ticket under our care panel or contact our helpline within 14 calendar days. We will dispatch a pickup courier partner to collect and process your 100% complete refund.
          </p>
        </div>
      )}

    </div>
  );
};
