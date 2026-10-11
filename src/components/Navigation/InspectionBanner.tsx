import React from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Package, ShoppingCart, Users, LogOut, ShieldAlert } from 'lucide-react';

export const InspectionBanner: React.FC = () => {
  const { 
    impersonatingTenant, 
    exitImpersonation, 
    setActiveTab, 
    lang, 
    products, 
    sales, 
    customerProfiles 
  } = useApp();

  if (!impersonatingTenant) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-md z-40 border-b border-amber-500/50 print:hidden select-none animate-in fade-in slide-in-from-top-1">
      {/* Left: Indicator & Tenant Identity */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center shrink-0 text-white animate-pulse">
          <Eye className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-black/35 px-1.5 py-0.5 rounded text-amber-200">
              {lang === 'bn' ? 'স্টোর পরিদর্শন মোড' : 'Store Inspection'}
            </span>
            <span className="font-black text-sm truncate underline decoration-amber-300 decoration-2">
              {impersonatingTenant.name}
            </span>
          </div>
          <div className="text-[10px] opacity-90 font-mono truncate">
            {impersonatingTenant.email}
          </div>
        </div>
      </div>

      {/* Right: Quick Inspection Nav & Exit Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/45 text-white font-semibold transition cursor-pointer flex items-center gap-1 text-[11px]"
          title={lang === 'bn' ? 'এই শপের প্রোডাক্ট ইনভেন্টরি দেখুন' : 'View products'}
        >
          <Package className="w-3.5 h-3.5 text-amber-200" />
          <span>{lang === 'bn' ? 'পণ্য' : 'Products'} ({products?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/45 text-white font-semibold transition cursor-pointer flex items-center gap-1 text-[11px]"
          title={lang === 'bn' ? 'এই শপের বিক্রয় হিস্ট্রি দেখুন' : 'View sales history'}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-amber-200" />
          <span>{lang === 'bn' ? 'বিক্রয়' : 'Sales'} ({sales?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className="hidden md:flex px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/45 text-white font-semibold transition cursor-pointer items-center gap-1 text-[11px]"
          title={lang === 'bn' ? 'এই শপের কাস্টমার তালিকা দেখুন' : 'View customers'}
        >
          <Users className="w-3.5 h-3.5 text-amber-200" />
          <span>{lang === 'bn' ? 'কাস্টমার' : 'Customers'} ({customerProfiles?.length || 0})</span>
        </button>

        {/* Exit Inspection Button */}
        <button
          type="button"
          onClick={() => {
            exitImpersonation();
            setActiveTab('super_admin');
          }}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-950 font-black shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs hover:scale-[1.02] active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5 text-amber-700" />
          <span>{lang === 'bn' ? 'প্রিভিউ বন্ধ করে সুপার এডমিনে ফিরুন' : 'Exit to Super Admin HQ'}</span>
        </button>
      </div>
    </div>
  );
};
