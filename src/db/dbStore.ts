import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, Product, Category, Subcategory, Order, Coupon, 
  SliderSlide, SiteSettings, ShippingZone, AdminActivityLog, Review 
} from '../types';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  orders: Order[];
  coupons: Coupon[];
  sliderSlides: SliderSlide[];
  siteSettings: SiteSettings;
  shippingZones: ShippingZone[];
  activityLogs: AdminActivityLog[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'SS AI Store',
  logo: '✨ SS AI Store',
  contactEmail: 'support@ssai.com',
  contactPhone: '+880 1711-000000',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
  },
  themeColor: {
    primary: '#dc2626', // Red-600
    secondary: '#ea580c', // Orange-600
  },
  currency: 'BDT',
  taxRate: 0,
  homeSectionsVisibility: {
    heroSlider: true,
    categories: true,
    featured: true,
    newArrivals: true,
    bestSellers: true,
    flashSale: true,
    reviews: true,
    newsletter: true,
    trustBadges: true,
  },
  paymentGateways: {
    cod: {
      id: 'cod',
      name: 'Direct/Email Activation (Instant)',
      enabled: true,
      apiKeys: {},
      instructions: 'Receive your subscription details directly in your profile/email instantly.',
      order: 1
    },
    stripe: {
      id: 'stripe',
      name: 'Stripe (Cards)',
      enabled: true,
      apiKeys: { publicKey: 'pk_test_placeholder', secretKey: 'sk_test_placeholder' },
      instructions: 'Pay securely using credit or debit cards via Stripe.',
      order: 2
    },
    paypal: {
      id: 'paypal',
      name: 'PayPal',
      enabled: true,
      apiKeys: { clientId: 'paypal_client_placeholder', clientSecret: 'paypal_secret_placeholder' },
      instructions: 'You will be redirected to PayPal to complete your payment.',
      order: 3
    },
    bkash: {
      id: 'bkash',
      name: 'bKash (Direct/Manual)',
      enabled: true,
      apiKeys: { merchantNumber: '01711000000', apiUsername: 'bkash_user' },
      instructions: 'Send money to our bKash Merchant account: 01711000000. Enter your Transaction ID below.',
      order: 4
    },
    nagad: {
      id: 'nagad',
      name: 'Nagad (Manual)',
      enabled: true,
      apiKeys: { merchantNumber: '01811000000' },
      instructions: 'Send money to our Nagad Merchant account: 01811000000. Enter your Transaction ID below.',
      order: 5
    },
    rocket: {
      id: 'rocket',
      name: 'Rocket (Manual)',
      enabled: true,
      apiKeys: { merchantNumber: '01911000000-1' },
      instructions: 'Send money to our Rocket Merchant account: 01911000000-1. Enter your Transaction ID below.',
      order: 6
    },
    sslcommerz: {
      id: 'sslcommerz',
      name: 'SSLCommerz',
      enabled: true,
      apiKeys: { storeId: 'ssl_store_placeholder', storePassword: 'ssl_pass_placeholder' },
      instructions: 'Pay using bKash, Nagad, Visa, Mastercard, or Bank Transfer via SSLCommerz.',
      order: 7
    },
    bank: {
      id: 'bank',
      name: 'Bank Transfer (Manual)',
      enabled: true,
      apiKeys: { bankName: 'Apex City Bank', accountName: 'SS AI Store LLC', accountNumber: '122-3344-5566-77' },
      instructions: 'Transfer to Apex City Bank, A/C: 122-3344-5566-77. Upload a screenshot of your transfer receipt.',
      order: 8
    }
  }
};

const INITIAL_SLIDES: SliderSlide[] = [
  {
    id: 's1',
    title: 'Premium ChatGPT & Claude Pro',
    subtitle: 'Access GPT-4o, Claude 3.5 Sonnet, and custom models with absolute lowest cost in Bangladesh.',
    image: 'https://images.unsplash.com/photo-1675557009875-436f09780264?q=80&w=1600&auto=format&fit=crop',
    buttonText: 'Shop AI Chat',
    buttonLink: '/shop?category=ai-chat',
    order: 1
  },
  {
    id: 's2',
    title: 'Cursor AI & GitHub Copilot Pro',
    subtitle: 'Elevate your programming with AI-first pair programming editors on private or shared subscriptions.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
    buttonText: 'Explore Coding AI',
    buttonLink: '/shop?category=ai-dev',
    order: 2
  },
  {
    id: 's3',
    title: 'Midjourney & Creative Art Engines',
    subtitle: 'Generate stunning, hyper-realistic graphic assets, conceptual models, and artwork.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
    buttonText: 'Browse AI Art',
    buttonLink: '/shop?category=ai-art',
    order: 3
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_ai_chat', name: 'AI CHAT & WRITING (চ্যাট ও রাইটিং)', slug: 'ai-chat', icon: 'Bot', image: 'https://images.unsplash.com/photo-1675557009875-436f09780264?q=80&w=600&auto=format&fit=crop', isFeatured: true, order: 1 },
  { id: 'cat_ai_art', name: 'AI ART & DESIGN (আর্ট ও ডিজাইন)', slug: 'ai-art', icon: 'Wand2', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', isFeatured: true, order: 2 },
  { id: 'cat_ai_dev', name: 'AI DEVELOPMENT (কোডিং ও ডেভ)', slug: 'ai-dev', icon: 'Code', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop', isFeatured: true, order: 3 },
  { id: 'cat_ai_video', name: 'AI VIDEO & VOICE (ভিডিও ও ভয়েস)', slug: 'ai-video-voice', icon: 'Video', image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=600&auto=format&fit=crop', isFeatured: true, order: 4 }
];

const INITIAL_SUBCATEGORIES: Subcategory[] = [
  { id: 'sub_chat1', categoryId: 'cat_ai_chat', name: 'Chat Assistants', slug: 'chat-assistants' },
  { id: 'sub_chat2', categoryId: 'cat_ai_chat', name: 'Writing Tools', slug: 'writing-tools' },
  { id: 'sub_art1', categoryId: 'cat_ai_art', name: 'Image Generators', slug: 'image-generators' },
  { id: 'sub_dev1', categoryId: 'cat_ai_dev', name: 'Code Assistants', slug: 'code-assistants' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p_chatgpt',
    name: 'ChatGPT Plus Premium Subscription (চ্যাটজিপিটি প্লাস)',
    description: 'Get instant access to GPT-4o, GPT-4, advanced data analysis, file uploads, and custom GPT builders. Super high-speed responses, 1-month shared or private subscription with a full replacement warranty.',
    slug: 'chatgpt-plus-premium',
    category: 'ai-chat',
    subcategory: 'chat-assistants',
    images: [
      'https://images.unsplash.com/photo-1675557009875-436f09780264?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'CHATGPT-SHARED', size: 'Shared Profile (১ মাস)', color: 'Default', stock: 15, price: 350 },
      { sku: 'CHATGPT-PRIVATE', size: 'Private Account (১ মাস)', color: 'Default', stock: 10, price: 2350 }
    ],
    originalPrice: 2400,
    salePrice: 2350,
    saleStartDate: '2026-07-01',
    saleEndDate: '2026-08-31',
    rating: 4.9,
    reviews: [
      { id: 'rev_chat1', productId: 'p_chatgpt', userName: 'Asif Rahman', userEmail: 'asif@gmail.com', rating: 5, comment: 'Instant activation! Absolutely amazing support.', isApproved: true, date: '2026-07-11' }
    ],
    seo: { metaTitle: 'ChatGPT Plus Premium Subscription - Aura AI', metaDescription: 'Access ChatGPT Plus GPT-4o and advanced analysis features at lowest cost in Bangladesh.', slug: 'chatgpt-plus-premium' },
    stock: 25,
    lowStockThreshold: 5,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    flashSaleEnabled: true,
    flashSalePrice: 330,
    flashSaleEnd: '2026-07-25T23:59:59Z',
    createdAt: '2026-07-11T10:00:00.000Z'
  },
  {
    id: 'p_gemini',
    name: 'Google Gemini Advanced Pro (জেমিনি অ্যাডভান্সড)',
    description: 'Access Gemini 1.5 Pro and Gemini Ultra models. Features deep reasoning, active coding, and integration into Google Docs, Gmail, and Google Drive workspace. Fully active for 1 month.',
    slug: 'gemini-advanced-subscription',
    category: 'ai-chat',
    subcategory: 'chat-assistants',
    images: [
      'https://images.unsplash.com/photo-1707149377432-841f3d8381ee?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'GEMINI-SHARED', size: 'Shared Profile (১ মাস)', color: 'Default', stock: 20, price: 390 },
      { sku: 'GEMINI-PRIVATE', size: 'Private Gmail Upgrade', color: 'Default', stock: 8, price: 2450 }
    ],
    originalPrice: 2500,
    salePrice: 2450,
    rating: 4.8,
    reviews: [],
    seo: { metaTitle: 'Google Gemini Advanced Upgrade - Aura AI', metaDescription: 'Activate Gemini Advanced Premium with Ultra 1.0 reasoning inside Google Workspace.', slug: 'gemini-advanced-subscription' },
    stock: 28,
    lowStockThreshold: 5,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    createdAt: '2026-07-11T10:10:00.000Z'
  },
  {
    id: 'p_grok',
    name: 'xAI Grok Premium Subscription (গ্রক এআই)',
    description: 'Direct Grok AI integration on X (Twitter). Features witty responses, direct access to real-time search datasets on X, and fast image generation. Activated for 1 Month.',
    slug: 'grok-ai-premium-subscription',
    category: 'ai-chat',
    subcategory: 'chat-assistants',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'GROK-PREMIUM', size: '1 Month Premium Access', color: 'Default', stock: 12, price: 1200 }
    ],
    originalPrice: 1400,
    salePrice: 1200,
    rating: 4.7,
    reviews: [],
    seo: { metaTitle: 'xAI Grok Premium subscription - Aura AI Store', metaDescription: 'Grok premium AI chat tool on Twitter with real-time news data integration.', slug: 'grok-ai-premium-subscription' },
    stock: 12,
    lowStockThreshold: 3,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    createdAt: '2026-07-11T10:20:00.000Z'
  },
  {
    id: 'p_midjourney',
    name: 'Midjourney AI Image Generator (মিডজার্নি এআই)',
    description: 'Unleash your creativity and generate hyper-realistic concept art, high-fidelity graphics, and product mockups. Fast hours allocation on shared or private accounts.',
    slug: 'midjourney-ai-subscription',
    category: 'ai-art',
    subcategory: 'image-generators',
    images: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'MIDJOURNEY-SHARED', size: 'Shared Profile (১ মাস)', color: 'Default', stock: 15, price: 490 },
      { sku: 'MIDJOURNEY-STANDARD', size: 'Standard Private Account', color: 'Default', stock: 5, price: 3450 }
    ],
    originalPrice: 3600,
    salePrice: 3450,
    rating: 4.9,
    reviews: [],
    seo: { metaTitle: 'Midjourney AI Image Subscription - Aura AI Store', metaDescription: 'Design professional graphics and high fidelity photos with Midjourney v6.', slug: 'midjourney-ai-subscription' },
    stock: 20,
    lowStockThreshold: 4,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: '2026-07-11T10:30:00.000Z'
  },
  {
    id: 'p_cursor',
    name: 'Cursor AI Pro Subscription (কারসর এআই)',
    description: 'The premier AI-first code editor. Seamless pair programming, multi-file codebases understanding, auto-completions, and unlimited Claude 3.5 Sonnet / GPT-4o usage. Full 1-month warranty.',
    slug: 'cursor-ai-pro-subscription',
    category: 'ai-dev',
    subcategory: 'code-assistants',
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'CURSOR-PRO-SHARED', size: 'Shared Profile (১ মাস)', color: 'Default', stock: 8, price: 450 },
      { sku: 'CURSOR-PRO-PRIVATE', size: 'Private Account (১ মাস)', color: 'Default', stock: 4, price: 2350 }
    ],
    originalPrice: 2400,
    salePrice: 2350,
    rating: 5.0,
    reviews: [],
    seo: { metaTitle: 'Cursor AI Pro Editor subscription - Aura AI Store', metaDescription: 'Boost developer speed with Cursor Pro editor integration on Windows/Mac.', slug: 'cursor-ai-pro-subscription' },
    stock: 12,
    lowStockThreshold: 3,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    createdAt: '2026-07-11T10:40:00.000Z'
  },
  {
    id: 'p_copilot',
    name: 'GitHub Copilot Individual (গিটহাব কোপাইলট)',
    description: 'The world\'s most popular AI pair programmer directly integrated inside VS Code, JetBrains, Visual Studio, and Neovim. Write cleaner functions, faster tests.',
    slug: 'github-copilot-subscription',
    category: 'ai-dev',
    subcategory: 'code-assistants',
    images: [
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { sku: 'COPILOT-1M', size: '1 Month Full Access', color: 'Default', stock: 25, price: 350 },
      { sku: 'COPILOT-1Y', size: '1 Year Activation Upgrade', color: 'Default', stock: 10, price: 2200 }
    ],
    originalPrice: 2400,
    salePrice: 2200,
    rating: 4.8,
    reviews: [],
    seo: { metaTitle: 'GitHub Copilot Individual Subscription - Aura AI Store', metaDescription: 'Code faster with GitHub Copilot AI autocomplete support for any coding language.', slug: 'github-copilot-subscription' },
    stock: 35,
    lowStockThreshold: 5,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: '2026-07-11T10:50:00.000Z'
  }
];;

const INITIAL_COUPONS: Coupon[] = [
  { id: 'c1', code: 'AURA10', type: 'percentage', value: 10, minPurchase: 50, expiryDate: '2027-12-31', usageLimit: 100, usageCount: 5 },
  { id: 'c2', code: 'FREESHIP', type: 'fixed', value: 15, minPurchase: 100, expiryDate: '2027-12-31', usageLimit: 50, usageCount: 2 },
  { id: 'c3', code: 'MEGA50', type: 'fixed', value: 50, minPurchase: 300, expiryDate: '2026-07-31', usageLimit: 10, usageCount: 0 }
];

const INITIAL_ZONES: ShippingZone[] = [
  { id: 'z1', name: 'Domestic Flat Rate', cost: 10, freeShippingThreshold: 150 },
  { id: 'z2', name: 'International Shipping', cost: 35, freeShippingThreshold: 500 },
  { id: 'z3', name: 'Dhaka City (Bangladesh)', cost: 5, freeShippingThreshold: 80 },
  { id: 'z4', name: 'Outside Dhaka (Bangladesh)', cost: 8, freeShippingThreshold: 120 }
];

export class DbStore {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure any missing root collections are populated
        if (!this.data.users) this.data.users = [];
        if (!this.data.products) this.data.products = [];
        if (!this.data.categories) this.data.categories = [];
        if (!this.data.subcategories) this.data.subcategories = [];
        if (!this.data.orders) this.data.orders = [];
        if (!this.data.coupons) this.data.coupons = [];
        if (!this.data.sliderSlides) this.data.sliderSlides = [];
        if (!this.data.siteSettings) this.data.siteSettings = DEFAULT_SETTINGS;
        if (!this.data.shippingZones) this.data.shippingZones = [];
        if (!this.data.activityLogs) this.data.activityLogs = [];
      } else {
        this.initializeWithSeeds();
      }
    } catch (e) {
      console.error('Error reading local db file, initializing empty db', e);
      this.initializeWithSeeds();
    }
  }

  private initializeWithSeeds() {
    // Generate hashed default password
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const customerHash = bcrypt.hashSync('customer123', salt);
    const staffHash = bcrypt.hashSync('staff123', salt);

    this.data = {
      users: [
        {
          id: 'u-admin',
          email: 'admin@shop.com',
          password: adminHash,
          role: 'admin',
          name: 'Supreme Admin',
          phone: '+8801711122334',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-customer',
          email: 'customer@shop.com',
          password: customerHash,
          role: 'customer',
          name: 'Regular Customer',
          phone: '+8801811122334',
          addresses: [
            {
              fullName: 'Regular Customer',
              phone: '+8801811122334',
              streetAddress: 'House 42, Road 11, Banani',
              city: 'Dhaka',
              state: 'Dhaka Division',
              zipCode: '1213',
              country: 'Bangladesh'
            }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-staff',
          email: 'staff@shop.com',
          password: staffHash,
          role: 'staff',
          name: 'Store Moderator',
          phone: '+8801911122334',
          createdAt: new Date().toISOString()
        }
      ],
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      subcategories: INITIAL_SUBCATEGORIES,
      orders: [
        {
          id: 'ord-1001',
          customerId: 'u-customer',
          items: [
            {
              productId: 'p_chatgpt',
              variantSku: 'CHATGPT-SHARED',
              quantity: 1,
              price: 350,
              name: 'ChatGPT Plus Premium Subscription (চ্যাটজিপিটি প্লাস)',
              image: 'https://images.unsplash.com/photo-1675557009875-436f09780264?q=80&w=800&auto=format&fit=crop'
            }
          ],
          totalAmount: 350,
          shippingCost: 0,
          discountAmount: 10,
          finalAmount: 340,
          shippingAddress: {
            fullName: 'Regular Customer',
            phone: '+8801811122334',
            streetAddress: 'House 42, Road 11, Banani',
            city: 'Dhaka',
            state: 'Dhaka Division',
            zipCode: '1213',
            country: 'Bangladesh'
          },
          paymentMethod: 'bkash',
          paymentStatus: 'verified',
          paymentDetails: {
            transactionId: 'BKX9023485723',
            paymentInstructions: 'Paid via direct bKash manual transfer.'
          },
          status: 'Processing',
          orderDate: '2026-07-10T15:20:00.000Z',
          trackingTimeline: [
            { status: 'Pending', date: '2026-07-10T15:20:00.000Z', notes: 'Order placed by customer.' },
            { status: 'Processing', date: '2026-07-11T09:00:00.000Z', notes: 'Payment verified, preparing item for packaging.' }
          ]
        },
        {
          id: 'ord-1002',
          customerId: 'u-customer',
          items: [
            {
              productId: 'p_cursor',
              variantSku: 'CURSOR-PRO-SHARED',
              quantity: 2,
              price: 450,
              name: 'Cursor AI Pro Subscription (কারসর এআই)',
              image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop'
            }
          ],
          totalAmount: 900,
          shippingCost: 0,
          discountAmount: 0,
          finalAmount: 900,
          shippingAddress: {
            fullName: 'Regular Customer',
            phone: '+8801811122334',
            streetAddress: 'Shatabdi Tower, Sector 3',
            city: 'Chittagong',
            state: 'Chittagong Division',
            zipCode: '4000',
            country: 'Bangladesh'
          },
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          status: 'Pending',
          orderDate: '2026-07-11T12:00:00.000Z',
          trackingTimeline: [
            { status: 'Pending', date: '2026-07-11T12:00:00.000Z', notes: 'Order placed with Direct/Email Activation option.' }
          ]
        }
      ],
      coupons: INITIAL_COUPONS,
      sliderSlides: INITIAL_SLIDES,
      siteSettings: DEFAULT_SETTINGS,
      shippingZones: INITIAL_ZONES,
      activityLogs: [
        {
          id: 'log-1',
          adminId: 'u-admin',
          adminName: 'Supreme Admin',
          action: 'System Seeded',
          details: 'Initialized e-commerce database tables with mock categories, products, and default site settings.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.save();
  }

  private db: any = null;

  public async initFirestore() {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);
        
        let app;
        if (getApps().length === 0) {
          app = initializeApp({
            projectId: config.projectId
          });
        } else {
          app = getApp();
        }
        
        this.db = getFirestore(app, config.firestoreDatabaseId || '(default)');
        console.log('Firebase Admin Initialized with Firestore databaseId:', config.firestoreDatabaseId || '(default)');

        await this.syncFromFirestore();
      } else {
        console.log('No firebase-applet-config.json found, running strictly on local DB cache.');
      }
    } catch (err) {
      console.error('Failed to initialize Firebase Client, using local DB:', err);
    }
  }

  private async syncFromFirestore() {
    if (!this.db) return;

    try {
      console.log('Synchronizing collections from Cloud Firestore...');
      
      const getCollectionDocs = async (collName: string) => {
        const snapshot = await this.db.collection(collName).get();
        const list: any[] = [];
        snapshot.forEach((doc: any) => {
          list.push(doc.data());
        });
        return list;
      };

      const fbUsers = await getCollectionDocs('users');
      const fbProducts = await getCollectionDocs('products');
      const fbCategories = await getCollectionDocs('categories');
      const fbSubcategories = await getCollectionDocs('subcategories');
      const fbOrders = await getCollectionDocs('orders');
      const fbCoupons = await getCollectionDocs('coupons');
      const fbSlides = await getCollectionDocs('sliderSlides');
      const fbZones = await getCollectionDocs('shippingZones');
      const fbLogs = await getCollectionDocs('activityLogs');

      const settingsSnap = await this.db.collection('siteSettings').doc('global').get();
      const fbSettings = settingsSnap.exists ? settingsSnap.data() as SiteSettings : null;

      // Seed Firestore if both products and users are empty in Firestore (first boot)
      if (fbUsers.length === 0 && fbProducts.length === 0) {
        console.log('Firestore collections are blank. Seeding Firestore with default datasets...');
        this.load(); 
        await this.uploadAllToFirestore();
        console.log('Firestore seeding complete.');
      } else {
        console.log(`Successfully restored data from Cloud Firestore. Users: ${fbUsers.length}, Products: ${fbProducts.length}`);
        this.data = {
          users: fbUsers.length > 0 ? fbUsers : this.data.users,
          products: fbProducts.length > 0 ? fbProducts : this.data.products,
          categories: fbCategories.length > 0 ? fbCategories : this.data.categories,
          subcategories: fbSubcategories.length > 0 ? fbSubcategories : this.data.subcategories,
          orders: fbOrders.length > 0 ? fbOrders : this.data.orders,
          coupons: fbCoupons.length > 0 ? fbCoupons : this.data.coupons,
          sliderSlides: fbSlides.length > 0 ? fbSlides : this.data.sliderSlides,
          siteSettings: fbSettings ? fbSettings : this.data.siteSettings,
          shippingZones: fbZones.length > 0 ? fbZones : this.data.shippingZones,
          activityLogs: fbLogs.length > 0 ? fbLogs : this.data.activityLogs
        };
        this.saveLocalFileOnly();
      }
    } catch (e) {
      console.error('Error synchronizing from Firestore, continuing with local fallback:', e);
    }
  }

  private async uploadAllToFirestore() {
    if (!this.db) return;
    try {
      const uploadCollection = async (collName: string, items: any[]) => {
        for (const item of items) {
          if (item && item.id) {
            await this.db.collection(collName).doc(item.id).set(item);
          }
        }
      };

      await uploadCollection('users', this.data.users);
      await uploadCollection('products', this.data.products);
      await uploadCollection('categories', this.data.categories);
      await uploadCollection('subcategories', this.data.subcategories);
      await uploadCollection('orders', this.data.orders);
      await uploadCollection('coupons', this.data.coupons);
      await uploadCollection('sliderSlides', this.data.sliderSlides);
      await uploadCollection('shippingZones', this.data.shippingZones);
      await uploadCollection('activityLogs', this.data.activityLogs);

      if (this.data.siteSettings) {
        await this.db.collection('siteSettings').doc('global').set(this.data.siteSettings);
      }
    } catch (err) {
      console.error('Failed to seed datasets to Firestore:', err);
    }
  }

  private async saveCollectionToFirestore(collName: string, items: any[]) {
    if (!this.db) return;
    try {
      for (const item of items) {
        if (item && item.id) {
          await this.db.collection(collName).doc(item.id).set(item);
        }
      }
      
      const querySnapshot = await this.db.collection(collName).get();
      const currentIds = new Set(items.map(i => i.id));
      for (const d of querySnapshot.docs) {
        if (!currentIds.has(d.id)) {
          await this.db.collection(collName).doc(d.id).delete();
        }
      }
    } catch (err) {
      console.error(`Failed to save collection ${collName} to Firestore:`, err);
    }
  }

  private async saveSettingsToFirestore(settings: SiteSettings) {
    if (!this.db) return;
    try {
      await this.db.collection('siteSettings').doc('global').set(settings);
    } catch (err) {
      console.error('Failed to save site settings to Firestore:', err);
    }
  }

  public saveLocalFileOnly() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to local JSON backup:', e);
    }
  }

  public save() {
    this.saveLocalFileOnly();
  }

  // Collection getter functions
  public getUsers() { return this.data.users; }
  public getProducts() { return this.data.products; }
  public getCategories() { return this.data.categories; }
  public getSubcategories() { return this.data.subcategories; }
  public getOrders() { return this.data.orders; }
  public getCoupons() { return this.data.coupons; }
  public getSliderSlides() { return this.data.sliderSlides; }
  public getSiteSettings() { return this.data.siteSettings; }
  public getShippingZones() { return this.data.shippingZones; }
  public getActivityLogs() { return this.data.activityLogs; }

  // Mutation functions
  public saveUsers(users: User[]) { 
    this.data.users = users; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('users', users);
  }
  public saveProducts(products: Product[]) { 
    this.data.products = products; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('products', products);
  }
  public saveCategories(categories: Category[]) { 
    this.data.categories = categories; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('categories', categories);
  }
  public saveSubcategories(subcategories: Subcategory[]) { 
    this.data.subcategories = subcategories; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('subcategories', subcategories);
  }
  public saveOrders(orders: Order[]) { 
    this.data.orders = orders; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('orders', orders);
  }
  public saveCoupons(coupons: Coupon[]) { 
    this.data.coupons = coupons; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('coupons', coupons);
  }
  public saveSliderSlides(slides: SliderSlide[]) { 
    this.data.sliderSlides = slides; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('sliderSlides', slides);
  }
  public saveSiteSettings(settings: SiteSettings) { 
    this.data.siteSettings = settings; 
    this.saveLocalFileOnly(); 
    this.saveSettingsToFirestore(settings);
  }
  public saveShippingZones(zones: ShippingZone[]) { 
    this.data.shippingZones = zones; 
    this.saveLocalFileOnly(); 
    this.saveCollectionToFirestore('shippingZones', zones);
  }
  public logActivity(adminId: string, adminName: string, action: string, details: string) {
    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminId,
      adminName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs.pop();
    }
    this.saveLocalFileOnly();
    this.saveCollectionToFirestore('activityLogs', this.data.activityLogs);
  }
}

export const dbStore = new DbStore();
