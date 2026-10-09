import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Smartphone, 
  DollarSign, 
  Coins, 
  ShoppingCart, 
  Repeat, 
  ShieldCheck, 
  Radio, 
  Send, 
  CreditCard, 
  FileCheck, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Plus, 
  Key, 
  ShieldAlert, 
  Layers, 
  Sliders
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { 
    lang, 
    setActiveTab, 
    formatCurrency, 
    branch, 
    devices, 
    customerProfiles, 
    sales, 
    installments, 
    deviceCredits,
    usedBuys,
    favourites,
    addDeviceCredits
  } = useApp();

  const [creditNotice, setCreditNotice] = useState<string | null>(null);

  const handleAddCredits = (amount: number = 10) => {
    addDeviceCredits(amount);
    setCreditNotice(lang === 'bn' ? `${amount}টি ডিভাইস ক্রেডিট যোগ করা হয়েছে!` : `${amount} Device Credits added!`);
    setTimeout(() => setCreditNotice(null), 3000);
  };

  // Metrics calculation 100% dynamic from Firebase Firestore collections
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthSales = useMemo(() => {
    return (sales || []).filter(s => {
      if (!s.createdAt) return false;
      const d = new Date(s.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [sales, currentYear, currentMonth]);

  const monthSalesTotal = useMemo(() => {
    return thisMonthSales.reduce((sum, s) => sum + (s.total || 0), 0);
  }, [thisMonthSales]);

  // Last month sales for comparison
  const lastMonthSales = useMemo(() => {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return (sales || []).filter(s => {
      if (!s.createdAt) return false;
      const d = new Date(s.createdAt);
      return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
    }).reduce((sum, s) => sum + (s.total || 0), 0);
  }, [sales, currentYear, currentMonth]);

  const salesGrowthText = useMemo(() => {
    if (lastMonthSales === 0) {
      if (monthSalesTotal > 0) {
        return `${thisMonthSales.length} ${lang === 'bn' ? 'টি বিক্রয় ইনভয়েস' : 'sales orders'}`;
      }
      return lang === 'bn' ? 'নতুন অ্যাকাউন্ট (০ বিক্রয়)' : 'Fresh account (0 sales)';
    }
    const pct = Math.round(((monthSalesTotal - lastMonthSales) / lastMonthSales) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}% vs last mo`;
  }, [lastMonthSales, monthSalesTotal, thisMonthSales.length, lang]);

  // Dynamic 7-day sparkline from actual sales data
  const sparklineDays = useMemo(() => {
    const days: { day: string; amt: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayDisplay = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: '2-digit' });
      const dayTotal = (sales || [])
        .filter(s => s.createdAt && s.createdAt.startsWith(dayStr))
        .reduce((sum, s) => sum + (s.total || 0), 0);
      days.push({ day: dayDisplay, amt: dayTotal });
    }
    return days;
  }, [sales, lang]);

  const maxSparklineAmt = Math.max(...sparklineDays.map(d => d.amt), 1);

  // 100% Real Live Unique Customers
  const uniqueCustomerCount = useMemo(() => {
    const set = new Set<string>();
    (customerProfiles || []).forEach(cp => {
      if (cp.phone) set.add(cp.phone);
      else if (cp.id) set.add(cp.id);
    });
    (sales || []).forEach(s => {
      if (s.customerPhone && s.customerPhone !== 'N/A') set.add(s.customerPhone);
    });
    (installments || []).forEach(inst => {
      if (inst.customerPhone && inst.customerPhone !== 'N/A') set.add(inst.customerPhone);
    });
    return set.size;
  }, [customerProfiles, sales, installments]);

  const verifiedKycCount = useMemo(() => {
    return (customerProfiles || []).filter(c => c.nidNumber && c.nidNumber.trim()).length;
  }, [customerProfiles]);

  const totalFinancedDevices = (devices || []).length;
  const restrictedDevices = (devices || []).filter(d => d && (d.financeStatus === 'RESTRICTED' || d.lockStatus === 'LOCKED')).length;
  
  // Real Outstanding Due (Installments Balance + Sales Due)
  const totalOutstanding = useMemo(() => {
    const instDue = (installments || []).reduce((acc, i) => acc + (i && i.status === 'completed' ? 0 : (i?.remainingBalance || 0)), 0);
    const salesDue = (sales || []).reduce((acc, s) => acc + (s.dueAmount || 0), 0);
    return instDue + salesDue;
  }, [installments, sales]);

  const overdueCount = (installments || []).filter(i => i && i.status === 'overdue').length;

  const todayStr = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 text-slate-800 space-y-5">
      
      {/* 1. Greeting Banner & "This Month" Live Sales Trend */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-semibold">
              {branch}
            </span>
            <span className="text-xs text-slate-400 font-medium">{todayStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
            {lang === 'bn' ? 'স্বাগতম, শপ অ্যাডমিন!' : 'Welcome back, Tenant Admin!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {lang === 'bn' 
              ? 'মোবাইল ফাইন্যান্সিং, কিস্তি কালেকশন, ডিভাইস অটো-লকার এবং ফুল ইআরপি ড্যাশবোর্ড।' 
              : 'Real-time phone financing, EMI tracking, remote MDM device locking & POS ERP control.'}
          </p>
        </div>

        {/* "This Month" Live Sales & Sparkline */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {lang === 'bn' ? 'চলতি মাসের মোট বিক্রয়' : 'This Month Sales'}
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-300 font-mono">
              {formatCurrency(monthSalesTotal)}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{salesGrowthText}</span>
            </div>
          </div>

          {/* Bar sparkline */}
          <div className="flex items-end gap-1.5 h-10 pt-1">
            {sparklineDays.map((d, idx) => {
              const heightPx = monthSalesTotal > 0 ? Math.max(3, (d.amt / maxSparklineAmt) * 32) : 3;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-2.5 rounded-xs transition ${d.amt > 0 ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-700'}`} 
                    style={{ height: `${heightPx}px` }}
                    title={`${d.day}: ${formatCurrency(d.amt)}`}
                  />
                  <span className="text-[8px] text-slate-500 font-mono">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Big Action Buttons: New Sale & EMI Sale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('pos')}
          className="group p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-between transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg font-black tracking-tight leading-tight">
                {lang === 'bn' ? 'নতুন নগদ বিক্রয় (New Sale)' : 'New Cash Sale'}
              </div>
              <div className="text-xs text-emerald-100 mt-0.5">
                {lang === 'bn' ? 'ইনভয়েস, বারকোড স্ক্যান ও সরাসরি প্রিন্ট' : 'Full barcode POS billing & thermal invoice'}
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </button>

        <button
          onClick={() => setActiveTab('installments')}
          className="group p-4 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-950/20 flex items-center justify-between transition-all transform active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg font-black tracking-tight leading-tight">
                {lang === 'bn' ? 'কিস্তিতে বিক্রয় (EMI Sale)' : 'Financed EMI Sale'}
              </div>
              <div className="text-xs text-indigo-100 mt-0.5">
                {lang === 'bn' ? 'ডাউন পেমেন্ট, কিস্তি প্ল্যান ও স্বয়ংক্রিয় লকার লিংকিং' : 'Hire purchase plan with auto locker enroll'}
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </button>
      </div>

      {/* 3. 4 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Customers */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{lang === 'bn' ? 'কাস্টমার প্রোফাইল' : 'Customers'}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {uniqueCustomerCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-indigo-600">{verifiedKycCount}</span>
            <span>{lang === 'bn' ? 'কেওয়াইসি ভেরিফাইড' : 'KYC verified'}</span>
          </div>
        </div>

        {/* KPI 2: Financed Devices */}
        <div 
          onClick={() => setActiveTab('devices')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{lang === 'bn' ? 'ফাইন্যান্সড ডিভাইস' : 'Financed Devices'}</span>
            <Smartphone className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalFinancedDevices}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className={`font-bold ${restrictedDevices > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {restrictedDevices}
            </span>
            <span>{lang === 'bn' ? 'লক বা রেস্ট্রিক্টেড' : 'currently restricted'}</span>
          </div>
        </div>

        {/* KPI 3: Outstanding ৳ */}
        <div 
          onClick={() => setActiveTab('installments')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{lang === 'bn' ? 'মোট বকেয়া পাওনা' : 'Outstanding ৳'}</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-mono">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-rose-600">{overdueCount}</span>
            <span>{lang === 'bn' ? 'কিস্তি ওভারডিউ রয়েছে' : 'contracts overdue'}</span>
          </div>
        </div>

        {/* KPI 4: Credit Balance */}
        <div 
          onClick={() => handleAddCredits(10)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
          title="Click to recharge credits (+10)"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{lang === 'bn' ? 'লকার ক্রেডিট ব্যালেন্স' : 'Credit Balance'}</span>
            <Coins className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-mono flex items-center justify-between">
            <span>{deviceCredits}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold uppercase">
              Available
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'প্রতি এনরোলে ১ ক্রেডিট' : '1 credit per enroll'}</span>
            <span className="text-indigo-600 font-bold hover:underline">+Recharge</span>
          </div>
        </div>

      </div>

      {creditNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>{creditNotice}</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
            Live Firestore Synced
          </span>
        </div>
      )}

      {/* 4. Locker Shortcuts Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              {lang === 'bn' ? 'লকার ও ডিভাইস ম্যানেজমেন্ট কন্ট্রোল গ্রিড' : 'Locker & MDM Control Center'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">14 Active Functions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3">
          
          <button
            onClick={() => setActiveTab('devices')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">Add Device</span>
            <span className="text-[10px] text-slate-500">নতুন ডিভাইস এনরোল</span>
          </button>

          <button
            onClick={() => setActiveTab('livewall')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-900 hover:text-white flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-bold text-xs text-slate-800 group-hover:text-white mt-2">Live Wall (NOC)</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400">রিয়েলটাইম ডার্ক মনিটর</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <Send className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">SMS Control</span>
            <span className="text-[10px] text-slate-500">মেসেজ ও রিমোট লক</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">EMI Contracts</span>
            <span className="text-[10px] text-slate-500">চুক্তিপত্র ও রিশিডিউল</span>
          </button>

          <button
            onClick={() => setActiveTab('installments')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">Collections</span>
            <span className="text-[10px] text-slate-500">কিস্তি আদায় ও রশিদ</span>
          </button>

          <button
            onClick={() => handleAddCredits(10)}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
              <Coins className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">Device Credits</span>
            <span className="text-[10px] text-slate-500">ব্যালেন্স: {deviceCredits}</span>
          </button>

          <button
            onClick={() => setActiveTab('usedbuy')}
            className="p-3 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">Used Buy</span>
            <span className="text-[10px] text-slate-500">পুরনো ফোন আইনি ক্রয়</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className="p-3 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 flex flex-col items-center text-center transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center group-hover:scale-110 transition">
              <Lock className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-800 mt-2">Lock Control</span>
            <span className="text-[10px] text-slate-500">অটো-লক পলিসি ও কোড</span>
          </button>

        </div>
      </div>

      {/* 5. Live Financed Fleet Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">
              {lang === 'bn' ? 'সাম্প্রতিক ফাইন্যান্সড ডিভাইস ও লাইভ স্ট্যাটাস' : 'Active Financed Devices'}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('devices')}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            {lang === 'bn' ? 'সব ডিভাইস দেখুন →' : 'View All Fleet →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <th className="py-2.5 px-3">Device & IMEI</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Live Status</th>
                <th className="py-2.5 px-3">Finance Status</th>
                <th className="py-2.5 px-3">Battery</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-sm text-slate-700">
                      {lang === 'bn' ? 'কোনো ডিভাইস এখনো এনরোল করা হয়নি' : 'No financed devices enrolled yet'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {lang === 'bn' 
                        ? 'কিস্তিতে বিক্রয়ের সময় ডিভাইস স্বয়ংক্রিয়ভাবে এনরোল হবে অথবা "Add Device" থেকে যোগ করুন।' 
                        : 'Devices will auto-enroll on financed EMI sales or add manually.'}
                    </div>
                  </td>
                </tr>
              ) : (
                devices.slice(0, 5).map(dev => (
                  <tr key={dev.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{dev.model}</div>
                      <div className="text-[10px] font-mono text-slate-500">{dev.imei1}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{dev.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{dev.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dev.liveStatus === 'online' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dev.liveStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {dev.liveStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        dev.lockStatus === 'LOCKED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {dev.lockStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {dev.batteryPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setActiveTab('devices')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition cursor-pointer"
                      >
                        Control
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
  );
};
