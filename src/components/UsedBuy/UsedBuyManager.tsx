import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UsedBuyRecord, InspectionChecklist } from '../../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Smartphone, 
  User, 
  ShieldCheck, 
  DollarSign, 
  Battery, 
  Trash2, 
  AlertTriangle,
  FileCheck,
  Building2,
  Calendar,
  Check,
  Camera,
  ShoppingCart,
  Store
} from 'lucide-react';
import { PrintUsedAgreementModal } from './PrintUsedAgreementModal';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';
import { Product } from '../../types';

export const UsedBuyManager: React.FC = () => {
  const { 
    usedBuys, 
    addUsedBuy, 
    deleteUsedBuy, 
    branch, 
    lang, 
    formatCurrency, 
    addProduct,
    products,
    addToCart,
    setActiveTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecordToPrint, setSelectedRecordToPrint] = useState<UsedBuyRecord | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'imei1' | null>(null);

  // Auto-sync used buys to products if not yet enrolled
  useEffect(() => {
    usedBuys.forEach(rec => {
      const exists = products.some(p => p.barcode === rec.imei1 || (p.serialNumbers && p.serialNumbers.includes(rec.imei1)));
      if (!exists) {
        addProduct({
          name: `${rec.brand} ${rec.model} (${rec.storage || ''}) - [ব্যবহৃত / Grade ${rec.grade}]`,
          brand: rec.brand,
          category: 'ব্যবহৃত স্মার্টফোন (Pre-owned)',
          barcode: rec.imei1,
          purchasePrice: rec.buyPrice,
          sellingPrice: rec.estimatedResalePrice || Math.round(rec.buyPrice * 1.15),
          stock: 1,
          minStockAlert: 1,
          warrantyMonths: 1,
          serialNumbers: [rec.imei1, ...(rec.imei2 ? [rec.imei2] : [])]
        });
      }
    });
  }, [usedBuys, products, addProduct]);

  // Quick Action: Sell in POS
  const handleSellInPos = (rec: UsedBuyRecord) => {
    let target = products.find(p => p.barcode === rec.imei1 || (p.serialNumbers && p.serialNumbers.includes(rec.imei1)));
    if (!target) {
      target = {
        id: `prod_used_${rec.id}`,
        ownerId: 'admin',
        name: `${rec.brand} ${rec.model} (${rec.storage || ''}) - [ব্যবহৃত / Grade ${rec.grade}]`,
        brand: rec.brand,
        category: 'ব্যবহৃত স্মার্টফোন (Pre-owned)',
        barcode: rec.imei1,
        purchasePrice: rec.buyPrice,
        sellingPrice: rec.estimatedResalePrice || Math.round(rec.buyPrice * 1.15),
        stock: 1,
        minStockAlert: 1,
        warrantyMonths: 1,
        serialNumbers: [rec.imei1, ...(rec.imei2 ? [rec.imei2] : [])],
        createdAt: new Date().toISOString()
      };
      addProduct(target);
    }
    addToCart(target, 1, [rec.imei1]);
    setActiveTab('pos');
  };

  // Form State
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [idType, setIdType] = useState<UsedBuyRecord['idType']>('NID');
  const [idNumber, setIdNumber] = useState('');
  const [sellerConfirmedOwnership, setSellerConfirmedOwnership] = useState(true);

  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('Black');
  const [storage, setStorage] = useState('128 GB');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [condition, setCondition] = useState<UsedBuyRecord['condition']>('Used');
  const [grade, setGrade] = useState<UsedBuyRecord['grade']>('A');
  const [batteryHealthPercent, setBatteryHealthPercent] = useState('88');
  const [buyPrice, setBuyPrice] = useState('24000');
  const [estimatedResalePrice, setEstimatedResalePrice] = useState('29000');
  const [paidFromAccount, setPaidFromAccount] = useState('Cash in Hand');

  // Inspection Checklist State
  const [inspection, setInspection] = useState<InspectionChecklist>({
    display: true,
    touch: true,
    camera: true,
    speaker: true,
    mic: true,
    wifi: true,
    sim: true,
    charging: true,
    buttons: true,
    icloudOrGoogleCleared: true,
    frpCleared: true,
    screenLockRemoved: true,
    boxIncluded: true,
    chargerIncluded: false,
    originalMatchesImei: true,
    glassCracked: false,
    repairedBefore: false,
    scratchNotes: ''
  });

  const toggleChecklist = (key: keyof InspectionChecklist) => {
    setInspection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveUsedBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName || !sellerPhone || !idNumber || !imei1 || !model) {
      alert('অনুগ্রহ করে বিক্রেতার তথ্য ও ফোনের মডেল/IMEI পূরণ করুন!');
      return;
    }

    if (!sellerConfirmedOwnership) {
      alert('বিক্রেতাকে ডিভাইসের প্রকৃত ও আইনি মালিক মর্মে ঘোষণা দিতে হবে!');
      return;
    }

    const priceNum = parseFloat(buyPrice) || 0;
    const resaleNum = parseFloat(estimatedResalePrice) || 0;

    const newRecord = addUsedBuy({
      branch,
      buyReceiptNo: `UB-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      sellerName,
      sellerPhone,
      sellerAddress,
      idType,
      idNumber,
      sellerConfirmedOwnership: true,
      brand,
      model,
      color,
      storage,
      imei1,
      imei2: imei2 || undefined,
      condition,
      grade,
      batteryHealthPercent: parseInt(batteryHealthPercent) || 85,
      buyPrice: priceNum,
      estimatedResalePrice: resaleNum,
      paidFromAccount,
      inspection,
      inspectionNotes: inspection.scratchNotes || 'আইনি চুক্তিপত্র সম্পন্ন করা হয়েছে।',
      agreementPrinted: false
    });

    // Automatically add to Stock / Product Inventory as a pre-owned handset!
    addProduct({
      name: `${brand} ${model} (${storage}) - [Used Grade ${grade}]`,
      brand,
      category: 'ব্যবহৃত স্মার্টফোন (Pre-owned)',
      barcode: imei1,
      purchasePrice: priceNum,
      sellingPrice: resaleNum,
      stock: 1,
      minStockAlert: 1,
      warrantyMonths: 1,
      serialNumbers: [imei1]
    });

    // Reset Form
    setShowAddForm(false);
    setSelectedRecordToPrint(newRecord);
  };

  const filteredRecords = usedBuys.filter(r => 
    r.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.imei1.includes(searchTerm) ||
    r.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sellerPhone.includes(searchTerm) ||
    r.buyReceiptNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100 text-slate-800 space-y-4">
      
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'bn' ? 'পুরনো / ব্যবহৃত ফোন ক্রয় ও আইনি চুক্তিপত্র' : 'Used Phone Buyback (Legal Deed)'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'আইনি ঝুঁকি মুক্ত থাকতে বিক্রেতার NID ও স্বাক্ষরযুক্ত আইনি স্ট্যাম্প চুক্তিপত্র, ১৬-দফা টেকনিক্যাল চেকলিস্ট এবং স্বয়ংক্রিয় স্টক এন্ট্রি।' 
              : 'Legal liability agreement, complete 16-point hardware inspection checklist & stock enrollment.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'ফর্ম লুকান' : 'নতুন ফোন ক্রয় করুন'}</span>
          </button>
        </div>
      </div>

      {/* POS Ready Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200/80 rounded-2xl p-3.5 text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-indigo-950 text-xs sm:text-sm">
              স্বয়ংক্রিয় POS ইন্টিগ্রেশন: ক্রয়কৃত প্রতিটি পুরনো ফোন সরাসরি POS সেকশনে বিক্রির জন্য প্রস্তুত!
            </div>
            <div className="text-[11px] text-slate-600">
              আপনি যখনই কোনো পুরনো ফোন কিনবেন, তা POS টার্মিনালের <strong>'ব্যবহৃত স্মার্টফোন (Pre-owned)'</strong> ক্যাটাগরিতে পাওয়া যাবে। বারকোড গান বা ক্যামেরা দিয়ে IMEI স্ক্যান করেও সরাসরি সেল করতে পারবেন।
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('pos')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition shadow-xs"
        >
          <Store className="w-3.5 h-3.5" />
          <span>POS টার্মিনালে যান</span>
        </button>
      </div>

      {/* NEW USED BUY INTAKE FORM (When toggled open) */}
      {showAddForm && (
        <form onSubmit={handleSaveUsedBuy} className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-lg space-y-6 animate-in fade-in">
          
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                বিক্রেতার পরিচয়পত্র (KYC) ও ব্যবহৃত স্মার্টফোনের বিস্তারিত তথ্য
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">* সকল তথ্য সাবধানে পূরণ করুন</span>
          </div>

          {/* Section 1: Seller KYC */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>১. বিক্রেতার ব্যক্তিগত ও পরিচয়পত্র তথ্য (Seller KYC)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিক্রেতার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="আব্দুল করিম"
                  value={sellerName}
                  onChange={e => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={sellerPhone}
                  onChange={e => setSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পরিচয়পত্রের ধরণ *</label>
                <select
                  value={idType}
                  onChange={e => setIdType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="NID">জাতীয় পরিচয়পত্র (NID)</option>
                  <option value="Passport">পাসপোর্ট (Passport)</option>
                  <option value="Driving Licence">ড্রাইভিং লাইসেন্স</option>
                  <option value="Birth Certificate">জন্ম নিবন্ধন সনদ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আইডি নম্বর (NID / Passport No) *</label>
                <input
                  type="text"
                  required
                  placeholder="1987261920391029"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান ঠিকানা</label>
                <input
                  type="text"
                  placeholder="গ্রাম / রোড, উপজেলা, জেলা"
                  value={sellerAddress}
                  onChange={e => setSellerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <input
                type="checkbox"
                id="sellerOwnership"
                checked={sellerConfirmedOwnership}
                onChange={e => setSellerConfirmedOwnership(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="sellerOwnership" className="text-xs font-bold text-emerald-950 cursor-pointer">
                বিক্রেতা দৃঢ়ভাবে ঘোষণা করিলেন যে, তিনি এই হ্যান্ডসেটের একমাত্র আইনসম্মত মালিক এবং ইহা কোনো চোরাই ফোন নয়।
              </label>
            </div>
          </div>

          {/* Section 2: Phone Specifications */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>২. স্মার্টফোনের ব্র্যান্ড, মডেল ও IMEI স্পেসিফিকেশন</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ব্র্যান্ড</label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="Apple">Apple iPhone</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi / Redmi</option>
                  <option value="Realme">Realme</option>
                  <option value="Vivo">Vivo</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Google">Google Pixel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মডেল *</label>
                <input
                  type="text"
                  required
                  placeholder="iPhone 13 / Galaxy S21"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কালার</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরেজ</label>
                <input
                  type="text"
                  value={storage}
                  onChange={e => setStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">IMEI 1 (১৫ ডিজিট) *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('imei1');
                      setIsScannerOpen(true);
                    }}
                    className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Camera className="w-3 h-3" />
                    <span>ক্যামেরায় স্ক্যান</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="359201948201920"
                  value={imei1}
                  onChange={e => setImei1(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IMEI 2 (ঐচ্ছিক)</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="359201948201921"
                  value={imei2}
                  onChange={e => setImei2(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কন্ডিশন গ্রেড</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="A+">Grade A+ (Like New)</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Good)</option>
                  <option value="C">Grade C (Fair)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ব্যাটারি হেলথ (%)</label>
                <input
                  type="number"
                  value={batteryHealthPercent}
                  onChange={e => setBatteryHealthPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্রয়মূল্য (৳) *</label>
                <input
                  type="number"
                  required
                  value={buyPrice}
                  onChange={e => setBuyPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs text-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সম্ভাব্য বিক্রয়মূল্য (৳)</label>
                <input
                  type="number"
                  value={estimatedResalePrice}
                  onChange={e => setEstimatedResalePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs text-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 16-point Inspection Checklist */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>৩. টেকনিক্যাল পরীক্ষণ ও অ্যাকাউন্ট চেকলিস্ট (16-Point Inspection)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'display', label: 'Display (কোনো দাগ বা লাইন নেই)' },
                { key: 'touch', label: 'Touch Screen (পুরোপুরি স্মুথ)' },
                { key: 'camera', label: 'Front & Back Camera' },
                { key: 'speaker', label: 'Speaker & Audio' },
                { key: 'mic', label: 'Microphone & Calling' },
                { key: 'wifi', label: 'Wi-Fi & Bluetooth' },
                { key: 'sim', label: 'SIM Card Network Detection' },
                { key: 'charging', label: 'Charging Port & Cable' },
                { key: 'buttons', label: 'Power & Volume Buttons' },
                { key: 'icloudOrGoogleCleared', label: 'iCloud / Google Logged Out' },
                { key: 'frpCleared', label: 'FRP Lock Cleared' },
                { key: 'screenLockRemoved', label: 'Screen Password Removed' },
                { key: 'boxIncluded', label: 'Original Box Included' },
                { key: 'chargerIncluded', label: 'Original Charger Included' },
                { key: 'originalMatchesImei', label: 'IMEI Matches Box' },
                { key: 'glassCracked', label: 'Glass Cracked (ভাঙা কাচ)' }
              ].map(item => {
                const isChecked = inspection[item.key as keyof InspectionChecklist];
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => toggleChecklist(item.key as keyof InspectionChecklist)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                      isChecked 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-emerald-600 text-white font-bold' : 'border border-slate-300'
                    }`}>
                      {isChecked ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্ক্র্যাচ / শারীরিক অবস্থা সংক্রান্ত নোট</label>
              <input
                type="text"
                placeholder="যেমন: পেছনের ব্যাকশেল ফ্রেশ, সাইডে স্বাভাবিক ব্যবহারের দাগ..."
                value={inspection.scratchNotes}
                onChange={e => setInspection(prev => ({ ...prev, scratchNotes: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              বাতিল
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-950/20 transition active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>ফোন ক্রয় সম্পন্ন ও চুক্তিপত্র প্রিন্ট করুন</span>
            </button>
          </div>

        </form>
      )}

      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="রশিদ নং, মডেল, IMEI বা বিক্রেতার নাম ও ফোন নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setScannerTarget('search');
            setIsScannerOpen(true);
          }}
          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs transition shrink-0"
          title="IMEI / বারকোড স্ক্যান করুন"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* USED BUYS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Deed No & Date</th>
                <th className="py-3 px-4">Handset Details</th>
                <th className="py-3 px-4">Seller KYC Details</th>
                <th className="py-3 px-4">Pricing & Grade</th>
                <th className="py-3 px-4">Ownership Status</th>
                <th className="py-3 px-4">POS বিক্রয় অবস্থা</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(rec => {
                const linkedProduct = products.find(p => p.barcode === rec.imei1 || (p.serialNumbers && p.serialNumbers.includes(rec.imei1)));
                const inPosStock = linkedProduct ? linkedProduct.stock > 0 : false;
                const isSoldOut = linkedProduct ? linkedProduct.stock === 0 : false;

                return (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 font-mono">{rec.buyReceiptNo}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{rec.date} • {rec.branch}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rec.brand} {rec.model}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      IMEI: <span className="font-bold text-slate-700">{rec.imei1}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {rec.color} • {rec.storage} • {rec.batteryHealthPercent}% Batt
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{rec.sellerName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{rec.sellerPhone}</div>
                    <div className="text-[10px] text-slate-500">
                      {rec.idType}: <span className="font-mono">{rec.idNumber}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-black text-rose-600 font-mono">
                      {formatCurrency(rec.buyPrice)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono">
                      Resale: {formatCurrency(rec.estimatedResalePrice)}
                    </div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 border border-slate-200 font-mono">
                      Grade: {rec.grade}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Deed</span>
                    </span>
                  </td>

                  {/* POS Status Column */}
                  <td className="py-3 px-4">
                    {inPosStock && (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>POS-এ স্টক আছে ({linkedProduct?.stock})</span>
                        </span>
                        <div className="text-[9px] text-slate-500">
                          IMEI দিয়ে POS-এ বিক্রয়যোগ্য
                        </div>
                      </div>
                    )}
                    {isSoldOut && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <span>🔴 POS-এ বিক্রি সম্পন্ন</span>
                      </span>
                    )}
                    {!linkedProduct && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span>সিঙ্ক হচ্ছে...</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inPosStock && (
                        <button
                          onClick={() => handleSellInPos(rec)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                          title="সরাসরি POS সেকশনে কার্টে নিয়ে বিক্রি করুন"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>POS-এ বিক্রি</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedRecordToPrint(rec)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                        title="Print Legal Purchase Agreement"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">চুক্তিপত্র প্রিন্ট</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('আপনি কি এই ব্যবহৃত ফোন ক্রয়ের রেকর্ডটি মুছে ফেলতে চান?')) {
                            deleteUsedBuy(rec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    কোনো পুরনো ফোন ক্রয়ের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT LEGAL DEED MODAL */}
      <PrintUsedAgreementModal
        record={selectedRecordToPrint}
        isOpen={Boolean(selectedRecordToPrint)}
        onClose={() => setSelectedRecordToPrint(null)}
      />

      {/* Barcode & IMEI Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'imei1') {
            setImei1(code.replace(/\D/g, ''));
          } else {
            setSearchTerm(code);
          }
          setIsScannerOpen(false);
        }}
      />

    </div>
  );
};
