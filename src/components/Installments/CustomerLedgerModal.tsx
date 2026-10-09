import React, { useMemo } from 'react';
import { X, Printer, Phone, MapPin, User, Calendar, CreditCard, DollarSign, MessageSquare, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale, Installment } from '../../types';

interface CustomerLedgerModalProps {
  customerName: string;
  customerPhone: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  customerName,
  customerPhone,
  isOpen,
  onClose
}) => {
  const { sales, installments, settings, formatCurrency, t } = useApp();
  const [copied, setCopied] = React.useState(false);

  // Filter all sales for this customer
  const customerSales = useMemo(() => {
    return sales.filter(s => 
      (s.customerPhone && s.customerPhone === customerPhone) ||
      (s.customerName && s.customerName.toLowerCase() === customerName.toLowerCase())
    );
  }, [sales, customerName, customerPhone]);

  // Filter installments for this customer
  const customerInstallments = useMemo(() => {
    return installments.filter(i => 
      (i.customerPhone && i.customerPhone === customerPhone) ||
      (i.customerName && i.customerName.toLowerCase() === customerName.toLowerCase())
    );
  }, [installments, customerName, customerPhone]);

  // Aggregate metrics
  const totalBilled = customerSales.reduce((sum, s) => sum + s.total, 0);
  const totalPaidRegular = customerSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalDueRegular = customerSales.reduce((sum, s) => sum + s.dueAmount, 0);
  const totalInstallmentBalance = customerInstallments.reduce((sum, i) => sum + i.remainingBalance, 0);
  const totalOutstanding = totalDueRegular + totalInstallmentBalance;

  // Pre-formatted reminder message
  const reminderMessage = `প্রিয় ${customerName}, আপনার প্রতিষ্ঠান ${settings.storeName}-এ মোট বর্তমান বকেয়া ${totalOutstanding} টাকা। অনুগ্রহ করে বকেয়া পরিশোধ করার জন্য যোগাযোগ করুন (${settings.phone})। ধন্যবাদ!`;

  const handleCopySms = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(reminderMessage)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8">
        
        {/* Header (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('কাস্টমার লেজার খাতা (হিসাব বিবরণী)', 'Customer Account Ledger Statement')}</h3>
              <p className="text-[11px] text-slate-400">{customerName} - {customerPhone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Statement Container */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          
          {/* Shop Header */}
          <div className="text-center border-b pb-4 border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{settings.storeName}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{settings.address} | ফোন: {settings.phone}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              {t('গ্রাহক লেজার স্টেটমেন্ট (খতিয়ান)', 'Customer Ledger Statement')}
            </div>
          </div>

          {/* Customer Profile Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">{t('গ্রাহকের নাম:', 'Customer Name:')}</span>
              <span className="text-sm font-bold text-slate-900">{customerName}</span>
              <span className="text-slate-500 block mt-2">{t('ফোন নম্বর:', 'Phone:')}</span>
              <span className="font-mono font-bold text-slate-800">{customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t('ঠিকানা:', 'Address:')}</span>
              <span className="text-slate-700">{customerSales[0]?.customerAddress || t('তথ্য দেওয়া হয়নি', 'Not specified')}</span>
              <span className="text-slate-500 block mt-2">{t('মোট লেনদেন সংখ্যা:', 'Total Transactions:')}</span>
              <span className="font-bold text-slate-800">{customerSales.length} টি বিক্রয় চালান</span>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">{t('মোট কেনাকাটা', 'Total Billed')}</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(totalBilled)}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-700 block">{t('মোট পরিশোধ', 'Total Paid')}</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{formatCurrency(totalPaidRegular)}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
              <span className="text-[11px] text-rose-700 block">{t('বাকি বিক্রয় বকেয়া', 'Due Sales Balance')}</span>
              <span className="text-sm font-bold text-rose-700 font-mono">{formatCurrency(totalDueRegular)}</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
              <span className="text-[11px] text-purple-700 block">{t('কিস্তির অবশিষ্ট বকেয়া', 'EMI Remaining')}</span>
              <span className="text-sm font-bold text-purple-700 font-mono">{formatCurrency(totalInstallmentBalance)}</span>
            </div>
          </div>

          {/* Quick SMS & WhatsApp actions (Hidden in print) */}
          <div className="print:hidden p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-indigo-900">
              <span className="font-bold block">{t('বকেয়া তাগাদা মেসেজ (SMS / WhatsApp):', 'Due Reminder Message:')}</span>
              <p className="text-[11px] text-indigo-700 mt-0.5 line-clamp-1">{reminderMessage}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopySms}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('কপি হয়েছে', 'Copied') : t('মেসেজ কপি', 'Copy SMS')}</span>
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Chronological Ledger Invoices Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('লেনদেন হিস্ট্রি ও চালানের তালিকা', 'Transaction History & Invoices')}
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="p-2.5">{t('তারিখ', 'Date')}</th>
                    <th className="p-2.5">{t('ইনভয়েস #', 'Invoice #')}</th>
                    <th className="p-2.5">{t('পণ্যের বিবরণ', 'Items')}</th>
                    <th className="p-2.5 text-right">{t('মোট বিল', 'Total')}</th>
                    <th className="p-2.5 text-right">{t('পরিশোধ', 'Paid')}</th>
                    <th className="p-2.5 text-right">{t('বকেয়া', 'Due')}</th>
                    <th className="p-2.5 text-center">{t('পদ্ধতি', 'Type')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">
                        {t('কোনো বিক্রয় চালান পাওয়া যায়নি', 'No sales transactions found')}
                      </td>
                    </tr>
                  ) : (
                    customerSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">
                          {new Date(sale.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-indigo-700">
                          {sale.invoiceNumber}
                        </td>
                        <td className="p-2.5 text-slate-800 max-w-[180px] truncate">
                          {sale.items.map(i => i.productName).join(', ')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                          {formatCurrency(sale.paidAmount)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                          {formatCurrency(sale.dueAmount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            sale.saleType === 'installment' 
                              ? 'bg-purple-100 text-purple-700' 
                              : sale.dueAmount > 0 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sale.saleType === 'installment' ? 'কিস্তি' : sale.dueAmount > 0 ? 'বাকি' : 'নগদ'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Installments Details if any */}
          {customerInstallments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                {t('চলতি কিস্তির বিস্তারিত শিডিউল', 'Active Installment Plans')}
              </h4>
              <div className="space-y-3">
                {customerInstallments.map(inst => (
                  <div key={inst.id} className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
                      <div>
                        <span className="font-bold text-purple-950">{inst.productNameSummary}</span>
                        <span className="text-[11px] text-purple-700 font-mono ml-2">({inst.invoiceNumber})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span>মোট: <strong>{formatCurrency(inst.totalAmount)}</strong></span>
                        <span className="text-purple-700">জমা: <strong>{inst.paidCount}/{inst.installmentCount} কিস্তি</strong></span>
                        <span className="text-rose-600 font-bold">অবশিষ্ট: {formatCurrency(inst.remainingBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grand Balance Footer */}
          <div className="pt-4 border-t-2 border-slate-300 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-800">{t('গ্রাহকের সর্বমোট বকেয়া ব্যালেন্স:', 'Total Outstanding Balance Due:')}</span>
            <span className="text-lg font-mono text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>

          {/* Print Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">{t('গ্রাহকের স্বাক্ষর', 'Customer Signature')}</div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-1 font-semibold">{t('ম্যানেজার / স্বত্বাধিকারী', 'Manager Signature')}</div>
            </div>
          </div>
        </div>

        {/* Modal Actions (Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            {t('বন্ধ করুন', 'Close')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t('লেজার প্রিন্ট করুন', 'Print Statement')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
