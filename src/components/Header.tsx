import React, { useState } from 'react';
import { Search, Moon, Sun, ShoppingBag, PackageCheck, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  navigate: (path: string) => void;
  currentPath: string;
  storeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  darkMode,
  onToggleTheme,
  navigate,
  currentPath,
  storeName = 'Smart Solution BD',
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Name: Smart Solution BD */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden cursor-pointer"
          >
            <img
              src="/logo.png"
              alt={storeName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-500/80 shadow-md group-hover:scale-105 transition-transform shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-red-600 dark:text-red-500 uppercase leading-none">
                {storeName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                Smart Products, Better Living
              </span>
            </div>
          </a>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-4 relative">
            <div
              className={`relative flex items-center w-full rounded-full bg-slate-100 dark:bg-slate-800 border transition-all ${
                isSearchFocused
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search gadgets, watches, audio..."
                className="w-full py-2 pl-3.5 pr-9 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden rounded-full"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-8 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <div className="absolute right-3 p-1 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Action Controls: Theme Switch, Track & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {/* TRACK Button */}
            <button
              onClick={() => navigate('/track')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                currentPath.startsWith('/track')
                  ? 'bg-red-600'
                  : 'bg-[#1E293B] hover:bg-[#0F172A]'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">TRACK</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3.5 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-red-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
