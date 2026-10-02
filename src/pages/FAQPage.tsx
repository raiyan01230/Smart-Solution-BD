import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

export const FAQPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'Place your order without any advance payment. When our courier agent arrives with your parcel, you can inspect the package and pay the cash amount.',
    },
    {
      q: 'What are the delivery charges and delivery times?',
      a: 'Inside Dhaka City delivery fee is ৳70 (takes 24 to 36 hours). Outside Dhaka delivery fee is ৳120 across all 64 districts in Bangladesh (takes 2 to 4 days).',
    },
    {
      q: 'How can I track my order?',
      a: 'Click the "TRACK" button in the top menu or go to /#/track. Type your Order ID (e.g. SSBD-8921) or 11-digit mobile number to view real-time status updates.',
    },
    {
      q: 'What if I receive a defective or broken product?',
      a: 'Smart Solution BD provides a 7-day replacement guarantee. If you notice any technical defect or damage, contact our helpline (+8801700000000) or WhatsApp us immediately for a free replacement.',
    },
    {
      q: 'How do I apply a promo code for discounts?',
      a: 'During checkout or in your shopping cart page, type your promo code (e.g. WELCOME10 or SMART100) in the promo field and click "Apply". The discount will be calculated automatically.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <HelpCircle className="w-7 h-7 text-red-600" />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Got questions about shopping at Smart Solution BD? Find answers below.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
