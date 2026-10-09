import React from 'react';
import { useApp } from '../../context/AppContext';
import { UsedBuyRecord } from '../../types';
import { numberToBanglaWords } from '../../utils/numberToWordsBn';
import { Printer, X, ShieldCheck, FileCheck } from 'lucide-react';

interface PrintUsedAgreementModalProps {
  record: UsedBuyRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintUsedAgreementModal: React.FC<PrintUsedAgreementModalProps> = ({ record, isOpen, onClose }) => {
  const { settings, formatCurrency } = useApp();

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountInWords = numberToBanglaWords(record.buyPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in">
      
      {/* Dynamic Print Styles for Legal Deed */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-modal-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="print-modal-container bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-slate-200 flex flex-col text-slate-900">
        
        {/* Modal Top Control Bar */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm sm:text-base">
              ব্যবহৃত / পুরনো স্মার্টফোন ক্রয়ের আইনি চুক্তিপত্র (Legal Purchase Deed)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>চুক্তিপত্র প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Deed Paper (A4 Style) */}
        <div className="p-8 sm:p-12 space-y-6 text-xs sm:text-sm leading-relaxed text-black bg-white">
          
          {/* Shop Letterhead Header */}
          <div className="text-center border-b-2 border-black pb-4">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              {settings.storeName}
            </h1>
            <p className="text-xs mt-1 font-medium">{settings.address}</p>
            <p className="text-xs font-mono mt-0.5">হেল্পলাইন / মোবাইল: {settings.phone}</p>
            
            <div className="inline-block mt-3 px-4 py-1 border-2 border-black rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider bg-slate-100">
              ব্যবহৃত স্মার্টফোন বিক্রয় ও হস্তান্তর সংক্রান্ত আইনি চুক্তিপত্র
            </div>
          </div>

          {/* Deed Meta Details */}
          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-300 pb-2">
            <div>
              <strong>চুক্তিপত্র নং:</strong> {record.buyReceiptNo} ({record.id})
            </div>
            <div>
              <strong>তারিখ:</strong> {new Date(record.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div>
              <strong>ব্রাঞ্চ:</strong> {record.branch}
            </div>
          </div>

          {/* Parties: Buyer & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs">
            <div>
              <h3 className="font-bold underline mb-1 text-slate-900">১ম পক্ষ (ক্রেতা / শোরুম কর্তৃপক্ষ):</h3>
              <p><strong>দোকানের নাম:</strong> {settings.storeName}</p>
              <p><strong>প্রতিনিধি:</strong> শপ ইন-চার্জ / ম্যানেজার</p>
              <p><strong>ঠিকানা:</strong> {settings.address}</p>
              <p><strong>মোবাইল:</strong> {settings.phone}</p>
            </div>

            <div>
              <h3 className="font-bold underline mb-1 text-slate-900">২য় পক্ষ (বিক্রেতা / সাবেক মালিক):</h3>
              <p><strong>বিক্রেতার পূর্ণ নাম:</strong> {record.sellerName}</p>
              <p><strong>মোবাইল নম্বর:</strong> {record.sellerPhone}</p>
              <p><strong>পরিচয়পত্র:</strong> {record.idType} - <span className="font-mono font-bold">{record.idNumber}</span></p>
              <p><strong>বর্তমান ঠিকানা:</strong> {record.sellerAddress}</p>
            </div>
          </div>

          {/* Device Specifications Table */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-2">বিক্রিত স্মার্টফোনের বিবরণ:</h3>
            <table className="w-full border-collapse border border-black text-xs">
              <tbody>
                <tr className="border border-black">
                  <td className="p-2 font-bold bg-slate-100 w-1/4 border-r border-black">ব্র্যান্ড ও মডেল</td>
                  <td className="p-2 border-r border-black font-semibold">{record.brand} {record.model}</td>
                  <td className="p-2 font-bold bg-slate-100 w-1/4 border-r border-black">রং ও স্টোরেজ</td>
                  <td className="p-2 font-semibold">{record.color} • {record.storage}</td>
                </tr>
                <tr className="border border-black">
                  <td className="p-2 font-bold bg-slate-100 border-r border-black">IMEI 1 (প্রধান)</td>
                  <td className="p-2 font-mono font-bold border-r border-black">{record.imei1}</td>
                  <td className="p-2 font-bold bg-slate-100 border-r border-black">IMEI 2</td>
                  <td className="p-2 font-mono">{record.imei2 || 'N/A'}</td>
                </tr>
                <tr className="border border-black">
                  <td className="p-2 font-bold bg-slate-100 border-r border-black">ব্যাটারি হেলথ ও গ্রেড</td>
                  <td className="p-2 border-r border-black">{record.batteryHealthPercent}% • Grade: {record.grade}</td>
                  <td className="p-2 font-bold bg-slate-100 border-r border-black">অ্যাকসেসরিজ</td>
                  <td className="p-2">
                    {record.inspection.boxIncluded ? 'বক্স সহ' : 'বক্স ছাড়া'}, {record.inspection.chargerIncluded ? 'চার্জার সহ' : 'চার্জার ছাড়া'}
                  </td>
                </tr>
                <tr className="border border-black bg-slate-100 font-bold">
                  <td className="p-2 border-r border-black">নির্ধারিত ক্রয়মূল্য</td>
                  <td colSpan={3} className="p-2 text-sm">
                    {formatCurrency(record.buyPrice)} (<span className="font-sans font-semibold">{amountInWords}</span>)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal Clauses (শর্তাবলি ও আইনি ঘোষণা) */}
          <div className="space-y-2 text-justify text-xs text-slate-800">
            <h3 className="font-bold uppercase tracking-wider text-black">বিক্রেতার আইনি অঙ্গীকার ও ঘোষণাপত্র:</h3>
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
              <li>
                আমি ২য় পক্ষ (বিক্রেতা) স্বেচ্ছায়, সজ্ঞানে এবং অন্যের কোনো প্ররোচনা ছাড়া উপরিউক্ত ব্যবহৃত স্মার্টফোনটি নগদ/ব্যাংক মাধ্যমে সর্বমোট <strong>{formatCurrency(record.buyPrice)}</strong> টাকা বুঝে পেয়ে ১ম পক্ষের (ক্রেতা) নিকট বিক্রয় ও চিরতরে মালিকানা হস্তান্তর করিলাম।
              </li>
              <li>
                আমি দৃঢ়ভাবে ঘোষণা করিতেছি যে, এই হ্যান্ডসেটটির বৈধ ও একমাত্র প্রকৃত মালিক আমি নিজে। ইহা কোনো প্রকার চোরাই, ছিনতাইকৃত, অবৈধ উপায়ে সংগৃহীত অথবা কোনো অপরাধমূলক কাজে ব্যবহৃত ডিভাইস নয়।
              </li>
              <li>
                ডিভাইসে রক্ষিত আমার নিজস্ব আইক্লাউড/গুগল অ্যাকাউন্ট, স্ক্রিন পাসওয়ার্ড এবং ব্যক্তিগত তথ্যাদি নিজ দায়িত্বে লগআউট ও ফরম্যাট করিয়া দিয়েছি।
              </li>
              <li>
                ভবিষ্যতে যদি আইন-শৃঙ্খলা রক্ষাকারী বাহিনী (পুলিশ/র‌্যাব/সিআইডি ইত্যাদি) কর্তৃক এই ফোনের বিরুদ্ধে কোনো প্রকার চুরি, জালিয়াতি বা পূর্ববর্তী অপরাধমূলক বিষয়ের অভিযোগ উত্থাপিত হয়, তবে তাহার সম্পূর্ণ দায়-দায়িত্ব এককভাবে আমি ২য় পক্ষ বহন করিব এবং এর কারণে ১ম পক্ষের আর্থিক বা ব্যবসায়িক ক্ষতি হইলে তাহার সম্পূর্ণ ক্ষতিপূরণ দিতে বাধ্য থাকিব।
              </li>
            </ol>
          </div>

          {/* Signatures & Witnesses Section */}
          <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-t border-black pt-1 font-bold">
                বিক্রেতার স্বাক্ষর ও টিপসহি
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">{record.sellerName}</div>
              <div className="text-[10px] text-slate-500 font-mono">মোবাইল: {record.sellerPhone}</div>
            </div>

            <div>
              <div className="border-t border-black pt-1 font-bold">
                সাক্ষীর স্বাক্ষর
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">নাম: .......................................</div>
              <div className="text-[10px] text-slate-500">মোবাইল: ...................................</div>
            </div>

            <div>
              <div className="border-t border-black pt-1 font-bold">
                ক্রেতা / শোরুম কর্তৃপক্ষের সিল ও স্বাক্ষর
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">{settings.storeName}</div>
              <div className="text-[10px] text-slate-500">ব্রাঞ্চ: {record.branch}</div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-500 font-mono">
            Generated via PhoneSell Pro MDM & Legal ERP • Printed on {new Date().toLocaleString()}
          </div>

        </div>

      </div>
    </div>
  );
};
