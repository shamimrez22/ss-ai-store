import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ProductVariant } from '../types';
import { useApp } from '../context/AppContext';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImage(product.images[0]);
    setSelectedVariant(product.variants[0]);
    setQuantity(1);
  }, [product]);

  const isInWishlist = wishlist.some(p => p.id === product.id);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleIncrement = () => {
    if (quantity < selectedVariant.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div id="quickview-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        id="quickview-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#0d0d0d] text-white rounded-3xl w-full max-w-4xl shadow-2xl border border-zinc-900 overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="close-quickview"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 md:p-8 flex flex-col gap-4 border-r border-zinc-900 bg-black">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#080808] border border-zinc-900 shadow-inner flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    id={`thumb-btn-${idx}`}
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === img ? 'border-red-600 scale-105' : 'border-zinc-800 hover:border-zinc-750'
                    }`}
                  >
                    <img src={img} alt="Thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs */}
          <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-red-500">
                  {product.category.replace('_', ' ')}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1 uppercase">
                  {product.name}
                </h2>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-300">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 border-l border-zinc-800 pl-2">
                  {product.reviews.length} reviews
                </span>
              </div>

              {/* Price Details */}
              <div className="flex items-baseline gap-2 pb-3 border-b border-zinc-900">
                <span className="text-2xl font-extrabold text-red-500 font-mono">
                  ৳{selectedVariant?.price || currentPrice()}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-zinc-500 line-through font-mono">
                    ৳{product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Variants Picker */}
              {product.variants.length > 0 && (
                <div className="flex flex-col gap-2.5 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Select Option / Variant:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <button
                        id={`variant-sel-${v.sku}`}
                        key={v.sku}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1); // reset qty on switch
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border-2 transition-all flex flex-col cursor-pointer ${
                          selectedVariant.sku === v.sku
                            ? 'border-red-600 bg-red-950/20 text-white shadow-md'
                            : 'border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <span className="font-semibold">{v.size || 'Standard'}</span>
                        {v.color && <span className="text-[10px] text-zinc-500 font-light">{v.color}</span>}
                        <span className="text-[10px] font-bold mt-1 text-white">৳{v.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status details */}
              <div className="mt-2 text-xs flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                  selectedVariant.stock <= 0 
                    ? 'bg-rose-950/80 text-rose-400' 
                    : selectedVariant.stock <= product.lowStockThreshold 
                      ? 'bg-amber-950/80 text-amber-400 animate-pulse' 
                      : 'bg-emerald-950/80 text-emerald-400'
                }`}>
                  {selectedVariant.stock <= 0 
                    ? 'Out of Stock' 
                    : selectedVariant.stock <= product.lowStockThreshold 
                      ? 'Low Stock Alert' 
                      : 'In Stock'
                  }
                </span>
                <span className="text-zinc-500 font-medium">
                  ({selectedVariant.stock} items available)
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-zinc-900">
              {/* Quantity selectors */}
              {selectedVariant.stock > 0 && (
                <div className="flex items-center justify-between border border-zinc-800 rounded-xl px-2 py-1 select-none shrink-0 sm:w-32">
                  <button
                    id="qty-dec-btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white">{quantity}</span>
                  <button
                    id="qty-inc-btn"
                    onClick={handleIncrement}
                    disabled={quantity >= selectedVariant.stock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Add and Wishlist Buttons */}
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  id="modal-add-to-cart"
                  disabled={selectedVariant.stock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold bg-red-600 hover:bg-red-750 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-lg shadow-red-950/25 rounded-xl text-white active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add To Cart</span>
                </button>

                <button
                  id="modal-wishlist-toggle"
                  onClick={() => toggleWishlist(product)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-zinc-400'}`} />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Transactions • 100% Guaranteed Return Policy • Fast Courier Dispatch</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  function currentPrice() {
    return product.salePrice || product.originalPrice;
  }
};
