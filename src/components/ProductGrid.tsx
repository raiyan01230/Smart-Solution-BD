import React from 'react';
import { Product } from '../data/products';
import { ProductCard } from './ProductCard';
import { Sparkles, PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  searchQuery,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Grid Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
            {selectedCategory === 'All Products' ? 'All Gadgets & Products' : selectedCategory}
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          Showing {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <PackageSearch className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {searchQuery ? 'No gadgets found' : 'No products available'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchQuery
              ? `We couldn't find anything matching "${searchQuery}". Try searching for earbuds, watch, microphone, or neckband.`
              : 'There are currently no products in this section. New gadgets will be available soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}
    </section>
  );
};
