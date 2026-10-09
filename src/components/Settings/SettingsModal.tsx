import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Download, 
  Upload, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Shield,
  Save,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsModal: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    syncNow, 
    downloadBackup, 
    restoreBackup, 
    user,
    currentUser,
    authLogout,
    login,
    logout,
    t 
  } = useApp();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [vatPercent, setVatPercent] = useState(settings.vatPercent);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoiceFooter);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      vatPercent,
      currencySymbol: currencySymbol.trim(),
      invoiceFooter: invoiceFooter.trim()
    });

    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = restoreBackup(text);
        alert(res.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            {t('স্টোর সেটিংস, ব্যাকআপ ও সিঙ্ক ব্যবস্থাপনা', 'Store Settings, Backup & Sync Management')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('দোকানের প্রোফাইল, রসিদ ফুটনোট, লোকাল ব্যাকআপ ও ফায়ারবেজ ক্লাউড সিঙ্ক', 'Shop profile, receipt footnote, backup restore & cloud database')}
          </p>
        </div>

        {isSavedAlert && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{t('সেটিংস সংরক্ষিত হয়েছে!', 'Settings Saved!')}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Store Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-600" />
            {t('দোকানের প্রোফাইল ও ইনভয়েস কনফিগারেশন', 'Store Profile & Invoice Details')}
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('দোকানের নাম (ইনভয়েসে প্রদর্শিত হবে) *', 'Store Name (Shown on Invoices) *')}
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('যোগাযোগের ফোন নম্বর *', 'Contact Phone Number *')}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('কারেন্সি সিম্বল', 'Currency Symbol')}
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-center focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('দোকানের পূর্ণ ঠিকানা', 'Physical Shop Address')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('ডিফল্ট ভ্যাট / ট্যাক্স হার (%)', 'Default VAT / Tax Rate (%)')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={vatPercent}
                onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
                className="w-32 px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('ইনভয়েস ফুটার নোট ও ওয়ারেন্টি নোটিশ', 'Invoice Footer Note & Warranty Policy')}
              </label>
              <textarea
                rows={3}
                value={invoiceFooter}
                onChange={(e) => setInvoiceFooter(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('সেটিংস সংরক্ষণ করুন', 'Save Settings')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Cloud Sync, Backup & Restore */}
        <div className="space-y-6">
          
          {/* Cloud Database & Sync Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-indigo-600" />
                {t('ফায়ারবেজ ক্লাউড সিঙ্ক', 'Firebase Cloud Sync')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isOnline ? t('অনলাইন মোড', 'Online') : t('অফলাইন মোড', 'Offline')}
              </span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              {t(
                'অ্যাপ্লিকেশনটি অফলাইনেও সম্পূর্ণ সচল থাকে। ইন্টারনেট সংযোগ পেলে স্বয়ংক্রিয়ভাবে ফায়ারবেজ ফায়ারস্টোরে সব ডাটা সিঙ্ক হয়।',
                'Works completely offline with local storage caching. Automatically syncs with Firebase Firestore when online.'
              )}
            </p>

            {(currentUser || user) ? (
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-indigo-900">
                        {currentUser?.name || user?.displayName || 'Authorized User'}
                      </p>
                      <p className="text-[10px] text-indigo-600 font-mono">
                        {currentUser?.email || user?.email}
                      </p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        আইসোলেটেড স্পেস
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={authLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    title={t('লগআউট', 'Sign out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  onClick={login}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('গুগল দিয়ে ক্লাউড লগইন করুন', 'Sign In with Google to Sync')}</span>
                </button>
              </div>
            )}

            <button
              onClick={syncNow}
              disabled={isSyncing || !isOnline}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t('সিঙ্ক হচ্ছে...', 'Syncing...') : t('এখনই ক্লাউডে সিঙ্ক করুন', 'Sync to Cloud Now')}</span>
            </button>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              {t('ডেটা ব্যাকআপ ও রিস্টোর', 'Database Backup & Restore')}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t('আপনার সকল ইনভেন্টরি পণ্য, বিক্রয় ইনভয়েস, কিস্তি চুক্তি ও কাস্টমার লেজার নিরাপদে ডাউনলোড ও রিস্টোর করুন।', 'Export or import your complete store records as standard JSON files.')}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={downloadBackup}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('ব্যাকআপ ফাইল ডাউনলোড', 'Export Backup')}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('ফাইল রিস্টোর', 'Import Backup')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Firebase Cloud Sync Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>{t('১০০% ফায়ারবেজ লাইভ ডাটাবেজ', '100% Firebase Live Database')}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Realtime Firestore</span>
            </div>
          </div>

          {/* Developer Attribution & Software Info Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                {t('সফটওয়্যার পরিচিতি ও ডেভেলপমেন্ট', 'Software Information & Development')}
              </span>
              <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-md text-[10px] font-mono">
                v2.4 Pro
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>ElectroPOS - ইলেকট্রনিক্স শপ সলিউশন</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {t('ইনভেন্টরি, কিস্তি, বাকি খতিয়ান, অডিট ও বিলিংয়ের পূর্ণাঙ্গ অটোমেশন সফটওয়্যার।', 'Complete POS & Store Management Software Solution.')}
              </p>
            </div>

            <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('সফটওয়্যার তৈরি করেছে:', 'Software Developed by:')}</span>
                <span className="text-sm font-bold text-indigo-300">www.fb.com/9alamin</span>
              </div>

              <a
                href="https://www.fb.com/9alamin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                {t('যোগাযোগ / প্রোফাইল', 'View Profile')}
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
