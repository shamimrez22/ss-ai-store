import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Category, SiteSettings, ShippingZone, Order, Address, Coupon, ProductVariant } from '../types';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  wishlist: Product[];
  categories: Category[];
  shippingZones: ShippingZone[];
  siteSettings: SiteSettings | null;
  toasts: ToastMessage[];
  loadingSettings: boolean;
  coupon: { code: string; type: 'percentage' | 'fixed'; value: number } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; addresses?: Address[]; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message?: string }>;
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  updateCartQuantity: (sku: string, qty: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  noticeText: string;
  noticeEnabled: boolean;
  setNoticeText: (text: string) => void;
  setNoticeEnabled: (enabled: boolean) => void;
  announcementText: string;
  announcementEnabled: boolean;
  setAnnouncementText: (text: string) => void;
  setAnnouncementEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_token'));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [coupon, setCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);

  const [noticeText, setNoticeTextState] = useState<string>(
    localStorage.getItem('bazar_notice_text') || 
    '🔥 FLASH SALE! Get up to 15% instant discount on premium products! Use coupon code: AURA10 at checkout!'
  );
  const [noticeEnabled, setNoticeEnabledState] = useState<boolean>(
    localStorage.getItem('bazar_notice_enabled') !== 'false'
  );

  const setNoticeText = (text: string) => {
    localStorage.setItem('bazar_notice_text', text);
    setNoticeTextState(text);
  };

  const setNoticeEnabled = (enabled: boolean) => {
    localStorage.setItem('bazar_notice_enabled', enabled ? 'true' : 'false');
    setNoticeEnabledState(enabled);
  };

  const [announcementText, setAnnouncementTextState] = useState<string>(
    localStorage.getItem('bazar_announcement_text') || 
    '📢 বাজার থোলে - বাংলাদেশের এক নম্বর ও বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম! সেরা দামে প্রিমিয়াম প্রোডাক্ট ও লাইফস্টাইল গেজেটস কিনুন সহজেই!'
  );
  const [announcementEnabled, setAnnouncementEnabledState] = useState<boolean>(
    localStorage.getItem('bazar_announcement_enabled') !== 'false'
  );

  const setAnnouncementText = (text: string) => {
    localStorage.setItem('bazar_announcement_text', text);
    setAnnouncementTextState(text);
  };

  const setAnnouncementEnabled = (enabled: boolean) => {
    localStorage.setItem('bazar_announcement_enabled', enabled ? 'true' : 'false');
    setAnnouncementEnabledState(enabled);
  };

  // Initialize Cart and Wishlist from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('aura_cart');
    const savedWishlist = localStorage.getItem('aura_wishlist');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save Cart and Wishlist on change
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Dynamically update document title and favicon from siteSettings
  useEffect(() => {
    if (siteSettings) {
      if (siteSettings.siteName) {
        document.title = siteSettings.siteName;
      }
      if (siteSettings.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = siteSettings.favicon;
      }
    }
  }, [siteSettings]);

  // Fetch initial system settings and categories
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings', e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  };

  const fetchShippingZones = async () => {
    try {
      const res = await fetch('/api/shipping/zones');
      if (res.ok) {
        const data = await res.json();
        setShippingZones(data);
      }
    } catch (e) {
      console.error('Error fetching shipping zones', e);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshCategories();
    fetchShippingZones();
  }, []);

  // Sync profile details if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Token stale');
        })
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('aura_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  // Toast notifications manager
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed.' };
      }
      localStorage.setItem('aura_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const registerUser = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Registration failed.' };
      }
      localStorage.setItem('aura_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Registration successful! Welcome, ${data.user.name}.`, 'success');
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    setToken(null);
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const updateProfile = async (data: any) => {
    if (!token) return { success: false, message: 'Not logged in.' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.message || 'Update failed.' };
      }
      setUser(resData.user);
      showToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed.' };
    }
  };

  // Cart Operations
  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.variant.sku === variant.sku);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > variant.stock) {
          showToast(`Cannot add. Limit exceeded! Only ${variant.stock} available.`, 'error');
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        showToast(`Updated ${product.name} quantity in cart!`, 'success');
        return updated;
      } else {
        if (quantity > variant.stock) {
          showToast(`Cannot add. Only ${variant.stock} available.`, 'error');
          return prev;
        }
        showToast(`${product.name} added to cart!`, 'success');
        return [...prev, { product, variant, quantity }];
      }
    });
  };

  const updateCartQuantity = (sku: string, qty: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.variant.sku === sku);
      if (idx === -1) return prev;
      if (qty <= 0) {
        return prev.filter(item => item.variant.sku !== sku);
      }
      if (qty > prev[idx].variant.stock) {
        showToast(`Stock limit reached! Max available is ${prev[idx].variant.stock}.`, 'error');
        return prev;
      }
      const updated = [...prev];
      updated[idx].quantity = qty;
      return updated;
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.variant.sku !== sku));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Wishlist Operations
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isFav = prev.some(p => p.id === product.id);
      if (isFav) {
        showToast(`${product.name} removed from wishlist.`, 'info');
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(`${product.name} added to wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  // Coupon Application
  const applyCouponCode = async (code: string) => {
    const totalBeforeDiscount = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: totalBeforeDiscount })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Invalid coupon.' };
      }
      setCoupon({
        code: data.coupon.code,
        type: data.coupon.type,
        value: data.coupon.value
      });
      showToast(`Coupon "${data.coupon.code}" applied successfully!`, 'success');
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Failed to process coupon.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  return (
    <AppContext.Provider value={{
      user, token, cart, wishlist, categories, shippingZones, siteSettings, toasts, loadingSettings, coupon,
      showToast, removeToast, login, registerUser, logout, updateProfile,
      addToCart, updateCartQuantity, removeFromCart, clearCart, toggleWishlist, applyCouponCode, removeCoupon,
      refreshSettings, refreshCategories,
      noticeText, noticeEnabled, setNoticeText, setNoticeEnabled,
      announcementText, announcementEnabled, setAnnouncementText, setAnnouncementEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
