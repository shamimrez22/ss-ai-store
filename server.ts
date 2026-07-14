import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbStore } from './src/db/dbStore';
import { 
  User, UserRole, Product, Category, Order, Coupon, 
  SliderSlide, SiteSettings, ShippingZone, OrderItem, TrackingStep, Review 
} from './src/types';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aura_super_secure_secret_123!';

async function startServer() {
  // Sync database with Firestore before booting up standard routing
  console.log('Synchronizing with Firestore Database...');
  await dbStore.initFirestore();
  console.log('Database synced successfully.');

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- MIDDLEWARES ---

  // Simple Request Logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // JWT Auth Middleware
  interface AuthRequest extends Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    };
  }

  function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access denied. Token missing.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole; name: string };
      // Check if user is blocked
      const user = dbStore.getUsers().find(u => u.id === decoded.id);
      if (user?.blocked) {
        res.status(403).json({ message: 'Your account has been suspended.' });
        return;
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid or expired token.' });
      return;
    }
  }

  // Role Authorization Middleware
  function requireRole(allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: 'Unauthorized. You do not have permissions for this action.' });
        return;
      }
      next();
    };
  }


  // --- AUTHENTICATION API ENDPOINTS ---

  // Register Customer
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Please provide email, password and name.' });
      return;
    }

    const users = dbStore.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ message: 'Email already registered.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      name,
      phone,
      addresses: [],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    dbStore.saveUsers(users);

    // Create Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, phone: newUser.phone, addresses: newUser.addresses }
    });
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const user = dbStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.blocked || !user.password) {
      res.status(401).json({ message: 'Invalid credentials or account suspended.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, addresses: user.addresses || [] }
    });
  });

  // Get Current Profile Context
  app.get('/api/auth/me', authenticateToken as any, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const user = dbStore.getUsers().find(u => u.id === req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, addresses: user.addresses || [] }
    });
  });

  // Update Profile & Addresses
  app.put('/api/auth/profile', authenticateToken as any, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const { name, phone, addresses, currentPassword, newPassword } = req.body;
    const users = dbStore.getUsers();
    const userIdx = users.findIndex(u => u.id === req.user!.id);

    if (userIdx === -1) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = users[userIdx];

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (addresses) user.addresses = addresses;

    // Password change option
    if (currentPassword && newPassword) {
      if (!user.password || !bcrypt.compareSync(currentPassword, user.password)) {
        res.status(400).json({ message: 'Incorrect current password' });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(newPassword, salt);
    }

    users[userIdx] = user;
    dbStore.saveUsers(users);

    res.json({
      message: 'Profile updated successfully',
      user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, addresses: user.addresses || [] }
    });
  });

  // Admin: List all Users
  app.get('/api/auth/users', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const users = dbStore.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      phone: u.phone,
      blocked: !!u.blocked,
      createdAt: u.createdAt
    }));
    res.json(users);
  });

  // Admin: Update User Block status or Role
  app.put('/api/auth/users/:id', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role, blocked } = req.body;

    const users = dbStore.getUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Don't let admin block themselves
    if (user.id === req.user!.id && blocked === true) {
      res.status(400).json({ message: 'You cannot block your own administrative account.' });
      return;
    }

    if (role) user.role = role;
    if (blocked !== undefined) user.blocked = blocked;

    dbStore.saveUsers(users);
    dbStore.logActivity(req.user!.id, req.user!.name, 'User Updated', `Updated user role/blocked status for ${user.email}`);

    res.json({ message: 'User updated successfully', user });
  });

  // Admin: Create Staff Account
  app.post('/api/auth/staff', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ message: 'Provide email, password, name, and staff role.' });
      return;
    }

    const users = dbStore.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ message: 'User email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newStaff: User = {
      id: `u-${Date.now()}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role as UserRole,
      name,
      phone,
      blocked: false,
      createdAt: new Date().toISOString()
    };

    users.push(newStaff);
    dbStore.saveUsers(users);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Staff Created', `Created ${role} account: ${email}`);

    res.status(201).json({ message: 'Staff user created successfully.', staff: newStaff });
  });


  // --- PRODUCT API ENDPOINTS ---

  // List Products with Filters
  app.get('/api/products', (req: Request, res: Response) => {
    const { 
      category, subcategory, search, sort, minPrice, maxPrice, rating,
      featured, flash, newArrival, bestSeller, page, limit 
    } = req.query;
    let products = [...dbStore.getProducts()];

    // Search filter
    if (search) {
      const q = (search as string).toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Subcategory filter
    if (subcategory) {
      products = products.filter(p => p.subcategory === subcategory);
    }

    // Featured filter
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured === true);
    }

    // Flash sale filter
    if (flash === 'true') {
      products = products.filter(p => p.flashSaleEnabled === true);
    }

    // New arrival filter
    if (newArrival === 'true') {
      products = products.filter(p => p.isNewArrival === true);
    }

    // Best seller filter
    if (bestSeller === 'true') {
      products = products.filter(p => p.isBestSeller === true);
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      products = products.filter(p => {
        const pPrice = p.salePrice || p.originalPrice;
        return pPrice >= min;
      });
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      products = products.filter(p => {
        const pPrice = p.salePrice || p.originalPrice;
        return pPrice <= max;
      });
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating as string);
      products = products.filter(p => p.rating >= minRating);
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price-low-high':
          products.sort((a, b) => (a.salePrice || a.originalPrice) - (b.salePrice || b.originalPrice));
          break;
        case 'price-high-low':
          products.sort((a, b) => (b.salePrice || b.originalPrice) - (a.salePrice || a.originalPrice));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popularity':
        default:
          products.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    const totalCount = products.length;

    // Apply pagination
    if (limit) {
      const limitVal = parseInt(limit as string) || 24;
      const pageVal = parseInt(page as string) || 1;
      const start = (pageVal - 1) * limitVal;
      const end = start + limitVal;
      products = products.slice(start, end);
    }

    res.setHeader('X-Total-Count', totalCount.toString());
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(products);
  });

  // Get Single Product by Slug or ID
  app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const products = dbStore.getProducts();
    const product = products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    res.json(product);
  });

  // Admin/Staff: Add Product
  app.post('/api/products', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const pData: Partial<Product> = req.body;

    if (!pData.name || !pData.category || !pData.originalPrice || !pData.variants || pData.variants.length === 0) {
      res.status(400).json({ message: 'Provide name, category, originalPrice, and at least one variant.' });
      return;
    }

    const slug = pData.slug || pData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const products = dbStore.getProducts();

    if (products.find(p => p.slug === slug)) {
      res.status(400).json({ message: 'Product with this title/slug already exists.' });
      return;
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: pData.name,
      description: pData.description || '',
      slug,
      category: pData.category,
      subcategory: pData.subcategory,
      images: pData.images && pData.images.length > 0 ? pData.images : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop'],
      variants: pData.variants,
      originalPrice: pData.originalPrice,
      salePrice: pData.salePrice,
      saleStartDate: pData.saleStartDate,
      saleEndDate: pData.saleEndDate,
      rating: 5.0,
      reviews: [],
      seo: pData.seo || { metaTitle: pData.name, metaDescription: pData.description || '', slug },
      stock: pData.variants.reduce((acc, v) => acc + v.stock, 0),
      lowStockThreshold: pData.lowStockThreshold || 5,
      isFeatured: !!pData.isFeatured,
      isNewArrival: pData.isNewArrival !== undefined ? pData.isNewArrival : true,
      isBestSeller: !!pData.isBestSeller,
      isPopular: !!pData.isPopular,
      isSpecialOffer: !!pData.isSpecialOffer,
      unit: pData.unit || '',
      flashSaleEnabled: !!pData.flashSaleEnabled,
      flashSalePrice: pData.flashSalePrice,
      flashSaleEnd: pData.flashSaleEnd,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    dbStore.saveProducts(products);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Product Created', `Created product: ${newProduct.name} (${newProduct.id})`);

    res.status(201).json(newProduct);
  });

  // Admin/Staff: Update Product
  app.put('/api/products/:id', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const pData: Partial<Product> = req.body;

    const products = dbStore.getProducts();
    const idx = products.findIndex(p => p.id === id);

    if (idx === -1) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const existingProduct = products[idx];

    // Compute updated stock from variants if they were sent
    let updatedStock = existingProduct.stock;
    if (pData.variants) {
      updatedStock = pData.variants.reduce((sum, v) => sum + v.stock, 0);
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...pData,
      id: existingProduct.id, // preserve ID
      stock: pData.variants ? updatedStock : existingProduct.stock,
      createdAt: existingProduct.createdAt // preserve createdAt
    };

    products[idx] = updatedProduct;
    dbStore.saveProducts(products);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Product Updated', `Updated product details: ${updatedProduct.name}`);

    res.json(updatedProduct);
  });

  // Admin/Staff: Delete Product
  app.delete('/api/products/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const products = dbStore.getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const filtered = products.filter(p => p.id !== id);
    dbStore.saveProducts(filtered);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Product Deleted', `Deleted product: ${product.name} (${id})`);

    res.json({ message: 'Product deleted successfully.' });
  });

  // Bulk CSV Upload Mock Handler
  app.post('/api/products/bulk-upload', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { productsList } = req.body;
    if (!productsList || !Array.isArray(productsList)) {
      res.status(400).json({ message: 'Provide an array of products for bulk upload.' });
      return;
    }

    const currentProducts = dbStore.getProducts();
    let uploadedCount = 0;

    for (const p of productsList) {
      if (!p.name || !p.category || !p.originalPrice) continue;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
      const newP: Product = {
        id: `p-bulk-${Date.now()}-${uploadedCount}`,
        name: p.name,
        description: p.description || '',
        slug,
        category: p.category,
        subcategory: p.subcategory,
        images: p.images || ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop'],
        variants: p.variants || [{ sku: slug.toUpperCase(), stock: parseInt(p.stock) || 10, price: parseFloat(p.originalPrice) }],
        originalPrice: parseFloat(p.originalPrice),
        salePrice: p.salePrice ? parseFloat(p.salePrice) : undefined,
        rating: 5.0,
        reviews: [],
        seo: { metaTitle: p.name, metaDescription: p.description || '', slug },
        stock: p.stock ? parseInt(p.stock) : 10,
        lowStockThreshold: 5,
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        createdAt: new Date().toISOString()
      };
      currentProducts.push(newP);
      uploadedCount++;
    }

    dbStore.saveProducts(currentProducts);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Bulk Upload', `Bulk uploaded ${uploadedCount} products.`);

    res.json({ message: `Successfully uploaded ${uploadedCount} products.`, count: uploadedCount });
  });

  // Customer: Post Product Review
  app.post('/api/products/:id/reviews', authenticateToken as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment, photos } = req.body;

    if (!rating || !comment) {
      res.status(400).json({ message: 'Rating and comment are required.' });
      return;
    }

    const products = dbStore.getProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      rating: parseInt(rating),
      comment,
      isApproved: true, // Auto-approve for demo simplicity, can toggle in Admin panel
      photos,
      date: new Date().toISOString().split('T')[0]
    };

    product.reviews.push(newReview);
    // Recalculate rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    dbStore.saveProducts(products);

    res.status(201).json({ message: 'Review added successfully.', review: newReview, rating: product.rating });
  });


  // --- CATEGORIES API ENDPOINTS ---

  // Get Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(dbStore.getCategories());
  });

  // Admin: Add Category
  app.post('/api/categories', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { name, icon, image, isFeatured } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const categories = dbStore.getCategories();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (categories.find(c => c.slug === slug)) {
      res.status(400).json({ message: 'Category already exists.' });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      icon: icon || 'Sparkles',
      image: image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      order: categories.length + 1
    };

    categories.push(newCategory);
    dbStore.saveCategories(categories);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Category Created', `Created category: ${newCategory.name}`);

    res.status(201).json(newCategory);
  });

  // Admin: Update Category
  app.put('/api/categories/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, icon, image, isFeatured } = req.body;

    const categories = dbStore.getCategories();
    const category = categories.find(c => c.id === id);

    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (isFeatured !== undefined) category.isFeatured = isFeatured;

    dbStore.saveCategories(categories);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Category Updated', `Updated category: ${category.name}`);

    res.json({ message: 'Category updated successfully.', category });
  });

  // Admin: Delete Category
  app.delete('/api/categories/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const categories = dbStore.getCategories();
    const category = categories.find(c => c.id === id);

    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    const filtered = categories.filter(c => c.id !== id);
    dbStore.saveCategories(filtered);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Category Deleted', `Deleted category: ${category.name}`);

    res.json({ message: 'Category deleted successfully.' });
  });

  // Admin: Update/Reorder Categories
  app.put('/api/categories/reorder', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400).json({ message: 'Provide orderedIds array' });
      return;
    }

    const categories = dbStore.getCategories();
    orderedIds.forEach((id: string, idx: number) => {
      const cat = categories.find(c => c.id === id);
      if (cat) cat.order = idx + 1;
    });

    categories.sort((a, b) => a.order - b.order);
    dbStore.saveCategories(categories);

    res.json({ message: 'Categories reordered successfully.', categories });
  });


  // --- COUPONS API ENDPOINTS ---

  // Check Coupon validity
  app.post('/api/coupons/apply', (req: Request, res: Response) => {
    const { code, cartTotal } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Provide a coupon code.' });
      return;
    }

    const coupon = dbStore.getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      res.status(404).json({ message: 'Coupon code not found.' });
      return;
    }

    // Check expiry
    const expiry = new Date(coupon.expiryDate);
    const now = new Date();
    if (expiry < now) {
      res.status(400).json({ message: 'Coupon has expired.' });
      return;
    }

    // Check usage limits
    if (coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ message: 'Coupon code has reached its maximum usage limit.' });
      return;
    }

    // Check minimum purchase amount
    if (cartTotal && cartTotal < coupon.minPurchase) {
      res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} is required to apply this coupon.` });
      return;
    }

    res.json({
      message: 'Coupon code applied successfully.',
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value }
    });
  });

  // Admin: Manage Coupons
  app.get('/api/coupons', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    res.json(dbStore.getCoupons());
  });

  app.post('/api/coupons', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { code, type, value, minPurchase, expiryDate, usageLimit } = req.body;

    if (!code || !type || !value || !minPurchase || !expiryDate || !usageLimit) {
      res.status(400).json({ message: 'Provide all required coupon fields.' });
      return;
    }

    const coupons = dbStore.getCoupons();
    if (coupons.find(c => c.code.toUpperCase() === code.toUpperCase())) {
      res.status(400).json({ message: 'Coupon code already exists.' });
      return;
    }

    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      minPurchase: parseFloat(minPurchase),
      expiryDate,
      usageLimit: parseInt(usageLimit),
      usageCount: 0
    };

    coupons.push(newCoupon);
    dbStore.saveCoupons(coupons);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Coupon Created', `Created coupon: ${newCoupon.code}`);

    res.status(201).json(newCoupon);
  });

  app.delete('/api/coupons/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const coupons = dbStore.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);

    dbStore.saveCoupons(filtered);
    res.json({ message: 'Coupon deleted successfully.' });
  });


  // --- ORDER MANAGEMENT API ENDPOINTS ---

  // Track Order Status Publicly
  app.get('/api/orders/track/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const order = dbStore.getOrders().find(o => o.id === id);

    if (!order) {
      res.status(404).json({ message: 'Order not found. Check your order reference ID.' });
      return;
    }

    res.json({
      id: order.id,
      status: order.status,
      orderDate: order.orderDate,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
      trackingTimeline: order.trackingTimeline
    });
  });

  // Create Order (Checkout)
  app.post('/api/orders', (req: Request, res: Response) => {
    const { 
      items, shippingAddress, paymentMethod, couponCode, 
      guestInfo, customerId, totalAmount, shippingCost, discountAmount, finalAmount,
      paymentSlipUrl, transactionId
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress || !paymentMethod) {
      res.status(400).json({ message: 'Cart items, shipping address, and payment method are required.' });
      return;
    }

    const products = dbStore.getProducts();

    // Deduct stock levels and verify
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        res.status(404).json({ message: `Product ${item.name} no longer exists.` });
        return;
      }

      // Check variant stock
      const variant = prod.variants.find(v => v.sku === item.variantSku);
      if (variant) {
        if (variant.stock < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for variant ${variant.sku}. Only ${variant.stock} left.` });
          return;
        }
        variant.stock -= item.quantity;
      } else {
        if (prod.stock < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for ${prod.name}. Only ${prod.stock} left.` });
          return;
        }
        prod.stock -= item.quantity;
      }
    }

    // Save updated stocks
    dbStore.saveProducts(products);

    // Apply Coupon Usage if valid code was sent
    if (couponCode) {
      const coupons = dbStore.getCoupons();
      const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon) {
        coupon.usageCount += 1;
        dbStore.saveCoupons(coupons);
      }
    }

    // Auto-compute status based on payment gateway
    let paymentStatus: 'pending' | 'successful' | 'failed' | 'verified' = 'pending';
    if (paymentMethod === 'stripe' || paymentMethod === 'paypal' || paymentMethod === 'sslcommerz') {
      paymentStatus = 'successful'; // Auto-completed mock gateway
    }

    const newOrderId = `ord-${1000 + dbStore.getOrders().length + 1}`;

    const newOrder: Order = {
      id: newOrderId,
      customerId,
      guestInfo,
      items,
      totalAmount,
      shippingCost,
      discountAmount,
      finalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        transactionId: transactionId || `TXN-${Math.floor(Math.random() * 1000000000)}`,
        paymentSlipUrl,
        paymentInstructions: dbStore.getSiteSettings().paymentGateways[paymentMethod]?.instructions
      },
      status: 'Pending',
      orderDate: new Date().toISOString(),
      trackingTimeline: [
        {
          status: 'Pending',
          date: new Date().toISOString(),
          notes: `Order successfully placed using ${dbStore.getSiteSettings().paymentGateways[paymentMethod]?.name || paymentMethod}.`
        }
      ]
    };

    const orders = dbStore.getOrders();
    orders.unshift(newOrder); // Newest orders first
    dbStore.saveOrders(orders);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  });

  // Get My Orders
  app.get('/api/orders/my-orders', authenticateToken as any, (req: AuthRequest, res: Response) => {
    const orders = dbStore.getOrders().filter(o => o.customerId === req.user!.id);
    res.json(orders);
  });

  // Admin/Staff: Get All Orders with Filter
  app.get('/api/orders', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const { status, paymentMethod } = req.query;
    let orders = [...dbStore.getOrders()];

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (paymentMethod) {
      orders = orders.filter(o => o.paymentMethod === paymentMethod);
    }

    res.json(orders);
  });

  // Admin/Staff: Update Order Status
  app.put('/api/orders/:id/status', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const orders = dbStore.getOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (status) {
      order.status = status;
      // Append tracking step
      const step: TrackingStep = {
        status,
        date: new Date().toISOString(),
        notes: notes || `Order updated to ${status} by staff.`
      };
      order.trackingTimeline.push(step);
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    dbStore.saveOrders(orders);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Order Updated', `Updated status of order ${order.id} to ${status || order.status}`);

    res.json({ message: 'Order status updated successfully.', order });
  });

  // Admin/Staff: Delete Order
  app.delete('/api/orders/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const orders = dbStore.getOrders();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    const order = orders[orderIndex];
    orders.splice(orderIndex, 1);
    dbStore.saveOrders(orders);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Order Deleted', `Deleted order ${order.id}`);

    res.json({ message: 'Order deleted successfully.' });
  });


  // --- SITE SETTINGS API ENDPOINTS ---

  // Get Site Settings (Publicly sanitized)
  app.get('/api/settings', (req: Request, res: Response) => {
    const settings = dbStore.getSiteSettings();
    // Hide secret keys for client
    const sanitizedGateways = JSON.parse(JSON.stringify(settings.paymentGateways));
    Object.keys(sanitizedGateways).forEach(k => {
      const g = sanitizedGateways[k];
      if (g.apiKeys) {
        Object.keys(g.apiKeys).forEach(key => {
          g.apiKeys[key] = g.apiKeys[key] ? '●●●●●●●●' : '';
        });
      }
    });

    res.json({
      ...settings,
      paymentGateways: sanitizedGateways
    });
  });

  // Admin: Update Site Settings
  app.put('/api/settings', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const updated = req.body;
    const settings = dbStore.getSiteSettings();

    // Preserve any API keys that are masked
    if (updated.paymentGateways) {
      Object.keys(updated.paymentGateways).forEach(gId => {
        const incomingGateway = updated.paymentGateways[gId];
        const existingGateway = settings.paymentGateways[gId];

        if (incomingGateway && existingGateway) {
          Object.keys(incomingGateway.apiKeys).forEach(apiKeyName => {
            if (incomingGateway.apiKeys[apiKeyName] === '●●●●●●●●') {
              // User didn't change it, preserve the real underlying secret
              incomingGateway.apiKeys[apiKeyName] = existingGateway.apiKeys[apiKeyName] || '';
            }
          });
        }
      });
    }

    const merged: SiteSettings = {
      ...settings,
      ...updated
    };

    dbStore.saveSiteSettings(merged);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Settings Modified', 'Modified global site configurations and payment setups.');

    res.json({ message: 'Global settings updated successfully.' });
  });

  // Manage Banner Slides (Public)
  app.get('/api/slides', (req: Request, res: Response) => {
    const slides = dbStore.getSliderSlides();
    slides.sort((a, b) => a.order - b.order);
    res.json(slides);
  });

  // Admin: Manage Banner Slides
  app.post('/api/slides', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { title, subtitle, image, buttonText, buttonLink } = req.body;
    const slides = dbStore.getSliderSlides();

    const newSlide: SliderSlide = {
      id: `slide-${Date.now()}`,
      title: title || 'New Promotion',
      subtitle: subtitle || 'Limited time offer',
      image: image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/shop',
      order: slides.length + 1
    };

    slides.push(newSlide);
    dbStore.saveSliderSlides(slides);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Slide Added', `Added home banner slide: ${newSlide.title}`);

    res.status(201).json(newSlide);
  });

  app.delete('/api/slides/:id', authenticateToken as any, requireRole(['admin', 'staff']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const slides = dbStore.getSliderSlides();
    const filtered = slides.filter(s => s.id !== id);

    dbStore.saveSliderSlides(filtered);
    res.json({ message: 'Slide banner deleted successfully.' });
  });


  // --- SHIPPING & ZONES API ENDPOINTS ---

  app.get('/api/shipping/zones', (req: Request, res: Response) => {
    res.json(dbStore.getShippingZones());
  });

  app.post('/api/shipping/zones', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const { name, cost, freeShippingThreshold } = req.body;

    if (!name || cost === undefined) {
      res.status(400).json({ message: 'Zone name and cost are required.' });
      return;
    }

    const zones = dbStore.getShippingZones();
    const newZone: ShippingZone = {
      id: `z-${Date.now()}`,
      name,
      cost: parseFloat(cost),
      freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : undefined
    };

    zones.push(newZone);
    dbStore.saveShippingZones(zones);
    dbStore.logActivity(req.user!.id, req.user!.name, 'Shipping Zone Added', `Added shipping area: ${newZone.name}`);

    res.status(201).json(newZone);
  });

  app.delete('/api/shipping/zones/:id', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const zones = dbStore.getShippingZones();
    const filtered = zones.filter(z => z.id !== id);

    dbStore.saveShippingZones(filtered);
    res.json({ message: 'Shipping zone deleted successfully.' });
  });


  // --- SYSTEM LOGS API ENDPOINTS ---

  app.get('/api/settings/logs', authenticateToken as any, requireRole(['admin']) as any, (req: AuthRequest, res: Response) => {
    res.json(dbStore.getActivityLogs());
  });


  // --- REVIEWS MODERATION API ENDPOINTS ---

  app.get('/api/reviews', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const products = dbStore.getProducts();
    const allReviews: any[] = [];

    products.forEach(p => {
      p.reviews.forEach(r => {
        allReviews.push({
          ...r,
          productName: p.name,
          productSlug: p.slug
        });
      });
    });

    res.json(allReviews);
  });

  app.put('/api/reviews/:id', authenticateToken as any, requireRole(['admin', 'staff', 'moderator']) as any, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reply, isApproved, deleteReview } = req.body;

    const products = dbStore.getProducts();
    let updated = false;

    for (const p of products) {
      const rIdx = p.reviews.findIndex(r => r.id === id);
      if (rIdx !== -1) {
        if (deleteReview) {
          p.reviews.splice(rIdx, 1);
        } else {
          if (reply !== undefined) p.reviews[rIdx].reply = reply;
          if (isApproved !== undefined) p.reviews[rIdx].isApproved = isApproved;
        }

        // Recalculate average rating
        if (p.reviews.length > 0) {
          const total = p.reviews.reduce((sum, r) => sum + r.rating, 0);
          p.rating = parseFloat((total / p.reviews.length).toFixed(1));
        } else {
          p.rating = 5.0;
        }

        updated = true;
        break;
      }
    }

    if (updated) {
      dbStore.saveProducts(products);
      res.json({ message: 'Review moderation updated successfully.' });
    } else {
      res.status(404).json({ message: 'Review not found.' });
    }
  });


  // --- VITE DEV / PRODUCTION CONFIGURATION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Static asset serving mounted in production mode.');
  }

  // Bind to 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal failure to launch server', err);
});
