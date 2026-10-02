import React, { useState, useEffect } from 'react';
import { Zap, ShoppingCart } from 'lucide-react';
import { Product } from '../data/products';

interface FlashDealsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  // Live ticking countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 13,
    minutes: 3,
    seconds: 53,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  const flashDealProducts = products.filter((p) => p.isFlashDeal);

  if (flashDealProducts.length === 0) return null;

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Flash Deals Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-red-600 dark:text-red-500 uppercase">
            FLASH DEALS
          </h2>
        </div>

        {/* Live Timer Box */}
        <div className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-mono font-bold tracking-wider shadow-xs">
          <span>{formatTime(timeLeft.hours)}</span>
          <span>:</span>
          <span>{formatTime(timeLeft.minutes)}</span>
          <span>:</span>
          <span>{formatTime(timeLeft.seconds)}</span>
        </div>
      </div>

      {/* Horizontal Scroll / Compact Grid of Flash Deals */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
        {flashDealProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="w-36 sm:w-44 shrink-0 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/60 hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Image container */}
            <div className="relative aspect-4/3 w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden mb-2.5 flex items-center justify-center p-1">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback for broken image
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                }}
              />
              {/* Discount Tag */}
              {product.originalPrice && (
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col flex-1 justify-between">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {product.name}
              </h3>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-red-600 dark:text-red-500 font-mono">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-mono">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => onAddToCart(product, e)}
                  className="p-1 rounded-full bg-red-50 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                  title="Add to cart"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
