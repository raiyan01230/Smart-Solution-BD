import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, Phone, MapPin, User, ArrowLeft } from 'lucide-react';
import { CartItem } from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = location === 'dhaka' ? 60 : 120;
  const grandTotal = itemsTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !address.trim()) {
      alert('Please fill in all required delivery fields.');
      return;
    }

    if (phoneNumber.length < 11) {
      alert('Please enter a valid 11-digit Bangladeshi mobile phone number (e.g. 01712345678).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `SSBD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newOrder = {
        id: generatedId,
        date: new Date().toISOString(),
        customer: {
          name: fullName,
          phone: phoneNumber,
          address,
          location,
        },
        items: cartItems,
        itemsTotal,
        deliveryFee,
        grandTotal,
        paymentMethod,
        status: 'Order Placed',
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('ssbd_orders') || '[]');
      localStorage.setItem('ssbd_orders', JSON.stringify([newOrder, ...existingOrders]));

      setIsSubmitting(false);
      setConfirmedOrderId(generatedId);
      onOrderSuccess(generatedId);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-4 sm:p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrderId ? (
          /* Order Confirmation Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
              Order Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-md mx-auto">
              Thank you for ordering from Smart Solution BD. Your order has been logged and our team will call you shortly to confirm delivery.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto mb-6 text-left">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">Order ID:</span>
                <span className="text-sm font-black text-red-600 font-mono">
                  #{confirmedOrderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{fullName}</span>
              </div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Payable:</span>
                <span className="text-sm font-black text-red-600 font-mono">৳{grandTotal} (COD)</span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedOrderId(null);
                onClose();
              }}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md"
            >
              Back to Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Truck className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Cash on Delivery Checkout
              </h2>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Customer Info */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (11 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Holding no, Road no, Area, Thana, District"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              {/* Delivery Zone Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Delivery Zone:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setLocation('dhaka')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col justify-between ${
                      location === 'dhaka'
                        ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Inside Dhaka City</span>
                    <span className="text-sm font-black font-mono mt-1">৳60</span>
                  </label>

                  <label
                    onClick={() => setLocation('outside')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col justify-between ${
                      location === 'outside'
                        ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Outside Dhaka (All BD)</span>
                    <span className="text-sm font-black font-mono mt-1">৳120</span>
                  </label>
                </div>
              </div>

              {/* Order Calculation Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Products ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                  <span className="font-mono font-bold">৳{itemsTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-bold">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Payable:</span>
                  <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">
                    ৳{grandTotal}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Order...' : 'Confirm Cash on Delivery Order'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
