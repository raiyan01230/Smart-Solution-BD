import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { FlashDeals } from './components/FlashDeals';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Footer } from './components/Footer';

import { Product, PRODUCTS as DEFAULT_PRODUCTS } from './data/products';
import {
  fetchProducts,
  fetchPromoCodes,
  fetchStoreSettings,
  fetchCategories,
  PromoCode,
  StoreSettings,
  CategoryItem,
  DEFAULT_CATEGORIES,
  DEFAULT_PROMOS,
  DEFAULT_SETTINGS
} from './services/dbService';

import { useTheme } from './hooks/useTheme';
import { useHashRoute } from './hooks/useHashRoute';

// Code-split sub-pages for ultra-fast instant homepage loading
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const TrackingPage = lazy(() => import('./pages/TrackingPage').then(m => ({ default: m.TrackingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { route, navigate } = useHashRoute();

  // Instant State Initialization (Zero-Wait Local Hydration)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_products') : null;
      if (local !== null) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_PRODUCTS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_categories') : null;
      if (local !== null) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>(() => {
    try {
      const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_promos') : null;
      if (local !== null) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_PROMOS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_settings') : null;
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Cart State persistent in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_cart') || localStorage.getItem('shm_cart') || localStorage.getItem('ssbd_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Applied Promo State
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(() => {
    try {
      const saved = localStorage.getItem('smart_applied_promo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smart_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem('smart_applied_promo', JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem('smart_applied_promo');
      }
    } catch {}
  }, [appliedPromo]);

  // Background Data Sync (Stale-While-Revalidate - does not block initial load)
  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      try {
        const [pData, prData, stData, catData] = await Promise.all([
          fetchProducts(),
          fetchPromoCodes(),
          fetchStoreSettings(),
          fetchCategories(),
        ]);
        if (!isMounted) return;
        if (Array.isArray(pData)) setProducts(pData);
        if (Array.isArray(prData)) setAvailablePromos(prData);
        if (stData) setStoreSettings(stData);
        if (Array.isArray(catData)) setCategories(catData);
      } catch (err) {
        console.warn('Background sync completed with fallbacks:', err);
      }
    }
    syncData();

    const handleDataUpdate = () => {
      syncData();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (
        e.key === 'smart_products' ||
        e.key === 'smart_categories' ||
        e.key === 'smart_promos' ||
        e.key === 'smart_settings'
      ) {
        syncData();
      }
    };

    window.addEventListener('categories_updated', handleDataUpdate);
    window.addEventListener('products_updated', handleDataUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('categories_updated', handleDataUpdate);
      window.removeEventListener('products_updated', handleDataUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const categoryNames = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return undefined;
    return ['All Products', ...categories.map((c) => c.name)];
  }, [categories]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Products' ||
        product.category === selectedCategory ||
        (selectedCategory === 'Watches' && (product.category === "Watch's" || product.category === 'Watches')) ||
        (selectedCategory === 'Gadgets and Accessories' && (product.category === 'Humidifier' || product.category === 'Keyboard' || product.category === 'Microphone'));

      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCartItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      const existingIndex = safePrev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...safePrev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...safePrev, { product, quantity }];
    });

    setIsCartDrawerOpen(true);
  };

  const handleBuyNow = (product: Product, quantity: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCartItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      const existingIndex = safePrev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...safePrev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [{ product, quantity }];
    });

    navigate('/checkout');
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      return safePrev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prevItems) => {
      const safePrev = Array.isArray(prevItems) ? prevItems : [];
      return safePrev.filter((item) => item.product.id !== productId);
    });
  };

  const totalCartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item?.quantity || 1), 0)
    : 0;

  // Check Maintenance Mode
  if (storeSettings.maintenance_mode && route.path !== '/admin') {
    return (
      <Suspense fallback={null}>
        <MaintenancePage message={storeSettings.maintenance_message} navigate={navigate} />
      </Suspense>
    );
  }

  // Render Page Content according to Hash Route
  const renderContent = () => {
    switch (route.path) {
      case '/product':
        return (
          <ProductPage
            productId={route.params.id}
            products={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            navigate={navigate}
          />
        );

      case '/cart':
        return (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            availablePromos={availablePromos}
            appliedPromo={appliedPromo}
            setAppliedPromo={setAppliedPromo}
            navigate={navigate}
          />
        );

      case '/checkout':
        return (
          <CheckoutPage
            cartItems={cartItems}
            availablePromos={availablePromos}
            appliedPromo={appliedPromo}
            setAppliedPromo={setAppliedPromo}
            storeSettings={storeSettings}
            navigate={navigate}
            onClearCart={() => setCartItems([])}
          />
        );

      case '/track':
        return <TrackingPage orderIdParam={route.params.id} navigate={navigate} />;

      case '/about':
        return <AboutPage navigate={navigate} storeSettings={storeSettings} />;

      case '/contact':
        return <ContactPage navigate={navigate} storeSettings={storeSettings} />;

      case '/faq':
        return <FAQPage navigate={navigate} />;

      case '/admin':
        return <AdminPage navigate={navigate} />;

      case '/':
      default:
        return (
          <main>
            {/* Dynamic Category Nav Bar */}
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              categories={categoryNames}
            />

            {/* FLASH DEALS */}
            {selectedCategory === 'All Products' && !searchQuery && (
              <FlashDeals
                products={products}
                onSelectProduct={(p) => navigate(`/product/${p.id}`)}
                onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
              />
            )}

            {/* Main Product Grid */}
            <ProductGrid
              products={filteredProducts}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectProduct={(p) => navigate(`/product/${p.id}`)}
              onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
              onBuyNow={(p, e) => handleBuyNow(p, 1, e)}
            />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-red-500 selection:text-white transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartDrawerOpen(true)}
          darkMode={isDark}
          onToggleTheme={toggleTheme}
          navigate={navigate}
          currentPath={route.path}
          storeName={storeSettings.store_name}
        />

        {/* Page Content with Fast Suspense Fallback */}
        <Suspense fallback={
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {renderContent()}
        </Suspense>
      </div>

      {/* Footer */}
      <Footer navigate={navigate} storeSettings={storeSettings} />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Quick Product Detail Modal */}
      <ProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
      />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartDrawerOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
}
