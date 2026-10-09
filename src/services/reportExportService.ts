import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { Product, Sale, Installment, StoreSettings } from '../types';

export type ReportType = 'daily_sales' | 'inventory_summary' | 'customer_dues';

export interface DailySalesFilter {
  date: string; // YYYY-MM-DD
  endDate?: string; // Optional for range
  paymentMethod: string; // 'all' or specific
}

export interface InventoryFilter {
  category: string; // 'all' or specific
  brand: string; // 'all' or specific
  stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CustomerDuesFilter {
  status: 'all' | 'overdue' | 'active_due';
  minDue?: number;
}

// --------------------------------------------------------------------------
// BENGALI TRANSLATION HELPERS
// --------------------------------------------------------------------------

export function translatePaymentMethod(method: string): string {
  switch ((method || '').toLowerCase()) {
    case 'cash': return 'নগদ (Cash)';
    case 'bkash': return 'বিকাশ (bKash)';
    case 'nagad': return 'নগদ (Nagad)';
    case 'card': return 'কার্ড (Card)';
    case 'installment': return 'কিস্তি (EMI)';
    case 'due': return 'বাকি (Due)';
    case 'bank': return 'ব্যাংক (Bank)';
    default: return method || '-';
  }
}

export function translatePaymentStatus(status: string): string {
  switch ((status || '').toLowerCase()) {
    case 'paid': return 'পরিশোধিত (Paid)';
    case 'partial': return 'আংশিক (Partial)';
    case 'due': return 'বকেয়া (Due)';
    default: return status || '-';
  }
}

export function translateStockStatus(status: string): string {
  switch (status) {
    case 'In Stock': return 'স্টকে আছে (In Stock)';
    case 'Low Stock': return 'লো-স্টক সতর্কতা (Low Stock)';
    case 'Out of Stock': return 'স্টক শেষ (Out of Stock)';
    default: return status || '-';
  }
}

export function translateDueRiskStatus(status: string): string {
  switch (status) {
    case 'Regular Due': return 'নিয়মিত বাকি (Regular Due)';
    case 'Overdue EMI': return 'মেয়াদোত্তীর্ণ কিস্তি (Overdue EMI)';
    case 'High Risk Due': return 'উচ্চ ঝুঁকি বকেয়া (High Risk)';
    default: return status || '-';
  }
}

function formatTk(num: number): string {
  return '৳ ' + Math.round(num).toLocaleString('en-IN');
}

// --------------------------------------------------------------------------
// 1. DATA CALCULATORS & FORMATTERS
// --------------------------------------------------------------------------

export interface DailySalesReportData {
  reportTitle: string;
  periodText: string;
  generatedAt: string;
  summary: {
    totalTransactions: number;
    grossSales: number;
    totalDiscounts: number;
    totalTax: number;
    netSales: number;
    cogs: number;
    grossProfit: number;
    profitMarginPercent: number;
    cashCollected: number;
    digitalCollected: number;
    receivablesDue: number;
  };
  paymentBreakdown: { [method: string]: { count: number; total: number } };
  rows: Array<{
    invoiceNo: string;
    dateTime: string;
    customerName: string;
    customerPhone: string;
    itemsSummary: string;
    itemCount: number;
    grossTotal: number;
    discount: number;
    tax: number;
    netTotal: number;
    paidAmount: number;
    dueAmount: number;
    cogs: number;
    profit: number;
    paymentMethod: string;
    paymentMethodBn: string;
    paymentStatus: string;
    paymentStatusBn: string;
  }>;
}

export function buildDailySalesReport(
  sales: Sale[],
  filter: DailySalesFilter,
  settings: StoreSettings
): DailySalesReportData {
  const isRange = Boolean(filter.endDate && filter.endDate !== filter.date);
  
  const filtered = sales.filter(s => {
    const saleDate = s.createdAt.split('T')[0];
    if (isRange && filter.endDate) {
      if (saleDate < filter.date || saleDate > filter.endDate) return false;
    } else {
      if (saleDate !== filter.date) return false;
    }

    if (filter.paymentMethod !== 'all' && s.paymentMethod !== filter.paymentMethod) {
      return false;
    }

    return true;
  });

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let grossSales = 0;
  let totalDiscounts = 0;
  let totalTax = 0;
  let netSales = 0;
  let cogs = 0;
  let cashCollected = 0;
  let digitalCollected = 0;
  let receivablesDue = 0;

  const paymentBreakdown: { [method: string]: { count: number; total: number } } = {
    cash: { count: 0, total: 0 },
    bkash: { count: 0, total: 0 },
    nagad: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
    installment: { count: 0, total: 0 },
    due: { count: 0, total: 0 }
  };

  const rows = filtered.map(s => {
    const saleGross = s.subtotal;
    const saleNet = s.total;
    const saleCogs = s.items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const saleProfit = Math.max(0, saleNet - saleCogs);
    
    grossSales += saleGross;
    totalDiscounts += s.discount;
    totalTax += s.tax;
    netSales += saleNet;
    cogs += saleCogs;
    receivablesDue += s.dueAmount;

    if (s.paymentMethod === 'cash') {
      cashCollected += s.paidAmount;
    } else if (['bkash', 'nagad', 'card'].includes(s.paymentMethod)) {
      digitalCollected += s.paidAmount;
    } else {
      cashCollected += s.paidAmount;
    }

    const m = s.paymentMethod || 'cash';
    if (!paymentBreakdown[m]) paymentBreakdown[m] = { count: 0, total: 0 };
    paymentBreakdown[m].count += 1;
    paymentBreakdown[m].total += s.paidAmount;

    const itemsSummary = s.items.map(it => `${it.productName} (x${it.quantity})`).join(', ');
    const itemCount = s.items.reduce((acc, it) => acc + it.quantity, 0);

    const d = new Date(s.createdAt);
    const dateFormatted = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      invoiceNo: s.invoiceNumber,
      dateTime: dateFormatted,
      customerName: s.customerName || 'সাধারণ ক্রেতা',
      customerPhone: s.customerPhone || '-',
      itemsSummary,
      itemCount,
      grossTotal: saleGross,
      discount: s.discount,
      tax: s.tax,
      netTotal: saleNet,
      paidAmount: s.paidAmount,
      dueAmount: s.dueAmount,
      cogs: saleCogs,
      profit: saleProfit,
      paymentMethod: s.paymentMethod.toUpperCase(),
      paymentMethodBn: translatePaymentMethod(s.paymentMethod),
      paymentStatus: s.paymentStatus.toUpperCase(),
      paymentStatusBn: translatePaymentStatus(s.paymentStatus)
    };
  });

  const grossProfit = Math.max(0, netSales - cogs);
  const profitMarginPercent = netSales > 0 ? Math.round((grossProfit / netSales) * 100) : 0;

  const periodText = isRange 
    ? `${filter.date} হতে ${filter.endDate}`
    : filter.date;

  return {
    reportTitle: 'দৈনিক বিক্রয় ও রাজস্ব অডিট রিপোর্ট (Daily Sales & Revenue Report)',
    periodText,
    generatedAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
    summary: {
      totalTransactions: filtered.length,
      grossSales,
      totalDiscounts,
      totalTax,
      netSales,
      cogs,
      grossProfit,
      profitMarginPercent,
      cashCollected,
      digitalCollected,
      receivablesDue
    },
    paymentBreakdown,
    rows
  };
}

// --------------------------------------------------------------------------
// 2. INVENTORY SUMMARY REPORT BUILDER
// --------------------------------------------------------------------------

export interface InventorySummaryReportData {
  reportTitle: string;
  categoryFilter: string;
  brandFilter: string;
  stockStatusFilter: string;
  generatedAt: string;
  summary: {
    totalSKUs: number;
    totalStockUnits: number;
    totalValuationCost: number;
    totalValuationRetail: number;
    projectedGrossProfit: number;
    projectedMarginPercent: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  rows: Array<{
    barcode: string;
    productName: string;
    brand: string;
    category: string;
    stock: number;
    minAlert: number;
    costPrice: number;
    sellingPrice: number;
    totalCostValuation: number;
    totalRetailValuation: number;
    potentialProfit: number;
    marginPercent: number;
    warranty: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    statusBn: string;
  }>;
}

export function buildInventorySummaryReport(
  products: Product[],
  filter: InventoryFilter
): InventorySummaryReportData {
  const filtered = products.filter(p => {
    if (filter.category !== 'all' && p.category !== filter.category) return false;
    if (filter.brand !== 'all' && p.brand !== filter.brand) return false;

    if (filter.stockStatus === 'in_stock' && p.stock <= 0) return false;
    if (filter.stockStatus === 'low_stock' && (p.stock <= 0 || p.stock > p.minStockAlert)) return false;
    if (filter.stockStatus === 'out_of_stock' && p.stock > 0) return false;

    return true;
  });

  let totalStockUnits = 0;
  let totalValuationCost = 0;
  let totalValuationRetail = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const rows = filtered.map(p => {
    totalStockUnits += p.stock;
    const costVal = p.purchasePrice * p.stock;
    const retailVal = p.sellingPrice * p.stock;
    const potentialProfit = Math.max(0, retailVal - costVal);
    const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0;

    totalValuationCost += costVal;
    totalValuationRetail += retailVal;

    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (p.stock <= 0) {
      status = 'Out of Stock';
      outOfStockCount += 1;
    } else if (p.stock <= p.minStockAlert) {
      status = 'Low Stock';
      lowStockCount += 1;
    }

    return {
      barcode: p.barcode || '-',
      productName: p.name,
      brand: p.brand,
      category: p.category,
      stock: p.stock,
      minAlert: p.minStockAlert,
      costPrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      totalCostValuation: costVal,
      totalRetailValuation: retailVal,
      potentialProfit,
      marginPercent: margin,
      warranty: p.warrantyMonths ? `${p.warrantyMonths} মাস` : 'ওয়ারেন্টি নেই',
      status,
      statusBn: translateStockStatus(status)
    };
  });

  const projectedGrossProfit = Math.max(0, totalValuationRetail - totalValuationCost);
  const projectedMarginPercent = totalValuationRetail > 0 
    ? Math.round((projectedGrossProfit / totalValuationRetail) * 100) 
    : 0;

  return {
    reportTitle: 'ইনভেন্টরি স্টক ও সম্পদ মূল্যায়ন রিপোর্ট (Inventory Valuation Report)',
    categoryFilter: filter.category,
    brandFilter: filter.brand,
    stockStatusFilter: filter.stockStatus,
    generatedAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
    summary: {
      totalSKUs: filtered.length,
      totalStockUnits,
      totalValuationCost,
      totalValuationRetail,
      projectedGrossProfit,
      projectedMarginPercent,
      lowStockCount,
      outOfStockCount
    },
    rows
  };
}

// --------------------------------------------------------------------------
// 3. CUSTOMER DUES & ACCOUNTS RECEIVABLE REPORT BUILDER
// --------------------------------------------------------------------------

export interface CustomerDuesReportData {
  reportTitle: string;
  generatedAt: string;
  summary: {
    totalCustomersWithDue: number;
    totalAccountsReceivable: number;
    totalOverdueInstallmentsAmount: number;
    overdueInstallmentsCount: number;
    averageDuePerCustomer: number;
  };
  rows: Array<{
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalInvoices: number;
    totalBilled: number;
    totalPaid: number;
    totalDue: number;
    overdueAmount: number;
    overdueCount: number;
    lastPaymentDate: string;
    status: 'Regular Due' | 'Overdue EMI' | 'High Risk Due';
    statusBn: string;
  }>;
}

export function buildCustomerDuesReport(
  sales: Sale[],
  installments: Installment[],
  filter: CustomerDuesFilter
): CustomerDuesReportData {
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    address: string;
    totalInvoices: number;
    totalBilled: number;
    totalPaid: number;
    totalDue: number;
    overdueAmount: number;
    overdueCount: number;
    lastTransactionDate: string;
  }>();

  sales.forEach(s => {
    const key = (s.customerPhone && s.customerPhone !== '-') ? s.customerPhone : s.customerName.toLowerCase().trim();
    if (!key) return;

    const cur = customerMap.get(key) || {
      name: s.customerName || 'সাধারণ ক্রেতা',
      phone: s.customerPhone || '-',
      address: s.customerAddress || '-',
      totalInvoices: 0,
      totalBilled: 0,
      totalPaid: 0,
      totalDue: 0,
      overdueAmount: 0,
      overdueCount: 0,
      lastTransactionDate: s.createdAt
    };

    cur.totalInvoices += 1;
    cur.totalBilled += s.total;
    cur.totalPaid += s.paidAmount;
    cur.totalDue += s.dueAmount;
    if (s.customerAddress && cur.address === '-') cur.address = s.customerAddress;
    if (new Date(s.createdAt) > new Date(cur.lastTransactionDate)) {
      cur.lastTransactionDate = s.createdAt;
    }

    customerMap.set(key, cur);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  installments.forEach(inst => {
    const key = (inst.customerPhone && inst.customerPhone !== '-') ? inst.customerPhone : inst.customerName.toLowerCase().trim();
    if (!key) return;

    const overdueSchedules = inst.schedule.filter(sch => !sch.isPaid && sch.dueDate < todayStr);
    const overdueAmt = overdueSchedules.reduce((sum, sch) => sum + sch.amount, 0);

    const cur = customerMap.get(key);
    if (cur) {
      cur.overdueAmount += overdueAmt;
      cur.overdueCount += overdueSchedules.length;
    } else {
      customerMap.set(key, {
        name: inst.customerName,
        phone: inst.customerPhone,
        address: inst.customerAddress || '-',
        totalInvoices: 1,
        totalBilled: inst.totalAmount,
        totalPaid: inst.downPayment + inst.schedule.filter(s => s.isPaid).reduce((sum, s) => sum + s.amount, 0),
        totalDue: inst.remainingBalance,
        overdueAmount: overdueAmt,
        overdueCount: overdueSchedules.length,
        lastTransactionDate: inst.createdAt
      });
    }
  });

  let filtered = Array.from(customerMap.values()).filter(c => c.totalDue > 0);

  if (filter.status === 'overdue') {
    filtered = filtered.filter(c => c.overdueAmount > 0);
  }

  if (filter.minDue && filter.minDue > 0) {
    filtered = filtered.filter(c => c.totalDue >= filter.minDue!);
  }

  filtered.sort((a, b) => b.totalDue - a.totalDue);

  let totalAccountsReceivable = 0;
  let totalOverdueInstallmentsAmount = 0;
  let overdueInstallmentsCount = 0;

  const rows = filtered.map(c => {
    totalAccountsReceivable += c.totalDue;
    totalOverdueInstallmentsAmount += c.overdueAmount;
    overdueInstallmentsCount += c.overdueCount;

    let status: 'Regular Due' | 'Overdue EMI' | 'High Risk Due' = 'Regular Due';
    if (c.overdueCount > 0) {
      status = c.overdueCount >= 2 ? 'High Risk Due' : 'Overdue EMI';
    } else if (c.totalDue > 50000) {
      status = 'High Risk Due';
    }

    const d = new Date(c.lastTransactionDate);
    const lastPaid = isNaN(d.getTime()) ? '-' : d.toLocaleDateString('bn-BD');

    return {
      customerName: c.name,
      customerPhone: c.phone,
      customerAddress: c.address,
      totalInvoices: c.totalInvoices,
      totalBilled: c.totalBilled,
      totalPaid: c.totalPaid,
      totalDue: c.totalDue,
      overdueAmount: c.overdueAmount,
      overdueCount: c.overdueCount,
      lastPaymentDate: lastPaid,
      status,
      statusBn: translateDueRiskStatus(status)
    };
  });

  const averageDuePerCustomer = filtered.length > 0 
    ? Math.round(totalAccountsReceivable / filtered.length) 
    : 0;

  return {
    reportTitle: 'গ্রাহক বকেয়া ও কিস্তি রিসিভেবল খতিয়ান (Customer Dues Ledger)',
    generatedAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
    summary: {
      totalCustomersWithDue: filtered.length,
      totalAccountsReceivable,
      totalOverdueInstallmentsAmount,
      overdueInstallmentsCount,
      averageDuePerCustomer
    },
    rows
  };
}

// --------------------------------------------------------------------------
// 4. EXPORT UTILITIES: EXCEL (.XLSX) WITH FULL BENGALI SUPPORT
// --------------------------------------------------------------------------

export function exportDailySalesToExcel(report: DailySalesReportData, settings: StoreSettings) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    [settings.storeName.toUpperCase()],
    [`ঠিকানা: ${settings.address} | মোবাইল: ${settings.phone}`],
    ['দৈনিক বিক্রয় ও বাহ্যিক অ্যাকাউন্টিং রাজস্ব রিপোর্ট (Daily Sales & Revenue Report)'],
    [`রিপোর্ট সময়কাল: ${report.periodText} | প্রস্তুতের তারিখ ও সময়: ${report.generatedAt}`],
    ['সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin'],
    [],
    ['--- ফাইন্যান্সিয়াল অ্যাকাউন্টিং সামারি (Financial Accounting Summary) ---'],
    ['মোট সম্পন্ন বিক্রয় চালান সংখ্যা (Total Invoices)', report.summary.totalTransactions],
    ['মোট গ্রস বিক্রয় রাজস্ব (Gross Sales)', report.summary.grossSales],
    ['প্রদত্ত মোট ছাড় (Total Discounts)', report.summary.totalDiscounts],
    ['মোট নিট বিক্রয় বিল (Net Billed)', report.summary.netSales],
    ['বিক্রিত পণ্যের মোট ক্রয়মূল্য (COGS)', report.summary.cogs],
    ['প্রাক্কলিত মোট লাভ (Gross Profit)', report.summary.grossProfit],
    ['লাভ মার্জিন (Profit Margin %)', `${report.summary.profitMarginPercent}%`],
    ['নগদ আদায়কৃত টাকা (Cash Realized)', report.summary.cashCollected],
    ['ডিজিটাল/ব্যাংক আদায়কৃত টাকা (Digital Realized)', report.summary.digitalCollected],
    ['নতুন বকেয়া পাওনা যুক্ত (New Receivables/Dues)', report.summary.receivablesDue],
    [],
    ['--- বিস্তারিত বিক্রয় চালান তালিকা (Itemized Sales Transactions) ---']
  ];

  const tableHeaders = [
    'চালান নং (Invoice No)',
    'তারিখ ও সময় (Date & Time)',
    'গ্রাহকের নাম (Customer Name)',
    'মোবাইল (Phone)',
    'পণ্যের বিবরণ (Items Summary)',
    'আইটেম (Qty)',
    'গ্রস মূল্য (Gross Tk)',
    'ছাড় (Discount Tk)',
    'ভ্যাট/ট্যাক্স (Tax Tk)',
    'নিট বিল (Net Bill Tk)',
    'পরিশোধ (Paid Tk)',
    'বকেয়া (Due Tk)',
    'ক্রয়মূল্য (COGS Tk)',
    'লাভ (Profit Tk)',
    'পেমেন্ট মাধ্যম (Payment Method)',
    'অবস্থা (Status)'
  ];

  const tableRows = report.rows.map(r => [
    r.invoiceNo,
    r.dateTime,
    r.customerName,
    r.customerPhone,
    r.itemsSummary,
    r.itemCount,
    r.grossTotal,
    r.discount,
    r.tax,
    r.netTotal,
    r.paidAmount,
    r.dueAmount,
    r.cogs,
    r.profit,
    r.paymentMethodBn,
    r.paymentStatusBn
  ]);

  const wsData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 20 }, // Invoice
    { wch: 20 }, // Date
    { wch: 25 }, // Customer
    { wch: 16 }, // Phone
    { wch: 38 }, // Items
    { wch: 10 }, // Qty
    { wch: 16 }, // Gross
    { wch: 16 }, // Disc
    { wch: 14 }, // Tax
    { wch: 16 }, // Net
    { wch: 16 }, // Paid
    { wch: 16 }, // Due
    { wch: 16 }, // COGS
    { wch: 16 }, // Profit
    { wch: 20 }, // Method
    { wch: 16 }  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Sales_Report');
  const filename = `দৈনিক_বিক্রয়_রিপোর্ট_${report.periodText.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportInventorySummaryToExcel(report: InventorySummaryReportData, settings: StoreSettings) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    [settings.storeName.toUpperCase()],
    [`ঠিকানা: ${settings.address} | মোবাইল: ${settings.phone}`],
    ['ইনভেন্টরি স্টক ও ব্যবসায়িক সম্পদ মূল্যায়ন রিপোর্ট (Inventory Asset Valuation Report)'],
    [`ফিল্টার: ${report.stockStatusFilter.toUpperCase()} | প্রস্তুতের তারিখ ও সময়: ${report.generatedAt}`],
    ['সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin'],
    [],
    ['--- স্টক সম্পদ মূল্যায়ন সামারি (Stock Asset Valuation Summary) ---'],
    ['মোট সক্রিয় পণ্য মডেল (Total SKUs)', report.summary.totalSKUs],
    ['দোকানে বিদ্যমান মোট মজুদ ইউনিট (Physical Stock Units)', report.summary.totalStockUnits],
    ['ক্রয়মূল্যে মোট স্টক সম্পদ মূল্যায়ন (Valuation at Cost)', report.summary.totalValuationCost],
    ['বিক্রয়মূল্যে মোট সম্ভাব্য স্টক আয় (Valuation at Retail)', report.summary.totalValuationRetail],
    ['প্রত্যাশিত আনরিয়ালাইজড মোট লাভ (Projected Profit)', report.summary.projectedGrossProfit],
    ['প্রত্যাশিত গড় মুনাফা মার্জিন (Projected Margin %)', `${report.summary.projectedMarginPercent}%`],
    ['লো-স্টক সতর্কতায় থাকা আইটেম সংখ্যা (Low Stock)', report.summary.lowStockCount],
    ['স্টক শেষ হয়ে যাওয়া আইটেম সংখ্যা (Out of Stock)', report.summary.outOfStockCount],
    [],
    ['--- পণ্যের বিস্তারিত স্টক তালিকা (Product Stock Details) ---']
  ];

  const tableHeaders = [
    'বারকোড (Barcode)',
    'পণ্য ও মডেলের নাম (Product Name)',
    'ব্র্যান্ড (Brand)',
    'ক্যাটাগরি (Category)',
    'বর্তমান স্টক (Stock)',
    'সর্বনিম্ন সতর্কতা লেভেল (Min Alert)',
    'একক ক্রয়মূল্য (Cost Price Tk)',
    'একক বিক্রয়মূল্য (Retail Price Tk)',
    'মোট ক্রয় মূল্যায়ন সম্পদ (Total Cost Tk)',
    'মোট বিক্রয় মূল্যায়ন (Total Retail Tk)',
    'সম্ভাব্য লাভ (Est. Profit Tk)',
    'মার্জিন (Margin %)',
    'ওয়ারেন্টি (Warranty)',
    'স্টক অবস্থা (Stock Status)'
  ];

  const tableRows = report.rows.map(r => [
    r.barcode,
    r.productName,
    r.brand,
    r.category,
    r.stock,
    r.minAlert,
    r.costPrice,
    r.sellingPrice,
    r.totalCostValuation,
    r.totalRetailValuation,
    r.potentialProfit,
    `${r.marginPercent}%`,
    r.warranty,
    r.statusBn
  ]);

  const wsData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 18 }, // Barcode
    { wch: 32 }, // Name
    { wch: 16 }, // Brand
    { wch: 20 }, // Category
    { wch: 16 }, // Stock
    { wch: 16 }, // Min Alert
    { wch: 18 }, // Cost
    { wch: 18 }, // Retail
    { wch: 22 }, // Total Cost
    { wch: 22 }, // Total Retail
    { wch: 18 }, // Profit
    { wch: 14 }, // Margin
    { wch: 16 }, // Warranty
    { wch: 22 }  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Inventory_Valuation');
  const filename = `ইনভেন্টরি_স্টক_মূল্যায়ন_রিপোর্ট_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportCustomerDuesToExcel(report: CustomerDuesReportData, settings: StoreSettings) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    [settings.storeName.toUpperCase()],
    [`ঠিকানা: ${settings.address} | মোবাইল: ${settings.phone}`],
    ['গ্রাহক বকেয়া ও কিস্তি রিসিভেবল খতিয়ান রিপোর্ট (Customer Dues Ledger Report)'],
    [`প্রস্তুতের তারিখ ও সময়: ${report.generatedAt}`],
    ['সফটওয়্যার তৈরি করেছে: www.fb.com/9alamin'],
    [],
    ['--- দেনাদার পাওনা সামারি (Accounts Receivable Financial Summary) ---'],
    ['বকেয়া থাকা মোট গ্রাহক সংখ্যা (Total Customers with Due)', report.summary.totalCustomersWithDue],
    ['মোট বর্তমান আদায়যোগ্য পাওনা / বকেয়া (Total Receivables)', report.summary.totalAccountsReceivable],
    ['মেয়াদোত্তীর্ণ কিস্তি বকেয়ার পরিমাণ (Overdue EMI Arrears)', report.summary.totalOverdueInstallmentsAmount],
    ['মেয়াদোত্তীর্ণ হওয়া মোট কিস্তি সংখ্যা (Overdue EMI Count)', report.summary.overdueInstallmentsCount],
    ['গড় বকেয়া প্রতি গ্রাহক (Average Due per Customer)', report.summary.averageDuePerCustomer],
    [],
    ['--- গ্রাহকভিত্তিক বকেয়া ও দেনাদার খতিয়ান (Customer Dues Details) ---']
  ];

  const tableHeaders = [
    'গ্রাহকের নাম (Customer Name)',
    'মোবাইল নম্বর (Phone)',
    'ঠিকানা (Address)',
    'মোট চালান (Invoices)',
    'মোট ক্রয়কৃত বিল (Total Billed Tk)',
    'মোট পরিশোধিত (Total Paid Tk)',
    'বর্তমান মোট বকেয়া (Balance Due Tk)',
    'মেয়াদোত্তীর্ণ কিস্তি (Overdue EMI Tk)',
    'বিলম্বিত কিস্তি সংখ্যা (Overdue Count)',
    'শেষ পরিশোধের তারিখ (Last Payment Date)',
    'ঝুঁকি বিভাগ (Risk Category)'
  ];

  const tableRows = report.rows.map(r => [
    r.customerName,
    r.customerPhone,
    r.customerAddress,
    r.totalInvoices,
    r.totalBilled,
    r.totalPaid,
    r.totalDue,
    r.overdueAmount,
    r.overdueCount,
    r.lastPaymentDate,
    r.statusBn
  ]);

  const wsData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 25 }, // Name
    { wch: 18 }, // Phone
    { wch: 30 }, // Address
    { wch: 16 }, // Invoices
    { wch: 20 }, // Billed
    { wch: 20 }, // Paid
    { wch: 22 }, // Due
    { wch: 22 }, // Overdue
    { wch: 18 }, // Count
    { wch: 18 }, // Last Date
    { wch: 22 }  // Risk
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Customer_Dues');
  const filename = `গ্রাহক_বকেয়া_খতিয়ান_রিপোর্ট_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// --------------------------------------------------------------------------
// 5. EXPORT UTILITIES: CSV WITH UTF-8 BOM & BENGALI HEADERS
// --------------------------------------------------------------------------

function downloadCsv(csvContent: string, filename: string) {
  // \uFEFF ensures Microsoft Excel detects UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDailySalesToCsv(report: DailySalesReportData) {
  const headers = [
    'চালান নং (Invoice No)',
    'তারিখ ও সময় (Date Time)',
    'গ্রাহকের নাম (Customer Name)',
    'মোবাইল (Phone)',
    'পণ্যের বিবরণ (Items Summary)',
    'পরিমাণ (Qty)',
    'গ্রস মূল্য (Gross Total)',
    'ছাড় (Discount)',
    'ভ্যাট (Tax)',
    'নিট বিল (Net Total)',
    'পরিশোধ (Paid Amount)',
    'বকেয়া (Due Amount)',
    'ক্রয়মূল্য (COGS)',
    'লাভ (Profit)',
    'পেমেন্ট মাধ্যম (Payment Method)',
    'অবস্থা (Status)'
  ];

  const rows = report.rows.map(r => [
    `"${r.invoiceNo}"`,
    `"${r.dateTime}"`,
    `"${r.customerName.replace(/"/g, '""')}"`,
    `"${r.customerPhone}"`,
    `"${r.itemsSummary.replace(/"/g, '""')}"`,
    r.itemCount,
    r.grossTotal,
    r.discount,
    r.tax,
    r.netTotal,
    r.paidAmount,
    r.dueAmount,
    r.cogs,
    r.profit,
    `"${r.paymentMethodBn}"`,
    `"${r.paymentStatusBn}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `দৈনিক_বিক্রয়_${report.periodText.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}.csv`;
  downloadCsv(csvContent, filename);
}

export function exportInventorySummaryToCsv(report: InventorySummaryReportData) {
  const headers = [
    'বারকোড (Barcode)',
    'পণ্যের নাম (Product Name)',
    'ব্র্যান্ড (Brand)',
    'ক্যাটাগরি (Category)',
    'বর্তমান স্টক (Stock)',
    'সর্বনিম্ন অ্যালার্ট (Min Stock Alert)',
    'ক্রয়মূল্য (Cost Price)',
    'বিক্রয়মূল্য (Selling Price)',
    'মোট ক্রয় মূল্যায়ন (Total Cost Value)',
    'মোট বিক্রয় মূল্যায়ন (Total Retail Value)',
    'প্রত্যাশিত লাভ (Potential Profit)',
    'মার্জিন (Margin %)',
    'ওয়ারেন্টি (Warranty)',
    'অবস্থা (Status)'
  ];

  const rows = report.rows.map(r => [
    `"${r.barcode}"`,
    `"${r.productName.replace(/"/g, '""')}"`,
    `"${r.brand.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    r.stock,
    r.minAlert,
    r.costPrice,
    r.sellingPrice,
    r.totalCostValuation,
    r.totalRetailValuation,
    r.potentialProfit,
    `"${r.marginPercent}%"`,
    `"${r.warranty}"`,
    `"${r.statusBn}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `ইনভেন্টরি_স্টক_মূল্যায়ন_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(csvContent, filename);
}

export function exportCustomerDuesToCsv(report: CustomerDuesReportData) {
  const headers = [
    'গ্রাহকের নাম (Customer Name)',
    'মোবাইল (Phone)',
    'ঠিকানা (Address)',
    'মোট চালান (Total Invoices)',
    'মোট ক্রয় (Total Billed)',
    'মোট পরিশোধ (Total Paid)',
    'বর্তমান মোট বকেয়া (Current Due)',
    'মেয়াদোত্তীর্ণ কিস্তি (Overdue EMI)',
    'বিলম্বিত কিস্তি সংখ্যা (Overdue Count)',
    'শেষ পরিশোধ (Last Payment Date)',
    'ঝুঁকি বিভাগ (Risk Status)'
  ];

  const rows = report.rows.map(r => [
    `"${r.customerName.replace(/"/g, '""')}"`,
    `"${r.customerPhone}"`,
    `"${r.customerAddress.replace(/"/g, '""')}"`,
    r.totalInvoices,
    r.totalBilled,
    r.totalPaid,
    r.totalDue,
    r.overdueAmount,
    r.overdueCount,
    `"${r.lastPaymentDate}"`,
    `"${r.statusBn}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `গ্রাহক_বকেয়া_খতিয়ান_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(csvContent, filename);
}

// --------------------------------------------------------------------------
// 6. FORMAL HTML DOCUMENT GENERATORS FOR PRINT VIEW & BENGALI PDF
// --------------------------------------------------------------------------

const BENGALI_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
  * {
    box-sizing: border-box;
    font-family: 'Hind Siliguri', 'SolaimanLipi', 'Noto Sans Bengali', sans-serif !important;
  }
  body {
    margin: 0;
    padding: 24px;
    color: #1e293b;
    background: #ffffff;
    font-size: 11px;
    line-height: 1.4;
  }
  .header-box {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }
  .store-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    text-transform: uppercase;
  }
  .store-subtitle {
    font-size: 11px;
    color: #475569;
    margin: 3px 0 0;
  }
  .badge-box {
    text-align: right;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 12px;
  }
  .badge-tag {
    font-size: 9px;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
  }
  .badge-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    display: block;
    margin-top: 2px;
  }
  .badge-date {
    font-size: 10px;
    color: #64748b;
    display: block;
    margin-top: 2px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 14px;
  }
  .summary-item span {
    display: block;
  }
  .summary-label {
    font-size: 9px;
    color: #64748b;
    font-weight: 600;
  }
  .summary-value {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin-top: 2px;
  }
  .summary-value.primary { color: #4338ca; }
  .summary-value.success { color: #047857; }
  .summary-value.danger { color: #be123c; }
  .summary-value.warning { color: #b45309; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  thead {
    display: table-header-group;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    font-size: 10.5px;
    vertical-align: middle;
  }
  th {
    background-color: #f1f5f9;
    font-weight: 700;
    color: #0f172a;
    text-align: left;
  }
  th.text-right, td.text-right { text-align: right; }
  th.text-center, td.text-center { text-align: center; }
  tbody tr:nth-child(even) { background-color: #f8fafc; }

  .status-tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
  }
  .status-tag.success { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
  .status-tag.warning { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .status-tag.danger { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
  .status-tag.neutral { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }

  .signatures-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 48px;
    padding-top: 10px;
    page-break-inside: avoid;
  }
  .sign-line {
    border-top: 1px dashed #64748b;
    padding-top: 6px;
    text-align: center;
    font-weight: 600;
    font-size: 11px;
    color: #334155;
  }
  .sign-sub {
    display: block;
    font-size: 9px;
    color: #94a3b8;
    margin-top: 2px;
  }
  @media print {
    body { padding: 0; }
    @page { margin: 10mm; }
  }
`;

export function generateDailySalesHtml(report: DailySalesReportData, settings: StoreSettings): string {
  const rowsHtml = report.rows.map(r => `
    <tr>
      <td style="font-weight: 600;">${r.invoiceNo}</td>
      <td style="color: #64748b;">${r.dateTime}</td>
      <td><strong>${r.customerName}</strong><br/><small style="color: #64748b;">${r.customerPhone}</small></td>
      <td>${r.itemsSummary}</td>
      <td class="text-right" style="font-weight: 700;">${formatTk(r.netTotal)}</td>
      <td class="text-right" style="color: #047857; font-weight: 600;">${formatTk(r.paidAmount)}</td>
      <td class="text-right" style="color: ${r.dueAmount > 0 ? '#be123c' : '#64748b'}; font-weight: ${r.dueAmount > 0 ? '700' : 'normal'};">
        ${r.dueAmount > 0 ? formatTk(r.dueAmount) : '-'}
      </td>
      <td class="text-right" style="color: #4338ca; font-weight: 600;">${formatTk(r.profit)}</td>
      <td class="text-center"><span class="status-tag neutral">${r.paymentMethodBn}</span></td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8" />
      <title>দৈনিক বিক্রয় ও রাজস্ব রিপোর্ট - ${settings.storeName}</title>
      <style>${BENGALI_PRINT_CSS}</style>
    </head>
    <body>
      <div class="header-box">
        <div>
          <h1 class="store-title">${settings.storeName}</h1>
          <p class="store-subtitle">${settings.address} • ফোন: ${settings.phone}</p>
        </div>
        <div class="badge-box">
          <span class="badge-tag">অফিশিয়াল হিসাবরক্ষণ ভাউচার</span>
          <span class="badge-title">দৈনিক বিক্রয় ও রাজস্ব অডিট রিপোর্ট</span>
          <span class="badge-date">সময়কাল: ${report.periodText} | প্রস্তুত: ${report.generatedAt}</span>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">মোট বিক্রয় ইনভয়েস:</span>
          <span class="summary-value">${report.summary.totalTransactions} টি</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মোট নিট বিক্রয় (Net Sales):</span>
          <span class="summary-value primary">${formatTk(report.summary.netSales)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">বিক্রিত পণ্যের ক্রয়মূল্য (COGS):</span>
          <span class="summary-value">${formatTk(report.summary.cogs)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মোট প্রাক্কলিত লাভ (Margin):</span>
          <span class="summary-value success">${formatTk(report.summary.grossProfit)} (${report.summary.profitMarginPercent}%)</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মোট গ্রস বিক্রয়:</span>
          <span class="summary-value">${formatTk(report.summary.grossSales)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">প্রদত্ত মোট ছাড়:</span>
          <span class="summary-value warning">-${formatTk(report.summary.totalDiscounts)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">নগদ ও ডিজিটাল আদায়:</span>
          <span class="summary-value success">${formatTk(report.summary.cashCollected + report.summary.digitalCollected)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">নতুন বকেয়া পাওনা (Dues):</span>
          <span class="summary-value danger">${formatTk(report.summary.receivablesDue)}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>চালান নং</th>
            <th>তারিখ ও সময়</th>
            <th>গ্রাহক ও মোবাইল</th>
            <th>পণ্যের বিবরণ</th>
            <th class="text-right">মোট বিল</th>
            <th class="text-right">পরিশোধ</th>
            <th class="text-right">বকেয়া</th>
            <th class="text-right">লাভ</th>
            <th class="text-center">মাধ্যম</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 20px;">কোন বিক্রয় রেকর্ড পাওয়া যায়নি</td></tr>'}
        </tbody>
      </table>

      <div class="signatures-grid">
        <div class="sign-line">
          হিসাব প্রস্তুতকারী
          <span class="sign-sub">Prepared By Accountant</span>
        </div>
        <div class="sign-line">
          অভ্যন্তরীণ নিরীক্ষক
          <span class="sign-sub">Internal Auditor</span>
        </div>
        <div class="sign-line">
          ম্যানেজার / স্বত্বাধিকারী
          <span class="sign-sub">Authorized Store Signatory</span>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <span>ElectroPOS Enterprise অডিট ও অ্যাকাউন্টিং সিস্টেম</span>
        <span>সফটওয়্যার তৈরি করেছে: <strong style="color: #4338ca;">www.fb.com/9alamin</strong></span>
      </div>
    </body>
    </html>
  `;
}

export function generateInventorySummaryHtml(report: InventorySummaryReportData, settings: StoreSettings): string {
  const rowsHtml = report.rows.map(r => `
    <tr>
      <td style="font-weight: 600; color: #334155;">${r.barcode}</td>
      <td><strong>${r.productName}</strong><br/><small style="color: #64748b;">${r.brand}</small></td>
      <td>${r.category}</td>
      <td class="text-right" style="font-weight: 700;">${r.stock}</td>
      <td class="text-right">${formatTk(r.costPrice)}</td>
      <td class="text-right" style="font-weight: 600;">${formatTk(r.sellingPrice)}</td>
      <td class="text-right" style="color: #4338ca; font-weight: 700;">${formatTk(r.totalCostValuation)}</td>
      <td class="text-right" style="color: #047857; font-weight: 700;">${formatTk(r.totalRetailValuation)}</td>
      <td class="text-center">
        <span class="status-tag ${r.status === 'In Stock' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'}">
          ${r.statusBn}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8" />
      <title>ইনভেন্টরি স্টক ও সম্পদ মূল্যায়ন রিপোর্ট - ${settings.storeName}</title>
      <style>${BENGALI_PRINT_CSS}</style>
    </head>
    <body>
      <div class="header-box">
        <div>
          <h1 class="store-title">${settings.storeName}</h1>
          <p class="store-subtitle">${settings.address} • ফোন: ${settings.phone}</p>
        </div>
        <div class="badge-box">
          <span class="badge-tag">ব্যবসায়িক মজুদ সম্পদ মূল্যায়ন</span>
          <span class="badge-title">ইনভেন্টরি স্টক ও সম্পদ অডিট রিপোর্ট</span>
          <span class="badge-date">প্রস্তুত: ${report.generatedAt}</span>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">মোট সক্রিয় মডেল (SKUs):</span>
          <span class="summary-value">${report.summary.totalSKUs} টি</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">দোকানে মোট মজুদ ইউনিট:</span>
          <span class="summary-value">${report.summary.totalStockUnits} টি</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">ক্রয়মূল্যে মোট স্টক সম্পদ:</span>
          <span class="summary-value primary">${formatTk(report.summary.totalValuationCost)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">বিক্রয়মূল্যে সম্ভাব্য আয়:</span>
          <span class="summary-value success">${formatTk(report.summary.totalValuationRetail)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">প্রত্যাশিত মোট লাভ:</span>
          <span class="summary-value success">${formatTk(report.summary.projectedGrossProfit)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">প্রত্যাশিত লাভ মার্জিন:</span>
          <span class="summary-value">${report.summary.projectedMarginPercent}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">লো-স্টক সতর্কতায় থাকা আইটেম:</span>
          <span class="summary-value warning">${report.summary.lowStockCount} টি</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">স্টক শেষ পণ্য সংখ্যা:</span>
          <span class="summary-value danger">${report.summary.outOfStockCount} টি</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>বারকোড</th>
            <th>পণ্য ও মডেলের নাম</th>
            <th>ক্যাটাগরি</th>
            <th class="text-right">স্টক</th>
            <th class="text-right">একক ক্রয়মূল্য</th>
            <th class="text-right">একক বিক্রয়মূল্য</th>
            <th class="text-right">মোট ক্রয় সম্পদ মূল্য</th>
            <th class="text-right">মোট সম্ভাব্য বিক্রয় মূল্য</th>
            <th class="text-center">স্টক অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 20px;">কোন পণ্য রেকর্ড পাওয়া যায়নি</td></tr>'}
        </tbody>
      </table>

      <div class="signatures-grid">
        <div class="sign-line">
          ইনভেন্টরি ইনচার্জ
          <span class="sign-sub">Stock Manager</span>
        </div>
        <div class="sign-line">
          হিসাবরক্ষক
          <span class="sign-sub">Chief Accountant</span>
        </div>
        <div class="sign-line">
          ম্যানেজার / স্বত্বাধিকারী
          <span class="sign-sub">Authorized Store Signatory</span>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <span>ElectroPOS Enterprise স্টক ও ইনভেন্টরি অডিট সিস্টেম</span>
        <span>সফটওয়্যার তৈরি করেছে: <strong style="color: #4338ca;">www.fb.com/9alamin</strong></span>
      </div>
    </body>
    </html>
  `;
}

export function generateCustomerDuesHtml(report: CustomerDuesReportData, settings: StoreSettings): string {
  const rowsHtml = report.rows.map(r => `
    <tr>
      <td><strong>${r.customerName}</strong><br/><small style="color: #64748b;">${r.customerAddress}</small></td>
      <td style="font-weight: 600;">${r.customerPhone}</td>
      <td class="text-center">${r.totalInvoices}</td>
      <td class="text-right">${formatTk(r.totalBilled)}</td>
      <td class="text-right" style="color: #047857; font-weight: 600;">${formatTk(r.totalPaid)}</td>
      <td class="text-right" style="color: #be123c; font-weight: 700; font-size: 11.5px;">${formatTk(r.totalDue)}</td>
      <td class="text-right" style="color: ${r.overdueAmount > 0 ? '#b45309' : '#64748b'}; font-weight: ${r.overdueAmount > 0 ? '700' : 'normal'};">
        ${r.overdueAmount > 0 ? formatTk(r.overdueAmount) : '-'}
      </td>
      <td class="text-center" style="color: #64748b;">${r.lastPaymentDate}</td>
      <td class="text-center">
        <span class="status-tag ${r.status === 'High Risk Due' ? 'danger' : r.status === 'Overdue EMI' ? 'warning' : 'neutral'}">
          ${r.statusBn}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8" />
      <title>গ্রাহক বকেয়া ও বাকি খতিয়ান রিপোর্ট - ${settings.storeName}</title>
      <style>${BENGALI_PRINT_CSS}</style>
    </head>
    <body>
      <div class="header-box">
        <div>
          <h1 class="store-title">${settings.storeName}</h1>
          <p class="store-subtitle">${settings.address} • ফোন: ${settings.phone}</p>
        </div>
        <div class="badge-box">
          <span class="badge-tag">দেনাদার ও ঋণ বিবরণী খতিয়ান</span>
          <span class="badge-title">গ্রাহক বকেয়া ও কিস্তি রিসিভেবল রিপোর্ট</span>
          <span class="badge-date">প্রস্তুত: ${report.generatedAt}</span>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">বকেয়া থাকা মোট গ্রাহক:</span>
          <span class="summary-value">${report.summary.totalCustomersWithDue} জন</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মোট আদায়যোগ্য বাকি (AR):</span>
          <span class="summary-value danger">${formatTk(report.summary.totalAccountsReceivable)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মেয়াদোত্তীর্ণ কিস্তি বকেয়া:</span>
          <span class="summary-value warning">${formatTk(report.summary.totalOverdueInstallmentsAmount)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">বিলম্বিত কিস্তি সংখ্যা:</span>
          <span class="summary-value">${report.summary.overdueInstallmentsCount} টি</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">গড় বকেয়া প্রতি গ্রাহক:</span>
          <span class="summary-value">${formatTk(report.summary.averageDuePerCustomer)}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>গ্রাহকের নাম ও ঠিকানা</th>
            <th>মোবাইল নম্বর</th>
            <th class="text-center">চালান</th>
            <th class="text-right">মোট ক্রয়</th>
            <th class="text-right">মোট পরিশোধ</th>
            <th class="text-right">বর্তমান মোট বকেয়া</th>
            <th class="text-right">মেয়াদোত্তীর্ণ কিস্তি</th>
            <th class="text-center">শেষ পরিশোধ</th>
            <th class="text-center">ঝুঁকি বিভাগ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 20px;">কোন বকেয়া গ্রাহক রেকর্ড পাওয়া যায়নি</td></tr>'}
        </tbody>
      </table>

      <div class="signatures-grid">
        <div class="sign-line">
          বকেয়া আদায় কর্মকর্তা
          <span class="sign-sub">Credit & Collection Officer</span>
        </div>
        <div class="sign-line">
          হিসাবরক্ষক
          <span class="sign-sub">Chief Accountant</span>
        </div>
        <div class="sign-line">
          ম্যানেজার / স্বত্বাধিকারী
          <span class="sign-sub">Authorized Store Signatory</span>
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <span>ElectroPOS Enterprise ঋণ ও বাকি খতিয়ান সিস্টেম</span>
        <span>সফটওয়্যার তৈরি করেছে: <strong style="color: #4338ca;">www.fb.com/9alamin</strong></span>
      </div>
    </body>
    </html>
  `;
}

// --------------------------------------------------------------------------
// 7. PRINT UTILITY WITH 100% BENGALI FONT RENDERING (NO CUT-OFFS)
// --------------------------------------------------------------------------

export function printReportDocument(title: string, htmlContent: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    alert('প্রিন্ট উইন্ডো খুলতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for Bengali fonts to load before triggering print
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  };

  if ((doc as any).fonts && (doc as any).fonts.ready) {
    (doc as any).fonts.ready.then(() => {
      setTimeout(triggerPrint, 300);
    }).catch(triggerPrint);
  } else {
    setTimeout(triggerPrint, 600);
  }
}

// --------------------------------------------------------------------------
// 8. PDF DOWNLOAD WITH 100% BENGALI UNICODE (HTML2CANVAS + JSPDF)
// --------------------------------------------------------------------------

export async function downloadReportPdfWithBengali(
  htmlContent: string, 
  filename: string, 
  orientation: 'landscape' | 'portrait' = 'landscape'
) {
  // Create off-screen rendering element
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = orientation === 'landscape' ? '1120px' : '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Wait for fonts to be ready
    if ((document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready;
    }
    // Brief breather for layout rendering
    await new Promise(resolve => setTimeout(resolve, 250));

    // Capture with html2canvas at high DPI
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = orientation === 'landscape' ? 297 : 210;
    const pdfHeight = orientation === 'landscape' ? 210 : 297;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Remaining pages if long
    while (heightLeft > 5) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('PDF generation error:', err);
    // Fallback: trigger print dialog where user can save as PDF
    alert('ডাইরেক্ট PDF জেনারেটরে বিলম্ব হওয়ায় প্রিন্ট প্রিভিউ খোলা হচ্ছে। সেখান থেকে "Save as PDF" নির্বাচন করুন।');
    printReportDocument(filename, htmlContent);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// Convenient Export functions for each report
export async function exportDailySalesToPdf(report: DailySalesReportData, settings: StoreSettings) {
  const html = generateDailySalesHtml(report, settings);
  const filename = `দৈনিক_বিক্রয়_রিপোর্ট_${report.periodText.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}.pdf`;
  await downloadReportPdfWithBengali(html, filename, 'landscape');
}

export async function exportInventorySummaryToPdf(report: InventorySummaryReportData, settings: StoreSettings) {
  const html = generateInventorySummaryHtml(report, settings);
  const filename = `ইনভেন্টরি_স্টক_মূল্যায়ন_${new Date().toISOString().split('T')[0]}.pdf`;
  await downloadReportPdfWithBengali(html, filename, 'landscape');
}

export async function exportCustomerDuesToPdf(report: CustomerDuesReportData, settings: StoreSettings) {
  const html = generateCustomerDuesHtml(report, settings);
  const filename = `গ্রাহক_বকেয়া_খতিয়ান_${new Date().toISOString().split('T')[0]}.pdf`;
  await downloadReportPdfWithBengali(html, filename, 'portrait');
}
