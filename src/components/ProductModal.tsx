import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, CheckCircle2, Minus, Plus } from 'lucide-react';
import { Product } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 sm:p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Image Showcase */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 flex items-center justify-center aspect-square border border-slate-200/60 dark:border-slate-700/50">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>

          {/* Details & Specs */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full mb-2">
                {product.category}
              </span>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {product.rating}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {product.reviewsCount} customer reviews
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-black text-red-600 dark:text-red-500 font-mono">
                  ৳{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    ৳{product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-sm">
                    Save ৳{product.originalPrice - product.price}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* Specs Table */}
              <div className="space-y-1.5 mb-5 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Key Specifications:
                </p>
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>

              {/* Delivery info tags */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-5">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-red-600" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>100% Original Product</span>
                </div>
              </div>
            </div>

            {/* Quantity & CTA */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-bold font-mono text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl border-2 border-red-600 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
