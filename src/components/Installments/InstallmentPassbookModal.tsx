import React from 'react';
import { X, Printer, ShieldCheck, User, Phone, MapPin, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Installment } from '../../types';

interface InstallmentPassbookModalProps {
  installment: Installment;
  isOpen: boolean;
  onClose: () => void;
}

export const InstallmentPassbookModal: React.FC<InstallmentPassbookModalProps> = ({
  installment,
  isOpen,
  onClose
}) => {
  const { settings, formatCurrency, t } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalPaidAmount = installment.schedule.reduce((sum, s) => sum + (s.paidAmount || (s.isPaid ? s.amount : 0)), 0) + installment.downPayment;
  const progressPercent = Math.min(100, Math.round((totalPaidAmount / installment.totalAmount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('ডিজিটাল কিস্তি বহি / গ্রাহক কার্ড', 'Digital EMI Passbook / Customer Card')}</h3>
              <p className="text-[11px] text-slate-300">ইনভয়েস: {installment.invoiceNumber} | গ্রাহক: {installment.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t('পাসবুক প্রিন্ট করুন', 'Print Passbook')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Passbook Body */}
        <div id="printable-passbook" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs">
          
          {/* Header Block */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{settings.storeName}</h1>
            <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
            <p className="text-xs text-slate-600">ফোন / হটলাইন: <span className="font-mono font-semibold">{settings.phone}</span></p>
            
            <div className="mt-3 inline-block bg-slate-900 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider">
              {t('হায়ার পারচেজ কিস্তি বহি ও চুক্তিপত্র (EMI Customer Passbook)', 'Hire Purchase Customer Passbook')}
            </div>
          </div>

          {/* Account Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-slate-200 bg-slate-50 px-3 rounded-lg mt-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">ইনভয়েস / হিসাব নং:</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{installment.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">চুক্তির তারিখ:</span>
              <span className="font-semibold text-slate-800">{new Date(installment.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">মোট কিস্তি সংখ্যা:</span>
              <span className="font-bold text-indigo-700">{installment.installmentCount} টি মাস</span>
            </div>
            <div>
              <span className="text-slate-500 block">বর্তমান অবস্থা:</span>
              <span className={`font-bold uppercase ${
                installment.status === 'completed' ? 'text-emerald-700' :
                installment.status === 'overdue' ? 'text-rose-700' : 'text-blue-700'
              }`}>
                {installment.status === 'completed' ? 'সম্পূর্ণ পরিশোধিত' :
                 installment.status === 'overdue' ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'চলমান কিস্তি (Active)'}
              </span>
            </div>
          </div>

          {/* Customer & Guarantor Dual Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            
            {/* Customer Details Box */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  {t('১. ক্রেতা / গ্রাহকের তথ্য', '1. Customer Profile')}
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">মূল খরিদ্দার</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">পূর্ণ নাম:</span>
                  <span className="font-bold text-slate-900">{installment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-mono font-semibold text-slate-900">{installment.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono font-semibold text-slate-800">{installment.customerNid || 'নথিতে সংরক্ষিত'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পিতা/স্বামীর নাম:</span>
                  <span className="text-slate-800">{installment.customerFatherOrSpouse || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান ঠিকানা:</span>
                  <span className="text-slate-800 text-right max-w-[200px]">{installment.customerAddress || 'দোকান রেজিস্টারে সংরক্ষিত'}</span>
                </div>
              </div>
            </div>

            {/* Guarantor Details Box */}
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {t('২. জামিনদার / গ্যারান্টারের তথ্য', '2. Guarantor Profile')}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">দায়ভার গ্রহণকারী</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">জামিনদারের নাম:</span>
                  <span className="font-bold text-slate-900">{installment.guarantorName || '— (স্বাক্ষরিত)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-mono font-semibold text-slate-900">{installment.guarantorPhone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono font-semibold text-slate-800">{installment.guarantorNid || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ক্রেতার সাথে সম্পর্ক:</span>
                  <span className="font-semibold text-indigo-700">{installment.guarantorRelation || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">জামিনদারের ঠিকানা:</span>
                  <span className="text-slate-800 text-right max-w-[200px]">{installment.guarantorAddress || 'রেজিস্টারে সংরক্ষিত'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product & Financial Overview */}
          <div className="border border-slate-300 rounded-xl p-3.5 mb-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-800 text-xs">৩. ক্রয়কৃত পণ্য ও আর্থিক বিবরণী:</span>
              <span className="font-semibold text-indigo-900">{installment.productNameSummary}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-2 border-t border-slate-200">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">মোট চুক্তিমূল্য:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(installment.totalAmount)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">ডাউন পেমেন্ট (জমা):</span>
                <span className="font-mono font-bold text-emerald-700">{formatCurrency(installment.downPayment)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">মোট কিস্তি ঋণ:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(installment.totalAmount - installment.downPayment)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">মাসিক কিস্তি:</span>
                <span className="font-mono font-bold text-indigo-700">{formatCurrency(installment.monthlyAmount)} / মাস</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">অবশিষ্ট পাওনা:</span>
                <span className="font-mono font-bold text-rose-700">{formatCurrency(installment.remainingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Installment Schedule Table (Passbook Grid) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                ৪. কিস্তি আদায় ও জমার খতিয়ান সূচি (Payment Schedule Ledger):
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">
                পরিশোধিত: <span className="font-mono text-emerald-700 font-bold">{installment.paidCount}</span> / {installment.installmentCount} টি কিস্তি
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="py-2 px-2.5 text-center w-12 border-r border-slate-200">নং</th>
                    <th className="py-2 px-3 border-r border-slate-200">নির্ধারিত তারিখ</th>
                    <th className="py-2 px-3 border-r border-slate-200 text-right">কিস্তির টাকা</th>
                    <th className="py-2 px-3 border-r border-slate-200">আদায়ের তারিখ</th>
                    <th className="py-2 px-3 border-r border-slate-200 text-right">আদায়কৃত টাকা</th>
                    <th className="py-2 px-3 border-r border-slate-200 text-center">মানি রিসিট নং</th>
                    <th className="py-2 px-3 border-r border-slate-200 text-center">অবস্থা</th>
                    <th className="py-2 px-4 text-center">আদায়কারীর স্বাক্ষর ও সিল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {installment.schedule.map((item) => (
                    <tr 
                      key={item.id}
                      className={item.isPaid ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}
                    >
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                        {item.installmentNo}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800 border-r border-slate-200">
                        {item.dueDate}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right border-r border-slate-200">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-200">
                        {item.paidDate ? new Date(item.paidDate).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-800 text-right border-r border-slate-200">
                        {item.paidAmount ? formatCurrency(item.paidAmount) : (item.isPaid ? formatCurrency(item.amount) : '—')}
                      </td>
                      <td className="py-2 px-3 font-mono text-center text-slate-700 border-r border-slate-200">
                        {item.receiptNo || '—'}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">
                        {item.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> আদায় সম্পন্ন
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            বকেয়া রয়েছে
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {item.isPaid ? (
                          <span className="text-[10px] font-serif text-slate-600 italic">গৃহীত ও সিলমোহরকৃত ✓</span>
                        ) : (
                          <div className="w-24 h-4 mx-auto border-b border-dashed border-slate-300"></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 mb-6">
            <span className="font-bold text-slate-800 block mb-1">কিস্তির গুরুত্বপূর্ণ নিয়মাবলী ও শর্তসমূহ:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>প্রতি মাসের নির্ধারিত তারিখের মধ্যে কিস্তির টাকা শোরুমে এসে অথবা অনুমোদিত নম্বরে পরিশোধ করে রশিদ বুঝে নিতে হবে।</li>
              <li>পরপর ২টি কিস্তি খেলাপী হলে কর্তৃপক্ষ পণ্য জব্দ অথবা চুক্তি অনুযায়ী আইনানুগ ব্যবস্থা গ্রহণ করার অধিকার সংরক্ষণ করে।</li>
              <li>সম্পূর্ণ কিস্তি পরিশোধ না হওয়া পর্যন্ত পণ্যের মূল মালিকানা শোরুম কর্তৃপক্ষের অধীনে থাকবে।</li>
              <li>যেকোনো প্রয়োজনে শোরুম হটলাইনে যোগাযোগ করুন: {settings.phone}।</li>
            </ul>
          </div>

          {/* Signatures & Seal Box */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[11px] border-t border-slate-300">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">ক্রেতার স্বাক্ষর</p>
              <p className="text-[10px] text-slate-500">তারিখ:</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">জামিনদারের স্বাক্ষর</p>
              <p className="text-[10px] text-slate-500">তারিখ:</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">কর্তৃপক্ষের স্বাক্ষর ও শোরুমের সিল</p>
              <p className="text-[10px] text-slate-500">{settings.storeName}</p>
            </div>
          </div>

          {/* Attribution Footer */}
          <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
            সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin | প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-600">
            অগ্রগতি: <span className="font-bold text-indigo-700">{progressPercent}% পরিশোধিত</span> ({formatCurrency(totalPaidAmount)} / {formatCurrency(installment.totalAmount)})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition"
            >
              {t('বন্ধ করুন', 'Close')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t('কিস্তি কার্ড প্রিন্ট করুন', 'Print EMI Passbook')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
