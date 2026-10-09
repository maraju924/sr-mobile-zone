import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ShoppingBag, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent,
  Download,
  Clock,
  Layers,
  Award,
  Receipt,
  Wallet,
  FileSpreadsheet,
  FileText,
  Package,
  Users,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { ReportExportModal } from './ReportExportModal';
import { 
  ReportType,
  buildDailySalesReport,
  buildInventorySummaryReport,
  buildCustomerDuesReport,
  exportDailySalesToExcel,
  exportInventorySummaryToExcel,
  exportCustomerDuesToExcel,
  exportDailySalesToPdf,
  exportInventorySummaryToPdf,
  exportCustomerDuesToPdf
} from '../../services/reportExportService';

export const DashboardReports: React.FC = () => {
  const { sales, products, installments, expenses, settings, formatCurrency, t } = useApp();

  const [timeframe, setTimeframe] = useState<'today' | 'month' | 'all'>('month');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportModalType, setExportModalType] = useState<ReportType>('daily_sales');

  const openExportModalWithType = (type: ReportType) => {
    setExportModalType(type);
    setShowExportModal(true);
  };

  // Quick Instant Downloads
  const handleQuickDownload = async (type: ReportType, format: 'pdf' | 'excel') => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (type === 'daily_sales') {
      const data = buildDailySalesReport(sales, { date: todayStr, paymentMethod: 'all' }, settings);
      if (format === 'excel') exportDailySalesToExcel(data, settings);
      else await exportDailySalesToPdf(data, settings);
    } else if (type === 'inventory_summary') {
      const data = buildInventorySummaryReport(products, { category: 'all', brand: 'all', stockStatus: 'all' });
      if (format === 'excel') exportInventorySummaryToExcel(data, settings);
      else await exportInventorySummaryToPdf(data, settings);
    } else if (type === 'customer_dues') {
      const data = buildCustomerDuesReport(sales, installments, { status: 'all' });
      if (format === 'excel') exportCustomerDuesToExcel(data, settings);
      else await exportCustomerDuesToPdf(data, settings);
    }
  };

  // Today's metrics
  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.createdAt.startsWith(todayStr));
    const todayExpenses = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

    const revenue = todaySales.reduce((s, x) => s + x.total, 0);
    const paid = todaySales.reduce((s, x) => s + x.paidAmount, 0);
    const due = todaySales.reduce((s, x) => s + x.dueAmount, 0);
    const cost = todaySales.reduce((s, x) => s + x.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0), 0);
    const grossProfit = Math.max(0, revenue - cost);
    const netProfit = Math.max(0, grossProfit - todayExpenses);

    return {
      count: todaySales.length,
      revenue,
      paid,
      due,
      cost,
      expenses: todayExpenses,
      grossProfit,
      netProfit,
      margin: revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0
    };
  }, [sales, expenses]);

  // Current Month's metrics
  const monthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const monthSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthExpenses = expenses
      .filter(e => e.date.startsWith(monthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);

    const revenue = monthSales.reduce((s, x) => s + x.total, 0);
    const paid = monthSales.reduce((s, x) => s + x.paidAmount, 0);
    const due = monthSales.reduce((s, x) => s + x.dueAmount, 0);
    const cost = monthSales.reduce((s, x) => s + x.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0), 0);
    const discounts = monthSales.reduce((s, x) => s + x.discount, 0);
    const grossProfit = Math.max(0, revenue - cost);
    const netProfit = Math.max(0, grossProfit - monthExpenses);

    return {
      count: monthSales.length,
      revenue,
      paid,
      due,
      cost,
      expenses: monthExpenses,
      discounts,
      grossProfit,
      netProfit,
      margin: revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0
    };
  }, [sales, expenses]);

  // All-time metrics
  const allTimeStats = useMemo(() => {
    const revenue = sales.reduce((s, x) => s + x.total, 0);
    const cost = sales.reduce((s, x) => s + x.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0), 0);
    const netProfit = Math.max(0, revenue - cost);
    return {
      revenue,
      netProfit,
      count: sales.length
    };
  }, [sales]);

  // Daily revenue bars (last 7 days)
  const last7DaysChart = useMemo(() => {
    const days: { dateStr: string; label: string; revenue: number; profit: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(t('bn-BD', 'en-US'), { weekday: 'short', day: 'numeric' });

      const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      const cost = daySales.reduce((sum, s) => sum + s.items.reduce((acc, it) => acc + (it.purchasePrice * it.quantity), 0), 0);
      const profit = Math.max(0, revenue - cost);

      days.push({ dateStr, label, revenue, profit });
    }

    const maxRev = Math.max(1, ...days.map(d => d.revenue));
    return { days, maxRev };
  }, [sales, t]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; brand: string; quantity: number; revenue: number }>();
    sales.forEach(s => {
      s.items.forEach(it => {
        const cur = map.get(it.productId) || { name: it.productName, brand: it.brand, quantity: 0, revenue: 0 };
        cur.quantity += it.quantity;
        cur.revenue += it.total;
        map.set(it.productId, cur);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Sales by Category
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    let totalRev = 0;

    sales.forEach(s => {
      s.items.forEach(it => {
        const cur = map.get(it.category) || 0;
        map.set(it.category, cur + it.total);
        totalRev += it.total;
      });
    });

    return Array.from(map.entries())
      .map(([cat, rev]) => ({
        category: cat,
        revenue: rev,
        percentage: totalRev > 0 ? Math.round((rev / totalRev) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            {t('দৈনিক বিক্রয় রিপোর্ট ও মাসভিত্তিক লাভ-ক্ষতি ড্যাশবোর্ড', 'Daily Sales Report & Monthly Profit Dashboard')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('আয়, ব্যয়, মোট লাভ ও পণ্যের ক্যাটাগরিভিত্তিক বিশদ পরিসংখ্যান', 'Revenue, COGS, Net Profit, and inventory analytics')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Export Action Button */}
          <button
            onClick={() => openExportModalWithType('daily_sales')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs shadow-sm hover:shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('রিপোর্ট ডাউনলোড ও এক্সপোর্ট', 'Export Reports (PDF/Excel)')}</span>
          </button>

          {/* Timeframe Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'today' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t('আজকের রিপোর্ট', 'Today')}
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t('চলতি মাস', 'This Month')}
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t('সর্বমোট', 'All Time')}
            </button>
          </div>
        </div>
      </div>

      {/* EXTERNAL ACCOUNTING & AUDIT REPORT EXPORT HUB */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('এক্সটার্নাল অ্যাকাউন্টিং ও অডিট ইন্টিগ্রেশন', 'External Accounting & Audit Engine')}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t('অ্যাকাউন্টিং রিপোর্ট ডাউনলোড সেন্টার (PDF & Excel/CSV)', 'Accounting Report Export Center')}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {t('অ্যাকাউন্ট্যান্ট, সিএ ফার্ম বা ট্যাক্স ফাইলিংয়ের জন্য প্রয়োজনীয় দৈনিক বিক্রয় বিবরণী, স্টক মূল্যায়ন সম্পদ এবং গ্রাহক দেনাদার খতিয়ান এক ক্লিকে ডাউনলোড বা প্রিন্ট করুন।', 'Download verified daily sales ledgers, stock asset valuations, and customer dues reports formatted for external accountants, tax auditors, or Microsoft Excel analysis.')}
            </p>
          </div>

          <button
            onClick={() => openExportModalWithType('daily_sales')}
            className="self-start md:self-auto shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('সকল রিপোর্ট কনফিগার করুন', 'Open Export Center')}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 3 Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Card 1: Daily Sales */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-2xl flex flex-col justify-between transition hover:bg-white/[0.07]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {t('দৈনিক রাজস্ব', 'Daily Revenue')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">
                {t('১. দৈনিক বিক্রয় রিপোর্ট', '1. Daily Sales & Revenue')}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1">
                {t('ইনভয়েস নম্বর, পণ্যের তালিকা, গ্রস আয়, ছাড়, নিট রাজস্ব, পণ্য ক্রয়মূল্য (COGS), মোট লাভ ও নগদ/বাকি আদায়।', 'Invoices, gross revenue, discounts, COGS, realized cash, and receivable dues breakdown.')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => handleQuickDownload('daily_sales', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-white text-[11px] font-semibold transition"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleQuickDownload('daily_sales', 'excel')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-white text-[11px] font-semibold transition"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => openExportModalWithType('daily_sales')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition text-[11px]"
                title={t('ফিল্টার ও তারিখ পরিবর্তন করুন', 'Customize')}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Inventory Summary */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-2xl flex flex-col justify-between transition hover:bg-white/[0.07]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Package className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {t('স্টক অ্যাসেট', 'Asset Valuation')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">
                {t('২. ইনভেন্টরি ও স্টক মূল্যায়ন', '2. Inventory Stock Valuation')}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1">
                {t('বারকোড, বর্তমান মজুদ, ক্রয়মূল্যে মোট ব্যবসায়িক সম্পদ (Asset Value), বিক্রয়মূল্য, প্রত্যাশিত লাভ ও রিঅর্ডার তালিকা।', 'Barcode, active stock, inventory valuation at cost price, retail valuation, and reorders.')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => handleQuickDownload('inventory_summary', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-white text-[11px] font-semibold transition"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleQuickDownload('inventory_summary', 'excel')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-white text-[11px] font-semibold transition"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => openExportModalWithType('inventory_summary')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition text-[11px]"
                title={t('ফিল্টার ও তারিখ পরিবর্তন করুন', 'Customize')}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Customer Dues */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-2xl flex flex-col justify-between transition hover:bg-white/[0.07]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Users className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  {t('পাওনা / রিসিভেবল', 'Receivables')}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">
                {t('৩. গ্রাহক বকেয়া ও বাকি খতিয়ান', '3. Customer Dues Ledger')}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1">
                {t('দেনাদার গ্রাহকের নাম, ফোন, ঠিকানা, মোট ক্রয়, পরিশোধ, বর্তমান পাওনা ও মেয়াদোত্তীর্ণ কিস্তি (Overdue EMI)।', 'Customer accounts receivable, credit history, balance due, overdue installments & risk status.')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => handleQuickDownload('customer_dues', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-white text-[11px] font-semibold transition"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleQuickDownload('customer_dues', 'excel')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-white text-[11px] font-semibold transition"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => openExportModalWithType('customer_dues')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition text-[11px]"
                title={t('ফিল্টার ও তারিখ পরিবর্তন করুন', 'Customize')}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === 'today' ? t('আজকের বিক্রয় আয়', "Today's Revenue") :
               timeframe === 'month' ? t('চলতি মাসের বিক্রয়', "This Month's Revenue") : t('সর্বমোট বিক্রয়', 'Total Revenue')}
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(timeframe === 'today' ? todayStats.revenue : timeframe === 'month' ? monthStats.revenue : allTimeStats.revenue)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-slate-400" />
              <span>{timeframe === 'today' ? todayStats.count : timeframe === 'month' ? monthStats.count : allTimeStats.count} {t('টি বিক্রয় চালান', 'sales')}</span>
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === 'today' ? t('আজকের নিট লাভ', "Today's Profit") :
               timeframe === 'month' ? t('চলতি মাসের নিট লাভ', "Month's Net Profit") : t('সর্বমোট নিট লাভ', 'Total Net Profit')}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold font-mono text-emerald-600">
              {formatCurrency(timeframe === 'today' ? todayStats.netProfit : timeframe === 'month' ? monthStats.netProfit : allTimeStats.netProfit)}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{timeframe === 'today' ? todayStats.margin : monthStats.margin}% {t('লাভ মার্জিন', 'profit margin')}</span>
            </p>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">{t('নগদ আদায়কৃত (Paid)', 'Cash Collected')}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold font-mono text-slate-800">
              {formatCurrency(timeframe === 'today' ? todayStats.paid : monthStats.paid)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('নগদ ও ডিজিটাল আদায়', 'Cash & MFS realized')}
            </p>
          </div>
        </div>

        {/* Dues / Receivables */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">{t('বকেয়া / বাকি (Due)', 'Receivable Dues')}</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold font-mono text-rose-600">
              {formatCurrency(timeframe === 'today' ? todayStats.due : monthStats.due)}
            </h3>
            <p className="text-[11px] text-rose-700 font-medium mt-1">
              {t('পরবর্তীতে আদায়যোগ্য', 'Pending collections')}
            </p>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === 'today' ? t('আজকের দোকান খরচ', "Today's Expenses") : t('মাসের দোকান খরচ', "Month's Expenses")}
            </span>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold font-mono text-orange-700">
              {formatCurrency(timeframe === 'today' ? todayStats.expenses : monthStats.expenses)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {t('ভাড়া, বিদ্যুৎ, বেতন ও অন্যান্য', 'Rent, bills, staff & misc')}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Profit/Loss Financial Breakdown Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>{t('মাসভিত্তিক লাভের পরিষ্কার সারসংক্ষেপ (Profit & Loss Statement)', 'Monthly Profit & Loss Statement')}</span>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {new Date().toLocaleString(t('bn-BD', 'en-US'), { month: 'long', year: 'numeric' })}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">{t('১. মোট বিক্রয় আয় (Total Gross Revenue):', 'Gross Revenue:')}</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(monthStats.revenue)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">{t('২. বিক্রিত পণ্যের মোট ক্রয়মূল্য (COGS):', 'Cost of Goods Sold (COGS):')}</span>
              <span className="font-mono font-bold text-slate-700">-{formatCurrency(monthStats.cost)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">{t('৩. বিশেষ ছাড়সমূহ (Discounts Given):', 'Total Discounts:')}</span>
              <span className="font-mono text-amber-700">-{formatCurrency(monthStats.discounts)}</span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-200 text-sm sm:text-base font-bold text-slate-900 bg-slate-50 px-3 rounded-xl">
              <span className="text-emerald-800">{t('সর্বমোট অর্জিত নিট লাভ (Net Profit):', 'Net Profit:')}</span>
              <span className="font-mono text-emerald-700">{formatCurrency(monthStats.netProfit)}</span>
            </div>
          </div>

          {/* Graphical summary comparison */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">{t('নিট লাভ মার্জিন (Profit Margin):', 'Profit Margin:')}</span>
                <span className="font-mono text-emerald-700 font-bold">{monthStats.margin}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, monthStats.margin)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">{t('গড় বিক্রয় প্রতি চালান:', 'Avg Ticket Value:')}</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(monthStats.count > 0 ? Math.round(monthStats.revenue / monthStats.count) : 0)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">{t('মোট ইনভয়েস সংখ্যা:', 'Completed Invoices:')}</span>
                <span className="font-mono font-bold text-indigo-700">{monthStats.count} {t('টি', '')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart: 7 Days Revenue Trend & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7 Days Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>{t('বিগত ৭ দিনের দৈনিক বিক্রয় ও লাভ গ্রাফ', 'Last 7 Days Sales Trend')}</span>
            <span className="text-xs text-slate-400 font-medium">{t('দৈনিক বিক্রয়', 'Daily Revenue')}</span>
          </h3>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200">
            {last7DaysChart.days.map((day, idx) => {
              const heightPercent = last7DaysChart.maxRev > 0 ? Math.max(8, Math.round((day.revenue / last7DaysChart.maxRev) * 100)) : 8;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-slate-700 bg-white shadow-md border border-slate-200 px-1 py-0.5 rounded -mb-1 z-10 whitespace-nowrap">
                    {formatCurrency(day.revenue)}
                  </span>
                  <div 
                    className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
              {t('দৈনিক বিক্রয়', 'Sales Volume')}
            </span>
          </div>
        </div>

        {/* Sales by Electronics Category */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              {t('ক্যাটাগরিভিত্তিক বিক্রয় শেয়ার', 'Sales by Category')}
            </h3>

            <div className="space-y-3 mt-4">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">{t('কোন বিক্রয় তথ্য নেই', 'No sales data yet')}</p>
              ) : (
                categoryStats.slice(0, 5).map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 truncate">{cat.category}</span>
                      <span className="font-mono text-slate-500">{cat.percentage}% ({formatCurrency(cat.revenue)})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-indigo-600' :
                          i === 1 ? 'bg-emerald-500' :
                          i === 2 ? 'bg-amber-500' : 'bg-blue-400'
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          {t('সর্বোচ্চ বিক্রিত ইলেকট্রনিক্স পণ্যসমূহ (Top Selling Items)', 'Top Selling Electronics')}
        </h3>

        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">{t('এখনও কোন পণ্য বিক্রি হয়নি', 'No products sold yet')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">#{idx + 1} Best Seller</span>
                <h5 className="font-semibold text-xs text-slate-800 truncate">{p.name}</h5>
                <span className="text-[11px] text-slate-500 font-medium">{p.brand}</span>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-600">{p.quantity} {t('টি বিক্রি', 'sold')}</span>
                  <span className="font-mono font-bold text-indigo-700">{formatCurrency(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialType={exportModalType}
      />

    </div>
  );
};
