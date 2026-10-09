import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu, 
  Search, 
  Plus, 
  Globe, 
  MessageSquare, 
  Bell, 
  User, 
  Building2, 
  Check, 
  ChevronDown, 
  ShieldCheck, 
  Smartphone, 
  ShoppingCart, 
  FileText, 
  Repeat, 
  Wrench,
  Sparkles,
  LogOut,
  Barcode
} from 'lucide-react';
import { Branch } from '../../types';
import { UniversalScannerModal } from '../Common/UniversalScannerModal';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    branch, 
    setBranch, 
    lang, 
    setLang, 
    activeTab, 
    setActiveTab, 
    notifications, 
    chatMessages,
    devices,
    currentUser,
    authLogout
  } = useApp();

  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUniversalScanner, setShowUniversalScanner] = useState(false);

  const branches: Branch[] = ['BP-ISHWARGONJ', 'BP-MYMENSINGH'];
  const unreadChats = (chatMessages || []).filter(m => m && m.sender === 'customer' && !m.read).length;
  const unreadNotifications = (notifications || []).filter(n => n && !n.read).length;
  const lockedDevicesCount = (devices || []).filter(d => d && d.lockStatus === 'LOCKED').length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return lang === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview';
      case 'devices': return lang === 'bn' ? 'ডিভাইস লকার ও কন্ট্রোল' : 'Financed Devices & Locker';
      case 'livewall': return lang === 'bn' ? 'লাইভ ওয়াল কন্ট্রোল রুম' : 'Live Wall Operations Center';
      case 'pos': return lang === 'bn' ? 'পিওএস ও বিক্রয় টার্মিনাল' : 'Point of Sale (POS)';
      case 'sales': return lang === 'bn' ? 'বিক্রয় ও ইনভয়েস হিস্ট্রি' : 'Sales History';
      case 'contracts': return lang === 'bn' ? 'ইএমআই কিস্তি কন্ট্রাক্ট' : 'EMI Finance Contracts';
      case 'installments': return lang === 'bn' ? 'কিস্তি ও বকেয়া কালেকশন' : 'Installment & Due Collections';
      case 'customers': return lang === 'bn' ? 'কাস্টমার ও কেওয়াইসি প্রোফাইল' : 'Customer & KYC Management';
      case 'inventory': return lang === 'bn' ? 'পণ্য ও ইনভেন্টরি স্টক' : 'Stock & Inventory';
      case 'usedbuy': return lang === 'bn' ? 'পুরনো ফোন ক্রয় ও চুক্তিপত্র' : 'Used Phone Buyback (Legal Deed)';
      case 'suppliers': return lang === 'bn' ? 'সাপ্লায়ার ও পারচেজ লেজার' : 'Suppliers & Purchases';
      case 'accounting': return lang === 'bn' ? 'হিসাবরক্ষণ ও আর্থিক বিবরণী' : 'Accounting & Financials';
      case 'reports': return lang === 'bn' ? '৮০-রিপোর্ট সেন্টার' : '80-Report Intelligence Center';
      case 'repairs': return lang === 'bn' ? 'সার্ভিসিং ও মেরামত' : 'Repairs & Servicing';
      case 'sms': return lang === 'bn' ? 'এসএমএস গেটওয়ে ও অ্যালার্ট' : 'SMS Control & Alerts';
      case 'chat': return lang === 'bn' ? 'কাস্টমার সাপোর্ট চ্যাট' : 'Support Live Chat';
      case 'staff': return lang === 'bn' ? 'স্টাফ ও বেতন ব্যবস্থাপনা' : 'Staff & Payroll';
      case 'settings': return lang === 'bn' ? 'সিস্টেম ও শপ সেটিংস' : 'Settings & Preferences';
      default: return 'ElectroPOS Enterprise';
    }
  };

  return (
    <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-3 sm:px-4 border-b border-slate-800 shrink-0 z-30 select-none shadow-md">
      {/* Left: Hamburger, Tenant & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition focus:outline-none"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>PhoneSell <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 bg-indigo-950/80 rounded border border-indigo-500/30">PRO</span></span>
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs sm:text-sm font-medium text-slate-300 hidden md:inline truncate max-w-xs">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[110px] sm:max-w-none">{branch}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                Switch Branch (মাল্টি-ব্রাঞ্চ)
              </div>
              {branches.map(b => (
                <button
                  key={b}
                  onClick={() => {
                    setBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 transition ${
                    branch === b ? 'text-indigo-300 font-bold bg-indigo-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>{b}</span>
                  {branch === b && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Create (+) Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
            title="Quick Create"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Action (কুইক ক্রিয়েট)
              </div>
              <button
                onClick={() => { setActiveTab('pos'); setShowQuickCreate(false); }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>New Cash Sale (নগদ বিক্রি)</span>
              </button>
              <button
                onClick={() => { setActiveTab('installments'); setShowQuickCreate(false); }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700"
              >
                <Repeat className="w-4 h-4 text-indigo-600" />
                <span>New EMI Sale (কিস্তিতে বিক্রি)</span>
              </button>
              <button
                onClick={() => { setActiveTab('devices'); setShowQuickCreate(false); }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700"
              >
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>Add & Enroll Device (লকার যুক্ত)</span>
              </button>
              <button
                onClick={() => { setActiveTab('usedbuy'); setShowQuickCreate(false); }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Used Phone Buy (পুরনো ফোন ক্রয়)</span>
              </button>
              <button
                onClick={() => { setActiveTab('repairs'); setShowQuickCreate(false); }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>New Repair Job (মেরামত সার্ভিস)</span>
              </button>
            </div>
          )}
        </div>

        {/* Universal Barcode & IMEI Scanner Button */}
        <button
          onClick={() => setShowUniversalScanner(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          title="বারকোড ও IMEI স্ক্যান করুন (Universal Scanner)"
        >
          <Barcode className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">স্ক্যানার</span>
        </button>

        {/* Language Toggle (EN / BN) */}
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 transition flex items-center gap-1"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'en' ? 'EN' : 'বাং'}</span>
        </button>

        {/* Support Chat Icon with badge */}
        <button
          onClick={() => setActiveTab('chat')}
          className="relative p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Customer Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadChats > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadChats}
            </span>
          )}
        </button>

        {/* Notification Bell with red badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {(unreadNotifications > 0 || lockedDevicesCount > 0) && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Alerts & Notifications</span>
                <span className="text-[10px] text-slate-500 font-mono">Live</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {lockedDevicesCount > 0 && (
                  <div className="p-2.5 bg-rose-50/70 hover:bg-rose-50 flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0"></span>
                    <div>
                      <div className="font-bold text-rose-800">
                        {lockedDevicesCount} Devices Locked / Overdue
                      </div>
                      <div className="text-[11px] text-rose-600">
                        কিস্তি বকেয়া থাকায় হ্যান্ডসেট লক করা রয়েছে।
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-2.5 hover:bg-slate-50 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-semibold text-slate-800">System Ready</div>
                    <div className="text-[11px] text-slate-500">All MDM policies & cloud sync active.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Authenticated User */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title="User Profile & Security"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-xs group-hover:ring-2 group-hover:ring-indigo-400 transition">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="hidden lg:block text-left text-[11px] leading-tight">
              <div className="font-bold text-slate-200 group-hover:text-white truncate max-w-[120px]">
                {currentUser?.name || 'Tenant Admin'}
              </div>
              <div className="text-[10px] text-indigo-400 font-mono">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Owner / Admin' : currentUser?.role || 'Staff'}
              </div>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in space-y-2.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-xs text-white truncate">{currentUser?.name || 'User'}</div>
                  <div className="text-[10px] text-indigo-300 font-mono truncate" title={currentUser?.email}>
                    {currentUser?.email || currentUser?.phone || 'user@example.com'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      আইসোলেটেড
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentUser?.role || 'SUPER_ADMIN'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    authLogout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'bn' ? 'সাইন আউট (লগআউট)' : 'Sign Out / Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Universal Barcode & IMEI Scanner Modal */}
      <UniversalScannerModal
        isOpen={showUniversalScanner}
        onClose={() => setShowUniversalScanner(false)}
      />
    </header>
  );
};
