import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, User, Phone, DollarSign, Award, AlertTriangle, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditProfile } from '../../types';

interface CustomerCreditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  currentTotalDue: number;
}

export const CustomerCreditProfileModal: React.FC<CustomerCreditProfileModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  currentTotalDue
}) => {
  const { customerProfiles, updateCustomerCreditProfile, formatCurrency, t } = useApp();

  const existing = customerProfiles.find(p => p.phone === customerPhone) || {
    phone: customerPhone,
    name: customerName,
    creditLimit: 50000,
    riskRating: 'low' as const,
    nidNumber: '',
    address: '',
    notes: ''
  };

  const [creditLimit, setCreditLimit] = useState<number>(existing.creditLimit || 50000);
  const [riskRating, setRiskRating] = useState<CustomerCreditProfile['riskRating']>(existing.riskRating || 'low');
  const [nidNumber, setNidNumber] = useState<string>(existing.nidNumber || '');
  const [address, setAddress] = useState<string>(existing.address || '');
  const [notes, setNotes] = useState<string>(existing.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerCreditProfile({
      id: customerPhone,
      phone: customerPhone,
      name: customerName,
      creditLimit,
      riskRating,
      nidNumber: nidNumber.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  const availableCredit = creditLimit - currentTotalDue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-4">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('গ্রাহক ক্রেডিট লিমিট ও ঝুঁকি রেটিং', 'Customer Credit & Risk Profile')}</h3>
              <p className="text-[11px] text-slate-300">গ্রাহক: {customerName} | {customerPhone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Credit Overview */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-500 block text-[10px]">বর্তমান মোট বাকি:</span>
              <span className="font-mono font-bold text-rose-600 text-sm">{formatCurrency(currentTotalDue)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">অবশিষ্ট ক্রেডিট সীমা:</span>
              <span className={`font-mono font-bold text-sm ${availableCredit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {formatCurrency(availableCredit)}
              </span>
            </div>
          </div>

          {/* Credit Limit Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              সর্বোচ্চ বাকি সীমা / ক্রেডিট লিমিট (Credit Limit - ৳):
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={creditLimit}
              onChange={(e) => setCreditLimit(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              গ্রাহকের বাকি এই পরিমাণের বেশি হলে বিক্রির সময় সফটওয়্যার সতর্কবার্তা প্রদর্শন করবে।
            </p>
          </div>

          {/* Risk Rating Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              গ্রাহকের ঝুঁকি রেটিং (Credit Risk Grade):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'ভালো (Low)', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { id: 'medium', label: 'মাঝারি (Medium)', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                { id: 'high', label: 'সতর্কতা (High)', color: 'border-orange-500 bg-orange-50 text-orange-800' },
                { id: 'blacklisted', label: 'খেলাপী (Blocked)', color: 'border-rose-600 bg-rose-50 text-rose-800' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRiskRating(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-center border font-semibold transition ${
                    riskRating === item.id ? `${item.color} font-bold ring-2 ring-slate-800` : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* NID number */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              জাতীয় পরিচয়পত্র (NID) নম্বর:
            </label>
            <input
              type="text"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              placeholder="যেমন: 19882691234567890"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              স্থায়ী ঠিকানা / কর্মস্থল:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="গ্রাম/রোড, থানা, জেলা"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Confidential Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              গোপন নোট ও মন্তব্য:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="গ্রাহকের লেনদেনের আচরণ, পূর্বের ইতিহাস বা অন্য তথ্য..."
              rows={2}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t('বাতিল', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition"
            >
              {t('সংরক্ষণ করুন', 'Save Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
