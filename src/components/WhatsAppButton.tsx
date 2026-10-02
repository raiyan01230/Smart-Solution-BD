import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = '8801700000000'; // Default Smart Solution BD contact number
  const message = encodeURIComponent(
    'Hello Smart Solution BD! I am visiting your website and have a question about a product.'
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white stroke-none" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
        Chat with Us
      </span>
    </a>
  );
};
