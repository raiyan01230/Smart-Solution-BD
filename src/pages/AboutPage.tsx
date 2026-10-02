import React, { useEffect } from 'react';
import { ShieldCheck, Truck, Headphones, Award, ArrowLeft, Phone, Mail, Facebook, Clock } from 'lucide-react';
import { StoreSettings } from '../services/dbService';

interface AboutPageProps {
  navigate: (path: string) => void;
  storeSettings?: StoreSettings;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate, storeSettings }) => {
  const settings = storeSettings || {
    store_name: 'Smart Solution BD',
    hotline: '+880 1700-000000',
    email: 'support@smartsolutionbd.com',
    facebook_url: 'https://www.facebook.com/profile.php?id=61594778919594',
    about_title: 'Best Gadget Shop in Bangladesh',
    about_p1: 'Welcome to Smart Solution BD, the most trusted destination for original smartwatches in BD. We provide the latest tech gear, including Kieslect, Amazfit, Huawei, and premium ANC earbuds. Our goal is to ensure you get 100% authentic products with official warranty.',
    about_p2: 'Looking for the best smartwatch price in Bangladesh 2026? We offer competitive pricing, fast home delivery, and a seamless shopping experience. Whether you need gaming headphones or waterproof fitness trackers, our catalog is updated daily.',
  };

  // Google SEO Metadata & Schema.org Organization Structured Data
  useEffect(() => {
    document.title = `About Us - ${settings.store_name} | Official Tech & Gadget Store BD`;

    const scriptId = 'about-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: settings.store_name,
      image: 'https://smartsolutionbd.github.io/logo.png',
      logo: 'https://smartsolutionbd.github.io/logo.png',
      url: window.location.href,
      telephone: settings.hotline,
      email: settings.email,
      sameAs: [settings.facebook_url],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Multiplan Center, Elephant Road',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka',
        postalCode: '1205',
        addressCountry: 'BD',
      },
      description: `${settings.about_p1} ${settings.about_p2}`,
    };

    scriptTag.text = JSON.stringify(schema);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [settings]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md space-y-8">
        
        {/* Brand Banner */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <img
            src="/logo.png"
            alt={settings.store_name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <span className="text-xs font-black uppercase text-red-600 tracking-wider">
              Official About Us
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {settings.store_name}
            </h1>
            <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-1 uppercase">
              {settings.about_title}
            </p>
          </div>
        </div>

        {/* Story Paragraphs */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="text-sm font-medium">{settings.about_p1}</p>
          <p>{settings.about_p2}</p>
        </div>

        {/* Key Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <ShieldCheck className="w-8 h-8 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              100% Original Products & Warranty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every smartwatch, earbuds, or gaming gear is tested and verified for 100% authenticity.
            </p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <Truck className="w-8 h-8 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Nationwide Cash on Delivery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast courier home delivery across all 64 districts in Bangladesh with open-box inspection.
            </p>
          </div>
        </div>

        {/* Contact Info Box */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 text-xs sm:text-sm">
          <h3 className="text-sm font-extrabold uppercase text-amber-400 tracking-wide">
            Direct Store Support & Social Channels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 block font-bold text-[11px] uppercase">Hotline</span>
              <span className="font-mono font-bold text-white">{settings.hotline}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold text-[11px] uppercase">Support Email</span>
              <span className="font-bold text-white">{settings.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold text-[11px] uppercase">Official Facebook</span>
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-bold">
                Visit Facebook Page
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
