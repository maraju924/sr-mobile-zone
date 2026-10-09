import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Device } from '../../types';
import { 
  Smartphone, 
  Search, 
  Filter, 
  Plus, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Battery, 
  MapPin, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  RefreshCw,
  Coins,
  ShieldAlert,
  RotateCcw,
  Check,
  Copy,
  Camera,
  Phone
} from 'lucide-react';
import { DeviceDetailModal } from './DeviceDetailModal';
import { AddDeviceWizard } from './AddDeviceWizard';
import { SecurityPinModal } from './SecurityPinModal';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

export const DeviceList: React.FC = () => {
  const { 
    devices, 
    lang, 
    formatCurrency, 
    toggleDeviceLock, 
    deviceCredits,
    branch
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'LOCKED' | 'UNLOCKED'>('ALL');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [copiedImei, setCopiedImei] = useState<string | null>(null);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Security Verification State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    deviceId: string;
    actionName: 'LOCK' | 'UNLOCK';
    model: string;
  } | null>(null);

  // Ensure safe array of devices
  const safeDevices = useMemo(() => {
    if (!Array.isArray(devices)) {
      return [];
    }
    return devices.filter(Boolean);
  }, [devices]);

  // Safe filtered devices
  const filteredDevices = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    return safeDevices.filter(d => {
      if (!d) return false;
      const modelStr = (d.model || '').toLowerCase();
      const imei1Str = String(d.imei1 || '');
      const imei2Str = String(d.imei2 || '');
      const custNameStr = (d.customerName || '').toLowerCase();
      const custPhoneStr = String(d.customerPhone || '');

      const matchSearch = !q || 
        modelStr.includes(q) ||
        imei1Str.includes(q) ||
        imei2Str.includes(q) ||
        custNameStr.includes(q) ||
        custPhoneStr.includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'ONLINE') return d.liveStatus === 'online';
      if (statusFilter === 'OFFLINE') return d.liveStatus === 'offline';
      if (statusFilter === 'LOCKED') return d.lockStatus === 'LOCKED';
      if (statusFilter === 'UNLOCKED') return d.lockStatus === 'UNLOCKED';

      return true;
    });
  }, [safeDevices, searchTerm, statusFilter]);

  const onlineCount = safeDevices.filter(d => d?.liveStatus === 'online').length;
  const lockedCount = safeDevices.filter(d => d?.lockStatus === 'LOCKED').length;

  const handleCopyImei = (imei: string) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => setCopiedImei(null), 2000);
  };

  const handleTriggerLockToggle = (dev: Device) => {
    const isLocked = dev.lockStatus === 'LOCKED';
    setPendingAction({
      deviceId: dev.id,
      actionName: isLocked ? 'UNLOCK' : 'LOCK',
      model: dev.model || 'Device'
    });
    setPinModalOpen(true);
  };

  const handleConfirmPinAction = () => {
    if (pendingAction) {
      toggleDeviceLock(
        pendingAction.deviceId, 
        pendingAction.actionName === 'LOCK' ? 'Admin Security Lock Enforced' : 'Admin Security Restore'
      );
      setPendingAction(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-28 sm:pb-8 bg-slate-100 text-slate-800 space-y-3.5 sm:space-y-4">
      
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-xl text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>{lang === 'bn' ? 'স্মার্টফোন লকার ও ডিভাইস কন্ট্রোল' : 'Financed Device Locker & Management'}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {branch}
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>PIN Security Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 sm:line-clamp-none">
            {lang === 'bn' 
              ? 'কিস্তিতে বিক্রিত মোবাইল ট্র্যাকিং, অফলাইন ও রিমোট লক, সিম পরিবর্তন অ্যালার্ট এবং ১৪টি অ্যাডভান্স কমান্ড।' 
              : 'Enterprise Android Enterprise (Device Owner) kiosk locks, live telemetry and tamper protection.'}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">Credits:</span>
            <span className="font-black text-slate-900">{deviceCredits}</span>
          </div>

          <button
            onClick={() => setShowAddWizard(true)}
            className="px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন ডিভাইস যুক্ত করুন' : 'Enroll New Device'}</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-2 sm:p-3 rounded-xl border text-left transition cursor-pointer active:scale-98 ${
            statusFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-85">
            {lang === 'bn' ? 'মোট হ্যান্ডসেট' : 'Total Fleet'}
          </div>
          <div className="text-lg sm:text-xl font-black font-mono mt-0.5">{safeDevices.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter('ONLINE')}
          className={`p-2 sm:p-3 rounded-xl border text-left transition cursor-pointer active:scale-98 ${
            statusFilter === 'ONLINE' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-85">
            {lang === 'bn' ? 'লাইভ অনলাইন' : 'Live Online'}
          </div>
          <div className="text-lg sm:text-xl font-black font-mono mt-0.5">{onlineCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('LOCKED')}
          className={`p-2 sm:p-3 rounded-xl border text-left transition cursor-pointer active:scale-98 ${
            statusFilter === 'LOCKED' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-85">
            {lang === 'bn' ? 'লকড (ফ্রোজেন)' : 'Locked'}
          </div>
          <div className="text-lg sm:text-xl font-black font-mono mt-0.5">{lockedCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('UNLOCKED')}
          className={`p-2 sm:p-3 rounded-xl border text-left transition cursor-pointer active:scale-98 ${
            statusFilter === 'UNLOCKED' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-85">
            {lang === 'bn' ? 'আনলকড সক্রিয়' : 'Unlocked'}
          </div>
          <div className="text-lg sm:text-xl font-black font-mono mt-0.5">{safeDevices.length - lockedCount}</div>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'IMEI, মডেল, কাস্টমারের নাম বা ফোন দিয়ে সার্চ করুন...' : 'Search by IMEI1, IMEI2, Model, Customer Name or Phone...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600 px-2 font-mono">
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCameraScannerOpen(true)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs transition shrink-0"
            title="IMEI বারকোড স্ক্যান করুন"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Devices Mobile Cards View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredDevices.map(dev => {
          const isLocked = dev.lockStatus === 'LOCKED';
          const hasSecurityAlert = dev.securityEvents && dev.securityEvents.length > 0;

          return (
            <div 
              key={dev.id} 
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-3"
            >
              {/* Header: Model & Status Badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{dev.model || 'Unknown Model'}</span>
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {dev.branch || branch}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
                  {/* Live Status */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                    dev.liveStatus === 'online' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dev.liveStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>{dev.liveStatus || 'offline'}</span>
                  </span>

                  {/* Lock Status */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                    isLocked 
                      ? 'bg-rose-50 text-rose-700 border border-rose-300' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  }`}>
                    {isLocked ? <Lock className="w-3 h-3 text-rose-600" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                    <span>{isLocked ? 'লকড' : 'সক্রিয়'}</span>
                  </span>
                </div>
              </div>

              {/* Customer & Due Info */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{dev.customerName || 'গ্রাহকের নাম নেই'}</div>
                  {dev.customerPhone && (
                    <a 
                      href={`tel:${dev.customerPhone}`}
                      className="text-[11px] font-mono text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3 text-indigo-500" />
                      <span>{dev.customerPhone}</span>
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">বকেয়া কিস্তি</div>
                  <div className="font-mono font-black text-rose-600 text-sm">
                    {formatCurrency(dev.outstandingDue ?? 0)}
                  </div>
                </div>
              </div>

              {/* IMEI & Telemetry Row */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-slate-100/70 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                  <span className="text-slate-600 truncate mr-2">
                    IMEI1: <strong className="text-slate-900 font-bold">{dev.imei1 || 'N/A'}</strong>
                  </span>
                  <button
                    onClick={() => dev.imei1 && handleCopyImei(dev.imei1)}
                    className="p-1 text-slate-500 hover:text-indigo-600 rounded shrink-0 flex items-center gap-1 text-[10px] font-sans font-bold bg-white border border-slate-200"
                    title="Copy IMEI"
                  >
                    {copiedImei === dev.imei1 ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-600" />
                        <span>কপি</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-semibold">{dev.batteryPercent ?? 100}% চার্জ</span>
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[170px]" title={dev.currentLocation?.address}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{dev.currentLocation?.address || 'ঈশ্বরগঞ্জ'}</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    {dev.simInfo?.operator || 'SIM Active'}
                  </span>
                </div>
              </div>

              {/* BOTTOM ACTIONS: 100% visible, large, thumb-friendly buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {/* 1. Freeze / Restore Button */}
                <button
                  type="button"
                  onClick={() => handleTriggerLockToggle(dev)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer text-white ${
                    isLocked 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 stroke-[2.5]" />
                      <span>আনলক (RESTORE)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 stroke-[2.5]" />
                      <span>লক করুন (FREEZE)</span>
                    </>
                  )}
                </button>

                {/* 2. Command Center Button */}
                <button
                  type="button"
                  onClick={() => setSelectedDevice(dev)}
                  className="min-h-[44px] px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>কমান্ড সেন্টার</span>
                </button>
              </div>

            </div>
          );
        })}

        {filteredDevices.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
            <Smartphone className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">কোনো ডিভাইস পাওয়া যায়নি</div>
            <p className="text-xs text-slate-500">সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন ডিভাইস যোগ করুন।</p>
          </div>
        )}
      </div>

      {/* Devices List Table (Desktop & Tablet View: hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Device & Identifiers</th>
                <th className="py-3 px-4">Customer & Due</th>
                <th className="py-3 px-4">Live Telemetry</th>
                <th className="py-3 px-4">Finance Status</th>
                <th className="py-3 px-4">Security & SIM</th>
                <th className="py-3 px-4 text-right">Protected Quick Lock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map(dev => {
                const isLocked = dev.lockStatus === 'LOCKED';
                const hasSecurityAlert = dev.securityEvents && dev.securityEvents.length > 0;

                return (
                  <tr 
                    key={dev.id} 
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setSelectedDevice(dev)}
                  >
                    {/* Device & IMEI */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{dev.model || 'Unknown Model'}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                          IMEI1: {dev.imei1 || 'N/A'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (dev.imei1) handleCopyImei(dev.imei1);
                          }}
                          className="text-slate-400 hover:text-indigo-600"
                          title="Copy IMEI"
                        >
                          {copiedImei === dev.imei1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        {dev.imei2 && <span className="text-slate-400">IMEI2: {dev.imei2}</span>}
                      </div>
                    </td>

                    {/* Customer & Due */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{dev.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{dev.customerPhone || 'N/A'}</div>
                      <div className="text-[11px] font-mono font-bold text-rose-600 mt-0.5">
                        Due: {formatCurrency(dev.outstandingDue ?? 0)}
                      </div>
                    </td>

                    {/* Live Telemetry */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          dev.liveStatus === 'online' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dev.liveStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {dev.liveStatus || 'offline'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-0.5">
                          <Battery className="w-3.5 h-3.5 text-slate-400" />
                          {dev.batteryPercent ?? 100}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{dev.currentLocation?.address || 'ঈশ্বরগঞ্জ, ময়মনসিংহ'}</span>
                      </div>
                    </td>

                    {/* Finance Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        dev.financeStatus === 'RESTRICTED' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : dev.financeStatus === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {dev.financeStatus || 'ACTIVE'}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {dev.managementStatus || 'ACTIVE'}
                      </div>
                    </td>

                    {/* Security & SIM */}
                    <td className="py-3 px-4">
                      {hasSecurityAlert ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>{dev.securityEvents?.[0]?.type || 'ALERT'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Secured</span>
                        </span>
                      )}
                      <div className="text-[10px] text-slate-500 font-semibold mt-1">
                        {dev.simInfo?.operator || 'Banglalink 4G'}
                      </div>
                    </td>

                    {/* Actions: Protected Quick Lock/Unlock */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTriggerLockToggle(dev)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition transform active:scale-95 cursor-pointer ${
                            isLocked 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                          title={isLocked ? 'Restore Device with PIN' : 'Freeze Device with PIN'}
                        >
                          {isLocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>RESTORE</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>FREEZE</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedDevice(dev)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                          title="Open Command Center"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <div>কোনো ডিভাইস এন্ট্রি নেই। ফায়ারবেজ ক্লাউডে নতুন ডিভাইস যোগ করুন।</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security PIN Authorization Modal */}
      <SecurityPinModal
        isOpen={pinModalOpen}
        title={pendingAction?.actionName === 'LOCK' ? 'হ্যান্ডসেট ফ্রিজ (লক) ভেরিফিকেশন' : 'হ্যান্ডসেট রিস্টোর (আনলক) ভেরিফিকেশন'}
        actionDescription={`আপনি "${pendingAction?.model}" ডিভাইসে ${
          pendingAction?.actionName === 'LOCK' ? 'FREEZE (রিমোট কিয়স্ক লক)' : 'RESTORE (স্বাভাবিক আনলক)'
        } কমান্ড কার্যকর করতে যাচ্ছেন। নিরাপত্তার স্বার্থে আপনার সিকিউরিটি পিন দিন।`}
        isDestructive={pendingAction?.actionName === 'LOCK'}
        onConfirm={handleConfirmPinAction}
        onClose={() => {
          setPinModalOpen(false);
          setPendingAction(null);
        }}
      />

      {/* Device Detail Command Center Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        isOpen={Boolean(selectedDevice)}
        onClose={() => setSelectedDevice(null)}
      />

      {/* 5-Step Add Device Enrollment Wizard */}
      <AddDeviceWizard
        isOpen={showAddWizard}
        onClose={() => setShowAddWizard(false)}
      />

      {/* IMEI Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(code) => {
          setSearchTerm(code);
          setIsCameraScannerOpen(false);
        }}
      />

    </div>
  );
};
