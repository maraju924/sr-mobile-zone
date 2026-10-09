import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Search, 
  Phone, 
  CheckCheck, 
  Clock, 
  Smartphone, 
  ShieldCheck,
  Plus
} from 'lucide-react';

export const SupportChat: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    customerProfiles,
    devices,
    installments,
    sales,
    formatCurrency,
    lang, 
    branch 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Build live dynamic conversation contacts from real Firestore data
  const dynamicConversations = useMemo(() => {
    const map = new Map<string, {
      phone: string;
      name: string;
      lastMessage: string;
      time: string;
      unread: boolean;
      device: string;
      dueAmount: number;
    }>();

    // 1. Gather all customers with actual chat messages
    (chatMessages || []).forEach(msg => {
      const p = msg.customerPhone;
      if (!p) return;
      const existing = map.get(p);
      const isShop = msg.sender === 'shop';
      if (!existing) {
        map.set(p, {
          phone: p,
          name: msg.senderName !== 'Shop Admin' ? msg.senderName : `Customer (${p.slice(-4)})`,
          lastMessage: msg.text,
          time: msg.timestamp || 'Recent',
          unread: !isShop && !msg.read,
          device: 'General',
          dueAmount: 0
        });
      } else {
        existing.lastMessage = msg.text;
        existing.time = msg.timestamp || existing.time;
        if (!isShop && !msg.read) existing.unread = true;
      }
    });

    // 2. Attach real customer names, devices & dues from customerProfiles, devices & installments
    (customerProfiles || []).forEach(cp => {
      if (!cp.phone) return;
      const dev = (devices || []).find(d => d.customerPhone === cp.phone);
      const inst = (installments || []).find(i => i.customerPhone === cp.phone && i.status !== 'completed');
      const due = inst?.remainingBalance || 0;

      if (map.has(cp.phone)) {
        const item = map.get(cp.phone)!;
        item.name = cp.name || item.name;
        if (dev) item.device = dev.model;
        item.dueAmount = due;
      } else if (map.size < 15) {
        // Show customer as available for chat
        map.set(cp.phone, {
          phone: cp.phone,
          name: cp.name,
          lastMessage: 'নতুন চ্যাট শুরু করতে ক্লিক করুন',
          time: 'Active',
          unread: false,
          device: dev?.model || 'General',
          dueAmount: due
        });
      }
    });

    // 3. Attach financed devices customers
    (devices || []).forEach(dev => {
      if (!dev.customerPhone || map.has(dev.customerPhone)) return;
      if (map.size < 20) {
        const inst = (installments || []).find(i => i.customerPhone === dev.customerPhone && i.status !== 'completed');
        map.set(dev.customerPhone, {
          phone: dev.customerPhone,
          name: dev.customerName || `Customer (${dev.customerPhone.slice(-4)})`,
          lastMessage: `ডিভাইস: ${dev.model} (${dev.lockStatus})`,
          time: 'Device',
          unread: false,
          device: dev.model,
          dueAmount: inst?.remainingBalance || 0
        });
      }
    });

    return Array.from(map.values());
  }, [chatMessages, customerProfiles, devices, installments]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return dynamicConversations;
    const term = searchTerm.toLowerCase();
    return dynamicConversations.filter(c => 
      c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.device.toLowerCase().includes(term)
    );
  }, [dynamicConversations, searchTerm]);

  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string>(() => {
    return dynamicConversations[0]?.phone || '';
  });

  const activeContact = useMemo(() => {
    return dynamicConversations.find(c => c.phone === selectedCustomerPhone) || dynamicConversations[0] || null;
  }, [dynamicConversations, selectedCustomerPhone]);

  const activeChatMessages = useMemo(() => {
    if (!activeContact) return [];
    return (chatMessages || []).filter(m => m.customerPhone === activeContact.phone);
  }, [chatMessages, activeContact]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const targetPhone = activeContact?.phone || selectedCustomerPhone || '01700000000';
    sendChatMessage(inputText.trim(), 'shop', targetPhone);
    setInputText('');
  };

  return (
    <div className="flex-1 overflow-hidden p-3 sm:p-5 bg-slate-100 flex flex-col">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Conversations Sidebar (1/3) */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span className="font-extrabold text-sm text-slate-900">Conversations</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {dynamicConversations.length} Active
            </span>
          </div>

          {/* Search Contacts */}
          <div className="p-2 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="কাস্টমার নাম বা নম্বর..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <div className="font-bold text-xs text-slate-700">কোনো চ্যাট থ্রেড নেই</div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  নতুন গ্রাহক তৈরি হলে অথবা কিস্তি/ডিভাইস এনরোল হলে তাদের সাথে সরাসরি চ্যাট করতে পারবেন।
                </div>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.phone}
                  onClick={() => setSelectedCustomerPhone(conv.phone)}
                  className={`p-3 cursor-pointer transition ${
                    (activeContact?.phone === conv.phone) ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{conv.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{conv.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{conv.phone} • {conv.device}</div>
                  <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat Pane (2/3) */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {activeContact.name.slice(0, 1) || 'C'}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">{activeContact.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{activeContact.phone} • {activeContact.device}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeContact.dueAmount > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                      Due: {formatCurrency(activeContact.dueAmount)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Account Clear
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {activeChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                    <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                    <div className="font-bold text-xs text-slate-600">কোনো বার্তা পাওয়া যায়নি</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      নিচের টেক্সট বক্সে বার্তা লিখে সরাসরি {activeContact.name}-কে পাঠান।
                    </div>
                  </div>
                ) : (
                  activeChatMessages.map(msg => {
                    const isShop = msg.sender === 'shop';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isShop ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                          {msg.senderName} • {msg.timestamp}
                        </div>
                        <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                          isShop 
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs' 
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`${activeContact.name}-কে বার্তা লিখুন...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <div className="font-bold text-sm text-slate-700">কোনো সক্রিয় কথোপকথন নেই</div>
              <div className="text-xs text-slate-400 mt-1 max-w-sm">
                গ্রাহক প্রোফাইল বা ডিভাইস যুক্ত হলে এখান থেকে সরাসরি রিয়েল-টাইম সাপোর্ট ও নোটিফিকেশন আদান-প্রদান করতে পারবেন।
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
