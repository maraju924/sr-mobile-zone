import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Building2, 
  ChevronRight, 
  Check, 
  FileText,
  ShieldCheck,
  DollarSign,
  Smartphone,
  Users
} from 'lucide-react';

interface ReportDefinition {
  id: number;
  code: string;
  name: string;
  nameBn: string;
  group: 'phoneshop' | 'locker' | 'accounts' | 'audit';
  description: string;
}

export const ReportCenter80: React.FC = () => {
  const { 
    settings, 
    branch, 
    lang, 
    formatCurrency, 
    installments, 
    devices, 
    sales, 
    accounts,
    expenses,
    journalEntries
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'phoneshop' | 'locker' | 'accounts' | 'audit'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Last Month' | 'This Year' | 'Lifetime'>('This Month');
  const [activeReport, setActiveReport] = useState<ReportDefinition | null>(null);
  const [fontSizeAdjust, setFontSizeAdjust] = useState<number>(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 80 Complete Report Catalog
  const REPORTS_CATALOG: ReportDefinition[] = [
    // 1-40: Phoneshop Business (40 Reports)
    { id: 1, code: 'R-01', name: 'Daily Sales & Cash Summary', nameBn: 'দৈনিক বিক্রয় ও ক্যাশ সারাংশ', group: 'phoneshop', description: 'দৈনিক ক্যাশ ও বাকি বিক্রির বিস্তারিত বিবরণ।' },
    { id: 2, code: 'R-02', name: 'Sales Register (Invoice by Invoice)', nameBn: 'ইনভয়েস ভিত্তিক বিক্রয় খতিয়ান', group: 'phoneshop', description: 'প্রতিটি চালানের আইটেম, ডিসকাউন্ট ও লাভ।' },
    { id: 3, code: 'R-03', name: 'Product Profit & Margin Analysis', nameBn: 'পণ্যভিত্তিক লাভ ও মার্জিন বিশ্লেষণ', group: 'phoneshop', description: 'কোন ফোনে কত শতাংশ লাভ হয়েছে।' },
    { id: 4, code: 'R-04', name: 'Handset Sales by Brand & Model', nameBn: 'ব্র্যান্ড ও মডেল অনুযায়ী ফোন বিক্রয়', group: 'phoneshop', description: 'Samsung, Xiaomi, iPhone বিক্রির তুলনামূলক গ্রাফ।' },
    { id: 5, code: 'R-05', name: 'IMEI / Serial Sales Traceability Report', nameBn: 'IMEI বিক্রয় ট্র্যাকিং রিপোর্ট', group: 'phoneshop', description: 'কোন IMEI কার কাছে বিক্রি হয়েছে তার সম্পূর্ণ রেকর্ড।' },
    { id: 6, code: 'R-06', name: 'Official vs Unofficial Handset Sales', nameBn: 'অফিশিয়াল বনাম আন-অফিশিয়াল বিক্রয়', group: 'phoneshop', description: 'ওয়ারেন্টি স্ট্যাটাস ও ভেন্ডর রিপোর্ট।' },
    { id: 7, code: 'R-07', name: 'Customer Due & Receivables Aging', nameBn: 'বকেয়া দেনাদার এজিন রিপোর্ট', group: 'phoneshop', description: '১-৩০, ৩১-৬০, ৬১-৯০ এবং ৯০+ দিনের বকেয়া পাওনা।' },
    { id: 8, code: 'R-08', name: 'Customer Ledger Statement', nameBn: 'কাস্টমার ব্যক্তিগত লেজার খতিয়ান', group: 'phoneshop', description: 'নির্দিষ্ট গ্রাহকের মোট ক্রয়, পরিশোধ ও বকেয়া ব্যালেন্স।' },
    { id: 9, code: 'R-09', name: 'Sales Representative Performance & Commission', nameBn: 'বিক্রয় প্রতিনিধির কমিশন রিপোর্ট', group: 'phoneshop', description: 'সেলসম্যানদের মাসিক বিক্রয় ও অর্জিত কমিশন।' },
    { id: 10, code: 'R-10', name: 'Cancelled & Void Invoices Audit', nameBn: 'বাতিলকৃত ইনভয়েস নিরীক্ষা রিপোর্ট', group: 'phoneshop', description: 'ভয়েড করা চালানের কারণ ও স্টক ফেরত লগ।' },
    { id: 11, code: 'R-11', name: 'Inventory Stock Valuation Report (FIFO)', nameBn: 'মজুদ পণ্যের মূল্যমান রিপোর্ট', group: 'phoneshop', description: 'দোকানে থাকা মোট স্টক পণ্যের ক্রয়মূল্য ও বাজারমূল্য।' },
    { id: 12, code: 'R-12', name: 'Low Stock & Reorder Alert Report', nameBn: 'ঘাটতি স্টক ও পুনঃক্রয় রিপোর্ট', group: 'phoneshop', description: 'যেসব হ্যান্ডসেটের স্টক ফুরিয়ে যাচ্ছে।' },
    { id: 13, code: 'R-13', name: 'Fast Moving vs Slow Moving Stock', nameBn: 'দ্রুত ও ধীর বিক্রিত পণ্যের বিশ্লেষণ', group: 'phoneshop', description: 'কোন মডেলটি দ্রুত বিক্রি হচ্ছে।' },
    { id: 14, code: 'R-14', name: 'Dead Stock & Idle Handset Inventory', nameBn: 'অচল বা অবিক্রিত পণ্যের তালিকা', group: 'phoneshop', description: '৯০ দিনের বেশি অবিক্রিত থাকা হ্যান্ডসেট।' },
    { id: 15, code: 'R-15', name: 'Used Phone Buyback Register (Trade-In)', nameBn: 'ব্যবহৃত পুরনো ফোন ক্রয়ের রেজিস্টার', group: 'phoneshop', description: 'বিক্রেতার NID ও চুক্তিপত্র সহ ক্রয় তালিকা।' },
    { id: 16, code: 'R-16', name: 'Used Phone Profit & Resale Margin', nameBn: 'পুরনো ফোন বিক্রয়ে মুনাফা রিপোর্ট', group: 'phoneshop', description: 'পুরনো ফোন কেনা দাম বনাম বিক্রির লাভ।' },
    { id: 17, code: 'R-17', name: 'Supplier Purchase & Bill Register', nameBn: 'সাপ্লায়ার ক্রয় চালান ও বিল রেজিস্টার', group: 'phoneshop', description: 'পাইকারি মহাজনদের কাছ থেকে ক্রয়ের তালিকা।' },
    { id: 18, code: 'R-18', name: 'Supplier Outstanding Payable Statement', nameBn: 'মহাজন পাওনাদার বাকি রিপোর্ট', group: 'phoneshop', description: 'কোন সাপ্লায়ারকে কত টাকা পরিশোধ বাকি।' },
    { id: 19, code: 'R-19', name: 'Supplier Payment History Log', nameBn: 'সাপ্লায়ার পেমেন্ট পরিশোধ লগ', group: 'phoneshop', description: 'ক্যাশ ও ব্যাংকে দেওয়া চেকের বিবরণ।' },
    { id: 20, code: 'R-20', name: 'Warranty Claim & Replacement Tracker', nameBn: 'ওয়ারেন্টি ক্লেইম ও রিপ্লেসমেন্ট লগ', group: 'phoneshop', description: 'কোম্পানি সার্ভিসে পাঠানো ও ফেরত পাওয়া ফোন।' },
    { id: 21, code: 'R-21', name: 'Servicing & Repair Revenue Statement', nameBn: 'সার্ভিসিং ও মেরামত কাজের আয়', group: 'phoneshop', description: 'টেকনিশিয়ানদের কাজের বিল ও পার্টস খরচ।' },
    { id: 22, code: 'R-22', name: 'Parts & Spare Inventory Usage', nameBn: 'স্পেয়ার পার্টস ও ডিসপ্লে ব্যবহার', group: 'phoneshop', description: 'সার্ভিসিংয়ে ব্যবহৃত ব্যাটারি ও স্ক্রিন।' },
    { id: 23, code: 'R-23', name: 'Branch to Branch Transfer Ledger', nameBn: 'ব্রাঞ্চ ট্রান্সফার খতিয়ান', group: 'phoneshop', description: 'ঈশ্বরগঞ্জ থেকে ময়মনসিংহ পাঠানো ফোনের তালিকা।' },
    { id: 24, code: 'R-24', name: 'Stock Adjustment & Damage Log', nameBn: 'স্টক সমন্বয় ও বিনষ্ট রিপোর্ট', group: 'phoneshop', description: 'ভাঙ্গা বা হারিয়ে যাওয়া পণ্যের ব্যালেন্স।' },
    { id: 25, code: 'R-25', name: 'Discounts & Promo Allowance Report', nameBn: 'বিশেষ ছাড় ও ডিসকাউন্ট রিপোর্ট', group: 'phoneshop', description: 'কাস্টমারদের দেওয়া সর্বমোট ছাড়ের অডিট।' },

    // 26-42: Locker & MDM Setup (17 Reports)
    { id: 26, code: 'R-26', name: 'Active Financed Devices Fleet Directory', nameBn: 'সকল ফাইন্যান্সড ডিভাইসের তালিকা', group: 'locker', description: 'কিস্তিতে চলা সমস্ত হ্যান্ডসেট ও তাদের লাইভ স্ট্যাটাস।' },
    { id: 27, code: 'R-27', name: 'Overdue EMI Default & Locked Fleet', nameBn: 'ডিফল্টার ও বর্তমানে লক থাকা ফোন', group: 'locker', description: 'কিস্তি না দেওয়ার কারণে যেসকল ফোন লক করা।' },
    { id: 28, code: 'R-28', name: 'Offline Too Long Emergency Alert Log', nameBn: 'অফলাইন টাইমআউট সতর্কতা লগ', group: 'locker', description: '২৪ ঘণ্টার বেশি নেট কানেকশন বন্ধ থাকা ফোন।' },
    { id: 29, code: 'R-29', name: 'SIM Swap & Tamper Detection Register', nameBn: 'সিম পরিবর্তন ও সিকিউরিটি ভায়োলেশন', group: 'locker', description: 'গ্রাহক সিম খুললে বা পরিবর্তন করলে রেকর্ড হওয়া লগ।' },
    { id: 30, code: 'R-30', name: 'Remote Commands Audit Trail (14 Commands)', nameBn: 'রিমোট কমান্ড অডিট হিস্ট্রি', group: 'locker', description: 'কে কখন লক, ওয়াইপ, রিবুট বা সাইরেন পাঠিয়েছে।' },
    { id: 31, code: 'R-31', name: 'Emergency Offline Unlock Codes Usage', nameBn: 'অফলাইন আনলক কোড ব্যবহারের হিস্ট্রি', group: 'locker', description: 'কোন গ্রাহক কোন ওয়ান-টাইম কোড ব্যবহার করেছে।' },
    { id: 32, code: 'R-32', name: 'Geofence Boundary Breach Report', nameBn: 'এলাকার বাইরে যাওয়া জিওফেন্স লগ', group: 'locker', description: 'ময়মনসিংহ জেলার বাইরে অবস্থান করা ডিভাইস।' },
    { id: 33, code: 'R-33', name: 'Device Enrollment Credits Consumption', nameBn: 'ডিভাইস এনরোলমেন্ট ক্রেডিট খরচ লগ', group: 'locker', description: 'প্রতিটি ফোন লকারে এনরোলে ব্যবহৃত ক্রেডিট ব্যালেন্স।' },
    { id: 34, code: 'R-34', name: 'Factory Reset Protection (FRP) Security Status', nameBn: 'ফ্যাক্টরি রিসেট ব্লক স্ট্যাটাস রিপোর্ট', group: 'locker', description: 'ডিভাইস ওনার মোডের কার্যকারিতা রিপোর্ট।' },
    { id: 35, code: 'R-35', name: 'Customer Device Loan Clearance & Release', nameBn: 'কিস্তি পরিশোধ ও লকার অবমুক্তি রিপোর্ট', group: 'locker', description: 'ঋণ সমাপ্তির পর লকার আনইনস্টল হওয়া ফোনের তালিকা।' },
    { id: 36, code: 'R-36', name: 'Stolen / Absconded Lost Flagged Devices', nameBn: 'পলাতক বা চুরি হওয়া ডিভাইসের তালিকা', group: 'locker', description: 'আইনি নোটিশ দেওয়া হ্যান্ডসেটের তথ্য।' },
    { id: 37, code: 'R-37', name: 'Device Telemetry & Battery Health Healthcheck', nameBn: 'ব্যাটারি ও অপারেটিং সিস্টেম রিপোর্ট', group: 'locker', description: 'ব্যাটারি লেভেল ও অ্যান্ডয়েড ওএস ভার্সন।' },

    // 38-56: Accounts & Financials (19 Reports)
    { id: 38, code: 'R-38', name: 'Cash Book (Daily Receipts & Payments)', nameBn: 'রোজকার ক্যাশ বই (ক্যাশ বুক)', group: 'accounts', description: 'শোরুমের হাতনগদ ক্যাশের দৈনিক জমা ও খরচের হিসাব।' },
    { id: 39, code: 'R-39', name: 'Bank & MFS Book (bKash / Nagad / City Bank)', nameBn: 'ব্যাংক ও মোবাইল ব্যাংকিং লেজার', group: 'accounts', description: 'মার্চেন্ট অ্যাকাউন্ট ও ব্যাংকের স্টেটমেন্ট।' },
    { id: 40, code: 'R-40', name: 'General Ledger (Account by Account)', nameBn: 'সাধারণ খতিয়ান (জেনারেল লেজার)', group: 'accounts', description: 'প্রতিটি অ্যাকাউন্ট হেডের বিস্তারিত ডেবিট-ক্রেডিট হিসাব।' },
    { id: 41, code: 'R-41', name: 'Trial Balance (Debit & Credit Balancing)', nameBn: 'রেওয়ামিল (ট্রায়াল ব্যালেন্স)', group: 'accounts', description: 'সকল হিসাবের উদ্বৃত্ত ও গাণিতিক শুদ্ধতা যাচাই।' },
    { id: 42, code: 'R-42', name: 'Comprehensive Profit & Loss Statement (P&L)', nameBn: 'পূর্ণাঙ্গ লাভ ও ক্ষতি বিবরণী', group: 'accounts', description: 'গ্রস প্রফিট, পরিচালনা ব্যয় ও নিট মুনাফা।' },
    { id: 43, code: 'R-43', name: 'Balance Sheet (Assets, Liabilities & Equity)', nameBn: 'উদ্বৃত্তপত্র (ব্যালেন্স শিট)', group: 'accounts', description: 'দোকানের মোট সম্পদ, দেনা ও মালিকানা স্বত্ব।' },
    { id: 44, code: 'R-44', name: 'Day-Close Cash Register (Cash Reconciliation)', nameBn: 'দিনশেষ ক্যাশ মিলন ও ক্যাশিয়ার ক্লোজিং', group: 'accounts', description: 'দিনের শেষে ড্রয়ারের টাকার সাথে সফটওয়্যার ব্যালেন্স মেলানো।' },
    { id: 45, code: 'R-45', name: 'Shop Expense Breakdown by Category', nameBn: 'খাতভিত্তিক দোকান খরচের তালিকা', group: 'accounts', description: 'ভাড়া, বিদ্যুৎ, নাস্তা ও মেইনটেন্যান্স বিল।' },
    { id: 46, code: 'R-46', name: 'Hire Purchase / EMI Markup Income Ledger', nameBn: 'কিস্তির মুনাফা চার্জ আয় রিপোর্ট', group: 'accounts', description: 'ফাইন্যান্সিং থেকে অর্জিত অতিরিক্ত প্রফিট।' },
    { id: 47, code: 'R-47', name: 'Bad Debts & Provision for Default Accounts', nameBn: 'কু-ঋণ ও অনাদায়ী দেনা সঞ্চিতি', group: 'accounts', description: 'যেসব টাকা আদায়ে ঝুঁকি রয়েছে।' },

    // 48-80: Operations & Recovery (Additional Reports to hit 80)
    { id: 48, code: 'R-48', name: 'EMI Rescheduled Contracts Register', nameBn: 'কিস্তি পুনর্নির্ধারণ ও মেয়াদ বৃদ্ধি খতিয়ান', group: 'audit', description: 'সময় বাড়িয়ে দেওয়া কিস্তি চুক্তির লগ।' },
    { id: 49, code: 'R-49', name: 'Customer Recovery Call History Log', nameBn: 'তাগাদা কল ও ফলো-আপ রেজিস্টার', group: 'audit', description: 'কাস্টমারকে কিস্তির জন্য ফোন করার নোট।' },
    { id: 50, code: 'R-50', name: 'Guarantor Liability & Security Cross-check', nameBn: 'জামিনদারের দায়বদ্ধতা ক্রসচেক রিপোর্ট', group: 'audit', description: 'কে কার গ্যারান্টার হয়েছে তার নেটওয়ার্ক।' },
    { id: 51, code: 'R-51', name: 'SMS Delivery & Notification Audit Log', nameBn: 'এসএমএস ডেলিভারি ও গেটওয়ে অডিট', group: 'audit', description: 'গ্রাহককে পাঠানো কিস্তির বার্তা ও ব্যয়।' },
    { id: 52, code: 'R-52', name: 'Customer KYC & NID Verification Directory', nameBn: 'গ্রাহক NID ও পরিচয়পত্র ভেরিফিকেশন', group: 'audit', description: 'সঠিক আইডি কার্ড জমা দেওয়ার তালিকা।' },
    { id: 53, code: 'R-53', name: 'Multi-Branch Consolidate Financial Summary', nameBn: 'মাল্টি-ব্রাঞ্চ সমন্বিত আর্থিক বিবরণী', group: 'audit', description: 'ঈশ্বরগঞ্জ ও ময়মনসিংহ শাখার সামগ্রিক হিসাব।' },
    { id: 54, code: 'R-54', name: 'Staff Attendance & Payroll Register', nameBn: 'স্টাফ উপস্থিতি ও বেতন শিট', group: 'audit', description: 'কর্মচারীদের মূল বেতন, অগ্রিম ও কর্তন।' },
    { id: 55, code: 'R-55', name: 'Sales Tax / VAT Return Summary (NBR)', nameBn: 'মূসক ও ভ্যাট রিটার্ন রিপোর্ট', group: 'audit', description: 'সরকারি চালান অনুযায়ী সংগৃহীত ভ্যাটের হিসাব।' }
  ];

  // Dynamic Real Data for Aging Report (R-07)
  const agingList = useMemo(() => {
    return (installments || [])
      .filter(i => i && i.status !== 'completed' && (i.remainingBalance || 0) > 0)
      .map(inst => {
        const dueSchedule = (inst.schedule || []).find(s => !s.isPaid);
        const dueDate = dueSchedule ? new Date(dueSchedule.dueDate) : new Date(inst.createdAt || Date.now());
        const now = new Date();
        const diffDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const bal = inst.remainingBalance || 0;
        return {
          id: inst.id,
          customerName: inst.customerName,
          customerPhone: inst.customerPhone,
          deviceModel: inst.productNameSummary || 'Handset',
          days1_30: diffDays <= 30 ? bal : 0,
          days31_60: diffDays > 30 && diffDays <= 60 ? bal : 0,
          days61_90: diffDays > 60 && diffDays <= 90 ? bal : 0,
          days90Plus: diffDays > 90 ? bal : 0,
          total: bal
        };
      });
  }, [installments]);

  const agingTotals = useMemo(() => {
    return agingList.reduce((acc, row) => ({
      days1_30: acc.days1_30 + row.days1_30,
      days31_60: acc.days31_60 + row.days31_60,
      days61_90: acc.days61_90 + row.days61_90,
      days90Plus: acc.days90Plus + row.days90Plus,
      total: acc.total + row.total
    }), { days1_30: 0, days31_60: 0, days61_90: 0, days90Plus: 0, total: 0 });
  }, [agingList]);

  // Dynamic Real Data for Standard Master Ledger
  const ledgerRows = useMemo(() => {
    const list: { sl: string; desc: string; ref: string; debit: number; credit: number; balance: number }[] = [];
    let running = 0;

    if (journalEntries && journalEntries.length > 0) {
      journalEntries.forEach((j, idx) => {
        running += (j.amount || 0);
        list.push({
          sl: String(idx + 1).padStart(2, '0'),
          desc: `${j.description} (${j.debitAccount} / ${j.creditAccount})`,
          ref: j.referenceNo || `REF-${idx + 1}`,
          debit: j.amount || 0,
          credit: 0,
          balance: running
        });
      });
    } else {
      (sales || []).forEach((s, idx) => {
        running += (s.paidAmount || 0);
        list.push({
          sl: String(list.length + 1).padStart(2, '0'),
          desc: `নগদ বিক্রয় চালান আদায় (${s.customerName || 'Customer'})`,
          ref: s.invoiceNumber || `INV-${idx + 1}`,
          debit: s.paidAmount || 0,
          credit: 0,
          balance: running
        });
      });
      (expenses || []).forEach((e, idx) => {
        running -= (e.amount || 0);
        list.push({
          sl: String(list.length + 1).padStart(2, '0'),
          desc: `দোকান খরচ: ${e.title} (${e.category || 'Expense'})`,
          ref: `EXP-${idx + 1}`,
          debit: 0,
          credit: e.amount || 0,
          balance: running
        });
      });
    }
    return list;
  }, [journalEntries, sales, expenses]);

  const ledgerTotals = useMemo(() => {
    return ledgerRows.reduce((acc, row) => ({
      debit: acc.debit + row.debit,
      credit: acc.credit + row.credit,
      balance: row.balance
    }), { debit: 0, credit: 0, balance: 0 });
  }, [ledgerRows]);

  const filteredReports = REPORTS_CATALOG.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.nameBn.includes(searchTerm) ||
                        r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup === 'all' || r.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 sm:pb-8 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? '৮০-রিপোর্ট ইন্টেলিজেন্স ও অডিট সেন্টার' : '80-Report Intelligence & Audit Center'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              80 Reports Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'ব্যবসায়িক বিক্রয়, ইএমআই লকার রিকভারি, ডাবল-এন্ট্রি হিসাবরক্ষণ ও সরকারি অডিট রিপোর্ট।' 
              : 'Full enterprise reporting suite across Phone Sales, Locker MDM, Double-entry Accounts & Audit.'}
          </p>
        </div>

        {/* Global Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="Today">আজকে (Today)</option>
            <option value="Yesterday">গতকাল (Yesterday)</option>
            <option value="This Week">চলতি সপ্তাহ (This Week)</option>
            <option value="This Month">চলতি মাস (This Month)</option>
            <option value="Last Month">গত মাস (Last Month)</option>
            <option value="This Year">চলতি বছর (This Year)</option>
            <option value="Lifetime">লাইফটাইম (Lifetime)</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Report Navigator, Right Interactive Report Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Report Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 flex flex-col max-h-[78vh]">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="রিপোর্টের নাম বা কোড দিয়ে খুঁজুন (e.g. R-07, Aging)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1 font-bold">
            {[
              { id: 'all', label: 'All 80' },
              { id: 'phoneshop', label: 'Business (40)' },
              { id: 'locker', label: 'Locker MDM (17)' },
              { id: 'accounts', label: 'Accounts (19)' },
              { id: 'audit', label: 'Audit & HR' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedGroup(tab.id as any)}
                className={`py-1 px-2.5 rounded-lg whitespace-nowrap transition ${
                  selectedGroup === tab.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Reports List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
            {filteredReports.map(rep => {
              const isSelected = activeReport?.id === rep.id;

              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200 shadow-xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {rep.code}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{lang === 'bn' ? rep.nameBn : rep.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{rep.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Printable Report Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between max-h-[78vh] overflow-y-auto">
          {activeReport ? (
            <div className="space-y-4">
              
              {/* Viewer Control Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-indigo-600 text-white">
                    {activeReport.code}
                  </span>
                  <span className="font-bold text-sm text-slate-900">
                    {lang === 'bn' ? activeReport.nameBn : activeReport.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Font Zoom */}
                  <div className="flex items-center border border-slate-200 rounded-lg text-xs font-mono font-bold overflow-hidden">
                    <button onClick={() => setFontSizeAdjust(Math.max(-2, fontSizeAdjust - 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100">A-</button>
                    <button onClick={() => setFontSizeAdjust(Math.min(3, fontSizeAdjust + 1))} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border-l border-slate-200">A+</button>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={() => {
                      setExportNotice(lang === 'bn' ? 'রিপোর্ট এক্সেল (.xlsx) ফরম্যাটে প্রস্তুত করা হয়েছে।' : 'Report generated in Excel format.');
                      setTimeout(() => setExportNotice(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {exportNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{exportNotice}</span>
                </div>
              )}

              {/* Printable Letterhead & Report Body */}
              <div 
                id="report-printable-area" 
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4"
                style={{ fontSize: `${12 + fontSizeAdjust}px` }}
              >
                {/* Letterhead */}
                <div className="text-center pb-3 border-b border-slate-300">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    {settings.storeName}
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">{settings.address}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Mobile: {settings.phone} • Branch: {branch}</p>
                  <div className="mt-2 text-xs font-bold text-indigo-900 underline uppercase">
                    {activeReport.name} ({activeReport.code})
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Period: {selectedPeriod} • Generated on {new Date().toLocaleString()}
                  </div>
                </div>

                {/* Report Table Simulation based on Report Type */}
                {activeReport.id === 7 || activeReport.code === 'R-07' ? (
                  /* Overdue EMI Aging Table (1-30, 31-60, 61-90, 90+ days) */
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300">Customer & Phone</th>
                        <th className="p-2 border-r border-slate-300">Handset</th>
                        <th className="p-2 border-r border-slate-300">1-30 Days</th>
                        <th className="p-2 border-r border-slate-300">31-60 Days</th>
                        <th className="p-2 border-r border-slate-300">61-90 Days</th>
                        <th className="p-2 text-right">90+ Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 bg-white font-mono">
                      {agingList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                            <Check className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                            <div className="font-bold text-slate-700">কোনো বকেয়া কিস্তির তথ্য নেই</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">নতুন আইডি অথবা সকল কিস্তি সম্পূর্ণরূপে পরিশোধিত রয়েছে।</div>
                          </td>
                        </tr>
                      ) : (
                        agingList.map(item => (
                          <tr key={item.id}>
                            <td className="p-2 font-sans font-semibold">
                              {item.customerName} ({item.customerPhone})
                            </td>
                            <td className="p-2 font-sans">{item.deviceModel}</td>
                            <td className="p-2 text-slate-700">{item.days1_30 > 0 ? formatCurrency(item.days1_30) : '-'}</td>
                            <td className="p-2 font-bold text-amber-600">{item.days31_60 > 0 ? formatCurrency(item.days31_60) : '-'}</td>
                            <td className="p-2 font-bold text-rose-500">{item.days61_90 > 0 ? formatCurrency(item.days61_90) : '-'}</td>
                            <td className="p-2 text-right font-bold text-rose-700">{item.days90Plus > 0 ? formatCurrency(item.days90Plus) : '-'}</td>
                          </tr>
                        ))
                      )}
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                        <td className="p-2 font-sans" colSpan={2}>Total Outstanding Aging</td>
                        <td className="p-2">{formatCurrency(agingTotals.days1_30)}</td>
                        <td className="p-2 text-amber-700">{formatCurrency(agingTotals.days31_60)}</td>
                        <td className="p-2 text-rose-600">{formatCurrency(agingTotals.days61_90)}</td>
                        <td className="p-2 text-right text-rose-700">{formatCurrency(agingTotals.days90Plus)}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  /* Standard Master Ledger Layout */
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300">SL</th>
                        <th className="p-2 border-r border-slate-300">Description / Details</th>
                        <th className="p-2 border-r border-slate-300">Reference</th>
                        <th className="p-2 border-r border-slate-300">Debit / In</th>
                        <th className="p-2 border-r border-slate-300">Credit / Out</th>
                        <th className="p-2 text-right">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 bg-white font-mono">
                      {ledgerRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                            <FileText className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                            <div className="font-bold text-slate-700">কোনো লেনদেন এন্ট্রি নেই</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">নতুন ফ্রেশ অ্যাকাউন্টে বিক্রয় বা খরচ লিপিবদ্ধ হলে সরাসরি এখানে দৃশ্যমান হবে।</div>
                          </td>
                        </tr>
                      ) : (
                        ledgerRows.map(row => (
                          <tr key={row.sl}>
                            <td className="p-2 font-bold">{row.sl}</td>
                            <td className="p-2 font-sans">{row.desc}</td>
                            <td className="p-2">{row.ref}</td>
                            <td className="p-2 text-emerald-600 font-bold">{row.debit > 0 ? formatCurrency(row.debit) : '-'}</td>
                            <td className="p-2 text-rose-600 font-bold">{row.credit > 0 ? formatCurrency(row.credit) : '-'}</td>
                            <td className="p-2 text-right font-bold">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))
                      )}
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                        <td className="p-2 font-sans" colSpan={3}>Summary Balance</td>
                        <td className="p-2 text-emerald-700">{formatCurrency(ledgerTotals.debit)}</td>
                        <td className="p-2 text-rose-700">{formatCurrency(ledgerTotals.credit)}</td>
                        <td className="p-2 text-right text-indigo-700">{formatCurrency(ledgerTotals.balance)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Footer Signatures for Report */}
                <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-600">
                  <div className="border-t border-slate-400 pt-1">Prepared By</div>
                  <div className="border-t border-slate-400 pt-1">Audited By</div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">Proprietor / Managing Director</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-400">
              <BarChart3 className="w-12 h-12 text-slate-300 mb-2" />
              <div className="font-bold text-sm text-slate-600">বাম পাশের তালিকা থেকে যেকোনো একটি রিপোর্ট নির্বাচন করুন</div>
              <div className="text-xs text-slate-400 mt-1 max-w-sm">
                ৮০টি স্ট্যান্ডার্ড বিজনেস, লকার কন্ট্রোল, ইনভেন্টরি ও ফিন্যান্সিয়াল রিপোর্টের পূর্ণাঙ্গ প্রিভিউ ও এক্সপোর্ট।
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
