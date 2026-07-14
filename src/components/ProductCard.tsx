import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { wishlist, toggleWishlist, addToCart, siteSettings } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  // Get active pricing (regular vs sale)
  const defaultVariant = product.variants[0] || { price: product.originalPrice, stock: 0 };
  const originalPrice = product.originalPrice;
  const currentPrice = product.salePrice || originalPrice;
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const isInWishlist = wishlist.some((p) => p.id === product.id);

  // Compute total stock of all variants combined
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  // Stock Badge helper
  const getStockStatus = () => {
    if (totalStock <= 0) return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (totalStock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const stockInfo = getStockStatus();

  const handleAddDefaultVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length > 0) {
      // Add first in-stock variant
      const inStockVar = product.variants.find(v => v.stock > 0) || product.variants[0];
      addToCart(product, inStockVar, 1);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length > 0) {
      const inStockVar = product.variants.find(v => v.stock > 0) || product.variants[0];
      addToCart(product, inStockVar, 1);
      window.location.hash = '#/checkout';
    }
  };

  return (
    <motion.div
      id={`prod-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      className="relative flex flex-col w-full h-full bg-[#0c0c0c] rounded-2xl border border-zinc-900 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      {/* Top Media Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-900 flex items-center justify-center border-b border-zinc-900">
        {/* Top Badges (Left / Right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none select-none">
          {product.isNewArrival ? (
            <span className="bg-zinc-950 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              NEW ARRIVAL
            </span>
          ) : (
            <div />
          )}

          {product.salePrice && discountPercent > 0 ? (
            <span className="bg-[#4B4038] text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              SAVE {discountPercent}%
            </span>
          ) : (
            <div />
          )}
        </div>

        {/* Floating Wishlist Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-950/90 backdrop-blur-sm shadow border border-zinc-800 text-white hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isInWishlist ? 'fill-rose-500 text-rose-500 scale-110' : 'text-zinc-300'}`} />
        </button>

        {/* Product Image */}
        <motion.img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full h-full object-cover select-none"
        />
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 p-4 gap-3 bg-[#0c0c0c]">
        <div className="flex flex-col gap-1.5">
          {/* Product Title */}
          <h3 className="font-sans font-black text-[12px] md:text-[13px] text-zinc-100 line-clamp-2 leading-snug tracking-tight text-left min-h-[2.5rem] uppercase">
            {product.name}
          </h3>

          {/* Size Pill and Stock Alert Row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="bg-zinc-900 text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border border-zinc-800">
              {defaultVariant.size || "1 UNIT"}
            </span>

            {totalStock <= 0 ? (
              <span className="bg-rose-950 text-rose-300 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-rose-900">
                OUT OF STOCK
              </span>
            ) : totalStock <= product.lowStockThreshold ? (
              <span className="bg-amber-950 text-amber-300 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-amber-900 animate-pulse">
                ONLY {totalStock} LEFT
              </span>
            ) : (
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                IN STOCK
              </span>
            )}
          </div>
        </div>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-400">
            {product.rating.toFixed(1)}
          </span>
        </div>

        {/* Price and Cart Row */}
        <div className="flex flex-col gap-2.5 mt-auto pt-2.5 border-t border-zinc-900">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-white font-mono">
                {siteSettings?.currencySymbol || '৳'}{currentPrice}
              </span>
              {product.salePrice && (
                <span className="text-[10px] text-zinc-500 line-through font-mono">
                  {siteSettings?.currencySymbol || '৳'}{originalPrice}
                </span>
              )}
            </div>

            {product.salePrice && discountPercent > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black text-white bg-[#4B4038] rounded shrink-0">
                {siteSettings?.currencySymbol || '৳'}{originalPrice - currentPrice} অফ
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Quick Add To Cart button */}
            <motion.button
              id={`quick-add-cart-${product.id}`}
              disabled={totalStock <= 0}
              onClick={handleAddDefaultVariant}
              whileHover={totalStock > 0 ? { scale: 1.02 } : {}}
              whileTap={totalStock > 0 ? { scale: 0.98 } : {}}
              className={`flex items-center justify-center gap-1 px-1 py-2 text-[11px] font-extrabold rounded border transition-all cursor-pointer ${
                totalStock <= 0
                  ? 'bg-zinc-900 text-zinc-650 cursor-not-allowed border-zinc-900'
                  : 'bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white'
               }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0 stroke-[2.5px]" />
              <span>ADD</span>
            </motion.button>

            {/* Buy Now button */}
            <motion.button
              id={`quick-buy-now-${product.id}`}
              disabled={totalStock <= 0}
              onClick={handleBuyNow}
              whileHover={totalStock > 0 ? { scale: 1.02 } : {}}
              whileTap={totalStock > 0 ? { scale: 0.98 } : {}}
              className={`flex items-center justify-center gap-1 px-1 py-2 text-[11px] font-extrabold rounded transition-all cursor-pointer ${
                totalStock <= 0
                  ? 'bg-zinc-900 text-zinc-650 cursor-not-allowed'
                  : 'bg-[#4B4038] hover:bg-[#5E5147] text-white shadow-sm'
              }`}
            >
              <span>BUY</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
