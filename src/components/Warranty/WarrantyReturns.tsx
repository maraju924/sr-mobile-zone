import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RotateCcw, 
  Wrench, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Clock, 
  Smartphone, 
  Calendar,
  FileText,
  User,
  Phone,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReturnClaim, ClaimStatus, ClaimType, Sale } from '../../types';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

export const WarrantyReturns: React.FC = () => {
  const { sales, returns, addReturnClaim, updateClaimStatus, formatCurrency, t } = useApp();

  // Search Serial / IMEI
  const [searchSerial, setSearchSerial] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    sale: Sale;
    item: Sale['items'][0];
    isUnderWarranty: boolean;
    daysLeft: number;
    serial: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'claim_serial' | 'claim_invoice' | null>(null);

  // New Claim Modal
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [claimInvoice, setClaimInvoice] = useState('');
  const [claimProductName, setClaimProductName] = useState('');
  const [claimSerial, setClaimSerial] = useState('');
  const [claimCustomer, setClaimCustomer] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('warranty_repair');
  const [claimReason, setClaimReason] = useState('');
  const [claimRefundAmount, setClaimRefundAmount] = useState<number>(0);

  // Status update modal
  const [updatingClaim, setUpdatingClaim] = useState<ReturnClaim | null>(null);
  const [nextStatus, setNextStatus] = useState<ClaimStatus>('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Handle Lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = searchSerial.toLowerCase().trim();
    if (!q) {
      setLookupResult(null);
      return;
    }

    let foundMatch: {
      sale: Sale;
      item: Sale['items'][0];
      isUnderWarranty: boolean;
      daysLeft: number;
      serial: string;
    } | null = null;

    for (const sale of sales) {
      for (const item of sale.items) {
        const matchSerial = (item.serialNumbers || []).some(s => s.toLowerCase().includes(q));
        const matchInvoice = sale.invoiceNumber.toLowerCase() === q;

        if (matchSerial || matchInvoice) {
          const expDate = new Date(item.warrantyExpiryDate);
          const now = new Date();
          const diffTime = expDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isUnder = daysLeft > 0 && item.warrantyMonths > 0;

          foundMatch = {
            sale,
            item,
            isUnderWarranty: isUnder,
            daysLeft: Math.max(0, daysLeft),
            serial: matchSerial ? (item.serialNumbers.find(s => s.toLowerCase().includes(q)) || q) : (item.serialNumbers[0] || 'N/A')
          };
          break;
        }
      }
      if (foundMatch) break;
    }

    setLookupResult(foundMatch);
  };

  // Pre-fill claim from lookup
  const handleClaimFromLookup = () => {
    if (!lookupResult) return;
    setClaimInvoice(lookupResult.sale.invoiceNumber);
    setClaimProductName(lookupResult.item.productName);
    setClaimSerial(lookupResult.serial);
    setClaimCustomer(lookupResult.sale.customerName);
    setClaimPhone(lookupResult.sale.customerPhone);
    setClaimType('warranty_repair');
    setClaimReason('');
    setClaimRefundAmount(0);
    setIsNewClaimModalOpen(true);
  };

  // Submit new claim
  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimProductName.trim()) return;

    addReturnClaim({
      invoiceNumber: claimInvoice.trim() || 'N/A',
      productName: claimProductName.trim(),
      serialNumber: claimSerial.trim() || 'N/A',
      customerName: claimCustomer.trim() || 'General Customer',
      customerPhone: claimPhone.trim() || 'N/A',
      claimType,
      reason: claimReason.trim(),
      refundAmount: claimType === 'return' ? claimRefundAmount : 0,
      status: 'pending'
    });

    setIsNewClaimModalOpen(false);
  };

  // Save Claim Status Update
  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingClaim) return;
    updateClaimStatus(updatingClaim.id, nextStatus, resolutionNotes);
    setUpdatingClaim(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              {t('পণ্যের ওয়ারেন্টি ও রিটার্ন ট্র্যাকিং', 'Product Warranty & Return Tracking')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('IMEI/সিরিয়াল বা ইনভয়েস দিয়ে ওয়ারেন্টি ভেরিফিকেশন ও ক্লেইম রেজিস্ট্রি', 'Verify electronics warranty validity and handle repair / replacement / return tickets')}
            </p>
          </div>

          <button
            onClick={() => {
              setClaimInvoice('');
              setClaimProductName('');
              setClaimSerial('');
              setClaimCustomer('');
              setClaimPhone('');
              setClaimType('warranty_repair');
              setClaimReason('');
              setClaimRefundAmount(0);
              setIsNewClaimModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('+ নতুন ওয়ারেন্টি / রিটার্ন টিকেট', '+ New Claim Ticket')}</span>
          </button>
        </div>

        {/* Quick IMEI / Serial Lookup Box */}
        <form onSubmit={handleLookup} className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {t('দ্রুত ওয়ারেন্টি যাচাই (IMEI / সিরিয়াল নম্বর বা ইনভয়েস দিয়ে সার্চ করুন)', 'Instant Warranty Check (Search by IMEI, Serial, or Invoice #)')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                placeholder={t('যেমন: 359284112938471 অথবা INV-2026-0001...', 'e.g. 359284112938471 or INV-2026-0001...')}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setScannerTarget('search');
                setIsScannerOpen(true);
              }}
              className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-xl transition"
              title="ক্যামেরা দিয়ে বারকোড বা IMEI স্ক্যান করুন"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>{t('যাচাই করুন', 'Verify')}</span>
            </button>
          </div>
        </form>

        {/* Lookup Result Card */}
        {hasSearched && (
          <div className="mt-3">
            {lookupResult ? (
              <div className="p-4 rounded-xl border bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      lookupResult.isUnderWarranty ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {lookupResult.isUnderWarranty ? t('ওয়ারেন্টি সচল আছে (Active)', 'Active Warranty') : t('ওয়ারেন্টির মেয়াদ শেষ (Expired)', 'Warranty Expired')}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ইনভয়েস: {lookupResult.sale.invoiceNumber}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {lookupResult.item.productName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                    <span>IMEI: <b className="font-mono text-slate-800">{lookupResult.serial}</b></span>
                    <span>•</span>
                    <span>{t('ক্রয়ের তারিখ:', 'Purchased:')} {new Date(lookupResult.sale.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{t('মেয়াদ শেষ:', 'Expiry:')} {new Date(lookupResult.item.warrantyExpiryDate).toLocaleDateString()}</span>
                    {lookupResult.isUnderWarranty && (
                      <span className="text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded">
                        {lookupResult.daysLeft} {t('দিন বাকি রয়েছে', 'days remaining')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClaimFromLookup}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                >
                  {t('ক্লেইম টিকেট তৈরি করুন', 'Create Claim Ticket')}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('উক্ত IMEI বা ইনভয়েসের বিপরীতে বিক্রয় রেকর্ড পাওয়া যায়নি। নম্বরটি পুনরায় চেক করুন।', 'No sales record found matching this IMEI or invoice number. Please verify input.')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
          {t('ওয়ারেন্টি ক্লেইম ও প্রোডাক্ট রিটার্ন তালিকা', 'Active Warranty Claims & Returns Log')} ({returns.length})
        </h3>

        {returns.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-medium">{t('কোন ওয়ারেন্টি ক্লেইম বা রিটার্ন রেকর্ড নেই', 'No warranty or return claims yet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {returns.map((claim) => (
              <div 
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {claim.invoiceNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      claim.status === 'repaired' || claim.status === 'replaced' || claim.status === 'refunded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status === 'pending' ? t('পেন্ডিং', 'Pending') :
                       claim.status === 'under_inspection' ? t('পরীক্ষাধীন', 'Under Inspection') :
                       claim.status === 'repaired' ? t('মেরামত সম্পন্ন', 'Repaired') :
                       claim.status === 'replaced' ? t('প্রতিস্থাপন দেওয়া হয়েছে', 'Replaced') :
                       claim.status === 'refunded' ? t('টাকা ফেরত', 'Refunded') : t('বাতিল', 'Rejected')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm leading-snug">
                    {claim.productName}
                  </h4>
                  
                  {claim.serialNumber && claim.serialNumber !== 'N/A' && (
                    <div className="text-[11px] font-mono text-indigo-600 mt-1">
                      IMEI: {claim.serialNumber}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{claim.customerName} ({claim.customerPhone})</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 mt-2">
                      <b className="text-[11px] text-slate-500 block mb-0.5">{t('সমস্যা / কারণ:', 'Issue / Reason:')}</b>
                      {claim.reason}
                    </div>

                    {claim.notes && (
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900 text-[11px] mt-1">
                        <b>{t('সমাধান নোট:', 'Resolution:')}</b> {claim.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      setUpdatingClaim(claim);
                      setNextStatus(claim.status);
                      setResolutionNotes(claim.notes || '');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    {t('স্ট্যাটাস আপডেট করুন', 'Update Status')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Claim Modal */}
      {isNewClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto border border-slate-100 animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t('নতুন ওয়ারেন্টি / রিটার্ন টিকেট', 'New Claim / Return Ticket')}</h3>
              <button onClick={() => setIsNewClaimModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveClaim} className="p-5 sm:p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('পণ্যের নাম ও মডেল *', 'Product Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={claimProductName}
                  onChange={(e) => setClaimProductName(e.target.value)}
                  placeholder="যেমন: Sony Bravia 55 inch TV..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('ইনভয়েস নম্বর', 'Invoice #')}
                  </label>
                  <input
                    type="text"
                    value={claimInvoice}
                    onChange={(e) => setClaimInvoice(e.target.value)}
                    placeholder="INV-2026-..."
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      {t('IMEI বা সিরিয়াল নম্বর', 'IMEI or Serial No')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('claim_serial');
                        setIsScannerOpen(true);
                      }}
                      className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Camera className="w-3 h-3" />
                      <span>স্ক্যান</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={claimSerial}
                    onChange={(e) => setClaimSerial(e.target.value)}
                    placeholder="SN-..."
                    className="w-full px-3 py-1.5 font-mono text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('ক্রেতার নাম', 'Customer Name')}
                  </label>
                  <input
                    type="text"
                    value={claimCustomer}
                    onChange={(e) => setClaimCustomer(e.target.value)}
                    placeholder="গ্রাহকের নাম"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('মোবাইল নম্বর', 'Customer Phone')}
                  </label>
                  <input
                    type="tel"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    placeholder="০১৭..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('টিকেটের ধরন', 'Claim Type')}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'warranty_repair', labelBn: 'ওয়ারেন্টি মেরামত', labelEn: 'Repair' },
                    { id: 'replacement', labelBn: 'পণ্য পরিবর্তন', labelEn: 'Replace' },
                    { id: 'return', labelBn: 'রিটার্ন / রিফান্ড', labelEn: 'Return' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setClaimType(item.id as ClaimType)}
                      className={`py-2 rounded-lg border text-center font-medium transition ${
                        claimType === item.id ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t(item.labelBn, item.labelEn)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('সমস্যার বিবরণ / ত্রুটি *', 'Issue Description *')}
                </label>
                <textarea
                  required
                  rows={3}
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder={t('যেমন: ডিসপ্লেতে লাইন এসেছে, সাউন্ড হচ্ছে না...', 'e.g. Display lines, no power...')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              {claimType === 'return' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('ফেরতকৃত টাকার পরিমাণ (৳)', 'Refund Amount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={claimRefundAmount}
                    onChange={(e) => setClaimRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClaimModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                >
                  {t('টিকেট খুলুন', 'Open Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Claim Status Modal */}
      {updatingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">{t('টিকেট স্ট্যাটাস পরিবর্তন', 'Update Claim Status')}</h4>
              <button onClick={() => setUpdatingClaim(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('নতুন স্ট্যাটাস:', 'New Status:')}</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ClaimStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="pending">{t('পেন্ডিং', 'Pending')}</option>
                  <option value="under_inspection">{t('পরীক্ষাধীন / সার্ভিসিং চলছে', 'Under Inspection')}</option>
                  <option value="repaired">{t('মেরামত সম্পন্ন (Repaired)', 'Repaired')}</option>
                  <option value="replaced">{t('নতুন পণ্য দেওয়া হয়েছে (Replaced)', 'Replaced')}</option>
                  <option value="refunded">{t('টাকা রিফান্ড করা হয়েছে (Refunded)', 'Refunded')}</option>
                  <option value="rejected">{t('দাবি বাতিল (Rejected)', 'Rejected')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('সমাধান বা সার্ভিসিং নোট:', 'Resolution Notes:')}</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={t('যেমন: মাদারবোর্ড রিপ্লেস করা হয়েছে এবং গ্রাহককে ডেলিভারি দেওয়া হয়েছে...', 'e.g. Component replaced...')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                >
                  {t('সংরক্ষণ করুন', 'Save Status')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Barcode / IMEI Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'claim_serial') {
            setClaimSerial(code);
          } else if (scannerTarget === 'claim_invoice') {
            setClaimInvoice(code);
          } else {
            setSearchSerial(code);
          }
          setIsScannerOpen(false);
        }}
      />

    </div>
  );
};
