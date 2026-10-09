import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  MessageSquare, 
  Calendar, 
  User, 
  Smartphone, 
  Tv, 
  Cpu, 
  DollarSign, 
  Trash2, 
  Check, 
  X,
  FileCheck,
  Download,
  Tag,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RepairTicket, RepairStatus, Product } from '../../types';
import { BarcodeSheetModal } from '../Common/BarcodeSheetModal';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

export const RepairManager: React.FC = () => {
  const { 
    repairs, 
    addRepairTicket, 
    updateRepairStatus, 
    deleteRepairTicket, 
    settings, 
    formatCurrency, 
    exportToCsv,
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RepairStatus>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'imei' | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState<RepairTicket | null>(null);
  const [printingTicket, setPrintingTicket] = useState<RepairTicket | null>(null);
  const [stickerProduct, setStickerProduct] = useState<Product | null>(null);

  // New Ticket Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [deviceType, setDeviceType] = useState('স্মার্টফোন');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [accessories, setAccessories] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(1000);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [estDeliveryDate, setEstDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Update Status Modal State
  const [newStatus, setNewStatus] = useState<RepairStatus>('ready');
  const [techNotes, setTechNotes] = useState('');
  const [finalCostInput, setFinalCostInput] = useState<number>(0);
  const [addPaymentInput, setAddPaymentInput] = useState<number>(0);

  // KPIs
  const activeRepairsCount = useMemo(() => {
    return repairs.filter(r => !['delivered', 'cancelled'].includes(r.status)).length;
  }, [repairs]);

  const readyRepairsCount = useMemo(() => {
    return repairs.filter(r => r.status === 'ready').length;
  }, [repairs]);

  const totalAdvanceCollected = useMemo(() => {
    return repairs.reduce((sum, r) => sum + r.advancePaid, 0);
  }, [repairs]);

  // Filtered List
  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        r.ticketNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        r.deviceModel.toLowerCase().includes(q) ||
        r.deviceBrand.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [repairs, statusFilter, searchQuery]);

  // Status Badge Helper
  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'received':
        return { label: 'গৃহীত হয়েছে', color: 'bg-blue-100 text-blue-800' };
      case 'diagnosing':
        return { label: 'যাচাই চলছে', color: 'bg-amber-100 text-amber-800' };
      case 'in_progress':
        return { label: 'মেরামত চলছে', color: 'bg-indigo-100 text-indigo-800' };
      case 'waiting_parts':
        return { label: 'পার্টসের অপেক্ষা', color: 'bg-orange-100 text-orange-800' };
      case 'ready':
        return { label: 'ডেলিভারির জন্য প্রস্তুত', color: 'bg-emerald-100 text-emerald-800 animate-pulse' };
      case 'delivered':
        return { label: 'ডেলিভারি সম্পন্ন', color: 'bg-slate-100 text-slate-700' };
      case 'cancelled':
        return { label: 'বাতিল', color: 'bg-rose-100 text-rose-700' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700' };
    }
  };

  // Submit New Repair Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !deviceModel.trim()) {
      alert(t('কাস্টমারের নাম, ফোন এবং ডিভাইসের মডেল প্রদান করুন!', 'Please enter customer name, phone and device model!'));
      return;
    }

    const created = addRepairTicket({
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      customerAddress: custAddress.trim(),
      deviceType,
      deviceBrand: deviceBrand.trim() || deviceType,
      deviceModel: deviceModel.trim(),
      serialOrImei: serialOrImei.trim(),
      defectDescription: defectDescription.trim() || 'সাধারণ সমস্যা সমাধান ও সার্ভিসিং',
      accessoriesReceived: accessories.trim(),
      estimatedCost: Number(estimatedCost) || 0,
      advancePaid: Number(advancePaid) || 0,
      status: 'received',
      receivedDate: new Date().toISOString().split('T')[0],
      estimatedDeliveryDate: estDeliveryDate
    });

    setIsAddModalOpen(false);
    // Reset form
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setDeviceBrand('');
    setDeviceModel('');
    setSerialOrImei('');
    setDefectDescription('');
    setAccessories('');
    setEstimatedCost(1000);
    setAdvancePaid(0);

    // Prompt print job card
    if (confirm(t('সার্ভিসিং টিকিট সফলভাবে তৈরি হয়েছে! আপনি কি এখনই জব শিট / রসিদ প্রিন্ট করতে চান?', 'Repair ticket created! Do you want to print the job card receipt now?'))) {
      setPrintingTicket(created);
    }
  };

  // Open Update Status
  const handleOpenUpdate = (ticket: RepairTicket) => {
    setUpdatingTicket(ticket);
    setNewStatus(ticket.status === 'received' ? 'in_progress' : ticket.status === 'in_progress' ? 'ready' : ticket.status);
    setTechNotes(ticket.technicianNotes || '');
    setFinalCostInput(ticket.finalCost || ticket.estimatedCost);
    setAddPaymentInput(0);
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingTicket) return;

    updateRepairStatus(
      updatingTicket.id, 
      newStatus, 
      techNotes.trim(), 
      finalCostInput, 
      addPaymentInput
    );

    setUpdatingTicket(null);
  };

  // WhatsApp Alert for Ready Device
  const handleSendReadyWhatsApp = (ticket: RepairTicket) => {
    const msg = `প্রিয় ${ticket.customerName}, আপনার মেরামতকৃত ডিভাইস (${ticket.deviceModel}) সফলভাবে সার্ভিসিং সম্পন্ন হয়েছে এবং ডেলিভারির জন্য প্রস্তুত। অবশিষ্ট প্রদেয় বকেয়া: ${ticket.dueAmount} টাকা। আপনার টিকিট নং: ${ticket.ticketNumber} নিয়ে দোকানে যোগাযোগ করুন (${settings.storeName} - ${settings.phone})। ধন্যবাদ!`;
    const cleanPhone = ticket.customerPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('88') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              {t('সার্ভিসিং ও রিপেয়ারিং ম্যানেজমেন্ট', 'Electronics Repair & Servicing')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('কাস্টমার সার্ভিসিং টিকিট, টেকনিশিয়ান ট্র্যাকিং, জব কার্ড প্রিন্ট এবং ডেলিভারি বিলিং', 'Track repair job cards, device defects, technician progress & repair delivery billing')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন সার্ভিসিং টিকিট', 'New Repair Ticket')}</span>
            </button>
            <button
              onClick={() => exportToCsv(repairs, 'Repair_Tickets')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('এক্সপোর্ট', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">{t('চলতি সার্ভিসিং কাজ', 'Active Repairs')}</span>
              <span className="text-base font-bold text-slate-900">{activeRepairsCount} টি ডিভাইস</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-medium block">{t('ডেলিভারির জন্য রেডি', 'Ready for Pickup')}</span>
              <span className="text-base font-bold text-emerald-700">{readyRepairsCount} টি ডিভাইস</span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-purple-700 font-medium block">{t('মোট অগ্রিম জমা', 'Advance Collected')}</span>
              <span className="text-base font-bold text-purple-700 font-mono">{formatCurrency(totalAdvanceCollected)}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['all', 'received', 'in_progress', 'ready', 'delivered'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  statusFilter === tab 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' && 'সকল টিকিট'}
                {tab === 'received' && 'জমা নেওয়া'}
                {tab === 'in_progress' && 'মেরামত চলছে'}
                {tab === 'ready' && 'রেডি (Pickup)'}
                {tab === 'delivered' && 'ডেলিভারি সম্পন্ন'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('টিকিট #, মডেল বা ফোন...', 'Search by ticket #, phone...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setScannerTarget('search');
                setIsScannerOpen(true);
              }}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs transition shrink-0"
              title="বারকোড বা IMEI স্ক্যান করুন"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepairs.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm">
              {t('কোনো সার্ভিসিং টিকিট পাওয়া যায়নি', 'No repair tickets found')}
            </div>
          ) : (
            filteredRepairs.map(ticket => {
              const statusInfo = getStatusBadge(ticket.status);
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Ticket Number & Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Customer & Device Details */}
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-sm">{ticket.deviceModel}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ticket.deviceType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{ticket.customerName}</span>
                        </span>
                        <span className="font-mono text-slate-700">{ticket.customerPhone}</span>
                      </div>

                      {/* Defect Description */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('সমস্যার বিবরণ:', 'Issue:')}</span>
                        <p className="text-[11px] text-slate-700 line-clamp-2 mt-0.5 font-medium">{ticket.defectDescription}</p>
                      </div>

                      {/* Accessories & Technician Notes if any */}
                      {ticket.accessoriesReceived && (
                        <p className="text-[10px] text-slate-500 truncate">
                          <strong>{t('এক্সেসরিজ:', 'Accessories:')}</strong> {ticket.accessoriesReceived}
                        </p>
                      )}
                      {ticket.technicianNotes && (
                        <p className="text-[10px] text-indigo-700 bg-indigo-50/60 p-1.5 rounded-lg truncate">
                          <strong>{t('টেকনিশিয়ান নোট:', 'Tech Note:')}</strong> {ticket.technicianNotes}
                        </p>
                      )}
                    </div>

                    {/* Cost & Payment Details */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-3 gap-1 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t('মোট বিল', 'Total Bill')}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(ticket.finalCost || ticket.estimatedCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 block">{t('জমা', 'Paid')}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(ticket.advancePaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-500 block font-bold">{t('বকেয়া', 'Due')}</span>
                        <span className="font-mono font-bold text-rose-600">
                          {formatCurrency(ticket.dueAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPrintingTicket(ticket)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title={t('জব কার্ড / রসিদ প্রিন্ট করুন', 'Print Job Sheet')}
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const p: Product = {
                            id: ticket.id,
                            ownerId: ticket.ownerId || 'admin',
                            name: `${ticket.deviceModel}`,
                            brand: ticket.deviceBrand || ticket.deviceType,
                            category: `${ticket.customerName} (${ticket.customerPhone})`,
                            barcode: ticket.ticketNumber,
                            purchasePrice: 0,
                            sellingPrice: ticket.finalCost || ticket.estimatedCost,
                            stock: 1,
                            minStockAlert: 1,
                            warrantyMonths: 0,
                            serialNumbers: ticket.serialOrImei ? [ticket.serialOrImei] : [],
                            createdAt: ticket.createdAt || new Date().toISOString()
                          };
                          setStickerProduct(p);
                        }}
                        className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                        title={t('ডিভাইস ট্র্যাকিং বারকোড স্টিকার প্রিন্ট', 'Print Device Tracking Label')}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>
                      
                      {ticket.status === 'ready' && (
                        <button
                          onClick={() => handleSendReadyWhatsApp(ticket)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="WhatsApp Ready Alert"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(t('আপনি কি এই টিকিটটি মুছে ফেলতে চান?', 'Delete this ticket?'))) {
                            deleteRepairTicket(ticket.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title={t('মুছুন', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenUpdate(ticket)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {ticket.status === 'ready' ? t('ডেলিভারি দিন', 'Deliver Device') : t('স্ট্যাটাস আপডেট', 'Update Status')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: NEW REPAIR TICKET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                {t('নতুন মেরামত / সার্ভিসিং টিকিট গ্রহণ', 'New Repair Job Card')}
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="py-4 space-y-4 text-xs">
              
              {/* Customer Info */}
              <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 uppercase block tracking-wider">
                  {t('১. কাস্টমারের তথ্য', '1. Customer Information')}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">{t('কাস্টমার নাম *', 'Customer Name *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ সাকিব হোসেন"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">{t('মোবাইল নম্বর *', 'Phone *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭১২-৩৪৫৬৭৮"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 uppercase block tracking-wider">
                  {t('২. ডিভাইসের বিবরণ', '2. Device Information')}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">{t('ডিভাইসের ধরণ', 'Device Type')}</label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="স্মার্টফোন">স্মার্টফোন (Smartphone)</option>
                      <option value="টেলিভিশন">টেলিভিশন (Smart TV)</option>
                      <option value="ল্যাপটপ">ল্যাপটপ / পিসি (Laptop)</option>
                      <option value="এসি ও ফ্রিজ">এসি ও রেফ্রিজারেটর</option>
                      <option value="অডিও / সাউন্ড">অডিও স্পিকার / হেডফোন</option>
                      <option value="অন্যান্য">অন্যান্য ইলেকট্রনিক্স</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">{t('ব্র্যান্ড (যেমন: Samsung/Sony)', 'Brand')}</label>
                    <input
                      type="text"
                      placeholder="Samsung / Sony / Walton"
                      value={deviceBrand}
                      onChange={(e) => setDeviceBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-600 mb-1">{t('ডিভাইস মডেল নাম ও রঙ *', 'Device Model *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Samsung Galaxy S22 Ultra (Black)"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600">{t('সিরিয়াল / IMEI নম্বর (ঐচ্ছিক)', 'Serial / IMEI')}</label>
                      <button
                        type="button"
                        onClick={() => {
                          setScannerTarget('imei');
                          setIsScannerOpen(true);
                        }}
                        className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Camera className="w-3 h-3" />
                        <span>স্ক্যান</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="IMEI বা সিরিয়াল নম্বর"
                      value={serialOrImei}
                      onChange={(e) => setSerialOrImei(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">{t('একসাথে গৃহীত এক্সেসরিজ', 'Accessories Received')}</label>
                    <input
                      type="text"
                      placeholder="যেমন: চার্জার, রিমোট, বক্স"
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">{t('সমস্যা / ডিফেক্টের বিবরণ *', 'Problem / Defect Description *')}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="যেমন: ডিসপ্লেতে আলো নেই কিন্তু কল আসে, পানিতে ভিজে বন্ধ হয়ে গেছে..."
                    value={defectDescription}
                    onChange={(e) => setDefectDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Financials & Delivery Date */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('আনুমানিক খরচ (৳)', 'Est. Cost')}</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('অগ্রিম জমা (৳)', 'Advance Paid')}</label>
                  <input
                    type="number"
                    min="0"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-emerald-400 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('সম্ভাব্য ডেলিভারি', 'Est. Delivery')}</label>
                  <input
                    type="date"
                    value={estDeliveryDate}
                    onChange={(e) => setEstDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100"
                >
                  {t('টিকিট সংরক্ষণ করুন', 'Create Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STATUS / DELIVERY */}
      {updatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">
                {t('সার্ভিসিং স্ট্যাটাস ও ডেলিভারি বিলিং', 'Update Repair Status & Delivery')}
              </h4>
              <button onClick={() => setUpdatingTicket(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{updatingTicket.ticketNumber}</span>
                  <span className="text-slate-600">{updatingTicket.deviceModel}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>কাস্টমার: {updatingTicket.customerName}</span>
                  <span>ফোন: {updatingTicket.customerPhone}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('বর্তমান অবস্থা / স্ট্যাটাস *', 'Status *')}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="received">গৃহীত হয়েছে (Received)</option>
                  <option value="diagnosing">সমস্যা যাচাই চলছে (Diagnosing)</option>
                  <option value="in_progress">মেরামত চলছে (In Progress)</option>
                  <option value="waiting_parts">পার্টস অপেক্ষমান (Waiting Parts)</option>
                  <option value="ready">ডেলিভারির জন্য প্রস্তুত (Ready for Pickup)</option>
                  <option value="delivered">ডেলিভারি সম্পন্ন (Delivered to Customer)</option>
                  <option value="cancelled">বাতিলকৃত (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('চূড়ান্ত মোট খরচ (৳):', 'Final Repair Cost:')}</label>
                <input
                  type="number"
                  min="0"
                  value={finalCostInput}
                  onChange={(e) => setFinalCostInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              {newStatus === 'delivered' && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>{t('পূর্বের জমা টাকা:', 'Already Paid Advance:')}</span>
                    <span className="font-mono">{formatCurrency(updatingTicket.advancePaid)}</span>
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-bold mb-1">
                      {t('ডেলিভারির সময় আদায়কৃত টাকা (৳):', 'Payment Received on Delivery:')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addPaymentInput}
                      onChange={(e) => setAddPaymentInput(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-xl font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t('টেকনিশিয়ান নোট / পরিবর্তনের তথ্য:', 'Technician Remark / Parts Changed:')}
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: নতুন ডিসপ্লে লাগানো হয়েছে এবং ৬ মাসের ওয়ারেন্টি দেওয়া হলো..."
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingTicket(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-100"
                >
                  {t('স্ট্যাটাস সংরক্ষণ করুন', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE JOB CARD / SERVICE RECEIPT */}
      {printingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-8">
            <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{t('সার্ভিসিং জব কার্ড ও রসিদ প্রিভিউ', 'Repair Job Card Print Preview')}</h3>
              <button onClick={() => setPrintingTicket(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Printable Content */}
            <div className="p-6 sm:p-8 text-slate-800 space-y-6 text-xs">
              
              {/* Header */}
              <div className="text-center border-b pb-4 border-slate-300 border-dashed">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{settings.storeName}</h2>
                <p className="text-xs text-slate-600">{settings.address} | ফোন: {settings.phone}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-full font-bold text-slate-800">
                  সার্ভিসিং ও রিপেয়ারিং জব কার্ড (Service Job Sheet)
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">টিকিট নম্বর:</span>
                  <span className="font-mono font-bold text-base text-indigo-700">{printingTicket.ticketNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">গ্রহণের তারিখ:</span>
                  <span className="font-mono font-bold">{printingTicket.receivedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-900">{printingTicket.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">মোবাইল:</span>
                  <span className="font-mono font-bold">{printingTicket.customerPhone}</span>
                </div>
              </div>

              {/* Device & Defect */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">ডিভাইস ও মডেল:</span>
                  <span className="font-bold text-slate-900">{printingTicket.deviceModel} ({printingTicket.deviceType})</span>
                </div>
                {printingTicket.serialOrImei && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IMEI / সিরিয়াল:</span>
                    <span className="font-mono text-slate-800">{printingTicket.serialOrImei}</span>
                  </div>
                )}
                {printingTicket.accessoriesReceived && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">জমা রাখা এক্সেসরিজ:</span>
                    <span className="text-slate-700">{printingTicket.accessoriesReceived}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2">
                  <span className="text-slate-500 block">সমস্যার বিবরণ:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{printingTicket.defectDescription}</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">আনুমানিক খরচ</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{formatCurrency(printingTicket.estimatedCost)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">অগ্রিম জমা</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">{formatCurrency(printingTicket.advancePaid)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 block">অবশিষ্ট প্রদেয়</span>
                  <span className="font-mono font-bold text-sm text-rose-600">{formatCurrency(printingTicket.dueAmount)}</span>
                </div>
              </div>

              {/* Terms */}
              <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>১. ডিভাইস গ্রহণের সময় এই রসিদটি প্রদর্শন করতে হবে।</p>
                <p>২. রিপেয়ারের পর ৩০ দিনের মধ্যে ডেলিভারি না নিলে কর্তৃপক্ষ দায়ী থাকবে না।</p>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div>
                  <div className="border-t border-slate-300 pt-1 font-semibold">গ্রাহকের স্বাক্ষর</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-1 font-semibold">টেকনিশিয়ান / রিসিভার স্বাক্ষর</div>
                </div>
              </div>
            </div>

            <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setPrintingTicket(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
              >
                <Printer className="w-4 h-4" />
                <span>{t('জব কার্ড প্রিন্ট', 'Print Job Card')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Device Sticker Modal */}
      {stickerProduct && (
        <BarcodeSheetModal
          product={stickerProduct}
          isOpen={!!stickerProduct}
          onClose={() => setStickerProduct(null)}
        />
      )}

      {/* Barcode / IMEI Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'imei') {
            setSerialOrImei(code);
          } else {
            setSearchQuery(code);
          }
          setIsScannerOpen(false);
        }}
      />

    </div>
  );
};
