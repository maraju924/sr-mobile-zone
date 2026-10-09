import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SMS_TEMPLATES } from '../../services/mockLockerData';
import { 
  Send, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Sliders, 
  Smartphone, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';

export const SmsSystem: React.FC = () => {
  const { smsLogs, sendSms, lang, branch } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'compose' | 'templates' | 'history'>('dashboard');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || !customMsg) return;

    sendSms(recipientPhone, recipientName || 'Customer', customMsg);
    setFeedback('SMS সফলভাবে গেটওয়েতে পাঠানো হয়েছে এবং ডেলিভারি সম্পন্ন হয়েছে!');
    setRecipientPhone('');
    setRecipientName('');
    setCustomMsg('');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSelectTemplate = (tId: string) => {
    setSelectedTemplateId(tId);
    const tmpl = SMS_TEMPLATES.find(t => t.id === tId);
    if (tmpl) {
      setCustomMsg(tmpl.text);
    }
  };

  const sentTodayCount = smsLogs.length;

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'এসএমএস গেটওয়ে ও সিকিউরিটি অ্যালার্ট সিস্টেম' : 'SMS Gateway & Security Alert Center'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GSM Gateway Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'বাংলা ইউনিকোড এসএমএস, কিস্তির তাগাদা, পেমেন্ট রিসিট এবং সিম চেঞ্জ অটোমেটিক এলার্ট।' 
              : 'Direct GSM push, Bangla Unicode SMS templates, EMI due reminders & security alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
            SMS Balance: <strong className="text-emerald-600">842 SMS</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'dashboard', label: 'SMS Dashboard & Activity' },
          { id: 'compose', label: 'Compose & Send SMS' },
          { id: 'templates', label: '32 SMS Templates' },
          { id: 'history', label: 'Delivery History Log' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-4 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Sent Today</div>
              <div className="text-2xl font-black font-mono text-indigo-600 mt-1">{sentTodayCount} Messages</div>
              <div className="text-[11px] text-emerald-600 mt-1">100% Delivery Success</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Failed / Queued</div>
              <div className="text-2xl font-black font-mono text-slate-700 mt-1">0 Pending</div>
              <div className="text-[11px] text-slate-400 mt-1">No errors reported</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Active Templates</div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">32 Ready</div>
              <div className="text-[11px] text-slate-400 mt-1">English & Bangla Unicode</div>
            </div>
          </div>

          {/* Recent Feeds */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Recent Automatic Alerts & SMS Logs</h3>
            <div className="divide-y divide-slate-100">
              {smsLogs.map(sms => (
                <div key={sms.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{sms.recipientName}</span>
                      <span className="font-mono text-slate-400 text-xs">({sms.phone})</span>
                      <span className="px-2 py-0.2 rounded text-[9px] font-bold font-mono bg-slate-100 border border-slate-200">
                        {sms.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {sms.message}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {sms.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{sms.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPOSE & SEND */}
      {activeTab === 'compose' && (
        <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Compose & Send Custom SMS</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">কাস্টমার মোবাইল নম্বর *</label>
            <input
              type="text"
              required
              placeholder="017XXXXXXXX"
              value={recipientPhone}
              onChange={e => setRecipientPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">প্রাপকের নাম</label>
            <input
              type="text"
              placeholder="যেমন: মোঃ রফিকুল ইসলাম"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">মেসেজের বিষয়বস্তু (Text Content) *</label>
            <textarea
              required
              rows={4}
              placeholder="মেসেজ লিখুন..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans leading-relaxed"
            />
            <div className="text-right text-[10px] text-slate-400 font-mono mt-1">
              {customMsg.length} characters (1 SMS approx)
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/20 transition"
          >
            <Send className="w-4 h-4" />
            <span>Send SMS Immediately</span>
          </button>
        </form>
      )}

      {/* TAB 3: 32 TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Pre-Configured SMS Message Templates</h3>
            <span className="text-xs text-slate-500 font-mono">32 Active Templates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SMS_TEMPLATES.map(t => (
              <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-xs text-indigo-900">{t.title}</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 font-sans">
                    {t.text}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setCustomMsg(t.text);
                      setActiveTab('compose');
                    }}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition"
                  >
                    Use in Compose →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Phone</th>
                <th className="py-2.5 px-4">Message</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {smsLogs.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-bold text-slate-800">{s.recipientName}</td>
                  <td className="py-2.5 px-4 font-mono">{s.phone}</td>
                  <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">{s.message}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">{s.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
