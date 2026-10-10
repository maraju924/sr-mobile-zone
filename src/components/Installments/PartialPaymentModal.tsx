import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calculator, 
  AlertTriangle, 
  Check, 
  Calendar, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Installment, InstallmentScheduleItem } from '../../types';

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment;
  scheduleItem?: InstallmentScheduleItem;
  initialMode?: 'single' | 'custom' | 'foreclose';
  onConfirmPayment?: (paidAmount: number, penaltyAmount: number, note?: string) => void;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  isOpen,
  onClose,
  installment,
  scheduleItem,
  initialMode = 'single',
  onConfirmPayment
}) => {
  const { 
    formatCurrency, 
    t, 
    devices, 
    recordInstallmentSmartPayment 
  } = useApp();

  const unpaidSchedules = useMemo(() => {
    return (installment.schedule || []).filter(s => !s.isPaid);
  }, [installment.schedule]);

  const targetItem = scheduleItem || unpaidSchedules[0] || (installment.schedule && installment.schedule[0]);

  // Mode: 'single' (targeted installment), 'custom' (multi-month/custom pool), 'foreclose' (early closure)
  const [collectionMode, setCollectionMode] = useState<'single' | 'custom' | 'foreclose'>(
    initialMode || (scheduleItem ? 'single' : 'custom')
  );

  // Overdue calculation
  const overdueDays = useMemo(() => {
    if (!targetItem || targetItem.isPaid) return 0;
    const dueTime = new Date(targetItem.dueDate).getTime();
    const nowTime = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [targetItem]);

  // Base amounts
  const singleItemRemaining = targetItem ? Math.max(0, targetItem.amount - (targetItem.paidAmount || 0)) : 0;
  
  // Suggested late fee (e.g. ৳20/day after 3 days grace period)
  const suggestedLateFee = useMemo(() => {
    if (overdueDays > 3) {
      return (overdueDays - 3) * 20;
    }
    return 0;
  }, [overdueDays]);

  const [payAmount, setPayAmount] = useState<number>(singleItemRemaining);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(suggestedLateFee);
  const [waivePenalty, setWaivePenalty] = useState<boolean>(suggestedLateFee === 0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [trxId, setTrxId] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [autoUnlockDevice, setAutoUnlockDevice] = useState<boolean>(true);

  // Check if customer has a locked device in Device Locker
  const linkedLockedDevice = useMemo(() => {
    return devices.find(d => 
      (
        (d.customerPhone && d.customerPhone !== 'N/A' && d.customerPhone === installment.customerPhone) ||
        (d.customerName && d.customerName === installment.customerName)
      ) && d.lockStatus === 'LOCKED'
    );
  }, [devices, installment]);

  // Sync state when mode or targetItem changes
  useEffect(() => {
    if (collectionMode === 'single') {
      setPayAmount(singleItemRemaining);
      setPenaltyAmount(suggestedLateFee);
      setWaivePenalty(suggestedLateFee === 0);
      setDiscountAmount(0);
    } else if (collectionMode === 'foreclose') {
      setPayAmount(installment.remainingBalance);
      setPenaltyAmount(0);
      setWaivePenalty(true);
      setDiscountAmount(0);
    } else if (collectionMode === 'custom') {
      setPenaltyAmount(0);
      setWaivePenalty(true);
      setDiscountAmount(0);
      setPayAmount(singleItemRemaining > 0 ? singleItemRemaining : installment.remainingBalance);
    }
  }, [collectionMode, singleItemRemaining, suggestedLateFee, installment.remainingBalance]);

  if (!isOpen) return null;

  // Effective penalty
  const effectivePenalty = waivePenalty ? 0 : penaltyAmount;

  // Calculation previews
  // 1. Single mode preview
  const singleTotalDueWithPenalty = singleItemRemaining + effectivePenalty;
  const singleRemainingAfterPay = Math.max(0, singleTotalDueWithPenalty - payAmount);

  // 2. Custom multi-month rollover preview
  const customDistribution = (() => {
    let pool = payAmount;
    let fullPaidCount = 0;
    let partialSchedule: { no: number; paid: number; remaining: number } | null = null;
    const paidNos: number[] = [];

    for (const sch of unpaidSchedules) {
      if (pool <= 0) break;
      const needed = sch.amount - (sch.paidAmount || 0);
      if (pool >= needed) {
        pool -= needed;
        fullPaidCount++;
        paidNos.push(sch.installmentNo);
      } else {
        partialSchedule = {
          no: sch.installmentNo,
          paid: pool,
          remaining: needed - pool
        };
        pool = 0;
        break;
      }
    }

    return {
      fullPaidCount,
      paidNos,
      partialSchedule,
      excessMoney: pool
    };
  })();

  // 3. Foreclosure preview
  const netForeclosurePayable = Math.max(0, installment.remainingBalance - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmountToRecord = collectionMode === 'foreclose' ? netForeclosurePayable : payAmount;
    if (finalAmountToRecord <= 0 && discountAmount <= 0) return;

    recordInstallmentSmartPayment(installment.id, finalAmountToRecord, {
      targetScheduleId: collectionMode === 'single' ? targetItem?.id : undefined,
      paymentMethod,
      trxId: trxId.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      penaltyAmount: collectionMode === 'single' ? penaltyAmount : 0,
      waivePenalty: collectionMode === 'single' ? waivePenalty : true,
      discountAmount: collectionMode === 'foreclose' ? discountAmount : 0,
      note: note.trim() || undefined,
      autoUnlockLinkedDevice: Boolean(linkedLockedDevice && autoUnlockDevice)
    });

    if (onConfirmPayment) {
      onConfirmPayment(finalAmountToRecord, effectivePenalty, note.trim() || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white shadow-inner">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>{t('স্মার্ট কিস্তি আদায় ও কালেকশন প্যানেল', 'Smart Installment Collection')}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30 font-mono">
                  {installment.invoiceNumber}
                </span>
              </h3>
              <p className="text-[11px] text-indigo-100 mt-0.5">
                গ্রাহক: <strong className="text-white">{installment.customerName}</strong> ({installment.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Mode Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCollectionMode('single')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              collectionMode === 'single'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>একক কিস্তি ({targetItem ? `#${targetItem.installmentNo}` : 'চলতি'})</span>
          </button>

          <button
            type="button"
            onClick={() => setCollectionMode('custom')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              collectionMode === 'custom'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>একাধিক / কাস্টম টাকা</span>
          </button>

          <button
            type="button"
            onClick={() => setCollectionMode('foreclose')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              collectionMode === 'foreclose'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>এককালীন ক্লোজ</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Linked Locked Device Detection Alert */}
          {linkedLockedDevice && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900">লক করা ডিভাইস সনাক্ত হয়েছে!</span>
                  <span className="text-[10px] font-mono bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-bold">LOCKED</span>
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  মডেল: <strong>{linkedLockedDevice.model}</strong> | IMEI: {linkedLockedDevice.imei1}
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none bg-white/80 p-1.5 rounded-lg border border-rose-200">
                  <input
                    type="checkbox"
                    checked={autoUnlockDevice}
                    onChange={(e) => setAutoUnlockDevice(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="font-semibold text-rose-900 flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    টাকা জমা হওয়া মাত্রই ডিভাইসটি স্বয়ংক্রিয়ভাবে আনলক করুন
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Mode 1: Single Installment Collection */}
          {collectionMode === 'single' && targetItem && (
            <div className="space-y-3">
              {/* Item Info Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {targetItem.installmentNo}
                    </span>
                    কিস্তি নং #{targetItem.installmentNo}
                  </span>
                  <span className="font-mono text-slate-600">মেয়াদ: {targetItem.dueDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">নির্ধারিত পরিমাণ:</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(targetItem.amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">বর্তমানে প্রদেয় বাকি:</span>
                    <span className="font-mono font-bold text-indigo-700 text-xs">{formatCurrency(singleItemRemaining)}</span>
                  </div>
                </div>

                {overdueDays > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-rose-800 flex items-center justify-between text-[11px] mt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      মেয়াদোত্তীর্ণ: {overdueDays} দিন পার হয়েছে
                    </span>
                    <span className="font-mono font-bold">বিলম্বিত কিস্তি</span>
                  </div>
                )}
              </div>

              {/* Late Fee & Waiver Section */}
              {overdueDays > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-900 flex items-center gap-1">
                      <span>বিলম্ব ফি / জরিমানা (Late Fee):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setWaivePenalty(!waivePenalty)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded transition flex items-center gap-1 ${
                        waivePenalty
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                      }`}
                    >
                      {waivePenalty ? '✓ জরিমানা মওকুফ হয়েছে' : 'জরিমানা মওকুফ করুন'}
                    </button>
                  </div>

                  {!waivePenalty ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[11px] text-amber-800 whitespace-nowrap">টাকা যোগ হবে</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      গ্রাহককে বিশেষ বিবেচনায় জরিমানা মওকুফ করা হয়েছে (৳০ ফি)।
                    </p>
                  )}
                </div>
              )}

              {/* Pay Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    আদায়কৃত জমার পরিমাণ (Paid Amount):
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayAmount(singleItemRemaining + effectivePenalty)}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      পূর্ণ আদায় ({formatCurrency(singleItemRemaining + effectivePenalty)})
                    </button>
                    {singleItemRemaining > 1000 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(Math.round((singleItemRemaining + effectivePenalty) / 2))}
                        className="text-[10px] text-slate-500 hover:underline"
                      >
                        ৫০% আংশিক
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600">এই কিস্তির অবশিষ্ট বকেয়া থাকবে:</span>
                <span className={`font-mono font-bold ${singleRemainingAfterPay > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatCurrency(singleRemainingAfterPay)}
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: Multi-Month / Custom Pool Amount */}
          {collectionMode === 'custom' && (
            <div className="space-y-3">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  স্বয়ংক্রিয় মাল্টিপল কিস্তি রোলওভার
                </span>
                <p className="text-[11px] text-indigo-700">
                  গ্রাহক যেকোনো পরিমাণ টাকা দিলে সিস্টেম স্বয়ংক্রিয়ভাবে সিরিয়াল অনুযায়ী কিস্তিগুলো পরিশোধ করবে।
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    আদায়কৃত মোট টাকার পরিমাণ (৳):
                  </label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(installment.remainingBalance)}
                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                  >
                    অবশিষ্ট সম্পূর্ণ বাকি ({formatCurrency(installment.remainingBalance)})
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={installment.remainingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Live Distribution Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">টাকা বণ্টনের লাইভ হিসাব:</span>
                
                {customDistribution.fullPaidCount > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      সম্পূর্ণ পরিশোধ হবে: <strong>{customDistribution.fullPaidCount} টি কিস্তি</strong> ({customDistribution.paidNos.map(n => `#${n}`).join(', ')})
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-500">কোনো পূর্ণ কিস্তি পরিশোধ হবে না।</div>
                )}

                {customDistribution.partialSchedule && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                    কিস্তি নং #{customDistribution.partialSchedule.no}-এ আংশিক জমা হবে <strong>{formatCurrency(customDistribution.partialSchedule.paid)}</strong> (অবশিষ্ট থাকবে <strong>{formatCurrency(customDistribution.partialSchedule.remaining)}</strong>)
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>পরিশোধের পর মোট কিস্তির বাকি থাকবে:</span>
                  <span className="font-mono text-rose-600">
                    {formatCurrency(Math.max(0, installment.remainingBalance - payAmount))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Foreclosure / Early Full Settlement */}
          {collectionMode === 'foreclose' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  এককালীন সম্পূর্ণ কিস্তি ক্লোজার ও নিষ্পত্তি
                </span>
                <p className="text-[11px] text-amber-800">
                  গ্রাহক সব কিস্তি একসাথে মিটিয়ে দিলে অবশিষ্ট টাকার উপর বিশেষ ছাড় (Rebate/Discount) দিয়ে সম্পূর্ণ ঋণ সমাপ্ত করতে পারেন।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">বর্তমান মোট অবশিষ্ট বাকি:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(installment.remainingBalance)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">অবশিষ্ট কিস্তি সংখ্যা:</span>
                  <span className="font-bold text-slate-800">{unpaidSchedules.length} টি মাস</span>
                </div>
              </div>

              {/* Discount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রারম্ভিক নিষ্পত্তি বিশেষ ছাড় / ডিসকাউন্ট (Settlement Discount ৳):
                </label>
                <input
                  type="number"
                  min="0"
                  max={installment.remainingBalance}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Net Cash to Collect */}
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block text-sm">গ্রাহক থেকে নগদ প্রদেয়:</span>
                  <span className="text-[10px] text-emerald-700">ছাড় বাদে মোট চূড়ান্ত প্রাপ্তি</span>
                </div>
                <span className="font-mono font-black text-emerald-700 text-lg sm:text-xl">
                  {formatCurrency(netForeclosurePayable)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              পেমেন্ট মাধ্যম (Payment Method):
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'cash', label: 'নগদ', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                { id: 'bkash', label: 'বিকাশ', color: 'border-pink-300 bg-pink-50 text-pink-900' },
                { id: 'nagad', label: 'নগদ', color: 'border-orange-300 bg-orange-50 text-orange-900' },
                { id: 'rocket', label: 'রকেট', color: 'border-purple-300 bg-purple-50 text-purple-900' },
                { id: 'bank', label: 'ব্যাংক', color: 'border-blue-300 bg-blue-50 text-blue-900' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                    paymentMethod === m.id
                      ? `${m.color} ring-2 ring-indigo-600 shadow-xs font-black`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* TrxID if digital/bank */}
            {paymentMethod !== 'cash' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    TrxID / ট্রানজ্যাকশন কোড:
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: 98ABX..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    অ্যাকাউন্ট / মোবাইল নম্বর:
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="০১XXXXXXXXX / ব্যাংক নাম"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মন্তব্য বা কাস্টম রেফারেন্স নোট (ঐচ্ছিক):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="পেমেন্ট রসিদে প্রদর্শন করার মতো নোট..."
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t('বাতিল', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>
                {collectionMode === 'foreclose'
                  ? 'সম্পূর্ণ ক্লোজ ও রসিদ তৈরি'
                  : t('টাকা জমা নিন ও রসিদ দিন', 'Confirm & Generate Receipt')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
