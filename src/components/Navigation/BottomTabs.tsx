import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Smartphone, 
  Users, 
  MessageSquare, 
  Menu 
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomTabsProps {
  onOpenMenu: () => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab, lang, devices, chatMessages } = useApp();

  const lockedCount = (devices || []).filter(d => d && d.lockStatus === 'LOCKED').length;
  const unreadChatCount = (chatMessages || []).filter(m => m && m.sender === 'customer' && !m.read).length;

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      labelBn: 'হোম',
      icon: Home,
      tab: 'home' as ActiveTab
    },
    {
      id: 'devices',
      label: 'Devices',
      labelBn: 'ডিভাইস',
      icon: Smartphone,
      tab: 'devices' as ActiveTab,
      badge: lockedCount > 0 ? lockedCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'customers',
      label: 'Customers',
      labelBn: 'কাস্টমার',
      icon: Users,
      tab: 'customers' as ActiveTab
    },
    {
      id: 'chat',
      label: 'Chat',
      labelBn: 'চ্যাট',
      icon: MessageSquare,
      tab: 'chat' as ActiveTab,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'menu',
      label: 'Menu',
      labelBn: 'মেনু',
      icon: Menu,
      isMenu: true
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-around z-40 select-none lg:hidden px-1 shadow-2xl">
      {tabs.map(item => {
        const Icon = item.icon;
        const isActive = !item.isMenu && activeTab === item.tab;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.isMenu) {
                onOpenMenu();
              } else if (item.tab) {
                setActiveTab(item.tab);
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition ${
              isActive 
                ? 'text-indigo-400 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-indigo-400' : ''} transition-transform`} />
              {item.badge && (
                <span className={`absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] ${item.badgeColor || 'bg-indigo-600'} text-white text-[9px] font-bold rounded-full flex items-center justify-center`}>
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium leading-none">
              {lang === 'bn' ? item.labelBn : item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-5 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
