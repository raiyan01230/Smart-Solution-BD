import React, { useState } from 'react';
import { CartItem } from '../components/CartDrawer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Tag, Check, AlertCircle } from 'lucide-react';
import { validateAndApplyPromo } from '../lib/promoHelper';
import { PromoCode } from '../services/dbService';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  availablePromos: PromoCode[];
  appliedPromo: PromoCode | null;
  setAppliedPromo: (promo: PromoCode | null) => void;
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  availablePromos,
  appliedPromo,
  setAppliedPromo,
  navigate,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedPromo) {
    const res = validateAndApplyPromo(appliedPromo.code, subtotal, availablePromos);
    discountAmount = res.discountAmount;
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateAndApplyPromo(promoInput, subtotal, availablePromos);
    if (res.success && res.promoCode) {
      setAppliedPromo(res.promoCode);
      setPromoMessage({ text: res.message, isError: false });
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-red-600" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Shopping Cart ({cartItems.length} items)
          </h1>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
          <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            Your cart is currently empty
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Explore our collection of earbuds, smart watches, and tech accessories!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md cursor-pointer"
          >
            Explore Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items Table/List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-4"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-contain bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-100 dark:border-slate-800 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                  }}
                />

                <div className="flex-1 w-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <a
                        href={`/#/product/${item.product.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/product/${item.product.id}`);
                        }}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </a>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Category: {item.product.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">
                        ৳{item.product.price} each
                      </span>
                      <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">
                        ৳{item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Promo Code Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-red-600" />
                <span>Promo Code</span>
              </label>

              {appliedPromo ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block font-mono">
                      {appliedPromo.code}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Saved ৳{discountAmount}
                    </span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="e.g. WELCOME10 or SHM100"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {promoMessage && (
                <p
                  className={`text-[11px] font-semibold mt-2 flex items-center gap-1 ${
                    promoMessage.isError ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {promoMessage.isError ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{promoMessage.text}</span>
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold">৳{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Promo Discount:</span>
                  <span className="font-mono">-৳{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Delivery Fee:</span>
                <span className="font-mono">From ৳70</span>
              </div>

              <div className="flex justify-between items-baseline text-sm font-black text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Subtotal:</span>
                <span className="text-xl text-red-600 dark:text-red-500 font-mono">
                  ৳{subtotal - discountAmount}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
