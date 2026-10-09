import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Filter, 
  Download, 
  TrendingDown, 
  Layers, 
  Wallet, 
  Check, 
  X,
  CreditCard,
  Building,
  Coffee,
  Zap,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';

export const ExpenseManager: React.FC = () => {
  const { 
    expenses, 
    sales, 
    installments, 
    addExpense, 
    deleteExpense, 
    formatCurrency, 
    exportToCsv,
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('entertainment');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('cash');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Opening Cash Setting (Default 5000 or custom)
  const [openingCash, setOpeningCash] = useState<number>(() => {
    const saved = localStorage.getItem('electro_pos_opening_cash');
    return saved ? parseFloat(saved) : 5000;
  });

  const handleUpdateOpeningCash = (val: number) => {
    setOpeningCash(val);
    localStorage.setItem('electro_pos_opening_cash', val.toString());
  };

  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];

  // Cash Inflows for Today
  const todayCashSales = useMemo(() => {
    return sales
      .filter(s => s.createdAt.startsWith(todayStr))
      .filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.paidAmount, 0);
  }, [sales, todayStr]);

  // Cash Collections from Installments today
  const todayCashInstallments = useMemo(() => {
    let sum = 0;
    installments.forEach(inst => {
      inst.schedule.forEach(sch => {
        if (sch.isPaid && sch.paidDate && sch.paidDate.startsWith(todayStr)) {
          sum += sch.paidAmount || sch.amount;
        }
      });
    });
    return sum;
  }, [installments, todayStr]);

  // Cash Expenses Today
  const todayCashExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr)
      .filter(e => e.paymentMethod === 'cash')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  // All Expenses Today
  const todayTotalExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  // Month Total Expenses
  const currentMonthExpenses = useMemo(() => {
    const currentYearMonth = todayStr.slice(0, 7);
    return expenses
      .filter(e => e.date.startsWith(currentYearMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  // Expected Cash Drawer Balance
  const expectedCashInDrawer = openingCash + todayCashSales + todayCashInstallments - todayCashExpenses;

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        e.title.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [expenses, categoryFilter, searchQuery]);

  // Submit New Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert(t('খরচের বিবরণ ও সঠিক টাকার পরিমাণ প্রদান করুন!', 'Please enter expense title and valid amount!'));
      return;
    }

    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      paymentMethod,
      date,
      note: note.trim()
    });

    setIsAddModalOpen(false);
    setTitle('');
    setAmount(0);
    setNote('');
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'rent':
        return { label: 'দোকান ভাড়া', icon: Building, color: 'text-amber-700 bg-amber-100' };
      case 'electricity':
        return { label: 'বিদ্যুৎ ও ইউটিলিটি', icon: Zap, color: 'text-yellow-800 bg-yellow-100' };
      case 'salary':
        return { label: 'স্টাফের বেতন', icon: Briefcase, color: 'text-blue-800 bg-blue-100' };
      case 'entertainment':
        return { label: 'আপ্যায়ন ও নাস্তা', icon: Coffee, color: 'text-orange-800 bg-orange-100' };
      case 'transport':
        return { label: 'যাতায়াত ও পরিবহন', icon: Layers, color: 'text-purple-800 bg-purple-100' };
      case 'maintenance':
        return { label: 'মেরামত ও সার্ভিসিং', icon: Layers, color: 'text-teal-800 bg-teal-100' };
      case 'marketing':
        return { label: 'প্রচার ও বিজ্ঞাপন', icon: Layers, color: 'text-pink-800 bg-pink-100' };
      case 'other':
      default:
        return { label: 'অন্যান্য খরচ', icon: Receipt, color: 'text-slate-800 bg-slate-100' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              {t('দৈনিক দোকান খরচ ও ক্যাশ ড্রয়ার ট্র্যাকিং', 'Store Expenses & Cash Drawer')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('দোকানের প্রতিদিনের ব্যয় হিসাব, ক্যাশ-ইন/ক্যাশ-আউট এবং ড্রয়ার ব্যালেন্স মনিটরিং', 'Track daily store operating expenses, cash drawer inflows & outflows')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন খরচ এন্ট্রি', 'Add Expense')}</span>
            </button>
            <button
              onClick={() => exportToCsv(expenses, 'Store_Expenses')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('এক্সপোর্ট', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* CASH DRAWER CALCULATOR CARD */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {t('আজকের ক্যাশ ড্রয়ার হিসাব (Cash Drawer In/Out)', 'Today\'s Cash Drawer Balance')}
                </h3>
                <span className="text-[11px] text-slate-400">
                  তারিখ: {new Date().toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Editable Opening Cash */}
            <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400">{t('শুরুর ক্যাশ (Opening):', 'Opening Cash:')}</span>
              <input
                type="number"
                value={openingCash}
                onChange={(e) => handleUpdateOpeningCash(parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-right font-mono font-bold text-white text-xs"
              />
              <span>৳</span>
            </div>
          </div>

          {/* Equation Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">{t('শুরুর ক্যাশ (+)', 'Opening (+)')}</span>
              <span className="font-mono font-bold text-sm text-slate-200">{formatCurrency(openingCash)}</span>
            </div>
            <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block">{t('আজকের নগদ বিক্রি (+)', 'Cash Sales (+)')}</span>
              <span className="font-mono font-bold text-sm text-emerald-300">{formatCurrency(todayCashSales)}</span>
            </div>
            <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20">
              <span className="text-[10px] text-purple-400 block">{t('নগদ কিস্তি আদায় (+)', 'Cash EMI In (+)')}</span>
              <span className="font-mono font-bold text-sm text-purple-300">{formatCurrency(todayCashInstallments)}</span>
            </div>
            <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
              <span className="text-[10px] text-rose-400 block">{t('আজকের নগদ খরচ (-)', 'Cash Out (-)')}</span>
              <span className="font-mono font-bold text-sm text-rose-300">{formatCurrency(todayCashExpenses)}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-indigo-600/30 p-2.5 rounded-xl border border-indigo-500/40 flex flex-col justify-center">
              <span className="text-[10px] text-indigo-300 font-bold block">{t('ড্রয়ারে থাকার কথা (=)', 'Expected in Drawer (=)')}</span>
              <span className="font-mono font-black text-base text-emerald-400">{formatCurrency(expectedCashInDrawer)}</span>
            </div>
          </div>
        </div>

        {/* Expense Category Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['all', 'rent', 'electricity', 'salary', 'entertainment', 'transport', 'other'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' && 'সকল খরচ'}
                {cat === 'rent' && 'দোকান ভাড়া'}
                {cat === 'electricity' && 'বিদ্যুৎ বিল'}
                {cat === 'salary' && 'স্টাফ বেতন'}
                {cat === 'entertainment' && 'আপ্যায়ন'}
                {cat === 'transport' && 'যাতায়াত'}
                {cat === 'other' && 'অন্যান্য'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('খরচের নাম বা বিবরণ খুঁজুন...', 'Search expenses...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <th className="p-3">{t('তারিখ', 'Date')}</th>
                <th className="p-3">{t('খরচের নাম ও বিবরণ', 'Title & Purpose')}</th>
                <th className="p-3">{t('ক্যাটাগরি', 'Category')}</th>
                <th className="p-3 text-right">{t('টাকার পরিমাণ', 'Amount')}</th>
                <th className="p-3 text-center">{t('পদ্ধতি', 'Mode')}</th>
                <th className="p-3 text-right">{t('মুছুন', 'Delete')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {t('কোনো খরচ এন্ট্রি পাওয়া যায়নি', 'No expense entries found')}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => {
                  const cat = getCategoryLabel(e.category);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {new Date(e.date).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{e.title}</span>
                        {e.note && <span className="text-[11px] text-slate-500">{e.note}</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-sm text-rose-600">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {e.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(t('এই খরচের এন্ট্রিটি মুছে ফেলতে চান?', 'Delete this expense?'))) {
                              deleteExpense(e.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD EXPENSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {t('দোকানের নতুন খরচ এন্ট্রি', 'Add Store Expense')}
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateExpense} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {t('খরচের নাম / বিবরণ *', 'Expense Title *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: দোকান ভাড়া, স্টাফ নাস্তা, বাল্ব পরিবর্তন..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('খরচের ক্যাটাগরি', 'Category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="rent">দোকান ভাড়া</option>
                    <option value="electricity">বিদ্যুৎ ও ইউটিলিটি</option>
                    <option value="salary">স্টাফ বেতন</option>
                    <option value="entertainment">আপ্যায়ন ও নাস্তা</option>
                    <option value="transport">পরিবহন খরচ</option>
                    <option value="maintenance">মেরামত ও রক্ষণাবেক্ষণ</option>
                    <option value="marketing">প্রচার ও মার্কেটিং</option>
                    <option value="other">অন্যান্য ব্যয়</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('টাকার পরিমাণ (৳) *', 'Amount *')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('পেমেন্ট পদ্ধতি', 'Payment Mode')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="cash">নগদ ক্যাশ (Cash)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="bank">ব্যাংক (Bank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('খরচের তারিখ', 'Expense Date')}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t('মন্তব্য / নোট (ঐচ্ছিক):', 'Notes:')}</label>
                <input
                  type="text"
                  placeholder="রশিদ নম্বর বা অতিরিক্ত তথ্য..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-100"
                >
                  {t('খরচ সংরক্ষণ করুন', 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
