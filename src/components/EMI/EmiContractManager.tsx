import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Installment, InstallmentScheduleItem } from '../../types';
import { 
  FileCheck, 
  Search, 
  Printer, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Repeat, 
  ChevronRight,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

export const EmiContractManager: React.FC = () => {
  const { 
    installments, 
    formatCurrency, 
    lang, 
    recordInstallmentPayment,
    branch 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Installment | null>(installments[0] || null);

  const filteredContracts = installments.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerPhone.includes(searchTerm) ||
    c.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 sm:pb-8 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'ইএমআই ফাইন্যান্স কন্ট্রাক্ট ও শিডিউল' : 'EMI Finance Contracts & Schedules'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'হায়ার পারচেজ চুক্তিপত্র, কিস্তির অগ্রগতি ট্র্যাকিং, রিশিডিউল এবং সরাসরি পেমেন্ট কালেকশন।' 
              : 'Hire-purchase contracts, payment milestones, due rescheduling and agreement print.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-slate-950/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Master Agreement</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Left Contracts List, Right Contract Details & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Contracts List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 flex flex-col max-h-[75vh]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="কন্ট্রাক্ট নং, ফোন বা গ্রাহকের নাম..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
            {filteredContracts.map(c => {
              const isSelected = selectedContract?.id === c.id;
              const isOverdue = c.status === 'overdue';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContract(c)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 font-mono">
                        {c.invoiceNumber || `C-2026-000${c.id.slice(-3)}`}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase ${
                        isOverdue ? 'bg-rose-100 text-rose-800' :
                        c.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">{c.customerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.customerPhone}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-rose-600 font-mono text-xs">
                      {formatCurrency(c.remainingBalance)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {c.paidCount}/{c.installmentCount} Paid
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-1" />
                  </div>
                </div>
              );
            })}

            {filteredContracts.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                কোনো ইএমআই কন্ট্রাক্ট পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Contract Details & Schedule (7 cols) */}
        {selectedContract ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-slate-900">
                    Contract #{selectedContract.invoiceNumber || selectedContract.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    selectedContract.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedContract.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Device: <strong className="text-slate-800">{selectedContract.productNameSummary}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Deed</span>
                </button>
              </div>
            </div>

            {/* Contract Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
                <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                  {formatCurrency(selectedContract.totalAmount)}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Down Payment</div>
                <div className="text-sm font-black font-mono text-emerald-600 mt-0.5">
                  {formatCurrency(selectedContract.downPayment)}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Outstanding Due</div>
                <div className="text-sm font-black font-mono text-rose-600 mt-0.5">
                  {formatCurrency(selectedContract.remainingBalance)}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Per Month</div>
                <div className="text-sm font-black font-mono text-indigo-600 mt-0.5">
                  {formatCurrency(selectedContract.monthlyAmount)}
                </div>
              </div>
            </div>

            {/* Customer & Guarantor Info */}
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-bold text-indigo-950">গ্রাহকের তথ্য:</div>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedContract.customerName}</div>
                <div className="text-slate-600 font-mono">{selectedContract.customerPhone}</div>
                {selectedContract.customerNid && <div className="text-slate-500">NID: {selectedContract.customerNid}</div>}
              </div>

              <div>
                <div className="font-bold text-indigo-950">জামিনদার (Guarantor):</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {selectedContract.guarantorName || 'জহিরুল ইসলাম (সম্পর্ক: ভাই)'}
                </div>
                <div className="text-slate-600 font-mono">
                  {selectedContract.guarantorPhone || '01811223344'}
                </div>
              </div>
            </div>

            {/* Installment Milestone Schedule Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Installment Schedule ({selectedContract.paidCount}/{selectedContract.installmentCount} Completed)
                </h4>
                <span className="text-[11px] font-mono font-bold text-indigo-600">
                  {Math.round((selectedContract.paidCount / selectedContract.installmentCount) * 100)}% Recovered
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedContract.paidCount / selectedContract.installmentCount) * 100}%` }}
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2 px-3"># No</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedContract.schedule?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          #{item.installmentNo}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {item.dueDate}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            item.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.isPaid ? 'PAID' : 'UPCOMING'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {!item.isPaid ? (
                            <button
                              onClick={() => {
                                recordInstallmentPayment(selectedContract.id, item.id, item.amount);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition"
                            >
                              Collect
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold">✓ Received</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            বামে তালিকা থেকে যেকোনো একটি ইএমআই কন্ট্রাক্ট নির্বাচন করুন।
          </div>
        )}

      </div>

    </div>
  );
};
