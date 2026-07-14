import React, { useState, useEffect } from 'react';
import { 
  useApp, CartItem 
} from '../context/AppContext';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, CreditCard, 
  Settings, Users, Percent, MessageSquare, Truck, ShieldCheck, 
  LogOut, Plus, Edit2, Trash2, Check, X, FileText, UploadCloud, 
  RefreshCw, Lock, AlertTriangle, Eye, ShieldAlert, BarChart3, TrendingUp, HelpCircle,
  Megaphone, Bell, PlusSquare, ClipboardList, Grid, Image, Printer
} from 'lucide-react';
import { DynamicIcon } from './Icons';
import { Product, ProductVariant, Category, Order, Coupon, SliderSlide, ShippingZone, User, AdminActivityLog } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const { user, token, login, logout, siteSettings, showToast, refreshSettings, noticeEnabled, setNoticeEnabled } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add_product' | 'orders' | 'pending_fares' | 'customers' | 'marketing' | 'categories' | 'coupons' | 'notices' | 'settings'>('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [adminEmail, setAdminEmail] = useState('admin@shop.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(e => console.error(e));
    }
  }, [token, activeTab]);

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const result = await login(adminEmail, adminPassword);
    setLoginLoading(false);
    if (result && result.success) {
      showToast('Admin logged in successfully! (অ্যাডমিন লগইন সফল হয়েছে!)', 'success');
    } else {
      showToast(result?.message || 'Login failed. Please check credentials.', 'error');
    }
  };

  const handleQuickAdminFill = () => {
    setAdminEmail('admin@shop.com');
    setAdminPassword('admin123');
    showToast('Admin credentials filled!', 'info');
  };

  // Guard access - must be admin or staff
  if (!token || !user || (user.role !== 'admin' && user.role !== 'staff' && user.role !== 'moderator')) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500">
              <Lock className="w-8 h-8 animate-bounce" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-black tracking-tight text-zinc-50 uppercase">ADMIN PANEL GATEWAY</h1>
              <p className="text-xs text-zinc-400 font-medium">
                Please authenticate using your administrative backoffice credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Email Address</label>
              <input
                id="admin-login-email"
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="admin@shop.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Password</label>
              <input
                id="admin-login-password"
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="admin123"
                required
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                id="admin-quick-fill-btn"
                type="button"
                onClick={handleQuickAdminFill}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-bold transition-all text-[10px]"
              >
                QUICK FILL ADMIN
              </button>
              <button
                id="admin-submit-login-btn"
                type="submit"
                disabled={loginLoading}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold tracking-wider shadow-lg shadow-amber-900/20 transition-all text-[10px]"
              >
                {loginLoading ? 'LOGGING IN...' : 'LOG IN NOW'}
              </button>
            </div>
          </form>

          <div className="border-t border-zinc-800/80 pt-4 flex flex-col gap-3">
            <p className="text-[10px] text-zinc-500 text-center">
              Default Admin Account: <span className="font-bold text-zinc-400">admin@shop.com</span> / <span className="font-bold text-zinc-400">admin123</span>
            </p>
            <a
              id="admin-back-btn"
              href="#/"
              className="w-full py-2.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[10px] font-bold tracking-wide transition-all text-center"
            >
              ← RETURN TO STOREFRONT
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f4] flex flex-col text-zinc-900 font-sans overflow-hidden">
      {/* 1. Neobrutalist Top Bar Header */}
      <header className="h-16 bg-black border-b-[3px] border-black flex items-center justify-between px-6 shrink-0 text-white select-none relative z-20 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        {/* Left Brand Block */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-widest border-2 border-black rounded shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
            SS AI STORE
          </div>
          <span className="bg-cyan-700 border border-cyan-500 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
            ADMIN PANEL
          </span>
          <button className="text-white hover:text-amber-400 font-bold text-lg px-2 ml-1 hidden sm:block">
            ☰
          </button>
        </div>

        {/* Storefront switch option and mock search bar */}
        <div className="hidden lg:flex items-center gap-6">
          <a
            href="#/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-cyan-500 rounded bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,255,255,0.15)]"
          >
            <span>↗ GO TO STORE (স্টোর দেখুন)</span>
          </a>

          {/* Centered Search Mock */}
          <div className="relative">
            <input
              type="text"
              placeholder="অর্ডার বা প্রোডাক্ট খুঁজুন..."
              className="w-80 bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-xs text-white px-4 py-1.5 focus:outline-none placeholder-zinc-500 font-medium rounded-lg"
            />
          </div>
        </div>

        {/* Right side utilities */}
        <div className="flex items-center gap-4">
          {/* Active Notice Toggle Badge */}
          <button
            id="top-notice-toggle-badge"
            onClick={() => setNoticeEnabled(!noticeEnabled)}
            className="bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-lg px-3 py-1 flex items-center gap-1.5 font-black text-[10px] hover:bg-amber-500 transition-all cursor-pointer uppercase"
          >
            <span>📢 NOTICES:</span>
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${noticeEnabled ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
            <span>{noticeEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Bell Notification */}
          <div className="relative cursor-pointer hover:scale-105 transition-transform p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-sm">🔔</span>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black animate-bounce">
              23
            </span>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 pr-3 max-w-[180px] truncate select-none">
            <div className="w-7 h-7 rounded bg-zinc-800 text-zinc-100 font-black flex items-center justify-center text-xs border border-zinc-700">
              B
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-white truncate leading-none uppercase">SS AI STORE</span>
              <span className="text-[8px] font-bold text-green-400 truncate tracking-tighter uppercase mt-0.5">AUTHORIZED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Inner Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 shrink-0 bg-[#f4f4f5] border-r-[3px] border-black flex flex-col justify-between p-5 h-[calc(100vh-4rem)] overflow-y-auto select-none">
          <div className="flex flex-col gap-6">
            {/* System Admin Info */}
            <div className="border-2 border-black rounded-2xl bg-white p-4 flex gap-3 shadow-[3px_3px_0px_rgba(0,0,0,1)] items-center">
              <div className="w-10 h-10 border-2 border-black rounded-xl bg-sky-100 flex items-center justify-center text-sky-950 font-black text-sm shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                👤
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-black uppercase tracking-tight">SYSTEM ADMIN</span>
                <span className="text-[9px] text-red-600 font-bold tracking-tight uppercase flex items-center gap-1 mt-0.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-ping"></span>
                  LIVE_TICKET_COCKPIT
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-col gap-3">
              {[
                { id: 'overview', label: 'DASHBOARD', subtitle: 'ড্যাশবোর্ড' },
                { id: 'products', label: 'PRODUCTS', subtitle: 'পণ্য তালিকা' },
                { id: 'add_product', label: 'ADD PRODUCT', subtitle: 'পণ্য যোগ করুন' },
                { id: 'orders', label: 'ALL ORDERS', subtitle: 'সব অর্ডার', badge: pendingCount > 0 ? pendingCount : null },
                { id: 'pending_fares', label: 'PENDING FARES', subtitle: 'পেন্টিং ফেয়ারস', badge: 23 },
                { id: 'categories', label: 'CATEGORIES', subtitle: 'ক্যাটাগরি' },
                { id: 'coupons', label: 'COUPONS', subtitle: 'কুপন কোড' },
                { id: 'marketing', label: 'SLIDER BANNERS', subtitle: 'স্লাইড ব্যানার' },
                { id: 'notices', label: 'LIVE NOTICES', subtitle: 'লাইভ নোটিশ' },
                { id: 'customers', label: 'CUSTOMERS', subtitle: 'গ্রাহক তালিকা' },
                { id: 'settings', label: 'SITE SETTINGS', subtitle: 'সাইট সেটিং' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`admin-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs transition-all ${
                      isActive
                        ? 'bg-[#991b1b] text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="tracking-tight">{tab.label}</span>
                      <span className={`text-[9px] font-bold ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>({tab.subtitle})</span>
                    </div>
                    {tab.badge !== undefined && tab.badge !== null && (
                      <span className="px-2 py-0.5 text-[9px] bg-red-600 text-white rounded-full font-black border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Footer */}
          <div className="border-t-2 border-black/10 pt-4 mt-6 flex flex-col gap-3">
            <button
              id="admin-logout-btn"
              onClick={() => {
                logout();
                window.location.hash = '#/';
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black bg-zinc-100 hover:bg-rose-50 text-xs text-black font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>← LOGOUT {user.name.toUpperCase()} (লগ আউট)</span>
            </button>
          </div>
        </aside>

        {/* Right Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#fbf9f4] h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-5">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-black uppercase tracking-tight">{activeTab.replace('_', ' ')} PANEL</h1>
                <p className="text-[11px] text-zinc-500 font-medium">Live shop operational metrics, secure parameters, and user-generated audits.</p>
              </div>
              <a
                href="#/"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black rounded-lg bg-white text-black border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>BACK TO STOREFRONT VIEW</span>
              </a>
            </div>

            {/* Tab Pages */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'pending_fares' && <OrdersTab onlyPendingPayment={true} />}
            {activeTab === 'products' && <ProductsTab initiallyOpenAdd={false} />}
            {activeTab === 'add_product' && <ProductsTab initiallyOpenAdd={true} onBackToProducts={() => setActiveTab('products')} />}
            {activeTab === 'categories' && <CategoriesTab />}
            {activeTab === 'coupons' && <MarketingTab hideSliders={true} />}
            {activeTab === 'marketing' && <MarketingTab hideCoupons={true} />}
            {activeTab === 'notices' && <NoticesTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- SUB-PANEL TABS ---

// 1. Dashboard Overview Tab
const OverviewTab: React.FC = () => {
  const { token } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products and orders
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
    ]).then(([prods, ords]) => {
      setProducts(prods);
      setOrders(ords);

      // Compute simple stats
      const totalRevenue = ords.reduce((sum: number, o: Order) => o.paymentStatus === 'verified' || o.paymentStatus === 'successful' ? sum + o.finalAmount : sum, 0);
      const pendingOrdersCount = ords.filter((o: Order) => o.status === 'Pending').length;
      const lowStockProducts = prods.filter((p: Product) => p.variants.some((v: ProductVariant) => v.stock <= p.lowStockThreshold));

      // Get unique customers
      const uniqueCustomers = new Set(ords.map(o => o.guestInfo?.email || o.shippingAddress.email || o.userId)).size;

      setMetrics({
        totalRevenue,
        totalOrders: ords.length,
        totalProducts: prods.length,
        pendingCount: pendingOrdersCount,
        totalCustomers: uniqueCustomers || 3,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts
      });
      setLoading(false);
    }).catch(e => {
      console.error(e);
      // Fallback seeds if fetch fails
      setMetrics({
        totalRevenue: 6050,
        totalOrders: 25,
        totalProducts: 18,
        pendingCount: 23,
        totalCustomers: 3,
        lowStockCount: 2,
        lowStockItems: []
      });
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="text-sm font-black flex items-center gap-2 text-black"><RefreshCw className="w-4 h-4 animate-spin text-red-600" />LOADING ANALYTICAL METRICS...</div>;

  const salesHistory = [
    { name: 'Monday', Sales: 2420 },
    { name: 'Tuesday', Sales: 1890 },
    { name: 'Wednesday', Sales: 1560 },
    { name: 'Thursday', Sales: 3200 },
    { name: 'Friday', Sales: 2280 },
    { name: 'Saturday', Sales: 2540 },
    { name: 'Sunday', Sales: (metrics?.totalRevenue || 6050) },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fadeIn select-none font-sans text-black">
      {/* Overview Top bar area */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 border-l-4 border-red-800 pl-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-black tracking-tight uppercase">ADMIN OVERVIEW & STATS</h2>
            <p className="text-xs text-zinc-500 font-bold">এখানে আপনার স্টোরের সামগ্রিক হিসাব-নিকাশ দেখতে পাবেন।</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-lg bg-zinc-100 text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            LIVE FEED
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-red-800 text-white border-2 border-black rounded-lg text-xs font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all cursor-pointer uppercase"
          >
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL REVENUE (মোট আয়)', value: `৳ ${(metrics?.totalRevenue || 6050).toLocaleString()}`, desc: 'TOTAL SALES LEDGER', symbol: '৳' },
          { label: 'TOTAL ORDERS (মোট অর্ডার)', value: metrics?.totalOrders || 25, desc: 'VALIDATED TALLIES', symbol: '📄' },
          { label: 'TOTAL CUSTOMERS (গ্রাহক)', value: metrics?.totalCustomers || 3, desc: 'REGISTERED LEADS', symbol: '👥' },
          { label: 'TOTAL PRODUCTS (পণ্য তালিকা)', value: metrics?.totalProducts || 18, desc: 'IN-STORE SKU COUNT', symbol: '🛍️' }
        ].map((card, i) => {
          return (
            <div key={i} className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] text-zinc-800 font-extrabold tracking-tight uppercase">{card.label}</span>
                <span className="text-xl font-black text-red-700">{card.symbol}</span>
              </div>
              <span className="text-3xl font-black text-black tracking-tighter my-1">
                {card.value}
              </span>
              <span className="text-[9px] text-[#991b1b] font-black tracking-wider uppercase">
                {card.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts & Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sales Performance Line Chart */}
        <div className="lg:col-span-2 p-6 bg-white border-2 border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-2 border-black/5 pb-4">
            <div className="flex items-center gap-2 border-l-[6px] border-[#991b1b] pl-3">
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">REVENUE GRAPH (আয় পরিমাপক চিত্র)</h3>
                <span className="text-[10px] text-zinc-400 font-bold">আয় পরিমাপক চিত্র</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#991b1b] inline-block border border-black rounded-sm"></span>
              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">SALES STATS</span>
            </div>
          </div>
          <div className="h-80 w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#000" tickLine={false} className="font-extrabold" />
                <YAxis stroke="#000" tickLine={false} className="font-extrabold" />
                <Tooltip contentStyle={{ background: '#fff', border: '2px solid black', borderRadius: '8px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="Sales" stroke="#991b1b" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#991b1b', strokeWidth: 3 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="p-6 bg-white border-2 border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-6 max-h-[460px] overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-black/5 pb-4">
            <h3 className="text-sm font-black text-black uppercase tracking-tight">RECENT ORDERS (সাম্প্রতিক অর্ডার)</h3>
            <span className="px-2.5 py-1 text-[8px] bg-zinc-100 text-black border-2 border-black rounded font-black shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">
              LIVE STAMPS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="p-4 bg-[#fcfaf6] border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] group hover:translate-x-0.5 transition-transform">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-red-800 truncate">#{o.id}</span>
                  <span className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">
                    {o.guestInfo?.fullName || o.shippingAddress.fullName || 'VCFV'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-black text-black">৳ {o.finalAmount.toLocaleString()}</span>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border border-black ${
                    o.paymentStatus === 'verified' || o.paymentStatus === 'successful'
                      ? 'bg-emerald-100 text-emerald-950'
                      : 'bg-amber-100 text-amber-950'
                  }`}>
                    {o.paymentStatus === 'verified' || o.paymentStatus === 'successful' ? 'SUCCESS' : 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">📝</span>
                <p className="text-[11px] font-black uppercase text-zinc-500">No system orders logged.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Alerts Row */}
      {metrics?.lowStockItems?.length > 0 && (
        <div className="p-6 bg-amber-50 border-2 border-black rounded-3xl flex flex-col gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-tight">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>CRITICAL ALERT: REORDER STOCK REQUIRED IMMEDIATELY</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.lowStockItems.map((prod: Product) => (
              <div key={prod.id} className="p-4 bg-white border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-black truncate">{prod.name}</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">Low threshold: {prod.lowStockThreshold}</span>
                </div>
                <span className="px-2 py-1 text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300 rounded">
                  Left: {prod.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Product Management Tab
const ProductsTab: React.FC<{ initiallyOpenAdd?: boolean; onBackToProducts?: () => void }> = ({ initiallyOpenAdd = false, onBackToProducts }) => {
  const { token, showToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 25;

  // Edit / Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(initiallyOpenAdd);
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    unit: '1 KG',
    images: [''],
    variants: [{ sku: '', size: '', color: '', stock: 50, price: 99 }],
    originalPrice: '',
    salePrice: '',
    stock: 50,
    productSizes: '',
    lowStockThreshold: 5,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isPopular: false,
    isFlashSale: false,
    isSpecialOffer: false,
    metaTitle: '',
    metaDescription: '',
    slug: ''
  });

  useEffect(() => {
    if (initiallyOpenAdd) {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', category: '', subcategory: '',
        unit: '1 KG', images: [''], variants: [{ sku: '', size: '', color: '', stock: 50, price: 99 }],
        originalPrice: '', salePrice: '', stock: 50, productSizes: '', lowStockThreshold: 5,
        isFeatured: false, isNewArrival: true, isBestSeller: false,
        isPopular: false, isFlashSale: false, isSpecialOffer: false,
        metaTitle: '', metaDescription: '', slug: ''
      });
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
  }, [initiallyOpenAdd]);

  const handleClose = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    if (onBackToProducts) {
      onBackToProducts();
    }
  };

  const fetchProds = async () => {
    setLoading(true);
    let url = `/api/products?limit=${limit}&page=${currentPage}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/categories')
      ]);

      if (prodRes.ok && catRes.ok) {
        const prods = await prodRes.json();
        const cats = await catRes.json();
        
        const totalHeader = prodRes.headers.get('X-Total-Count');
        const count = totalHeader ? parseInt(totalHeader, 10) : prods.length;

        setProducts(prods);
        setCategories(cats);
        setTotalCount(count);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProds();
  }, [currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchProds();
    } else {
      setCurrentPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Product deleted from active index.', 'success');
        fetchProds();
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory || '',
      unit: p.unit || '1 KG',
      images: p.images.length > 0 ? p.images : [''],
      variants: p.variants,
      originalPrice: p.originalPrice || '',
      salePrice: p.salePrice || '',
      stock: p.stock || p.variants.reduce((sum, v) => sum + v.stock, 0) || 50,
      productSizes: p.variants.map(v => v.size).filter(Boolean).join(', '),
      lowStockThreshold: p.lowStockThreshold || 5,
      isFeatured: !!p.isFeatured,
      isNewArrival: !!p.isNewArrival,
      isBestSeller: !!p.isBestSeller,
      isPopular: !!p.isPopular,
      isFlashSale: !!p.flashSaleEnabled,
      isSpecialOffer: !!p.isSpecialOffer,
      metaTitle: p.seo?.metaTitle || '',
      metaDescription: p.seo?.metaDescription || '',
      slug: p.seo?.slug || ''
    });
    setShowAddForm(true);
  };

  const handleAddVariantRow = () => {
    setFormData((prev: any) => ({
      ...prev,
      variants: [...prev.variants, { sku: '', size: '', color: '', stock: 10, price: prev.originalPrice }]
    }));
  };

  const handleRemoveVariantRow = (idx: number) => {
    if (formData.variants.length <= 1) return;
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleAddImageRow = () => {
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleRemoveImageRow = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleImageUpload = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev: any) => {
        const updated = [...prev.images];
        updated[idx] = reader.result as string;
        return { ...prev, images: updated };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sellingPrice = parseFloat(formData.salePrice);
    const beforeDiscount = parseFloat(formData.originalPrice);

    // Validations
    if (!formData.name || !formData.category || (!sellingPrice && !beforeDiscount)) {
      showToast('Product name, category, and selling price or before-discount price are required.', 'error');
      return;
    }

    const finalSellingPrice = sellingPrice || beforeDiscount;
    const finalBeforeDiscount = beforeDiscount || sellingPrice;
    const stockDensity = parseInt(formData.stock) || 0;

    // Convert comma-separated sizes into variants
    let processedVariants = [];
    if (formData.productSizes && formData.productSizes.trim() !== '') {
      const sizes = formData.productSizes.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      processedVariants = sizes.map((size: string, i: number) => {
        const slugBase = formData.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
        const baseStock = Math.floor(stockDensity / sizes.length);
        const remainder = stockDensity % sizes.length;
        const stockVal = i === sizes.length - 1 ? baseStock + remainder : baseStock;
        return {
          sku: `${slugBase}-${size.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-${i + 1}`,
          size,
          color: '',
          stock: stockVal,
          price: finalSellingPrice
        };
      });
    } else {
      const slugBase = formData.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
      processedVariants = [{
        sku: `${slugBase}-STD`,
        size: '',
        color: '',
        stock: stockDensity,
        price: finalSellingPrice
      }];
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory,
      unit: formData.unit || '1 KG',
      images: formData.images.filter((img: string) => img.trim() !== ''),
      variants: processedVariants,
      originalPrice: finalBeforeDiscount,
      salePrice: sellingPrice && beforeDiscount ? sellingPrice : undefined,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      isPopular: formData.isPopular,
      isSpecialOffer: formData.isSpecialOffer,
      flashSaleEnabled: formData.isFlashSale,
      seo: {
        metaTitle: formData.metaTitle || formData.name,
        metaDescription: formData.metaDescription || formData.description,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
    };

    const method = editingProduct ? 'PUT' : 'POST';
    const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingProduct ? 'Product inventory updated.' : 'Product launched successfully!', 'success');
        handleClose();
        fetchProds();
      } else {
        showToast(data.message || 'Launch failed.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error registering server connection.', 'error');
    }
  };

  // Mock CSV upload trigger
  const handleBulkMock = async () => {
    const list = [
      { name: 'Symphony Smart Desk Lamp', category: 'home_decor', originalPrice: '85', stock: '20', description: 'Smart LED ambient light bar with voice companion support.' },
      { name: 'Aurora Silk Scarves', category: 'fashion', originalPrice: '45', stock: '50', description: '100% natural Mulberry silk with creative geometric patterns.' }
    ];
    try {
      const res = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productsList: list })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchProds();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-sans text-black">
      {/* List Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            id="admin-add-prod-btn"
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '', description: '', category: '', subcategory: '',
                unit: '1 KG', images: [''], variants: [{ sku: '', size: '', color: '', stock: 50, price: 99 }],
                originalPrice: '', salePrice: '', stock: 50, productSizes: '', lowStockThreshold: 5,
                isFeatured: false, isNewArrival: true, isBestSeller: false,
                isPopular: false, isFlashSale: false, isSpecialOffer: false,
                metaTitle: '', metaDescription: '', slug: ''
              });
              setShowAddForm(true);
            }}
            className="px-5 py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={3} />
            <span>LAUNCH NEW PRODUCT</span>
          </button>

          <button
            id="admin-bulk-mock-btn"
            onClick={handleBulkMock}
            className="px-5 py-3 bg-white hover:bg-zinc-100 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>SIMULATE BULK CSV UPLOAD</span>
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black rounded-xl bg-amber-400 text-black text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
          ITEMS REGISTERED: {products.length}
        </span>
      </div>

      {/* Launcher/Editor Overlay Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#fbf9f4] border-[3px] border-black rounded-3xl w-full max-w-5xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Top Info Bar */}
            <div className="px-6 py-4 bg-zinc-100 border-b-2 border-black flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black text-zinc-500 tracking-wider uppercase">
                ADD, MUTATE OR ELIMINATE ITEMS FROM DIRECTORY LISTING HERE. VALUES REFLECT GLOBALLY INSTANTLY.
              </span>
              <button
                type="button"
                id="close-wizard"
                onClick={handleClose}
                className="bg-[#0f9f75] hover:bg-emerald-700 text-white border-2 border-black rounded-lg px-4 py-2 font-black flex items-center gap-1.5 uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[10px] cursor-pointer transition-all active:translate-y-0.5 active:shadow-none shrink-0"
              >
                + DISMISS FORM
              </button>
            </div>

            {/* Red Heading Bar */}
            <div className="bg-[#B31312] text-white p-4 border-b-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="font-extrabold text-base">+</span>
              <span>{editingProduct ? 'EDIT PRODUCT RECORD / সংশোধন' : 'DEFINE NEW PRODUCT RECORD (নতুন পণ্য বিবরণ)'}</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs bg-[#f4ece5]">
              {/* Main Body Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Side Form Fields (7 Columns) */}
                <div className="col-span-1 lg:col-span-7 flex flex-col gap-5">
                  {/* Row 1: Product Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">PRODUCT NAME (পণ্যের নাম)</label>
                      <input
                        id="wizard-name"
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500 uppercase"
                        placeholder="E.G. RAJSHAHI FAZLI MANGO"
                        required
                      />
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-1.5">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">CATEGORY (ক্যাটাগরি)</label>
                      <select
                        id="wizard-category"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312]"
                        required
                      >
                        <option value="">Choose category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Unit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-black text-black text-[11px] uppercase tracking-wide">UNIT (একক)</label>
                    <input
                      id="wizard-unit"
                      type="text"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500 uppercase"
                      placeholder="E.G. 1 KG"
                      required
                    />
                  </div>

                  {/* Row 3: Prices & Stock */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">SELLING PRICE - ৳ (বিক্রয় মূল্য)</label>
                      <input
                        id="wizard-sale-price"
                        type="number"
                        value={formData.salePrice}
                        onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                        className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500"
                        placeholder="E.G. 100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">BEFORE DISCOUNT - ৳ (পূর্বমূল্য)</label>
                      <input
                        id="wizard-orig-price"
                        type="number"
                        value={formData.originalPrice}
                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500"
                        placeholder="E.G. 120"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">STOCK DENSITY (স্টক পরিমাণ)</label>
                      <input
                        id="wizard-stock"
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500"
                        placeholder="50"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 4: Multiple Product Photos Manager */}
                  <div className="flex flex-col gap-3 p-4 border-2 border-black rounded-2xl bg-[#fcfaf6] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-black text-[11px] uppercase tracking-wide">PRODUCT PHOTOS (পণ্যের ছবিসমূহ)</label>
                      <button
                        type="button"
                        onClick={handleAddImageRow}
                        className="px-3 py-1 bg-amber-300 hover:bg-amber-400 text-black border-2 border-black rounded-lg text-[10px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                      >
                        + ADD NEW IMAGE
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                      {formData.images.map((img: string, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 p-2 border border-black/10 rounded-lg bg-white">
                          <div className="flex items-center justify-between text-[10px] font-black text-zinc-600">
                            <span>PHOTO #{idx + 1}</span>
                            {formData.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImageRow(idx)}
                                className="text-[#B31312] hover:underline uppercase"
                              >
                                REMOVE (মুছে ফেলুন)
                              </button>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={img || ''}
                              onChange={e => {
                                const updated = [...formData.images];
                                updated[idx] = e.target.value;
                                setFormData({ ...formData, images: updated });
                              }}
                              className="flex-1 px-4 py-2 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500"
                              placeholder="PASTE IMAGE URL HERE..."
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`browse-product-image-${idx}`)?.click()}
                              className="px-4 py-2 bg-[#dcdcdc] hover:bg-stone-300 text-black font-black border-2 border-black rounded-lg text-xs shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
                            >
                              BROWSE
                            </button>
                            <input
                              type="file"
                              id={`browse-product-image-${idx}`}
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(idx, e.target.files[0]);
                                }
                              }}
                            />
                          </div>

                          {img && (
                            <div className="w-12 h-12 rounded border border-black overflow-hidden bg-zinc-100">
                              <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 5: Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-black text-black text-[11px] uppercase tracking-wide">DESCRIPTION (সংক্ষিপ্ত বিবরণ)</label>
                    <textarea
                      id="wizard-description"
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500 uppercase"
                      placeholder="ADD BRIEF DETAILS OR HEALTH BENEFITS..."
                    />
                  </div>

                  {/* Row 6: Sizes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-black text-black text-[11px] uppercase tracking-wide">PRODUCT SIZES (কমা দিয়ে সাইজ লিখুন, ঐচ্ছিক)</label>
                    <input
                      id="wizard-sizes"
                      type="text"
                      value={formData.productSizes}
                      onChange={e => setFormData({ ...formData, productSizes: e.target.value })}
                      className="px-4 py-2.5 border-2 border-black rounded-lg text-xs font-black text-black bg-[#dcdcdc] focus:outline-none focus:ring-0 focus:bg-white focus:border-[#B31312] placeholder-zinc-500 uppercase"
                      placeholder="E.G. S, M, L, XL OR 38, 40, 42"
                    />
                    <span className="text-[10px] text-[#B31312] font-black">
                      আলাদা সাইজের পণ্য হলে কমা (,) দিয়ে সাইজগুলো লিখুন (যেমন: S, M, L)
                    </span>
                  </div>
                </div>

                {/* Right Side Live Preview (3 Columns) */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-3">
                  <span className="font-black text-black text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    📷 LIVE STAMP PREVIEW
                  </span>
                  <div className="border-2 border-dashed border-black rounded-2xl p-4 bg-zinc-100 flex-1 min-h-[220px] flex flex-col items-center justify-center text-center relative select-none overflow-hidden">
                    {formData.images[0] ? (
                      <img
                        src={formData.images[0]}
                        alt="Live stamp preview"
                        className="w-full h-full max-h-[300px] object-contain rounded-xl border border-zinc-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-black text-zinc-700 uppercase">AWAITING PRODUCT LINK</span>
                        <span className="text-[9px] text-zinc-500 font-bold mt-1">
                          (ছবির প্রিভিউ এখানে লাইভ দেখা যাবে)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 7: Tags */}
              <div className="border-2 border-black p-4 bg-zinc-50 rounded-2xl flex flex-col gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] mt-2">
                <span className="font-black text-black text-[11px] uppercase tracking-wide">
                  PROMO & CATEGORY TAGS (প্রচার এবং ট্যাগসমূহ)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'isFeatured', label: 'HERO SLIDER' },
                    { id: 'isBestSeller', label: 'BEST SELLER' },
                    { id: 'isNewArrival', label: 'NEW ARRIVAL' },
                    { id: 'isPopular', label: 'POPULAR TAG' },
                    { id: 'isFlashSale', label: '⚡ FLASH SALE' },
                    { id: 'isSpecialOffer', label: '🎁 SPECIAL OFFER' },
                  ].map(tag => (
                    <label key={tag.id} className="flex items-center gap-2 font-black text-[10px] text-zinc-800 uppercase cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!formData[tag.id]}
                        onChange={e => setFormData({ ...formData, [tag.id]: e.target.checked })}
                        className="w-4.5 h-4.5 rounded border-2 border-black accent-[#B31312] focus:ring-0 cursor-pointer"
                      />
                      <span>{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced SEO Metadata accordion */}
              <details className="border-2 border-black bg-white rounded-2xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] mt-2">
                <summary className="p-4 font-black text-[11px] text-black uppercase tracking-wide cursor-pointer select-none bg-zinc-50 flex items-center justify-between">
                  <span>Search Engine Optimization (SEO) & Advanced Settings (ঐচ্ছিক)</span>
                  <span className="text-xs">▼</span>
                </summary>
                <div className="p-4 bg-white border-t-2 border-black grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-black uppercase">Meta Title</label>
                    <input
                      id="seo-meta-title"
                      type="text"
                      value={formData.metaTitle}
                      onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black text-black bg-white focus:outline-none"
                      placeholder="e.g. Rajshahi Mangoes"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-black uppercase">Custom Slug / Link</label>
                    <input
                      id="seo-slug"
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black text-black bg-white focus:outline-none"
                      placeholder="e.g. rajshahi-fazli-mango"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-black uppercase">Low Stock Threshold</label>
                    <input
                      id="wizard-low-stock"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black text-black bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-black uppercase">Meta Description</label>
                    <input
                      id="seo-meta-desc"
                      type="text"
                      value={formData.metaDescription}
                      onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="px-3 py-2 border-2 border-black rounded-lg text-xs font-black text-black bg-white focus:outline-none"
                      placeholder="Enter SEO description snippet..."
                    />
                  </div>
                </div>
              </details>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t-2 border-black pt-5 mt-4">
                <button
                  id="wizard-cancel"
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border-2 border-black text-black bg-white hover:bg-zinc-100 rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
                >
                  DISCARD / বাতিল
                </button>
                <button
                  id="wizard-submit"
                  type="submit"
                  className="px-8 py-3 bg-[#B31312] hover:bg-[#940f0f] text-white border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
                >
                  {editingProduct ? 'COMMIT CHANGES / সংশোধন করুন' : 'PUBLISH LIVE / আপলোড করুন'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Search and Metadata Panel */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white border-[3px] border-black rounded-3xl p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] select-none">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, description, or slug..."
            className="flex-1 px-4 py-2.5 border-[3px] border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none placeholder-zinc-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#B31312] hover:bg-[#940f0f] text-white border-[3px] border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
          >
            SEARCH / খুঁজুন
          </button>
        </form>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-zinc-100 px-4 py-2.5 border-[3px] border-black rounded-xl text-black">
            TOTAL PRODUCTS: {totalCount}
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
                // Trigger reload if we are already on page 1
                if (currentPage === 1) {
                  setLoading(true);
                  setTimeout(() => fetchProds(), 50);
                }
              }}
              className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white border-[3px] border-black rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              CLEAR / রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Products list table */}
      <div className="bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] mb-10">
        {loading ? (
          <div className="p-16 text-center text-sm font-black"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-black" /><p className="mt-2 text-[10px] text-zinc-500 uppercase tracking-widest">LOADING INDEX SPECIMENS...</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse select-none">
              <thead>
                <tr className="bg-zinc-100 border-b-2 border-black text-black font-black uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Product Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base price (৳)</th>
                  <th className="p-4">Stock level</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-xs font-semibold text-black bg-white">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-black bg-zinc-50 shrink-0">
                        <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-black text-xs truncate max-w-[15rem] uppercase">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{p.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-xs font-black text-black">{p.category.replace('_', ' ')}</td>
                    <td className="p-4 font-black text-black text-sm">${p.originalPrice}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded border-2 border-black text-[10px] font-black uppercase tracking-wide ${
                        p.stock <= 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : p.stock <= p.lowStockThreshold 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.variants.map((v) => (
                          <span key={v.sku} className="px-1.5 py-0.5 bg-zinc-100 border border-black text-[10px] text-black font-bold rounded uppercase">
                            {v.size || 'STD'}: {v.stock}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`edit-prod-${p.id}`}
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 border-2 border-black bg-amber-300 hover:bg-amber-400 text-black rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                          title="Edit product specs"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          id={`delete-prod-${p.id}`}
                          onClick={() => handleDelete(p.id)}
                          className="p-2 border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Admin Pagination Row */}
        {!loading && (() => {
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
            <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t-[3px] border-black bg-zinc-50 select-none">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                  currentPage === 1
                    ? 'border-zinc-300 text-zinc-400 bg-transparent cursor-not-allowed'
                    : 'border-black text-black bg-white hover:bg-zinc-100'
                }`}
              >
                PREV
              </button>
              
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 border-black text-[10px] font-black cursor-pointer transition-all ${
                      currentPage === 1
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-zinc-100'
                    }`}
                  >
                    1
                  </button>
                  {startPage > 2 && <span className="text-black font-black px-1">...</span>}
                </>
              )}

              {pageNumbers.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 border-black text-[10px] font-black cursor-pointer transition-all ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="text-black font-black px-1">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 border-black text-[10px] font-black cursor-pointer transition-all ${
                      currentPage === totalPages
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-zinc-100'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                  currentPage === totalPages
                    ? 'border-zinc-300 text-zinc-400 bg-transparent cursor-not-allowed'
                    : 'border-black text-black bg-white hover:bg-zinc-100'
                }`}
              >
                NEXT
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// 3. Category Manager Tab
const CategoriesTab: React.FC = () => {
  const { token, showToast } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatImage, setNewCatImage] = useState('');

  // Edit states
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('Sparkles');
  const [editImage, setEditImage] = useState('');

  const handleCatImageUpload = (file: File, isEdit: boolean) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditImage(reader.result as string);
      } else {
        setNewCatImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadCats = () => {
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data));
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newCatName, 
          icon: newCatIcon, 
          image: newCatImage || undefined 
        })
      });
      if (res.ok) {
        showToast('Category created.', 'success');
        setNewCatName('');
        setNewCatIcon('Sparkles');
        setNewCatImage('');
        loadCats();
      } else {
        showToast('Error adding category.', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editName) return;

    try {
      const res = await fetch(`/api/categories/${editingCat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          icon: editIcon, 
          image: editImage 
        })
      });
      if (res.ok) {
        showToast('Category updated.', 'success');
        setEditingCat(null);
        loadCats();
      } else {
        showToast('Error updating category.', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setEditImage(cat.image || '');
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Category deleted.', 'success');
        loadCats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reorder simulator (move up/down)
  const handleMove = async (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === categories.length - 1) return;

    const ordered = [...categories];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const temp = ordered[idx];
    ordered[idx] = ordered[targetIdx];
    ordered[targetIdx] = temp;

    try {
      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderedIds: ordered.map(c => c.id) })
      });
      if (res.ok) {
        showToast('Reordered categories.', 'success');
        loadCats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn text-black font-sans">
      {/* Form Card (Creation / Edit) */}
      <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4 max-h-fit">
        {editingCat ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-black uppercase tracking-tight">EDIT CATEGORY / সম্পাদন করুন</h3>
              <button 
                onClick={() => setEditingCat(null)}
                className="px-2 py-1 text-[10px] font-black border border-black bg-zinc-100 rounded hover:bg-zinc-200 uppercase cursor-pointer"
              >
                CANCEL
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">Category Name</label>
                <input
                  id="edit-cat-name"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  placeholder="e.g. Footwear & Boots"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">Category Image / ছবি</label>
                <div className="flex gap-2">
                  <input
                    id="edit-cat-image"
                    type="text"
                    value={editImage}
                    onChange={e => setEditImage(e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    placeholder="e.g. https://images.unsplash.com/..."
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('browse-edit-cat-image')?.click()}
                    className="px-4 py-2.5 bg-[#dcdcdc] hover:bg-stone-300 text-black font-black border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    BROWSE
                  </button>
                  <input
                    type="file"
                    id="browse-edit-cat-image"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleCatImageUpload(e.target.files[0], true);
                      }
                    }}
                  />
                </div>
                {editImage && (
                  <div className="mt-1 w-14 h-14 rounded-lg border-2 border-black overflow-hidden bg-zinc-100">
                    <img src={editImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">System Icon Lookup</label>
                <select
                  id="edit-cat-icon"
                  value={editIcon}
                  onChange={e => setEditIcon(e.target.value)}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                >
                  <option value="Laptop">Laptop / Tech</option>
                  <option value="Shirt">Shirt / Fashion</option>
                  <option value="Home">Home / Decor</option>
                  <option value="Sparkles">Sparkles / Beauty</option>
                  <option value="Flame">Flame / Sports</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Gift">Gift</option>
                </select>
              </div>

              <button
                id="submit-edit-cat"
                type="submit"
                className="w-full py-3 bg-[#00CC88] hover:bg-emerald-600 text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              >
                SAVE CHANGES / পরিবর্তন সংরক্ষণ করুন
              </button>
            </form>
          </>
        ) : (
          <>
            <h3 className="text-sm font-black text-black uppercase tracking-tight">ADD NEW CATEGORY / নতুন ক্যাটাগরি</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">Category Name</label>
                <input
                  id="new-cat-name"
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  placeholder="e.g. Footwear & Boots"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">Category Image / ছবি</label>
                <div className="flex gap-2">
                  <input
                    id="new-cat-image"
                    type="text"
                    value={newCatImage}
                    onChange={e => setNewCatImage(e.target.value)}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    placeholder="e.g. https://images.unsplash.com/..."
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('browse-new-cat-image')?.click()}
                    className="px-4 py-2.5 bg-[#dcdcdc] hover:bg-stone-300 text-black font-black border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    BROWSE
                  </button>
                  <input
                    type="file"
                    id="browse-new-cat-image"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleCatImageUpload(e.target.files[0], false);
                      }
                    }}
                  />
                </div>
                {newCatImage && (
                  <div className="mt-1 w-14 h-14 rounded-lg border-2 border-black overflow-hidden bg-zinc-100">
                    <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">System Icon Lookup</label>
                <select
                  id="new-cat-icon"
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                >
                  <option value="Laptop">Laptop / Tech</option>
                  <option value="Shirt">Shirt / Fashion</option>
                  <option value="Home">Home / Decor</option>
                  <option value="Sparkles">Sparkles / Beauty</option>
                  <option value="Flame">Flame / Sports</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Gift">Gift</option>
                </select>
              </div>

              <button
                id="submit-new-cat"
                type="submit"
                className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              >
                CREATE CATEGORY / যোগ করুন
              </button>
            </form>
          </>
        )}
      </div>

      {/* Table list */}
      <div className="md:col-span-2 bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)]">
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-zinc-100">
          <h3 className="text-sm font-black text-black uppercase tracking-tight">ACTIVE CATEGORIES LIST</h3>
          <span className="px-2.5 py-1 border border-black bg-amber-400 text-black font-black uppercase text-[10px] rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]">
            Total: {categories.length}
          </span>
        </div>
        <div className="divide-y-2 divide-black">
          {categories.map((c, idx) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#fcfaf6] select-none transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-300 border-2 border-black flex items-center justify-center text-black overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <DynamicIcon name={c.icon} className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase text-black tracking-tight">{c.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">slug: {c.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Reorder controls */}
                <div className="flex gap-1 border-2 border-black bg-white rounded-xl p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <button
                    id={`cat-up-${c.id}`}
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-xs font-black hover:bg-zinc-100 rounded text-black disabled:opacity-30 cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    id={`cat-down-${c.id}`}
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 text-xs font-black hover:bg-zinc-100 rounded text-black disabled:opacity-30 cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                <button
                  id={`edit-cat-${c.id}`}
                  onClick={() => startEdit(c)}
                  className="p-2.5 border-2 border-black bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  id={`delete-cat-${c.id}`}
                  onClick={() => handleDelete(c.id)}
                  className="p-2.5 border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Order Management Panel Tab
const OrdersTab: React.FC<{ onlyPendingPayment?: boolean }> = ({ onlyPendingPayment = false }) => {
  const { token, showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState<any>('');
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState<any>('');
  const [trackingNotes, setTrackingNotes] = useState('');

  const loadOrders = () => {
    let url = '/api/orders';
    if (filterStatus) url += `?status=${filterStatus}`;

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (onlyPendingPayment) {
            setOrders(data.filter(o => o.paymentStatus === 'pending'));
          } else {
            setOrders(data);
          }
        } else {
          setOrders([]);
        }
      })
      .catch(err => {
        console.error(err);
        setOrders([]);
      });
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus, onlyPendingPayment]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateStatus || undefined,
          paymentStatus: updatePaymentStatus || undefined,
          notes: trackingNotes || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated successfully.`, 'success');
        setTrackingNotes('');
        setSelectedOrder(data.order);
        loadOrders();
      } else {
        showToast('Failed to update order status.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error updating order status.', 'error');
    }
  };

  const handleStatusChangeInline = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}.`, 'success');
        loadOrders();
        if (selectedOrder?.id === id) {
          const updated = { ...selectedOrder, status: newStatus };
          setSelectedOrder(updated);
        }
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error updating order status.', 'error');
    }
  };

  const handleQuickConfirm = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Processing' })
      });
      if (res.ok) {
        showToast('Order confirmed successfully.', 'success');
        loadOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: 'Processing' });
        }
      } else {
        showToast('Failed to confirm order.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error confirming order.', 'error');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Order deleted successfully.', 'success');
        if (selectedOrder?.id === id) {
          setSelectedOrder(null);
        }
        loadOrders();
      } else {
        showToast('Failed to delete order.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error deleting order.', 'error');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yy}.${hh}${min}`;
    } catch {
      return dateStr;
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idMatch = o.id.toLowerCase().includes(q);
      const nameMatch = (o.guestInfo?.fullName || o.shippingAddress.fullName || '').toLowerCase().includes(q);
      const cityMatch = (o.shippingAddress.city || '').toLowerCase().includes(q);
      const phoneMatch = (o.guestInfo?.phone || o.shippingAddress.phone || '').toLowerCase().includes(q);
      return idMatch || nameMatch || cityMatch || phoneMatch;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-black font-sans">
      {/* 1. Header with Vertical Line Indicator */}
      <div className="flex flex-col gap-1 border-l-[6px] border-[#991b1b] pl-4 text-left select-none">
        <h2 className="text-xl md:text-2xl font-black text-black tracking-tight uppercase flex items-center gap-2">
          ORDER MANAGEMENT (অর্ডার ব্যবস্থাপনা)
        </h2>
        <div className="text-[10px] md:text-xs font-black text-zinc-500 tracking-wider uppercase">
          MANAGE STORE ORDERS // {filteredOrders.length} OF {orders.length} TOTAL // STATUS: {filterStatus || 'ALL'}
        </div>
      </div>

      {/* 2. Control & Filter Row */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 bg-[#fcfaf6] border-[3px] border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 border-2 border-black rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
              filterStatus === '' 
                ? 'bg-[#991b1b] text-white' 
                : 'bg-white text-black hover:bg-zinc-50'
            }`}
          >
            ALL ORDERS (সব অর্ডার)
          </button>
          
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-4 py-2 border-2 border-black rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
              filterStatus === 'Pending' 
                ? 'bg-[#991b1b] text-white' 
                : 'bg-white text-black hover:bg-zinc-50'
            }`}
          >
            PENDING (অপেক্ষা রত)
          </button>

          <button
            onClick={() => setFilterStatus('Processing')}
            className={`px-4 py-2 border-2 border-black rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
              filterStatus === 'Processing' 
                ? 'bg-[#991b1b] text-white' 
                : 'bg-white text-black hover:bg-zinc-50'
            }`}
          >
            CONFIRMED (নিশ্চিত কৃত)
          </button>

          <div className="h-6 w-0.5 bg-zinc-300 hidden sm:block mx-1"></div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 border-2 border-black rounded-xl text-[11px] font-black uppercase bg-white hover:bg-zinc-50 text-black flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            REFRESH (রিফ্রেশ)
          </button>
        </div>

        {/* Dynamic Live Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-100 border-2 border-black rounded-xl text-xs font-black text-black placeholder-zinc-500 uppercase focus:outline-none focus:ring-0 focus:border-[#991b1b]"
            placeholder="SEARCH ORDER ID, NAME, CITY, OR PHONE..."
          />
        </div>
      </div>

      {/* 3. Orders Grid & Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table View */}
        <div className={`bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] ${selectedOrder ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse select-none">
              <thead>
                <tr className="bg-[#991b1b] border-b-2 border-black text-white font-black uppercase tracking-wider text-[11px]">
                  <th className="p-4 pl-6 border-r border-black/20">ORDER ID (আইডি)</th>
                  <th className="p-4 border-r border-black/20">CUSTOMER (গ্রাহক খতিয়ান)</th>
                  <th className="p-4 border-r border-black/20">ITEMS (পণ্য তালিকা)</th>
                  <th className="p-4 border-r border-black/20">AMOUNT (মোট মূল্য)</th>
                  <th className="p-4 border-r border-black/20">STATUS (বর্তমান অবস্থা)</th>
                  <th className="p-4 pr-6 text-center">ACTIONS (পদক্ষেপ)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-xs font-semibold text-black bg-white">
                {filteredOrders.map(o => {
                  const customerName = o.guestInfo?.fullName || o.shippingAddress.fullName || 'GUEST USER';
                  const city = (o.shippingAddress.city || 'DHAKA').toUpperCase();
                  const phone = o.guestInfo?.phone || o.shippingAddress.phone || 'NO PHONE';
                  
                  return (
                    <tr key={o.id} className={`hover:bg-[#fcfaf6] transition-colors ${selectedOrder?.id === o.id ? 'bg-amber-100/40 border-l-[6px] border-l-[#991b1b]' : ''}`}>
                      {/* Order ID Column */}
                      <td className="p-4 pl-6 font-black font-mono uppercase text-black border-r border-zinc-200">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 font-black tracking-tight text-xs">#{o.id}</span>
                          <span className="text-[10px] text-zinc-500 font-normal mt-1">{formatOrderDate(o.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer Column */}
                      <td className="p-4 border-r border-zinc-200">
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-black text-black uppercase tracking-tight text-xs">{customerName}</span>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{city}</span>
                          <span className="text-[9px] text-[#991b1b] font-black tracking-tight uppercase mt-0.5">{phone}</span>
                        </div>
                      </td>

                      {/* Items Column */}
                      <td className="p-4 border-r border-zinc-200">
                        <div className="flex flex-col gap-1 max-w-[180px] text-left">
                          {o.items.map((it, idx) => (
                            <span key={idx} className="text-[10px] font-black uppercase text-zinc-800 truncate leading-tight block">
                              [{it.quantity}X] {it.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="p-4 border-r border-zinc-200 text-left">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-black text-black text-xs">৳ {o.finalAmount}</span>
                          <span className="px-1.5 py-0.5 border border-black bg-rose-100 text-[9px] font-black uppercase text-black rounded tracking-wider">
                            {o.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="p-4 border-r border-zinc-200">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2.5 h-2.5 border border-black shrink-0 ${
                            o.status === 'Delivered' 
                              ? 'bg-green-500' 
                              : o.status === 'Pending' 
                                ? 'bg-amber-400' 
                                : 'bg-blue-500'
                          }`}></span>
                          <span className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">
                            {o.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="p-4 pr-6 text-center">
                        <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                          {/* Dropdown status update */}
                          <select
                            value={o.status}
                            onChange={e => handleStatusChangeInline(o.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-[10px] font-black border-2 border-black rounded-lg bg-white text-black focus:outline-none focus:ring-0 cursor-pointer"
                          >
                            <option value="Pending">⏳ PENDING</option>
                            <option value="Processing">⚙️ PROCESSING</option>
                            <option value="Shipped">🚚 SHIPPED</option>
                            <option value="Out for Delivery">🏡 OUT FOR DELIVERY</option>
                            <option value="Delivered">✅ DELIVERED</option>
                            <option value="Cancelled">❌ CANCELLED</option>
                            <option value="Refunded">💰 REFUNDED</option>
                          </select>

                          {/* Action Button Strip */}
                          <div className="flex items-center gap-1">
                            {/* View details */}
                            <button
                              title="View Details"
                              onClick={() => {
                                setSelectedOrder(o);
                                setUpdateStatus(o.status);
                                setUpdatePaymentStatus(o.paymentStatus);
                              }}
                              className="flex-1 p-1.5 bg-white border-2 border-black rounded-lg hover:bg-zinc-50 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                            </button>

                            {/* Print invoice */}
                            <button
                              title="Print Invoice"
                              onClick={() => {
                                setSelectedOrder(o);
                                setTimeout(() => window.print(), 100);
                              }}
                              className="flex-1 p-1.5 bg-white border-2 border-black rounded-lg hover:bg-zinc-50 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-zinc-700 stroke-[2.5]" />
                            </button>

                            {/* Delete order */}
                            <button
                              title="Delete Order"
                              onClick={() => handleDeleteOrder(o.id)}
                              className="flex-1 p-1.5 bg-[#991b1b] hover:bg-red-800 border-2 border-black rounded-lg text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Quick Confirm Button */}
                          {o.status === 'Pending' && (
                            <button
                              onClick={() => handleQuickConfirm(o.id)}
                              className="w-full py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[9px] uppercase tracking-wide border-2 border-black rounded-lg cursor-pointer transition-all active:translate-y-0.5"
                            >
                              CONFIRM ORDER
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400 font-black uppercase text-xs">No matching orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Inspector Panel */}
        {selectedOrder && (
          <div className="flex flex-col gap-6 bg-white border-[3px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] animate-fadeIn select-none text-xs text-black">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Inspection Mode</span>
                <span className="text-sm font-black text-black font-mono uppercase">#{selectedOrder.id}</span>
              </div>
              <button
                id="close-order-inspection"
                onClick={() => setSelectedOrder(null)}
                className="p-2 border-2 border-black bg-rose-100 hover:bg-rose-200 text-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Print & status update controls */}
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 border-b-2 border-black pb-4">
              <span className="font-black text-black text-[10px] uppercase tracking-wider">Update Lifecycle Pipeline</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-black uppercase font-black">Order Status</label>
                  <select
                    id="update-order-status"
                    value={updateStatus}
                    onChange={e => setUpdateStatus(e.target.value)}
                    className="px-2 py-1.5 border-2 border-black rounded-xl bg-white text-xs font-black text-black focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-black uppercase font-black">Payment Status</label>
                  <select
                    id="update-payment-status"
                    value={updatePaymentStatus}
                    onChange={e => setUpdatePaymentStatus(e.target.value)}
                    className="px-2 py-1.5 border-2 border-black rounded-xl bg-white text-xs font-black text-black focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  >
                    <option value="pending">Pending</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-black uppercase font-black">Audit Tracking Note</label>
                <input
                  id="order-tracking-notes"
                  type="text"
                  value={trackingNotes}
                  onChange={e => setTrackingNotes(e.target.value)}
                  className="px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  placeholder="e.g. Courier Pathao assigned. Tracking #90231"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="submit-order-update"
                  type="submit"
                  className="flex-1 py-2.5 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl cursor-pointer text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Apply Status
                </button>
                <button
                  id="print-invoice-btn"
                  type="button"
                  onClick={printInvoice}
                  className="px-3 py-2.5 bg-white border-2 border-black text-black hover:bg-zinc-100 rounded-xl font-black cursor-pointer text-xs uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Invoice Slip
                </button>
              </div>
            </form>

            {/* Customer Details info block */}
            <div className="flex flex-col gap-2.5 border-b-2 border-black pb-4">
              <span className="font-black text-black text-[10px] uppercase tracking-wider">Shipping Address</span>
              <div className="p-3 bg-[#fcfaf6] border-2 border-black rounded-2xl leading-relaxed text-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <p className="font-black text-black uppercase">{selectedOrder.guestInfo?.fullName || selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.streetAddress}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
                <p className="mt-1.5 font-black text-[#991b1b]">Phone: {selectedOrder.guestInfo?.phone || selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Cart Items Summary */}
            <div className="flex flex-col gap-2 border-b-2 border-black pb-4">
              <span className="font-black text-black text-[10px] uppercase tracking-wider">Cart items list</span>
              <div className="flex flex-col gap-2.5 max-h-44 overflow-y-auto pr-1">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex gap-2.5 items-center justify-between">
                    <div className="flex gap-2 items-center min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-black bg-zinc-50 shrink-0">
                        <img src={it.image} alt="cart item" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-black uppercase truncate text-[11px]">{it.name}</span>
                        {it.variantSku && (
                          <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{it.variantSku}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-black shrink-0 text-xs">{it.quantity}x ৳ {it.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial ledger summary */}
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-black">
              <div className="flex items-center justify-between">
                <span>Basket Subtotal</span>
                <span className="font-bold">৳ {selectedOrder.totalAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping cost</span>
                <span className="font-bold">+৳ {selectedOrder.shippingCost}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-600 font-black">
                  <span>Coupon discount</span>
                  <span>-৳ {selectedOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-black text-black text-sm border-t-2 border-black pt-1.5 uppercase">
                <span>Invoice Total</span>
                <span>৳ {selectedOrder.finalAmount}</span>
              </div>
            </div>

            {/* Payment Details */}
            {selectedOrder.paymentDetails && (
              <div className="border-t-2 border-black pt-4 flex flex-col gap-1 text-xs">
                <span className="font-black text-black text-[10px] uppercase tracking-wider">Payment Reference</span>
                <p className="text-zinc-600 font-semibold">Gateway: <span className="text-black font-black uppercase">{selectedOrder.paymentMethod}</span></p>
                {selectedOrder.paymentDetails.transactionId && (
                  <p className="text-zinc-600 font-semibold">Txn ID: <span className="text-black font-mono font-black text-[11px]">{selectedOrder.paymentDetails.transactionId}</span></p>
                )}
                {selectedOrder.paymentDetails.paymentSlipUrl && (
                  <div className="mt-1.5">
                    <span className="text-[10px] text-zinc-500 block font-black mb-1 uppercase">Customer Payment Slip Screenshot:</span>
                    <a 
                      href={selectedOrder.paymentDetails.paymentSlipUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-block px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-black border-2 border-black rounded-lg font-black uppercase text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      Open Slip Snapshot Link
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Customer Records Tab
const CustomersTab: React.FC = () => {
  const { token, showToast } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: User) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocked: !user.blocked })
      });
      if (res.ok) {
        showToast(user.blocked ? `Unblocked user ${user.email}.` : `Blocked user ${user.email}!`, 'success');
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] animate-fadeIn text-black font-sans">
      <div className="p-6 border-b-2 border-black flex items-center justify-between select-none bg-zinc-100">
        <h3 className="text-sm font-black text-black uppercase tracking-tight">SYSTEM REGISTERED CUSTOMERS / রেজিস্টার্ড গ্রাহকবৃন্দ</h3>
        <span className="px-2.5 py-1 border border-black bg-amber-400 text-black font-black uppercase text-[10px] rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]">
          Total accounts: {users.length}
        </span>
      </div>
      {loading ? (
        <div className="p-12 text-center text-sm font-black"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-black" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse select-none">
            <thead>
              <tr className="bg-zinc-100 border-b-2 border-black text-black font-black uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Profile Details</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">Account status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-semibold text-black bg-white">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#fcfaf6] transition-colors">
                  <td className="p-4 pl-6 flex flex-col gap-0.5">
                    <span className="font-black text-black uppercase">{u.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                  </td>
                  <td className="p-4 text-black font-mono font-bold">{u.phone || 'N/A'}</td>
                  <td className="p-4">
                    <span className="uppercase text-[10px] font-black tracking-wider text-black bg-amber-200 border border-black px-2 py-1 rounded-lg">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                      u.blocked 
                        ? 'bg-rose-100 text-rose-800 animate-pulse' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      id={`block-unblock-${u.id}`}
                      onClick={() => handleToggleBlock(u)}
                      className={`px-3 py-1.5 border-2 border-black rounded-xl font-black uppercase tracking-wider text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                        u.blocked 
                          ? 'bg-emerald-300 hover:bg-emerald-400 text-black' 
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                      }`}
                    >
                      {u.blocked ? 'Unblock user' : 'Block / Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 6. Payment Settings Manager Tab
const PaymentsTab: React.FC = () => {
  const { token, showToast, refreshSettings } = useApp();
  const [gateways, setGateways] = useState<any>(null);

  const loadSettings = () => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setGateways(data.paymentGateways);
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const updatedGateways = { ...gateways };
      updatedGateways[id].enabled = !currentEnabled;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentGateways: updatedGateways })
      });
      if (res.ok) {
        showToast('Payment gateway toggle successful.', 'success');
        refreshSettings();
        loadSettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent, gId: string, keys: any, instructions: string) => {
    e.preventDefault();
    try {
      const updatedGateways = { ...gateways };
      updatedGateways[gId].apiKeys = keys;
      updatedGateways[gId].instructions = instructions;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentGateways: updatedGateways })
      });
      if (res.ok) {
        showToast('Payment credentials and directions updated.', 'success');
        refreshSettings();
        loadSettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!gateways) return <div className="p-6 text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Loading configs...</div>;

  return (
    <div className="flex flex-col gap-8 animate-fadeIn text-xs">
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl leading-relaxed text-amber-900 shadow-inner flex flex-col gap-1.5">
        <span className="font-extrabold text-xs uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
          <span>Payment Gateway Infrastructure Management</span>
        </span>
        <p className="font-light">
          Configure secure keys, public client references, bKash/Nagad merchant instructions, and easily disable gateways instantly for customer safety checkout filters. Inputs with <span className="font-mono">●●●●●●●●</span> indicate encrypted state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {Object.keys(gateways).map(k => {
          const g = gateways[k];
          return (
            <div key={g.id} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-mono">Gateway Reference ID: {g.id}</span>
                  <span className="font-bold text-sm text-zinc-900">{g.name}</span>
                </div>

                <button
                  id={`gateway-toggle-${g.id}`}
                  onClick={() => handleToggle(g.id, g.enabled)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                    g.enabled 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {g.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Secure edit credentials form */}
              <form onSubmit={(e) => handleSaveKeys(e, g.id, g.apiKeys, g.instructions || '')} className="flex flex-col gap-3">
                {Object.keys(g.apiKeys).map((keyName) => (
                  <div key={keyName} className="flex flex-col gap-1">
                    <label className="font-bold text-zinc-500 uppercase text-[9px]">{keyName.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      id={`gateway-key-${g.id}-${keyName}`}
                      type="text"
                      value={g.apiKeys[keyName]}
                      onChange={e => {
                        const updated = { ...gateways };
                        updated[g.id].apiKeys[keyName] = e.target.value;
                        setGateways(updated);
                      }}
                      className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs"
                      placeholder="Enter credential string"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1 mt-1">
                  <label className="font-bold text-zinc-500 uppercase text-[9px]">Custom Manual Instructions (at checkout)</label>
                  <textarea
                    id={`gateway-instructions-${g.id}`}
                    rows={2}
                    value={g.instructions || ''}
                    onChange={e => {
                      const updated = { ...gateways };
                      updated[g.id].instructions = e.target.value;
                      setGateways(updated);
                    }}
                    className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-light"
                    placeholder="Provide bKash Agent details, payment slips uploading rules, etc."
                  />
                </div>

                <button
                  id={`save-gateway-settings-${g.id}`}
                  type="submit"
                  className="mt-2 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer text-[10px] uppercase"
                >
                  Commit gateway details
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 7. Marketing, Coupons, Sliders Tab
const MarketingTab: React.FC<{ hideSliders?: boolean; hideCoupons?: boolean }> = ({ hideSliders = false, hideCoupons = false }) => {
  const { token, showToast } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [slides, setSlides] = useState<SliderSlide[]>([]);
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: '', buttonText: 'Shop now', buttonLink: '/shop' });
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: 10, minPurchase: 50, expiryDate: '2026-12-31', usageLimit: 100 });

  const loadAll = () => {
    fetch('/api/coupons', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setCoupons(data));
    fetch('/api/slides').then(res => res.json()).then(data => setSlides(data));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSlide)
      });
      if (res.ok) {
        showToast('Created home slider item.', 'success');
        setNewSlide({ title: '', subtitle: '', image: '', buttonText: 'Shop now', buttonLink: '/shop' });
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        showToast('Discount Coupon activated.', 'success');
        setNewCoupon({ code: '', type: 'percentage', value: 10, minPurchase: 50, expiryDate: '2026-12-31', usageLimit: 100 });
        loadAll();
      } else {
        const d = await res.json();
        showToast(d.message || 'Error creating coupon', 'error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    try {
      const res = await fetch(`/api/slides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Deleted slide banner.', 'success');
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Deleted Coupon code.', 'success');
        loadAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${(!hideSliders && !hideCoupons) ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8 animate-fadeIn text-xs select-none text-black font-sans`}>
      {/* Promo banner sliders */}
      {!hideSliders && (
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <h3 className="text-sm font-black text-black uppercase tracking-tight">ADD HOME SLIDER BANNER / স্লাইডার ব্যানার</h3>
            <form onSubmit={handleAddSlide} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-black text-black uppercase text-[10px]">Title / Heading</label>
                <input
                  id="new-slide-title"
                  type="text"
                  value={newSlide.title}
                  onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  placeholder="The Future of Style"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-black text-black uppercase text-[10px]">Subtitle Description</label>
                <input
                  id="new-slide-sub"
                  type="text"
                  value={newSlide.subtitle}
                  onChange={e => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                  className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  placeholder="Modern summer streetwear"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-black uppercase text-[10px]">Banner Image / ব্যানার ইমেজ</label>
                {newSlide.image ? (
                  <div className="flex gap-3 items-center bg-[#fcfaf6] p-3 border-2 border-black rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="w-16 h-12 rounded-xl border-2 border-black bg-white overflow-hidden shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      <img src={newSlide.image} alt="Slide Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <label
                        htmlFor="new-slide-file-input"
                        className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-black border border-black rounded-lg text-[10px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer inline-block text-center"
                      >
                        Change / পরিবর্তন করুন
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewSlide({ ...newSlide, image: '' })}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 border border-black rounded-lg text-[10px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer inline-block text-center"
                      >
                        Remove / মুছুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="new-slide-file-input"
                    className="h-20 border-2 border-dashed border-black rounded-xl bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center cursor-pointer gap-1 transition-colors select-none"
                  >
                    <UploadCloud className="w-5 h-5 text-black shrink-0" />
                    <span className="text-[10px] font-black text-black uppercase tracking-tight">CHOOSE BANNER IMAGE / ব্যানার সিলেক্ট করুন</span>
                  </label>
                )}
                <input
                  id="new-slide-file-input"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewSlide({ ...newSlide, image: reader.result as string });
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Button text</label>
                  <input
                    id="new-slide-btn"
                    type="text"
                    value={newSlide.buttonText}
                    onChange={e => setNewSlide({ ...newSlide, buttonText: e.target.value })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Button Action link</label>
                  <input
                    id="new-slide-link"
                    type="text"
                    value={newSlide.buttonLink}
                    onChange={e => setNewSlide({ ...newSlide, buttonLink: e.target.value })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  />
                </div>
              </div>
              <button
                id="submit-new-slide"
                type="submit"
                className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              >
                LAUNCH SLIDER ITEM / স্লাইডার যোগ করুন
              </button>
            </form>
          </div>

          {/* Current Slides list */}
          <div className="bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4 p-6">
            <h3 className="text-sm font-black text-black uppercase tracking-tight">ACTIVE BANNERS / স্লাইডারসমূহ</h3>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {slides.map(s => (
                <div key={s.id} className="p-3 bg-[#fcfaf6] border-2 border-black rounded-2xl flex gap-3 items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border-2 border-black bg-white shrink-0">
                    <img src={s.image} alt="slide preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-black text-black uppercase truncate text-xs">{s.title}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{s.subtitle}</span>
                  </div>
                  <button
                    id={`delete-slide-${s.id}`}
                    onClick={() => handleDeleteSlide(s.id)}
                    className="p-2 border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons/Discount Codes management */}
      {!hideCoupons && (
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <h3 className="text-sm font-black text-black uppercase tracking-tight">CREATE COUPON CODE / কুপন তৈরি করুন</h3>
            <form onSubmit={handleAddCoupon} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Promo Code</label>
                  <input
                    id="new-coupon-code"
                    type="text"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b] uppercase"
                    placeholder="e.g. FLASH30"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Type</label>
                  <select
                    id="new-coupon-type"
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Reduction Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Reduction Value</label>
                  <input
                    id="new-coupon-val"
                    type="number"
                    value={newCoupon.value}
                    onChange={e => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Min Basket Order ($)</label>
                  <input
                    id="new-coupon-min"
                    type="number"
                    value={newCoupon.minPurchase}
                    onChange={e => setNewCoupon({ ...newCoupon, minPurchase: parseFloat(e.target.value) || 0 })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Expiry Date</label>
                  <input
                    id="new-coupon-expiry"
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black text-black uppercase text-[10px]">Total Usage limits</label>
                  <input
                    id="new-coupon-limit"
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={e => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 100 })}
                    className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                    required
                  />
                </div>
              </div>
              <button
                id="submit-new-coupon"
                type="submit"
                className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              >
                DEPLOY PROMO COUPON / কুপন যোগ করুন
              </button>
            </form>
          </div>

          {/* Coupons listing */}
          <div className="bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4 p-6">
            <h3 className="text-sm font-black text-black uppercase tracking-tight">ACTIVE PROMO COUPONS / কুপনসমূহ</h3>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {coupons.map(c => (
                <div key={c.id} className="p-3 bg-[#fcfaf6] border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-black text-[#991b1b] uppercase text-xs tracking-wider">{c.code}</span>
                    <span className="text-[10px] text-black font-black">
                      Value: {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} • Min Basket: ${c.minPurchase}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">Used: {c.usageCount} / {c.usageLimit} • Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <button
                    id={`delete-coupon-${c.id}`}
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-2 border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 8. Reviews moderation Tab
const ReviewsTab: React.FC = () => {
  const { token, showToast } = useApp();
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadReviews = () => {
    fetch('/api/reviews', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isApproved })
      });
      if (res.ok) {
        showToast('Review approved / hidden.', 'success');
        loadReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        showToast('Reply saved.', 'success');
        setReplyText('');
        setActiveReplyId(null);
        loadReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deleteReview: true })
      });
      if (res.ok) {
        showToast('Review permanently deleted.', 'success');
        loadReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm animate-fadeIn text-xs">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between select-none">
        <h3 className="text-sm font-bold text-zinc-950">Customer Reviews & Moderation Hub</h3>
        <span className="text-xs text-zinc-400">Awaiting audits: {reviews.filter(r => !r.isApproved).length}</span>
      </div>

      <div className="divide-y divide-zinc-100">
        {reviews.map(r => (
          <div key={r.id} className="p-6 flex flex-col gap-3 hover:bg-zinc-50/50 select-none">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-zinc-800">{r.userName} <span className="text-zinc-400 font-light text-[10px]">({r.userEmail})</span></span>
                <span className="text-[10px] text-zinc-500 font-medium">Product: <span className="text-indigo-600 font-semibold">{r.productName}</span></span>
              </div>
              <span className="text-xs font-bold text-amber-500">★ {r.rating} / 5</span>
            </div>

            <p className="text-zinc-600 bg-white p-3 border border-zinc-200/50 rounded-xl leading-relaxed text-[11px] font-light">
              "{r.comment}"
            </p>

            {r.reply && (
              <div className="ml-6 p-3 bg-indigo-50/30 border-l-2 border-indigo-500 rounded-r-xl text-[11px] font-light text-indigo-950">
                <span className="font-bold block mb-0.5 text-indigo-900 text-[10px] uppercase">Staff Response:</span>
                "{r.reply}"
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <button
                id={`approve-review-${r.id}`}
                onClick={() => handleModerate(r.id, !r.isApproved)}
                className={`px-3 py-1.5 border rounded-xl font-bold transition-all cursor-pointer ${
                  r.isApproved 
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' 
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {r.isApproved ? 'Hide Review' : 'Approve Review'}
              </button>

              <button
                id={`open-reply-box-${r.id}`}
                onClick={() => {
                  setActiveReplyId(r.id);
                  setReplyText(r.reply || '');
                }}
                className="px-3 py-1.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold rounded-xl cursor-pointer"
              >
                Reply
              </button>

              <button
                id={`delete-review-${r.id}`}
                onClick={() => handleDelete(r.id)}
                className="p-1.5 border border-zinc-200 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeReplyId === r.id && (
              <div className="mt-2.5 flex flex-col gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl animate-fadeIn">
                <span className="font-bold text-zinc-700 text-[10px] uppercase">Draft Staff Response</span>
                <textarea
                  id={`reply-textarea-${r.id}`}
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="px-3 py-1.5 border border-zinc-200 rounded-lg bg-white"
                  placeholder="Thank you so much John! We strive to make premium accessories."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    id="cancel-reply"
                    onClick={() => setActiveReplyId(null)}
                    className="px-3 py-1 border border-zinc-200 text-zinc-700 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-reply"
                    onClick={() => handleReply(r.id)}
                    className="px-4 py-1 bg-indigo-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Save Response
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <div className="p-8 text-center text-zinc-400">No client reviews logged.</div>}
      </div>
    </div>
  );
};

// 9. Shipping Zones manager Tab
const ShippingTab: React.FC = () => {
  const { token, showToast } = useApp();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [newZone, setNewZone] = useState({ name: '', cost: 10, freeShippingThreshold: 150 });

  const loadZones = () => {
    fetch('/api/shipping/zones').then(res => res.json()).then(data => setZones(data));
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shipping/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newZone)
      });
      if (res.ok) {
        showToast('Created shipping zone.', 'success');
        setNewZone({ name: '', cost: 10, freeShippingThreshold: 150 });
        loadZones();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping/zones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Deleted shipping zone.', 'success');
        loadZones();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn text-xs select-none text-black font-sans">
      {/* Creation form */}
      <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-4 max-h-fit">
        <h3 className="text-sm font-black text-black uppercase tracking-tight">ADD SHIPPING ZONE / নতুন কুরিয়ার জোন</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-black text-black uppercase text-[10px]">Zone Title</label>
            <input
              id="new-zone-name"
              type="text"
              value={newZone.name}
              onChange={e => setNewZone({ ...newZone, name: e.target.value })}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              placeholder="e.g. Dhaka Division"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-black text-black uppercase text-[10px]">Shipping Cost ($)</label>
            <input
              id="new-zone-cost"
              type="number"
              value={newZone.cost}
              onChange={e => setNewZone({ ...newZone, cost: parseFloat(e.target.value) || 0 })}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-black text-black uppercase text-[10px]">Free Shipping above ($)</label>
            <input
              id="new-zone-threshold"
              type="number"
              value={newZone.freeShippingThreshold}
              onChange={e => setNewZone({ ...newZone, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
          <button
            id="submit-new-zone"
            type="submit"
            className="w-full py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
          >
            DEPLOY COURIER ZONE / জোন যোগ করুন
          </button>
        </form>
      </div>

      {/* List */}
      <div className="md:col-span-2 bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-[5px_5px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
        <h3 className="text-sm font-black text-black uppercase tracking-tight">COURIER DISPATCH RATES / কুরিয়ার জোন তালিকা</h3>
        <div className="flex flex-col gap-3">
          {zones.map(z => (
            <div key={z.id} className="p-4 bg-[#fcfaf6] border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col gap-0.5">
                <span className="font-black text-black text-sm uppercase">{z.name}</span>
                <span className="text-[10px] font-black text-zinc-600">Flat Rate: ${z.cost} • Free above: ${z.freeShippingThreshold}</span>
              </div>
              <button
                id={`delete-zone-${z.id}`}
                onClick={() => handleDelete(z.id)}
                className="p-2 border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 10. General Site Settings Tab
const SettingsTab: React.FC = () => {
  const { token, siteSettings, showToast, refreshSettings } = useApp();
  const [siteName, setSiteName] = useState('');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [taxRate, setTaxRate] = useState(5);
  const [currency, setCurrency] = useState('USD');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.siteName);
      setLogo(siteSettings.logo);
      setFavicon(siteSettings.favicon || '');
      setContactEmail(siteSettings.contactEmail);
      setContactPhone(siteSettings.contactPhone || '');
      setTaxRate(siteSettings.taxRate);
      setCurrency(siteSettings.currency);
      setPrimaryColor(siteSettings.themeColor?.primary || '#4f46e5');
    }
  }, [siteSettings]);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFavicon(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          siteName,
          logo,
          favicon,
          contactEmail,
          contactPhone,
          taxRate: parseFloat(taxRate as any) || 5,
          currency,
          themeColor: { primary: primaryColor, secondary: '#06b6d4' }
        })
      });
      if (res.ok) {
        showToast('System settings saved successfully.', 'success');
        refreshSettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-white border-[3px] border-black rounded-3xl shadow-[5px_5px_0px_rgba(0,0,0,1)] animate-fadeIn text-xs select-none max-w-2xl text-black font-sans">
      <h3 className="text-sm font-black text-black uppercase tracking-tight mb-4">EDIT SITE CONFIGURATIONS / সেটিংস পরিবর্তন</h3>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Site Name</label>
            <input
              id="settings-sitename"
              type="text"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Site Logo / Image Upload</label>
            <div className="flex gap-2">
              <input
                id="settings-logo"
                type="text"
                value={logo}
                onChange={e => setLogo(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                placeholder="Text logo or Image URL..."
                required
              />
              <button
                type="button"
                onClick={() => document.getElementById('browse-settings-logo')?.click()}
                className="px-4 py-2.5 bg-[#dcdcdc] hover:bg-stone-300 text-black font-black border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                BROWSE
              </button>
              <input
                type="file"
                id="browse-settings-logo"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
            {logo && (logo.startsWith('http') || logo.startsWith('data:image')) && (
              <div className="mt-1 w-14 h-14 rounded-lg border-2 border-black overflow-hidden bg-zinc-100 flex items-center justify-center p-1">
                <img src={logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Site Favicon / Icon Upload</label>
            <div className="flex gap-2">
              <input
                id="settings-favicon"
                type="text"
                value={favicon}
                onChange={e => setFavicon(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
                placeholder="Favicon image URL..."
              />
              <button
                type="button"
                onClick={() => document.getElementById('browse-settings-favicon')?.click()}
                className="px-4 py-2.5 bg-[#dcdcdc] hover:bg-stone-300 text-black font-black border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                BROWSE
              </button>
              <input
                type="file"
                id="browse-settings-favicon"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFaviconUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
            {favicon && (
              <div className="mt-1 w-14 h-14 rounded-lg border-2 border-black overflow-hidden bg-zinc-100 flex items-center justify-center p-1">
                <img src={favicon} alt="Favicon Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Customer Support Email</label>
            <input
              id="settings-email"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Customer Support Phone</label>
            <input
              id="settings-phone"
              type="text"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">State VAT Tax (%)</label>
            <input
              id="settings-tax"
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Default Currency Symbol</label>
            <input
              id="settings-currency"
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black bg-white focus:outline-none focus:ring-0 focus:border-[#991b1b]"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-black text-black uppercase text-[10px]">Branding Theme Color</label>
            <div className="flex gap-2 items-center mt-0.5">
              <input
                id="settings-color-picker"
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl border-2 border-black cursor-pointer bg-white"
              />
              <span className="font-mono text-[10px] text-zinc-600 font-bold uppercase">{primaryColor}</span>
            </div>
          </div>
        </div>

        <button
          id="submit-general-settings"
          type="submit"
          className="mt-3 py-3 bg-[#991b1b] hover:bg-red-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          SAVE CONFIGURATION / সংরক্ষণ করুন
        </button>
      </form>
    </div>
  );
};

// 12. Live Notices / Announcement Tab
const NoticesTab: React.FC = () => {
  const { 
    noticeText, noticeEnabled, setNoticeText, setNoticeEnabled, 
    announcementText, announcementEnabled, setAnnouncementText, setAnnouncementEnabled, 
    showToast 
  } = useApp();

  const [tempNoticeText, setTempNoticeText] = useState(noticeText);
  const [tempNoticeEnabled, setTempNoticeEnabled] = useState(noticeEnabled);

  const [tempAnnounceText, setTempAnnounceText] = useState(announcementText);
  const [tempAnnounceEnabled, setTempAnnounceEnabled] = useState(announcementEnabled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeText(tempNoticeText);
    setNoticeEnabled(tempNoticeEnabled);
    setAnnouncementText(tempAnnounceText);
    setAnnouncementEnabled(tempAnnounceEnabled);
    showToast('Notices & Announcements saved successfully! (লাইভ নোটিশ ও ব্যানার সফলভাবে সংরক্ষণ করা হয়েছে!)', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn select-none font-sans text-xs">
      
      {/* Container Box */}
      <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-[#fafaf9]">
        
        {/* Header Bar */}
        <div className="bg-[#B31312] text-white px-6 py-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-white" />
            <h2 className="text-xs md:text-sm font-black tracking-wider uppercase">
              LIVE NOTICE BOARD CONFIGURATION (লাইভ নোটিশ বোর্ড কনফিগারেশন)
            </h2>
          </div>
          <span className="bg-[#940f0f] border border-red-500 text-white text-[9px] font-black px-2 py-1 rounded flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SYSTEM LIVE
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Description Text */}
          <p className="text-zinc-600 font-bold text-xs leading-relaxed border-b border-zinc-200 pb-4">
            এখান থেকে আপনি ওয়েবসাইটের হোম পেজে স্লাইডিং বা ব্যানার নোটিশগুলো সরাসরি চালু বা বন্ধ এবং পরিবর্তন করতে পারবেন। নোটিশ পরিবর্তন করে নিচে SAVE LIVE NOTICES বাটনে ক্লিক করুন।
          </p>

          {/* Live Marquee Preview Area */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-sm">🔴</span>
              <h3 className="font-black text-black uppercase text-xs tracking-wider">
                LIVE MARQUEE PREVIEW (লাইভ স্ক্রলিং প্রিভিউ):
              </h3>
            </div>

            {/* Top Preview */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 border border-zinc-300 rounded font-bold">
                  TOP PREVIEW (উপরের লাইভ নোটিশ)
                </span>
              </div>
              
              <div className="w-full bg-[#0f766e] text-white select-none overflow-hidden border-2 border-black rounded-xl py-2 px-4 flex items-center gap-3">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0 font-sans tracking-wider">
                  NOTICE
                </span>
                <div className="flex-1 overflow-hidden text-xs font-bold font-sans">
                  {tempNoticeEnabled ? (
                    <marquee scrollamount="4" className="pt-0.5">{tempNoticeText || "🔥 FLASH SALE! Get up to 15% instant discount on premium AI Subscriptions!"}</marquee>
                  ) : (
                    <span className="text-zinc-100/50 italic font-medium">[ Top Scrolling Notice is currently DISABLED ]</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Preview */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded font-bold">
                  BOTTOM PREVIEW (নিচের লাইভ নোটিশ)
                </span>
              </div>

              <div className="w-full bg-[#fef08a] text-black select-none overflow-hidden border-2 border-black rounded-xl py-2 px-4 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="bg-[#d97706] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0 font-sans tracking-wider">
                  ANNOUNCEMENT
                </span>
                <div className="flex-1 overflow-hidden text-xs font-black text-black font-sans">
                  {tempAnnounceEnabled ? (
                    <marquee scrollamount="4" className="pt-0.5 text-zinc-950">{tempAnnounceText || "📢 ঢাকা সিটির ভিতরে ডেলিভারি চার্জ মাত্র ৫০ টাকা! ৮০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি!"}</marquee>
                  ) : (
                    <span className="text-zinc-500 italic font-medium">[ Bottom Announcement Banner is currently DISABLED ]</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            {/* 2-Column Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Keynote Slider Top Notice */}
              <div className="border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white">
                <div className="bg-[#B31312] text-white px-4 py-3 flex items-center justify-between border-b-2 border-black">
                  <span className="font-black uppercase text-[10px] tracking-wider text-white">
                    1. KEYNOTE SLIDER TOP NOTICE (ব্যানার নোটিশ - উপরে)
                  </span>
                </div>
                
                <div className="p-4 flex flex-col gap-4">
                  
                  {/* Status toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
                    <span className="font-black text-zinc-800 text-[10px] uppercase">
                      STATUS (অবস্থা) :
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${tempNoticeEnabled ? 'text-[#B31312]' : 'text-zinc-400'}`}>
                        {tempNoticeEnabled ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          id="notice-enabled-toggle"
                          type="checkbox"
                          checked={tempNoticeEnabled}
                          onChange={(e) => setTempNoticeEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-black text-zinc-700 uppercase text-[10px]">
                      NOTICE TEXT (নোটিশ টেক্সট) : *
                    </label>
                    <textarea
                      id="notice-text-input"
                      value={tempNoticeText}
                      onChange={(e) => setTempNoticeText(e.target.value)}
                      className="px-3 py-2.5 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:border-[#B31312] bg-white min-h-[100px] font-bold text-xs text-black"
                      placeholder="Enter top notice..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Slider Bottom Notice */}
              <div className="border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white">
                <div className="bg-[#B31312] text-white px-4 py-3 flex items-center justify-between border-b-2 border-black">
                  <span className="font-black uppercase text-[10px] tracking-wider text-white">
                    2. SLIDER BOTTOM NOTICE (ব্যানার নোটিশ - নিচে)
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-4">
                  
                  {/* Status toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
                    <span className="font-black text-zinc-800 text-[10px] uppercase">
                      STATUS (অবস্থা) :
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${tempAnnounceEnabled ? 'text-[#B31312]' : 'text-zinc-400'}`}>
                        {tempAnnounceEnabled ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          id="announcement-enabled-toggle"
                          type="checkbox"
                          checked={tempAnnounceEnabled}
                          onChange={(e) => setTempAnnounceEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-black text-zinc-700 uppercase text-[10px]">
                      NOTICE TEXT (নোটিশ টেক্সট) : *
                    </label>
                    <textarea
                      id="announcement-text-input"
                      value={tempAnnounceText}
                      onChange={(e) => setTempAnnounceText(e.target.value)}
                      className="px-3 py-2.5 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:border-[#B31312] bg-white min-h-[100px] font-bold text-xs text-black"
                      placeholder="Enter bottom notice..."
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Big Action Button */}
            <button
              id="save-notice-btn"
              type="submit"
              className="mt-4 w-full md:w-auto self-start px-8 py-3.5 border-2 border-black rounded-2xl bg-[#B31312] hover:bg-[#940f0f] text-white font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              SAVE LIVE NOTICES (লাইভ নোটিশ সংরক্ষণ করুন)
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

// 11. Audit logs tab
const LogsTab: React.FC = () => {
  const { token } = useApp();
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);

  useEffect(() => {
    fetch('/api/settings/logs', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between select-none">
        <h3 className="text-sm font-bold text-zinc-950 font-sans">Backoffice System Security Audit Trails</h3>
        <span className="text-xs text-zinc-400">Recorded action hashes: {logs.length}</span>
      </div>
      <div className="divide-y divide-zinc-100">
        {logs.map(log => (
          <div key={log.id} className="p-4 flex gap-4 select-none hover:bg-zinc-50/50">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border flex items-center justify-center shrink-0 text-zinc-500">
              <ActivityIcon action={log.action} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="font-extrabold text-zinc-800">{log.action}</span>
                <span className="text-[10px] text-zinc-400 font-light">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-zinc-600 font-light leading-relaxed">{log.details}</p>
              <span className="text-[10px] text-zinc-400">Responsible user ID: <span className="text-zinc-500 font-bold font-mono">{log.adminName} ({log.adminId})</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityIcon: React.FC<{ action: string }> = ({ action }) => {
  if (action.includes('Seeded')) return <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />;
  if (action.includes('Created')) return <Plus className="w-4 h-4 text-indigo-600" />;
  if (action.includes('Deleted')) return <Trash2 className="w-4 h-4 text-rose-600" />;
  return <Edit2 className="w-4 h-4 text-amber-600" />;
};
