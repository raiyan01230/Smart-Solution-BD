import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const FREE_SHIPPING_THRESHOLD = 2000;
  const progressPercent = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                Shopping Cart ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 px-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
              <Truck className="w-4 h-4 shrink-0" />
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span>🎉 You unlocked <strong>Free Shipping!</strong></span>
              ) : (
                <span>Add <strong>৳{FREE_SHIPPING_THRESHOLD - subtotal}</strong> more for Free Shipping</span>
              )}
            </div>
            <div className="w-full bg-red-200 dark:bg-red-950/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your cart is empty
                </p>
                <p className="text-xs text-slate-400">
                  Add some amazing gadgets to start shopping!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-red-600 dark:text-red-500 font-mono">
                        ৳{item.product.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                        ৳{item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200">
                <span>Subtotal:</span>
                <span className="text-lg font-black text-red-600 dark:text-red-500 font-mono">
                  ৳{subtotal}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Delivery charges will be calculated at checkout based on location.
              </p>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
