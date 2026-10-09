import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  ShieldAlert, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Activity,
  RefreshCw,
  X
} from 'lucide-react';

export const LiveWall: React.FC = () => {
  const { 
    devices, 
    installments, 
    formatCurrency, 
    branch, 
    setActiveTab 
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US'));
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefreshedSec, setLastRefreshedSec] = useState(0);

  // Auto-refresh countdown (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US'));
      setLastRefreshedSec(prev => (prev >= 5 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.liveStatus === 'online').length;
  const restrictedDevices = devices.filter(d => d.financeStatus === 'RESTRICTED' || d.lockStatus === 'LOCKED').length;
  const criticalAlerts = devices.filter(d => d.securityEvents?.some(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')).length;
  const overdueCount = installments.filter(i => i.status === 'overdue').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Simulated 14-day collections data
  const collections14Days = [
    { day: '17 Sep', val: 12000 },
    { day: '18 Sep', val: 18500 },
    { day: '19 Sep', val: 14000 },
    { day: '20 Sep', val: 24000 },
    { day: '21 Sep', val: 16000 },
    { day: '22 Sep', val: 32000 },
    { day: '23 Sep', val: 28000 },
    { day: '24 Sep', val: 21000 },
    { day: '25 Sep', val: 39000 },
    { day: '26 Sep', val: 26000 },
    { day: '27 Sep', val: 34000 },
    { day: '28 Sep', val: 42000 },
    { day: '29 Sep', val: 31000 },
    { day: '30 Sep', val: 48500 }
  ];
  const maxCollection = Math.max(...collections14Days.map(c => c.val));

  // Live Activity Stream
  const activityLogs = [
    { id: '1', time: '10:32 AM', event: 'LOCATION_SYNC', text: 'Galaxy A15 reported fresh GPS position (±12m)', status: 'normal' },
    { id: '2', time: '10:28 AM', event: 'CASH_PAYMENT', text: 'Installment #3 collected ৳ 3,500 (Rofiqul Islam)', status: 'success' },
    { id: '3', time: '10:15 AM', event: 'SIM_CHANGED', text: 'CRITICAL: Redmi Note 13 detected SIM swap', status: 'critical' },
    { id: '4', time: '09:40 AM', event: 'AUTO_LOCK', text: 'Device locked: 5 days overdue grace period expired', status: 'warning' },
    { id: '5', time: '09:10 AM', event: 'DEVICE_ONLINE', text: 'Realme 12x reconnected via Wi-Fi network', status: 'normal' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-3 sm:p-5 flex flex-col space-y-4 font-mono select-none">
      
      {/* NOC Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white flex items-center gap-2">
                <span>MDM LIVE WALL CONTROL ROOM</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                5s AUTO-REFRESH ({lastRefreshedSec}s)
              </span>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              Network Operations Center • {branch} • Real-time device fleet heartbeat & telemetry
            </div>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Live Time (BST)</div>
            <div className="text-base font-black text-indigo-400">{currentTime}</div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition ${
              isMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 rounded-xl transition"
            title="Exit Live Wall"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Real-time KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Online Devices</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {onlineDevices} <span className="text-xs text-slate-500">/ {totalDevices}</span>
          </div>
          <div className="text-[9px] text-emerald-500 mt-0.5">● Connected to push socket</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Restricted / Frozen</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {restrictedDevices}
          </div>
          <div className="text-[9px] text-rose-400 mt-0.5">Kiosk screen enforced</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Critical Alerts</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {criticalAlerts}
          </div>
          <div className="text-[9px] text-amber-400 mt-0.5">SIM swap & tampering</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Collected Today</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            ৳ 18,500
          </div>
          <div className="text-[9px] text-indigo-400 mt-0.5">4 receipts issued</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Total Financed Outstanding</div>
          <div className="text-2xl font-black text-slate-200 mt-1">
            ৳ 4.85L
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Accounts receivable</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Overdue Installments</div>
          <div className="text-2xl font-black text-rose-500 mt-1">
            {overdueCount}
          </div>
          <div className="text-[9px] text-rose-400 mt-0.5">Action pending</div>
        </div>
      </div>

      {/* Main Grid: Fleet Map & 14-day Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Fleet Map Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs uppercase text-slate-200">Live Device Fleet Map</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Locked
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span> Offline
              </span>
            </div>
          </div>

          {/* Map Simulated Markers */}
          <div className="relative flex-1 flex items-center justify-center z-10">
            {devices.map((d, idx) => {
              const posX = 20 + (idx * 28) % 70;
              const posY = 30 + (idx * 22) % 60;
              const isLocked = d.lockStatus === 'LOCKED';

              return (
                <div
                  key={d.id}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg transition-transform group-hover:scale-125 ${
                    isLocked ? 'bg-rose-600 ring-4 ring-rose-500/20 animate-pulse' :
                    d.liveStatus === 'online' ? 'bg-emerald-600 ring-4 ring-emerald-500/20' : 'bg-slate-700'
                  }`}>
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  </div>

                  {/* Marker Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/95 text-white p-2 rounded-lg border border-slate-700 text-[10px] whitespace-nowrap z-50">
                    <div className="font-bold text-indigo-300">{d.model}</div>
                    <div className="text-slate-300">{d.customerName} ({d.customerPhone})</div>
                    <div className="text-slate-400 font-mono">IMEI: {d.imei1}</div>
                    <div className="font-bold text-rose-400">Due: ৳{d.outstandingDue}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 relative z-10 border-t border-slate-800/80 pt-2">
            <span>Geofence Boundary: District Mymensingh, Dhaka Div</span>
            <span>Live ping rate: 3000ms</span>
          </div>
        </div>

        {/* 14-Day Collections Bar Chart (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[380px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-slate-200">14-Day Recovery Trend</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24.8%</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
              Daily EMI collection receipts across all branches
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1 h-52 pt-4 px-1">
            {collections14Days.map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1 group">
                <div 
                  className="w-full rounded-xs bg-indigo-500 hover:bg-emerald-400 transition"
                  style={{ height: `${(col.val / maxCollection) * 160}px` }}
                  title={`${col.day}: ৳${col.val.toLocaleString()}`}
                />
                <span className="text-[7px] text-slate-500 transform -rotate-45 origin-top-left mt-2">
                  {col.day.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] flex items-center justify-between text-slate-400">
            <span>Total 14-day collected:</span>
            <span className="font-bold text-emerald-400 font-mono">৳ 3,96,000</span>
          </div>
        </div>

      </div>

      {/* Bottom Live Activity Feed & Overdue Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Live Event Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Real-time Live Activity Stream</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Socket Active</span>
          </div>

          <div className="space-y-2">
            {activityLogs.map(log => (
              <div key={log.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    log.status === 'critical' ? 'bg-rose-500 animate-ping' :
                    log.status === 'warning' ? 'bg-amber-500' :
                    log.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-400'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-200">{log.event}: </span>
                    <span className="text-slate-300 font-sans text-[11px]">{log.text}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Installment Escalation Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Overdue Installments Requiring Lock</span>
            </span>
            <span className="text-[10px] text-rose-400 font-bold font-mono">
              {overdueCount} Overdue
            </span>
          </div>

          <div className="space-y-2">
            {devices.filter(d => d.lockStatus === 'LOCKED').map(dev => (
              <div key={dev.id} className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-900/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-rose-200">{dev.customerName} • {dev.model}</div>
                  <div className="text-[10px] text-rose-400/80 font-mono">
                    IMEI: {dev.imei1} • Phone: {dev.customerPhone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-rose-400">৳ {dev.outstandingDue}</div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-900 text-rose-200 font-bold">
                    LOCKED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
