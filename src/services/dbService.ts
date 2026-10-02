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

const DEFAULT_SETTINGS: StoreSettings = {
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

const DEFAULT_PROMOS: PromoCode[] = [
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

const DEFAULT_ADS: Advertisement[] = [
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

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Earbuds', slug: 'earbuds', is_active: true },
  { id: 'cat-2', name: "Watch's", slug: 'watches', is_active: true },
  { id: 'cat-3', name: 'Neckband', slug: 'neckband', is_active: true },
  { id: 'cat-4', name: 'Microphone', slug: 'microphone', is_active: true },
  { id: 'cat-5', name: 'Keyboard', slug: 'keyboard', is_active: true },
  { id: 'cat-6', name: 'Humidifier', slug: 'humidifier', is_active: true },
  { id: 'cat-7', name: 'Speakers', slug: 'speakers', is_active: true },
];

// --- CATEGORIES API ---
export async function fetchCategories(): Promise<CategoryItem[]> {
  const local = localStorage.getItem('smart_categories');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local categories:', e);
    }
  }

  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
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
      console.warn('Fetch categories error:', e);
    }
  }

  localStorage.setItem('smart_categories', JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export async function saveCategory(category: CategoryItem): Promise<boolean> {
  const local = localStorage.getItem('smart_categories');
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
  localStorage.setItem('smart_categories', JSON.stringify(updated));

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
  const localCats = localStorage.getItem('smart_categories');
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

  localStorage.setItem('smart_categories', JSON.stringify(updatedCats));

  // Re-assign any products belonging to this category to 'Uncategorized'
  const localProds = localStorage.getItem('smart_products');
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
    localStorage.setItem('smart_products', JSON.stringify(updatedProds));
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
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
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
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using stored catalog:', e);
    }
  }

  const local = localStorage.getItem('smart_products');
  return local ? JSON.parse(local) : DEFAULT_PRODUCTS;
}

export async function saveProduct(product: Product): Promise<boolean> {
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

      const { error } = await supabase.from('products').upsert(payload);
      if (error) console.error('Supabase save product error:', error);
      else return true;
    } catch (e) {
      console.error('Save product error:', e);
    }
  }

  const current = await fetchProducts();
  const idx = current.findIndex((p) => p.id === product.id);
  let updated: Product[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = product;
  } else {
    updated = [product, ...current];
  }
  localStorage.setItem('smart_products', JSON.stringify(updated));
  window.dispatchEvent(new Event('products_updated'));
  return true;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.error('Delete product error:', e);
    }
  }

  const current = await fetchProducts();
  const updated = current.filter((p) => p.id !== productId);
  localStorage.setItem('smart_products', JSON.stringify(updated));
  window.dispatchEvent(new Event('products_updated'));
  return true;
}

// --- ORDERS API ---
export async function fetchOrders(): Promise<Order[]> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        return data.map((o) => ({
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
      }
    } catch (e) {
      console.warn('Supabase fetch orders failed:', e);
    }
  }

  const local = localStorage.getItem('smart_orders');
  return local ? JSON.parse(local) : [];
}

export async function createOrder(order: Order): Promise<boolean> {
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

      const { error } = await supabase.from('orders').insert([payload]);
      if (error) console.error('Supabase create order error:', error);

      // Decrement stock quantities in database safely
      for (const item of order.items) {
        try {
          const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.product.id).single();
          if (prod) {
            const newQty = Math.max(0, (prod.stock_quantity || 1) - item.quantity);
            await supabase.from('products').update({ stock_quantity: newQty, in_stock: newQty > 0 }).eq('id', item.product.id);
          }
        } catch (stErr) {
          console.error('Stock decrement error:', stErr);
        }
      }
    } catch (e) {
      console.error('Create order error:', e);
    }
  }

  // Update local product stock as well
  const currentProds = await fetchProducts();
  const updatedProds = currentProds.map((p) => {
    const purchasedItem = order.items.find((i) => i.product.id === p.id);
    if (purchasedItem) {
      const newStock = Math.max(0, (p.stock_quantity ?? 50) - purchasedItem.quantity);
      return { ...p, stock_quantity: newStock, inStock: newStock > 0 };
    }
    return p;
  });
  localStorage.setItem('smart_products', JSON.stringify(updatedProds));

  const existing = await fetchOrders();
  localStorage.setItem('smart_orders', JSON.stringify([order, ...existing]));
  return true;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
  notes?: string
): Promise<boolean> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, notes, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (e) {
      console.error('Update order status error:', e);
    }
  }

  const current = await fetchOrders();
  const updated = current.map((o) =>
    o.id === orderId ? { ...o, status: newStatus, notes, updated_at: new Date().toISOString() } : o
  );
  localStorage.setItem('smart_orders', JSON.stringify(updated));
  return true;
}

// --- PROMO CODES API ---
export async function fetchPromoCodes(): Promise<PromoCode[]> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase.from('promo_codes').select('*');
      if (!error && data) {
        return data.map((p) => ({
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
      }
    } catch (e) {
      console.warn('Fetch promo error:', e);
    }
  }

  const local = localStorage.getItem('smart_promos');
  return local ? JSON.parse(local) : DEFAULT_PROMOS;
}

export async function savePromoCode(promo: PromoCode): Promise<boolean> {
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
    } catch (e) {
      console.error('Save promo error:', e);
    }
  }

  const current = await fetchPromoCodes();
  const idx = current.findIndex((p) => p.id === promo.id || p.code.toUpperCase() === promo.code.toUpperCase());
  let updated: PromoCode[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = promo;
  } else {
    updated = [promo, ...current];
  }
  localStorage.setItem('smart_promos', JSON.stringify(updated));
  return true;
}

// --- ADVERTISEMENTS API ---
export async function fetchAdvertisements(): Promise<Advertisement[]> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase.from('advertisements').select('*');
      if (!error && data && data.length > 0) {
        return data.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          image: a.image,
          destination_url: a.destination_url,
          position: a.position || 'homepage_hero',
          is_active: Boolean(a.is_active),
          created_at: a.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fetch ads error:', e);
    }
  }

  const local = localStorage.getItem('smart_ads');
  return local ? JSON.parse(local) : DEFAULT_ADS;
}

export async function saveAdvertisement(ad: Advertisement): Promise<boolean> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('advertisements').upsert(ad);
    } catch (e) {
      console.error('Save ad error:', e);
    }
  }

  const current = await fetchAdvertisements();
  const idx = current.findIndex((a) => a.id === ad.id);
  let updated: Advertisement[];
  if (idx > -1) {
    updated = [...current];
    updated[idx] = ad;
  } else {
    updated = [ad, ...current];
  }
  localStorage.setItem('smart_ads', JSON.stringify(updated));
  return true;
}

export async function deleteAdvertisement(id: string): Promise<boolean> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      await supabase.from('advertisements').delete().eq('id', id);
    } catch (e) {
      console.error('Delete ad error:', e);
    }
  }

  const current = await fetchAdvertisements();
  const updated = current.filter((a) => a.id !== id);
  localStorage.setItem('smart_ads', JSON.stringify(updated));
  return true;
}

// --- STORE SETTINGS API ---
export async function fetchStoreSettings(): Promise<StoreSettings> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (!error && data && data.length > 0) {
        const settingsObj = { ...DEFAULT_SETTINGS };
        data.forEach((row) => {
          if (row.key === 'inside_dhaka_fee') settingsObj.inside_dhaka_fee = Number(row.value);
          if (row.key === 'outside_dhaka_fee') settingsObj.outside_dhaka_fee = Number(row.value);
          if (row.key === 'store_name') settingsObj.store_name = row.value;
          if (row.key === 'whatsapp_number') settingsObj.whatsapp_number = row.value;
          if (row.key === 'hotline') settingsObj.hotline = row.value;
          if (row.key === 'email') settingsObj.email = row.value;
          if (row.key === 'facebook_url') settingsObj.facebook_url = row.value;
          if (row.key === 'about_title') settingsObj.about_title = row.value;
          if (row.key === 'about_p1') settingsObj.about_p1 = row.value;
          if (row.key === 'about_p2') settingsObj.about_p2 = row.value;
          if (row.key === 'maintenance_mode') settingsObj.maintenance_mode = row.value === 'true';
          if (row.key === 'maintenance_message') settingsObj.maintenance_message = row.value;
        });
        return settingsObj;
      }
    } catch (e) {
      console.warn('Fetch settings error:', e);
    }
  }

  const local = localStorage.getItem('smart_settings');
  return local ? JSON.parse(local) : DEFAULT_SETTINGS;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await supabase.from('store_settings').upsert(rows);
    } catch (e) {
      console.error('Save settings error:', e);
    }
  }

  localStorage.setItem('smart_settings', JSON.stringify(settings));
  return true;
}

// --- IMAGE UPLOAD TO SUPABASE STORAGE ---
export async function uploadImageToSupabase(file: File): Promise<string | null> {
  if (!IS_SUPABASE_CONFIGURED || !supabase) {
    alert('Supabase is not configured yet. Using local image preview URL.');
    return URL.createObjectURL(file);
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (e) {
    console.error('Image upload exception:', e);
    return null;
  }
}
