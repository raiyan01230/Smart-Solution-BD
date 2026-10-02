-- SQL Migration Script for Smart Solution BD E-Commerce on Supabase

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  is_flash_deal BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 50,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  items JSONB NOT NULL,
  items_total NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  promo_discount NUMERIC DEFAULT 0,
  promo_code TEXT,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Cash on Delivery (COD)',
  status TEXT DEFAULT 'Order Placed',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  usage_limit INTEGER DEFAULT 100,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ADVERTISEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.advertisements (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  destination_url TEXT,
  position TEXT DEFAULT 'homepage_hero',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 7. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert Default Settings for Smart Solution BD
INSERT INTO public.store_settings (key, value)
VALUES 
  ('inside_dhaka_fee', '70'),
  ('outside_dhaka_fee', '120'),
  ('store_name', 'Smart Solution BD'),
  ('whatsapp_number', '8801700000000'),
  ('hotline', '+880 1700-000000'),
  ('email', 'support@smartsolutionbd.com'),
  ('facebook_url', 'https://www.facebook.com/profile.php?id=61594778919594'),
  ('about_title', 'Best Gadget Shop in Bangladesh'),
  ('about_p1', 'Welcome to Smart Solution BD, the most trusted destination for original smartwatches in BD. We provide the latest tech gear, including Kieslect, Amazfit, Huawei, and premium ANC earbuds. Our goal is to ensure you get 100% authentic products with official warranty.'),
  ('about_p2', 'Looking for the best smartwatch price in Bangladesh 2026? We offer competitive pricing, fast home delivery, and a seamless shopping experience. Whether you need gaming headphones or waterproof fitness trackers, our catalog is updated daily.'),
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'We are currently performing scheduled maintenance to upgrade our system. Please check back shortly!')
ON CONFLICT (key) DO NOTHING;

-- Insert Initial Default Categories
INSERT INTO public.categories (name, slug)
VALUES 
  ('Earbuds', 'earbuds'),
  ('Watch''s', 'watches'),
  ('Neckband', 'neckband'),
  ('Microphone', 'microphone'),
  ('Keyboard', 'keyboard'),
  ('Humidifier', 'humidifier'),
  ('Speakers', 'speakers')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Promo Codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, min_order_amount, is_active)
VALUES 
  ('WELCOME10', 'percentage', 10, 500),
  ('SMART100', 'fixed', 100, 1000)
ON CONFLICT (code) DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public READ Policies
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Ads" ON public.advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Active Promos" ON public.promo_codes FOR SELECT USING (is_active = true);

-- Orders: Public can INSERT and SELECT by ID/Phone
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Select Orders" ON public.orders FOR SELECT USING (true);

-- Admin Full Access (authenticated)
CREATE POLICY "Admin Manage Products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Promos" ON public.promo_codes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Settings" ON public.store_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Ads" ON public.advertisements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Manage Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- 9. SUPABASE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
