import React, { useState } from 'react';
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Globe, 
  User, 
  Check, 
  AlertTriangle, 
  Calendar, 
  ShieldAlert, 
  X,
  CreditCard,
  Package,
  FileText,
  TrendingUp,
  Settings,
  ShieldCheck,
  Truck,
  Wrench,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const { 
    settings, 
    activeTab, 
    setActiveTab, 
    lang, 
    setLang, 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    syncNow, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    user, 
    login,
    t 
  } = useApp();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems: { id: ActiveTab; labelBn: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'pos', labelBn: 'পিওএস', labelEn: 'POS', icon: Zap },
    { id: 'inventory', labelBn: 'স্টক', labelEn: 'Stock', icon: Package },
    { id: 'sales', labelBn: 'বিক্রয়', labelEn: 'Sales', icon: FileText },
    { id: 'installments', labelBn: 'কিস্তি ও বাকি', labelEn: 'EMI & Dues', icon: CreditCard },
    { id: 'suppliers', labelBn: 'সাপ্লায়ার ও ক্রয়', labelEn: 'Suppliers', icon: Truck },
    { id: 'repairs', labelBn: 'সার্ভিসিং', labelEn: 'Repairs', icon: Wrench },
    { id: 'expenses', labelBn: 'খরচ ও ক্যাশ', labelEn: 'Expenses', icon: Receipt },
    { id: 'warranty', labelBn: 'ওয়ারেন্টি', labelEn: 'Claims', icon: ShieldCheck },
    { id: 'reports', labelBn: 'রিপোর্ট', labelEn: 'Reports', icon: TrendingUp },
    { id: 'settings', labelBn: 'সেটিংস', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0 sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14 sm:h-16">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-white flex items-center gap-1.5">
              <span>ElectroPOS</span>
              <span className="hidden md:inline-block text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                ইলেকট্রনিক্স
              </span>
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
              {settings.storeName}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(item.labelBn, item.labelEn)}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools (Online badge, Sync, Notifications, Language, User) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Online / Offline status badge */}
          <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
          }`}>
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-[10px]">{t('অনলাইন', 'Online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="font-mono text-[10px]">{t('অফলাইন মোড', 'Offline')}</span>
              </>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={syncNow}
            title={t('ক্লাউড সিঙ্ক করুন', 'Sync to Cloud')}
            className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition relative ${
              isSyncing ? 'text-indigo-400' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {pendingSyncCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[16px] h-4 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {pendingSyncCount}
              </span>
            )}
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in text-slate-800">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs sm:text-sm">{t('রিয়েল-টাইম নোটিফিকেশন', 'Live Notifications')}</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        {t('সব মুছুন', 'Clear all')}
                      </button>
                    )}
                    <button onClick={() => setIsNotificationOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {t('কোন নতুন নোটিফিকেশন নেই', 'No new notifications')}
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionTab) setActiveTab(n.actionTab as ActiveTab);
                          setIsNotificationOpen(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${
                          !n.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <span className="mt-0.5">
                          {n.type === 'low_stock' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-bold text-slate-800 leading-tight">{n.title}</h6>
                          <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Developer Credit */}
          <a
            href="https://www.fb.com/9alamin"
            target="_blank"
            rel="noopener noreferrer"
            title="সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 hover:text-white border border-indigo-700/50 rounded-xl text-[11px] font-medium transition"
          >
            <span className="text-[10px] text-slate-400">{t('তৈরি:', 'Dev:')}</span>
            <span className="font-semibold text-indigo-200 hover:underline">www.fb.com/9alamin</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            title={t('ভাষা পরিবর্তন করুন', 'Switch Language')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? 'ENG' : 'বাং'}</span>
          </button>

          {/* User Sign In / Profile */}
          {!user && (
            <button
              onClick={login}
              title={t('গুগল লগইন', 'Google Sign In')}
              className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs font-semibold flex items-center gap-1.5 px-2.5"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('লগইন', 'Login')}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
