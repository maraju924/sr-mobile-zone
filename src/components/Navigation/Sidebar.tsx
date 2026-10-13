import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Smartphone, 
  ShieldAlert, 
  ShoppingCart, 
  Repeat, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Wrench, 
  MessageSquare, 
  Settings, 
  FileText, 
  Truck, 
  Star, 
  ChevronRight, 
  ChevronDown, 
  Radio, 
  ShieldCheck, 
  Sliders, 
  UserCheck, 
  FileCheck,
  CreditCard,
  Send,
  Tags,
  X,
  LogOut
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  tab: ActiveTab;
  label: string;
  labelBn: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  id: string;
  title: string;
  titleBn: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    lang, 
    favourites, 
    toggleFavourite, 
    devices, 
    usedBuys,
    chatMessages,
    installments,
    currentUser,
    authLogout
  } = useApp();

  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const overdueCount = (installments || []).filter(i => i && i.status === 'overdue').length;
  const lockedCount = (devices || []).filter(d => d && d.lockStatus === 'LOCKED').length;
  const unreadChatCount = (chatMessages || []).filter(m => m && m.sender === 'customer' && !m.read).length;

  const NAV_GROUPS: NavGroup[] = [
    {
      id: 'locker',
      title: 'Locker & MDM Control',
      titleBn: 'লকার ও ডিভাইস কন্ট্রোল',
      icon: ShieldCheck,
      items: [
        { id: 'devices', tab: 'devices', label: 'Financed Devices', labelBn: 'ডিভাইস লিস্ট', icon: Smartphone, badge: lockedCount > 0 ? `${lockedCount} Lock` : undefined },
        { id: 'livewall', tab: 'livewall', label: 'Live Wall (NOC)', labelBn: 'লাইভ ওয়াল কন্ট্রোল রুম', icon: Radio },
        { id: 'sms', tab: 'sms', label: 'SMS Control & Lock', labelBn: 'এসএমএস কন্ট্রোল ও রুল', icon: Send }
      ]
    },
    {
      id: 'sales',
      title: 'Sales & Billing',
      titleBn: 'বিক্রয় ও ইনভয়েস',
      icon: ShoppingCart,
      items: [
        { id: 'pos', tab: 'pos', label: 'New Cash Sale', labelBn: 'নগদ বিক্রয় (POS)', icon: ShoppingCart },
        { id: 'installments', tab: 'installments', label: 'EMI / Installment Sale', labelBn: 'কিস্তিতে বিক্রয়', icon: Repeat, badge: overdueCount > 0 ? overdueCount : undefined },
        { id: 'contracts', tab: 'contracts', label: 'EMI Contracts', labelBn: 'ইএমআই চুক্তিপত্র', icon: FileCheck },
        { id: 'sales', tab: 'sales', label: 'Sales History', labelBn: 'ইনভয়েস তালিকা', icon: FileText }
      ]
    },
    {
      id: 'purchase',
      title: 'Purchase & Trade-in',
      titleBn: 'ক্রয় ও পুরনো ফোন',
      icon: Truck,
      items: [
        { id: 'usedbuy', tab: 'usedbuy', label: 'Used Buy (Legal Deed)', labelBn: 'পুরনো ফোন ক্রয় (চুক্তিপত্র)', icon: FileText, badge: usedBuys.length },
        { id: 'suppliers', tab: 'suppliers', label: 'Suppliers & Purchases', labelBn: 'সাপ্লায়ার ও ক্রয় চালান', icon: Truck }
      ]
    },
    {
      id: 'stock',
      title: 'Stock & Inventory',
      titleBn: 'স্টক ও মালামাল',
      icon: Package,
      items: [
        { id: 'inventory', tab: 'inventory', label: 'Inventory & Barcodes', labelBn: 'ইনভেন্টরি ও বারকোড', icon: Package },
        { id: 'categories', tab: 'categories', label: 'Categories', labelBn: 'ক্যাটাগরি সমূহ', icon: Tags },
        { id: 'warranty', tab: 'warranty', label: 'Warranty & Claims', labelBn: 'ওয়ারেন্টি ও ক্লেইম', icon: ShieldAlert }
      ]
    },
    {
      id: 'service',
      title: 'Repair & Servicing',
      titleBn: 'সার্ভিসিং ও মেরামত',
      icon: Wrench,
      items: [
        { id: 'repairs', tab: 'repairs', label: 'Repair Jobs', labelBn: 'রিপেয়ার টিকিট', icon: Wrench }
      ]
    },
    {
      id: 'crm',
      title: 'Customers & CRM',
      titleBn: 'কাস্টমার ও কেওয়াইসি',
      icon: Users,
      items: [
        { id: 'customers', tab: 'customers', label: 'Customer Directory', labelBn: 'কাস্টমার তালিকা', icon: Users },
        { id: 'chat', tab: 'chat', label: 'Live Support Chat', labelBn: 'লাইভ চ্যাট', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined }
      ]
    },
    {
      id: 'finance',
      title: 'Finance & Accounts',
      titleBn: 'হিসাবরক্ষণ ও ফাইন্যান্স',
      icon: DollarSign,
      items: [
        { id: 'accounting', tab: 'accounting', label: 'Cash, Bank & Ledger', labelBn: 'ক্যাশ, ব্যাংক ও খতিয়ান', icon: DollarSign },
        { id: 'expenses', tab: 'expenses', label: 'Shop Expenses', labelBn: 'দোকানের খরচ', icon: CreditCard }
      ]
    },
    {
      id: 'analytics',
      title: 'Reports & Intelligence',
      titleBn: 'রিপোর্ট সেন্টার',
      icon: BarChart3,
      items: [
        { id: 'reports', tab: 'reports', label: '80-Report Center', labelBn: '৮০-রিপোর্ট সেন্টার', icon: BarChart3 }
      ]
    },
    {
      id: 'admin',
      title: 'Setup & Staff',
      titleBn: 'সেটিংস ও স্টাফ',
      icon: Settings,
      items: [
        { id: 'staff', tab: 'staff', label: 'Staff & Roles', labelBn: 'স্টাফ ও পারমিশন', icon: UserCheck },
        { id: 'settings', tab: 'settings', label: 'System Settings', labelBn: 'শপ সেটিংস', icon: Settings }
      ]
    }
  ];

  // Flat lookup for favourites
  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  const favouriteItems = allNavItems.filter(item => favourites.includes(item.id));

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 text-slate-300
        flex flex-col select-none transition-transform duration-200 ease-in-out print:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm group-hover:bg-indigo-500 transition">
              P
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight leading-none">PhoneSell Pro</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Locker & ERP Edition</div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar text-xs">
          
          {/* Main Dashboard Link */}
          <div>
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition ${
                activeTab === 'home' 
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40' 
                  : 'hover:bg-slate-800/80 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'হোম ড্যাশবোর্ড' : 'Home Dashboard'}</span>
              </div>
            </button>
          </div>

          {/* Favourites (⭐) Group */}
          {favouriteItems.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Favourites (প্রিয় শর্টকাট)</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {favouriteItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;
                  return (
                    <button
                      key={`fav_${item.id}`}
                      onClick={() => handleNavClick(item.tab)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                        isActive 
                          ? 'bg-indigo-600 text-white font-bold' 
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                        <span className="truncate">{lang === 'bn' ? item.labelBn : item.label}</span>
                      </div>
                      <Star 
                        onClick={(e) => { e.stopPropagation(); toggleFavourite(item.id); }}
                        className="w-3 h-3 fill-amber-400 text-amber-400 opacity-60 hover:opacity-100" 
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grouped Navigation */}
          {NAV_GROUPS.map(group => {
            const isCollapsed = collapsedGroups[group.id];
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="pt-1">
                <div 
                  onClick={() => toggleGroup(group.id)}
                  className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <GroupIcon className="w-3 h-3 text-slate-500" />
                    <span>{lang === 'bn' ? group.titleBn : group.title}</span>
                  </div>
                  {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                </div>

                {!isCollapsed && (
                  <div className="mt-1 space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.tab;
                      const isFav = favourites.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className="group relative flex items-center"
                        >
                          <button
                            onClick={() => handleNavClick(item.tab)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                              isActive 
                                ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                              <span className="truncate">{lang === 'bn' ? item.labelBn : item.label}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {item.badge && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono ${
                                  typeof item.badge === 'string' && item.badge.includes('Lock')
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Favourite Star toggle button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavourite(item.id); }}
                            className={`absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-amber-400 transition ${isFav ? 'opacity-100 text-amber-400' : ''}`}
                            title="Toggle Favourite"
                          >
                            <Star className={`w-2.5 h-2.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[11px] bg-slate-950/60 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="overflow-hidden pr-2">
                <div className="font-bold text-slate-200 truncate text-[11px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-indigo-400 font-mono truncate" title={currentUser.email}>
                  {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={authLogout}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition shrink-0"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>ইমেইল আইসোলেশন</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              সুরক্ষিত
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
