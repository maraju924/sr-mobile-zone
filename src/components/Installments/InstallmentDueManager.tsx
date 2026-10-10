import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  User, 
  Phone, 
  Check, 
  DollarSign,
  Receipt,
  ChevronRight,
  TrendingDown,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  PhoneCall,
  FileText,
  AlertTriangle,
  History,
  Camera,
  Sparkles,
  Undo2,
  Lock,
  Unlock,
  Layers,
  Tag,
  Filter,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Installment, InstallmentScheduleItem, Sale, FollowUpLog } from '../../types';
import { CustomerLedgerModal } from './CustomerLedgerModal';
import { ReportExportModal } from '../Reports/ReportExportModal';
import { InstallmentPassbookModal } from './InstallmentPassbookModal';
import { FollowUpModal } from './FollowUpModal';
import { SmsReminderModal } from './SmsReminderModal';
import { PartialPaymentModal } from './PartialPaymentModal';
import { CustomerCreditProfileModal } from './CustomerCreditProfileModal';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

export const InstallmentDueManager: React.FC = () => {
  const { 
    installments, 
    sales, 
    customerProfiles,
    devices,
    recordInstallmentPayment, 
    recordInstallmentPartialPayment,
    recordInstallmentSmartPayment,
    reverseInstallmentPayment,
    collectDuePayment, 
    collectDuePaymentAdvanced,
    addInstallmentFollowUp,
    addSaleFollowUp,
    formatCurrency, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'installments' | 'dues' | 'ledger' | 'aging'>('installments');
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'today' | 'week' | 'overdue' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedAgingBracket, setSelectedAgingBracket] = useState<'all' | 'current' | 'medium' | 'warning' | 'overdue'>('all');
  
  // Selected Customer for Ledger statement modal
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<{ name: string; phone: string } | null>(null);

  // Selected Installment for schedule view / payment collection
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // Advanced Modals States
  const [passbookInstallment, setPassbookInstallment] = useState<Installment | null>(null);
  
  const [followUpModalData, setFollowUpModalData] = useState<{
    title: string;
    customerName: string;
    customerPhone: string;
    currentDue: number;
    existingLogs: FollowUpLog[];
    onAddLog: (log: Omit<FollowUpLog, 'id' | 'date'>) => void;
  } | null>(null);

  const [smsModalData, setSmsModalData] = useState<{
    customerName: string;
    customerPhone: string;
    amountDue: number;
    dueDate?: string;
    invoiceNo?: string;
    type: 'installment' | 'due';
  } | null>(null);

  // Smart collection modal state
  const [smartPaymentModalData, setSmartPaymentModalData] = useState<{
    installment: Installment;
    scheduleItem?: InstallmentScheduleItem;
    initialMode?: 'single' | 'custom' | 'foreclose';
  } | null>(null);

  // Payment Reversal / Void modal state
  const [reversalTarget, setReversalTarget] = useState<{
    installment: Installment;
    item: InstallmentScheduleItem;
  } | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  const [creditProfileModalData, setCreditProfileModalData] = useState<{
    customerName: string;
    customerPhone: string;
    currentTotalDue: number;
  } | null>(null);

  // Due collection modal state
  const [collectingSale, setCollectingSale] = useState<Sale | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectPaymentMethod, setCollectPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [collectTrxId, setCollectTrxId] = useState<string>('');
  const [collectNote, setCollectNote] = useState<string>('');
  const [collectAutoUnlock, setCollectAutoUnlock] = useState<boolean>(true);

  // Calculations for KPI Cards
  const totalInstallmentOutstanding = useMemo(() => {
    return installments
      .filter(i => i.status !== 'completed')
      .reduce((sum, i) => sum + i.remainingBalance, 0);
  }, [installments]);

  const totalDuesOutstanding = useMemo(() => {
    return sales
      .filter(s => s.dueAmount > 0)
      .reduce((sum, s) => sum + s.dueAmount, 0);
  }, [sales]);

  const totalActiveInstallmentPlans = useMemo(() => {
    return installments.filter(i => i.status === 'active').length;
  }, [installments]);

  // Installments Quick Filter Counters
  const installmentFilterCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const in7DaysDate = new Date();
    in7DaysDate.setDate(in7DaysDate.getDate() + 7);
    const in7Days = in7DaysDate.toISOString().split('T')[0];

    let todayCount = 0;
    let weekCount = 0;
    let overdueCount = 0;
    let activeCount = 0;
    let completedCount = 0;

    installments.forEach(inst => {
      const isCompleted = inst.status === 'completed' || inst.status === 'foreclosed' || inst.remainingBalance <= 0;
      if (isCompleted) {
        completedCount++;
      } else {
        activeCount++;
      }

      const hasOverdue = inst.schedule.some(s => !s.isPaid && s.dueDate < today);
      if (hasOverdue) overdueCount++;

      const hasDueToday = inst.schedule.some(s => !s.isPaid && s.dueDate === today);
      if (hasDueToday) todayCount++;

      const hasDueThisWeek = inst.schedule.some(s => !s.isPaid && s.dueDate >= today && s.dueDate <= in7Days);
      if (hasDueThisWeek) weekCount++;
    });

    return {
      all: installments.length,
      today: todayCount,
      week: weekCount,
      overdue: overdueCount,
      active: activeCount,
      completed: completedCount
    };
  }, [installments]);

  // Filtered installments (by Search Query and Quick Sub-filter)
  const filteredInstallments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const in7DaysDate = new Date();
    in7DaysDate.setDate(in7DaysDate.getDate() + 7);
    const in7Days = in7DaysDate.toISOString().split('T')[0];

    return installments.filter(inst => {
      // 1. Text Search Match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        inst.customerName.toLowerCase().includes(q) ||
        inst.customerPhone.toLowerCase().includes(q) ||
        inst.invoiceNumber.toLowerCase().includes(q) ||
        inst.productNameSummary.toLowerCase().includes(q) ||
        (inst.guarantorName && inst.guarantorName.toLowerCase().includes(q))
      );
      if (!matchesSearch) return false;

      // 2. Tab Filter Match
      const isCompleted = inst.status === 'completed' || inst.status === 'foreclosed' || inst.remainingBalance <= 0;
      if (installmentFilter === 'active') return !isCompleted;
      if (installmentFilter === 'completed') return isCompleted;
      if (installmentFilter === 'overdue') return inst.schedule.some(s => !s.isPaid && s.dueDate < today);
      if (installmentFilter === 'today') return inst.schedule.some(s => !s.isPaid && s.dueDate === today);
      if (installmentFilter === 'week') return inst.schedule.some(s => !s.isPaid && s.dueDate >= today && s.dueDate <= in7Days);
      return true;
    });
  }, [installments, searchQuery, installmentFilter]);

  // Live synchronizing selected installment
  const currentSelectedInstallment = useMemo(() => {
    if (!selectedInstallment) return null;
    return installments.find(i => i.id === selectedInstallment.id) || selectedInstallment;
  }, [installments, selectedInstallment]);

  // Filtered dues sales
  const dueSales = useMemo(() => {
    return sales
      .filter(s => s.dueAmount > 0)
      .filter(s => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          s.customerName.toLowerCase().includes(q) ||
          s.customerPhone.toLowerCase().includes(q) ||
          s.invoiceNumber.toLowerCase().includes(q)
        );
      });
  }, [sales, searchQuery]);

  // Aggregated Customer Directory for Ledger tab
  const customerLedgerList = useMemo(() => {
    const customerMap = new Map<string, {
      name: string;
      phone: string;
      address: string;
      totalSales: number;
      totalBilled: number;
      totalPaid: number;
      dueAmount: number;
      installmentDue: number;
      lastDate: string;
    }>();

    sales.forEach(sale => {
      const key = (sale.customerPhone || sale.customerName).trim().toLowerCase();
      if (!key) return;

      const existing = customerMap.get(key) || {
        name: sale.customerName,
        phone: sale.customerPhone || 'তথ্য নেই',
        address: sale.customerAddress || '',
        totalSales: 0,
        totalBilled: 0,
        totalPaid: 0,
        dueAmount: 0,
        installmentDue: 0,
        lastDate: sale.createdAt
      };

      existing.totalSales += 1;
      existing.totalBilled += sale.total;
      existing.totalPaid += sale.paidAmount;
      existing.dueAmount += sale.dueAmount;
      if (sale.createdAt > existing.lastDate) existing.lastDate = sale.createdAt;
      customerMap.set(key, existing);
    });

    installments.forEach(inst => {
      const key = (inst.customerPhone || inst.customerName).trim().toLowerCase();
      if (!key) return;
      const existing = customerMap.get(key);
      if (existing) {
        existing.installmentDue += inst.remainingBalance;
      } else {
        customerMap.set(key, {
          name: inst.customerName,
          phone: inst.customerPhone || 'তথ্য নেই',
          address: inst.customerAddress || '',
          totalSales: 1,
          totalBilled: inst.totalAmount,
          totalPaid: inst.downPayment,
          dueAmount: 0,
          installmentDue: inst.remainingBalance,
          lastDate: inst.createdAt
        });
      }
    });

    return Array.from(customerMap.values()).filter(c => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
    });
  }, [sales, installments, searchQuery]);

  // Aging Analysis Breakdown
  const agingAnalysis = useMemo(() => {
    const now = Date.now();
    const brackets = {
      current: { label: '০-৩০ দিন (চলতি)', count: 0, amount: 0, items: [] as any[] },
      medium: { label: '৩১-৬০ দিন (মাঝারি)', count: 0, amount: 0, items: [] as any[] },
      warning: { label: '৬১-৯০ দিন (সতর্কতা)', count: 0, amount: 0, items: [] as any[] },
      overdue: { label: '৯০+ দিন (খেলাপী/ঝুঁকি)', count: 0, amount: 0, items: [] as any[] }
    };

    // Sales dues
    sales.filter(s => s.dueAmount > 0).forEach(sale => {
      const saleDate = new Date(sale.createdAt).getTime();
      const ageInDays = Math.max(0, Math.floor((now - saleDate) / (1000 * 60 * 60 * 24)));
      const entry = {
        type: 'due' as const,
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress,
        date: sale.createdAt,
        total: sale.total,
        dueAmount: sale.dueAmount,
        ageInDays,
        dueDeadline: sale.dueDeadline,
        followUps: sale.followUps || [],
        sale
      };

      if (ageInDays <= 30) {
        brackets.current.count++;
        brackets.current.amount += sale.dueAmount;
        brackets.current.items.push(entry);
      } else if (ageInDays <= 60) {
        brackets.medium.count++;
        brackets.medium.amount += sale.dueAmount;
        brackets.medium.items.push(entry);
      } else if (ageInDays <= 90) {
        brackets.warning.count++;
        brackets.warning.amount += sale.dueAmount;
        brackets.warning.items.push(entry);
      } else {
        brackets.overdue.count++;
        brackets.overdue.amount += sale.dueAmount;
        brackets.overdue.items.push(entry);
      }
    });

    // Active Installments with balance
    installments.filter(i => i.status !== 'completed' && i.remainingBalance > 0).forEach(inst => {
      const instDate = new Date(inst.createdAt).getTime();
      const ageInDays = Math.max(0, Math.floor((now - instDate) / (1000 * 60 * 60 * 24)));
      const entry = {
        type: 'installment' as const,
        id: inst.id,
        invoiceNumber: inst.invoiceNumber,
        customerName: inst.customerName,
        customerPhone: inst.customerPhone,
        customerAddress: inst.customerAddress,
        date: inst.createdAt,
        total: inst.totalAmount,
        dueAmount: inst.remainingBalance,
        ageInDays,
        guarantorName: inst.guarantorName,
        guarantorPhone: inst.guarantorPhone,
        followUps: inst.followUps || [],
        installment: inst
      };

      if (ageInDays <= 30) {
        brackets.current.count++;
        brackets.current.amount += inst.remainingBalance;
        brackets.current.items.push(entry);
      } else if (ageInDays <= 60) {
        brackets.medium.count++;
        brackets.medium.amount += inst.remainingBalance;
        brackets.medium.items.push(entry);
      } else if (ageInDays <= 90) {
        brackets.warning.count++;
        brackets.warning.amount += inst.remainingBalance;
        brackets.warning.items.push(entry);
      } else {
        brackets.overdue.count++;
        brackets.overdue.amount += inst.remainingBalance;
        brackets.overdue.items.push(entry);
      }
    });

    return brackets;
  }, [sales, installments]);

  // Handle Pay Monthly Installment (Quick full payment via smart engine)
  const handlePayInstallment = (inst: Installment, sch: InstallmentScheduleItem) => {
    recordInstallmentSmartPayment(inst.id, sch.amount, {
      targetScheduleId: sch.id,
      paymentMethod: 'cash'
    });
  };

  // Handle Payment Reversal (Void error)
  const handleConfirmReversal = () => {
    if (!reversalTarget) return;
    reverseInstallmentPayment(
      reversalTarget.installment.id,
      reversalTarget.item.id,
      reversalReason.trim() || 'ক্যাশিয়ার কর্তৃক ভুল এন্ট্রি সংশোধন ও বাতিল'
    );
    setReversalTarget(null);
    setReversalReason('');
  };

  // Open Collect Due Modal for Sale
  const handleOpenCollectDue = (sale: Sale) => {
    setCollectingSale(sale);
    setCollectAmount(sale.dueAmount);
    setCollectPaymentMethod('cash');
    setCollectTrxId('');
    setCollectNote('');
    setCollectAutoUnlock(true);
  };

  // Submit Collect Due Payment (Advanced with methods & auto unlock)
  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingSale || collectAmount <= 0) return;
    collectDuePaymentAdvanced(collectingSale.id, collectAmount, {
      paymentMethod: collectPaymentMethod,
      trxId: collectTrxId.trim() || undefined,
      note: collectNote.trim() || undefined,
      autoUnlockLinkedDevice: collectAutoUnlock
    });
    setCollectingSale(null);
    setCollectAmount(0);
    setCollectTrxId('');
    setCollectNote('');
  };

  // Helper for customer risk badges
  const getCustomerRiskBadge = (phone: string) => {
    const profile = customerProfiles.find(p => p.phone === phone);
    const rating = profile?.riskRating || 'low';
    switch (rating) {
      case 'blacklisted':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">খেলাপী (Blocked)</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">উচ্চ ঝুঁকি (High Risk)</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">মাঝারি (Medium)</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">নিয়মিত (Low Risk)</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      
      {/* Top Header & Overview */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              {t('অ্যাডভান্স কিস্তি (EMI) ও বাকি ম্যানেজমেন্ট সিস্টেম', 'Advance EMI & Credit Ledger')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('মাসিক কিস্তির পাসবুক, জামিনদার ট্র্যাকিং, বকেয়া এজিং ও ১-ক্লিকে WhatsApp/SMS তাগাদা', 'Digital Passbook, Guarantor registry, Aging analysis & 1-Click reminders')}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-700 font-semibold">{t('মোট কিস্তি পাওনা (EMI Due)', 'Total EMI Balance')}</span>
              <p className="text-base sm:text-lg font-bold font-mono text-indigo-900 mt-0.5">
                {formatCurrency(totalInstallmentOutstanding)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {totalActiveInstallmentPlans}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-3 rounded-xl border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 font-semibold">{t('সাধারণ বাকি পাওনা (Counter Due)', 'Total Counter Dues')}</span>
              <p className="text-base sm:text-lg font-bold font-mono text-rose-900 mt-0.5">
                {formatCurrency(totalDuesOutstanding)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-700 font-semibold">{t('৯০+ দিন পুরনো খেলাপী বাকি', 'Overdue 90+ Days')}</span>
              <p className="text-base sm:text-lg font-bold font-mono text-amber-900 mt-0.5">
                {formatCurrency(agingAnalysis.overdue.amount)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center font-bold text-xs">
              {agingAnalysis.overdue.count}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 font-semibold">{t('সর্বমোট বকেয়া পাওনা', 'Combined Receivables')}</span>
              <p className="text-base sm:text-lg font-bold font-mono text-emerald-900 mt-0.5">
                {formatCurrency(totalInstallmentOutstanding + totalDuesOutstanding)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold flex-wrap">
            <button
              onClick={() => setActiveTab('installments')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'installments' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('কিস্তি খাতা (EMI Plans)', 'Installment Plans')} ({installments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'dues' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('বাকি খাতা (Customer Dues)', 'Customer Dues')} ({dueSales.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'ledger' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('কাস্টমার খতিয়ান ও ক্রেডিট লিমিট', 'Customer Ledger & Credit')} ({customerLedgerList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('aging')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'aging' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('বকেয়া এজিং ও ঝুঁকি অ্যানালাইসিস', 'Aging & Risk Analysis')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('বকেয়া রিপোর্ট (PDF/Excel)', 'Dues Report (PDF/Excel)')}</span>
            </button>
            <div className="flex items-center gap-1.5 min-w-[200px] flex-1 sm:flex-initial">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('নাম, ফোন, জামিনদার, ইনভয়েস #...', 'Search name, phone, guarantor...')}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs transition shrink-0"
                title="ইনভয়েস বা পাসবুক বারকোড স্ক্যান করুন"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-6">
        
        {/* Tab 1: Installments (EMI Plans) */}
        {activeTab === 'installments' && (
          <div>
            {/* Quick Filter Pill Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3.5 scrollbar-none">
              {[
                { id: 'all', label: 'সকল কিস্তি', count: installmentFilterCounts.all },
                { id: 'today', label: 'আজকের কিস্তি', count: installmentFilterCounts.today, alert: installmentFilterCounts.today > 0 },
                { id: 'week', label: 'আগামী ৭ দিন', count: installmentFilterCounts.week },
                { id: 'overdue', label: 'মেয়াদোত্তীর্ণ', count: installmentFilterCounts.overdue, danger: installmentFilterCounts.overdue > 0 },
                { id: 'active', label: 'চলমান কিস্তি', count: installmentFilterCounts.active },
                { id: 'completed', label: 'সম্পূর্ণ পরিশোধিত', count: installmentFilterCounts.completed }
              ].map(f => {
                const isSelected = installmentFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setInstallmentFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : f.danger
                        ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                        : f.alert
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : f.danger 
                        ? 'bg-rose-200 text-rose-900' 
                        : f.alert 
                        ? 'bg-indigo-200 text-indigo-900' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredInstallments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-sm font-medium">{t('কোন কিস্তি চুক্তি সংরক্ষিত নেই', 'No installment agreements found')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t('POS স্ক্রিনে বিক্রয়ের সময় পেমেন্ট মাধ্যম "কিস্তি (EMI)" নির্বাচন করুন', 'Select payment method "EMI" in POS')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredInstallments.map((inst) => {
                  const today = new Date().toISOString().split('T')[0];
                  const hasOverdue = inst.schedule.some(s => !s.isPaid && s.dueDate < today);
                  const isFinished = inst.status === 'completed' || inst.remainingBalance <= 0;
                  const progressPercent = Math.round((inst.paidCount / inst.installmentCount) * 100);

                  return (
                    <div 
                      key={inst.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Status & Invoice */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-indigo-700">
                            {inst.invoiceNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {getCustomerRiskBadge(inst.customerPhone)}
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isFinished 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : hasOverdue 
                                ? 'bg-rose-100 text-rose-800 animate-pulse' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isFinished ? t('পরিশোধিত', 'Completed') : hasOverdue ? t('কিস্তি বকেয়া', 'Overdue') : t('চলমান', 'Active')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                              {inst.customerName}
                            </h4>
                            <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {inst.customerPhone}
                            </p>
                          </div>
                          {inst.customerNid && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              NID: {inst.customerNid.slice(0, 10)}...
                            </span>
                          )}
                        </div>

                        {/* Guarantor Info if available */}
                        {inst.guarantorName && (
                          <div className="mt-2 text-[11px] bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-2 text-emerald-900 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              জামিনদার: <strong className="font-semibold">{inst.guarantorName}</strong>
                              {inst.guarantorRelation ? ` (${inst.guarantorRelation})` : ''}
                            </span>
                            {inst.guarantorPhone && (
                              <a href={`tel:${inst.guarantorPhone}`} className="font-mono text-emerald-700 underline text-[10px]">
                                {inst.guarantorPhone}
                              </a>
                            )}
                          </div>
                        )}

                        {/* Product Summary */}
                        <p className="text-xs text-slate-600 line-clamp-1 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {inst.productNameSummary}
                        </p>

                        {/* Amounts Grid */}
                        <div className="grid grid-cols-3 gap-1.5 text-center mt-3 pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">{t('মোট মূল্য', 'Total')}</span>
                            <span className="text-xs font-mono font-bold text-slate-800">{formatCurrency(inst.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">{t('ডাউন পেমেন্ট', 'Down')}</span>
                            <span className="text-xs font-mono font-semibold text-emerald-600">{formatCurrency(inst.downPayment)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">{t('অবশিষ্ট বাকি', 'Balance')}</span>
                            <span className="text-xs font-mono font-bold text-rose-600">{formatCurrency(inst.remainingBalance)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span>{t('পরিশোধ:', 'Paid:')} {inst.paidCount} / {inst.installmentCount} {t('কিস্তি', 'Installments')}</span>
                            <span className="font-mono font-semibold">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFinished ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => setPassbookInstallment(inst)}
                            className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200 flex items-center justify-center gap-1 transition"
                            title="ডিজিটাল কিস্তি বহি ও কার্ড প্রিন্ট"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>পাসবুক</span>
                          </button>
                          
                          <button
                            onClick={() => setSmsModalData({
                              customerName: inst.customerName,
                              customerPhone: inst.customerPhone,
                              amountDue: inst.remainingBalance,
                              invoiceNo: inst.invoiceNumber,
                              type: 'installment'
                            })}
                            className="py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold border border-emerald-200 flex items-center justify-center gap-1 transition"
                            title="১-ক্লিকে তাগাদা পাঠান"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>তাগাদা</span>
                          </button>

                          <button
                            onClick={() => setFollowUpModalData({
                              title: `কিস্তি হিসাব: ${inst.invoiceNumber}`,
                              customerName: inst.customerName,
                              customerPhone: inst.customerPhone,
                              currentDue: inst.remainingBalance,
                              existingLogs: inst.followUps || [],
                              onAddLog: (log) => addInstallmentFollowUp(inst.id, log)
                            })}
                            className="py-1.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold border border-amber-200 flex items-center justify-center gap-1 transition"
                            title="তাগাদা ডায়েরি ও প্রতিশ্রুতি"
                          >
                            <History className="w-3.5 h-3.5 text-amber-600" />
                            <span>ফলো-আপ</span>
                          </button>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedInstallment(inst)}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition"
                          >
                            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{t('সিডিউল', 'Schedule')}</span>
                          </button>

                          <button
                            onClick={() => setSmartPaymentModalData({ installment: inst, initialMode: 'custom' })}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{t('টাকা আদায়', 'Cash In')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customer Dues Ledger */}
        {activeTab === 'dues' && (
          <div>
            {dueSales.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-12 h-12 mb-2 stroke-1 text-emerald-500" />
                <p className="text-sm font-medium text-slate-700">{t('কোন বাকি বকেয়া নেই! সব হিসাব পরিশোধিত।', 'No outstanding dues! All accounts clear.')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                        <th className="py-3 px-4">{t('ইনভয়েস #', 'Invoice #')}</th>
                        <th className="py-3 px-3">{t('ক্রেতার নাম ও মোবাইল', 'Customer & Phone')}</th>
                        <th className="py-3 px-3">{t('তারিখ ও মেয়াদ', 'Date & Deadline')}</th>
                        <th className="py-3 px-3 text-right">{t('মোট বিল', 'Total Bill')}</th>
                        <th className="py-3 px-3 text-right">{t('পরিশোধিত', 'Paid')}</th>
                        <th className="py-3 px-3 text-right">{t('বাকি টাকা (Due)', 'Due Balance')}</th>
                        <th className="py-3 px-4 text-center">{t('তাগাদা ও আদায়', 'Remind & Collect')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dueSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {sale.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{sale.customerName}</span>
                              {getCustomerRiskBadge(sale.customerPhone)}
                            </div>
                            <span className="text-xs text-slate-500 font-mono block mt-0.5">
                              {sale.customerPhone}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-xs text-slate-600 block">{sale.createdAt.split('T')[0]}</span>
                            {sale.dueDeadline && (
                              <span className="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                                মেয়াদ: {sale.dueDeadline}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-slate-800 font-medium">
                            {formatCurrency(sale.total)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                            {formatCurrency(sale.paidAmount)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                            {formatCurrency(sale.dueAmount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSmsModalData({
                                  customerName: sale.customerName,
                                  customerPhone: sale.customerPhone,
                                  amountDue: sale.dueAmount,
                                  dueDate: sale.dueDeadline,
                                  invoiceNo: sale.invoiceNumber,
                                  type: 'due'
                                })}
                                className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                title="১-ক্লিকে তাগাদা মেসেজ (WhatsApp/SMS)"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setFollowUpModalData({
                                  title: `বাকি বিল: ${sale.invoiceNumber}`,
                                  customerName: sale.customerName,
                                  customerPhone: sale.customerPhone,
                                  currentDue: sale.dueAmount,
                                  existingLogs: sale.followUps || [],
                                  onAddLog: (log) => addSaleFollowUp(sale.id, log)
                                })}
                                className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                                title="তাগাদা ও প্রতিশ্রুতি নোট"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenCollectDue(sale)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>{t('টাকা আদায়', 'Collect')}</span>
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
        )}

        {/* Tab 3: Customer Directory Ledger */}
        {activeTab === 'ledger' && (
          <div>
            {customerLedgerList.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="w-12 h-12 mb-2 stroke-1 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">{t('কোন কাস্টমার রেকর্ড পাওয়া যায়নি', 'No customer records found')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                        <th className="py-3 px-4">{t('গ্রাহকের নাম ও ঝুঁকি গ্রেড', 'Customer & Risk')}</th>
                        <th className="py-3 px-3">{t('মোবাইল নম্বর', 'Phone')}</th>
                        <th className="py-3 px-3 text-right">{t('মোট কেনাকাটা', 'Total Purchases')}</th>
                        <th className="py-3 px-3 text-right">{t('পরিশোধিত টাকা', 'Total Paid')}</th>
                        <th className="py-3 px-3 text-right">{t('মোট বকেয়া পাওনা', 'Total Outstanding')}</th>
                        <th className="py-3 px-3 text-right">{t('ক্রেডিট লিমিট', 'Credit Limit')}</th>
                        <th className="py-3 px-4 text-center">{t('অ্যাকশন', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerLedgerList.map((c, idx) => {
                        const totalOutstanding = c.dueAmount + c.installmentDue;
                        const profile = customerProfiles.find(p => p.phone === c.phone);
                        const creditLimit = profile?.creditLimit || 50000;
                        const isOverLimit = totalOutstanding > creditLimit;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                <span>{c.name}</span>
                                {getCustomerRiskBadge(c.phone)}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">
                              {c.phone}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800">
                              {formatCurrency(c.totalBilled)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                              {formatCurrency(c.totalPaid)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                              {formatCurrency(totalOutstanding)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-xs">
                              <span className={isOverLimit ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                                {formatCurrency(creditLimit)}
                              </span>
                              {isOverLimit && (
                                <span className="block text-[9px] text-rose-600 font-bold">লিমিট অতিক্রম!</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setCreditProfileModalData({
                                    customerName: c.name,
                                    customerPhone: c.phone,
                                    currentTotalDue: totalOutstanding
                                  })}
                                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                                  title="ক্রেডিট লিমিট ও ঝুঁকি রেটিং পরিবর্তন"
                                >
                                  <Award className="w-3 h-3 text-indigo-600" />
                                  <span>লিমিট</span>
                                </button>

                                <button
                                  onClick={() => setSelectedCustomerForLedger({ name: c.name, phone: c.phone })}
                                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{t('খতিয়ান', 'Ledger')}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Aging & Risk Analytics */}
        {activeTab === 'aging' && (
          <div className="space-y-4">
            {/* Filter buttons by age brackets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'current', label: '০-৩০ দিন (চলতি)', count: agingAnalysis.current.count, amount: agingAnalysis.current.amount, color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                { id: 'medium', label: '৩১-৬০ দিন (মাঝারি)', count: agingAnalysis.medium.count, amount: agingAnalysis.medium.amount, color: 'border-amber-300 bg-amber-50 text-amber-900' },
                { id: 'warning', label: '৬১-৯০ দিন (সতর্কতা)', count: agingAnalysis.warning.count, amount: agingAnalysis.warning.amount, color: 'border-orange-300 bg-orange-50 text-orange-900' },
                { id: 'overdue', label: '৯০+ দিন (খেলাপী)', count: agingAnalysis.overdue.count, amount: agingAnalysis.overdue.amount, color: 'border-rose-300 bg-rose-50 text-rose-900' },
              ].map(bracket => {
                const isSelected = selectedAgingBracket === bracket.id;
                return (
                  <button
                    key={bracket.id}
                    onClick={() => setSelectedAgingBracket(isSelected ? 'all' : (bracket.id as any))}
                    className={`p-3.5 rounded-xl border text-left transition ${bracket.color} ${
                      isSelected ? 'ring-2 ring-slate-900 shadow-md' : 'hover:opacity-90'
                    }`}
                  >
                    <span className="text-xs font-bold block">{bracket.label}</span>
                    <p className="text-base font-black font-mono mt-1">{formatCurrency(bracket.amount)}</p>
                    <span className="text-[10px] opacity-80 mt-0.5 block">{bracket.count} টি অ্যাকাউন্ট বকেয়া</span>
                  </button>
                );
              })}
            </div>

            {/* List of accounts in selected aging category */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {selectedAgingBracket === 'all' ? 'সকল মেয়াদোত্তীর্ণ ও চলতি বকেয়া হিসাব' : `${selectedAgingBracket} ব্র্যাকেটের বকেয়া তালিকা`}
                </span>
                {selectedAgingBracket !== 'all' && (
                  <button
                    onClick={() => setSelectedAgingBracket('all')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    সব দেখুন (Show All)
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <th className="py-2.5 px-3">ধরণ</th>
                      <th className="py-2.5 px-3">ইনভয়েস #</th>
                      <th className="py-2.5 px-3">গ্রাহকের নাম ও ফোন</th>
                      <th className="py-2.5 px-3 text-center">বকেয়া বয়স</th>
                      <th className="py-2.5 px-3 text-right">বকেয়া টাকা</th>
                      <th className="py-2.5 px-3 text-center">তাগাদা ও ফলো-আপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const allItems = [
                        ...agingAnalysis.current.items,
                        ...agingAnalysis.medium.items,
                        ...agingAnalysis.warning.items,
                        ...agingAnalysis.overdue.items
                      ];

                      const displayItems = selectedAgingBracket === 'all'
                        ? allItems
                        : agingAnalysis[selectedAgingBracket].items;

                      if (displayItems.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              এই ব্র্যাকেটে কোনো বকেয়া হিসাব নেই।
                            </td>
                          </tr>
                        );
                      }

                      return displayItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.type === 'installment' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {item.type === 'installment' ? 'কিস্তি' : 'কাউন্টার বাকি'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {item.invoiceNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{item.customerName}</span>
                            <span className="font-mono text-slate-500 text-[11px]">{item.customerPhone}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                              item.ageInDays > 90 ? 'bg-rose-100 text-rose-800' :
                              item.ageInDays > 60 ? 'bg-orange-100 text-orange-800' :
                              item.ageInDays > 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.ageInDays} দিন পুরনো
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                            {formatCurrency(item.dueAmount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSmsModalData({
                                  customerName: item.customerName,
                                  customerPhone: item.customerPhone,
                                  amountDue: item.dueAmount,
                                  invoiceNo: item.invoiceNumber,
                                  type: item.type
                                })}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                                title="তাগাদা মেসেজ"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setFollowUpModalData({
                                  title: `হিসাব: ${item.invoiceNumber}`,
                                  customerName: item.customerName,
                                  customerPhone: item.customerPhone,
                                  currentDue: item.dueAmount,
                                  existingLogs: item.followUps || [],
                                  onAddLog: (log) => {
                                    if (item.type === 'installment') {
                                      addInstallmentFollowUp(item.id, log);
                                    } else {
                                      addSaleFollowUp(item.id, log);
                                    }
                                  }
                                })}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                                title="ফলো-আপ ডায়েরি"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Installment Schedule Drawer / Modal */}
      {currentSelectedInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>{t('কিস্তির সিডিউল ও পেমেন্ট রসিদ', 'EMI Schedule & Payment History')}</span>
                  {currentSelectedInstallment.status === 'completed' || currentSelectedInstallment.status === 'foreclosed' ? (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                      {currentSelectedInstallment.status === 'foreclosed' ? 'এককালীন নিষ্পত্তিকৃত' : 'সম্পূর্ণ পরিশোধিত'}
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">
                      চলমান কিস্তি
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  চালান: {currentSelectedInstallment.invoiceNumber} • গ্রাহক: {currentSelectedInstallment.customerName} ({currentSelectedInstallment.customerPhone})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPassbookInstallment(currentSelectedInstallment)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>পাসবুক কার্ড</span>
                </button>
                <button 
                  onClick={() => setSelectedInstallment(null)} 
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Summary Banner */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-500 block">{t('মোট ঋণ:', 'Total Cost:')}</span>
                  <span className="font-mono font-bold text-slate-800">{formatCurrency(currentSelectedInstallment.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t('ডাউন পেমেন্ট:', 'Down Payment:')}</span>
                  <span className="font-mono font-bold text-emerald-600">{formatCurrency(currentSelectedInstallment.downPayment)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t('অবশিষ্ট পাওনা:', 'Remaining Balance:')}</span>
                  <span className="font-mono font-bold text-rose-600">{formatCurrency(currentSelectedInstallment.remainingBalance)}</span>
                </div>
              </div>

              {/* Action Toolbar for Collection */}
              {currentSelectedInstallment.remainingBalance > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      স্মার্ট কিস্তি কালেকশন অ্যাকশন
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      যেকোনো অংকের টাকা দিলে স্বয়ংক্রিয়ভাবে পরবর্তী কিস্তিগুলোতে ভাগ হয়ে যাবে
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSmartPaymentModalData({ installment: currentSelectedInstallment, initialMode: 'custom' })}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>কাস্টম টাকা জমা</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmartPaymentModalData({ installment: currentSelectedInstallment, initialMode: 'foreclose' })}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 active:scale-95"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>এককালীন লোন ক্লোজ (ছাড় সহ)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Installment Schedule Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('মাসিক কিস্তির তালিকা', 'Monthly Installment Schedule')}
                  </h5>
                  <span className="text-xs text-slate-500 font-mono">
                    পরিশোধ: {currentSelectedInstallment.paidCount} / {currentSelectedInstallment.installmentCount}
                  </span>
                </div>

                <div className="space-y-2">
                  {currentSelectedInstallment.schedule.map((sch) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isOverdue = !sch.isPaid && sch.dueDate < today;

                    return (
                      <div 
                        key={sch.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition ${
                          sch.isPaid 
                            ? 'bg-emerald-50/60 border-emerald-200' 
                            : isOverdue 
                            ? 'bg-rose-50/70 border-rose-300' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                            sch.isPaid ? 'bg-emerald-600 text-white' : isOverdue ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {sch.installmentNo}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                              <span>{t('কিস্তি নং', 'Installment #')} {sch.installmentNo}</span>
                              {sch.paymentMethod && (
                                <span className="text-[10px] uppercase font-mono font-bold bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded">
                                  {sch.paymentMethod}
                                </span>
                              )}
                              {sch.receiptNo && (
                                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                  {sch.receiptNo}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{t('মেয়াদ:', 'Due:')} {sch.dueDate}</span>
                              {isOverdue && (
                                <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.2 rounded">
                                  মেয়াদোত্তীর্ণ
                                </span>
                              )}
                              {sch.paidDate && (
                                <span className="text-emerald-700 font-medium">
                                  • জমা: {new Date(sch.paidDate).toLocaleDateString('bn-BD')}
                                </span>
                              )}
                            </div>

                            {/* Additional info badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {sch.paidAmount && !sch.isPaid ? (
                                <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.2 rounded">
                                  আংশিক জমা: {formatCurrency(sch.paidAmount)} (বাকি: {formatCurrency(sch.amount - sch.paidAmount)})
                                </span>
                              ) : null}
                              {sch.lateFee && sch.lateFee > 0 ? (
                                <span className="text-[10px] text-rose-700 bg-rose-100 font-semibold px-1.5 py-0.2 rounded">
                                  জরিমানা: +{formatCurrency(sch.lateFee)}
                                </span>
                              ) : null}
                              {sch.waivedPenalty && sch.waivedPenalty > 0 ? (
                                <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-1.5 py-0.2 rounded">
                                  মওকুফ ফি: {formatCurrency(sch.waivedPenalty)}
                                </span>
                              ) : null}
                              {sch.discountAmount && sch.discountAmount > 0 ? (
                                <span className="text-[10px] text-indigo-800 bg-indigo-100 font-semibold px-1.5 py-0.2 rounded">
                                  ছাড়: -{formatCurrency(sch.discountAmount)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          <span className="font-mono font-bold text-sm text-slate-900 mr-2">
                            {formatCurrency(sch.amount)}
                          </span>

                          {sch.isPaid ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                <Check className="w-3.5 h-3.5" />
                                {t('পরিশোধিত', 'Paid')}
                              </span>
                              <button
                                type="button"
                                onClick={() => setReversalTarget({ installment: currentSelectedInstallment, item: sch })}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ভুল এন্ট্রি বাতিল ও সংশোধন করুন (Void Payment)"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSmartPaymentModalData({ installment: currentSelectedInstallment, scheduleItem: sch, initialMode: 'single' })}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 active:scale-95"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>আদায় ও রসিদ</span>
                              </button>
                              <button
                                onClick={() => handlePayInstallment(currentSelectedInstallment, sch)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                                title="১-ক্লিক পূর্ণ জমা"
                              >
                                {t('পূর্ণ আদায়', 'Full')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedInstallment(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Due Payment Modal (for Tab 2) */}
      {collectingSale && (() => {
        const lockedDevice = devices.find(d => 
          (
            (d.customerPhone && d.customerPhone !== 'N/A' && d.customerPhone === collectingSale.customerPhone) ||
            (d.customerName && d.customerName === collectingSale.customerName)
          ) && d.lockStatus === 'LOCKED'
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ৳
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t('বাকি টাকা আদায়', 'Collect Due Payment')}</h4>
                    <p className="text-[11px] text-slate-500">ইনভয়েস: {collectingSale.invoiceNumber}</p>
                  </div>
                </div>
                <button onClick={() => setCollectingSale(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
              </div>

              {lockedDevice && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    লক করা ডিভাইস সনাক্ত হয়েছে ({lockedDevice.model})
                  </span>
                  <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={collectAutoUnlock}
                      onChange={(e) => setCollectAutoUnlock(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-semibold text-rose-900">
                      টাকা জমা হলে সাথে সাথে স্বয়ংক্রিয়ভাবে আনলক করুন
                    </span>
                  </label>
                </div>
              )}

              <form onSubmit={handleCollectDue} className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('ক্রেতার নাম:', 'Customer:')}</span>
                    <span className="font-semibold text-slate-800">{collectingSale.customerName}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200">
                    <span>{t('বর্তমান মোট বকেয়া:', 'Current Due:')}</span>
                    <span className="font-mono">{formatCurrency(collectingSale.dueAmount)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('আদায়কৃত টাকার পরিমাণ (৳):', 'Payment Amount Received:')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setCollectAmount(collectingSale.dueAmount)}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      সম্পূর্ণ বকেয়া ({formatCurrency(collectingSale.dueAmount)})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={collectingSale.dueAmount}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পেমেন্ট মাধ্যম:
                  </label>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      { id: 'cash', label: 'নগদ' },
                      { id: 'bkash', label: 'বিকাশ' },
                      { id: 'nagad', label: 'নগদ' },
                      { id: 'rocket', label: 'রকেট' },
                      { id: 'bank', label: 'ব্যাংক' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCollectPaymentMethod(m.id as any)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          collectPaymentMethod === m.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {collectPaymentMethod !== 'cash' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={collectTrxId}
                        onChange={(e) => setCollectTrxId(e.target.value)}
                        placeholder="TrxID / ট্রানজ্যাকশন আইডি..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={collectNote}
                    onChange={(e) => setCollectNote(e.target.value)}
                    placeholder="পেমেন্ট নোট বা মন্তব্য (ঐচ্ছিক)..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCollectingSale(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    {t('বাতিল', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition active:scale-95"
                  >
                    {t('জমা সংরক্ষণ করুন ও রশিদ দিন', 'Confirm & Receipt')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Installment Passbook Modal */}
      {passbookInstallment && (
        <InstallmentPassbookModal
          installment={passbookInstallment}
          isOpen={true}
          onClose={() => setPassbookInstallment(null)}
        />
      )}

      {/* Follow-Up / Diary Modal */}
      {followUpModalData && (
        <FollowUpModal
          isOpen={true}
          onClose={() => setFollowUpModalData(null)}
          title={followUpModalData.title}
          customerName={followUpModalData.customerName}
          customerPhone={followUpModalData.customerPhone}
          currentDue={followUpModalData.currentDue}
          existingLogs={followUpModalData.existingLogs}
          onAddLog={followUpModalData.onAddLog}
        />
      )}

      {/* 1-Click SMS / WhatsApp Reminder Modal */}
      {smsModalData && (
        <SmsReminderModal
          isOpen={true}
          onClose={() => setSmsModalData(null)}
          customerName={smsModalData.customerName}
          customerPhone={smsModalData.customerPhone}
          amountDue={smsModalData.amountDue}
          dueDate={smsModalData.dueDate}
          invoiceNo={smsModalData.invoiceNo}
          type={smsModalData.type}
        />
      )}

      {/* Smart Installment Collection Modal */}
      {smartPaymentModalData && (
        <PartialPaymentModal
          isOpen={true}
          onClose={() => setSmartPaymentModalData(null)}
          installment={smartPaymentModalData.installment}
          scheduleItem={smartPaymentModalData.scheduleItem}
          initialMode={smartPaymentModalData.initialMode}
        />
      )}

      {/* Payment Reversal (Void / Error correction) Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Undo2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">কিস্তি পেমেন্ট বাতিল / রিভার্সাল</h4>
                <p className="text-xs text-slate-500">ভুল এন্ট্রি সংশোধন করুন</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 space-y-1">
              <div className="flex justify-between">
                <span>কিস্তি নং:</span>
                <span className="font-bold">#{reversalTarget.item.installmentNo}</span>
              </div>
              <div className="flex justify-between">
                <span>জমা হওয়া টাকা:</span>
                <span className="font-mono font-bold">{formatCurrency(reversalTarget.item.paidAmount || reversalTarget.item.amount)}</span>
              </div>
              <p className="text-[11px] text-rose-700 pt-1 border-t border-rose-200 mt-1">
                সতর্কতা: এই পেমেন্ট বাতিল করলে উক্ত টাকা কিস্তির বকেয়াতে পুনরায় যোগ হবে এবং লেজারে রিভার্সাল জার্নাল এন্ট্রি পড়বে।
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                বাতিলের কারণ (বাধ্যতামূলক):
              </label>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="যেমন: ভুল কাস্টমারে এন্ট্রি দেওয়া হয়েছিল..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReversalTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 transition active:scale-95"
              >
                নিশ্চিত রিভার্স করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Credit Profile Modal */}
      {creditProfileModalData && (
        <CustomerCreditProfileModal
          isOpen={true}
          onClose={() => setCreditProfileModalData(null)}
          customerName={creditProfileModalData.customerName}
          customerPhone={creditProfileModalData.customerPhone}
          currentTotalDue={creditProfileModalData.currentTotalDue}
        />
      )}

      {/* Global Customer Ledger Modal */}
      {selectedCustomerForLedger && (
        <CustomerLedgerModal
          customerName={selectedCustomerForLedger.name}
          customerPhone={selectedCustomerForLedger.phone}
          isOpen={true}
          onClose={() => setSelectedCustomerForLedger(null)}
        />
      )}

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialType="customer_dues"
      />

      {/* Barcode & Invoice Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          setSearchQuery(code);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );
};
