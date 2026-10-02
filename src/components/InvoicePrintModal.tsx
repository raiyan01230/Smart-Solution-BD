import React, { useRef, useState } from 'react';
import { Order, StoreSettings } from '../services/dbService';
import { Printer, X, Download, Image as ImageIcon, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';

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
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsGeneratingImage(true);
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Smart-Solution-BD-Invoice-${order.id}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate invoice image:', err);
      window.print();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePrintImage = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsGeneratingImage(true);
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Official Invoice #${order.id} - Smart Solution BD</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #f8fafc; font-family: sans-serif; }
                .print-container { text-align: center; max-width: 800px; width: 100%; }
                img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; background: #fff; }
                @media print {
                  body { padding: 0; background: #fff; }
                  img { box-shadow: none; border: none; width: 100%; }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 500);" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Failed to print invoice image:', err);
      window.print();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Modal Actions Header (Hidden when printing via print:hidden class) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-4 sm:p-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 print:hidden gap-2">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">
              Official Invoice & Print Studio
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintImage}
              disabled={isGeneratingImage}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              title="Convert invoice to pristine image and print"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isGeneratingImage ? 'Generating Image...' : 'Print Image'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Download invoice PNG image"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Standard Browser Print"
            >
              <Printer className="w-4 h-4" />
              <span>Browser Print</span>
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
        <div ref={invoiceRef} className="printable-invoice bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs font-sans text-xs">
          
          {/* Header Brand Block */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-red-600 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-tight text-red-600 uppercase">
                  Smart Solution BD
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Premium Smartwatches, ANC Earbuds & Tech Accessories in Bangladesh
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
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
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-700 mt-1 border border-red-200">
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
                          className="w-10 h-10 object-contain rounded border border-slate-200 p-0.5 bg-white"
                          crossOrigin="anonymous"
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
              <p>For support or returns, visit https://raiyan01230.github.io/Smart-Solution-BD/</p>
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
