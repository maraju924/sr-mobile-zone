import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  DollarSign, 
  CreditCard, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { ReportExportModal } from '../Reports/ReportExportModal';

export const SalesHistory: React.FC = () => {
  const { sales, collectDuePayment, setLastInvoice, setShowInvoiceModal, formatCurrency, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Due collection modal state
  const [collectingSale, setCollectingSale] = useState<Sale | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Status filter
      if (statusFilter !== 'all' && s.paymentStatus !== statusFilter) return false;

      // Date filter
      const saleDate = new Date(s.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        if (saleDate.toISOString().split('T')[0] !== todayStr) return false;
      } else if (dateFilter === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        if (saleDate.toISOString().split('T')[0] !== yest.toISOString().split('T')[0]) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (saleDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        if (saleDate.getMonth() !== now.getMonth() || saleDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchInv = s.invoiceNumber.toLowerCase().includes(q);
      const matchCust = s.customerName.toLowerCase().includes(q);
      const matchPhone = s.customerPhone.toLowerCase().includes(q);
      const matchItem = s.items.some(i => i.productName.toLowerCase().includes(q) || i.serialNumbers.some(sn => sn.toLowerCase().includes(q)));

      return matchInv || matchCust || matchPhone || matchItem;
    });
  }, [sales, statusFilter, dateFilter, searchQuery]);

  // Aggregate stats
  const totalFilteredRevenue = useMemo(() => filteredSales.reduce((s, x) => s + x.total, 0), [filteredSales]);
  const totalFilteredPaid = useMemo(() => filteredSales.reduce((s, x) => s + x.paidAmount, 0), [filteredSales]);
  const totalFilteredDue = useMemo(() => filteredSales.reduce((s, x) => s + x.dueAmount, 0), [filteredSales]);

  // Handle Due Collection submit
  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingSale || collectAmount <= 0) return;

    collectDuePayment(collectingSale.id, collectAmount);
    setCollectingSale(null);
    setCollectAmount(0);
  };

  // View invoice
  const handleViewInvoice = (sale: Sale) => {
    setLastInvoice(sale);
    setShowInvoiceModal(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Phone', 'Items Count', 'Subtotal', 'Discount', 'Total', 'Paid', 'Due', 'Payment Method', 'Status'];
    const rows = filteredSales.map(s => [
      s.invoiceNumber,
      new Date(s.createdAt).toLocaleDateString(),
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.customerPhone,
      s.items.reduce((sum, i) => sum + i.quantity, 0),
      s.subtotal,
      s.discount,
      s.total,
      s.paidAmount,
      s.dueAmount,
      s.paymentMethod,
      s.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `ElectroPOS_Sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Top Header & Stats */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {t('বিক্রয় বিবরণ ও ইনভয়েস হিস্ট্রি', 'Sales Transaction & Invoice History')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('সকল কাউন্টার বিক্রয়, কিস্তি ও বাকি চালান', 'All store sales memos, cash receipts & installment records')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('অ্যাকাউন্টিং রিপোর্ট (PDF/Excel)', 'Accounting Report (PDF/Excel)')}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              <span>{t('CSV', 'CSV')}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-700 block">{t('নির্বাচিত মোট বিক্রয়', 'Total Sales')}</span>
            <span className="text-sm sm:text-base font-bold font-mono text-indigo-900">{formatCurrency(totalFilteredRevenue)}</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">{t('নগদ আদায় (Paid)', 'Cash Collected')}</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-900">{formatCurrency(totalFilteredPaid)}</span>
          </div>

          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-700 block">{t('বকেয়া / বাকি (Due)', 'Outstanding Due')}</span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-900">{formatCurrency(totalFilteredDue)}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ইনভয়েস #, ক্রেতার নাম, মোবাইল বা IMEI...', 'Invoice #, Customer, Phone, IMEI...')}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('সকল সময়', 'All Time')}</option>
            <option value="today">{t('আজকের বিক্রয়', 'Today')}</option>
            <option value="yesterday">{t('গতকালের বিক্রয়', 'Yesterday')}</option>
            <option value="week">{t('বিগত ৭ দিন', 'Last 7 Days')}</option>
            <option value="month">{t('চলতি মাস', 'This Month')}</option>
          </select>

          {/* Status Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t('সকল', 'All')}
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              {t('পরিশোধিত', 'Paid')}
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'due' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              {t('বকেয়া', 'Due')}
            </button>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredSales.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm font-medium">{t('কোন বিক্রয় তথ্য পাওয়া যায়নি', 'No sales transactions found')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-3 px-4">{t('ইনভয়েস ও তারিখ', 'Invoice & Date')}</th>
                    <th className="py-3 px-3">{t('ক্রেতা ও মোবাইল', 'Customer & Phone')}</th>
                    <th className="py-3 px-3">{t('পণ্যসমূহ', 'Items Summary')}</th>
                    <th className="py-3 px-3 text-right">{t('মোট মূল্য', 'Total')}</th>
                    <th className="py-3 px-3 text-right">{t('আদায় (Paid)', 'Paid')}</th>
                    <th className="py-3 px-3 text-right">{t('বকেয়া (Due)', 'Due')}</th>
                    <th className="py-3 px-3 text-center">{t('পেমেন্ট মাধ্যম', 'Method')}</th>
                    <th className="py-3 px-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Invoice & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-indigo-700">{s.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{s.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.customerPhone}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-slate-700 max-w-[200px] truncate">
                          {s.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {s.items.reduce((sum, i) => sum + i.quantity, 0)} {t('টি আইটেম', 'items')}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(s.total)}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(s.paidAmount)}
                      </td>

                      {/* Due */}
                      <td className="py-3 px-3 text-right font-mono">
                        {s.dueAmount > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            {formatCurrency(s.dueAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">০ ৳</span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
                          {s.paymentMethod === 'installment' ? 'কিস্তি' : s.paymentMethod}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If has Due, collect button */}
                          {s.dueAmount > 0 && (
                            <button
                              onClick={() => {
                                setCollectingSale(s);
                                setCollectAmount(s.dueAmount);
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              {t('বাকি জমা', 'Pay Due')}
                            </button>
                          )}

                          {/* View Invoice */}
                          <button
                            onClick={() => handleViewInvoice(s)}
                            title={t('ইনভয়েস দেখুন ও প্রিন্ট করুন', 'View & Print Invoice')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Collect Due Payment Modal */}
      {collectingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">{t('বাকি টাকা আদায়', 'Collect Due Payment')}</h4>
              <button onClick={() => setCollectingSale(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCollectDue} className="py-4 space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>{t('ইনভয়েস নম্বর:', 'Invoice #:')}</span>
                  <span className="font-mono font-bold">{collectingSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('ক্রেতার নাম:', 'Customer:')}</span>
                  <span className="font-semibold">{collectingSale.customerName}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200">
                  <span>{t('বর্তমান মোট বকেয়া:', 'Current Due:')}</span>
                  <span className="font-mono">{formatCurrency(collectingSale.dueAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('আদায়কৃত টাকার পরিমাণ (৳):', 'Payment Amount Received:')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={collectingSale.dueAmount}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectingSale(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition"
                >
                  {t('জমা সংরক্ষণ করুন', 'Confirm Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialType="daily_sales"
      />
    </div>
  );
};
