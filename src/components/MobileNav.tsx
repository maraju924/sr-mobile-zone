import React, { useState } from 'react';
import { 
  Zap, 
  Package, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  Settings,
  Truck,
  Wrench,
  Receipt,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, notifications, t } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const unreadAlerts = notifications.filter(n => !n.read).length;

  const primaryTabs: { id: ActiveTab; labelBn: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'pos', labelBn: 'পিওএস', labelEn: 'POS', icon: Zap },
    { id: 'inventory', labelBn: 'স্টক', labelEn: 'Stock', icon: Package },
    { id: 'sales', labelBn: 'বিক্রয়', labelEn: 'Sales', icon: FileText },
    { id: 'installments', labelBn: 'কিস্তি ও বাকি', labelEn: 'EMI', icon: CreditCard },
  ];

  const moreTabs: { id: ActiveTab; labelBn: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'suppliers', labelBn: 'সাপ্লায়ার ও স্টক ক্রয়', labelEn: 'Suppliers & Purchases', icon: Truck },
    { id: 'repairs', labelBn: 'সার্ভিসিং ও রিপেয়ারিং', labelEn: 'Repairs & Servicing', icon: Wrench },
    { id: 'expenses', labelBn: 'দৈনিক দোকান খরচ ও ক্যাশ ড্রয়ার', labelEn: 'Store Expenses & Drawer', icon: Receipt },
    { id: 'warranty', labelBn: 'ওয়ারেন্টি ও কাস্টমার রিটার্ন', labelEn: 'Warranty & Claims', icon: ShieldCheck },
    { id: 'reports', labelBn: 'রিপোর্ট, অ্যানালিটিক্স ও লাভ', labelEn: 'Reports & Analytics', icon: TrendingUp },
    { id: 'settings', labelBn: 'দোকান সেটিংস ও ব্যাকআপ', labelEn: 'Settings & Cloud Sync', icon: Settings },
  ];

  const isMoreTabActive = moreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 flex items-center justify-around select-none">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition relative min-w-[56px] ${
                isActive 
                  ? 'text-indigo-600 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition ${isActive ? 'bg-indigo-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {t(tab.labelBn, tab.labelEn)}
              </span>

              {/* Cart Badge */}
              {tab.id === 'pos' && cart.length > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition relative min-w-[56px] ${
            isMoreTabActive || isMoreMenuOpen
              ? 'text-indigo-600 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${isMoreTabActive || isMoreMenuOpen ? 'bg-indigo-50' : ''}`}>
            <MoreHorizontal className={`w-5 h-5 ${isMoreTabActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none">
            {t('মেনু', 'More')}
          </span>

          {unreadAlerts > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      </nav>

      {/* More Options Drawer Sheet */}
      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto pb-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">
                {t('সকল মডিউল ও ফিচার', 'All Features & Modules')}
              </span>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
              {moreTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight line-clamp-2">
                      {t(tab.labelBn, tab.labelEn)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
