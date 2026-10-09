import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Clock, 
  TrendingUp, 
  Users, 
  Search, 
  FileCheck, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ReportType, 
  DailySalesFilter, 
  InventoryFilter, 
  CustomerDuesFilter,
  buildDailySalesReport,
  buildInventorySummaryReport,
  buildCustomerDuesReport,
  exportDailySalesToExcel,
  exportInventorySummaryToExcel,
  exportCustomerDuesToExcel,
  exportDailySalesToCsv,
  exportInventorySummaryToCsv,
  exportCustomerDuesToCsv,
  exportDailySalesToPdf,
  exportInventorySummaryToPdf,
  exportCustomerDuesToPdf,
  generateDailySalesHtml,
  generateInventorySummaryHtml,
  generateCustomerDuesHtml,
  printReportDocument
} from '../../services/reportExportService';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReportType;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  initialType = 'daily_sales'
}) => {
  const { sales, products, installments, settings, formatCurrency, t } = useApp();

  const [activeReportType, setActiveReportType] = useState<ReportType>(initialType);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // 1. Daily Sales Filter State
  const todayStr = new Date().toISOString().split('T')[0];
  const [salesFilter, setSalesFilter] = useState<DailySalesFilter>({
    date: todayStr,
    endDate: todayStr,
    paymentMethod: 'all'
  });
  const [isDateRange, setIsDateRange] = useState(false);

  // 2. Inventory Filter State
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>({
    category: 'all',
    brand: 'all',
    stockStatus: 'all'
  });

  // 3. Customer Dues Filter State
  const [duesFilter, setDuesFilter] = useState<CustomerDuesFilter>({
    status: 'all',
    minDue: 0
  });

  // Quick Date Selectors
  const setQuickDate = (mode: 'today' | 'yesterday' | 'this_month') => {
    const now = new Date();
    if (mode === 'today') {
      setIsDateRange(false);
      setSalesFilter(prev => ({ ...prev, date: todayStr, endDate: todayStr }));
    } else if (mode === 'yesterday') {
      setIsDateRange(false);
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setSalesFilter(prev => ({ ...prev, date: yStr, endDate: yStr }));
    } else if (mode === 'this_month') {
      setIsDateRange(true);
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setSalesFilter(prev => ({ ...prev, date: firstDay, endDate: todayStr }));
    }
  };

  // Categories & Brands for filters
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).filter(Boolean);
  }, [products]);

  // Compute reports based on active type
  const salesReportData = useMemo(() => {
    return buildDailySalesReport(sales, salesFilter, settings);
  }, [sales, salesFilter, settings]);

  const inventoryReportData = useMemo(() => {
    return buildInventorySummaryReport(products, inventoryFilter);
  }, [products, inventoryFilter]);

  const duesReportData = useMemo(() => {
    return buildCustomerDuesReport(sales, installments, duesFilter);
  }, [sales, installments, duesFilter]);

  if (!isOpen) return null;

  // Handlers for Exports
  const handleExcelExport = () => {
    if (activeReportType === 'daily_sales') {
      exportDailySalesToExcel(salesReportData, settings);
    } else if (activeReportType === 'inventory_summary') {
      exportInventorySummaryToExcel(inventoryReportData, settings);
    } else if (activeReportType === 'customer_dues') {
      exportCustomerDuesToExcel(duesReportData, settings);
    }
  };

  const handleCsvExport = () => {
    if (activeReportType === 'daily_sales') {
      exportDailySalesToCsv(salesReportData);
    } else if (activeReportType === 'inventory_summary') {
      exportInventorySummaryToCsv(inventoryReportData);
    } else if (activeReportType === 'customer_dues') {
      exportCustomerDuesToCsv(duesReportData);
    }
  };

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    try {
      if (activeReportType === 'daily_sales') {
        await exportDailySalesToPdf(salesReportData, settings);
      } else if (activeReportType === 'inventory_summary') {
        await exportInventorySummaryToPdf(inventoryReportData, settings);
      } else if (activeReportType === 'customer_dues') {
        await exportCustomerDuesToPdf(duesReportData, settings);
      }
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleTriggerPrint = () => {
    if (activeReportType === 'daily_sales') {
      const html = generateDailySalesHtml(salesReportData, settings);
      printReportDocument('দৈনিক বিক্রয় রিপোর্ট', html);
    } else if (activeReportType === 'inventory_summary') {
      const html = generateInventorySummaryHtml(inventoryReportData, settings);
      printReportDocument('ইনভেন্টরি স্টক মূল্যায়ন', html);
    } else if (activeReportType === 'customer_dues') {
      const html = generateCustomerDuesHtml(duesReportData, settings);
      printReportDocument('গ্রাহক বকেয়া খতিয়ান', html);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>{t('অ্যাকাউন্টিং রিপোর্ট এক্সপোর্ট সেন্টার', 'Accounting & Financial Report Center')}</span>
                <span className="text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  PDF & Excel
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {t('দৈনিক বিক্রয়, স্টক সম্পদ ও বাকি খতিয়ান রিপোর্ট এক্সটার্নাল অডিট ও ট্যাক্স ফাইলিংয়ের জন্য ডাউনলোড করুন', 'Generate and export audit-ready sales, stock valuations, and receivables reports')}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="bg-slate-100 p-2 sm:px-6 sm:py-3 border-b border-slate-200 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => { setActiveReportType('daily_sales'); setShowPrintPreview(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeReportType === 'daily_sales'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>{t('১. দৈনিক বিক্রয় ও রাজস্ব রিপোর্ট', '1. Daily Sales & Revenue')}</span>
          </button>

          <button
            onClick={() => { setActiveReportType('inventory_summary'); setShowPrintPreview(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeReportType === 'inventory_summary'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>{t('২. ইনভেন্টরি ও স্টক সম্পদ মূল্যায়ন', '2. Inventory Stock Valuation')}</span>
          </button>

          <button
            onClick={() => { setActiveReportType('customer_dues'); setShowPrintPreview(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeReportType === 'customer_dues'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-rose-600" />
            <span>{t('৩. কাস্টমার বকেয়া ও বাকি খতিয়ান', '3. Customer Dues & Receivables')}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* Filter Bar according to Active Tab */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('রিপোর্ট ফিল্টার ও প্যারামিটার', 'Report Parameters & Filters')}</span>
              </h4>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintPreview(!showPrintPreview)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                    showPrintPreview 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{showPrintPreview ? t('তালিকা ভিউতে ফিরুন', 'Back to Table View') : t('প্রিন্ট ভাউচার প্রিভিউ', 'Print Voucher Preview')}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DAILY SALES FILTER */}
            {activeReportType === 'daily_sales' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{t('কুইক রেঞ্জ:', 'Quick Dates:')}</span>
                  <button
                    onClick={() => setQuickDate('today')}
                    className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                      !isDateRange && salesFilter.date === todayStr ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t('আজকের রিপোর্ট', 'Today')}
                  </button>
                  <button
                    onClick={() => setQuickDate('yesterday')}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition"
                  >
                    {t('গতকাল', 'Yesterday')}
                  </button>
                  <button
                    onClick={() => setQuickDate('this_month')}
                    className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                      isDateRange ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t('চলতি মাস', 'This Month')}
                  </button>

                  <label className="flex items-center gap-1.5 ml-auto text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDateRange}
                      onChange={(e) => setIsDateRange(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{t('তারিখের পরিসীমা (Date Range)', 'Date Range')}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isDateRange ? t('শুরুর তারিখ (Start Date)', 'Start Date') : t('তারিখ (Report Date)', 'Report Date')}
                    </label>
                    <input
                      type="date"
                      value={salesFilter.date}
                      onChange={(e) => setSalesFilter(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {isDateRange && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {t('শেষ তারিখ (End Date)', 'End Date')}
                      </label>
                      <input
                        type="date"
                        value={salesFilter.endDate || todayStr}
                        onChange={(e) => setSalesFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t('পেমেন্ট মাধ্যম (Payment Method)', 'Payment Method')}
                    </label>
                    <select
                      value={salesFilter.paymentMethod}
                      onChange={(e) => setSalesFilter(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="all">{t('সকল পেমেন্ট মাধ্যম (All Methods)', 'All Payment Methods')}</option>
                      <option value="cash">নগদ (Cash)</option>
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="card">কার্ড (Card)</option>
                      <option value="installment">কিস্তি (EMI/Installment)</option>
                      <option value="due">বাকি (Due Sale)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY SUMMARY FILTER */}
            {activeReportType === 'inventory_summary' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('পণ্যের ক্যাটাগরি (Category)', 'Product Category')}
                  </label>
                  <select
                    value={inventoryFilter.category}
                    onChange={(e) => setInventoryFilter(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">{t('সকল ক্যাটাগরি (All Categories)', 'All Categories')}</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('ব্র্যান্ড (Brand)', 'Brand')}
                  </label>
                  <select
                    value={inventoryFilter.brand}
                    onChange={(e) => setInventoryFilter(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">{t('সকল ব্র্যান্ড (All Brands)', 'All Brands')}</option>
                    {brands.map((b, i) => (
                      <option key={i} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('স্টক অবস্থা (Stock Status)', 'Stock Status')}
                  </label>
                  <select
                    value={inventoryFilter.stockStatus}
                    onChange={(e) => setInventoryFilter(prev => ({ ...prev, stockStatus: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">{t('সকল পণ্য (All Inventory)', 'All Items')}</option>
                    <option value="in_stock">{t('স্টকে বিদ্যমান (In Stock)', 'In Stock')}</option>
                    <option value="low_stock">{t('লো-স্টক সতর্কতা (Low Stock Alert)', 'Low Stock Alert')}</option>
                    <option value="out_of_stock">{t('স্টক শেষ (Out of Stock)', 'Out of Stock')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOMER DUES FILTER */}
            {activeReportType === 'customer_dues' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('বকেয়া ক্যাটাগরি (Dues Filter)', 'Dues Filter')}
                  </label>
                  <select
                    value={duesFilter.status}
                    onChange={(e) => setDuesFilter(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">{t('সকল বকেয়া গ্রাহক (All Customers with Due)', 'All Due Customers')}</option>
                    <option value="overdue">{t('শুধুমাত্র মেয়াদোত্তীর্ণ কিস্তি (Overdue EMI Only)', 'Overdue EMI Only')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('সর্বনিম্ন বকেয়া টাকার পরিমাণ (Min Due Amount)', 'Minimum Due Amount')}
                  </label>
                  <input
                    type="number"
                    value={duesFilter.minDue || ''}
                    onChange={(e) => setDuesFilter(prev => ({ ...prev, minDue: Number(e.target.value) || 0 }))}
                    placeholder="e.g. 1000"
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FINANCIAL SUMMARY KPI CARDS */}
          {activeReportType === 'daily_sales' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('মোট বিক্রয় ইনভয়েস', 'Total Sales Invoices')}</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {salesReportData.summary.totalTransactions} {t('টি', '')}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('সম্পন্ন লেনদেন', 'Completed orders')}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('মোট নিট রাজস্ব (Revenue)', 'Net Sales Revenue')}</span>
                <span className="text-xl font-bold font-mono text-indigo-700 mt-1 block">
                  {formatCurrency(salesReportData.summary.netSales)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t('গ্রস:', 'Gross:')} {formatCurrency(salesReportData.summary.grossSales)}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('প্রাক্কলিত মোট লাভ (Profit)', 'Estimated Gross Profit')}</span>
                <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
                  {formatCurrency(salesReportData.summary.grossProfit)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  {salesReportData.summary.profitMarginPercent}% {t('মুনাফা মার্জিন', 'margin')}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('নতুন বাকি / রিসিভেবল', 'Receivables Added')}</span>
                <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                  {formatCurrency(salesReportData.summary.receivablesDue)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t('নগদ আদায়:', 'Realized:')} {formatCurrency(salesReportData.summary.cashCollected + salesReportData.summary.digitalCollected)}
                </span>
              </div>
            </div>
          )}

          {activeReportType === 'inventory_summary' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('মোট স্টক ইউনিট', 'Total Physical Stock')}</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {inventoryReportData.summary.totalStockUnits} {t('টি আইটেম', 'units')}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {inventoryReportData.summary.totalSKUs} {t('টি অনন্য মডেল (SKU)', 'unique models')}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('ক্রয়মূল্যে সম্পদ মূল্যায়ন (COGS)', 'Stock Valuation at Cost')}</span>
                <span className="text-xl font-bold font-mono text-indigo-700 mt-1 block">
                  {formatCurrency(inventoryReportData.summary.totalValuationCost)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('ব্যবসায়িক মজুদ সম্পদ', 'Inventory Asset Value')}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('বিক্রয়মূল্যে মোট স্টক মূল্য', 'Retail Value in Stock')}</span>
                <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
                  {formatCurrency(inventoryReportData.summary.totalValuationRetail)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('সম্ভাব্য বিক্রয় আয়', 'Potential gross return')}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('প্রত্যাশিত আনরিয়ালাইজড লাভ', 'Projected Gross Profit')}</span>
                <span className="text-xl font-bold font-mono text-purple-700 mt-1 block">
                  {formatCurrency(inventoryReportData.summary.projectedGrossProfit)}
                </span>
                <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
                  {inventoryReportData.summary.projectedMarginPercent}% {t('প্রত্যাশিত মার্জিন', 'margin')}
                </span>
              </div>
            </div>
          )}

          {activeReportType === 'customer_dues' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('বকেয়া থাকা মোট গ্রাহক', 'Customers with Dues')}</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {duesReportData.summary.totalCustomersWithDue} {t('জন', 'clients')}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('দেনাদার তালিকা', 'Active accounts')}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('মোট আদায়যোগ্য বাকি (AR)', 'Total Accounts Receivable')}</span>
                <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                  {formatCurrency(duesReportData.summary.totalAccountsReceivable)}
                </span>
                <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">{t('চলতি পাওনা', 'Pending collection')}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('মেয়াদোত্তীর্ণ কিস্তি বকেয়া', 'Overdue EMI Arrears')}</span>
                <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
                  {formatCurrency(duesReportData.summary.totalOverdueInstallmentsAmount)}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                  {duesReportData.summary.overdueInstallmentsCount} {t('টি কিস্তি বিলম্বিত', 'overdue installments')}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">{t('গড় বকেয়া প্রতি গ্রাহক', 'Avg Due per Customer')}</span>
                <span className="text-xl font-bold font-mono text-slate-800 mt-1 block">
                  {formatCurrency(duesReportData.summary.averageDuePerCustomer)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('গড় ঝুঁকি মূল্যায়ন', 'Credit risk assessment')}</span>
              </div>
            </div>
          )}

          {/* VIEW: TABLE PREVIEW OR FORMAL PRINT VOUCHER PREVIEW */}
          {!showPrintPreview ? (
            /* TABULAR PREVIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>{t('রিপোর্ট প্রিভিউ ও রেকর্ড সারসংক্ষেপ', 'Report Records Preview')}</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium">
                    {activeReportType === 'daily_sales' ? `${salesReportData.rows.length} ${t('টি রেকর্ড', 'records')}` :
                     activeReportType === 'inventory_summary' ? `${inventoryReportData.rows.length} ${t('টি মডেল', 'SKUs')}` :
                     `${duesReportData.rows.length} ${t('জন গ্রাহক', 'customers')}`}
                  </span>
                </h4>
              </div>

              <div className="overflow-x-auto max-h-72">
                {activeReportType === 'daily_sales' && (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">{t('ইনভয়েস #', 'Invoice #')}</th>
                        <th className="py-2.5 px-3">{t('তারিখ ও সময়', 'Date')}</th>
                        <th className="py-2.5 px-3">{t('গ্রাহক', 'Customer')}</th>
                        <th className="py-2.5 px-3 text-right">{t('মোট বিল', 'Total')}</th>
                        <th className="py-2.5 px-3 text-right">{t('পরিশোধ', 'Paid')}</th>
                        <th className="py-2.5 px-3 text-right">{t('বকেয়া', 'Due')}</th>
                        <th className="py-2.5 px-3 text-right">{t('লাভ', 'Profit')}</th>
                        <th className="py-2.5 px-3">{t('মাধ্যম', 'Method')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesReportData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                            {t('এই ফিল্টারে কোন বিক্রয় রেকর্ড পাওয়া যায়নি', 'No sales transactions found for this date')}
                          </td>
                        </tr>
                      ) : (
                        salesReportData.rows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.invoiceNo}</td>
                            <td className="py-2 px-3 text-slate-500">{row.dateTime}</td>
                            <td className="py-2 px-3 text-slate-800">
                              <span className="font-medium block">{row.customerName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{row.customerPhone}</span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">{formatCurrency(row.netTotal)}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-600">{formatCurrency(row.paidAmount)}</td>
                            <td className="py-2 px-3 text-right font-mono text-rose-600">{row.dueAmount > 0 ? formatCurrency(row.dueAmount) : '-'}</td>
                            <td className="py-2 px-3 text-right font-mono text-indigo-700 font-medium">{formatCurrency(row.profit)}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                {row.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeReportType === 'inventory_summary' && (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">{t('বারকোড', 'Barcode')}</th>
                        <th className="py-2.5 px-3">{t('পণ্য ও মডেল', 'Product Name')}</th>
                        <th className="py-2.5 px-3">{t('ক্যাটাগরি', 'Category')}</th>
                        <th className="py-2.5 px-3 text-right">{t('স্টক', 'Stock')}</th>
                        <th className="py-2.5 px-3 text-right">{t('ক্রয়মূল্য', 'Unit Cost')}</th>
                        <th className="py-2.5 px-3 text-right">{t('বিক্রয়মূল্য', 'Retail Price')}</th>
                        <th className="py-2.5 px-3 text-right">{t('মোট ক্রয় মূল্যায়ন', 'Cost Valuation')}</th>
                        <th className="py-2.5 px-3">{t('অবস্থা', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryReportData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                            {t('কোন ইনভেন্টরি রেকর্ড পাওয়া যায়নি', 'No inventory items match filter')}
                          </td>
                        </tr>
                      ) : (
                        inventoryReportData.rows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{row.barcode}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              <span>{row.productName}</span>
                              <span className="text-[10px] text-slate-400 block">{row.brand}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{row.category}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.stock}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">{formatCurrency(row.costPrice)}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(row.sellingPrice)}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">{formatCurrency(row.totalCostValuation)}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                row.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeReportType === 'customer_dues' && (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">{t('গ্রাহকের নাম', 'Customer Name')}</th>
                        <th className="py-2.5 px-3">{t('মোবাইল', 'Phone')}</th>
                        <th className="py-2.5 px-3 text-center">{t('চালান', 'Invoices')}</th>
                        <th className="py-2.5 px-3 text-right">{t('মোট কেনাকাটা', 'Total Billed')}</th>
                        <th className="py-2.5 px-3 text-right">{t('পরিশোধ', 'Paid')}</th>
                        <th className="py-2.5 px-3 text-right">{t('মোট বকেয়া', 'Balance Due')}</th>
                        <th className="py-2.5 px-3 text-right">{t('মেয়াদোত্তীর্ণ কিস্তি', 'Overdue EMI')}</th>
                        <th className="py-2.5 px-3">{t('ঝুঁকি ক্যাটাগরি', 'Risk Level')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {duesReportData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                            {t('কোন বকেয়া গ্রাহক রেকর্ড পাওয়া যায়নি', 'No customer due records found')}
                          </td>
                        </tr>
                      ) : (
                        duesReportData.rows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-3 font-medium text-slate-800">
                              <span>{row.customerName}</span>
                              <span className="text-[10px] text-slate-400 block">{row.customerAddress}</span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">{row.customerPhone}</td>
                            <td className="py-2 px-3 text-center font-mono">{row.totalInvoices}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-800">{formatCurrency(row.totalBilled)}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-600">{formatCurrency(row.totalPaid)}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">{formatCurrency(row.totalDue)}</td>
                            <td className="py-2 px-3 text-right font-mono text-amber-600">{row.overdueAmount > 0 ? formatCurrency(row.overdueAmount) : '-'}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'High Risk Due' ? 'bg-rose-100 text-rose-800' :
                                row.status === 'Overdue EMI' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* PRINTABLE FORMAL VOUCHER PREVIEW (Bilingual & Print Optimized) */
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-md font-sans print:shadow-none print:border-none print:p-0">
              {/* Company Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">
                    {settings.storeName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {settings.address}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    Phone: {settings.phone}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    অ্যাকাউন্টিং স্টেটমেন্ট / Audit Document
                  </span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {activeReportType === 'daily_sales' ? 'দৈনিক বিক্রয় ও রাজস্ব স্টেটমেন্ট' :
                     activeReportType === 'inventory_summary' ? 'ইনভেন্টরি স্টক ও সম্পদ মূল্যায়ন স্টেটমেন্ট' :
                     'গ্রাহক বকেয়া ও কিস্তি রিসিভেবল স্টেটমেন্ট'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    Date: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Financial Key Statement Block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {activeReportType === 'daily_sales' && (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">রিপোর্ট পিরিয়ড:</span>
                        <span className="font-bold text-slate-800 font-mono">{salesReportData.periodText}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মোট বিক্রয় (Net Sales):</span>
                        <span className="font-bold text-indigo-700 font-mono">{formatCurrency(salesReportData.summary.netSales)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">পণ্য ক্রয়মূল্য (COGS):</span>
                        <span className="font-bold text-slate-700 font-mono">{formatCurrency(salesReportData.summary.cogs)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মোট প্রাক্কলিত লাভ:</span>
                        <span className="font-bold text-emerald-700 font-mono">{formatCurrency(salesReportData.summary.grossProfit)}</span>
                      </div>
                    </>
                  )}

                  {activeReportType === 'inventory_summary' && (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মোট পণ্য মডেল (SKU):</span>
                        <span className="font-bold text-slate-800 font-mono">{inventoryReportData.summary.totalSKUs} টি</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">ফিজিক্যাল স্টক ইউনিট:</span>
                        <span className="font-bold text-slate-800 font-mono">{inventoryReportData.summary.totalStockUnits} টি</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">ক্রয়মূল্যে সম্পদ মূল্যায়ন:</span>
                        <span className="font-bold text-indigo-700 font-mono">{formatCurrency(inventoryReportData.summary.totalValuationCost)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">বিক্রয়মূল্যে সম্ভাব্য মূল্য:</span>
                        <span className="font-bold text-emerald-700 font-mono">{formatCurrency(inventoryReportData.summary.totalValuationRetail)}</span>
                      </div>
                    </>
                  )}

                  {activeReportType === 'customer_dues' && (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মোট দেনাদার গ্রাহক:</span>
                        <span className="font-bold text-slate-800 font-mono">{duesReportData.summary.totalCustomersWithDue} জন</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মোট আদায়যোগ্য বাকি (AR):</span>
                        <span className="font-bold text-rose-600 font-mono">{formatCurrency(duesReportData.summary.totalAccountsReceivable)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">মেয়াদোত্তীর্ণ কিস্তি বকেয়া:</span>
                        <span className="font-bold text-amber-600 font-mono">{formatCurrency(duesReportData.summary.totalOverdueInstallmentsAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">গড় বকেয়া প্রতি গ্রাহক:</span>
                        <span className="font-bold text-slate-800 font-mono">{formatCurrency(duesReportData.summary.averageDuePerCustomer)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Printable Table */}
              <div className="overflow-x-auto mb-8">
                {activeReportType === 'daily_sales' && (
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-2 border-r border-slate-300">ইনভয়েস #</th>
                        <th className="p-2 border-r border-slate-300">তারিখ</th>
                        <th className="p-2 border-r border-slate-300">গ্রাহক ও মোবাইল</th>
                        <th className="p-2 border-r border-slate-300">পণ্যের বিবরণ</th>
                        <th className="p-2 border-r border-slate-300 text-right">মোট বিল</th>
                        <th className="p-2 border-r border-slate-300 text-right">পরিশোধ</th>
                        <th className="p-2 border-r border-slate-300 text-right">বাকি</th>
                        <th className="p-2 text-right">লাভ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReportData.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 font-mono font-bold border-r border-slate-200">{row.invoiceNo}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-600">{row.dateTime}</td>
                          <td className="p-2 border-r border-slate-200">{row.customerName} ({row.customerPhone})</td>
                          <td className="p-2 border-r border-slate-200">{row.itemsSummary}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-semibold">{formatCurrency(row.netTotal)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{formatCurrency(row.paidAmount)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono text-rose-600">{row.dueAmount > 0 ? formatCurrency(row.dueAmount) : '-'}</td>
                          <td className="p-2 text-right font-mono text-emerald-700">{formatCurrency(row.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeReportType === 'inventory_summary' && (
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-2 border-r border-slate-300">বারকোড</th>
                        <th className="p-2 border-r border-slate-300">মডেল ও পণ্যের নাম</th>
                        <th className="p-2 border-r border-slate-300">ক্যাটাগরি</th>
                        <th className="p-2 border-r border-slate-300 text-right">স্টক</th>
                        <th className="p-2 border-r border-slate-300 text-right">একক ক্রয়মূল্য</th>
                        <th className="p-2 border-r border-slate-300 text-right">বিক্রয়মূল্য</th>
                        <th className="p-2 border-r border-slate-300 text-right">মোট ক্রয় সম্পদ মূল্য</th>
                        <th className="p-2 text-right">মার্জিন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryReportData.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 font-mono border-r border-slate-200">{row.barcode}</td>
                          <td className="p-2 border-r border-slate-200 font-medium">{row.productName} ({row.brand})</td>
                          <td className="p-2 border-r border-slate-200">{row.category}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-bold font-mono">{row.stock}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{formatCurrency(row.costPrice)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{formatCurrency(row.sellingPrice)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">{formatCurrency(row.totalCostValuation)}</td>
                          <td className="p-2 text-right font-mono">{row.marginPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeReportType === 'customer_dues' && (
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-2 border-r border-slate-300">গ্রাহকের নাম ও ঠিকানা</th>
                        <th className="p-2 border-r border-slate-300">মোবাইল</th>
                        <th className="p-2 border-r border-slate-300 text-center">চালান সংখ্যা</th>
                        <th className="p-2 border-r border-slate-300 text-right">মোট ক্রয়</th>
                        <th className="p-2 border-r border-slate-300 text-right">মোট আদায়</th>
                        <th className="p-2 border-r border-slate-300 text-right">বর্তমান মোট বাকি</th>
                        <th className="p-2 text-right">মেয়াদোত্তীর্ণ কিস্তি</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duesReportData.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-medium">{row.customerName} <span className="text-[10px] text-slate-500 block">{row.customerAddress}</span></td>
                          <td className="p-2 border-r border-slate-200 font-mono">{row.customerPhone}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{row.totalInvoices}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{formatCurrency(row.totalBilled)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{formatCurrency(row.totalPaid)}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-rose-600">{formatCurrency(row.totalDue)}</td>
                          <td className="p-2 text-right font-mono text-amber-600">{row.overdueAmount > 0 ? formatCurrency(row.overdueAmount) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Accountant & Auditor Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-700">
                    হিসাব প্রস্তুতকারী
                  </div>
                  <span className="text-[10px] text-slate-400">Prepared By</span>
                </div>

                <div>
                  <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-700">
                    অভ্যন্তরীণ নিরীক্ষক
                  </div>
                  <span className="text-[10px] text-slate-400">Internal Auditor</span>
                </div>

                <div>
                  <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-700">
                    ম্যানেজার / প্রোপ্রাইটর
                  </div>
                  <span className="text-[10px] text-slate-400">Authorized Signatory</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Bar Footer */}
        <div className="bg-white px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('এক্সটার্নাল অ্যাকাউন্টিং ও অডিট ফরম্যাটে সংরক্ষিত', 'Certified formatted for external bookkeeping & tax filing')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Direct Print Button */}
            <button
              onClick={handleTriggerPrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t('প্রিন্ট করুন', 'Print View')}</span>
            </button>

            {/* CSV Download Button */}
            <button
              onClick={handleCsvExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>CSV</span>
            </button>

            {/* Excel Download Button */}
            <button
              onClick={handleExcelExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('Excel (.xlsx)', 'Excel (.xlsx)')}</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              onClick={handlePdfExport}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
            >
              <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? t('PDF তৈরি হচ্ছে...', 'Generating...') : t('PDF ডাউনলোড', 'Download PDF')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
