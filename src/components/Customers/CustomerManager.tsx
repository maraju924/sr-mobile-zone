import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditProfile } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  Phone, 
  DollarSign, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Camera, 
  X,
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const { 
    customerProfiles, 
    updateCustomerCreditProfile, 
    sales,
    installments, 
    devices, 
    formatCurrency, 
    lang, 
    branch 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('ঈশ্বরগঞ্জ সদর');
  const [isFinancedCustomer, setIsFinancedCustomer] = useState(true);
  const [occupation, setOccupation] = useState('ব্যবসায়ী');
  const [monthlyIncome, setMonthlyIncome] = useState('25000');
  const [stopMarketingSms, setStopMarketingSms] = useState(false);
  const [guarantor1Name, setGuarantor1Name] = useState('');
  const [guarantor1Phone, setGuarantor1Phone] = useState('');
  const [guarantor1Nid, setGuarantor1Nid] = useState('');

  // 100% Real Live Customers loaded from Firebase Firestore (Zero demo mock data)
  const customers = useMemo(() => {
    const map = new Map<string, {
      id: string;
      phone: string;
      name: string;
      creditLimit: number;
      riskRating: 'low' | 'medium' | 'high' | 'blacklisted';
      nidNumber?: string;
      address?: string;
      area?: string;
      devicesCount: number;
      totalPurchased: number;
      totalPaid: number;
      outstanding: number;
      kycStatus: 'verified' | 'pending';
    }>();

    // Customer credit profiles from Firebase Firestore
    customerProfiles.forEach(cp => {
      const cleanPhone = cp.phone || cp.id;
      map.set(cleanPhone, {
        id: cp.id || cleanPhone,
        phone: cleanPhone,
        name: cp.name || 'Customer',
        creditLimit: cp.creditLimit || 50000,
        riskRating: cp.riskRating || 'low',
        nidNumber: cp.nidNumber || '',
        address: cp.address || '',
        area: cp.address ? cp.address.split(',')[0] : 'General',
        devicesCount: 0,
        totalPurchased: 0,
        totalPaid: 0,
        outstanding: 0,
        kycStatus: cp.nidNumber ? 'verified' : 'pending'
      });
    });

    // Merge sales ledger from Firebase Firestore
    sales.forEach(s => {
      if (!s.customerPhone || s.customerPhone === 'N/A') return;
      const cleanPhone = s.customerPhone;
      let entry = map.get(cleanPhone);
      if (!entry) {
        entry = {
          id: cleanPhone,
          phone: cleanPhone,
          name: s.customerName || 'Customer',
          creditLimit: 30000,
          riskRating: 'low',
          nidNumber: '',
          address: s.customerAddress || '',
          area: 'General',
          devicesCount: 0,
          totalPurchased: 0,
          totalPaid: 0,
          outstanding: 0,
          kycStatus: 'pending'
        };
        map.set(cleanPhone, entry);
      }
      entry.totalPurchased += s.total || 0;
      entry.totalPaid += s.paidAmount || 0;
      entry.outstanding += s.dueAmount || 0;
    });

    // Merge installments ledger from Firebase Firestore
    installments.forEach(inst => {
      if (!inst.customerPhone || inst.customerPhone === 'N/A') return;
      const cleanPhone = inst.customerPhone;
      let entry = map.get(cleanPhone);
      if (!entry) {
        entry = {
          id: cleanPhone,
          phone: cleanPhone,
          name: inst.customerName || 'Customer',
          creditLimit: 40000,
          riskRating: 'low',
          nidNumber: inst.customerNid || '',
          address: inst.customerAddress || '',
          area: 'General',
          devicesCount: 0,
          totalPurchased: 0,
          totalPaid: 0,
          outstanding: 0,
          kycStatus: inst.customerNid ? 'verified' : 'pending'
        };
        map.set(cleanPhone, entry);
      }
      if (inst.customerNid && !entry.nidNumber) entry.nidNumber = inst.customerNid;
      if (inst.customerAddress && !entry.address) entry.address = inst.customerAddress;
      if (entry.nidNumber) entry.kycStatus = 'verified';
    });

    // Enrolled devices count from Firebase Firestore
    devices.forEach(dev => {
      if (!dev.customerPhone || dev.customerPhone === 'N/A') return;
      const entry = map.get(dev.customerPhone);
      if (entry) {
        entry.devicesCount += 1;
      }
    });

    return Array.from(map.values());
  }, [customerProfiles, sales, installments, devices]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    updateCustomerCreditProfile({
      id: phone,
      phone,
      name,
      creditLimit: 35000,
      riskRating: 'low',
      nidNumber: nid,
      address,
      notes: `Area: ${area} • Income: ৳${monthlyIncome} • G1: ${guarantor1Name} (${guarantor1Phone})`,
      updatedAt: new Date().toISOString()
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setNid('');
    setAddress('');
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (kycFilter === 'verified') return c.kycStatus === 'verified';
    if (kycFilter === 'pending') return c.kycStatus === 'pending';
    return true;
  });

  const totalFinanced = useMemo(() => customers.reduce((sum, c) => sum + c.totalPurchased, 0), [customers]);
  const totalPaid = useMemo(() => customers.reduce((sum, c) => sum + c.totalPaid, 0), [customers]);
  const totalOutstanding = useMemo(() => customers.reduce((sum, c) => sum + c.outstanding, 0), [customers]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 sm:pb-8 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'কাস্টমার প্রোফাইল ও কেওয়াইসি (KYC) যাচাই' : 'Customer Directory & KYC Profiles'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'এনআইডি ও ছবি ডকুমেন্ট ভেরিফিকেশন, জামিনদার ট্র্যাকিং, ক্রেডিট হিস্ট্রি এবং বকেয়া ব্যালেন্স।' 
              : 'NID KYC capture, guarantors verification, credit limit profiling & recovery.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কাস্টমার ফর্ম' : 'New Customer (KYC)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Customers</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{filteredCustomers.length} Verified</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Active in {branch}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Financed Purchases</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{formatCurrency(totalFinanced)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cumulative lifetime buy</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Recovered Payments</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">{formatCurrency(totalPaid)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Live Repayments Completed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding Balance</div>
          <div className="text-2xl font-black font-mono text-rose-600 mt-1">{formatCurrency(totalOutstanding)}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Active EMI balance</div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="কাস্টমারের নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Customer Identity</th>
                <th className="py-3 px-4">KYC & NID Status</th>
                <th className="py-3 px-4">Area & Address</th>
                <th className="py-3 px-4">Active Devices</th>
                <th className="py-3 px-4">Financial Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-sm text-slate-700">কোনো কাস্টমার তথ্য পাওয়া যায়নি</div>
                    <div className="text-xs text-slate-400 mt-1">সব ডাটা সরাসরি আপনার ফায়ারবেজ ক্লাউড থেকে লোড হয়। 'নতুন কাস্টমার ফর্ম' থেকে গ্রাহক যোগ করুন বা বিক্রয় সম্পন্ন করুন।</div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{cust.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        cust.kycStatus === 'verified' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{cust.kycStatus}</span>
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">NID: {cust.nidNumber || 'Not Provided'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{cust.area}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{cust.address || 'N/A'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cust.devicesCount} Financed Phone
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-rose-600 text-xs">
                        Due: {formatCurrency(cust.outstanding)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Paid: {formatCurrency(cust.totalPaid)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerDetail(cust)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW CUSTOMER KYC FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in">
          <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-base text-slate-900">New Customer Registration & KYC</span>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Toggle: Financed Customer vs Regular */}
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-indigo-950">কিস্তি বা লকার ফোনের কাস্টমার (Financed Device)?</div>
                <div className="text-[11px] text-indigo-800">ছবি, NID কার্ড ও জামিনদার ভেরিফিকেশন সক্রিয় হবে।</div>
              </div>
              <input
                type="checkbox"
                checked={isFinancedCustomer}
                onChange={e => setIsFinancedCustomer(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="গ্রাহকের পুরো নাম"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="10 বা 17 ডিজিটের NID"
                  value={nid}
                  onChange={e => setNid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">এরিয়া / থানা *</label>
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">বর্তমান ঠিকানা</label>
              <input
                type="text"
                placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {/* Financed Extended Section (Guarantors & Income) */}
            {isFinancedCustomer && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="font-bold text-xs text-indigo-950 uppercase">
                  জামিনদার (Guarantor) ও পেশাগত তথ্য
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পেশা</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাসিক আনুমানিক আয় (৳)</label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={e => setMonthlyIncome(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জামিনদারের নাম</label>
                    <input
                      type="text"
                      placeholder="ভাই / পিতা / বন্ধু"
                      value={guarantor1Name}
                      onChange={e => setGuarantor1Name(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জামিনদারের ফোন</label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={guarantor1Phone}
                      onChange={e => setGuarantor1Phone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জামিনদারের NID</label>
                    <input
                      type="text"
                      placeholder="NID নম্বর"
                      value={guarantor1Nid}
                      onChange={e => setGuarantor1Nid(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="stopSms"
                checked={stopMarketingSms}
                onChange={e => setStopMarketingSms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="stopSms" className="text-slate-600 cursor-pointer">
                Stop sending promotional SMS (জরুরি কিস্তি ও লক সংক্রান্ত মেসেজ যাবে)
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
              >
                কাস্টমার সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-base text-slate-900">Customer Profile & Financial Ledger</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedCustomerDetail(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedCustomerDetail.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{selectedCustomerDetail.phone}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  selectedCustomerDetail.riskRating === 'low' ? 'bg-emerald-100 text-emerald-800' :
                  selectedCustomerDetail.riskRating === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  Risk: {selectedCustomerDetail.riskRating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Purchases</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-1">
                    {formatCurrency(selectedCustomerDetail.totalPurchases)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Paid</div>
                  <div className="text-base font-black font-mono text-emerald-600 mt-1">
                    {formatCurrency(selectedCustomerDetail.totalPaid)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Outstanding Balance</div>
                  <div className="text-base font-black font-mono text-rose-600 mt-1">
                    {formatCurrency(selectedCustomerDetail.outstanding)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Credit Limit</div>
                  <div className="text-base font-black font-mono text-indigo-600 mt-1">
                    {formatCurrency(selectedCustomerDetail.creditLimit || 0)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">NID Card:</span>
                  <span className="font-bold text-slate-800">{selectedCustomerDetail.nidNumber || 'Not submitted'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Address:</span>
                  <span className="font-semibold text-slate-800 font-sans">{selectedCustomerDetail.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Financed Devices:</span>
                  <span className="font-bold text-slate-800">{selectedCustomerDetail.financedCount} Unit(s)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
