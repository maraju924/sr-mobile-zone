import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Barcode, 
  Smartphone, 
  ShoppingBag, 
  FileText, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Device, Sale, RepairTicket } from '../../types';
import { playScannerBeep } from '../../hooks/useGlobalBarcodeScanner';

interface UniversalScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeScanned?: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export const UniversalScannerModal: React.FC<UniversalScannerModalProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
  title = 'ইউনিভার্সাল বারকোড ও IMEI স্ক্যানার',
  subtitle = 'ক্যামেরা অথবা ফিজিক্যাল বারকোড গান দিয়ে যেকোনো কোড স্ক্যান করুন'
}) => {
  const { 
    products, 
    devices, 
    sales, 
    repairs, 
    addToCart, 
    setActiveTab, 
    formatCurrency,
    t 
  } = useApp();

  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Classified Match Result
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [matchedDevice, setMatchedDevice] = useState<Device | null>(null);
  const [matchedSale, setMatchedSale] = useState<Sale | null>(null);
  const [matchedRepair, setMatchedRepair] = useState<RepairTicket | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'universal-html5-qr-reader';

  // Manage Camera Start/Stop
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    if (activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  const resetState = () => {
    setScannedCode(null);
    setMatchedProduct(null);
    setMatchedDevice(null);
    setMatchedSale(null);
    setMatchedRepair(null);
    setActionFeedback(null);
    setManualInput('');
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const qrCodeScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.333334
        },
        (decodedText) => {
          handleCodeIdentified(decodedText);
        },
        () => {
          // Frame error ignore
        }
      );
    } catch (err: unknown) {
      console.warn('Camera failed to start:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে গিয়ে অনুমতি দিন।');
      } else {
        setCameraError('ক্যামেরা চালু করা সম্ভব হয়নি। ম্যানুয়াল ইনপুট বা ইউএসবি স্ক্যানার ব্যবহার করুন।');
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping camera:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCodeIdentified = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    playScannerBeep(920, 0.12);
    setScannedCode(code);

    if (onCodeScanned) {
      onCodeScanned(code);
    }

    // Auto classify match
    const lowerCode = code.toLowerCase();

    // 1. Search in Products (Barcode or Serials)
    const foundProduct = products.find(p => 
      (p.barcode || '').toLowerCase() === lowerCode || 
      (p.serialNumbers || []).some(s => s.toLowerCase() === lowerCode)
    );

    // 2. Search in Devices (IMEI 1 or IMEI 2)
    const foundDevice = devices.find(d => 
      (d.imei1 || '').toLowerCase() === lowerCode || 
      (d.imei2 || '').toLowerCase() === lowerCode
    );

    // 3. Search in Sales (Invoice number)
    const foundSale = sales.find(s => 
      (s.invoiceNumber || '').toLowerCase() === lowerCode || 
      (s.id || '').toLowerCase() === lowerCode
    );

    // 4. Search in Repairs (Ticket number or IMEI)
    const foundRepair = repairs.find(r => 
      (r.ticketNumber || '').toLowerCase() === lowerCode || 
      (r.serialOrImei || '').toLowerCase() === lowerCode
    );

    setMatchedProduct(foundProduct || null);
    setMatchedDevice(foundDevice || null);
    setMatchedSale(foundSale || null);
    setMatchedRepair(foundRepair || null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleCodeIdentified(manualInput.trim());
    }
  };

  // Safe early exit if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 my-auto">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle: Camera Scanner vs Manual/USB Barcode Input */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs shrink-0">
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'camera'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ক্যামেরা স্ক্যানার</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              activeMode === 'manual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>USB গান / ম্যানুয়াল ইনপুট</span>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 space-y-4">
          
          {/* CAMERA SCANNER VIEW */}
          {activeMode === 'camera' && (
            <div className="space-y-2">
              <div className="relative bg-slate-950 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center border border-slate-800">
                <div id={scannerContainerId} className="w-full"></div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-4 text-center flex flex-col items-center justify-center space-y-2 text-rose-300 text-xs">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <p className="max-w-xs">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs"
                    >
                      পুনরায় চেষ্টা করুন
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-center text-slate-500">
                মোবাইল ফোনের বক্সের বারকোড বা IMEI ক্যামেরার সামনে স্থির রাখুন।
              </p>
            </div>
          )}

          {/* MANUAL / USB SCANNER GUN FORM */}
          {activeMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                বারকোড নম্বর বা IMEI লিখুন অথবা USB স্ক্যানার গান দিয়ে স্ক্যান করুন:
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="যেমন: 8949988776655 বা IMEI..."
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700"
                >
                  সার্চ করুন
                </button>
              </div>
            </form>
          )}

          {/* SCANNED CODE BANNER */}
          {scannedCode && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase text-[10px]">স্ক্যানকৃত কোড:</span>
                <span className="font-mono font-black text-indigo-900 text-sm">{scannedCode}</span>
              </div>

              {/* ACTION FEEDBACK ALERT */}
              {actionFeedback && (
                <div className="p-2 bg-emerald-600 text-white font-bold rounded-lg text-center text-xs animate-in fade-in">
                  ✓ {actionFeedback}
                </div>
              )}

              {/* 1. MATCHED PRODUCT */}
              {matchedProduct && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 mt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase mb-1">
                        ইনভেন্টরি প্রোডাক্ট
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{matchedProduct.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">ব্র্যান্ড: {matchedProduct.brand} • ক্যাটাগরি: {matchedProduct.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-indigo-700 text-sm">{formatCurrency(matchedProduct.sellingPrice)}</div>
                      <div className="text-[10px] font-bold text-slate-500">স্টক: {matchedProduct.stock} টি</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        addToCart(matchedProduct, 1, matchedProduct.serialNumbers ? [matchedProduct.serialNumbers[0]] : []);
                        setActionFeedback(`"${matchedProduct.name}" POS কার্টে যুক্ত করা হয়েছে!`);
                        setTimeout(() => setActionFeedback(null), 2500);
                      }}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>POS কার্টে যোগ করুন</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      স্টক দেখুন
                    </button>
                  </div>
                </div>
              )}

              {/* 2. MATCHED DEVICE LOCKER HANDSET */}
              {matchedDevice && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 mt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase mb-1 ${
                        matchedDevice.lockStatus === 'LOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        ডিভাইস লকার ফ্লিট ({matchedDevice.lockStatus})
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{matchedDevice.model}</h4>
                      <p className="text-[11px] text-slate-600">
                        গ্রাহক: <strong>{matchedDevice.customerName}</strong> ({matchedDevice.customerPhone})
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500">বকেয়া কিস্তি:</div>
                      <div className="font-mono font-black text-rose-600 text-sm">{formatCurrency(matchedDevice.outstandingDue)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('devices');
                        onClose();
                      }}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>ডিভাইস কন্ট্রোল প্যানেল খুলুন</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('installments');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      কিস্তি আদায়
                    </button>
                  </div>
                </div>
              )}

              {/* 3. MATCHED SALE / INVOICE */}
              {matchedSale && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 mt-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase mb-1">
                        বিক্রয় ইনভয়েস
                      </span>
                      <h4 className="font-mono font-extrabold text-sm text-slate-900">{matchedSale.invoiceNumber}</h4>
                      <p className="text-[11px] text-slate-600">গ্রাহক: {matchedSale.customerName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">{formatCurrency(matchedSale.total)}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        matchedSale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {matchedSale.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('sales');
                      onClose();
                    }}
                    className="w-full py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ইনভয়েস বিস্তারিত দেখুন</span>
                  </button>
                </div>
              )}

              {/* 4. MATCHED REPAIR TICKET */}
              {matchedRepair && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 mt-2">
                  <div>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase mb-1">
                      সার্ভিসিং ও মেরামত টিকিট
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">{matchedRepair.ticketNumber}</h4>
                    <p className="text-[11px] text-slate-600">
                      ডিভাইস: {matchedRepair.deviceBrand} {matchedRepair.deviceModel} ({matchedRepair.customerName})
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('repairs');
                      onClose();
                    }}
                    className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>সার্ভিসিং টিকিট খুলুন</span>
                  </button>
                </div>
              )}

              {/* UNKNOWN CODE OPTIONS */}
              {!matchedProduct && !matchedDevice && !matchedSale && !matchedRepair && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>ডাটাবেজে এই কোডটি সংরক্ষিত নেই। আপনি কী করতে চান?</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                        onClose();
                      }}
                      className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px]"
                    >
                      + নতুন পণ্য হিসেবে স্টক করুন
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('devices');
                        onClose();
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[11px]"
                    >
                      + ডিভাইস লকারে এনরোল করুন
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {activeMode === 'camera' ? '📷 ক্যামেরা চালু আছে' : '⌨️ কীবোর্ড / স্ক্যানার গান সক্রিয়'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
