import React, { useState } from 'react';
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
  ShieldCheck 
} from 'lucide-react';

export const SupportChat: React.FC = () => {
  const { chatMessages, sendChatMessage, lang, branch } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('01712345678');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText, 'shop', selectedCustomerPhone);
    setInputText('');
  };

  const conversations = [
    {
      phone: '01712345678',
      name: 'মোঃ রফিকুল ইসলাম',
      lastMessage: 'ওয়ালাইকুম আসসালাম। হ্যাঁ অবশ্যই, আমাদের বিকাশ মার্চেন্ট নম্বরে...',
      time: '10:08 AM',
      unread: false,
      device: 'Galaxy A15 5G'
    },
    {
      phone: '01987654321',
      name: 'মোছাঃ সুমি আক্তার',
      lastMessage: 'ভাইয়া আমার ফোনটা হঠাৎ লক দেখাচ্ছে, বিকাশ করে দিলে কখন খুলবে?',
      time: 'গতকাল',
      unread: true,
      device: 'Redmi Note 13'
    }
  ];

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
              Live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map(conv => (
              <div
                key={conv.phone}
                onClick={() => setSelectedCustomerPhone(conv.phone)}
                className={`p-3 cursor-pointer transition ${
                  selectedCustomerPhone === conv.phone ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{conv.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{conv.time}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{conv.phone} • {conv.device}</div>
                <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Chat Pane (2/3) */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                র
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">মোঃ রফিকুল ইসলাম</div>
                <div className="text-[10px] text-slate-500 font-mono">01712345678 • Galaxy A15 (Online)</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                Loan Active (Due ৳3,500)
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {chatMessages.map(msg => {
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
            })}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="দোকান প্রতিনিধি হিসেবে বার্তা লিখুন..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
