import React, { useState } from 'react';
import { Printer, Check, X, Building, Phone, Calendar, User, ShieldCheck, MessageSquare, Download, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MoneyReceiptModal: React.FC = () => {
  const { lastMoneyReceipt, showMoneyReceiptModal, setShowMoneyReceiptModal, settings, formatCurrency, t } = useApp();
  const [printFormat, setPrintFormat] = useState<'80mm' | '58mm' | 'standard'>('80mm');

  if (!showMoneyReceiptModal || !lastMoneyReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Message Generator
  const handleShareWhatsApp = () => {
    const phone = (lastMoneyReceipt.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('88') ? phone : phone.startsWith('0') ? `88${phone}` : `880${phone}`;
    
    const message = `*${settings.storeName} - অর্থ প্রাপ্তি নিশ্চিতকরণ রশিদ*
━━━━━━━━━━━━━━━━━━
রশিদ নং: ${lastMoneyReceipt.receiptNo}
চালান নং: ${lastMoneyReceipt.invoiceNumber}
তারিখ: ${new Date(lastMoneyReceipt.date || Date.now()).toLocaleDateString('bn-BD')}
গ্রাহক: ${lastMoneyReceipt.customerName}

*আদায়কৃত অর্থ:* ${formatCurrency(lastMoneyReceipt.amount)} (${lastMoneyReceipt.method ? lastMoneyReceipt.method.toUpperCase() : 'নগদ'}${lastMoneyReceipt.trxId ? `, TrxID: ${lastMoneyReceipt.trxId}` : ''})
${lastMoneyReceipt.lateFee ? `জরিমানা/ফি: ${formatCurrency(lastMoneyReceipt.lateFee)}\n` : ''}${lastMoneyReceipt.waivedFee ? `মওকুফকৃত ফি: ${formatCurrency(lastMoneyReceipt.waivedFee)}\n` : ''}${lastMoneyReceipt.discount ? `বিশেষ ছাড়/ডিসকাউন্ট: ${formatCurrency(lastMoneyReceipt.discount)}\n` : ''}*অবশিষ্ট বকেয়া:* ${formatCurrency(lastMoneyReceipt.remainingDue || 0)}

ধন্যবাদ আপনার সহযোগিতার জন্য।
হটলাইন: ${settings.phone}
ঠিকানা: ${settings.address}`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col transition-all duration-300 ${
        printFormat === '58mm' ? 'w-full max-w-[340px]' : printFormat === '80mm' ? 'w-full max-w-md' : 'w-full max-w-lg'
      }`}>
        
        {/* Modal Top Header (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('অর্থ প্রাপ্তি রশিদ / মানি রিসিট', 'Money Receipt / Payment Voucher')}</h3>
              <p className="text-[11px] text-slate-400">{t('পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে', 'Payment recorded successfully')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMoneyReceiptModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Format Selector (Hidden in Print) */}
        <div className="print:hidden bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between text-xs gap-1">
          <span className="text-slate-500 font-semibold pl-1">ফরম্যাট:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                printFormat === '80mm' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ৮০ মিমি POS
            </button>
            <button
              onClick={() => setPrintFormat('58mm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                printFormat === '58mm' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ৫৮ মিমি POS
            </button>
            <button
              onClick={() => setPrintFormat('standard')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                printFormat === 'standard' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ক্লাসিক ভাউচার
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div 
          id="money-receipt-print" 
          className={`overflow-y-auto flex-1 bg-white text-slate-800 font-sans ${
            printFormat === '58mm' ? 'p-3 text-[11px] space-y-3' : 'p-6 sm:p-7 text-xs space-y-4'
          }`}
        >
          
          {/* Shop Header */}
          <div className="text-center border-b pb-3 border-dashed border-slate-300">
            <h2 className={`font-black text-slate-900 tracking-tight ${printFormat === '58mm' ? 'text-base' : 'text-xl'}`}>
              {settings.storeName}
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5 max-w-sm mx-auto">{settings.address}</p>
            <p className="text-[10px] font-semibold text-slate-700 mt-0.5">
              {t('মোবাইল:', 'Mobile:')} {settings.phone}
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              {lastMoneyReceipt.title || t('অর্থ প্রাপ্তি রশিদ (Money Receipt)', 'Money Receipt')}
            </div>
          </div>

          {/* Receipt Meta Details */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">রশিদ নম্বর:</span>
              <span className="font-mono font-bold text-slate-900">{lastMoneyReceipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">তারিখ ও সময়:</span>
              <span className="font-mono text-slate-900">
                {new Date(lastMoneyReceipt.date || Date.now()).toLocaleDateString('bn-BD')} {new Date(lastMoneyReceipt.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">চালান রেফারেন্স:</span>
              <span className="font-mono font-bold text-indigo-700">{lastMoneyReceipt.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">পেমেন্ট মাধ্যম:</span>
              <span className="font-bold text-slate-800 uppercase">
                {lastMoneyReceipt.method || 'নগদ'}
                {lastMoneyReceipt.trxId ? ` (${lastMoneyReceipt.trxId})` : ''}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border border-slate-200 rounded-xl p-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('ক্রেতার নাম:', 'Customer Name:')}</span>
              <span className="font-bold text-slate-900">{lastMoneyReceipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('মোবাইল নম্বর:', 'Phone:')}</span>
              <span className="font-mono font-medium text-slate-800">{lastMoneyReceipt.customerPhone}</span>
            </div>
            {lastMoneyReceipt.paidInstallmentsSummary && (
              <div className="flex justify-between border-t border-slate-100 pt-1 text-emerald-800 font-semibold">
                <span>পরিশোধিত কিস্তি:</span>
                <span>{lastMoneyReceipt.paidInstallmentsSummary}</span>
              </div>
            )}
            {lastMoneyReceipt.productSummary && (
              <div className="flex justify-between border-t border-slate-100 pt-1">
                <span className="text-slate-500">বিবরণ:</span>
                <span className="font-medium text-slate-700 text-right truncate max-w-[180px]">{lastMoneyReceipt.productSummary}</span>
              </div>
            )}
          </div>

          {/* Payment Amount Card */}
          <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              {t('আদায়কৃত অর্থের পরিমাণ', 'Amount Received')}
            </span>
            <div className={`font-black text-emerald-700 font-mono ${printFormat === '58mm' ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(lastMoneyReceipt.amount)}
            </div>

            {/* Extra Breakdowns if any */}
            {(lastMoneyReceipt.lateFee || lastMoneyReceipt.waivedFee || lastMoneyReceipt.discount) && (
              <div className="pt-1.5 border-t border-emerald-200/60 text-[10px] space-y-0.5">
                {lastMoneyReceipt.lateFee ? (
                  <div className="flex justify-between text-amber-900">
                    <span>বিলম্ব ফি অন্তর্ভুক্ত:</span>
                    <span className="font-mono font-bold">+{formatCurrency(lastMoneyReceipt.lateFee)}</span>
                  </div>
                ) : null}
                {lastMoneyReceipt.waivedFee ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>মওকুফকৃত জরিমানা:</span>
                    <span className="font-mono font-bold">-{formatCurrency(lastMoneyReceipt.waivedFee)}</span>
                  </div>
                ) : null}
                {lastMoneyReceipt.discount ? (
                  <div className="flex justify-between text-rose-700">
                    <span>বিশেষ ক্লোজার ছাড়:</span>
                    <span className="font-mono font-bold">-{formatCurrency(lastMoneyReceipt.discount)}</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="text-[11px] font-medium text-slate-700 border-t border-emerald-200/80 pt-1.5 flex justify-between px-1">
              <span>{t('বর্তমান অবশিষ্ট বকেয়া:', 'Remaining Due:')}</span>
              <span className="font-mono font-bold text-rose-600">{formatCurrency(lastMoneyReceipt.remainingDue || 0)}</span>
            </div>
          </div>

          {lastMoneyReceipt.note && (
            <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-200">
              নোট: {lastMoneyReceipt.note}
            </p>
          )}

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">
                {t('গ্রাহকের স্বাক্ষর', 'Customer Signature')}
              </div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">
                {t('আদায়কারীর স্বাক্ষর', 'Authorized Signature')}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[9px] text-center text-slate-400 italic pt-1">
            {t('এটি একটি কম্পিউটার জেনারেটেড অর্থ প্রাপ্তি রসিদ।', 'Computer generated receipt. Please retain for your records.')}
          </p>
        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
        <div className="print:hidden p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => setShowMoneyReceiptModal(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            {t('বন্ধ করুন', 'Close')}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              title="গ্রাহকের নম্বরে সরাসরি WhatsApp মেসেজ পাঠান"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t('প্রিন্ট স্লিপ', 'Print Slip')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
