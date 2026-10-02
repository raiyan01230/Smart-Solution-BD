import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle, ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { StoreSettings } from '../services/dbService';

interface ContactPageProps {
  navigate: (path: string) => void;
  storeSettings?: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate, storeSettings }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');

  const settings = storeSettings || {
    store_name: 'Smart Solution BD',
    hotline: '+880 1700-000000',
    whatsapp_number: '8801700000000',
    email: 'support@smartsolutionbd.com',
    facebook_url: 'https://www.facebook.com/profile.php?id=61594778919594',
  };

  // Google SEO Knowledge Panel Schema.org JSON-LD
  useEffect(() => {
    document.title = `Contact Us - ${settings.store_name} | Hotline & Customer Care BD`;

    const scriptId = 'contact-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contact ${settings.store_name}`,
      url: window.location.href,
      mainEntity: {
        '@type': 'LocalBusiness',
        name: settings.store_name,
        telephone: settings.hotline,
        email: settings.email,
        sameAs: [settings.facebook_url],
        openingHours: 'Mo-Sa 10:00-20:00',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Multiplan Center, Elephant Road',
          addressLocality: 'Dhaka',
          addressRegion: 'Dhaka',
          postalCode: '1205',
          addressCountry: 'BD',
        },
      },
    };

    scriptTag.text = JSON.stringify(schema);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <img
              src="/logo.png"
              alt={settings.store_name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span className="text-xs font-extrabold uppercase text-red-600 tracking-wider">
                Customer Support Hub
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                Contact {settings.store_name}
              </h1>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Phone className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Hotline Number:</strong>
                <a href={`tel:${settings.hotline}`} className="text-red-600 dark:text-red-400 font-mono font-bold hover:underline">
                  {settings.hotline}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Mail className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Customer Support Email:</strong>
                <a href={`mailto:${settings.email}`} className="text-slate-700 dark:text-slate-300 font-bold hover:underline">
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Dhaka Warehouse Hub:</strong>
                <span className="text-slate-600 dark:text-slate-300">Level 4, Multiplan Center, Elephant Road, Dhaka, Bangladesh</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Working Hours:</strong>
                <span className="text-slate-600 dark:text-slate-300">Saturday – Thursday: 10:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#1ebd53] text-white text-xs font-black uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Message Received!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thank you for reaching out to {settings.store_name}. Our support agent will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
                Send Us A Direct Inquiry
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Hasan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Inquiry / Order Question
                </label>
                <textarea
                  required
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="How can we help you regarding your order or product choice?"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wide rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
