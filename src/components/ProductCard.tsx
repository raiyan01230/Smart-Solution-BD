import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
    >
      {/* HOT Badge */}
      {product.isHot && (
        <span className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
          HOT
        </span>
      )}

      {/* Product Image with Google High-Rank SEO Alt & Title */}
      <div className="relative aspect-4/3 w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl overflow-hidden p-2 flex items-center justify-center mb-3">
        <img
          src={product.image}
          alt={`${product.name} - ${product.category} Price in BD ৳${product.price} | Smart Solution BD`}
          title={`${product.name} - ${product.category} in Bangladesh`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
          }}
        />
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1 mb-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.rating}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.reviewsCount})
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base sm:text-lg font-black text-red-600 dark:text-red-500 font-mono">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-mono">
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="py-1.5 px-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>

            <button
              onClick={(e) => onBuyNow(product, e)}
              className="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
