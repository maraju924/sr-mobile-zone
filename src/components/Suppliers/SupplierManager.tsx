import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Building2, 
  DollarSign, 
  FileText, 
  ArrowDownLeft, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Printer, 
  Download,
  PackagePlus,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, Purchase, PurchaseItem } from '../../types';

export const SupplierManager: React.FC = () => {
  const { 
    suppliers, 
    purchases, 
    products, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier, 
    recordSupplierPayment, 
    addPurchase, 
    formatCurrency, 
    exportToCsv,
    t 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'purchases' | 'new_purchase'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');

  // Pay Supplier Modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [payNote, setPayNote] = useState('');

  // New Purchase Form State
  const [purChallan, setPurChallan] = useState('');
  const [purSupplierId, setPurSupplierId] = useState('');
  const [purDate, setPurDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [purItems, setPurItems] = useState<PurchaseItem[]>([]);
  const [purAdditionalCost, setPurAdditionalCost] = useState<number>(0);
  const [purDiscount, setPurDiscount] = useState<number>(0);
  const [purPaidAmount, setPurPaidAmount] = useState<number>(0);
  const [purMethod, setPurMethod] = useState<Purchase['paymentMethod']>('bank');
  const [purNote, setPurNote] = useState('');

  // Item selector inside purchase form
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemCost, setItemCost] = useState<number>(0);

  // Selected Purchase for details modal
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  // Total Supplier Debt KPI
  const totalSupplierDue = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.balanceDue, 0);
  }, [suppliers]);

  const totalPurchaseValue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.total, 0);
  }, [purchases]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    });
  }, [suppliers, searchQuery]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.challanNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.items.some(i => i.productName.toLowerCase().includes(q))
      );
    });
  }, [purchases, searchQuery]);

  // Open Supplier Form
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupName(s.name);
    setSupCompany(s.companyName);
    setSupPhone(s.phone);
    setSupEmail(s.email || '');
    setSupAddress(s.address);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      alert(t('সাপ্লায়ারের নাম ও মোবাইল নম্বর প্রদান করুন!', 'Please enter supplier name and phone!'));
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: supName.trim(),
        companyName: supCompany.trim() || supName.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim()
      });
    } else {
      addSupplier({
        name: supName.trim(),
        companyName: supCompany.trim() || supName.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim()
      });
    }
    setIsSupplierModalOpen(false);
  };

  // Open Pay Supplier Modal
  const handleOpenPay = (s: Supplier) => {
    setPayingSupplier(s);
    setPayAmount(s.balanceDue);
    setPayMethod('cash');
    setPayNote('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || payAmount <= 0) return;

    recordSupplierPayment(payingSupplier.id, payAmount, payMethod, payNote);
    alert(t('সাপ্লায়ারকে পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে!', 'Supplier payment successfully recorded!'));
    setPayingSupplier(null);
  };

  // Add Item to Purchase Draft
  const handleAddItemToPurchase = () => {
    if (!selectedProdId) {
      alert(t('অনুগ্রহ করে পণ্য নির্বাচন করুন!', 'Please select a product!'));
      return;
    }
    const product = products.find(p => p.id === selectedProdId);
    if (!product) return;

    const existingIdx = purItems.findIndex(i => i.productId === selectedProdId);
    if (existingIdx >= 0) {
      const updated = [...purItems];
      updated[existingIdx].quantity += itemQty;
      updated[existingIdx].unitCost = itemCost > 0 ? itemCost : updated[existingIdx].unitCost;
      updated[existingIdx].totalCost = updated[existingIdx].quantity * updated[existingIdx].unitCost;
      setPurItems(updated);
    } else {
      const cost = itemCost > 0 ? itemCost : product.purchasePrice;
      const newItem: PurchaseItem = {
        productId: product.id,
        productName: product.name,
        quantity: itemQty,
        unitCost: cost,
        totalCost: itemQty * cost
      };
      setPurItems([...purItems, newItem]);
    }

    setSelectedProdId('');
    setItemQty(1);
    setItemCost(0);
  };

  const handleRemovePurchaseItem = (index: number) => {
    setPurItems(purItems.filter((_, i) => i !== index));
  };

  // Calculations for purchase draft
  const draftSubtotal = purItems.reduce((sum, i) => sum + i.totalCost, 0);
  const draftTotal = Math.max(0, draftSubtotal + (Number(purAdditionalCost) || 0) - (Number(purDiscount) || 0));
  const draftDue = Math.max(0, draftTotal - (Number(purPaidAmount) || 0));

  // Save Complete Purchase
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purSupplierId) {
      alert(t('সাপ্লায়ার নির্বাচন করুন!', 'Please select a supplier!'));
      return;
    }
    if (purItems.length === 0) {
      alert(t('অন্তত একটি পণ্য যুক্ত করুন!', 'Please add at least one product!'));
      return;
    }

    const challan = purChallan.trim() || `CHAL-${Date.now().toString().slice(-6)}`;

    addPurchase({
      challanNumber: challan,
      supplierId: purSupplierId,
      items: purItems,
      additionalCost: Number(purAdditionalCost) || 0,
      discount: Number(purDiscount) || 0,
      paidAmount: Number(purPaidAmount) || 0,
      paymentMethod: purMethod,
      note: purNote.trim(),
      purchaseDate: purDate
    });

    alert(t('নতুন স্টক ক্রয় সফলভাবে সম্পন্ন হয়েছে এবং ইনভেন্টরিতে স্টক যোগ হয়েছে!', 'Stock purchase saved and inventory stock updated!'));
    
    // Reset Form
    setPurChallan('');
    setPurSupplierId('');
    setPurItems([]);
    setPurAdditionalCost(0);
    setPurDiscount(0);
    setPurPaidAmount(0);
    setPurNote('');
    setActiveSubTab('purchases');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              {t('সাপ্লায়ার ও স্টক ক্রয় ব্যবস্থাপনা', 'Suppliers & Stock Purchase')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('ডিলার ও সরবরাহকারী তালিকা, পণ্য স্টক-ইন এবং বকেয়া হিসাব', 'Manage suppliers, stock purchase orders & supplier payable ledgers')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'suppliers' && (
              <button
                onClick={handleOpenAddSupplier}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('নতুন সাপ্লায়ার যোগ', 'Add Supplier')}</span>
              </button>
            )}
            {activeSubTab === 'purchases' && (
              <button
                onClick={() => setActiveSubTab('new_purchase')}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{t('পণ্য স্টক-ইন (ক্রয় এন্ট্রি)', 'New Purchase Entry')}</span>
              </button>
            )}
            <button
              onClick={() => exportToCsv(activeSubTab === 'suppliers' ? suppliers : purchases, activeSubTab === 'suppliers' ? 'Suppliers' : 'Purchases')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('এক্সপোর্ট', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* KPI Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">{t('মোট নিবন্ধিত সাপ্লায়ার', 'Total Suppliers')}</span>
              <span className="text-base font-bold text-slate-900">{suppliers.length} টি প্রতিষ্ঠান</span>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-rose-700 font-medium block">{t('সাপ্লায়ারদের মোট বকেয়া দেনা', 'Total Supplier Payable Due')}</span>
              <span className="text-base font-bold text-rose-700 font-mono">{formatCurrency(totalSupplierDue)}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-medium block">{t('সর্বমোট স্টক ক্রয় ভ্যালু', 'Total Stock Purchases')}</span>
              <span className="text-base font-bold text-emerald-700 font-mono">{formatCurrency(totalPurchaseValue)}</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'suppliers'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('সাপ্লায়ার তালিকা', 'Suppliers List')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'purchases'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('ক্রয় চালান ও স্টক-ইন মেমো', 'Purchase Invoices')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('new_purchase')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'new_purchase'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>{t('+ নতুন পারচেজ এন্ট্রি', '+ New Stock In')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        
        {/* TAB 1: SUPPLIERS LIST */}
        {activeSubTab === 'suppliers' && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('কোম্পানি, নাম বা ফোন নম্বর দিয়ে খুঁজুন...', 'Search suppliers by name, company or phone...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                  {t('কোনো সাপ্লায়ার পাওয়া যায়নি', 'No suppliers found')}
                </div>
              ) : (
                filteredSuppliers.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{s.companyName}</h3>
                          <span className="text-xs text-slate-600 font-medium">{s.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.balanceDue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {s.balanceDue > 0 ? t('বকেয়া আছে', 'Has Due') : t('পরিশোধিত', 'Cleared')}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{s.phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{s.address}</p>
                      </div>

                      {/* Amounts */}
                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t('মোট ক্রয়', 'Total Purchased')}</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(s.totalPurchased)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 block font-semibold">{t('বর্তমান দেনা', 'Balance Due')}</span>
                          <span className="font-mono font-bold text-rose-600">{formatCurrency(s.balanceDue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSupplier(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title={t('এডিট করুন', 'Edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('আপনি কি এই সাপ্লায়ারকে মুছে ফেলতে চান?', 'Delete this supplier?'))) {
                              deleteSupplier(s.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {s.balanceDue > 0 ? (
                        <button
                          onClick={() => handleOpenPay(s)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          {t('দেনা পরিশোধ', 'Pay Due')}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {t('হিসাব সমান', 'All Clear')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASES LIST */}
        {activeSubTab === 'purchases' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('চালান নম্বর, সাপ্লায়ার বা পণ্যের নাম দিয়ে খুঁজুন...', 'Search purchase orders by challan, supplier or product...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">{t('তারিখ', 'Date')}</th>
                      <th className="p-3">{t('চালান / মেমো #', 'Challan #')}</th>
                      <th className="p-3">{t('সাপ্লায়ার / কোম্পানি', 'Supplier')}</th>
                      <th className="p-3">{t('পণ্যের বিবরণ', 'Products')}</th>
                      <th className="p-3 text-right">{t('মোট মূল্য', 'Total')}</th>
                      <th className="p-3 text-right">{t('পরিশোধ', 'Paid')}</th>
                      <th className="p-3 text-right">{t('বকেয়া', 'Due')}</th>
                      <th className="p-3 text-center">{t('পদ্ধতি', 'Method')}</th>
                      <th className="p-3 text-right">{t('অ্যাকশন', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          {t('কোনো পারচেজ চালান পাওয়া যায়নি', 'No purchase orders found')}
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            {new Date(p.purchaseDate).toLocaleDateString('bn-BD')}
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-700">
                            {p.challanNumber}
                          </td>
                          <td className="p-3 font-medium text-slate-900">
                            {p.supplierName}
                          </td>
                          <td className="p-3 text-slate-700 max-w-[200px] truncate">
                            {p.items.map(i => `${i.productName} (${i.quantity} পিস)`).join(', ')}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(p.total)}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-600">
                            {formatCurrency(p.paidAmount)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600">
                            {formatCurrency(p.dueAmount)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setViewingPurchase(p)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            >
                              {t('চালান দেখুন', 'View')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NEW PURCHASE FORM */}
        {activeSubTab === 'new_purchase' && (
          <form onSubmit={handleSavePurchase} className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-600" />
                  {t('নতুন স্টক ক্রয় চালান এন্ট্রি (Stock In Entry)', 'Stock In Purchase Form')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('চালান সংরক্ষণ করার সাথে সাথে ইনভেন্টরিতে পণ্যের স্টক সংখ্যা স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে', 'Stock quantity will automatically update in inventory upon saving')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('purchases')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✕ {t('বন্ধ করুন', 'Close')}
              </button>
            </div>

            {/* Supplier & Challan Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('সাপ্লায়ার নির্বাচন করুন *', 'Select Supplier *')}
                </label>
                <select
                  required
                  value={purSupplierId}
                  onChange={(e) => setPurSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- {t('সাপ্লায়ার বেছে নিন', 'Choose Supplier')} --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.phone}) - দেনা: {s.balanceDue}৳
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('চালান / মেমো নম্বর', 'Challan / Memo No')}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: CHAL-9081"
                  value={purChallan}
                  onChange={(e) => setPurChallan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('ক্রয়ের তারিখ', 'Purchase Date')}
                </label>
                <input
                  type="date"
                  value={purDate}
                  onChange={(e) => setPurDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Product Item Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase block tracking-wider">
                {t('পণ্য যুক্ত করুন (স্টক-ইন আইটেম)', 'Add Items to Purchase')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                <div className="sm:col-span-6">
                  <label className="block text-slate-600 mb-1">{t('পণ্য বেছে নিন:', 'Select Product:')}</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedProdId(id);
                      const prod = products.find(p => p.id === id);
                      if (prod) setItemCost(prod.purchasePrice);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="">-- {t('পণ্য নির্বাচন করুন', 'Select Product')} --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (বর্তমান স্টক: {p.stock} পিস)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">{t('পরিমাণ (পিস):', 'Quantity:')}</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">{t('ক্রয়মূল্য (৳):', 'Unit Rate:')}</label>
                  <input
                    type="number"
                    min="0"
                    value={itemCost}
                    onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItemToPurchase}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    + {t('আইটেম যোগ', 'Add Item')}
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              {purItems.length > 0 && (
                <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <th className="p-2.5">পণ্য</th>
                        <th className="p-2.5 text-center">পরিমাণ</th>
                        <th className="p-2.5 text-right">একক রেট</th>
                        <th className="p-2.5 text-right">মোট</th>
                        <th className="p-2.5 text-center">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800">{item.productName}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-800">{item.quantity} পিস</td>
                          <td className="p-2.5 text-right font-mono">{formatCurrency(item.unitCost)}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalCost)}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePurchaseItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Financial Summary & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">{t('পেমেন্ট মাধ্যম:', 'Payment Mode:')}</label>
                  <select
                    value={purMethod}
                    onChange={(e) => setPurMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="bank">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                    <option value="cash">নগদ টাকা (Cash)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ ওয়ালেট (Nagad)</option>
                    <option value="due">সম্পূর্ণ বাকি (Full Due)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">{t('নোট / মন্তব্য (ঐচ্ছিক):', 'Notes:')}</label>
                  <textarea
                    rows={2}
                    value={purNote}
                    onChange={(e) => setPurNote(e.target.value)}
                    placeholder={t('পেমেন্ট শর্ত বা বিশেষ তথ্য...', 'Special terms, remarks...')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Bill Breakdown Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>{t('পণ্যের সাবটোটাল:', 'Items Subtotal:')}</span>
                  <span className="font-mono font-bold">{formatCurrency(draftSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>{t('পরিবহন / অতিরিক্ত খরচ (+):', 'Additional / Freight (+):')}</span>
                  <input
                    type="number"
                    min="0"
                    value={purAdditionalCost}
                    onChange={(e) => setPurAdditionalCost(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>{t('ছাড় / ডিসকাউন্ট (-):', 'Discount (-):')}</span>
                  <input
                    type="number"
                    min="0"
                    value={purDiscount}
                    onChange={(e) => setPurDiscount(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-mono"
                  />
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>{t('সর্বমোট প্রদেয় বিল:', 'Grand Total:')}</span>
                  <span className="font-mono text-indigo-700">{formatCurrency(draftTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-800 pt-1">
                  <span className="font-bold">{t('পরিশোধিত নগদ টাকা:', 'Paid Amount:')}</span>
                  <input
                    type="number"
                    min="0"
                    max={draftTotal}
                    value={purPaidAmount}
                    onChange={(e) => setPurPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-emerald-400 rounded-lg text-right font-mono font-bold text-emerald-700"
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600 border-t border-slate-200 pt-1">
                  <span>{t('সাপ্লায়ারের বকেয়া থাকবে:', 'Remaining Due to Supplier:')}</span>
                  <span className="font-mono">{formatCurrency(draftDue)}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubTab('purchases')}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition"
              >
                {t('ক্রয় নিশ্চিত করুন ও স্টক আপডেট করুন', 'Confirm Purchase & Update Stock')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {editingSupplier ? t('সাপ্লায়ার তথ্য সংশোধন', 'Edit Supplier') : t('নতুন সাপ্লায়ার নিবন্ধন', 'Register New Supplier')}
              </h4>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveSupplier} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('প্রতিষ্ঠানের নাম (Company / Brand) *', 'Company Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ওয়ালটন হাই-টেক বা স্যামসাং ডিস্ট্রিবিউশন"
                  value={supCompany}
                  onChange={(e) => setSupCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('যোগাযোগকারী ব্যক্তির নাম *', 'Contact Person Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('মোবাইল নম্বর *', 'Phone Number *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="০১৭০১-২৩৪৫৬৭"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t('ইমেইল ঠিকানা (ঐচ্ছিক):', 'Email Address (Optional):')}
                </label>
                <input
                  type="email"
                  placeholder="dealer@company.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t('ঠিকানা / ডিপো লোকেশন:', 'Address / Warehouse Location:')}
                </label>
                <textarea
                  rows={2}
                  placeholder="রোড, এলাকা ও শহরের নাম..."
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                >
                  {editingSupplier ? t('আপডেট করুন', 'Update') : t('সংরক্ষণ করুন', 'Save Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PAY SUPPLIER DUE */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {t('সাপ্লায়ার দেনা পরিশোধ ভাউচার', 'Supplier Payment Voucher')}
              </h4>
              <button onClick={() => setPayingSupplier(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>{t('সাপ্লায়ার:', 'Supplier:')}</span>
                  <span className="font-bold text-slate-900">{payingSupplier.companyName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('যোগাযোগ:', 'Contact:')}</span>
                  <span className="font-mono">{payingSupplier.phone}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 pt-1 mt-1">
                  <span>{t('বর্তমান দেনা:', 'Current Due:')}</span>
                  <span className="font-mono">{formatCurrency(payingSupplier.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('প্রদেয় টাকার পরিমাণ (৳):', 'Payment Amount:')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={payingSupplier.balanceDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t('পেমেন্ট মাধ্যম:', 'Payment Mode:')}
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800"
                >
                  <option value="cash">নগদ ক্যাশ (Cash)</option>
                  <option value="bank">ব্যাংক একাউন্ট (Bank Transfer)</option>
                  <option value="bkash">বিকাশ / নগদ (bKash/Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t('রেফারেন্স / নোট:', 'Reference / Note:')}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: চেক নম্বর বা বিকাশ ট্রানজাকশন আইডি"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100"
                >
                  {t('পেমেন্ট নিশ্চিত করুন', 'Confirm Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW PURCHASE ORDER DETAILS */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {t('ক্রয় চালান ও স্টক-ইন বিবরণী', 'Purchase Invoice Details')}
              </h4>
              <button onClick={() => setViewingPurchase(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">চালান নম্বর:</span>
                  <span className="font-mono font-bold text-indigo-700">{viewingPurchase.challanNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">তারিখ:</span>
                  <span className="font-mono">{new Date(viewingPurchase.purchaseDate).toLocaleDateString('bn-BD')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">সাপ্লায়ার:</span>
                  <span className="font-bold text-slate-900">{viewingPurchase.supplierName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">পদ্ধতি:</span>
                  <span className="font-bold uppercase text-slate-800">{viewingPurchase.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="p-2">পণ্য</th>
                      <th className="p-2 text-center">পরিমাণ</th>
                      <th className="p-2 text-right">একক রেট</th>
                      <th className="p-2 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingPurchase.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{item.productName}</td>
                        <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(item.unitCost)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatCurrency(item.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financials */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-mono">{formatCurrency(viewingPurchase.subtotal)}</span>
                </div>
                {viewingPurchase.additionalCost ? (
                  <div className="flex justify-between text-slate-600">
                    <span>অতিরিক্ত খরচ:</span>
                    <span className="font-mono">+{formatCurrency(viewingPurchase.additionalCost)}</span>
                  </div>
                ) : null}
                {viewingPurchase.discount ? (
                  <div className="flex justify-between text-slate-600">
                    <span>ছাড়:</span>
                    <span className="font-mono">-{formatCurrency(viewingPurchase.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                  <span>সর্বমোট বিল:</span>
                  <span className="font-mono">{formatCurrency(viewingPurchase.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>পরিশোধ:</span>
                  <span className="font-mono">{formatCurrency(viewingPurchase.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>বকেয়া:</span>
                  <span className="font-mono">{formatCurrency(viewingPurchase.dueAmount)}</span>
                </div>
              </div>

              {viewingPurchase.note && (
                <p className="text-[11px] text-slate-500 italic">নোট: {viewingPurchase.note}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
