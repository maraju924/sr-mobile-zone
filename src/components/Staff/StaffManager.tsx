import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import { 
  UserCheck, 
  Plus, 
  Building2, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Briefcase 
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { staff, addStaff, toggleStaffStatus, formatCurrency, branch, branches, lang } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branch === 'ALL' ? (branches[0]?.id || 'BP-ISHWARGONJ') : branch);
  const [role, setRole] = useState<StaffMember['role']>('Sales Executive');
  const [salary, setSalary] = useState('18000');
  const [commission, setCommission] = useState('1.5');
  const [pin, setPin] = useState('1234');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addStaff({
      branch: selectedBranch,
      name,
      phone,
      role,
      salary: parseFloat(salary) || 0,
      salesCommissionPercent: parseFloat(commission) || 0,
      pin: pin.trim() || undefined,
      active: true,
      joinedDate: new Date().toISOString().split('T')[0]
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setPin('1234');
  };

  const totalPayroll = staff.filter(s => s.active).reduce((sum, s) => sum + s.salary, 0);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 sm:pb-8 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'স্টাফ, বিক্রয় কমিশন ও পেরোল ব্যবস্থাপনা' : 'Staff, Sales Commission & Payroll'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'কর্মচারী উপস্থিতি, মাসিক বেতন, হ্যান্ডসেট বিক্রির পার্সেন্টেজ কমিশন ও পারমিশন।' 
              : 'Multi-branch employee management, monthly salaries, commission payouts & roles.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কর্মচারী নিয়োগ' : 'Add Employee'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Active Employees</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {staff.filter(s => s.active).length} Members
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Assigned to {branch}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Payroll Commitment</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {formatCurrency(totalPayroll)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Excluding incentives & bonuses</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</div>
          <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
            96.8%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">● Biometric & Mobile Punch</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Employee Directory & Salary Structure</h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-4">Name & Role</th>
              <th className="py-2.5 px-4">Mobile & Branch</th>
              <th className="py-2.5 px-4">Base Salary</th>
              <th className="py-2.5 px-4">Sales Commission</th>
              <th className="py-2.5 px-4">Joined Date</th>
              <th className="py-2.5 px-4 text-right">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[10px] font-mono text-indigo-600 font-semibold">{s.role}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono text-slate-800">{s.phone}</div>
                  <div className="text-[10px] text-slate-400">{s.branch}</div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {formatCurrency(s.salary)}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {s.salesCommissionPercent > 0 ? `${s.salesCommissionPercent}% on sales` : 'None'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">
                  {s.joinedDate}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleStaffStatus(s.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition ${
                      s.active 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {s.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-slate-900">Add New Staff Member</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">কর্মচারীর পূর্ণ নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: সাকিব আল হাসান"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
              <input
                type="text"
                required
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">নির্ধারিত ব্রাঞ্চ *</label>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">লগইন পিন (৪ ডিজিট)</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="1234"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">পদবী / রোল</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Manager">Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Technician">Technician</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মাসিক বেতন (৳)</label>
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
              >
                নিয়োগ সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
