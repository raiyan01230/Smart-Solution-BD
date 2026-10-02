import React from 'react';
import { Wrench, Shield, ArrowRight } from 'lucide-react';

interface MaintenancePageProps {
  message: string;
  navigate: (path: string) => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ message, navigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto animate-pulse">
          <Wrench className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-red-500 tracking-widest">
            System Maintenance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Smart Solution BD
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-700">
          {message || 'We are currently performing scheduled maintenance to upgrade our servers and shopping system. Please check back shortly!'}
        </p>

        <p className="text-[11px] text-slate-400">
          Need urgent assistance regarding a pending order? Reach out to us on WhatsApp: <strong>+880 1700-000000</strong>
        </p>

        <div className="pt-4 border-t border-slate-700 flex justify-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Authorized Admin Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};
