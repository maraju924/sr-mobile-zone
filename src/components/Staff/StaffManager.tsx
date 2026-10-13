import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import { 
  UserCheck, 
  Plus, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Briefcase,
  Shield,
  Edit2,
  Trash2,
  KeyRound,
  Percent,
  AlertTriangle
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { 
    staff, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    toggleStaffStatus, 
    formatCurrency, 
    branch, 
    branches, 
    lang 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branch === 'ALL' ? (branches[0]?.id || 'BP-ISHWARGONJ') : branch);
  const [role, setRole] = useState<StaffMember['role']>('Sales Executive');
  const [salary, setSalary] = useState('18000');
  const [commission, setCommission] = useState('1.5');
  const [pin, setPin] = useState('1234');

  const openAddModal = () => {
    setName('');
    setPhone('');
    setSelectedBranch(branch === 'ALL' ? (branches[0]?.id || 'BP-ISHWARGONJ') : branch);
    setRole('Sales Executive');
    setSalary('18000');
    setCommission('1.5');
    setPin('1234');
    setShowAddModal(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setPhone(member.phone);
    setSelectedBranch(member.branch);
    setRole(member.role);
    setSalary(member.salary.toString());
    setCommission((member.salesCommissionPercent || 0).toString());
    setPin(member.pin || '1234');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addStaff({
      branch: selectedBranch as any,
      name: name.trim(),
      phone: phone.trim(),
      role,
      salary: parseFloat(salary) || 0,
      salesCommissionPercent: parseFloat(commission) || 0,
      pin: pin.trim() || '1234',
      active: true,
      joinedDate: new Date().toISOString().split('T')[0]
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setPin('1234');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !name || !phone) return;

    updateStaff({
      ...editingStaff,
      name: name.trim(),
      phone: phone.trim(),
      branch: selectedBranch as any,
      role,
      salary: parseFloat(salary) || 0,
      salesCommissionPercent: parseFloat(commission) || 0,
      pin: pin.trim() || '1234'
    });

    setEditingStaff(null);
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    setDeleteConfirmId(null);
  };

  const totalPayroll = staff.filter(s => s.active).reduce((sum, s) => sum + s.salary, 0);
  const adminCount = staff.filter(s => s.active && s.role === 'Admin').length;

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
              ? 'কর্মচারী উপস্থিতি, মাসিক বেতন, কমিশন, এডমিন পারমিশন ও স্টাফ লগইন পিন নিয়ন্ত্রণ।' 
              : 'Multi-branch employee management, monthly salaries, commission payouts, admin roles & PIN.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কর্মচারী নিয়োগ' : 'Add Employee'}</span>
          </button>
        </div>
      </div>

      {/* Admin Role Notice Banner */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 sm:p-4 rounded-2xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <strong className="font-bold block sm:inline mr-1">
            {lang === 'bn' ? '🛡️ এডমিন (Admin) রোলের সুবিধা:' : '🛡️ Admin Role Privileges:'}
          </strong>
          {lang === 'bn' 
            ? 'কোনো কর্মচারীকে "Admin" রোল দিলে তিনি দোকানের মালিকের সমকক্ষ সর্বময় ক্ষমতা পাবেন — সকল ব্রাঞ্চের ডেটা দেখা, পণ্য ও স্টক পরিবর্তন, ইনভয়েস ও কিস্তি আদায়, খতিয়ান, কর্মচারী পরিচালনা ও শপ সেটিংস।'
            : 'Assigning "Admin" role grants full owner-level powers — consolidate all branches, manage inventory, POS invoices, EMI, accounting ledgers, staff directory & settings.'}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Active Employees</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {staff.filter(s => s.active).length} {lang === 'bn' ? 'জন' : 'Members'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Assigned across branches</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Admin Level Staff</div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1 flex items-center gap-1.5">
            <Shield className="w-5 h-5" />
            <span>{adminCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{lang === 'bn' ? 'মালিকের সমকক্ষ ক্ষমতা' : 'Full Owner Privileges'}</div>
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
            98.5%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">● Biometric & Mobile Punch</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {lang === 'bn' ? 'কর্মচারী তালিকা, রোল ও বেতন কাঠামো' : 'Employee Directory & Salary Structure'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {staff.length} {lang === 'bn' ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Name & Role</th>
                <th className="py-2.5 px-4">Mobile & Login PIN</th>
                <th className="py-2.5 px-4">Branch</th>
                <th className="py-2.5 px-4">Base Salary</th>
                <th className="py-2.5 px-4">Sales Commission</th>
                <th className="py-2.5 px-4">Joined Date</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো কর্মী পাওয়া যায়নি। নতুন নিয়োগ দিন।' : 'No employees found. Click Add Employee.'}
                  </td>
                </tr>
              ) : (
                staff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {s.name}
                        {s.role === 'Admin' && (
                          <span title="Admin Role">
                            <Shield className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {s.role === 'Admin' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            🛡️ Admin (মালিকের সমকক্ষ)
                          </span>
                        ) : s.role === 'Manager' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            Manager (ম্যানেজার)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {s.role}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-semibold">{s.phone}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <KeyRound className="w-3 h-3 text-indigo-500" />
                        <span>PIN: {s.pin || '1234'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{s.branch}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(s.salary)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {s.salesCommissionPercent > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                          <Percent className="w-3 h-3" />
                          {s.salesCommissionPercent}%
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {s.joinedDate}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStaffStatus(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                            s.active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {s.active ? 'ACTIVE' : 'INACTIVE'}
                        </button>

                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title={lang === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {lang === 'bn' ? 'কর্মচারী মুছে ফেলবেন?' : 'Delete Staff Member?'}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {lang === 'bn' ? 'এই কর্মীর সকল রেকর্ড সিস্টেম থেকে ডিলিট হয়ে যাবে।' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                {lang === 'bn' ? 'নতুন কর্মচারী নিয়োগ' : 'Add New Staff Member'}
              </span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">✕</button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'কর্মচারীর পূর্ণ নাম *' : 'Full Name *'}</label>
              <input
                type="text"
                required
                placeholder={lang === 'bn' ? 'যেমন: সাকিব আল হাসান' : 'e.g. John Doe'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'মোবাইল নম্বর (লগইন ইউজারনেম) *' : 'Mobile Number (Username) *'}</label>
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
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'নির্ধারিত ব্রাঞ্চ *' : 'Branch *'}</label>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'লগইন পিন (৪ ডিজিট) *' : 'Login PIN (4 digits) *'}</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="1234"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'পদবী / দায়িত্ব (রোল) *' : 'Role & Permissions *'}
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer text-indigo-700"
              >
                <option value="Admin">{lang === 'bn' ? '🛡️ Admin / অ্যাডমিন (মালিকের মতো সর্বময় ক্ষমতা)' : '🛡️ Admin (Full Owner-Level Access)'}</option>
                <option value="Manager">{lang === 'bn' ? '🏢 Manager / ব্রাঞ্চ ম্যানেজার' : '🏢 Manager'}</option>
                <option value="Sales Executive">{lang === 'bn' ? '💼 Sales Executive / বিক্রয় ও ক্যাশিয়ার' : '💼 Sales Executive'}</option>
                <option value="Technician">{lang === 'bn' ? '🔧 Technician / সার্ভিস টেকনিশিয়ান' : '🔧 Technician'}</option>
                <option value="Accountant">{lang === 'bn' ? '📊 Accountant / হিসাবরক্ষক' : '📊 Accountant'}</option>
              </select>

              {role === 'Admin' && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'bn'
                      ? 'অ্যাডমিন রোল দেওয়া হলে এই কর্মী মালিকের মতো সকল ব্রাঞ্চ পরিবর্তন, পণ্য স্টক, ইনভয়েস, কিস্তি, খতিয়ান ও সেটিংস সহ পুরো শপ নিয়ন্ত্রণ করতে পারবেন।'
                      : 'Admin role gives identical privileges to the store owner: access all branches, edit stock, void sales, manage accounting and settings.'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'মাসিক মূল বেতন (৳)' : 'Monthly Salary (৳)'}</label>
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'বিক্রয় কমিশন (%)' : 'Sales Commission (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {lang === 'bn' ? 'নিয়োগ সম্পন্ন করুন' : 'Save Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                {lang === 'bn' ? 'কর্মচারীর তথ্য ও রোল পরিবর্তন' : 'Edit Employee & Role'}
              </span>
              <button type="button" onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">✕</button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'কর্মচারীর পূর্ণ নাম *' : 'Full Name *'}</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'নির্ধারিত ব্রাঞ্চ *' : 'Branch *'}</label>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'লগইন পিন (৪ ডিজিট) *' : 'Login PIN (4 digits) *'}</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'পদবী / দায়িত্ব (রোল) *' : 'Role & Permissions *'}
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer text-indigo-700"
              >
                <option value="Admin">{lang === 'bn' ? '🛡️ Admin / অ্যাডমিন (মালিকের মতো সর্বময় ক্ষমতা)' : '🛡️ Admin (Full Owner-Level Access)'}</option>
                <option value="Manager">{lang === 'bn' ? '🏢 Manager / ব্রাঞ্চ ম্যানেজার' : '🏢 Manager'}</option>
                <option value="Sales Executive">{lang === 'bn' ? '💼 Sales Executive / বিক্রয় ও ক্যাশিয়ার' : '💼 Sales Executive'}</option>
                <option value="Technician">{lang === 'bn' ? '🔧 Technician / সার্ভিস টেকনিশিয়ান' : '🔧 Technician'}</option>
                <option value="Accountant">{lang === 'bn' ? '📊 Accountant / হিসাবরক্ষক' : '📊 Accountant'}</option>
              </select>

              {role === 'Admin' && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'bn'
                      ? 'অ্যাডমিন রোল দেওয়া হলে এই কর্মী মালিকের মতো সকল ব্রাঞ্চ পরিবর্তন, পণ্য স্টক, ইনভয়েস, কিস্তি, খতিয়ান ও সেটিংস সহ পুরো শপ নিয়ন্ত্রণ করতে পারবেন।'
                      : 'Admin role gives identical privileges to the store owner: access all branches, edit stock, void sales, manage accounting and settings.'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'মাসিক মূল বেতন (৳)' : 'Monthly Salary (৳)'}</label>
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{lang === 'bn' ? 'বিক্রয় কমিশন (%)' : 'Sales Commission (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
