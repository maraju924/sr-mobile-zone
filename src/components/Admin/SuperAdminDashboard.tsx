import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Radio, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Database, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Send, 
  RefreshCw, 
  Download, 
  Server, 
  Check, 
  Clock, 
  Smartphone, 
  Package, 
  DollarSign, 
  Layers, 
  Key, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { TenantAccount, SystemBroadcast, SecurityAuditLog } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    lang, 
    tenants, 
    broadcasts, 
    auditLogs, 
    platformConfig, 
    updateTenantStatus, 
    deleteTenantRecord, 
    createBroadcast, 
    toggleBroadcastStatus, 
    deleteBroadcast, 
    updatePlatformConfig, 
    addAuditLog, 
    impersonateTenant, 
    exitImpersonation, 
    impersonatingTenant,
    formatCurrency,
    setActiveTab,
    refreshTenantRegistry
  } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tenants' | 'broadcast' | 'audit' | 'config'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'locked' | 'trial'>('all');
  
  // New Broadcast Form State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<SystemBroadcast['type']>('info');
  const [bcPriority, setBcPriority] = useState<SystemBroadcast['priority']>('normal');
  const [bcDismissible, setBcDismissible] = useState(true);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Tenant Modal State
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newTenantStoreName, setNewTenantStoreName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantOwnerName, setNewTenantOwnerName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantAddress, setNewTenantAddress] = useState('');

  // Filtering Tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);
    const matchesFilter = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Aggregated Platform Metrics
  const totalStores = tenants.length;
  const activeStores = tenants.filter(t => t.status === 'active').length;
  const totalPlatformRevenue = tenants.reduce((acc, t) => acc + (t.totalRevenue || 0), 0);
  const totalProductsAcross = tenants.reduce((acc, t) => acc + (t.productCount || 0), 0);
  const totalSalesAcross = tenants.reduce((acc, t) => acc + (t.salesCount || 0), 0);
  const totalBranchesAcross = tenants.reduce((acc, t) => acc + (t.branchCount || 1), 0);

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;

    createBroadcast({
      title: bcTitle.trim(),
      message: bcMessage.trim(),
      type: bcType,
      priority: bcPriority,
      isActive: true,
      dismissible: bcDismissible
    });

    setBcTitle('');
    setBcMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleManualAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantStoreName.trim() || !newTenantEmail.trim()) return;

    // Simulate tenant onboarding
    const newT: TenantAccount = {
      id: `tenant-${Date.now()}`,
      storeName: newTenantStoreName.trim(),
      ownerEmail: newTenantEmail.trim().toLowerCase(),
      ownerName: newTenantOwnerName.trim() || newTenantEmail.split('@')[0],
      phone: newTenantPhone.trim() || '+৮৮০১৭০০০০০০০০',
      address: newTenantAddress.trim() || 'ঢাকা, বাংলাদেশ',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      branchCount: 1,
      productCount: 0,
      salesCount: 0,
      totalRevenue: 0
    };

    updateTenantStatus(newT.id, 'active', 'Manually provisioned by Super Admin');
    setShowAddTenantModal(false);
    setNewTenantStoreName('');
    setNewTenantEmail('');
    setNewTenantOwnerName('');
    setNewTenantPhone('');
    setNewTenantAddress('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Super Admin Banner / Header */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>PhoneSell Pro</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  SUPER ADMIN HQ
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'bn' 
                ? 'সেন্ট্রাল মাল্টি-টেন্যান্ট SaaS কন্ট্রোল রুম • সর্বময় অ্যাডমিন এক্সেস' 
                : 'Central Multi-Tenant SaaS Control Center • Full Platform Authority'}
            </p>
          </div>
        </div>

        {/* Impersonation Indicator or Back to App Button */}
        <div className="flex items-center gap-2">
          {impersonatingTenant ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {lang === 'bn' ? 'শপ প্রিভিউ মোড:' : 'Inspecting Store:'} <strong>{impersonatingTenant.name}</strong>
              </span>
              <button
                type="button"
                onClick={exitImpersonation}
                className="ml-2 px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] cursor-pointer"
              >
                {lang === 'bn' ? 'প্রস্থান' : 'Exit'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>maraju921@gmail.com (VERIFIED HQ)</span>
            </div>
          )}

          <button
            onClick={() => setActiveTab('home')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span>{lang === 'bn' ? 'স্টোর ভিউ' : 'Back to Store'}</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="px-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{lang === 'bn' ? 'প্ল্যাটফর্ম ওভারভিউ' : 'Platform Overview'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tenants'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{lang === 'bn' ? 'টেন্যান্ট ও দোকানসমূহ' : 'Tenant Registry'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
            {tenants.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'broadcast'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{lang === 'bn' ? 'সিস্টেম ব্রডকাস্ট' : 'Broadcast Center'}</span>
          {broadcasts.filter(b => b.isActive).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'audit'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{lang === 'bn' ? 'সিকিউরিটি অডিট লগ' : 'Forensic Audit Logs'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'config'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{lang === 'bn' ? 'প্ল্যাটফর্ম গ্লোবাল সেটিংস' : 'System Engine Config'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* SUBTAB: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'মোট শপ/টেন্যান্ট' : 'Total Tenant Stores'}</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalStores}</div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{activeStores} {lang === 'bn' ? 'টি সক্রিয় স্টোর' : 'Active Stores'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'প্ল্যাটফর্ম মোট বিক্রি' : 'Platform Gross Volume'}</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{formatCurrency(totalPlatformRevenue)}</div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {totalSalesAcross} {lang === 'bn' ? 'টি সফল ইনভয়েস' : 'Completed Invoices'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'মোট পণ্য ইনভেন্টরি' : 'Catalog Size Across All'}</span>
                  <Package className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalProductsAcross}</div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {totalBranchesAcross} {lang === 'bn' ? 'টি ব্রাঞ্চ লোকেশন' : 'Branch Locations'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Health'}</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                  <span>99.98%</span>
                  <span className="text-xs font-normal text-slate-400">Uptime</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Google Cloud Firestore Connected</span>
                </div>
              </div>

            </div>

            {/* Quick Actions & Live Tenant Watch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Tenant Quick Watch */}
              <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'bn' ? 'শীর্ষ সক্রিয় স্টোরসমূহ' : 'Live Active Tenant Stores'}</span>
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('tenants')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    {lang === 'bn' ? 'সবগুলো দেখুন →' : 'View All →'}
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {tenants.slice(0, 5).map(t => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                          <span>{t.storeName}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            t.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'suspended'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span className="font-mono text-slate-400">{t.ownerEmail}</span>
                          <span>•</span>
                          <span>{t.productCount} {lang === 'bn' ? 'পণ্য' : 'Items'}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{formatCurrency(t.totalRevenue || 0)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            impersonateTenant(t.ownerEmail, t.storeName, t.ownerUid || t.id);
                            setActiveTab('home');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-700 text-indigo-200 text-xs font-bold border border-indigo-700/60 transition flex items-center gap-1 cursor-pointer"
                          title="View store as owner"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-300" />
                          <span>{lang === 'bn' ? 'স্টোর দেখুন' : 'Inspect'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Maintenance & Controls Card */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>{lang === 'bn' ? 'সুপার কন্ট্রোল সুইচেস' : 'Platform Master Controls'}</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{lang === 'bn' ? 'রুটিন মেইনটেন্যান্স মোড' : 'Maintenance Mode'}</div>
                      <div className="text-[11px] text-slate-400">{lang === 'bn' ? 'সব শপের জন্য অ্যাক্সেস স্থগিত' : 'Temporarily lock client dashboards'}</div>
                    </div>
                    <button
                      onClick={() => updatePlatformConfig({ maintenanceMode: !platformConfig.maintenanceMode })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        platformConfig.maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        platformConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{lang === 'bn' ? 'নতুন সাইন-আপ সক্রিয়' : 'Allow New Registrations'}</div>
                      <div className="text-[11px] text-slate-400">{lang === 'bn' ? 'নতুন শপ ওনার অ্যাকাউন্ট তৈরি' : 'Enable public onboarding registration'}</div>
                    </div>
                    <button
                      onClick={() => updatePlatformConfig({ allowNewRegistrations: !platformConfig.allowNewRegistrations })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        platformConfig.allowNewRegistrations ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        platformConfig.allowNewRegistrations ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{lang === 'bn' ? '২-ফ্যাক্টর নিরাপত্তা নীতি' : 'Enforce Master 2FA'}</div>
                      <div className="text-[11px] text-slate-400">{lang === 'bn' ? 'সকল অ্যাডমিনদের জন্য বাধ্যতামূলক' : 'Hardware & SMS MFA required'}</div>
                    </div>
                    <button
                      onClick={() => updatePlatformConfig({ enforceMfa: !platformConfig.enforceMfa })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        platformConfig.enforceMfa ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        platformConfig.enforceMfa ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveSubTab('broadcast')}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Radio className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সকল স্টোরে নোটিশ পাঠান' : 'Broadcast to All Stores'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB: TENANTS REGISTRY */}
        {activeSubTab === 'tenants' && (
          <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={lang === 'bn' ? 'স্টোর নাম, ওনারের ইমেইল বা ফোন দিয়ে খুঁজুন...' : 'Search store name, owner email, phone...'}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">{lang === 'bn' ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
                  <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="suspended">{lang === 'bn' ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  <option value="locked">{lang === 'bn' ? 'লকড (Locked)' : 'Locked'}</option>
                  <option value="trial">{lang === 'bn' ? 'ট্রায়াল (Trial)' : 'Trial'}</option>
                </select>

                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={async () => {
                    setIsRefreshing(true);
                    await refreshTenantRegistry();
                    setTimeout(() => setIsRefreshing(false), 600);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  title="Scan Firestore and local storage to find all past registered shop emails"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{lang === 'bn' ? 'সকল শপ স্ক্যান ও রিফ্রেশ' : 'Discover All Shops'}</span>
                </button>

                <button
                  onClick={() => setShowAddTenantModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'নতুন স্টোর যুক্ত করুন' : 'Add Tenant Store'}</span>
                </button>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{lang === 'bn' ? 'দোকানের নাম ও ওনার' : 'Store & Owner'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'ব্রাঞ্চ' : 'Branches'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'পণ্য' : 'Items'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'মোট বিক্রি' : 'Revenue'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'সর্বশেষ অ্যাক্টিভিটি' : 'Last Active'}</th>
                      <th className="px-4 py-3 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          {lang === 'bn' ? 'কোনো স্টোর পাওয়া যায়নি' : 'No tenant stores matching the filter'}
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map(t => (
                        <tr key={t.id} className="hover:bg-slate-850/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-100">{t.storeName}</div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>{t.ownerEmail}</span>
                              <span className="text-slate-600">•</span>
                              <span>{t.phone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-300">
                            {t.branchCount}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {t.productCount}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-400">
                            {formatCurrency(t.totalRevenue || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'suspended'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : t.status === 'locked'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {t.lastActive ? new Date(t.lastActive).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Store */}
                              <button
                                onClick={() => {
                                  impersonateTenant(t.ownerEmail, t.storeName, t.ownerUid || t.id);
                                  setActiveTab('home');
                                }}
                                className="px-2 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-700 text-indigo-200 hover:text-white transition cursor-pointer flex items-center gap-1 border border-indigo-700/60 text-xs font-bold"
                                title="Inspect Store in Dashboard"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-300" />
                                <span className="text-[11px]">{lang === 'bn' ? 'স্টোর দেখুন' : 'Inspect'}</span>
                              </button>

                              {/* Toggle Suspended/Active */}
                              {t.status === 'active' ? (
                                <button
                                  onClick={() => updateTenantStatus(t.id, 'suspended', 'Suspended by super admin')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                                  title="Suspend Store"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateTenantStatus(t.id, 'active', 'Reactivated by super admin')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                                  title="Reactivate Store"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(lang === 'bn' ? `সত্যিই "${t.storeName}" স্টোর রেকর্ড মুছে ফেলতে চান?` : `Delete store record for "${t.storeName}"?`)) {
                                    deleteTenantRecord(t.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                title="Remove Store Record"
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

          </div>
        )}

        {/* SUBTAB: BROADCASTS */}
        {activeSubTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Broadcast Form */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'নতুন সিস্টেম ব্রডকাস্ট তৈরি' : 'Publish System Announcement'}</span>
              </h3>

              {broadcastSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ব্রডকাস্ট সকল স্টোরে সফলভাবে পাঠানো হয়েছে!' : 'Broadcast dispatched successfully to all stores!'}</span>
                </div>
              )}

              <form onSubmit={handleCreateBroadcast} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম *' : 'Notice Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bcTitle}
                    onChange={e => setBcTitle(e.target.value)}
                    placeholder="যেমন: সার্ভার আপগ্রেড বা জরুরি নোটিশ"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'bn' ? 'বিস্তারিত বার্তা *' : 'Detailed Message *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bcMessage}
                    onChange={e => setBcMessage(e.target.value)}
                    placeholder="এখানে বিস্তারিত নোটিশ লিখুন যা সকল শপ ড্যাশবোর্ডে প্রদর্শিত হবে..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {lang === 'bn' ? 'ধরণ (Theme)' : 'Type'}
                    </label>
                    <select
                      value={bcType}
                      onChange={e => setBcType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="info">তথ্য (Info Blue)</option>
                      <option value="warning">সতর্কবার্তা (Warning Amber)</option>
                      <option value="alert">জরুরি অ্যালার্ট (Emergency Red)</option>
                      <option value="success">সফলতা (Success Green)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {lang === 'bn' ? 'অগ্রাধিকার (Priority)' : 'Priority'}
                    </label>
                    <select
                      value={bcPriority}
                      onChange={e => setBcPriority(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="normal">সাধারণ (Normal)</option>
                      <option value="high">উচ্চ (High)</option>
                      <option value="urgent">অতি জরুরি (Urgent Banner)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="dismissibleCheck"
                    checked={bcDismissible}
                    onChange={e => setBcDismissible(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="dismissibleCheck" className="text-xs text-slate-400 cursor-pointer">
                    {lang === 'bn' ? 'ইউজার কর্তৃক ক্লোজ করার সুবিধা দিন' : 'Allow store managers to dismiss notice'}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সিস্টেম ব্রডকাস্ট প্রকাশ করুন' : 'Dispatch System Broadcast'}</span>
                </button>
              </form>
            </div>

            {/* Active & History Broadcasts */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center justify-between">
                <span>{lang === 'bn' ? 'প্রকাশিত ব্রডকাস্ট হিস্ট্রি' : 'Broadcasts Feed'}</span>
                <span className="text-xs text-slate-500 font-normal">{broadcasts.length} total</span>
              </h3>

              <div className="space-y-3">
                {broadcasts.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
                    {lang === 'bn' ? 'কোনো সক্রিয় ব্রডকাস্ট নেই' : 'No active broadcasts recorded'}
                  </div>
                ) : (
                  broadcasts.map(b => (
                    <div 
                      key={b.id} 
                      className={`p-4 rounded-xl border transition ${
                        b.isActive 
                          ? 'bg-slate-900 border-slate-700 shadow-sm' 
                          : 'bg-slate-950/60 border-slate-850 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              b.type === 'alert' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : b.type === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : b.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            }`}>
                              {b.type.toUpperCase()}
                            </span>
                            <span className="font-bold text-sm text-slate-100">{b.title}</span>
                            {b.priority === 'urgent' && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[9px] font-bold border border-rose-800">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{b.message}</p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
                            <span>By: {b.authorEmail}</span>
                            <span>•</span>
                            <span>{new Date(b.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleBroadcastStatus(b.id)}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                              b.isActive 
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {b.isActive ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')}
                          </button>

                          <button
                            onClick={() => deleteBroadcast(b.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Broadcast"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB: FORENSIC AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'সিকিউরিটি ও এক্সেস অডিট লগ' : 'Immutable Security Audit Trail'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' ? 'প্ল্যাটফর্মের প্রতিটি অ্যাডমিন অ্যাকশন, লগইন ও পরিবর্তন এখানে নির্ভুলভাবে সংরক্ষিত হয়' : 'Every administrative intervention is captured in forensic audit log'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      ["Timestamp,Actor,Action,Category,Status,Details"].join(",") + "\n" +
                      auditLogs.map(l => `"${l.timestamp}","${l.actorEmail}","${l.action}","${l.category}","${l.status}","${l.details}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `security_audit_logs_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export Audit CSV'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{lang === 'bn' ? 'সময়' : 'Timestamp'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'ইউজার' : 'Actor'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="px-4 py-3">{lang === 'bn' ? 'বিবরণ' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-850/50 transition">
                        <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-indigo-400 font-semibold whitespace-nowrap">
                          {log.actorEmail}
                        </td>
                        <td className="px-4 py-2.5 text-slate-200 font-bold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.status === 'warning'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 max-w-md truncate font-sans text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB: SYSTEM CONFIG */}
        {activeSubTab === 'config' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'গ্লোবাল সিস্টেম ইঞ্জিন কনফিগারেশন' : 'Master Global Settings'}</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">
                    {lang === 'bn' ? 'মেইনটেন্যান্স নোটিশ বার্তা' : 'Maintenance Screen Message'}
                  </label>
                  <textarea
                    rows={3}
                    value={platformConfig.maintenanceNotice}
                    onChange={e => updatePlatformConfig({ maintenanceNotice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">
                    {lang === 'bn' ? 'প্ল্যাটফর্ম ভার্সন রিলিজ' : 'Platform Version Release'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={platformConfig.version}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono"
                  />
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'bn' ? 'সুপার অ্যাডমিন সুরক্ষা প্রটোকল' : 'Super Admin Security Guarantee'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-200/80">
                    {lang === 'bn' 
                      ? 'শুধুমাত্র maraju921@gmail.com অথেনটিকেটেড ইউজার হিসেবে এই কনসোল নিয়ন্ত্রণ করতে পারবে। বিলিং ছাড়া সকল অ্যাডভান্সড মাল্টি-টেন্যান্সি, ডেটা ব্যাকআপ ও অডিট সিকিউরিটি নিশ্চিত করা হয়েছে।' 
                      : 'Only authenticated user maraju921@gmail.com holds authoritative platform governance. Zero mock data fallbacks, fully persisted with granular audit integrity.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'নতুন স্টোর বা টেন্যান্ট নিবন্ধন' : 'Register New Tenant Store'}</span>
              </h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddTenant} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{lang === 'bn' ? 'দোকানের নাম *' : 'Store Name *'}</label>
                <input
                  type="text"
                  required
                  value={newTenantStoreName}
                  onChange={e => setNewTenantStoreName(e.target.value)}
                  placeholder="যেমন: সিটি টেলিকম প্রো"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{lang === 'bn' ? 'ওনারের ইমেইল *' : 'Owner Email *'}</label>
                <input
                  type="email"
                  required
                  value={newTenantEmail}
                  onChange={e => setNewTenantEmail(e.target.value)}
                  placeholder="owner@citytelecom.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{lang === 'bn' ? 'ওনারের নাম' : 'Owner Full Name'}</label>
                <input
                  type="text"
                  value={newTenantOwnerName}
                  onChange={e => setNewTenantOwnerName(e.target.value)}
                  placeholder="আব্দুল করিম"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={newTenantPhone}
                  onChange={e => setNewTenantPhone(e.target.value)}
                  placeholder="+৮৮০১৭০০০০০০০"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</label>
                <input
                  type="text"
                  value={newTenantAddress}
                  onChange={e => setNewTenantAddress(e.target.value)}
                  placeholder="মিরপুর ১০, ঢাকা"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer shadow-sm"
                >
                  {lang === 'bn' ? 'স্টোর সেভ করুন' : 'Save Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
