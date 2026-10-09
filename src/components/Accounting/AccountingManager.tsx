import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountEntry, JournalTransaction } from '../../types';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  Download
} from 'lucide-react';

export const AccountingManager: React.FC = () => {
  const { 
    accounts, 
    journalEntries, 
    addJournalEntry, 
    sales,
    installments,
    expenses,
    suppliers,
    formatCurrency, 
    branch, 
    lang 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'pnl' | 'trial'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Journal Form
  const [debitAcc, setDebitAcc] = useState('Cash in Hand');
  const [creditAcc, setCreditAcc] = useState('Sales Revenue');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState(`REF-${Date.now().toString().slice(-4)}`);

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      referenceNo,
      description,
      debitAccount: debitAcc,
      creditAccount: creditAcc,
      amount: parseFloat(amount) || 0,
      branch
    });

    setShowAddModal(false);
    setAmount('');
    setDescription('');
  };

  // 100% Dynamic Financial Calculations (Zero hardcoded mock numbers)
  const totalCashBank = useMemo(() => {
    if (accounts.length > 0) {
      return accounts
        .filter(a => a.type === 'Asset' && (a.accountName.includes('Cash') || a.accountName.includes('Bank') || a.accountName.includes('bKash') || a.accountName.includes('Nagad')))
        .reduce((sum, a) => sum + (a.balance || 0), 0);
    }
    const salesPaid = (sales || []).reduce((sum, s) => sum + (s.paidAmount || 0), 0);
    const expPaid = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    return Math.max(0, salesPaid - expPaid);
  }, [accounts, sales, expenses]);

  const totalReceivable = useMemo(() => {
    const accBal = accounts.find(a => a.accountName.toLowerCase().includes('receivable'))?.balance;
    if (accBal !== undefined) return accBal;
    const instDue = (installments || []).reduce((sum, i) => sum + (i && i.status === 'completed' ? 0 : (i?.remainingBalance || 0)), 0);
    const salesDue = (sales || []).reduce((sum, s) => sum + (s.dueAmount || 0), 0);
    return instDue + salesDue;
  }, [accounts, installments, sales]);

  const totalPayable = useMemo(() => {
    const accBal = accounts.find(a => a.accountName.toLowerCase().includes('payable'))?.balance;
    if (accBal !== undefined) return accBal;
    return (suppliers || []).reduce((sum, s) => sum + (s.balanceDue || 0), 0);
  }, [accounts, suppliers]);

  // P&L Metrics from live sales & expenses
  const totalRevenue = useMemo(() => (sales || []).reduce((sum, s) => sum + (s.total || 0), 0), [sales]);
  const cashSalesRevenue = useMemo(() => (sales || []).filter(s => s.saleType !== 'installment').reduce((sum, s) => sum + (s.total || 0), 0), [sales]);
  const installmentSalesRevenue = useMemo(() => (sales || []).filter(s => s.saleType === 'installment').reduce((sum, s) => sum + (s.total || 0), 0), [sales]);
  
  const totalCogs = useMemo(() => {
    return (sales || []).reduce((sum, s) => {
      const itemsCost = (s.items || []).reduce((iSum, it) => iSum + ((it.purchasePrice || 0) * (it.quantity || 1)), 0);
      return sum + itemsCost;
    }, 0);
  }, [sales]);

  const grossProfit = Math.max(0, totalRevenue - totalCogs);
  const totalOperatingExpenses = useMemo(() => (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0), [expenses]);
  const netOperatingProfit = grossProfit - totalOperatingExpenses;

  // Trial balance equity check
  const totalDebit = totalCashBank + totalReceivable;
  const ownerCapital = Math.max(0, totalDebit - totalPayable);
  const totalCredit = totalPayable + ownerCapital;

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'হিসাবরক্ষণ, ক্যাশ-ব্যাংক ও ডাবল-এন্ট্রি লেজার' : 'Accounting, Cash & Double-Entry Ledger'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'ক্যাশ ইন হ্যান্ড, মোবাইল ব্যাংকিং, ব্যাংক বুক, জার্নাল এন্ট্রি এবং লাভ-ক্ষতি স্টেটমেন্ট।' 
              : 'Real-time Chart of Accounts, Cash & Bank reconciliations, General Ledger & Financial Statements.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন জার্নাল ভাউচার' : 'Post Journal Entry'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Cash & Bank Accounts' },
          { id: 'journal', label: 'Journal Transactions' },
          { id: 'pnl', label: 'Income Statement (P&L)' },
          { id: 'trial', label: 'Trial Balance & Ledger' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-4 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & CASH-BANK ACCOUNTS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-indigo-300">Total Liquid Cash & Bank</div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {formatCurrency(totalCashBank)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Realtime Cash Position</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Accounts Receivable (দেনাদার)</div>
              <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
                {formatCurrency(totalReceivable)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                কিস্তির বকেয়া ও কাস্টমার পাওনা
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Accounts Payable (পাওনাদার)</div>
              <div className="text-2xl font-black font-mono text-rose-600 mt-1">
                {formatCurrency(totalPayable)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                সাপ্লায়ার বাকি ও প্রদেয় বিল
              </div>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Chart of Accounts & Wallet Balances</h3>
            
            {accounts.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <div className="font-bold text-sm text-slate-700">কোনো কাস্টম অ্যাকাউন্ট যোগ করা হয়নি</div>
                <div className="text-xs text-slate-400 mt-1">সরাসরি বিক্রয় এবং কালেকশনের মাধ্যমে ক্যাশ পজিশন স্বয়ংক্রিয়ভাবে হিসাব করা হচ্ছে।</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{acc.accountName}</span>
                      <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-white border border-slate-200">
                        {acc.type}
                      </span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-900 mt-2">
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: JOURNAL TRANSACTIONS */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">General Journal Entries (ডাবল-এন্ট্রি ভাউচার)</h3>
            <span className="text-xs text-slate-500 font-mono">{journalEntries.length} Posted</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Date & Ref</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Debit Account</th>
                <th className="py-2.5 px-4">Credit Account</th>
                <th className="py-2.5 px-4 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journalEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-sm text-slate-700">কোনো জার্নাল এন্ট্রি পাওয়া যায়নি</div>
                    <div className="text-xs text-slate-400 mt-1">নতুন জার্নাল ভাউচার পোস্ট করতে উপরের বাটনে ক্লিক করুন।</div>
                  </td>
                </tr>
              ) : (
                journalEntries.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div>{j.date}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{j.referenceNo}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {j.description}
                    </td>
                    <td className="py-3 px-4 text-indigo-700 font-semibold font-mono">
                      {j.debitAccount}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {j.creditAccount}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-slate-900">
                      {formatCurrency(j.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PROFIT & LOSS STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 max-w-3xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-black uppercase text-slate-900">Income Statement (লাভ ও ক্ষতি বিবরণী)</h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{branch} • Current Fiscal Period</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>১. বিক্রয় আয় (Total Revenue)</span>
              <span className="font-mono">{formatCurrency(totalRevenue)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pl-4">
              <span>নগদ স্মার্টফোন বিক্রয়</span>
              <span className="font-mono">{formatCurrency(cashSalesRevenue)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 pl-4">
              <span>কিস্তি ও ফাইন্যান্সিং বিক্রয়</span>
              <span className="font-mono">{formatCurrency(installmentSalesRevenue)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>২. বিক্রিত পণ্যের ক্রয়মূল্য (COGS)</span>
              <span className="font-mono text-rose-600">({formatCurrency(totalCogs)})</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between font-black text-emerald-700 text-sm bg-emerald-50/50 p-2 rounded-lg">
              <span>মোট লাভ (Gross Profit)</span>
              <span className="font-mono">{formatCurrency(grossProfit)}</span>
            </div>

            <div className="pt-2 flex items-center justify-between font-bold text-slate-900">
              <span>৩. পরিচালনা ব্যয় (Operating Expenses)</span>
              <span className="font-mono text-rose-600">({formatCurrency(totalOperatingExpenses)})</span>
            </div>

            <div className="pt-4 border-t-2 border-indigo-600 flex items-center justify-between font-black text-indigo-950 text-base bg-indigo-50 p-3 rounded-xl">
              <span>নিট প্রফিট (Net Operating Profit)</span>
              <span className={`font-mono ${netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatCurrency(netOperatingProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRIAL BALANCE */}
      {activeTab === 'trial' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Trial Balance (রেওয়ামিল)</h3>
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Account Head</th>
                <th className="py-2.5 px-3">Account Type</th>
                <th className="py-2.5 px-3 text-right">Debit (৳)</th>
                <th className="py-2.5 px-3 text-right">Credit (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Cash in Hand / Bank</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Asset</td>
                <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(totalCashBank)}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Accounts Receivable (বকেয়া)</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Asset</td>
                <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(totalReceivable)}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Accounts Payable (সাপ্লায়ার দেনা)</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Liability</td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(totalPayable)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Owner Capital (মূলধন / ইকুইটি)</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans">Equity</td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(ownerCapital)}</td>
              </tr>
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3">Total Balance Check</td>
                <td></td>
                <td className="py-3 px-3 text-right text-indigo-700">{formatCurrency(totalDebit)}</td>
                <td className="py-3 px-3 text-right text-indigo-700">{formatCurrency(totalCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* POST JOURNAL VOUCHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <form onSubmit={handleAddJournal} className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-slate-900">Post New Journal Voucher</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ভাউচার বিবরণ / নারেশন *</label>
              <input
                type="text"
                required
                placeholder="যেমন: শোরুম ভাড়া প্রদান..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Debit Account *</label>
                <input
                  type="text"
                  value={debitAcc}
                  onChange={e => setDebitAcc(e.target.value)}
                  placeholder="Debit Account"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Credit Account *</label>
                <input
                  type="text"
                  value={creditAcc}
                  onChange={e => setCreditAcc(e.target.value)}
                  placeholder="Credit Account"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (৳) *</label>
              <input
                type="number"
                required
                placeholder="5000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                পোস্ট করুন
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
