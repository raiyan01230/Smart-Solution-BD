import React from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: string[];
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  const catList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="bg-slate-100/70 dark:bg-slate-900/50 py-3 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs sm:text-sm">
          {catList.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20 scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
