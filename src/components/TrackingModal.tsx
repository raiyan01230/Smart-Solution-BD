import React, { useState, useEffect } from 'react';
import { X, PackageCheck, Search, Truck, Clock, CheckCircle, MapPin } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

interface SavedOrder {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product: {
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
  }>;
  grandTotal: number;
  status: string;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId,
}) => {
  const [query, setQuery] = useState(defaultOrderId || '');
  const [foundOrder, setFoundOrder] = useState<SavedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (defaultOrderId) {
      setQuery(defaultOrderId);
      handleSearchOrder(defaultOrderId);
    }
  }, [defaultOrderId]);

  if (!isOpen) return null;

  const handleSearchOrder = (searchQuery: string) => {
    const cleanQuery = searchQuery.trim().replace('#', '').toUpperCase();
    if (!cleanQuery) return;

    const saved: SavedOrder[] = JSON.parse(
      localStorage.getItem('ssbd_orders') || '[]'
    );

    const match = saved.find(
      (o) =>
        o.id.toUpperCase() === cleanQuery ||
        o.customer.phone.includes(cleanQuery)
    );

    setFoundOrder(match || null);
    setSearched(true);
  };

  const steps = [
    { title: 'Order Placed', desc: 'Order received & pending phone verification', done: true },
    { title: 'Processing & Packed', desc: 'Item inspected and packed at Dhaka warehouse', done: true },
    { title: 'In Transit', desc: 'Handed over to courier (Pathao / Steadfast)', done: false },
    { title: 'Delivered', desc: 'Delivered and payment collected', done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <PackageCheck className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Track Your Order
          </h2>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. SSBD-8921) or Phone No."
              className="w-full pl-3 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-red-500"
            />
          </div>
          <button
            onClick={() => handleSearchOrder(query)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </div>

        {/* Results display */}
        {searched && (
          <div>
            {foundOrder ? (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Order #{foundOrder.id}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-sm">
                      {foundOrder.status}
                    </span>
                  </div>
                  <p className="text-slate-500 mb-2">
                    Customer: {foundOrder.customer.name} ({foundOrder.customer.phone})
                  </p>
                  <p className="text-slate-500 line-clamp-1">
                    Address: {foundOrder.customer.address}
                  </p>
                </div>

                {/* Tracking Progress Bar Timeline */}
                <div className="py-2 space-y-4">
                  {steps.map((step, idx) => (
                    <div key={step.title} className="flex gap-3 items-start relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.done
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {step.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 my-0.5 ${
                              step.done ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No order found for "{query}"
                </p>
                <p className="text-xs text-slate-500">
                  Please double-check your Order ID or phone number.
                </p>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-6 text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your Order ID (provided after checkout) to view real-time delivery status from Dhaka warehouse to your doorstep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
