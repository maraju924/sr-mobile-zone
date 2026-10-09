import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Device, SecurityEvent } from '../../types';
import { 
  X, 
  Lock, 
  Unlock, 
  MapPin, 
  Camera, 
  Bell, 
  AlertTriangle, 
  Radio, 
  Image, 
  Key, 
  Navigation, 
  Send, 
  Flag, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  ShieldAlert, 
  Smartphone, 
  PhoneCall, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  Play, 
  Battery, 
  FileText, 
  Sliders, 
  Info,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SecurityPinModal } from './SecurityPinModal';

interface DeviceDetailModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, isOpen, onClose }) => {
  const { 
    lang, 
    toggleDeviceLock, 
    issueDeviceCommand, 
    generateOfflineCodes, 
    deleteDevice, 
    formatCurrency,
    sendSms
  } = useApp();

  const [activeTab, setActiveTab] = useState<'commands' | 'telemetry' | 'location' | 'calls' | 'security' | 'sim' | 'history'>('commands');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showWipeWarning, setShowWipeWarning] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [customNoticeText, setCustomNoticeText] = useState('');
  const [customPinText, setCustomPinText] = useState('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  // Security Verification PIN state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingSecurityAction, setPendingSecurityAction] = useState<{
    title: string;
    description: string;
    isDestructive: boolean;
    callback: () => void;
  } | null>(null);

  if (!isOpen || !device) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExecuteCommand = (cmdName: string, reason?: string) => {
    issueDeviceCommand(device.id, cmdName, reason);
    setCommandFeedback(`Command "${cmdName}" sent to device successfully.`);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const handleSendNotice = () => {
    if (!customNoticeText.trim()) return;
    issueDeviceCommand(device.id, `SEND_NOTICE: ${customNoticeText}`);
    setCommandFeedback('Custom notice dispatched to phone screen.');
    setCustomNoticeText('');
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const handleSetPin = () => {
    if (!customPinText.trim()) return;
    issueDeviceCommand(device.id, `SET_PIN: ${customPinText}`);
    setCommandFeedback(`Screen Lock PIN updated to ${customPinText}`);
    setCustomPinText('');
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const handleWipeDevice = () => {
    if (wipeConfirmText !== 'WIPE') return;
    issueDeviceCommand(device.id, 'FACTORY_RESET_WIPE', 'Emergency Wipe by Admin');
    setShowWipeWarning(false);
    setWipeConfirmText('');
    setCommandFeedback('REMOTE WIPE TRIGGERED: Device is performing factory reset.');
    setTimeout(() => setCommandFeedback(null), 4000);
  };

  const handleReplayLocation = () => {
    if (!device.locationHistory || device.locationHistory.length === 0) return;
    setIsReplaying(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= device.locationHistory.length) {
        clearInterval(interval);
        setIsReplaying(false);
        setReplayIndex(0);
      } else {
        setReplayIndex(idx);
      }
    }, 1200);
  };

  const isLocked = device.lockStatus === 'LOCKED';

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border-0 sm:border border-slate-200 flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0 ${
              isLocked ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> : <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-lg leading-tight text-white truncate max-w-[150px] sm:max-w-none">
                  {device.model}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase ${
                  device.liveStatus === 'online' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'
                }`}>
                  {device.liveStatus}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase ${
                  isLocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}>
                  {isLocked ? 'লকড' : 'সক্রিয়'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                <span>IMEI: {device.imei1}</span>
                <span className="hidden sm:inline">• {device.branch}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => handleExecuteCommand('LOCATE')}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title="Request Check-in & Sync"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Lock Banner & Direct Action */}
        <div className={`px-3.5 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-b ${
          isLocked ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 rounded-xl text-white shrink-0 ${isLocked ? 'bg-rose-600' : 'bg-emerald-600'}`}>
              {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div className="min-w-0">
              <div className={`font-bold text-xs sm:text-sm truncate ${isLocked ? 'text-rose-900' : 'text-emerald-950'}`}>
                {isLocked ? 'ডিভাইস বর্তমানে সম্পূর্ণ লক (FREEZE) অবস্থায় আছে' : 'ডিভাইসটি সক্রিয় এবং আনলক রয়েছে'}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-600 truncate">
                গ্রাহক: <span className="font-semibold text-slate-900">{device.customerName}</span> 
                {' • '}বকেয়া: <span className="font-mono font-bold text-rose-600">{formatCurrency(device.outstandingDue)}</span>
              </div>
            </div>
          </div>

          {/* Big Freeze / Unfreeze Toggle Button */}
          <button
            onClick={() => {
              setPendingSecurityAction({
                title: isLocked ? 'ডিভাইস রিস্টোর (আনলক) অনুমোদন' : 'ডিভাইস ফ্রিজ (লক) অনুমোদন',
                description: `আপনি "${device.model}" ডিভাইসে ${isLocked ? 'আনলক (স্বাভাবিক মোড)' : 'রিমোট কিয়স্ক লক (Freeze)'} কার্যকর করতে যাচ্ছেন। অ্যাডমিন পিন দিন।`,
                isDestructive: !isLocked,
                callback: () => toggleDeviceLock(device.id, isLocked ? 'Payment received / Admin restored' : 'EMI overdue / Admin lock')
              });
              setPinModalOpen(true);
            }}
            className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 text-white cursor-pointer ${
              isLocked 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-950/20'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>RESTORE DEVICE (আনলক করুন)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 stroke-[2.5]" />
                <span>FREEZE DEVICE (তাত্ক্ষণিক লক করুন)</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {commandFeedback && (
          <div className="bg-indigo-600 text-white px-4 sm:px-5 py-2 text-xs font-semibold flex items-center justify-between animate-in fade-in shrink-0">
            <span>✓ {commandFeedback}</span>
            <button onClick={() => setCommandFeedback(null)} className="text-indigo-200 hover:text-white px-1">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs shrink-0 select-none py-1.5">
          {[
            { id: 'commands', label: 'Command Center (১৪টা কমান্ড)', icon: Sliders },
            { id: 'telemetry', label: 'Live Status & Codes', icon: Radio },
            { id: 'location', label: 'Location History', icon: MapPin },
            { id: 'calls', label: 'Call Log', icon: PhoneCall },
            { id: 'security', label: `Security (${device.securityEvents?.length || 0})`, icon: ShieldAlert },
            { id: 'sim', label: 'SIM & Hardware', icon: Smartphone },
            { id: 'history', label: 'Command History', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  active 
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 pb-32 sm:pb-8 text-xs text-slate-800 space-y-4">
          
          {/* TAB 1: 14 COMMAND CENTER */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">14 Enterprise Device Commands</h4>
                  <p className="text-slate-500 text-[11px] sm:text-xs">ডিভাইস অনলাইনে থাকলে সাথে সাথে এবং অফলাইনে থাকলে SMS চ্যানেলে কমান্ড কার্যকর হবে।</p>
                </div>
                <button
                  onClick={() => sendSms(device.customerPhone, device.customerName, `LOCK COMMAND DISPATCHED FOR IMEI: ${device.imei1}`)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-semibold flex items-center justify-center gap-1 transition self-start sm:self-auto text-xs cursor-pointer"
                  title="Fallback over GSM SMS"
                >
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send by SMS Channel</span>
                </button>
              </div>

              {/* 14 Command Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* 1. Locate */}
                <button
                  onClick={() => handleExecuteCommand('LOCATE')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">1. Locate</span>
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">জিপিএস কোঅর্ডিনেট পিং ও লোকেশন আপডেট</span>
                </button>

                {/* 2. Capture Photo */}
                <button
                  onClick={() => handleExecuteCommand('CAPTURE_PHOTO')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">2. Capture Photo</span>
                    <Camera className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">সামনের ক্যামেরা দিয়ে রিমোট ছবি তুলবে</span>
                </button>

                {/* 3. Send Notice */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between min-h-[80px] col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800">3. Send Custom Notice</span>
                    <Bell className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="স্ক্রিনের মেসেজ লিখুন..."
                      value={customNoticeText}
                      onChange={e => setCustomNoticeText(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleSendNotice}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shrink-0 cursor-pointer min-h-[34px]"
                    >
                      Push
                    </button>
                  </div>
                </div>

                {/* 4. Alarm Alert */}
                <button
                  onClick={() => handleExecuteCommand('ALARM_SIREN')}
                  className="p-3 bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">4. Alarm Alert</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">সাইলেন্ট থাকলেও উচ্চস্বরে সাইরেন বাজবে</span>
                </button>

                {/* 5. Popup */}
                <button
                  onClick={() => handleExecuteCommand('SHOW_POPUP')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">5. Sticky Popup</span>
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">স্ক্রিনের মাঝে স্থায়ী বকেয়া পপআপ</span>
                </button>

                {/* 6. Wallpaper */}
                <button
                  onClick={() => handleExecuteCommand('SET_WALLPAPER')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">6. Set Wallpaper</span>
                    <Image className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">দোকানের সতর্কবার্তা ওয়ালপেপার সেট</span>
                </button>

                {/* 7. Camera Block */}
                <button
                  onClick={() => handleExecuteCommand('TOGGLE_CAMERA')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">7. Toggle Camera</span>
                    <Camera className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">হার্ডওয়্যার ক্যামেরা অন/অফ রেস্ট্রিকশন</span>
                </button>

                {/* 8. Screen-lock PIN */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between min-h-[80px] col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800">8. Set Lock PIN</span>
                    <Key className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="নতুন পাসওয়ার্ড (e.g. 1234)"
                      value={customPinText}
                      onChange={e => setCustomPinText(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <button
                      onClick={handleSetPin}
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 shrink-0 cursor-pointer min-h-[34px]"
                    >
                      Update PIN
                    </button>
                  </div>
                </div>

                {/* 9. Geofence */}
                <button
                  onClick={() => handleExecuteCommand('SET_GEOFENCE')}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">9. Geofence Boundary</span>
                    <Navigation className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">ময়মনসিংহ এলাকার বাইরে গেলে অটো অ্যালার্ট</span>
                </button>

                {/* 10. Send by SMS */}
                <button
                  onClick={() => {
                    sendSms(device.customerPhone, device.customerName, `Locker Policy enforced on IMEI: ${device.imei1}`);
                    setCommandFeedback('SMS Gateway transmitted command payload.');
                  }}
                  className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">10. Send by SMS</span>
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">অফলাইন ডিভাইসে বাইনারি এসএমএস পুশ</span>
                </button>

                {/* 11. Mark Lost */}
                <button
                  onClick={() => handleExecuteCommand('MARK_LOST', 'Customer reported stolen / Absconded')}
                  className="p-3 bg-white hover:bg-rose-50/60 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700">11. Mark as Lost</span>
                    <Flag className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">চুরি বা পলাতক চিহ্নিত ও অটো হার্ড লক</span>
                </button>

                {/* 12. Release Device */}
                <button
                  onClick={() => handleExecuteCommand('RELEASE_DEVICE', 'Loan fully cleared')}
                  className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700">12. Release Device</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">কিস্তি শেষ: লকার পারমিশন সম্পূর্ণ আনইনস্টল</span>
                </button>

                {/* 13. Reboot */}
                <button
                  onClick={() => handleExecuteCommand('REBOOT_DEVICE')}
                  className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">13. Remote Reboot</span>
                    <RotateCw className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">ডিভাইস দূর থেকে রিস্টার্ট করা</span>
                </button>

                {/* 14. Wipe Device */}
                <button
                  onClick={() => setShowWipeWarning(true)}
                  className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition flex flex-col justify-between min-h-[80px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800">14. Wipe Device</span>
                    <Trash2 className="w-4 h-4 text-rose-700" />
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold mt-1">ফ্যাক্টরি রিসেট (সকল ডেটা মুছে ফেলা)</span>
                </button>

              </div>
            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY & OFFLINE CODES */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Offline Unlock Codes (Unique feature) */}
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-700" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-950">Offline Emergency Unlock Codes</h4>
                      <p className="text-[11px] text-amber-800">
                        ইন্টারনেট সংযোগ না থাকলে গ্রাহক লক স্ক্রিনে "Have an unlock code?" অপশনে এই ওয়ান-টাইম কোড ব্যবহার করতে পারবে।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newCodes = generateOfflineCodes(device.id);
                      setCommandFeedback(`New offline unlock codes generated: ${newCodes.join(', ')}`);
                    }}
                    className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs transition"
                  >
                    Regenerate Codes
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {device.offlineCodes?.map((code, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Single-use Code #{idx + 1}</div>
                        <div className="text-xl font-black font-mono tracking-widest text-slate-900">{code}</div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(code)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        {copiedCode === code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === code ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Battery Level</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1 flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span>{device.batteryPercent}%</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Location Services</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${device.currentLocation?.locationServicesOn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{device.currentLocation?.locationServicesOn ? 'Active (ON)' : 'Disabled (OFF)'}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Last Heartbeat</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {device.lastSyncAt}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">OS Platform</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                    {device.osVersion || 'Android 14'}
                  </div>
                </div>
              </div>

              {/* Address card */}
              {device.currentLocation && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{device.currentLocation.address || 'ঈশ্বরগঞ্জ বাসস্ট্যান্ড, ময়মনসিংহ'}</div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      Lat: {device.currentLocation.lat}, Lng: {device.currentLocation.lng} • Accuracy: ±{device.currentLocation.accuracy}m
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${device.currentLocation.lat},${device.currentLocation.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold flex items-center gap-1 shrink-0"
                  >
                    <span>Open Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION HISTORY & ROUTE REPLAY */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Recorded GPS Route Timeline</h4>
                  <p className="text-slate-500">গত ৪৮ ঘণ্টার অবস্থান রেকর্ড ও মুভমেন্ট রুট।</p>
                </div>
                <button
                  onClick={handleReplayLocation}
                  disabled={isReplaying}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
                  <span>{isReplaying ? `Replaying point ${replayIndex + 1}...` : 'Play Route Replay (1x)'}</span>
                </button>
              </div>

              {/* Replay Simulated Map Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 h-48 flex flex-col justify-between relative overflow-hidden border border-slate-800">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="px-2 py-0.5 rounded bg-indigo-900/80 border border-indigo-500/40 text-[10px] font-mono text-indigo-300">
                    Fleet Tracker Canvas
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Active GPS: {device.locationHistory?.length || 0} Points Captured
                  </span>
                </div>

                <div className="flex items-center justify-center relative z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                      <Navigation className="w-6 h-6 text-indigo-400 transform -rotate-45" />
                    </div>
                    <div className="font-bold text-white mt-2 font-mono text-xs">
                      {device.locationHistory?.[replayIndex]?.lat || 24.6842}, {device.locationHistory?.[replayIndex]?.lng || 90.5983}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Battery: {device.locationHistory?.[replayIndex]?.battery || 78}% • Accuracy: ±{device.locationHistory?.[replayIndex]?.accuracy || 10}m
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-right relative z-10">
                  Agent reporting live via secure telemetry socket
                </div>
              </div>

              {/* Timeline List */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {device.locationHistory?.map((pt, i) => (
                  <div key={pt.id || i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px] flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-slate-900">
                          {pt.lat}, {pt.lng}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Source: {pt.source.toUpperCase()} • Accuracy: ±{pt.accuracy}m
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">{pt.timestamp}</div>
                      <div className="text-[10px] font-mono text-emerald-600">{pt.battery}% Battery</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CALL LOG */}
          {activeTab === 'calls' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Phone Call Logs Reported by Device</h4>
                  <p className="text-slate-500">সর্বশেষ ইনকামিং, আউটগোয়িং ও মিসড কল ট্র্যাকিং।</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono font-bold">
                  {device.callLogs?.length || 0} Calls Recorded
                </span>
              </div>

              {device.callLogs && device.callLogs.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {device.callLogs.map(cl => (
                    <div key={cl.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${
                          cl.type === 'incoming' ? 'bg-emerald-50 text-emerald-700' :
                          cl.type === 'outgoing' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          <PhoneCall className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold font-mono text-slate-900">{cl.number}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">{cl.type} call</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-slate-700">{cl.timestamp}</div>
                        <div className="text-[10px] text-slate-500">{cl.durationSec} seconds duration</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  কোনো সাম্প্রতিক কল হিস্ট্রি পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY EVENTS */}
          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Security Events & Tamper Alarms</h4>
                  <p className="text-slate-500">সিম পরিবর্তন, অ্যাপ বন্ধ করার চেষ্টা বা অফলাইন অ্যালার্ট।</p>
                </div>
              </div>

              {device.securityEvents && device.securityEvents.length > 0 ? (
                <div className="space-y-2">
                  {device.securityEvents.map(evt => (
                    <div key={evt.id} className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      evt.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-200' :
                      evt.severity === 'HIGH' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                          evt.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
                        }`} />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{evt.type.replace('_', ' ')}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white border border-slate-200">
                              {evt.severity}
                            </span>
                          </div>
                          <div className="text-slate-600 text-xs mt-0.5">{evt.details}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                        <div className="text-[10px] text-slate-600 font-semibold mt-1">
                          {evt.reviewed ? '✓ Reviewed' : '⚠️ Action Needed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  কোনো সিকিউরিটি টেম্পারিং বা ত্রুটি ধরা পড়েনি।
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SIM & HARDWARE */}
          {activeTab === 'sim' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">SIM Slot & Cellular Details</h4>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Active Operator</div>
                    <div className="font-bold text-slate-900 mt-0.5">{device.simInfo?.operator || 'Banglalink 4G'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold">SIM Slot</div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">Slot #{device.simInfo?.slot || 1}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold">SIM ICCID</div>
                    <div className="font-mono text-slate-900 text-[11px] mt-0.5">{device.simInfo?.iccid || '898801202391039281'}</div>
                  </div>
                </div>

                {device.simInfo?.simChangeHistory && device.simInfo.simChangeHistory.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="font-bold text-slate-800 text-[11px] mb-1">SIM Change History</div>
                    {device.simInfo.simChangeHistory.map((sh, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono flex items-center justify-between text-slate-600">
                        <span>Changed at: {sh.changedAt}</span>
                        <span>Old ICCID: {sh.previousIccid.slice(-6)} → New: {sh.newIccid.slice(-6)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: COMMAND HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Command Execution Audit Log</h4>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {device.commandHistory?.map(cmd => (
                  <div key={cmd.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold font-mono text-slate-900">{cmd.command}</div>
                      <div className="text-[10px] text-slate-500">
                        Issued by: {cmd.issuedBy} {cmd.reason ? `• ${cmd.reason}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cmd.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cmd.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('আপনি কি নিশ্চিত এই ডিভাইসটি ডেটাবেস থেকে মুছে ফেলতে চান?')) {
                deleteDevice(device.id);
                onClose();
              }
            }}
            className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Device Record</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
          >
            Close
          </button>
        </div>

        {/* FACTORY RESET / WIPE CONFIRMATION MODAL */}
        {showWipeWarning && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-rose-300 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h3 className="font-black text-lg text-rose-700">কঠোর সতর্কবার্তা: Remote Factory Reset (Wipe)</h3>
                <p className="text-xs text-slate-600 mt-1">
                  এই কমান্ডটি কার্যকর হলে গ্রাহকের হ্যান্ডসেটের সকল ডেটা, ছবি ও অ্যাকাউন্ট চিরতরে মুছে যাবে এবং ফ্যাক্টরি রিসেট হয়ে যাবে। এটি পুনরুদ্ধার সম্ভব নয়।
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                নিশ্চিত করতে নিচে ইংরেজি বড় হাতের অক্ষরে <strong className="text-rose-600">WIPE</strong> টাইপ করুন:
                <input
                  type="text"
                  placeholder="WIPE"
                  value={wipeConfirmText}
                  onChange={e => setWipeConfirmText(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-center tracking-widest text-rose-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWipeWarning(false)}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWipeDevice}
                  disabled={wipeConfirmText !== 'WIPE'}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition"
                >
                  Confirm Remote Wipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security PIN Authorization Modal */}
        <SecurityPinModal
          isOpen={pinModalOpen}
          title={pendingSecurityAction?.title || 'অ্যাডমিন সিকিউরিটি অনুমোদন'}
          actionDescription={pendingSecurityAction?.description || 'নিরাপত্তার স্বার্থে আপনার সিকিউরিটি পিন দিন।'}
          isDestructive={pendingSecurityAction?.isDestructive || false}
          onConfirm={() => {
            if (pendingSecurityAction?.callback) {
              pendingSecurityAction.callback();
            }
            setPendingSecurityAction(null);
          }}
          onClose={() => {
            setPinModalOpen(false);
            setPendingSecurityAction(null);
          }}
        />

      </div>
    </div>
  );
};
