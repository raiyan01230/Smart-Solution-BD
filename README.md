# SHM GADGET — E-Commerce Web Application

A complete, high-performance, mobile-first E-Commerce web application for **SHM GADGET** built for deployment on **GitHub Pages**.

---

## 🚀 Key Features

1. **GitHub Pages Compatible Architecture**:
   - Hash-based routing (`/#/`, `/#/product/:id`, `/#/cart`, `/#/checkout`, `/#/track`, `/#/admin`, `/#/about`, `/#/contact`, `/#/faq`).
   - Relative asset loading suitable for GitHub Pages subpaths (`https://<username>.github.io/<repo-name>/`).
   - Zero Node.js server dependencies required at runtime.

2. **Full Theme Switching (Light & Dark Mode)**:
   - Header toggle button switching between Light and Dark mode.
   - Applies consistently across all product cards, checkout pages, modals, tables, and admin controls.
   - Saved in `localStorage` (`shm_theme`).

3. **Complete Shopping Experience**:
   - **Flash Deals** with live ticking countdown timer.
   - **Category Filters**: All Products, Earbuds, Watches, Neckband, Microphone, Keyboard, Humidifier, Speakers.
   - **Dedicated Product Detail Pages** (`/#/product/:id`) with unique shareable URLs.
   - **Slide-over Cart Drawer** and **Cart Page** (`/#/cart`).

4. **Cash on Delivery Checkout (Bangladesh)**:
   - **11-Digit Mobile Number Validation** (BD format starting with `01`, e.g., `01712345678`).
   - **Automatic Delivery Charge Calculation**:
     - Inside Dhaka: ৳70
     - Outside Dhaka: ৳120
   - **Promo Code System**:
     - Configurable percentage (%) or fixed amount (৳) discounts with minimum order requirements and expiry date checks.

5. **Real Order Tracking**:
   - Unique Order ID generated (e.g., `#SSBD-8921`).
   - Search by Order ID or phone number.
   - Live delivery progress timeline: *Order Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered*.
   - Direct **WhatsApp Order Support** button.

6. **Separate Admin Dashboard (`/#/admin`)**:
   - Login: `admin@shmgadget.com` / `admin123`.
   - **Product CRUD**: Add, edit, delete products, manage prices, stock, flash deal & HOT badges.
   - **Image Management**: Direct upload to Supabase Storage or URL input.
   - **Order Management**: Search orders, view customer info & items, update delivery status.
   - **Promo Code Management**: Create, edit, toggle active status.
   - **Store Settings**: Update delivery charges, hotline, WhatsApp contact number.

---

## 🗄️ Backend Setup (Supabase Integration)

This application supports both **Demo Mode** (Out of the box) and **Supabase Production Mode**.

### Step 1: Run SQL Migration
1. Go to your [Supabase Dashboard](https://app.supabase.com) and open the **SQL Editor**.
2. Copy and execute the contents of `/supabase/schema.sql` located in this repository.
3. This creates the required tables (`products`, `orders`, `promo_codes`, `store_settings`), Row Level Security policies, and the `product-images` storage bucket.

### Step 2: Configure Environment Variables or Admin Panel Settings
Add your Supabase credentials in your `.env` file or directly in the Admin Panel (`/#/admin` -> Store Settings):

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 📦 GitHub Pages Deployment Instructions

### Method A: Using GitHub Actions (Automated)

1. Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Go to Repository **Settings → Pages**:
   - Build and deployment source: **GitHub Actions**.

### Method B: Manual Build (`gh-pages`)

```bash
npm run build
```
Upload the contents of the generated `dist` folder to your `gh-pages` branch.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` or `http://localhost:3000/#/admin` for the admin dashboard.
