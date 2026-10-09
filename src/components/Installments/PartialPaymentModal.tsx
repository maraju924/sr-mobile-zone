import React, { useState } from 'react';
import { X, DollarSign, Calculator, AlertTriangle, Check, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Installment, InstallmentScheduleItem } from '../../types';

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment;
  scheduleItem: InstallmentScheduleItem;
  onConfirmPayment: (paidAmount: number, penaltyAmount: number, note?: string) => void;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  isOpen,
  onClose,
  installment,
  scheduleItem,
  onConfirmPayment
}) => {
  const { formatCurrency, t } = useApp();

  const baseScheduledAmount = scheduleItem.amount - (scheduleItem.paidAmount || 0);
  const [payAmount, setPayAmount] = useState<number>(baseScheduledAmount);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const totalPayableThisInstallment = baseScheduledAmount + penaltyAmount;
  const remainingAfterPayment = Math.max(0, totalPayableThisInstallment - payAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    onConfirmPayment(payAmount, penaltyAmount, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 my-4">
        
        {/* Header */}
        <div className="px-5 py-4 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('কিস্তি আদায় (আংশিক বা পূর্ণ)', 'Installment Collection')}</h3>
              <p className="text-[11px] text-indigo-100">কিস্তি নং #{scheduleItem.installmentNo} | {installment.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">নির্ধারিত কিস্তির পরিমাণ:</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(scheduleItem.amount)}</span>
            </div>
            {scheduleItem.paidAmount && scheduleItem.paidAmount > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>পূর্বে আংশিক জমা হয়েছে:</span>
                <span className="font-mono font-bold">{formatCurrency(scheduleItem.paidAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-900">
              <span>বর্তমানে প্রদেয় বাকি:</span>
              <span className="font-mono text-indigo-700 font-bold">{formatCurrency(baseScheduledAmount)}</span>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                আদায়কৃত জমার পরিমাণ (Paid Amount):
              </label>
              <button
                type="button"
                onClick={() => setPayAmount(baseScheduledAmount)}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                পূর্ণ কিস্তি ({formatCurrency(baseScheduledAmount)})
              </button>
            </div>
            <input
              type="number"
              min="1"
              value={payAmount}
              onChange={(e) => setPayAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Penalty / Late fee input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিলম্ব ফি / জরিমানা (Late Penalty Fee - ঐচ্ছিক):
            </label>
            <input
              type="number"
              min="0"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মন্তব্য বা ট্রানজ্যাকশন নোট (ঐচ্ছিক):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: বিকাশে পেমেন্ট, TrxID: 98AB..."
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Remaining Calculation Preview */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">এই কিস্তির অবশিষ্ট বকেয়া থাকবে:</span>
            <span className={`font-mono font-bold ${remainingAfterPayment > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(remainingAfterPayment)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t('বাতিল', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('টাকা গ্রহণ করুন ও রশিদ দিন', 'Confirm & Generate Receipt')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
