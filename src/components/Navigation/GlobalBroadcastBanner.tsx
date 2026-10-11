import React from 'react';
import { useApp } from '../../context/AppContext';
import { Radio, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export const GlobalBroadcastBanner: React.FC = () => {
  const { broadcasts, dismissBroadcast, lang } = useApp();

  const activeBroadcasts = broadcasts.filter(b => b.isActive);

  if (activeBroadcasts.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 w-full z-20 print:hidden select-none">
      {activeBroadcasts.map(b => {
        const isUrgent = b.priority === 'urgent';
        let bgStyle = 'bg-indigo-900/90 text-indigo-100 border-indigo-700/60';
        let icon = <Info className="w-4 h-4 text-indigo-300 shrink-0" />;

        if (b.type === 'alert') {
          bgStyle = 'bg-rose-950/95 text-rose-100 border-rose-800/80';
          icon = <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />;
        } else if (b.type === 'warning') {
          bgStyle = 'bg-amber-950/95 text-amber-100 border-amber-800/80';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
        } else if (b.type === 'success') {
          bgStyle = 'bg-emerald-950/95 text-emerald-100 border-emerald-800/80';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        }

        return (
          <div
            key={b.id}
            className={`w-full px-4 py-2 border-b flex items-center justify-between gap-3 text-xs shadow-sm ${bgStyle}`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {icon}
              <div className="truncate">
                <span className="font-extrabold mr-1.5">{b.title}:</span>
                <span className="opacity-90">{b.message}</span>
              </div>
            </div>

            {b.dismissible && (
              <button
                onClick={() => dismissBroadcast(b.id)}
                className="p-1 rounded-md hover:bg-black/20 text-current opacity-70 hover:opacity-100 transition shrink-0 cursor-pointer"
                title={lang === 'bn' ? 'নোটিশটি বন্ধ করুন' : 'Dismiss notice'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
