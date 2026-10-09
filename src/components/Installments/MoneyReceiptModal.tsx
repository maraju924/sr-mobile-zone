import React from 'react';
import { Printer, Check, X, Building, Phone, Calendar, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MoneyReceiptModal: React.FC = () => {
  const { lastMoneyReceipt, showMoneyReceiptModal, setShowMoneyReceiptModal, settings, formatCurrency, t } = useApp();

  if (!showMoneyReceiptModal || !lastMoneyReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Modal Top Header (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('অর্থ প্রাপ্তি রশিদ / মানি রিসিট', 'Money Receipt / Payment Voucher')}</h3>
              <p className="text-[11px] text-slate-400">{t('পেমেন্ট সফলভাবে সংরক্ষণ করা হয়েছে', 'Payment recorded successfully')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMoneyReceiptModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="money-receipt-print" className="p-6 sm:p-8 bg-white text-slate-800 space-y-6">
          
          {/* Shop Header */}
          <div className="text-center border-b pb-4 border-dashed border-slate-300">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {settings.storeName}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{settings.address}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              {t('মোবাইল:', 'Mobile:')} {settings.phone}
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-black uppercase tracking-wider text-slate-800">
              {lastMoneyReceipt.title || t('অর্থ প্রাপ্তি রশিদ (Money Receipt)', 'Money Receipt')}
            </div>
          </div>

          {/* Receipt Meta Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">{t('রশিদ নম্বর:', 'Receipt No:')}</span>
              <span className="font-mono font-bold text-slate-900">{lastMoneyReceipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">{t('তারিখ ও সময়:', 'Date & Time:')}</span>
              <span className="font-mono text-slate-900">
                {new Date(lastMoneyReceipt.date || Date.now()).toLocaleDateString('bn-BD')} {new Date(lastMoneyReceipt.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('চালান রেফারেন্স:', 'Invoice Ref:')}</span>
              <span className="font-mono font-bold text-indigo-700">{lastMoneyReceipt.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">{t('পেমেন্ট মাধ্যম:', 'Payment Mode:')}</span>
              <span className="font-bold text-slate-800 uppercase">{lastMoneyReceipt.method || 'নগদ (Cash)'}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('ক্রেতার নাম:', 'Customer Name:')}</span>
              <span className="font-bold text-slate-900">{lastMoneyReceipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('মোবাইল নম্বর:', 'Phone:')}</span>
              <span className="font-mono font-medium text-slate-800">{lastMoneyReceipt.customerPhone}</span>
            </div>
            {lastMoneyReceipt.productSummary && (
              <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                <span className="text-slate-500">{t('পণ্য / বিবরণ:', 'Item / Desc:')}</span>
                <span className="font-medium text-slate-700 text-right truncate max-w-[200px]">{lastMoneyReceipt.productSummary}</span>
              </div>
            )}
          </div>

          {/* Payment Amount Card */}
          <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              {t('আদায়কৃত অর্থের পরিমাণ', 'Amount Received')}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">
              {formatCurrency(lastMoneyReceipt.amount)}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-600 border-t border-emerald-200/80 pt-2 flex justify-between px-2">
              <span>{t('বর্তমান অবশিষ্ট বকেয়া:', 'Remaining Due Balance:')}</span>
              <span className="font-mono font-bold text-rose-600">{formatCurrency(lastMoneyReceipt.remainingDue || 0)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">
                {t('গ্রাহকের স্বাক্ষর', 'Customer Signature')}
              </div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">
                {t('আদায়কারীর স্বাক্ষর ও সিল', 'Authorized Signature')}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[10px] text-center text-slate-400 italic">
            {t('এটি একটি কম্পিউটার জেনারেটেড অর্থ প্রাপ্তি রসিদ। যেকোনো প্রয়োজনে রসিদটি সাথে রাখুন।', 'Computer generated payment receipt. Please retain for your records.')}
          </p>
          <p className="text-[9px] text-center text-slate-400 mt-1">
            {t('সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin', 'Software Developed by: www.fb.com/9alamin')}
          </p>
        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowMoneyReceiptModal(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            {t('বন্ধ করুন', 'Close')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t('রশিদ প্রিন্ট করুন', 'Print Receipt')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
