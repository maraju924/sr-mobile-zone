import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Smartphone, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  QrCode, 
  Printer, 
  RefreshCw, 
  Coins, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  Camera
} from 'lucide-react';
import QRCode from 'qrcode';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

interface AddDeviceWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceWizard: React.FC<AddDeviceWizardProps> = ({ isOpen, onClose }) => {
  const { 
    lang, 
    branch, 
    addDevice, 
    deviceCredits, 
    customerProfiles, 
    formatCurrency 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNid, setCustomerNid] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [planType, setPlanType] = useState<'emi' | 'cash'>('emi');
  const [outstandingDue, setOutstandingDue] = useState('12000');
  const [downPayment, setDownPayment] = useState('5000');
  const [autoLockDays, setAutoLockDays] = useState('3');
  const [offlineGraceHours, setOfflineGraceHours] = useState('48');
  
  // Step 5 State
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);
  const [createdDeviceId, setCreatedDeviceId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'imei1' | 'imei2' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleReset = () => {
    setStep(1);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerNid('');
    setModel('');
    setImei1('');
    setImei2('');
    setEnrolledSuccess(false);
  };

  const handleFinishEnrollment = () => {
    if (!imei1 || !model || !customerName || !customerPhone) {
      alert('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন!');
      return;
    }

    const newDev = addDevice({
      branch,
      imei1,
      imei2: imei2 || undefined,
      brand,
      model,
      liveStatus: 'online',
      financeStatus: 'ACTIVE',
      managementStatus: 'ACTIVE',
      lockStatus: 'UNLOCKED',
      customerName,
      customerPhone,
      outstandingDue: parseFloat(outstandingDue) || 0,
      batteryPercent: 100,
      offlineCodes: [
        Math.floor(100000 + Math.random() * 900000).toString(),
        Math.floor(100000 + Math.random() * 900000).toString()
      ],
      simInfo: {
        slot: 1,
        operator: 'Waiting SIM...',
        iccid: 'PENDING_READ'
      },
      securityEvents: [],
      callLogs: [],
      locationHistory: [
        {
          id: `LH-${Date.now()}`,
          lat: 24.6842,
          lng: 90.5983,
          accuracy: 10,
          battery: 100,
          source: 'agent',
          timestamp: 'Just now'
        }
      ],
      commandHistory: []
    });

    setCreatedDeviceId(newDev.id);
    setEnrolledSuccess(true);
    setStep(5);
  };

  // QR Payload for Android Enterprise Device Owner App
  const qrPayload = JSON.stringify({
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.phonesellpro.mdm/.DeviceAdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://phonesellpro.com/agent.apk",
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
      "tenant": "PhoneSell Pro Enterprise",
      "branch": branch,
      "imei": imei1,
      "server": "https://api.phonesellpro.com",
      "token": `ENROLL_${Date.now()}`
    }
  });

  useEffect(() => {
    if (step === 5 && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrPayload,
        {
          width: 180,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [step, qrPayload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Wizard Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {lang === 'bn' ? '৫ ধাপের ডিভাইস অনবোর্ডিং উইজার্ড' : '5-Step Device Enrollment Wizard'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Credit: <strong className="text-emerald-400">{deviceCredits}</strong> · Available</span>
                <span>• Draft Auto-saved</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Start Over"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Steps Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Customer' },
            { num: 2, label: 'Device & IMEI' },
            { num: 3, label: 'Finance Plan' },
            { num: 4, label: 'Lock Policy' },
            { num: 5, label: 'Enroll QR' }
          ].map(s => (
            <div 
              key={s.num} 
              className={`flex items-center gap-1.5 ${step === s.num ? 'font-black text-indigo-700' : step > s.num ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                step === s.num ? 'bg-indigo-600 text-white' : step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Contents */}
        <div className="p-6 text-xs text-slate-800 min-h-[300px]">
          
          {/* STEP 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">ধাপ ১: কাস্টমার পরিচিতি (Customer Identity)</h4>
                <p className="text-slate-500">যে গ্রাহক মোবাইলটি কিস্তিতে ক্রয় করছেন তার তথ্য দিন।</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    placeholder="গ্রাহকের নাম (যেমন: মোঃ আব্দুল্লাহ)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর</label>
                    <input
                      type="text"
                      placeholder="NID নম্বর"
                      value={customerNid}
                      onChange={e => setCustomerNid(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Device Identifiers */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">ধাপ ২: হ্যান্ডসেট ও IMEI আইডেন্টিফায়ার</h4>
                <p className="text-slate-500">বক্স বা *#06# ডায়াল করে পাওয়া ১৫ ডিজিটের IMEI লিখুন।</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ব্র্যান্ড</label>
                    <select
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Samsung">Samsung</option>
                      <option value="Xiaomi">Xiaomi / Redmi</option>
                      <option value="Realme">Realme</option>
                      <option value="Vivo">Vivo</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Infinix">Infinix</option>
                      <option value="Tecno">Tecno</option>
                      <option value="Apple">Apple iPhone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মডেল ও ভ্যারিয়েন্ট *</label>
                    <input
                      type="text"
                      placeholder="e.g. Galaxy A15 5G (8/128GB)"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">IMEI 1 (১৫ ডিজিট) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('imei1');
                        setIsScannerOpen(true);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>স্ক্যান করুন</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="864209051839201"
                      value={imei1}
                      onChange={e => setImei1(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold tracking-wider text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('imei1');
                        setIsScannerOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition"
                      title="ক্যামেরা দিয়ে IMEI বারকোড স্ক্যান করুন"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">IMEI 2 (ঐচ্ছিক)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('imei2');
                        setIsScannerOpen(true);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>স্ক্যান করুন</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="864209051839202"
                      value={imei2}
                      onChange={e => setImei2(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('imei2');
                        setIsScannerOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition"
                      title="ক্যামেরা দিয়ে IMEI 2 স্ক্যান করুন"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Finance Plan */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">ধাপ ৩: ফাইন্যান্স ও কিস্তি প্ল্যান</h4>
                <p className="text-slate-500">বকেয়া টাকার পরিমাণ ও ডাউন পেমেন্ট নির্ধারণ করুন।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোট বকেয়া ঋণ (৳)</label>
                  <input
                    type="number"
                    value={outstandingDue}
                    onChange={e => setOutstandingDue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডাউন পেমেন্ট গ্রহণ (৳)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={e => setDownPayment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Lock Policy */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">ধাপ ৪: অটো-লক ও সিকিউরিটি পলিসি</h4>
                <p className="text-slate-500">কিস্তি অনাদায়ী হলে স্বয়ংক্রিয় লকিংয়ের নিয়মকানুন সেট করুন।</p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Auto-Lock on Due Date</div>
                    <div className="text-[11px] text-slate-500">কিস্তির তারিখ পার হওয়ার কত দিন পর অটো লক হবে?</div>
                  </div>
                  <select
                    value={autoLockDays}
                    onChange={e => setAutoLockDays(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="1">১ দিন পর (Grace: 1 day)</option>
                    <option value="3">৩ দিন পর (Grace: 3 days)</option>
                    <option value="7">৭ দিন পর (Grace: 7 days)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Offline Safety Timer</div>
                    <div className="text-[11px] text-slate-500">ইন্টারনেট বন্ধ রাখলে কত ঘণ্টা পর অফলাইনেও অটো লক হবে?</div>
                  </div>
                  <select
                    value={offlineGraceHours}
                    onChange={e => setOfflineGraceHours(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="24">২৪ ঘণ্টা</option>
                    <option value="48">৪৮ ঘণ্টা</option>
                    <option value="72">৭২ ঘণ্টা</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">SIM Change Detection</div>
                    <div className="text-[11px] text-slate-500">সিম কার্ড পরিবর্তন হলে তৎক্ষণাৎ এসএমএস এলার্ট যাবে।</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Provisioning QR & Setup Customer Phone */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">Set up the customer's phone</h4>
                <p className="text-slate-500 text-xs mt-1">
                  কাস্টমারের ফোনে <strong className="text-indigo-600">PhoneSell Pro Locker</strong> অ্যাপটি চালু করে নিচের কিউআর কোডটি স্ক্যান করুন।
                </p>
              </div>

              {/* QR Code Canvas */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <canvas ref={canvasRef} className="mx-auto" />
                <div className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                  QR Valid for 72 Hours • Single Device Enrollment
                </div>
              </div>

              {/* Instruction Steps */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 text-left space-y-1.5 text-xs text-indigo-950">
                <div className="font-bold text-indigo-900">৩টি সহজ সেটআপ ধাপ:</div>
                <div>১. কাস্টমারের নতুন ফোন আনবক্স করে প্রথম স্ক্রিনে ৬ বার ট্যাপ করুন বা লকার অ্যাপ খুলুন।</div>
                <div>২. "Scan QR to sign in" অপশনে এই QR কোডটি স্ক্যান করুন।</div>
                <div>৩. ডিভাইস স্বয়ংক্রিয়ভাবে ক্লাউড সার্ভারের সাথে সিঙ্ক হয়ে <span className="font-bold text-emerald-700">ENROLLED</span> স্ট্যাটাসে চলে আসবে।</div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Setup Sheet</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 4 && (
            <button
              onClick={() => {
                if (step === 1 && (!customerName || !customerPhone)) {
                  alert('গ্রাহকের নাম ও ফোন নম্বর দিন!');
                  return;
                }
                if (step === 2 && (!model || !imei1)) {
                  alert('মডেল ও IMEI নম্বর দিন!');
                  return;
                }
                setStep((step + 1) as any);
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleFinishEnrollment}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center gap-1.5 transition shadow-md shadow-emerald-950/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Sign-in QR (এনরোল করুন)</span>
            </button>
          )}

          {step === 5 && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
            >
              Done & Close
            </button>
          )}
        </div>

        {/* Camera Barcode & IMEI Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(code) => {
            const clean = code.replace(/\D/g, '');
            if (scannerTarget === 'imei1') {
              setImei1(clean || code);
            } else if (scannerTarget === 'imei2') {
              setImei2(clean || code);
            }
            setIsScannerOpen(false);
            setScannerTarget(null);
          }}
        />

      </div>
    </div>
  );
};
