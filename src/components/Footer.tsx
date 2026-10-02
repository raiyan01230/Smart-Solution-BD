import React from 'react';
import { Truck, ShieldCheck, RefreshCcw, Headphones, Heart } from 'lucide-react';
import { StoreSettings } from '../services/dbService';

interface FooterProps {
  navigate: (path: string) => void;
  storeSettings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ navigate, storeSettings }) => {
  const settings = storeSettings || {
    store_name: 'Smart Solution BD',
    about_title: 'Best Gadget Shop in Bangladesh',
    about_p1: 'Welcome to Smart Solution BD, the most trusted destination for original smartwatches in BD. We provide the latest tech gear, including Kieslect, Amazfit, Huawei, and premium ANC earbuds. Our goal is to ensure you get 100% authentic products with official warranty.',
    about_p2: 'Looking for the best smartwatch price in Bangladesh 2026? We offer competitive pricing, fast home delivery, and a seamless shopping experience. Whether you need gaming headphones or waterproof fitness trackers, our catalog is updated daily.',
    facebook_url: 'https://www.facebook.com/profile.php?id=61594778919594',
    hotline: '+880 1700-000000',
    email: 'support@smartsolutionbd.com',
  };

  const storeName = settings.store_name || 'Smart Solution BD';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 mb-10 border-b border-slate-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-800/40">
            <Truck className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Fast BD Shipping</h4>
              <p className="text-[11px] text-slate-400">Dhaka in 24h, Nationwide in 48h</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-800/40">
            <ShieldCheck className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-400">Pay after checking your parcel</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-800/40">
            <RefreshCcw className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">7 Days Replacement</h4>
              <p className="text-[11px] text-slate-400">Hassle-free defect policy</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-800/40">
            <Headphones className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">24/7 Helpline</h4>
              <p className="text-[11px] text-slate-400">{settings.hotline}</p>
            </div>
          </div>
        </div>

        {/* Footer About Section & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 text-xs">
          
          {/* About Section (SEO Text Section) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">
                S
              </div>
              <span className="text-lg font-black text-white tracking-tight uppercase">
                {storeName}
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-red-500 uppercase tracking-wide">
              {settings.about_title}
            </h3>

            <p className="text-slate-400 leading-relaxed text-xs">
              {settings.about_p1}
            </p>

            <p className="text-slate-400 leading-relaxed text-xs">
              {settings.about_p2}
            </p>

            {/* Official Facebook Page Link */}
            <div className="pt-2">
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Official Facebook Page</span>
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Customer Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#/about"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about');
                  }}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/contact');
                  }}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#/faq"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/faq');
                  }}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  FAQ & Return Policy
                </a>
              </li>
              <li>
                <a
                  href="#/track"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/track');
                  }}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Helpline info */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Contact Info
            </h4>
            <p className="text-slate-400 leading-relaxed">
              <strong>Hotline:</strong><br />
              <span className="font-mono">{settings.hotline}</span>
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong>Email:</strong><br />
              <span>{settings.email}</span>
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for {storeName} with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Bangladesh
          </p>
        </div>

      </div>
    </footer>
  );
};
