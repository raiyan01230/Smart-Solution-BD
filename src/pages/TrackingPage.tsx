import React, { useState, useEffect } from 'react';
import { fetchOrders, Order } from '../services/dbService';
import { PackageCheck, Search, Truck, Clock, CheckCircle2, MapPin, Phone, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';

interface TrackingPageProps {
  orderIdParam?: string;
  navigate: (path: string) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ orderIdParam, navigate }) => {
  const [query, setQuery] = useState(orderIdParam || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);

      if (orderIdParam) {
        setQuery(orderIdParam);
        findOrderInList(orderIdParam, data);
      }
    }
    loadData();
  }, [orderIdParam]);

  const findOrderInList = (searchQuery: string, orderList: Order[]) => {
    const clean = searchQuery.trim().replace('#', '').toUpperCase();
    if (!clean) return;

    const match = orderList.find(
      (o) => o.id.toUpperCase() === clean || o.customer_phone.includes(clean)
    );

    setFoundOrder(match || null);
    setSearched(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    findOrderInList(query, orders);
  };

  const STATUS_STEPS: Array<{ title: Order['status']; desc: string }> = [
    { title: 'Order Placed', desc: 'Order submitted & awaiting phone confirmation' },
    { title: 'Confirmed', desc: 'Customer verified by Smart Solution BD team' },
    { title: 'Processing', desc: 'Gadget inspected & packed at Dhaka warehouse' },
    { title: 'Shipped', desc: 'Handed over to delivery partner (Pathao / Steadfast)' },
    { title: 'Out for Delivery', desc: 'Courier agent on the way to your address' },
    { title: 'Delivered', desc: 'Delivered & cash payment collected' },
  ];

  const getStepStatus = (stepTitle: Order['status'], currentStatus: Order['status']) => {
    if (currentStatus === 'Cancelled') return 'cancelled';
    
    const orderIndex = STATUS_STEPS.findIndex((s) => s.title === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex((s) => s.title === stepTitle);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Order Tracking System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your Order ID (e.g. SSBD-8921) or 11-digit mobile number to track status.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID (SSBD-xxxx) or Mobile No"
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-red-500 uppercase"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Track Order</span>
          </button>
        </form>

        {loading && (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">
            Fetching order records...
          </div>
        )}

        {!loading && searched && (
          <div>
            {foundOrder ? (
              <div className="space-y-6">
                
                {/* Order Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">Order Identifier</span>
                      <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">
                        #{foundOrder.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Current Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                        foundOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : foundOrder.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {foundOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Customer Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{foundOrder.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone Number:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{foundOrder.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Delivery Zone:</span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">
                        {foundOrder.delivery_area === 'dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳120)'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">Delivery Address:</span>
                    <span className="font-semibold">{foundOrder.customer_address}</span>
                  </div>

                  {/* Items Ordered List */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Purchased Items:
                    </span>
                    {foundOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.product.name} <span className="text-slate-400 font-mono">(x{item.quantity})</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ৳{item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline text-xs font-bold text-slate-900 dark:text-white">
                    <span>Grand Total Payable (COD):</span>
                    <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">
                      ৳{foundOrder.grand_total}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">
                    Real-time Delivery Timeline:
                  </h3>

                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, idx) => {
                      const state = getStepStatus(step.title, foundOrder.status);
                      return (
                        <div key={step.title} className="flex gap-4 items-start relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                state === 'completed' || state === 'current'
                                  ? 'bg-red-600 text-white shadow-md'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {state === 'completed' || state === 'current' ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                              <div
                                className={`w-0.5 h-10 my-1 ${
                                  state === 'completed' ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                              />
                            )}
                          </div>

                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs sm:text-sm font-bold ${
                                state === 'current'
                                  ? 'text-red-600 dark:text-red-500'
                                  : state === 'completed'
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-400'
                              }`}>
                                {step.title}
                              </h4>
                              {state === 'current' && (
                                <span className="text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-2 py-0.5 rounded-full uppercase">
                                  Current Status
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WhatsApp Order Confirmation Button */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                      Need quick support on WhatsApp?
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      Send order details directly to Smart Solution BD customer care team.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                      `Hello Smart Solution BD, I want to inquire about my Order #${foundOrder.id}. Customer Name: ${foundOrder.customer_name}, Phone: ${foundOrder.customer_phone}. Total Payable: ৳${foundOrder.grand_total}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#25D366] hover:bg-[#1ebd53] text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Order Support</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  No Order Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We couldn't find any order matching "{query}". Please check your Order ID or phone number.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
