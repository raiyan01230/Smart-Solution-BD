import React, { useState, useEffect } from 'react';
import {
  fetchProducts, saveProduct, deleteProduct, resetProductsToDefault, syncAllProductsToSupabase,
  fetchOrders, updateOrderStatus,
  fetchPromoCodes, savePromoCode,
  fetchAdvertisements, saveAdvertisement, deleteAdvertisement,
  fetchStoreSettings, saveStoreSettings,
  fetchCategories, saveCategory, deleteCategory,
  uploadImageToSupabase,
  Order, PromoCode, Advertisement, StoreSettings, CategoryItem
} from '../services/dbService';
import { Product } from '../data/products';
import {
  updateSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  IS_SUPABASE_CONFIGURED,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from '../lib/supabase';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import {
  Shield, Package, ShoppingBag, Tag, Settings, LogOut,
  Plus, Edit, Trash2, Search, Upload, CheckCircle2, AlertCircle, RefreshCw, Key,
  BarChart2, Image, Layers, Wrench, Phone, MessageCircle, Printer, Eye, Lock, Copy, Check, X,
  Database, Globe, ArrowUpRight
} from 'lucide-react';

export const AdminPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  // Username & Password Auth State (NO email field displayed on login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('smart_admin_logged') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab across 13 Admin Sections
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'promos' |
    'categories' | 'ads' | 'settings' | 'maintenance' | 'images' |
    'info' | 'security' | 'database'
  >('overview');

  // Supabase Configuration Form State
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(SUPABASE_URL || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(SUPABASE_ANON_KEY || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // In-App Product Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
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

  const [loading, setLoading] = useState(true);

  // Category Create Form State
  const [newCatName, setNewCatName] = useState('');

  // Inline Product Modal Category Creator State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Delete Category Confirmation Modal State (Replaces window.confirm)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; count: number } | null>(null);

  // Search Filters inside Admin
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [productQuery, setProductQuery] = useState('');

  // Edit Modals & Drawers State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPromo, setEditingPromo] = useState<Partial<PromoCode> | null>(null);
  const [editingAd, setEditingAd] = useState<Partial<Advertisement> | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Security Credentials Update
  const [newAdminUsername, setNewAdminUsername] = useState('admin');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  async function loadAdminData() {
    setLoading(true);
    const [pData, oData, prData, adData, stData, catData] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchPromoCodes(),
      fetchAdvertisements(),
      fetchStoreSettings(),
      fetchCategories(),
    ]);
    setProducts(pData);
    setOrders(oData);
    setPromos(prData);
    setAds(adData);
    setSettings(stData);
    setCategories(catData);
    setLoading(false);
  }

  // Login handler using Username & Password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('smart_admin_user') || 'admin';
    const storedPass = localStorage.getItem('smart_admin_pass') || 'admin123';

    if (username.trim() === storedUser && password === storedPass) {
      localStorage.setItem('smart_admin_logged', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_admin_logged');
    setIsAuthenticated(false);
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim() || newAdminPassword.length < 6) {
      alert('Username is required and password must be at least 6 characters.');
      return;
    }
    localStorage.setItem('smart_admin_user', newAdminUsername.trim());
    localStorage.setItem('smart_admin_pass', newAdminPassword);
    setSecuritySuccess('Admin credentials updated successfully!');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catItem: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: true,
    };

    await saveCategory(catItem);
    setNewCatName('');
    loadAdminData();
  };

  const handleDeleteCategoryClick = (id: string, name: string) => {
    const associatedCount = products.filter(
      (p) => p.category === name || p.category.toLowerCase() === name.toLowerCase() || p.category === id
    ).length;
    setCategoryToDelete({ id, name, count: associatedCount });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;

    // Optimistically update local UI state immediately
    setCategories((prev) => prev.filter((c) => c.id !== id && c.name.toLowerCase() !== name.toLowerCase()));
    setCategoryToDelete(null);

    await deleteCategory(id, name);
    await loadAdminData();
  };

  // Product CRUD (Supports Creating New Category inline)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Product Name and Price are required.');
      return;
    }

    let finalCategory = (editingProduct.category as string) || (categories[0]?.name || 'Earbuds');

    // Check if admin entered a brand new category inline
    if (isCreatingNewCategory && newCategoryInput.trim()) {
      finalCategory = newCategoryInput.trim();
      const newCatObj: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: finalCategory,
        slug: finalCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        is_active: true,
      };
      await saveCategory(newCatObj);
    }

    const primaryImg = editingProduct.image || editingProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
    const galleryList = editingProduct.images && editingProduct.images.length > 0
      ? editingProduct.images.filter(Boolean).slice(0, 10)
      : [primaryImg];

    const newProd: Product = {
      id: editingProduct.id || `p-${Date.now()}`,
      name: editingProduct.name,
      category: finalCategory,
      price: Number(editingProduct.price),
      originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
      image: primaryImg,
      images: galleryList,
      isFlashDeal: Boolean(editingProduct.isFlashDeal),
      isHot: Boolean(editingProduct.isHot),
      rating: editingProduct.rating || 4.8,
      reviewsCount: editingProduct.reviewsCount || 10,
      inStock: (editingProduct.stock_quantity ?? 50) > 0,
      stock_quantity: Number(editingProduct.stock_quantity ?? 50),
      description: editingProduct.description || '',
      specs: editingProduct.specs || { 'Warranty': '7 Days Replacement' },
    };

    await saveProduct(newProd);
    setEditingProduct(null);
    setIsCreatingNewCategory(false);
    setNewCategoryInput('');
    loadAdminData();
  };

  // In-App Product Delete Handlers (No window.confirm)
  const handleDeleteProductClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id } = productToDelete;
    setProducts((prev) => prev.filter((p) => String(p.id).trim() !== String(id).trim()));
    setProductToDelete(null);

    await deleteProduct(id);
    await loadAdminData();
  };

  // Supabase Dashboard Handlers
  const handleTestSupabaseConnection = async () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setConnectionTestResult({ success: false, message: 'Please enter both Supabase Project URL and Anon Key.' });
      return;
    }
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    const res = await testSupabaseConnection(supabaseUrlInput, supabaseKeyInput);
    setIsTestingConnection(false);
    setConnectionTestResult(res);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) return;
    updateSupabaseCredentials(supabaseUrlInput.trim(), supabaseKeyInput.trim());
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseCredentials();
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncAllProductsToSupabase();
    setIsSyncing(false);
    if (res.success) {
      setSyncResult({ success: true, message: `Successfully synced ${res.count} products to your cloud database!` });
    } else {
      setSyncResult({ success: false, message: res.error || 'Sync failed. Verify tables exist in Supabase.' });
    }
    setTimeout(() => setSyncResult(null), 5000);
  };

  const handleResetCatalog = async () => {
    const res = await resetProductsToDefault();
    setProducts(res);
    setSyncResult({ success: true, message: 'Products restored to default demo catalog.' });
    setTimeout(() => setSyncResult(null), 3500);
  };

  // Image File Upload to Supabase
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await uploadImageToSupabase(file);
    setUploadingImage(false);

    if (url) {
      if (editingProduct) {
        const existing = editingProduct.images || (editingProduct.image ? [editingProduct.image] : []);
        const updated = [...existing, url].slice(0, 10);
        setEditingProduct((prev) => ({
          ...prev,
          image: updated[0] || url,
          images: updated,
        }));
      } else if (editingAd) {
        setEditingAd((prev) => ({ ...prev, image: url }));
      }
    } else {
      alert('Image upload failed. You can paste an image URL instead.');
    }
  };

  // Order Status Change
  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    loadAdminData();
  };

  // Save Promo Code
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo?.code || !editingPromo?.discount_value) return;

    const promo: PromoCode = {
      id: editingPromo.id || `promo-${Date.now()}`,
      code: editingPromo.code.toUpperCase(),
      discount_type: editingPromo.discount_type || 'percentage',
      discount_value: Number(editingPromo.discount_value),
      min_order_amount: Number(editingPromo.min_order_amount || 0),
      usage_limit: Number(editingPromo.usage_limit || 100),
      usage_count: editingPromo.usage_count || 0,
      is_active: editingPromo.is_active ?? true,
    };

    await savePromoCode(promo);
    setEditingPromo(null);
    loadAdminData();
  };

  // Save Advertisement
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd?.title || !editingAd?.image) return;

    const adItem: Advertisement = {
      id: editingAd.id || `ad-${Date.now()}`,
      title: editingAd.title,
      description: editingAd.description || '',
      image: editingAd.image,
      destination_url: editingAd.destination_url || '#/',
      position: editingAd.position || 'homepage_hero',
      is_active: editingAd.is_active ?? true,
    };

    await saveAdvertisement(adItem);
    setEditingAd(null);
    loadAdminData();
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings(settings);
    alert('Store Settings & Information Saved Successfully!');
    loadAdminData();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Smart Solution BD Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Protected Administrator Console (`/#/admin`)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl transition-colors shadow-md cursor-pointer"
            >
              Log In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Overview Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.grand_total : 0), 0);
  const lowStockCount = products.filter((p) => (p.stock_quantity ?? 50) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stock_quantity ?? 50) === 0).length;

  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderQuery.toLowerCase()) ||
      o.customer_phone.includes(orderQuery);

    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(productQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Smart Solution BD Console
              </h1>
              <button
                type="button"
                onClick={() => setActiveTab('database')}
                className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1.5 ${
                  IS_SUPABASE_CONFIGURED
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                }`}
                title="Click to configure Cloud Supabase database"
              >
                <span className={`w-2 h-2 rounded-full ${IS_SUPABASE_CONFIGURED ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{IS_SUPABASE_CONFIGURED ? 'SUPABASE CLOUD ACTIVE' : 'LOCAL DEMO (CONNECT SUPABASE)'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct Route Management Dashboard (`/#/admin`)
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* 13 Admin Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'database', label: 'Cloud Supabase Database', icon: Database },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'inventory', label: `Inventory (${lowStockCount} low)`, icon: AlertCircle },
          { id: 'promos', label: `Promos (${promos.length})`, icon: Tag },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'ads', label: `Ads (${ads.length})`, icon: Image },
          { id: 'settings', label: 'Website Settings', icon: Settings },
          { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
          { id: 'images', label: 'Image Manager', icon: Upload },
          { id: 'info', label: 'Store Information', icon: Phone },
          { id: 'security', label: 'Security & Auth', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- SECTION 1: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block">Total Revenue (COD)</span>
              <span className="text-xl sm:text-2xl font-black text-red-600 font-mono mt-1 block">
                ৳{totalRevenue}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block">Total Orders</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                {orders.length}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block">Active Products</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                {products.length}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold block">Low Stock Alerts</span>
              <span className={`text-xl sm:text-2xl font-black font-mono mt-1 block ${
                lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {lowStockCount}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white mb-4">
              Recent Orders
            </h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div>
                    <span className="font-mono font-bold text-red-600 mr-2">#{o.id}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{o.customer_name}</span>
                    <span className="text-slate-400 block text-[11px]">{o.customer_phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black block">৳{o.grand_total}</span>
                    <span className="text-[10px] font-bold text-red-600 uppercase">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION 2: ORDERS MANAGEMENT --- */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Customer Orders Management
            </h2>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Search Order ID or Phone..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />

              <button
                onClick={loadAdminData}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer Info</th>
                  <th className="py-3 px-2">Items & Zone</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No customer orders found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-mono font-black text-red-600">
                        #{ord.id}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(ord.date).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-bold block text-slate-800 dark:text-slate-200">
                          {ord.customer_name}
                        </span>
                        <div className="flex gap-2 items-center mt-0.5">
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="font-mono text-red-600 hover:underline flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.customer_phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${ord.customer_phone.replace(/^0/, '880')}?text=${encodeURIComponent(
                              `Hello ${ord.customer_name}, regarding your Smart Solution BD order #${ord.id}...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            <MessageCircle className="w-3 h-3 fill-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-xs">
                          {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {ord.delivery_area === 'dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳120)'}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-mono font-black text-slate-900 dark:text-white">
                        ৳{ord.grand_total}
                      </td>

                      <td className="py-3 px-2">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold cursor-pointer"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => setPrintOrder(ord)}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SECTION 3: PRODUCTS MANAGEMENT --- */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Catalog Products Management
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search products..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <button
                onClick={() => {
                  setEditingProduct({ category: categories[0]?.name || 'Earbuds', inStock: true, stock_quantity: 50, images: [] });
                  setIsCreatingNewCategory(false);
                  setNewCategoryInput('');
                }}
                className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-3 items-center justify-between"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Category: <span className="font-extrabold text-red-600">{p.category}</span> · Stock: {p.stock_quantity ?? 50}
                  </p>
                  <p className="text-xs font-mono font-black text-red-600">
                    ৳{p.price} {p.originalPrice && <span className="line-through text-slate-400 text-[10px]">৳{p.originalPrice}</span>}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsCreatingNewCategory(false);
                      setNewCategoryInput('');
                    }}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProductClick(p.id, p.name)}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600 cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 4: INVENTORY MANAGEMENT --- */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Live Inventory & Stock Control
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 block font-bold">Total Inventory Count</span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {products.reduce((acc, p) => acc + (p.stock_quantity ?? 50), 0)} items
              </span>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-amber-700 dark:text-amber-400 block font-bold">Low Stock Warning (&le;5)</span>
              <span className="text-lg font-black font-mono text-amber-800 dark:text-amber-300">
                {lowStockCount} products
              </span>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-xs text-red-700 dark:text-red-400 block font-bold">Out of Stock (0)</span>
              <span className="text-lg font-black font-mono text-red-800 dark:text-red-300">
                {outOfStockCount} products
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <img src={p.image} className="w-8 h-8 object-contain bg-white dark:bg-slate-900 rounded p-0.5 border" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                    <span className="text-slate-400 text-[10px]">{p.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (p.stock_quantity ?? 50) > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(p.stock_quantity ?? 50) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>

                  <input
                    type="number"
                    value={p.stock_quantity ?? 50}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      saveProduct({ ...p, stock_quantity: qty, inStock: qty > 0 });
                      loadAdminData();
                    }}
                    className="w-20 p-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-center bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 5: PROMO CODES --- */}
      {activeTab === 'promos' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">
              Manage Store Promo Codes
            </h2>
            <button
              onClick={() => setEditingPromo({ discount_type: 'percentage', is_active: true, min_order_amount: 500, usage_limit: 100 })}
              className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promos.map((pr) => (
              <div key={pr.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-black text-sm text-red-600 block">{pr.code}</span>
                  <span className="text-slate-500">
                    {pr.discount_type === 'percentage' ? `${pr.discount_value}% OFF` : `৳${pr.discount_value} OFF`}
                    {' · Min Order: ৳'}{pr.min_order_amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${pr.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {pr.is_active ? 'Active' : 'Disabled'}
                  </span>
                  <button onClick={() => setEditingPromo(pr)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 6: CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Product Categories Management</h2>
              <p className="text-xs text-slate-500">Create, view, and delete store categories dynamically.</p>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleSaveCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New Category Name (e.g. Smart Watch)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => {
              const productCount = products.filter(
                (p) => p.category === c.name || p.category.toLowerCase() === c.name.toLowerCase()
              ).length;

              return (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
                  <div>
                    <span className="text-slate-900 dark:text-white font-extrabold text-sm block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {productCount} product(s) linked
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategoryClick(c.id, c.name)}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SECTION 7: ADVERTISEMENTS --- */}
      {activeTab === 'ads' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Homepage Advertisements & Hero Banners</h2>
            <button
              onClick={() => setEditingAd({ position: 'homepage_hero', is_active: true })}
              className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex justify-between items-center gap-3 text-xs">
                <img src={ad.image} className="w-20 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{ad.title}</h4>
                  <p className="text-slate-400 text-[11px]">{ad.description}</p>
                </div>
                <button onClick={() => deleteAdvertisement(ad.id).then(loadAdminData)} className="p-1.5 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 8: WEBSITE SETTINGS --- */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Store & Delivery Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs max-w-xl">
            <div>
              <label className="block font-bold mb-1">Inside Dhaka Delivery Fee (৳)</label>
              <input type="number" value={settings.inside_dhaka_fee} onChange={(e) => setSettings({ ...settings, inside_dhaka_fee: Number(e.target.value) })} className="w-full p-2 rounded-xl border dark:bg-slate-800 font-mono" />
            </div>
            <div>
              <label className="block font-bold mb-1">Outside Dhaka Delivery Fee (৳)</label>
              <input type="number" value={settings.outside_dhaka_fee} onChange={(e) => setSettings({ ...settings, outside_dhaka_fee: Number(e.target.value) })} className="w-full p-2 rounded-xl border dark:bg-slate-800 font-mono" />
            </div>
            <div>
              <label className="block font-bold mb-1">Official Facebook URL</label>
              <input type="text" value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} className="w-full p-2 rounded-xl border dark:bg-slate-800 font-mono" />
            </div>
            <div>
              <label className="block font-bold mb-1">Footer About Title</label>
              <input type="text" value={settings.about_title} onChange={(e) => setSettings({ ...settings, about_title: e.target.value })} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
            </div>
            <div>
              <label className="block font-bold mb-1">Footer About Text</label>
              <textarea rows={3} value={settings.about_p1} onChange={(e) => setSettings({ ...settings, about_p1: e.target.value })} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
            </div>
            <button type="submit" className="py-2.5 px-6 bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer">Save All Settings</button>
          </form>
        </div>
      )}

      {/* --- SECTION 9: MAINTENANCE MODE --- */}
      {activeTab === 'maintenance' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-xl">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Maintenance Mode Control</h2>
          <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border font-bold text-xs cursor-pointer">
            <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })} className="w-4 h-4" />
            <span>Enable Public Maintenance Mode</span>
          </label>

          <div>
            <label className="block text-xs font-bold mb-1">Maintenance Notice Message</label>
            <textarea rows={3} value={settings.maintenance_message} onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })} className="w-full p-2 text-xs rounded-xl border dark:bg-slate-800" />
          </div>

          <button onClick={handleSaveSettings} className="py-2.5 px-6 bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer">
            Update Maintenance Status
          </button>
        </div>
      )}

      {/* --- SECTION 10: IMAGE MANAGER --- */}
      {activeTab === 'images' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">Supabase Storage Image Gallery</h2>
          <label className="inline-flex px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Upload New Image</span>
            <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3">
            {products.map((p) => (
              <div key={p.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border text-center space-y-1">
                <img src={p.image} className="w-full aspect-square object-contain bg-white dark:bg-slate-900 rounded" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 11: STORE INFO (FULLY EDITABLE FORM) --- */}
      {activeTab === 'info' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl text-xs">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">
              Editable Store Information & Social Settings
            </h2>
            <p className="text-slate-500 mt-1">
              Updates made here dynamically sync with the Header, Footer, About Us page, Contact Us page, and Google SEO Knowledge Panel schema.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Store Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Customer Hotline <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={settings.hotline}
                  onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Official WhatsApp Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Support Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Official Facebook Page URL</label>
              <input
                type="text"
                required
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">About Us Title</label>
              <input
                type="text"
                value={settings.about_title}
                onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">About Us Story Paragraph 1</label>
              <textarea
                rows={3}
                value={settings.about_p1}
                onChange={(e) => setSettings({ ...settings, about_p1: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">About Us Story Paragraph 2</label>
              <textarea
                rows={3}
                value={settings.about_p2}
                onChange={(e) => setSettings({ ...settings, about_p2: e.target.value })}
                className="w-full p-2.5 rounded-xl border dark:bg-slate-800 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs rounded-xl cursor-pointer shadow-md transition-all"
            >
              Save Store Information Dynamic Updates
            </button>
          </form>
        </div>
      )}

      {/* --- SECTION 12: ADMIN SECURITY --- */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-md text-xs">
          <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">Admin Credentials Management</h2>
          <form onSubmit={handleUpdateSecurity} className="space-y-3">
            <div>
              <label className="block font-bold mb-1">Update Admin Username</label>
              <input type="text" required value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
            </div>
            <div>
              <label className="block font-bold mb-1">New Password (&ge;6 chars)</label>
              <input type="password" required value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
            </div>
            {securitySuccess && <p className="text-emerald-600 font-bold">{securitySuccess}</p>}
            <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer">
              Update Admin Login Credentials
            </button>
          </form>
        </div>
      )}

      {/* --- SECTION 13: CLOUD SUPABASE DATABASE & KEYS --- */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Supabase Cloud Database Settings
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your free Supabase database directly from this website. No backend server or rebuild required!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                  IS_SUPABASE_CONFIGURED
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${IS_SUPABASE_CONFIGURED ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {IS_SUPABASE_CONFIGURED ? 'Active Cloud Database' : 'Local Browser Cache (Offline)'}
                </span>
              </div>
            </div>

            {/* Explanation banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2 mb-6 text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                💡 Why connect Supabase on GitHub Pages?
              </p>
              <p className="leading-relaxed">
                GitHub Pages is a static host without a backend server. By connecting your Supabase project, all products you add, edit, or delete, as well as customer orders and promo codes, are stored in the cloud. Changes you make in this admin panel will immediately update for all customers nationwide!
              </p>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSaveSupabase} className="space-y-4 max-w-2xl text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Supabase Anon (Public) Key
                </label>
                <textarea
                  required
                  rows={3}
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px] focus:border-red-500 focus:outline-hidden resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys &rarr; "anon public"
                </p>
              </div>

              {/* Test connection alert */}
              {connectionTestResult && (
                <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                  connectionTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
                }`}>
                  {connectionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span className="font-semibold text-xs leading-relaxed">{connectionTestResult.message}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestSupabaseConnection}
                  disabled={isTestingConnection}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl transition-colors cursor-pointer shadow-md shadow-red-600/20"
                >
                  Save & Connect Database
                </button>

                {IS_SUPABASE_CONFIGURED && (
                  <button
                    type="button"
                    onClick={handleDisconnectSupabase}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-red-200 dark:border-red-900"
                  >
                    Disconnect & Switch to Local
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sync & Cloud Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Data Synchronization & Seeding
            </h3>
            <p className="text-xs text-slate-500">
              Easily upload your current catalog to Supabase or pull latest cloud data.
            </p>

            {syncResult && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                syncResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300'
              }`}>
                {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                <span>{syncResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncing || !IS_SUPABASE_CONFIGURED}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  IS_SUPABASE_CONFIGURED
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title={!IS_SUPABASE_CONFIGURED ? 'Connect Supabase first to push data' : 'Upload local products to Supabase'}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Syncing...' : `Upload All Local Products (${products.length}) to Supabase`}</span>
              </button>

              <button
                type="button"
                onClick={loadAdminData}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh & Pull Cloud Products</span>
              </button>

              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Default 5 Products</span>
              </button>
            </div>
          </div>

          {/* 1-Click SQL Setup Guide & Schema */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Supabase SQL Setup Script</span>
                  <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">1-Click Ready</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Run this in your Supabase SQL Editor to create tables for products, categories, orders, and promo codes with public RLS enabled.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const sqlScript = `-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_flash_deal BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 4.8,
  reviews_count NUMERIC DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity NUMERIC DEFAULT 50,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_total NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  promo_discount NUMERIC DEFAULT 0,
  promo_code TEXT,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Placed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  usage_limit NUMERIC DEFAULT 100,
  usage_count NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Row Level Security Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);`;

                  navigator.clipboard.writeText(sqlScript);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
              <pre className="leading-relaxed">
{`-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_flash_deal BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 4.8,
  reviews_count NUMERIC DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity NUMERIC DEFAULT 50,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_total NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  promo_discount NUMERIC DEFAULT 0,
  promo_code TEXT,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Placed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Full RLS for Public Store
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">
                Delete Product?
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{productToDelete.name}"</strong>? This will remove it from your store and database.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded-xl cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CATEGORY CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">
                Delete Category?
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete category <strong className="text-slate-900 dark:text-white">"{categoryToDelete.name}"</strong>?
            </p>

            {categoryToDelete.count > 0 && (
              <p className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 font-medium">
                ⚠️ {categoryToDelete.count} product(s) linked to this category will be re-assigned to "Uncategorized".
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded-xl cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Order Details #{selectedOrderDetails.id}
              </h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-slate-400 hover:text-slate-800">
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
              <p><strong>Customer:</strong> {selectedOrderDetails.customer_name}</p>
              <p><strong>Phone:</strong> {selectedOrderDetails.customer_phone}</p>
              <p><strong>Address:</strong> {selectedOrderDetails.customer_address}</p>
              <p><strong>Zone:</strong> {selectedOrderDetails.delivery_area}</p>
            </div>

            <div className="space-y-2">
              <strong className="block">Items:</strong>
              {selectedOrderDetails.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={i.product.image} className="w-8 h-8 object-contain rounded bg-white" />
                    <span>{i.product.name} (x{i.quantity})</span>
                  </div>
                  <span className="font-mono font-bold">৳{i.product.price * i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-sm pt-2 border-t text-red-600">
              <span>Total Payable:</span>
              <span>৳{selectedOrderDetails.grand_total}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setPrintOrder(selectedOrderDetails); setSelectedOrderDetails(null); }} className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1">
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD PRODUCT MODAL (Supports Inline New Category & Up to 10 Images) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Product Title <span className="text-red-500">*</span></label>
                <input type="text" required value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* CATEGORY SELECTOR OR INLINE CREATOR */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      {isCreatingNewCategory ? '← Existing Category' : '+ Create New'}
                    </button>
                  </div>

                  {isCreatingNewCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="Type new category name..."
                      value={newCategoryInput}
                      onChange={(e) => {
                        setNewCategoryInput(e.target.value);
                        setEditingProduct({ ...editingProduct, category: e.target.value as any });
                      }}
                      className="w-full p-2.5 rounded-xl border-2 border-red-500 bg-red-50/40 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  ) : (
                    <select
                      value={editingProduct.category || (categories[0]?.name || 'Earbuds')}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-bold cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">Price (৳) <span className="text-red-500">*</span></label>
                  <input type="number" required value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Strike-through Price (৳)</label>
                  <input type="number" value={editingProduct.originalPrice || ''} onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono" />
                </div>

                <div>
                  <label className="block font-bold mb-1">Stock Quantity</label>
                  <input type="number" value={editingProduct.stock_quantity ?? 50} onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 font-mono" />
                </div>
              </div>

              {/* Full Description Box */}
              <div>
                <label className="block font-bold mb-1">Full Detailed Description</label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Provide comprehensive details, sound features, battery specs, build quality, and warranty information..."
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 text-xs leading-relaxed"
                />
              </div>

              {/* MULTI-IMAGE GALLERY UPLOADER (UP TO 10 IMAGES) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block font-extrabold text-slate-900 dark:text-white uppercase">
                    Product Image Gallery (Up to 10 Photos)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-red-600">
                    {(editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])).length} / 10 Images
                  </span>
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {(editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])).map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-square bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 group">
                      <img src={imgUrl} className="w-full h-full object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingProduct.images || (editingProduct.image ? [editingProduct.image] : []);
                          const updated = current.filter((_, i) => i !== idx);
                          setEditingProduct({
                            ...editingProduct,
                            image: updated[0] || '',
                            images: updated,
                          });
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Action controls */}
                {(editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])).length < 10 && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={editingProduct.image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const current = editingProduct.images || [];
                        setEditingProduct({
                          ...editingProduct,
                          image: val,
                          images: Array.from(new Set([val, ...current])).filter(Boolean),
                        });
                      }}
                      placeholder="Paste Image URL or click Upload button"
                      className="flex-1 p-2 text-xs rounded-xl border dark:bg-slate-800"
                    />

                    <label className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-xl cursor-pointer shadow-md">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROMO MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">Create / Edit Promo Code</h3>
            <form onSubmit={handleSavePromo} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Promo Code</label>
                <input type="text" required value={editingPromo.code || ''} onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })} className="w-full p-2 rounded-xl border dark:bg-slate-800 font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Type</label>
                  <select value={editingPromo.discount_type || 'percentage'} onChange={(e) => setEditingPromo({ ...editingPromo, discount_type: e.target.value as any })} className="w-full p-2 rounded-xl border dark:bg-slate-800">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Discount Value</label>
                  <input type="number" required value={editingPromo.discount_value || ''} onChange={(e) => setEditingPromo({ ...editingPromo, discount_value: Number(e.target.value) })} className="w-full p-2 rounded-xl border dark:bg-slate-800 font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingPromo(null)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl cursor-pointer">Save Code</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AD MODAL */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">Create / Edit Banner</h3>
            <form onSubmit={handleSaveAd} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Banner Title</label>
                <input type="text" required value={editingAd.title || ''} onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
              </div>
              <div>
                <label className="block font-bold mb-1">Banner Image URL</label>
                <input type="text" required value={editingAd.image || ''} onChange={(e) => setEditingAd({ ...editingAd, image: e.target.value })} className="w-full p-2 rounded-xl border dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingAd(null)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl cursor-pointer">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {printOrder && (
        <InvoicePrintModal order={printOrder} storeSettings={settings} onClose={() => setPrintOrder(null)} />
      )}

    </div>
  );
};
