import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { FlashDeals } from './components/FlashDeals';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Footer } from './components/Footer';

import { Product } from './data/products';
import {
  fetchProducts,
  fetchPromoCodes,
  fetchStoreSettings,
  fetchCategories,
  PromoCode,
  StoreSettings,
  CategoryItem
} from './services/dbService';

import { useTheme } from './hooks/useTheme';
import { useHashRoute } from './hooks/useHashRoute';

// Pages
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackingPage } from './pages/TrackingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminPage } from './pages/AdminPage';
import { MaintenancePage } from './pages/MaintenancePage';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { route, navigate } = useHashRoute();

  // Storefront Data
  const [products, setProducts] = useState<Product[]>([]);
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    inside_dhaka_fee: 70,
    outside_dhaka_fee: 120,
    store_name: 'Smart Solution BD',
    whatsapp_number: '8801700000000',
    hotline: '+880 1700-000000',
    email: 'support@smartsolutionbd.com',
    facebook_url: 'https://www.facebook.com/profile.php?id=61594778919594',
    about_title: 'Best Gadget Shop in Bangladesh',
    about_p1: 'Welcome to Smart Solution BD, the most trusted destination for original smartwatches in BD. We provide the latest tech gear, including Kieslect, Amazfit, Huawei, and premium ANC earbuds. Our goal is to ensure you get 100% authentic products with official warranty.',
    about_p2: 'Looking for the best smartwatch price in Bangladesh 2026? We offer competitive pricing, fast home delivery, and a seamless shopping experience. Whether you need gaming headphones or waterproof fitness trackers, our catalog is updated daily.',
    maintenance_mode: false,
    maintenance_message: 'Smart Solution BD is currently undergoing scheduled system updates. We will be back online shortly!',
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Cart State persistent in localStorage (Defensive parsing)
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
    localStorage.setItem('smart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('smart_applied_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('smart_applied_promo');
    }
  }, [appliedPromo]);

  // Initial Data Load
  useEffect(() => {
    async function initData() {
      const [pData, prData, stData, catData] = await Promise.all([
        fetchProducts(),
        fetchPromoCodes(),
        fetchStoreSettings(),
        fetchCategories(),
      ]);
      setProducts(Array.isArray(pData) ? pData : []);
      setAvailablePromos(Array.isArray(prData) ? prData : []);
      if (stData) setStoreSettings(stData);
      setCategories(Array.isArray(catData) ? catData : []);
    }
    initData();

    async function updateCats() {
      const catData = await fetchCategories();
      setCategories(Array.isArray(catData) ? catData : []);
    }

    window.addEventListener('categories_updated', updateCats);
    return () => window.removeEventListener('categories_updated', updateCats);
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
    return <MaintenancePage message={storeSettings.maintenance_message} navigate={navigate} />;
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

            {/* FLASH DEALS (Visible on All Products view with no search filter) */}
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

        {/* Page Content */}
        {renderContent()}
      </div>

      {/* Footer */}
      <Footer navigate={navigate} storeSettings={storeSettings} />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Quick Product Detail Modal (for quick preview) */}
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
