import { supabase, IS_SUPABASE_CONFIGURED } from '../lib/supabase';
import { Product, PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';

export interface Order {
  id: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: 'dhaka' | 'outside';
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  items_total: number;
  delivery_fee: number;
  promo_discount: number;
  promo_code?: string;
  grand_total: number;
  payment_method: string;
  status: 'Order Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  notes?: string;
  updated_at?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  expiry_date?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image: string;
  destination_url?: string;
  position: 'homepage_hero' | 'flash_deals' | 'category_banner' | 'sidebar';
  is_active: boolean;
  created_at?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

export interface StoreSettings {
  inside_dhaka_fee: number;
  outside_dhaka_fee: number;
  store_name: string;
  whatsapp_number: string;
  hotline: string;
  email: string;
  facebook_url: string;
  about_title: string;
  about_p1: string;
  about_p2: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
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
};

export const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 500,
    usage_limit: 100,
    usage_count: 14,
    is_active: true,
  },
  {
    id: 'promo-2',
    code: 'SMART100',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 1000,
    usage_limit: 200,
    usage_count: 28,
    is_active: true,
  },
];

export const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Smartwatch Grand Deal 2026',
    description: 'Get up to 40% OFF on Kieslect, Amazfit & Huawei Smartwatches!',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80',
    destination_url: '#/product/p5',
    position: 'homepage_hero',
    is_active: true,
  },
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Earbuds', slug: 'earbuds', is_active: true },
  { id: 'cat-2', name: "Watch's", slug: 'watches', is_active: true },
  { id: 'cat-3', name: 'Neckband', slug: 'neckband', is_active: true },
  { id: 'cat-4', name: 'Microphone', slug: 'microphone', is_active: true },
  { id: 'cat-5', name: 'Keyboard', slug: 'keyboard', is_active: true },
  { id: 'cat-6', name: 'Humidifier', slug: 'humidifier', is_active: true },
  { id: 'cat-7', name: 'Speakers', slug: 'speakers', is_active: true },
];

// Helper: Fast timeout guard to prevent slow network requests from freezing the page
function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms)),
  ]);
}

// --- CATEGORIES API ---
export async function fetchCategories(): Promise<CategoryItem[]> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_categories') : null;
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local categories:', e);
    }
  }

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await withTimeout(supabase.from('categories').select('*').order('name'), 1500);
      if (!error && data && data.length > 0) {
        const mapped = data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: c.description,
          image: c.image,
          is_active: Boolean(c.is_active ?? true),
        }));
        localStorage.setItem('smart_categories', JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      // Fast fallback to default
    }
  }

  try {
    localStorage.setItem('smart_categories', JSON.stringify(DEFAULT_CATEGORIES));
  } catch {}
  return DEFAULT_CATEGORIES;
}

export async function saveCategory(category: CategoryItem): Promise<boolean> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_categories') : null;
  const current: CategoryItem[] = local ? JSON.parse(local) : DEFAULT_CATEGORIES;

  const idx = current.findIndex(
    (c) => c.id === category.id || c.name.toLowerCase() === category.name.toLowerCase()
  );
  let updated: CategoryItem[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = category;
  } else {
    updated = [...current, category];
  }
  try {
    localStorage.setItem('smart_categories', JSON.stringify(updated));
  } catch {}

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('categories').upsert({
        id: category.id,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: category.description || null,
        image: category.image || null,
        is_active: category.is_active ?? true,
      });
    } catch (e) {
      console.error('Save category error:', e);
    }
  }

  window.dispatchEvent(new Event('categories_updated'));
  return true;
}

export async function deleteCategory(id: string, name?: string): Promise<boolean> {
  const localCats = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_categories') : null;
  const currentCats: CategoryItem[] = localCats ? JSON.parse(localCats) : DEFAULT_CATEGORIES;

  const targetName = name || id;

  // Filter out category from local storage list
  const updatedCats = currentCats.filter(
    (c) =>
      c.id !== id &&
      c.name.toLowerCase() !== targetName.toLowerCase() &&
      c.id !== targetName &&
      c.name.toLowerCase() !== id.toLowerCase()
  );

  try {
    localStorage.setItem('smart_categories', JSON.stringify(updatedCats));
  } catch {}

  // Re-assign any products belonging to this category to 'Uncategorized'
  const localProds = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_products') : null;
  const currentProds: Product[] = localProds ? JSON.parse(localProds) : DEFAULT_PRODUCTS;
  let prodsModified = false;

  const updatedProds = currentProds.map((p) => {
    if (
      p.category === targetName ||
      p.category.toLowerCase() === targetName.toLowerCase() ||
      p.category === id
    ) {
      prodsModified = true;
      return { ...p, category: 'Uncategorized' };
    }
    return p;
  });

  if (prodsModified) {
    try {
      localStorage.setItem('smart_products', JSON.stringify(updatedProds));
    } catch {}
  }

  // Supabase cleanup if active
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('categories').delete().or(`id.eq.${id},name.eq.${targetName}`);
      await supabase.from('products').update({ category: 'Uncategorized' }).eq('category', targetName);
    } catch (e) {
      console.error('Delete category error in Supabase:', e);
    }
  }

  // Dispatch events to refresh categories and products across the entire UI
  window.dispatchEvent(new Event('categories_updated'));
  window.dispatchEvent(new Event('products_updated'));
  return true;
}

// --- PRODUCTS API ---
export async function fetchProducts(): Promise<Product[]> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_products') : null;
  let cached: Product[] | null = null;
  if (local !== null) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        cached = parsed;
      }
    } catch {}
  }

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        2000
      );

      if (!error && data) {
        const mapped = data.map((item) => ({
          id: String(item.id),
          name: item.name,
          category: item.category,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          image: item.image,
          images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
          isFlashDeal: Boolean(item.is_flash_deal),
          isHot: Boolean(item.is_hot),
          rating: Number(item.rating || 4.8),
          reviewsCount: Number(item.reviews_count || 0),
          inStock: Boolean(item.in_stock),
          stock_quantity: Number(item.stock_quantity ?? 50),
          description: item.description || '',
          specs: item.specs || {},
        }));
        try {
          localStorage.setItem('smart_products', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (e) {
      // Timeout or error, fallback to cache
    }
  }

  if (cached !== null) {
    return cached;
  }

  try {
    localStorage.setItem('smart_products', JSON.stringify(DEFAULT_PRODUCTS));
  } catch {}
  return DEFAULT_PRODUCTS;
}

export async function saveProduct(product: Product): Promise<boolean> {
  const current = await fetchProducts();
  const idx = current.findIndex((p) => String(p.id) === String(product.id));
  let updated: Product[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = product;
  } else {
    updated = [product, ...current];
  }
  try {
    localStorage.setItem('smart_products', JSON.stringify(updated));
  } catch {}
  window.dispatchEvent(new Event('products_updated'));

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const payload = {
        id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        image: product.image,
        images: product.images || [product.image],
        is_flash_deal: product.isFlashDeal || false,
        is_hot: product.isHot || false,
        rating: product.rating || 4.8,
        reviews_count: product.reviewsCount || 0,
        in_stock: product.inStock,
        stock_quantity: product.stock_quantity ?? 50,
        description: product.description,
        specs: product.specs || {},
        updated_at: new Date().toISOString(),
      };

      await supabase.from('products').upsert(payload);
    } catch (e) {
      console.error('Save product error:', e);
    }
  }

  return true;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const current = await fetchProducts();
  const updated = current.filter((p) => String(p.id).trim() !== String(productId).trim());
  try {
    localStorage.setItem('smart_products', JSON.stringify(updated));
  } catch {}
  window.dispatchEvent(new Event('products_updated'));

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.error('Delete product error:', e);
    }
  }

  return true;
}

export async function resetProductsToDefault(): Promise<Product[]> {
  try {
    localStorage.setItem('smart_products', JSON.stringify(DEFAULT_PRODUCTS));
  } catch {}
  window.dispatchEvent(new Event('products_updated'));
  return DEFAULT_PRODUCTS;
}

export async function syncAllProductsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  if (!IS_SUPABASE_CONFIGURED || !supabase) {
    return { success: false, count: 0, error: 'Supabase is not configured' };
  }

  try {
    const products = await fetchProducts();
    const rows = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      image: product.image,
      images: product.images || [product.image],
      is_flash_deal: product.isFlashDeal || false,
      is_hot: product.isHot || false,
      rating: product.rating || 4.8,
      reviews_count: product.reviewsCount || 0,
      in_stock: product.inStock,
      stock_quantity: product.stock_quantity ?? 50,
      description: product.description,
      specs: product.specs || {},
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('products').upsert(rows);
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: rows.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}

// --- ORDERS API ---
export async function fetchOrders(): Promise<Order[]> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_orders') : null;
  let cached: Order[] = [];
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) cached = parsed;
    } catch {}
  }

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('orders').select('*').order('date', { ascending: false }),
        1500
      );

      if (!error && data) {
        const mapped = data.map((o) => ({
          id: o.id,
          date: o.date,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_address: o.customer_address,
          delivery_area: o.delivery_area as 'dhaka' | 'outside',
          items: o.items || [],
          items_total: Number(o.items_total),
          delivery_fee: Number(o.delivery_fee),
          promo_discount: Number(o.promo_discount || 0),
          promo_code: o.promo_code,
          grand_total: Number(o.grand_total),
          payment_method: o.payment_method || 'Cash on Delivery (COD)',
          status: o.status || 'Order Placed',
          notes: o.notes,
          updated_at: o.updated_at,
        }));
        try {
          localStorage.setItem('smart_orders', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (e) {}
  }

  return cached;
}

export async function createOrder(order: Order): Promise<boolean> {
  // Update local product stock instantly
  const currentProds = await fetchProducts();
  const updatedProds = currentProds.map((p) => {
    const purchasedItem = order.items.find((i) => i.product.id === p.id);
    if (purchasedItem) {
      const newStock = Math.max(0, (p.stock_quantity ?? 50) - purchasedItem.quantity);
      return { ...p, stock_quantity: newStock, inStock: newStock > 0 };
    }
    return p;
  });
  try {
    localStorage.setItem('smart_products', JSON.stringify(updatedProds));
    const existing = await fetchOrders();
    localStorage.setItem('smart_orders', JSON.stringify([order, ...existing]));
  } catch {}

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const payload = {
        id: order.id,
        date: order.date,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        delivery_area: order.delivery_area,
        items: order.items,
        items_total: order.items_total,
        delivery_fee: order.delivery_fee,
        promo_discount: order.promo_discount,
        promo_code: order.promo_code || null,
        grand_total: order.grand_total,
        payment_method: order.payment_method,
        status: order.status,
        notes: order.notes || null,
      };

      await supabase.from('orders').insert([payload]);
    } catch (e) {
      console.error('Create order error in Supabase:', e);
    }
  }

  return true;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
  notes?: string
): Promise<boolean> {
  const current = await fetchOrders();
  const updated = current.map((o) =>
    o.id === orderId ? { ...o, status: newStatus, notes, updated_at: new Date().toISOString() } : o
  );
  try {
    localStorage.setItem('smart_orders', JSON.stringify(updated));
  } catch {}

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, notes, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (e) {}
  }

  return true;
}

// --- PROMO CODES API ---
export async function fetchPromoCodes(): Promise<PromoCode[]> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_promos') : null;
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await withTimeout(supabase.from('promo_codes').select('*'), 1500);
      if (!error && data && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          code: p.code,
          discount_type: p.discount_type,
          discount_value: Number(p.discount_value),
          min_order_amount: Number(p.min_order_amount || 0),
          usage_limit: Number(p.usage_limit || 100),
          usage_count: Number(p.usage_count || 0),
          is_active: Boolean(p.is_active),
          expiry_date: p.expiry_date,
        }));
        try {
          localStorage.setItem('smart_promos', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (e) {}
  }

  return DEFAULT_PROMOS;
}

export async function savePromoCode(promo: PromoCode): Promise<boolean> {
  const current = await fetchPromoCodes();
  const idx = current.findIndex((p) => p.id === promo.id || p.code.toUpperCase() === promo.code.toUpperCase());
  let updated: PromoCode[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = promo;
  } else {
    updated = [promo, ...current];
  }
  try {
    localStorage.setItem('smart_promos', JSON.stringify(updated));
  } catch {}

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('promo_codes').upsert({
        id: promo.id,
        code: promo.code.toUpperCase(),
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_order_amount: promo.min_order_amount,
        usage_limit: promo.usage_limit || 100,
        is_active: promo.is_active,
      });
    } catch (e) {}
  }

  return true;
}

// --- ADVERTISEMENTS API ---
export async function fetchAdvertisements(): Promise<Advertisement[]> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_ads') : null;
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  return DEFAULT_ADS;
}

export async function saveAdvertisement(ad: Advertisement): Promise<boolean> {
  const current = await fetchAdvertisements();
  const idx = current.findIndex((a) => a.id === ad.id);
  let updated: Advertisement[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = ad;
  } else {
    updated = [ad, ...current];
  }
  try {
    localStorage.setItem('smart_ads', JSON.stringify(updated));
  } catch {}
  return true;
}

export async function deleteAdvertisement(id: string): Promise<boolean> {
  const current = await fetchAdvertisements();
  const updated = current.filter((a) => a.id !== id);
  try {
    localStorage.setItem('smart_ads', JSON.stringify(updated));
  } catch {}
  return true;
}

// --- STORE SETTINGS API ---
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('smart_settings') : null;
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
  }

  return DEFAULT_SETTINGS;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  try {
    localStorage.setItem('smart_settings', JSON.stringify(settings));
  } catch {}
  return true;
}

// --- IMAGE UPLOAD TO SUPABASE STORAGE ---
export async function uploadImageToSupabase(file: File): Promise<string | null> {
  if (!IS_SUPABASE_CONFIGURED || !supabase) {
    return URL.createObjectURL(file);
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) return null;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (e) {
    return null;
  }
}
