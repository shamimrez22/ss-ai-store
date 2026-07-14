/**
 * Shared Type Definitions for the E-Commerce Platform
 */

export type UserRole = 'customer' | 'admin' | 'staff' | 'moderator';

export interface Address {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  phone?: string;
  addresses?: Address[];
  blocked?: boolean;
  createdAt: string;
}

export interface ProductVariant {
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  reply?: string;
  isApproved: boolean;
  photos?: string[];
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  subcategory?: string;
  unit?: string;
  images: string[];
  variants: ProductVariant[];
  originalPrice: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  rating: number;
  reviews: Review[];
  seo: SEOData;
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  flashSaleEnabled?: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name or emoji
  image?: string;
  isFeatured: boolean;
  order: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface OrderItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface TrackingStep {
  status: string;
  date: string;
  notes: string;
}

export interface Order {
  id: string;
  customerId?: string; // empty for guest checkout
  guestInfo?: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'successful' | 'failed' | 'verified';
  paymentDetails?: {
    transactionId?: string;
    paymentSlipUrl?: string;
    cardLast4?: string;
    paymentInstructions?: string;
    [key: string]: any;
  };
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Refunded';
  orderDate: string;
  trackingTimeline: TrackingStep[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
}

export interface SliderSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKeys: Record<string, string>;
  instructions?: string;
  order: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  cost: number;
  freeShippingThreshold?: number;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  favicon?: string;
  contactEmail: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  themeColor: {
    primary: string;
    secondary: string;
  };
  currency: string;
  taxRate: number; // percentage
  homeSectionsVisibility: {
    heroSlider: boolean;
    categories: boolean;
    featured: boolean;
    newArrivals: boolean;
    bestSellers: boolean;
    flashSale: boolean;
    reviews: boolean;
    newsletter: boolean;
    trustBadges: boolean;
  };
  paymentGateways: Record<string, PaymentGatewayConfig>;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}
