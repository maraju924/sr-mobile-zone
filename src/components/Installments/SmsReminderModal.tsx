import React, { useState } from 'react';
import { X, Send, Copy, Check, Phone, MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SmsReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  amountDue: number;
  dueDate?: string;
  invoiceNo?: string;
  type: 'installment' | 'due';
}

export const SmsReminderModal: React.FC<SmsReminderModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  amountDue,
  dueDate,
  invoiceNo,
  type
}) => {
  const { settings, formatCurrency, t } = useApp();
  const [templateType, setTemplateType] = useState<'upcoming' | 'overdue' | 'polite'>('upcoming');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = customerPhone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;

  // Generate templates based on type
  const getMessageContent = () => {
    const formattedAmount = formatCurrency(amountDue);
    const dateStr = dueDate ? `(তারিখ: ${dueDate})` : '';
    const invStr = invoiceNo ? `[হিসাব নং: ${invoiceNo}]` : '';

    if (type === 'installment') {
      if (templateType === 'upcoming') {
        return `সম্মানিত গ্রাহক ${customerName}, ${settings.storeName}-এ আপনার মাসিক কিস্তির ${formattedAmount} টাকা ${dateStr} পরিশোধের জন্য অনুরোধ করা হচ্ছে ${invStr}। সময়মতো কিস্তি পরিশোধ করে নির্ঝঞ্ঝাট সেবা উপভোগ করুন। প্রয়োজনে যোগাযোগ: ${settings.phone}। ধন্যবাদ!`;
      } else if (templateType === 'overdue') {
        return `জরুরি তাগাদা: জনাব ${customerName}, ${settings.storeName}-এ আপনার কিস্তির মেয়াদ উত্তীর্ণ হয়েছে। আপনার বকেয়া কিস্তির পরিমাণ ${formattedAmount} ${dateStr}। বিলম্ব ফি ও অনাকাঙ্ক্ষিত জটিলতা এড়াতে অতিসত্বর শোরুমে এসে অথবা বিকাশে কিস্তি পরিশোধের বিশেষ অনুরোধ রইল। হটলাইন: ${settings.phone}।`;
      } else {
        return `প্রিয় গ্রাহক ${customerName}, আশা করি ভালো আছেন। ${settings.storeName}-এর কিস্তি হিসাব অনুযায়ী আপনার বর্তমান বকেয়া ${formattedAmount}। অনুগ্রহ করে সুযোগ সুবিধামত সময়ে কিস্তি পরিশোধ করার জন্য অনুরোধ জানানো হলো। যোগাযোগ: ${settings.phone}।`;
      }
    } else {
      // Counter Due
      if (templateType === 'upcoming') {
        return `সম্মানিত গ্রাহক ${customerName}, ${settings.storeName}-এ আপনার ক্রয়ের বকেয়া বিলের পরিমাণ ${formattedAmount} ${dateStr}। অনুগ্রহ করে বকেয়া পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে। হটলাইন: ${settings.phone}। ধন্যবাদ!`;
      } else if (templateType === 'overdue') {
        return `জরুরি তাগাদা: জনাব ${customerName}, ${settings.storeName}-এ আপনার আগের কেনাকাটার বকেয়া ${formattedAmount} দীর্ঘদিন পরিশোধিত হয়নি। অনুগ্রহ করে অতিসত্বর হিসাব সমন্বয় করার জন্য যোগাযোগ করুন (${settings.phone})।`;
      } else {
        return `প্রিয় ${customerName}, আপনার অবগতির জন্য জানানো যাচ্ছে যে ${settings.storeName}-এ আপনার বকেয়া হিসাব রয়েছে ${formattedAmount}। যেকোনো সহযোগিতায় কল করুন: ${settings.phone}।`;
      }
    }
  };

  const messageText = getMessageContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-4">
        
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('১-ক্লিকে তাগাদা মেসেজ (SMS / WhatsApp)', '1-Click Due Reminder')}</h3>
              <p className="text-[11px] text-emerald-100">গ্রাহক: {customerName} | {customerPhone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Metrics */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">পাওনা টাকার পরিমাণ:</span>
              <span className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(amountDue)}</span>
            </div>
            {dueDate && (
              <div>
                <span className="text-slate-500 block text-[10px]">নির্ধারিত তারিখ:</span>
                <span className="font-mono font-semibold text-slate-800">{dueDate}</span>
              </div>
            )}
            <a
              href={`tel:${customerPhone}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>কল দিন</span>
            </a>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              মেসেজের ধরণ (Template):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('upcoming')}
                className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                  templateType === 'upcoming'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                স্বাভাবিক রিমাইন্ডার
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('overdue')}
                className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                  templateType === 'overdue'
                    ? 'bg-rose-50 border-rose-600 text-rose-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                জরুরি তাগাদা (Overdue)
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('polite')}
                className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition ${
                  templateType === 'polite'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                নম্র অনুরোধ (Polite)
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                বাংলা মেসেজ প্রিভিউ:
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageText.length} অক্ষর
              </span>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed font-sans select-all">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp এ পাঠান</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'মেসেজ কপি হয়েছে!' : 'SMS কপি করুন'}</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin
        </div>
      </div>
    </div>
  );
};
