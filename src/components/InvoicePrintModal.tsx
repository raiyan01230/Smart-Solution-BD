import React from 'react';
import { Order, StoreSettings } from '../services/dbService';
import { Printer, X, Download, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface InvoicePrintModalProps {
  order: Order | null;
  storeSettings: StoreSettings;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  order,
  storeSettings,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Modal Actions Header (Hidden when printing via print:hidden class) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-4 sm:p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">
              Print Official Invoice
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- PRINTABLE INVOICE TEMPLATE --- */}
        <div className="printable-invoice bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs font-sans text-xs">
          
          {/* Header Brand Block */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-red-600 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-base">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-tight text-red-600 uppercase">
                  Smart Solution BD
                </h1>
              </div>
              <p className="text-[11px] text-slate-500">
                Premium Smartwatches, ANC Earbuds & Tech Accessories
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Hotline: {storeSettings.hotline} | Email: {storeSettings.email}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">
                OFFICIAL INVOICE
              </span>
              <span className="text-lg font-mono font-black text-red-600 block">
                #{order.id}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Date: {new Date(order.date).toLocaleDateString()}
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 mt-1 border border-slate-200">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Block */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase text-red-600 mb-2 tracking-wider">
                Customer Information:
              </h3>
              <p className="font-extrabold text-sm text-slate-900 mb-0.5">{order.customer_name}</p>
              <p className="font-mono text-slate-700 font-bold mb-1">📱 Phone: {order.customer_phone}</p>
              <p className="text-slate-600 leading-relaxed">
                📍 <strong>Delivery Address:</strong> {order.customer_address}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase text-red-600 mb-2 tracking-wider">
                Order & Shipping Details:
              </h3>
              <p className="text-slate-700">
                <strong>Delivery Zone:</strong> {order.delivery_area === 'dhaka' ? 'Inside Dhaka City (৳70)' : 'Outside Dhaka (৳120)'}
              </p>
              <p className="text-slate-700 mt-1">
                <strong>Payment Method:</strong> {order.payment_method}
              </p>
              {order.notes && (
                <p className="text-slate-600 italic mt-1 bg-white p-1.5 rounded border border-slate-200">
                  Note: {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700 uppercase text-[10px] font-black">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 object-contain rounded border border-slate-200 p-0.5 print:block"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.product.name}</span>
                          <span className="text-[10px] text-slate-500">{item.product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">৳{item.product.price}</td>
                    <td className="py-3 px-3 text-right font-mono font-black">৳{item.product.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1.5 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold">৳{order.items_total}</span>
              </div>

              {order.promo_discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount:</span>
                  <span className="font-mono">-৳{order.promo_discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-mono font-bold">৳{order.delivery_fee}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total (COD):</span>
                <span className="text-base text-red-600 font-mono">৳{order.grand_total}</span>
              </div>
            </div>
          </div>

          {/* Signature & Authorization Footer */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Thank you for shopping with Smart Solution BD!</p>
              <p>For support or returns, visit https://smartsolutionbd.github.io</p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <p className="font-bold uppercase tracking-wider text-slate-700">Authorized Signature</p>
            </div>
          </div>

        </div>

      </div>

      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-invoice, .printable-invoice * {
            visibility: visible;
          }
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
