import React, { useState } from 'react';
import { X, Printer, Share2, Download, CheckCircle, FileText, Smartphone, ShieldCheck } from 'lucide-react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { BarcodeGenerator } from '../Common/BarcodeGenerator';

interface InvoiceModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  isOpen,
  onClose
}) => {
  const { settings, formatCurrency, t } = useApp();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*${settings.storeName} - ইনভয়েস*\nইনভয়েস নং: ${sale.invoiceNumber}\nতারিখ: ${new Date(sale.createdAt).toLocaleDateString()}\nগ্রাহক: ${sale.customerName}\nমোট মূল্য: ${formatCurrency(sale.total)}\nপরিশোধ: ${formatCurrency(sale.paidAmount)}\nবকেয়া: ${formatCurrency(sale.dueAmount)}\nধন্যবাদ!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${sale.customerPhone.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = `${settings.storeName}\nইনভয়েস নং: ${sale.invoiceNumber}\nতারিখ: ${new Date(sale.createdAt).toLocaleString()}\nগ্রাহক: ${sale.customerName} (${sale.customerPhone})\nমোট: ${formatCurrency(sale.total)} | পেইড: ${formatCurrency(sale.paidAmount)} | বাকি: ${formatCurrency(sale.dueAmount)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] border-0 sm:border border-slate-200">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white border-b border-slate-800 gap-2 no-print shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="overflow-hidden">
              <h3 className="font-bold text-xs sm:text-base leading-tight truncate">
                {t('বিক্রয় ইনভয়েস ও রসিদ', 'Sales Invoice & Receipt')}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">{sale.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Format Toggle */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium text-xs transition cursor-pointer ${
                  printFormat === 'a4' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium text-xs transition cursor-pointer ${
                  printFormat === 'thermal' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                POS
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShareWhatsApp}
              title={t('হোয়াটসঅ্যাপে পাঠান', 'Share on WhatsApp')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View (Scrollable) */}
        <div className="p-3 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          
          <div 
            id="printable-invoice" 
            className={`mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 transition-all ${
              printFormat === 'thermal' ? 'max-w-[340px] text-xs font-mono p-4' : 'max-w-2xl'
            }`}
          >
            {/* Header */}
            <div className={`text-center pb-4 border-b border-dashed border-slate-300 ${printFormat === 'thermal' ? 'pb-3' : 'pb-6'}`}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h1 className={`font-bold text-slate-900 tracking-tight ${printFormat === 'thermal' ? 'text-base' : 'text-xl'}`}>
                {settings.storeName}
              </h1>
              <p className="text-slate-600 text-xs mt-0.5">{settings.address}</p>
              <p className="text-slate-600 text-xs font-mono">{settings.phone}</p>
              
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full font-mono text-[11px] font-semibold text-slate-700 uppercase">
                {sale.saleType === 'installment' ? t('কিস্তি বিক্রয় চালান', 'EMI Sales Memo') : t('ক্যাশ মেমো / ইনভয়েস', 'Cash Memo / Invoice')}
              </div>
            </div>

            {/* Meta info */}
            <div className={`grid grid-cols-2 gap-2 text-xs py-3 border-b border-dashed border-slate-200 ${printFormat === 'thermal' ? 'text-[11px]' : ''}`}>
              <div>
                <p className="text-slate-500">{t('ইনভয়েস নং:', 'Invoice No:')}</p>
                <p className="font-bold font-mono text-slate-800">{sale.invoiceNumber}</p>
                <p className="text-slate-500 mt-1">{t('তারিখ ও সময়:', 'Date & Time:')}</p>
                <p className="text-slate-700 font-mono">
                  {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-slate-500">{t('গ্রাহকের নাম:', 'Customer Name:')}</p>
                <p className="font-bold text-slate-800">{sale.customerName}</p>
                <p className="text-slate-500 mt-1">{t('মোবাইল নম্বর:', 'Phone:')}</p>
                <p className="text-slate-700 font-mono">{sale.customerPhone}</p>
                {sale.customerAddress && (
                  <p className="text-slate-500 text-[11px] truncate">{sale.customerAddress}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="my-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                    <th className="py-2 text-left">{t('পণ্য ও বিবরণ', 'Item Details')}</th>
                    <th className="py-2 text-center w-12">{t('পরিমাণ', 'Qty')}</th>
                    <th className="py-2 text-right">{t('দর', 'Price')}</th>
                    <th className="py-2 text-right">{t('মোট', 'Total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-2.5 pr-2">
                        <p className="font-semibold text-slate-800 leading-tight">{item.productName}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">ব্র্যান্ড: {item.brand}</span>
                          {item.warrantyMonths > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {item.warrantyMonths} {t('মাস ওয়ারেন্টি', 'Mo Warranty')}
                            </span>
                          )}
                        </div>

                        {/* IMEI / Serial Numbers */}
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <div className="mt-1 bg-slate-50 p-1 rounded border border-slate-100">
                            <span className="text-[10px] font-semibold text-indigo-700 block">
                              IMEI / সিরিয়াল নম্বর:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.serialNumbers.map((sn, sIdx) => (
                                <span key={sIdx} className="font-mono text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-700">
                                  {sn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-center font-mono font-medium text-slate-700">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('উপমোট (Subtotal):', 'Subtotal:')}</span>
                <span className="font-mono">{formatCurrency(sale.subtotal)}</span>
              </div>
              
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{t('বিশেষ ছাড় (Discount):', 'Discount:')}</span>
                  <span className="font-mono">-{formatCurrency(sale.discount)}</span>
                </div>
              )}

              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{t('ভ্যাট/ট্যাক্স (VAT):', 'VAT/Tax:')}</span>
                  <span className="font-mono">+{formatCurrency(sale.tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>{t('সর্বমোট প্রদেয়:', 'Grand Total:')}</span>
                <span className="font-mono">{formatCurrency(sale.total)}</span>
              </div>

              <div className="flex justify-between text-slate-700 pt-1">
                <span>{t('পরিশোধিত টাকা (Paid):', 'Paid Amount:')}</span>
                <span className="font-mono font-semibold text-emerald-700">{formatCurrency(sale.paidAmount)}</span>
              </div>

              {sale.dueAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">
                  <span>{t('বকেয়া/বাকি (Due):', 'Due Balance:')}</span>
                  <span className="font-mono">{formatCurrency(sale.dueAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                <span>{t('পেমেন্ট মাধ্যম:', 'Payment Mode:')}</span>
                <span className="font-medium uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {sale.paymentMethod === 'bkash' ? 'bKash' :
                   sale.paymentMethod === 'nagad' ? 'Nagad' :
                   sale.paymentMethod === 'card' ? 'Card' :
                   sale.paymentMethod === 'installment' ? 'কিস্তি (EMI)' :
                   sale.paymentMethod === 'due' ? 'বাকি (Due)' : 'নগদ (Cash)'}
                </span>
              </div>
            </div>

            {/* Barcode & Footer Notice */}
            <div className="mt-5 pt-3 border-t border-dashed border-slate-300 text-center">
              <div className="flex justify-center mb-2">
                <BarcodeGenerator value={sale.invoiceNumber} height={35} width={1.5} fontSize={11} />
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-sans max-w-md mx-auto">
                {settings.invoiceFooter}
              </p>
              
              {/* Signatures for A4 format */}
              {printFormat === 'a4' && (
                <div className="flex justify-between items-end mt-12 pt-4 px-4 text-xs text-slate-600">
                  <div className="text-center">
                    <div className="w-32 border-t border-slate-400 mb-1"></div>
                    <span>{t('গ্রাহকের স্বাক্ষর', 'Customer Signature')}</span>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-t border-slate-400 mb-1"></div>
                    <span>{t('কর্তৃপক্ষের স্বাক্ষর', 'Authorized Signature')}</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 mt-4">
                {t('সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin • ধন্যবাদ আবার আসবেন', 'Software Developed by: www.fb.com/9alamin • Thank you for your business')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-200 flex items-center justify-between no-print shrink-0">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2.5 sm:px-3 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{copied ? t('কপি হয়েছে!', 'Copied!') : t('টেক্সট কপি', 'Copy Text')}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer min-h-[40px]"
            >
              {t('বন্ধ করুন', 'Close')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>{t('প্রিন্ট ইনভয়েস', 'Print Invoice')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
