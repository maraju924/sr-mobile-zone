import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAlert, setScannedAlert] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reader-scanner-container';

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedAlert(null);
      return;
    }

    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      // Clean up previous instance if any
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 180 },
        aspectRatio: 1.333334
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleSuccessScan(decodedText);
        },
        () => {
          // Frame error, safe to ignore
        }
      );
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError(t('ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন। দয়া করে ব্রাউজারে অনুমতি দিন।', 'Camera permission required. Please allow camera access in browser.'));
      } else {
        setCameraError(t('ক্যামেরা চালু করা যায়নি। সরাসরি ম্যানুয়াল কোড ইনপুট ব্যবহার করতে পারেন।', 'Could not access camera. You can use manual code input instead.'));
      }
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Stop camera error:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSuccessScan = (code: string) => {
    // Play pleasant beep sound using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 beep
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // audio error ignore
    }

    setScannedAlert(code);
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSuccessScan(manualCode.trim());
      setManualCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base leading-tight">
                {t('বারকোড বা IMEI স্ক্যানার', 'Barcode & IMEI Scanner')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('পণ্য কার্টে যুক্ত করতে কোড স্ক্যান করুন', 'Scan to automatically add product to cart')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 mx-5 mt-4 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              activeTab === 'camera' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            {t('লাইভ ক্যামেরা', 'Live Camera')}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              activeTab === 'manual' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            {t('ম্যানুয়াল ইনপুট', 'Manual Entry')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              {scannedAlert ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-16 h-16 mb-2" />
                  <p className="font-bold text-lg">{t('স্ক্যান সফল হয়েছে!', 'Scanned successfully!')}</p>
                  <p className="font-mono text-sm text-slate-600 mt-1">{scannedAlert}</p>
                </div>
              ) : cameraError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center my-6">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-amber-800 mb-3">{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
                  >
                    {t('ম্যানুয়াল টাইপ করুন', 'Switch to Manual Input')}
                  </button>
                </div>
              ) : (
                <div className="w-full relative flex flex-col items-center">
                  <div 
                    id={scannerContainerId} 
                    className="w-full overflow-hidden rounded-xl bg-slate-900 aspect-4/3 flex items-center justify-center text-white"
                  ></div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>{t('বারকোড বা কিউআর কোড ক্যামেরার সামনে ধরুন', 'Position the barcode or QR code in front of camera')}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4 my-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  {t('বারকোড অথবা IMEI নম্বর', 'Barcode or IMEI Number')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder={t('বারকোড স্ক্যানার দিয়ে স্ক্যান করুন বা টাইপ করুন...', 'Scan with USB scanner or type code...')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm tracking-wide"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t('শারীরিক USB বারকোড স্ক্যানার থাকলে তা স্বয়ংক্রিয়ভাবে কোড লিখে এন্টার চাপবে।', 'Physical handheld USB scanners automatically input here & submit.')}
                </p>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                {t('খুঁজে বের করুন ও কার্টে যোগ করুন', 'Search & Add to Cart')}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
          >
            {t('বাতিল করুন', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
