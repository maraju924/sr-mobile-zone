import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, X, AlertTriangle, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SecurityPinModalProps {
  isOpen: boolean;
  title: string;
  actionDescription: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  title,
  actionDescription,
  isDestructive = false,
  onConfirm,
  onClose
}) => {
  const { lang, currentUser } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validPin = currentUser?.securityPin || '1234';

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Accept user's PIN, superadmin PIN 1234 or master override 0000
    if (pin === validPin || pin === '1234' || pin === '0000') {
      onConfirm();
      onClose();
      setPin('');
    } else {
      setError(lang === 'bn' ? 'ভুল সিকিউরিটি পিন! (ডিফল্ট অ্যাডমিন পিন: 1234)' : 'Incorrect Security PIN! (Default Admin PIN: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              isDestructive ? 'bg-rose-600' : 'bg-indigo-600'
            }`}>
              {isDestructive ? <ShieldAlert className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{title}</h3>
              <div className="text-xs text-slate-400">Security Verification Required</div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action summary */}
        <div className={`p-3 rounded-xl border text-xs ${
          isDestructive ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' : 'bg-slate-800/60 border-slate-700 text-slate-300'
        }`}>
          {actionDescription}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি পিন দিন' : 'Enter Admin Security PIN'}</span>
              <span className="text-[10px] text-indigo-400 font-mono">Master PIN: 1234</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 font-bold rounded-xl text-xs text-white shadow-lg transition active:scale-95 ${
                isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {lang === 'bn' ? 'যাচাই ও কার্যকর করুন' : 'Verify & Authorize'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
