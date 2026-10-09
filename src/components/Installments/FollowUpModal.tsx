import React, { useState } from 'react';
import { X, Clock, Calendar, CheckCircle2, MessageSquare, AlertCircle, PhoneCall, UserCheck, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FollowUpLog } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customerName: string;
  customerPhone: string;
  currentDue: number;
  existingLogs: FollowUpLog[];
  onAddLog: (log: Omit<FollowUpLog, 'id' | 'date'>) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  title,
  customerName,
  customerPhone,
  currentDue,
  existingLogs = [],
  onAddLog
}) => {
  const { formatCurrency, t } = useApp();

  const [note, setNote] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [outcome, setOutcome] = useState<FollowUpLog['callOutcome']>('will_pay');
  const [recordedBy, setRecordedBy] = useState('ক্যাশিয়ার / ম্যানেজার');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() && !promiseDate) return;

    onAddLog({
      note: note.trim() || 'ফলো-আপ সম্পন্ন',
      promiseDate: promiseDate || undefined,
      callOutcome: outcome,
      recordedBy: recordedBy.trim()
    });

    setNote('');
    setPromiseDate('');
    setOutcome('will_pay');
  };

  const getOutcomeBadge = (out?: FollowUpLog['callOutcome']) => {
    switch (out) {
      case 'will_pay':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">টাকা দিবে (Will Pay)</span>;
      case 'requested_time':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">সময় চেয়েছে (Requested Time)</span>;
      case 'phone_off':
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ফোন বন্ধ / রিং হয়নি</span>;
      case 'disputed':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">আপত্তি / মতবিরোধ</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">যোগাযোগ হয়েছে</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-4">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('বকেয়া তাগাদা ও ফলো-আপ রেজিস্টার', 'Collection Follow-Up Register')}</h3>
              <p className="text-[11px] text-slate-300">{title} | গ্রাহক: {customerName} ({customerPhone})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Due Highlight */}
        <div className="bg-amber-50/80 border-b border-amber-100 px-5 py-2.5 flex items-center justify-between text-xs">
          <span className="text-amber-900 font-semibold">বর্তমান পাওনা বকেয়া:</span>
          <span className="font-mono font-bold text-amber-900 text-sm">{formatCurrency(currentDue)}</span>
        </div>

        <div className="p-5 space-y-5">
          {/* New Follow-up Input Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                নতুন তাগাদা / কথোপকথন যোগ করুন
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  কথোপকথনের ফলাফল (Outcome):
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="will_pay">টাকা দিবে বলেছে (Will Pay)</option>
                  <option value="requested_time">কিছুদিন সময় চেয়েছে (Requested Time)</option>
                  <option value="phone_off">ফোন বন্ধ / ধরেনি (Unreachable)</option>
                  <option value="disputed">হিসাব নিয়ে আপত্তি (Disputed)</option>
                  <option value="other">অন্যান্য নোট (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  টাকা দেওয়ার প্রতিশ্রুত তারিখ (Promise Date):
                </label>
                <input
                  type="date"
                  value={promiseDate}
                  onChange={(e) => setPromiseDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ফলো-আপ নোট ও বিস্তারিত:
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: গ্রাহক জানিয়েছেন আগামী শনিবার বিকেলে ৩,০০০ টাকা বিকাশ অথবা ক্যাশে পাঠাবেন..."
                rows={2}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="স্টাফের নাম"
                className="text-[11px] px-2 py-1 bg-white border border-slate-300 rounded w-44"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>

          {/* History Timeline */}
          <div>
            <span className="text-xs font-bold text-slate-800 block mb-2">
              পূর্বের তাগাদা ও প্রতিশ্রুতির ইতিহাস ({existingLogs.length} টি রেকর্ড):
            </span>

            {existingLogs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                কোনো তাগাদার রেকর্ড পাওয়া যায়নি। উপরে প্রথম ফলো-আপ এন্ট্রি করুন।
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {existingLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(log.callOutcome)}
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(log.date).toLocaleDateString('bn-BD')} {new Date(log.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.promiseDate && (
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          <Calendar className="w-3 h-3" />
                          প্রতিশ্রুতি: {log.promiseDate}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-800">{log.note}</p>
                    {log.recordedBy && (
                      <p className="text-[10px] text-slate-400">এন্ট্রি করেছেন: {log.recordedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            {t('সম্পন্ন', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
