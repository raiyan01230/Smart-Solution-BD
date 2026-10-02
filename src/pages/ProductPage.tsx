import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import {
  Star, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Plus, Minus, CheckCircle, Zap,
  Layers, Maximize2, X, MessageSquare, ThumbsUp, Award, RefreshCcw
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface ProductPageProps {
  productId: string;
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  navigate: (path: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  productId,
  products,
  onAddToCart,
  onBuyNow,
  navigate,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'specs' | 'reviews'>('overview');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const product = products.find((p) => p.id === productId);

  // Derive gallery images array (up to 10 images)
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.slice(0, 10);
    }
    return [product.image];
  }, [product]);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [productId]);

  // Dynamic Product-Specific Schema.org JSON-LD Structured Data & SEO Meta Tags
  useEffect(() => {
    if (!product) return;

    // 1. Dynamic Page Title
    const pageTitle = `${product.name} Price in BD ৳${product.price} | Smart Solution BD`;
    document.title = pageTitle;

    // 2. Dynamic Meta Tags
    const metaDesc = `Buy authentic ${product.name} at best price ৳${product.price} in Bangladesh. 100% genuine ${product.category} with fast Cash on Delivery across 64 BD districts.`;

    const setMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      if (tag) {
        tag.setAttribute('content', contentVal);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute(nameAttr, attrVal);
        meta.setAttribute('content', contentVal);
        document.head.appendChild(meta);
      }
    };

    setMeta('name', 'description', metaDesc);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:image', product.image);
    setMeta('property', 'og:type', 'product');
    setMeta('property', 'og:site_name', 'Smart Solution BD');
    setMeta('property', 'og:url', window.location.href);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', metaDesc);
    setMeta('name', 'twitter:image', product.image);

    // Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.href);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.href;
      document.head.appendChild(link);
    }

    // 3. Inject Product Schema.org JSON-LD Structured Data
    const scriptId = 'product-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const schemaData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: galleryImages,
      description: product.description,
      sku: product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: 'Smart Solution BD',
      },
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'BDT',
        price: product.price,
        priceValidUntil: priceValidUntil,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Smart Solution BD',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating || '4.8',
        reviewCount: product.reviewsCount || '15',
      },
    };

    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      document.title = 'Smart Solution BD | Best Smartwatch & Premium Earbuds Price in BD';
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [product, galleryImages]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          The requested gadget could not be found or may have been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>
      </div>
    );
  }

  const currentDisplayImage = galleryImages[activeImageIndex] || product.image;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      {/* Main Product Showcase Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Showcase + Gallery Thumbnails (Up to 10 images) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 flex items-center justify-center aspect-square border border-slate-200/70 dark:border-slate-700/50 relative group overflow-hidden">
              {product.isHot && (
                <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-sm">
                  HOT DEAL
                </span>
              )}

              <button
                onClick={() => setLightboxImage(currentDisplayImage)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-slate-900/80 rounded-full text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:scale-110"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <img
                src={currentDisplayImage}
                alt={`${product.name} Image ${activeImageIndex + 1} - ${product.category} Price in BD ৳${product.price} | Smart Solution BD`}
                title={`${product.name} - ${product.category} in Bangladesh`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-[420px] transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            {/* Thumbnail Carousel (Up to 10 Product Images) */}
            {galleryImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Product Photo Gallery ({galleryImages.length} Images)</span>
                  <span>Click to view</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {galleryImages.map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-1 bg-slate-50 dark:bg-slate-800 border-2 transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'border-red-600 ring-2 ring-red-500/20 scale-105 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} Thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Title, Pricing & Quick Order Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs font-bold text-slate-400">SKU: {product.id}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {product.rating}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {product.reviewsCount} verified reviews
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>In Stock Ready to Ship</span>
                </span>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-500 font-mono">
                  ৳{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-slate-400 line-through font-mono">
                    ৳{product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="ml-auto text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-lg uppercase">
                    Save ৳{product.originalPrice - product.price}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Quick Key Specs Table */}
              <div className="space-y-2 mb-6 border-t border-b border-slate-100 dark:border-slate-800 py-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Key Specifications Highlight
                </h3>
                {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{key}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 mb-6 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Cash on Delivery in 64 Districts</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>100% Genuine Warranty</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Select Order Quantity:
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-sm font-black font-mono text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="py-3.5 px-4 rounded-xl border-2 border-red-600 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black uppercase tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Order Now (COD)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BIG SEPARATE SECTION: FULL PRODUCT OVERVIEW & HIGH-RES 10-IMAGE GALLERY */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md mb-12 space-y-8">
        
        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Detailed Overview & Description', icon: Layers },
            { id: 'gallery', label: `Image Gallery (${galleryImages.length} High-Res Photos)`, icon: Maximize2 },
            { id: 'specs', label: 'Full Specifications Table', icon: Award },
            { id: 'reviews', label: `Customer Reviews (${product.reviewsCount})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 font-extrabold text-xs sm:text-sm shrink-0 flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-500'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DETAILED OVERVIEW & DESCRIPTION */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {product.name} — Authentic Product Description
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
              <p>
                At <strong>Smart Solution BD</strong>, we inspect every parcel before handing it to our official courier partners (Pathao & Steadfast). When you purchase the {product.name}, you receive a 100% genuine product backed by our 7-day hassle-free replacement guarantee.
              </p>
            </div>

            {/* Showcase Image Gallery Section inside Overview */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase">
                  Product Visual Showcase ({galleryImages.length} High-Res Images)
                </h3>
                <span className="text-xs text-slate-400">Click any image for full-screen zoom</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(img)}
                    className="group bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col items-center"
                  >
                    <div className="aspect-square w-full flex items-center justify-center p-2 mb-2">
                      <img
                        src={img}
                        alt={`${product.name} Gallery Photo ${idx + 1}`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-red-600 transition-colors">
                      {product.name} — Angle {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL HIGH-RES GALLERY (Up to 10 Images) */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase mb-1">
                Full Resolution Product Gallery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect every angle of {product.name} in high clarity before ordering with Cash on Delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImage(img)}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <div className="aspect-square w-full flex items-center justify-center p-3 mb-3">
                    <img
                      src={img}
                      alt={`${product.name} High Res Photo ${idx + 1}`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Image #{idx + 1}</span>
                    <span className="text-red-600 font-extrabold flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Zoom</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPECIFICATIONS TABLE */}
        {activeTab === 'specs' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase mb-4">
              Complete Technical Specifications
            </h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-4 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="font-bold text-slate-600 dark:text-slate-400 col-span-1">{key}</span>
                  <span className="font-semibold text-slate-900 dark:text-white col-span-2">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS & RATING BREAKDOWN */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-center md:border-r border-slate-200 dark:border-slate-700 pr-4">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">{product.rating}</span>
                <div className="flex justify-center text-amber-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{product.reviewsCount} Customer Reviews</span>
              </div>

              <div className="md:col-span-2 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">5 Star</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full w-[92%]" />
                  </div>
                  <span className="font-mono text-slate-400">92%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">4 Star</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full w-[8%]" />
                  </div>
                  <span className="font-mono text-slate-400">8%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sabbir Hossain', date: '2 days ago', comment: '100% original product! Fast delivery inside Dhaka. The sound quality and build are amazing.', rating: 5 },
                { name: 'Miraz Uddin', date: '5 days ago', comment: 'Received parcel in Chittagong within 3 days. Cash on delivery made it super safe.', rating: 5 },
              ].map((rev, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.name}</span>
                    <span className="text-slate-400 text-[10px]">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, r) => (
                      <Star key={r} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX FULLSCREEN MODAL FOR IMAGES */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full resolution product image"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase mb-4 tracking-tight">
            Related Gadgets in {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={() => navigate(`/product/${p.id}`)}
                onAddToCart={(prod, e) => {
                  e.stopPropagation();
                  onAddToCart(prod, 1);
                }}
                onBuyNow={(prod, e) => {
                  e.stopPropagation();
                  onBuyNow(prod, 1);
                }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
