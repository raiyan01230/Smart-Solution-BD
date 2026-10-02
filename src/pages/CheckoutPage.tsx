import React, { useState } from 'react';
import { CartItem } from '../components/CartDrawer';
import { PromoCode, createOrder, StoreSettings } from '../services/dbService';
import { validateAndApplyPromo } from '../lib/promoHelper';
import { Truck, ShieldCheck, User, Phone, MapPin, Tag, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  availablePromos: PromoCode[];
  appliedPromo: PromoCode | null;
  setAppliedPromo: (promo: PromoCode | null) => void;
  storeSettings: StoreSettings;
  navigate: (path: string) => void;
  onClearCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  availablePromos,
  appliedPromo,
  setAppliedPromo,
  storeSettings,
  navigate,
  onClearCart,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo code local state
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = location === 'dhaka' ? storeSettings.inside_dhaka_fee : storeSettings.outside_dhaka_fee;

  let promoDiscount = 0;
  if (appliedPromo) {
    const res = validateAndApplyPromo(appliedPromo.code, itemsTotal, availablePromos);
    promoDiscount = res.discountAmount;
  }

  const grandTotal = Math.max(0, itemsTotal - promoDiscount + deliveryFee);

  // Phone Validation Logic: Accept exactly 11 digits starting with 01
  const validatePhone = (phone: string): boolean => {
    const clean = phone.trim();
    const bdRegex = /^01[3-9]\d{8}$/;
    if (!bdRegex.test(clean)) {
      setPhoneError('Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 01712345678).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateAndApplyPromo(promoInput, itemsTotal, availablePromos);
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !address.trim()) {
      alert('Please fill in your full name and delivery address.');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      navigate('/');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `SSBD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        customer_name: fullName.trim(),
        customer_phone: phoneNumber.trim(),
        customer_address: address.trim(),
        delivery_area: location,
        items: cartItems,
        items_total: itemsTotal,
        delivery_fee: deliveryFee,
        promo_discount: promoDiscount,
        promo_code: appliedPromo?.code,
        grand_total: grandTotal,
        payment_method: 'Cash on Delivery (COD)',
        status: 'Order Placed' as const,
        notes: notes.trim() || undefined,
      };

      await createOrder(newOrder);

      onClearCart();
      setIsSubmitting(false);
      navigate(`/track/${orderId}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setIsSubmitting(false);
      alert('Something went wrong while placing your order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Please add products to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/cart')}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping Cart</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Truck className="w-5 h-5 text-red-600" />
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Cash on Delivery Checkout
            </h1>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bangladesh Mobile Number (11 Digits) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (phoneError) validatePhone(e.target.value);
                  }}
                  onBlur={() => validatePhone(phoneNumber)}
                  placeholder="e.g. 01712345678"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border ${
                    phoneError
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden font-mono`}
                />
              </div>
              {phoneError && (
                <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Delivery Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Holding no, Road no, Area, Thana, District"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            {/* Delivery Location Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Delivery Zone:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setLocation('dhaka')}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col justify-between ${
                    location === 'dhaka'
                      ? 'border-red-600 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Inside Dhaka City</span>
                  <span className="text-sm font-black font-mono mt-1 text-red-600 dark:text-red-500">
                    ৳{storeSettings.inside_dhaka_fee}
                  </span>
                </div>

                <div
                  onClick={() => setLocation('outside')}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col justify-between ${
                    location === 'outside'
                      ? 'border-red-600 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Outside Dhaka (All BD)</span>
                  <span className="text-sm font-black font-mono mt-1 text-red-600 dark:text-red-500">
                    ৳{storeSettings.outside_dhaka_fee}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special delivery instructions, preferred delivery time, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wide rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Cash on Delivery Order'}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
            Item Summary ({cartItems.length})
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-center text-xs">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-slate-400 font-mono">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  ৳{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code Input inside Checkout */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {appliedPromo ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                    {appliedPromo.code}
                  </span>
                  <span className="text-[11px] text-emerald-600 ml-2">
                    (-৳{promoDiscount})
                  </span>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
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
                  placeholder="Promo Code"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
            {promoMessage && (
              <p
                className={`text-[11px] font-semibold mt-1.5 ${
                  promoMessage.isError ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {promoMessage.text}
              </p>
            )}
          </div>

          {/* Calculation */}
          <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Items Total:</span>
              <span className="font-mono font-bold">৳{itemsTotal}</span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Promo Discount:</span>
                <span className="font-mono">-৳{promoDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery Charge ({location === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
              <span className="font-mono font-bold">৳{deliveryFee}</span>
            </div>

            <div className="flex justify-between items-baseline text-sm font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>Total Payable (COD):</span>
              <span className="text-xl text-red-600 dark:text-red-500 font-mono font-black">
                ৳{grandTotal}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>You will pay in cash to the courier delivery agent upon receiving and inspecting your package.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
