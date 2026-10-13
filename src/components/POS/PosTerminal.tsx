import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Camera, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Percent, 
  DollarSign,
  Smartphone,
  ChevronRight,
  Layers,
  X,
  AlertCircle,
  Banknote,
  Clock,
  RotateCcw,
  Sparkles,
  Barcode,
  PauseCircle,
  PlayCircle,
  ArrowRight,
  Receipt,
  Printer,
  Share2,
  FileText,
  BadgePercent,
  RefreshCw,
  Wallet,
  Building,
  CheckCircle2,
  Zap,
  Volume2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, CartItem, PaymentMethod, CustomerCreditProfile } from '../../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';

// Web Audio API Sound Synthesizer for tactile feedback
const playSoundEffect = (type: 'beep' | 'chime' | 'error') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'chime') {
      [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Ignore audio restrictions
  }
};

export const PosTerminal: React.FC = () => {
  const { 
    products, 
    categories: appCategories,
    cart, 
    sales,
    installments,
    customerProfiles,
    addToCart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    setCartItemSerials,
    completeCheckout,
    formatCurrency, 
    settings,
    lang,
    branch,
    currentUser,
    parkedCarts,
    parkCurrentCart,
    restoreParkedCart,
    deleteParkedCart,
    t 
  } = useApp();

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [showParkedModal, setShowParkedModal] = useState<boolean>(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState<boolean>(false);
  const [showCustomerPickerModal, setShowCustomerPickerModal] = useState<boolean>(false);

  // Active Sale Mode: 'cash' | 'due' | 'installment' | 'digital' | 'split'
  const [saleMode, setSaleMode] = useState<'cash' | 'due' | 'installment' | 'digital' | 'split'>('cash');

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerNid, setCustomerNid] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<CustomerCreditProfile | null>(null);

  // Financial Adjustments
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [tradeInDiscount, setTradeInDiscount] = useState<number>(0);
  const [includeVat, setIncludeVat] = useState<boolean>(false);
  const [checkoutNote, setCheckoutNote] = useState<string>('');

  // Mode 1: Cash Checkout State
  const [receivedCashInput, setReceivedCashInput] = useState<string>('');

  // Mode 2: Due Checkout State
  const [duePartialPaid, setDuePartialPaid] = useState<string>('0');
  const [dueDeadline, setDueDeadline] = useState<string>('');

  // Mode 3: Installment (EMI) State
  const [installmentMonths, setInstallmentMonths] = useState<number>(6);
  const [downPaymentInput, setDownPaymentInput] = useState<string>('');
  const [interestMarkupPercent, setInterestMarkupPercent] = useState<number>(0);
  const [enrollInLocker, setEnrollInLocker] = useState<boolean>(true);
  const [guarantorName, setGuarantorName] = useState<string>('');
  const [guarantorPhone, setGuarantorPhone] = useState<string>('');
  const [guarantorNid, setGuarantorNid] = useState<string>('');
  const [guarantorRelation, setGuarantorRelation] = useState<string>('');
  const [guarantor2Name, setGuarantor2Name] = useState<string>('');
  const [guarantor2Phone, setGuarantor2Phone] = useState<string>('');
  const [guarantor2Relation, setGuarantor2Relation] = useState<string>('');
  const [showGuarantor, setShowGuarantor] = useState<boolean>(false);

  // Mode 4: Digital / Mobile Banking State
  const [digitalMethod, setDigitalMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card'>('bkash');
  const [digitalTrxId, setDigitalTrxId] = useState<string>('');

  // Mode 5: Split Payment State
  const [splitCash, setSplitCash] = useState<string>('0');
  const [splitDigital, setSplitDigital] = useState<string>('0');
  const [splitDue, setSplitDue] = useState<string>('0');

  // Serial/IMEI modal state
  const [activeSerialModalProduct, setActiveSerialModalProduct] = useState<CartItem | null>(null);
  const [tempSerials, setTempSerials] = useState<string[]>([]);
  const [customSerialInput, setCustomSerialInput] = useState<string>('');

  // Custom One-off item modal state
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<string>('');
  const [customItemCategory, setCustomItemCategory] = useState<string>('এক্সেসরিজ');

  // Success / Validation Feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Categories & Brands list
  const categories = useMemo(() => {
    const fromApp = (appCategories || []).map(c => c.name.trim()).filter(Boolean);
    const fromProducts = products.map(p => (p.category || '').trim()).filter(Boolean);
    const list = Array.from(new Set([...fromApp, ...fromProducts]));
    return ['all', ...list];
  }, [appCategories, products]);

  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['all', ...list];
  }, [products]);

  // Filtered products catalog
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      const query = searchQuery.toLowerCase().trim();

      if (!query) return matchCat && matchBrand;

      const matchName = p.name.toLowerCase().includes(query);
      const matchBrandQuery = (p.brand || '').toLowerCase().includes(query);
      const matchBarcode = (p.barcode || '').toLowerCase().includes(query);
      const matchSerial = (p.serialNumbers || []).some(s => s.toLowerCase().includes(query));

      return matchCat && matchBrand && (matchName || matchBrandQuery || matchBarcode || matchSerial);
    });
  }, [products, selectedCategory, selectedBrand, searchQuery]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const effectiveDiscount = useMemo(() => {
    if (discountType === 'percent') {
      return Math.round((cartSubtotal * discountAmount) / 100);
    }
    return discountAmount;
  }, [cartSubtotal, discountAmount, discountType]);

  const vatAmount = useMemo(() => {
    if (!includeVat) return 0;
    const taxableAmount = Math.max(0, cartSubtotal - effectiveDiscount - tradeInDiscount);
    return Math.round(taxableAmount * (settings.vatPercent / 100));
  }, [cartSubtotal, effectiveDiscount, tradeInDiscount, includeVat, settings.vatPercent]);

  const netPayableTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - effectiveDiscount - tradeInDiscount + vatAmount);
  }, [cartSubtotal, effectiveDiscount, tradeInDiscount, vatAmount]);

  // Sync cash tender and down payment defaults
  useEffect(() => {
    if (saleMode === 'installment') {
      if (!downPaymentInput || downPaymentInput === '0') {
        setDownPaymentInput(Math.round(netPayableTotal * 0.3).toString());
      }
    }
    if (saleMode === 'cash') {
      if (!receivedCashInput || receivedCashInput === '0') {
        setReceivedCashInput(netPayableTotal.toString());
      }
    }
  }, [saleMode, netPayableTotal]);

  // Cash Change Calculation
  const changeDue = useMemo(() => {
    const received = parseFloat(receivedCashInput) || 0;
    return Math.max(0, received - netPayableTotal);
  }, [receivedCashInput, netPayableTotal]);

  // Installment EMI breakdown with optional profit markup
  const emiBreakdown = useMemo(() => {
    const down = Math.min(netPayableTotal, Math.max(0, parseFloat(downPaymentInput) || 0));
    const principalBalance = Math.max(0, netPayableTotal - down);
    const markupAmt = Math.round((principalBalance * interestMarkupPercent) / 100);
    const totalFinanced = principalBalance + markupAmt;
    const months = installmentMonths || 6;
    const perMonth = months > 0 ? Math.round(totalFinanced / months) : totalFinanced;
    return {
      down,
      principalBalance,
      markupAmt,
      totalFinanced,
      months,
      perMonth
    };
  }, [netPayableTotal, downPaymentInput, installmentMonths, interestMarkupPercent]);

  // Global listener for USB Laser Barcode Scanners and Shortcuts
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: F2 focuses Barcode gun input
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }
      // Hotkey: F4 executes checkout
      if (e.key === 'F4') {
        e.preventDefault();
        handleExecuteCheckout();
        return;
      }
      // Hotkey: F9 parks cart
      if (e.key === 'F9' && cart.length > 0) {
        e.preventDefault();
        parkCurrentCart(customerName.trim() || 'Walk-in Customer', checkoutNote);
        setCustomerName('');
        setCustomerPhone('');
        return;
      }

      // If user is focused on a normal text input/textarea, let them type
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      if (isInput && activeEl !== barcodeInputRef.current) {
        return;
      }

      const currentTime = Date.now();
      const char = e.key;

      if (char === 'Enter') {
        if (buffer.length > 2 && currentTime - lastKeyTime < 250) {
          e.preventDefault();
          processBarcodeCode(buffer.trim());
          buffer = '';
        }
      } else if (char.length === 1) {
        // Fast succession keystrokes characteristic of hardware scanner
        if (currentTime - lastKeyTime > 250) {
          buffer = '';
        }
        buffer += char;
        lastKeyTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, checkoutNote]);

  // Process barcode or serial match
  const processBarcodeCode = (code: string) => {
    if (!code) return;
    const trimmed = code.toLowerCase().trim();

    // 1. Check direct product barcode
    let found = products.find(p => (p.barcode || '').toLowerCase() === trimmed);
    let matchedSerial: string | null = null;

    // 2. Check IMEI / Serial
    if (!found) {
      for (const p of products) {
        if (p.serialNumbers && p.serialNumbers.some(s => s.toLowerCase() === trimmed)) {
          found = p;
          matchedSerial = p.serialNumbers.find(s => s.toLowerCase() === trimmed) || null;
          break;
        }
      }
    }

    if (found) {
      const added = addToCart(found, 1, matchedSerial ? [matchedSerial] : []);
      if (added) {
        playSoundEffect('beep');
        setBarcodeInput('');
        setValidationError(null);
        setSuccessToast(`"${found.name}" কার্টে যুক্ত হয়েছে!`);
        setTimeout(() => setSuccessToast(null), 2500);
      }
    } else {
      playSoundEffect('error');
      setValidationError(`বারকোড বা IMEI "${code}" বিশিষ্ট কোনো পণ্য স্টকে পাওয়া যায়নি!`);
      setTimeout(() => setValidationError(null), 4000);
    }
  };

  // Handle barcode form submission
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;
    processBarcodeCode(barcodeInput.trim());
  };

  // Add Custom / One-off unlisted Item
  const handleAddCustomItem = () => {
    const price = parseFloat(customItemPrice);
    if (!customItemName.trim() || isNaN(price) || price <= 0) {
      alert('অনুগ্রহ করে সঠিক পণ্যের নাম এবং বিক্রয়মূল্য লিখুন!');
      return;
    }

    const customProduct: Product = {
      id: `custom_${Date.now()}`,
      ownerId: currentUser?.id || 'admin',
      name: customItemName.trim(),
      brand: 'Custom',
      category: customItemCategory,
      barcode: `CUST-${Date.now().toString().slice(-6)}`,
      purchasePrice: Math.round(price * 0.8),
      sellingPrice: price,
      stock: 999,
      minStockAlert: 1,
      warrantyMonths: 0,
      createdAt: new Date().toISOString()
    };

    addToCart(customProduct, 1, []);
    playSoundEffect('beep');
    setCustomItemName('');
    setCustomItemPrice('');
    setShowCustomItemModal(false);
  };

  // Quick Customer Selection
  const handleSelectCustomer = (profile: CustomerCreditProfile) => {
    setSelectedProfile(profile);
    setCustomerName(profile.name);
    setCustomerPhone(profile.phone);
    if (profile.address) setCustomerAddress(profile.address);
    if (profile.nidNumber) setCustomerNid(profile.nidNumber);
    setShowCustomerPickerModal(false);
  };

  // Customer autofill when matching phone typed
  const handleCustomerPhoneChange = (val: string) => {
    setCustomerPhone(val);
    const clean = val.trim();
    if (clean.length >= 4) {
      const found = customerProfiles.find(p => p.phone === clean || p.phone.endsWith(clean));
      if (found) {
        setSelectedProfile(found);
        if (!customerName) setCustomerName(found.name);
        if (!customerAddress && found.address) setCustomerAddress(found.address);
        if (!customerNid && found.nidNumber) setCustomerNid(found.nidNumber);
        return;
      }
    }
    setSelectedProfile(null);
  };

  // Serial / IMEI selection handlers
  const handleOpenSerialModal = (cartItem: CartItem) => {
    setActiveSerialModalProduct(cartItem);
    setTempSerials([...cartItem.selectedSerials]);
    setCustomSerialInput('');
  };

  const handleSaveSerials = () => {
    if (activeSerialModalProduct) {
      setCartItemSerials(activeSerialModalProduct.product.id, tempSerials);
      setActiveSerialModalProduct(null);
    }
  };

  const handleToggleSerial = (serial: string) => {
    if (tempSerials.includes(serial)) {
      setTempSerials(tempSerials.filter(s => s !== serial));
    } else {
      setTempSerials([...tempSerials, serial]);
    }
  };

  const handleAddCustomSerial = () => {
    if (customSerialInput.trim() && !tempSerials.includes(customSerialInput.trim())) {
      setTempSerials([...tempSerials, customSerialInput.trim()]);
      setCustomSerialInput('');
    }
  };

  // Master Sale Finalizer
  const handleExecuteCheckout = () => {
    setValidationError(null);

    if (cart.length === 0) {
      playSoundEffect('error');
      setValidationError('কার্ট খালি! প্রথমে বামপাশের তালিকা থেকে পণ্য যোগ করুন বা বারকোড স্ক্যান করুন।');
      return;
    }

    // Validate Customer Info based on Sale Mode
    const requiresCustomer = saleMode === 'due' || saleMode === 'installment';

    if (requiresCustomer) {
      if (!customerName.trim()) {
        playSoundEffect('error');
        setValidationError('বাকি বা কিস্তিতে বিক্রির জন্য ক্রেতার নাম দেওয়া আবশ্যক!');
        return;
      }
      if (!customerPhone.trim() || customerPhone.trim().length < 6) {
        playSoundEffect('error');
        setValidationError('বাকি বা কিস্তিতে বিক্রির জন্য ক্রেতার সঠিক মোবাইল নম্বর দেওয়া আবশ্যক!');
        return;
      }
    }

    // Determine Payment Method, Paid Amount & Extra Details
    let paymentMethod: PaymentMethod = 'cash';
    let paidAmount = netPayableTotal;
    let downPayment: number | undefined = undefined;
    let months: number | undefined = undefined;

    if (saleMode === 'cash') {
      paymentMethod = 'cash';
      paidAmount = netPayableTotal;
    } else if (saleMode === 'due') {
      paymentMethod = 'due';
      const partial = parseFloat(duePartialPaid) || 0;
      paidAmount = Math.min(netPayableTotal, Math.max(0, partial));
    } else if (saleMode === 'installment') {
      paymentMethod = 'installment';
      downPayment = emiBreakdown.down;
      paidAmount = emiBreakdown.down;
      months = emiBreakdown.months;
    } else if (saleMode === 'digital') {
      paymentMethod = digitalMethod === 'card' ? 'card' : digitalMethod === 'bkash' ? 'bkash' : 'nagad';
      paidAmount = netPayableTotal;
    } else if (saleMode === 'split') {
      paymentMethod = 'cash';
      const c = parseFloat(splitCash) || 0;
      const d = parseFloat(splitDigital) || 0;
      paidAmount = Math.min(netPayableTotal, c + d);
    }

    setIsSubmitting(true);

    try {
      // Finalize Checkout via AppContext
      const completed = completeCheckout({
        customerName: customerName.trim() || (lang === 'bn' ? 'সাধারণ ক্রেতা' : 'Walk-in Customer'),
        customerPhone: customerPhone.trim() || 'N/A',
        customerAddress: customerAddress.trim() || undefined,
        customerNid: customerNid.trim() || undefined,
        guarantorName: guarantorName.trim() || undefined,
        guarantorPhone: guarantorPhone.trim() || undefined,
        guarantorNid: guarantorNid.trim() || undefined,
        guarantorRelation: guarantorRelation.trim() || undefined,
        dueDeadline: dueDeadline || undefined,
        discount: effectiveDiscount,
        tradeInDiscount: tradeInDiscount,
        tax: vatAmount,
        paidAmount,
        paymentMethod,
        note: checkoutNote.trim() || (saleMode === 'digital' && digitalTrxId ? `TrxID: ${digitalTrxId}` : undefined),
        installmentMonths: months,
        downPayment,
        enrollDeviceInLocker: saleMode === 'installment' ? enrollInLocker : false,
        receivedAmount: parseFloat(receivedCashInput) || paidAmount,
        changeAmount: changeDue
      });

      if (completed) {
        playSoundEffect('chime');

        // Reset POS Form
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerNid('');
        setSelectedProfile(null);
        setDiscountAmount(0);
        setTradeInDiscount(0);
        setIncludeVat(false);
        setCheckoutNote('');
        setReceivedCashInput('');
        setDuePartialPaid('0');
        setDigitalTrxId('');
        setSplitCash('0');
        setSplitDigital('0');
        setSplitDue('0');
        setGuarantorName('');
        setGuarantorPhone('');
        setGuarantorNid('');
        setGuarantorRelation('');
        setGuarantor2Name('');
        setGuarantor2Phone('');
        setGuarantor2Relation('');
        setValidationError(null);
        setIsMobileCartOpen(false);

        setSuccessToast(`বিক্রয় সফল হয়েছে! ইনভয়েস নং: ${completed.invoiceNumber}`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        playSoundEffect('error');
        setValidationError('বিক্রয় সম্পন্ন করা যায়নি। কার্ট চেক করুন।');
      }
    } catch (err: any) {
      console.error('POS Checkout Error:', err);
      playSoundEffect('error');
      setValidationError(`ত্রুটি: ${err?.message || 'বিক্রয় প্রক্রিয়া ব্যর্থ হয়েছে'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 font-sans">
      
      {/* LEFT PANE: Product Catalog, Quick Barcode Scanner & Search */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        
        {/* Terminal Top Status & Fast Barcode Bar */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
          
          {/* Terminal Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>কাউন্টার ০১ (POS Terminal)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {branch}
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-500 font-medium">
                ক্যাশিয়ার: <strong className="text-slate-800">{currentUser?.name || 'Admin'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Parked Carts Button */}
              <button
                onClick={() => setShowParkedModal(true)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                title="হোল্ড / পার্ক করা কার্ট (F9)"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>হোল্ড বিল ({parkedCarts.length})</span>
              </button>

              {/* Add Custom / Unlisted Item */}
              <button
                onClick={() => setShowCustomItemModal(true)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                title="তাত্ক্ষণিক কাস্টম পণ্য বা সার্ভিস যোগ করুন"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">+ কাস্টম আইটেম</span>
              </button>

              {/* Camera Scanner Button */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                title="ক্যামেরা বারকোড স্ক্যানার চালু করুন"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">ক্যামেরা স্ক্যান</span>
              </button>
            </div>
          </div>

          {/* Quick Barcode Gun Input & Text Search */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            
            {/* Direct USB Barcode Gun Listener Box */}
            <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 relative">
              <Barcode className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder="বারকোড গান স্ক্যান / IMEI লিখুন + Enter (F2)..."
                className="w-full pl-9 pr-14 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-mono font-bold text-indigo-950 placeholder:text-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700"
              >
                স্ক্যান
              </button>
            </form>

            {/* Catalog Search Box */}
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="পণ্যের নাম, মডেল, ব্র্যান্ড বা ক্যাটাগরি দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Popular / Fast-pick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 text-[10px] uppercase">
              <Zap className="w-3 h-3 text-amber-500" />
              দ্রুত পণ্য:
            </span>
            {products.slice(0, 5).map(prod => (
              <button
                key={prod.id}
                onClick={() => {
                  addToCart(prod, 1, prod.serialNumbers && prod.serialNumbers.length > 0 ? [prod.serialNumbers[0]] : []);
                  playSoundEffect('beep');
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md shrink-0 font-medium text-slate-700 transition"
              >
                + {prod.name}
              </button>
            ))}
          </div>

          {/* Category Filter Pills & Brand Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              ক্যাটাগরি:
            </span>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'সকল পণ্য' : cat}
                </button>
              );
            })}

            {/* Brand Dropdown */}
            {brands.length > 2 && (
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="ml-auto px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shrink-0 focus:outline-none"
              >
                <option value="all">সকল ব্র্যান্ড</option>
                {brands.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Success Toast Banner */}
        {successToast && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              <span>{validationError}</span>
            </div>
            <button onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-800">✕</button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map(p => {
              const hasSerials = p.serialNumbers && p.serialNumbers.length > 0;
              const inStock = p.stock > 0;
              const inCartItem = cart.find(c => c.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (inStock) {
                      addToCart(p, 1, hasSerials && p.serialNumbers ? [p.serialNumbers[0]] : []);
                      playSoundEffect('beep');
                    }
                  }}
                  className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition cursor-pointer select-none group relative ${
                    inStock 
                      ? inCartItem
                        ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                        : 'border-slate-200 hover:border-indigo-400 hover:shadow-md' 
                      : 'border-slate-200 opacity-60 bg-slate-100 cursor-not-allowed'
                  }`}
                >
                  {/* Stock & Serial Badge */}
                  <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                      inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inStock ? `স্টক: ${p.stock}` : 'স্টক শেষ'}
                    </span>

                    {hasSerials && (
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono font-bold text-[9px] border border-indigo-200">
                        IMEI
                      </span>
                    )}
                  </div>

                  {/* Product Title & Brand */}
                  <div className="my-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</div>
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-tight">
                      {p.name}
                    </div>
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-[9px] text-slate-400">বিক্রয় মূল্য</div>
                      <div className="font-mono font-black text-xs sm:text-sm text-indigo-700">
                        {formatCurrency(p.sellingPrice)}
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      inStock 
                        ? inCartItem
                          ? 'bg-indigo-600 text-white font-bold text-xs'
                          : 'bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {inCartItem ? inCartItem.quantity : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <div className="font-bold text-sm text-slate-600">কোনো পণ্য পাওয়া যায়নি</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                অন্য কোনো নাম বা মডেল দিয়ে খুঁজুন অথবা উপরে "+ কাস্টম আইটেম" বাটনে চাপ দিয়ে তাত্ক্ষণিক যোগ করুন।
              </p>
            </div>
          )}
        </div>

        {/* Mobile Fixed Cart Bar trigger */}
        <div className="lg:hidden p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-lg">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">{cart.length} টি পণ্য কার্টে</div>
            <div className="text-base font-black font-mono text-indigo-700">{formatCurrency(netPayableTotal)}</div>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>চেকআউট করুন ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          </button>
        </div>

      </div>

      {/* RIGHT PANE: Cart & Full Multi-Mode Checkout Panel */}
      <div className={`
        fixed lg:static inset-0 z-50 lg:z-auto
        w-full lg:w-[480px] xl:w-[520px]
        bg-white flex flex-col h-full shadow-2xl lg:shadow-none
        transition-transform duration-200
        ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Cart Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <h2 className="font-extrabold text-sm sm:text-base">
              সেলিং কার্ট ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Park Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={() => {
                  const cName = customerName.trim() || 'Walk-in Customer';
                  parkCurrentCart(cName, checkoutNote);
                  setCustomerName('');
                  setCustomerPhone('');
                  setSuccessToast('কার্ট সফলভাবে হোল্ড রাখা হয়েছে!');
                  setTimeout(() => setSuccessToast(null), 2500);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition"
                title="পরবর্তী কাস্টমার দেখতে বর্তমান কার্ট হোল্ড করুন (F9)"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">হোল্ড</span>
              </button>
            )}

            {/* Clear Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('আপনি কি কার্টের সকল পণ্য খালি করতে চান?')) {
                    clearCart();
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                title="কার্ট খালি করুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close mobile cart */}
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 border-b border-slate-200 max-h-56 sm:max-h-64 lg:max-h-none">
          {cart.map(item => {
            const hasSerials = item.product.serialNumbers && item.product.serialNumbers.length > 0;
            return (
              <div key={item.product.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>দর: {formatCurrency(item.unitPrice)}</span>
                      {item.warrantyMonths > 0 && (
                        <span className="text-emerald-600 font-bold">{item.warrantyMonths}m ওয়ারেন্টি</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                </div>

                {/* Serial / IMEI Selector Button */}
                {(hasSerials || item.product.category.toLowerCase().includes('ফোন') || item.product.category.toLowerCase().includes('phone')) && (
                  <button
                    onClick={() => handleOpenSerialModal(item)}
                    className="w-full py-1 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-mono text-indigo-700 font-bold flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-1 truncate">
                      <Smartphone className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">
                        {item.selectedSerials.length > 0 
                          ? `IMEI: ${item.selectedSerials.join(', ')}` 
                          : '+ IMEI / সিরিয়াল নম্বর নির্বাচন করুন'}
                      </span>
                    </span>
                    <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                  </button>
                )}
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-bold text-xs text-slate-600">কার্ট খালি</div>
              <p className="text-[11px] text-slate-400 mt-0.5">বামপাশের তালিকা থেকে পণ্য ক্লিক করুন বা বারকোড স্ক্যান করুন।</p>
            </div>
          )}
        </div>

        {/* Pricing Adjustments & Bill Totals */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-2 text-xs shrink-0">
          
          <div className="flex items-center justify-between text-slate-600">
            <span>উপমোট (Subtotal):</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(cartSubtotal)}</span>
          </div>

          {/* Discount & Trade-In Rows */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ছাড় (Discount):</div>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2 py-1 text-xs font-mono font-bold text-right bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')}
                  className="px-1.5 py-1 text-[10px] font-bold bg-slate-200 text-slate-700"
                >
                  {discountType === 'fixed' ? settings.currencySymbol : '%'}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">পুরনো ফোন এক্সচেঞ্জ (-৳):</div>
              <input
                type="number"
                min="0"
                value={tradeInDiscount || ''}
                onChange={e => setTradeInDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-1 text-xs font-mono font-bold text-right border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          {/* VAT Toggle & Grand Total */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={e => setIncludeVat(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>ভ্যাট ({settings.vatPercent}%)</span>
            </label>
            {includeVat && <span className="font-mono text-slate-700">+{formatCurrency(vatAmount)}</span>}
          </div>

          {/* NET PAYABLE AMOUNT */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-black text-slate-900 text-sm">সর্বমোট প্রদেয় (Net Payable):</span>
            <span className="font-black font-mono text-indigo-700 text-lg sm:text-xl">
              {formatCurrency(netPayableTotal)}
            </span>
          </div>
        </div>

        {/* 5-MODE CHECKOUT TAB SELECTOR */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>পেমেন্ট ও বিক্রয়ের ধরন:</span>
            <span className="text-indigo-600 font-mono font-bold text-[10px]">
              {saleMode === 'cash' && 'নগদ ক্যাশ'}
              {saleMode === 'due' && 'বাকি / খতিয়ান'}
              {saleMode === 'installment' && 'কিস্তি / ইএমআই'}
              {saleMode === 'digital' && 'ডিজিটাল ব্যাংকিং'}
              {saleMode === 'split' && 'মিশ্র পেমেন্ট'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
            {[
              { id: 'cash', label: 'নগদ', icon: Banknote, color: 'text-emerald-600' },
              { id: 'due', label: 'বাকি', icon: AlertCircle, color: 'text-amber-600' },
              { id: 'installment', label: 'কিস্তি', icon: Smartphone, color: 'text-indigo-600' },
              { id: 'digital', label: 'ডিজিটাল', icon: CreditCard, color: 'text-blue-600' },
              { id: 'split', label: 'স্প্লিট', icon: Layers, color: 'text-purple-600' }
            ].map(m => {
              const active = saleMode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSaleMode(m.id as any);
                    setValidationError(null);
                  }}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                    active 
                      ? 'bg-white border-2 border-indigo-600 text-indigo-900 shadow-sm font-black' 
                      : 'bg-slate-200/60 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : m.color}`} />
                  <span className="text-[10px] leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODE DETAILS & CUSTOMER INPUTS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
          
          {/* Customer Input Section */}
          <div className={`p-2.5 rounded-xl border space-y-2 text-xs transition ${
            saleMode === 'due' || saleMode === 'installment'
              ? 'bg-amber-50/50 border-amber-300'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>ক্রেতার তথ্য (Customer Info)</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Select Existing Customer Profile */}
                <button
                  type="button"
                  onClick={() => setShowCustomerPickerModal(true)}
                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  <span>খুঁজুন / নির্বাচন</span>
                </button>

                {saleMode === 'due' || saleMode === 'installment' ? (
                  <span className="text-[10px] font-bold text-rose-600">* আবশ্যক</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerName('');
                      setCustomerPhone('');
                      setSelectedProfile(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-normal"
                  >
                    Walk-in
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="ক্রেতার নাম..."
                className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 ${
                  (saleMode === 'due' || saleMode === 'installment') && !customerName.trim()
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-300'
                }`}
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={e => handleCustomerPhoneChange(e.target.value)}
                placeholder="মোবাইল নম্বর..."
                className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 ${
                  (saleMode === 'due' || saleMode === 'installment') && !customerPhone.trim()
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-300'
                }`}
              />
            </div>

            {(saleMode === 'due' || saleMode === 'installment') && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="ঠিকানা (গ্রাম / থানা)..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={customerNid}
                  onChange={e => setCustomerNid(e.target.value)}
                  placeholder="জাতীয় পরিচয়পত্র (NID)..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Existing Due Warning Alert */}
            {(() => {
              if (!customerPhone.trim()) return null;
              const customerSalesDues = sales.filter(s => s.customerPhone === customerPhone.trim()).reduce((sum, s) => sum + (s.dueAmount || 0), 0);
              const customerInstDues = installments.filter(i => i.customerPhone === customerPhone.trim() && i.status !== 'completed').reduce((sum, i) => sum + (i.remainingBalance || 0), 0);
              const totalExistingDue = customerSalesDues + customerInstDues;
              if (totalExistingDue <= 0) return null;

              return (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-center justify-between">
                  <span>পূর্বের বকেয়া রয়েছে:</span>
                  <span className="font-mono font-bold text-rose-600">{formatCurrency(totalExistingDue)}</span>
                </div>
              );
            })()}
          </div>

          {/* 1. CASH SALE SECTION */}
          {saleMode === 'cash' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>গ্রহণকৃত নগদ টাকা (Cash Received):</span>
                <span className="font-mono text-emerald-700">প্রদেয়: {formatCurrency(netPayableTotal)}</span>
              </div>

              {/* Quick Cash Tender Notes */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Exact', amt: netPayableTotal },
                  { label: '৳৫০০', amt: 500 },
                  { label: '৳১,০০০', amt: 1000 },
                  { label: '৳২,০০০', amt: 2000 },
                  { label: '৳৫,০০০', amt: 5000 },
                  { label: '৳১০,০০০', amt: 10000 },
                  { label: '৳২০,০০০', amt: 20000 },
                  { label: '৳৫০,০০০', amt: 50000 }
                ].map((note, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReceivedCashInput(note.amt.toString())}
                    className="py-1 px-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-800 transition"
                  >
                    {note.label}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="0"
                value={receivedCashInput}
                onChange={e => setReceivedCashInput(e.target.value)}
                placeholder="গ্রহণকৃত নগদ টাকা..."
                className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl font-mono text-base font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500"
              />

              {/* Change calculation */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>ফেরত টাকা (Change Due):</span>
                <span className="text-lg font-black font-mono text-emerald-700">
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* 2. DUE / CREDIT SALE SECTION */}
          {saleMode === 'due' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">তাত্ক্ষণিক অগ্রিম পরিশোধ (Down):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={duePartialPaid}
                      onChange={e => setDuePartialPaid(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1 bg-white border border-amber-300 rounded text-right font-mono font-bold"
                    />
                    <span className="font-bold">৳</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200">
                  <span className="font-bold text-amber-900">খতিয়ানে বকেয়া থাকবে:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    {formatCurrency(Math.max(0, netPayableTotal - (parseFloat(duePartialPaid) || 0)))}
                  </span>
                </div>
              </div>

              {/* Due Repayment Promise Deadline */}
              <div className="space-y-1 text-xs">
                <label className="block text-[11px] font-bold text-slate-700">বাকি পরিশোধের প্রতিশ্রুত তারিখ:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '৭ দিন', days: 7 },
                    { label: '১৫ দিন', days: 15 },
                    { label: '৩০ দিন', days: 30 },
                    { label: '৪৫ দিন', days: 45 }
                  ].map(item => {
                    const d = new Date();
                    d.setDate(d.getDate() + item.days);
                    const dStr = d.toISOString().split('T')[0];
                    const isSelected = dueDeadline === dStr;
                    return (
                      <button
                        key={item.days}
                        type="button"
                        onClick={() => setDueDeadline(dStr)}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition ${
                          isSelected ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="date"
                  value={dueDeadline}
                  onChange={e => setDueDeadline(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              {/* Guarantor toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowGuarantor(!showGuarantor)}
                  className="text-[11px] font-bold text-amber-800 hover:underline"
                >
                  {showGuarantor ? '▼ জামিনদারের তথ্য বন্ধ করুন' : '+ জামিনদার / রেফারেন্স যোগ করুন'}
                </button>
                {showGuarantor && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-amber-50/50 rounded-lg border border-amber-200">
                    <input
                      type="text"
                      value={guarantorName}
                      onChange={e => setGuarantorName(e.target.value)}
                      placeholder="জামিনদারের নাম..."
                      className="px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                    />
                    <input
                      type="tel"
                      value={guarantorPhone}
                      onChange={e => setGuarantorPhone(e.target.value)}
                      placeholder="জামিনদারের ফোন..."
                      className="px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. INSTALLMENT (EMI) SALE SECTION */}
          {saleMode === 'installment' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2.5 text-xs">
                
                {/* Down Payment */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">ডাউন পেমেন্ট (অগ্রিম জমা):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={downPaymentInput}
                      onChange={e => setDownPaymentInput(e.target.value)}
                      placeholder="0"
                      className="w-28 px-2 py-1 bg-white border border-indigo-300 rounded-lg font-mono font-bold text-right text-indigo-900"
                    />
                    <span className="font-bold">৳</span>
                  </div>
                </div>

                {/* Quick Down Payment Percentages */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                  {[10, 20, 30, 50].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentInput(Math.round((netPayableTotal * pct) / 100).toString())}
                      className="py-0.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-bold"
                    >
                      {pct}% ({Math.round((netPayableTotal * pct) / 100)})
                    </button>
                  ))}
                </div>

                {/* Tenure Selector */}
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">কিস্তির মেয়াদ (মাস):</div>
                  <div className="grid grid-cols-6 gap-1">
                    {[3, 6, 9, 12, 18, 24].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInstallmentMonths(m)}
                        className={`py-1 rounded-lg font-mono font-bold text-xs border transition ${
                          installmentMonths === m 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Interest / Profit Markup */}
                <div className="flex items-center justify-between pt-1 border-t border-indigo-200/80">
                  <span className="text-[11px] text-indigo-900 font-medium">মুনাফা / অতিরিক্ত চার্জ (%):</span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setInterestMarkupPercent(rate)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          interestMarkupPercent === rate 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly EMI calculation */}
                <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-600 block text-[10px]">প্রতি মাসের কিস্তি:</span>
                    <span className="font-black text-indigo-950 font-mono text-sm sm:text-base">
                      {formatCurrency(emiBreakdown.perMonth)} / মাস
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 block text-[10px]">মোট বাকি ব্যালেন্স:</span>
                    <span className="font-mono font-bold text-rose-600">{formatCurrency(emiBreakdown.totalFinanced)}</span>
                  </div>
                </div>

                {/* Auto Device Locker MDM Protection Toggle */}
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enrollInLocker}
                    onChange={e => setEnrollInLocker(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>রিমোট লকার ও অ্যান্টি-থেফট প্রটেকশন সক্রিয় করুন</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">কিস্তি খেলাপী হলে হ্যান্ডসেট লক করা সম্ভব হবে</span>
                  </div>
                </label>

                {/* Guarantor Details Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGuarantor(!showGuarantor)}
                    className="text-[11px] text-indigo-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{showGuarantor ? '▼ জামিনদারের তথ্য বন্ধ করুন' : '▶ জামিনদার / গ্যারান্টারের তথ্য যোগ করুন'}</span>
                  </button>

                  {showGuarantor && (
                    <div className="mt-2 space-y-2 pt-2 border-t border-indigo-200">
                      <div className="text-[10px] font-bold text-slate-600 uppercase">জামিনদার ০১:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={guarantorName}
                          onChange={e => setGuarantorName(e.target.value)}
                          placeholder="নাম..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs"
                        />
                        <input
                          type="tel"
                          value={guarantorPhone}
                          onChange={e => setGuarantorPhone(e.target.value)}
                          placeholder="মোবাইল নম্বর..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={guarantorNid}
                          onChange={e => setGuarantorNid(e.target.value)}
                          placeholder="NID..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={guarantorRelation}
                          onChange={e => setGuarantorRelation(e.target.value)}
                          placeholder="সম্পর্ক (ভাই / পিতা)..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs"
                        />
                      </div>

                      <div className="text-[10px] font-bold text-slate-600 uppercase pt-1">জামিনদার ০২ (ঐচ্ছিক):</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={guarantor2Name}
                          onChange={e => setGuarantor2Name(e.target.value)}
                          placeholder="নাম..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs"
                        />
                        <input
                          type="tel"
                          value={guarantor2Phone}
                          onChange={e => setGuarantor2Phone(e.target.value)}
                          placeholder="মোবাইল..."
                          className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 4. DIGITAL / MOBILE BANKING */}
          {saleMode === 'digital' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'bkash', label: 'বিকাশ' },
                  { id: 'nagad', label: 'নগদ' },
                  { id: 'rocket', label: 'রকেট' },
                  { id: 'card', label: 'কার্ড' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDigitalMethod(opt.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      digitalMethod === opt.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={digitalTrxId}
                onChange={e => setDigitalTrxId(e.target.value)}
                placeholder="ট্রানজেকশন আইডি (TrxID / Approval Code)..."
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-xl font-mono text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 5. SPLIT PAYMENT */}
          {saleMode === 'split' && (
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span>নগদ (Cash):</span>
                  <input
                    type="number"
                    min="0"
                    value={splitCash}
                    onChange={e => setSplitCash(e.target.value)}
                    className="w-28 px-2 py-1 bg-white border border-purple-300 rounded text-right font-mono font-bold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>বিকাশ / কার্ড:</span>
                  <input
                    type="number"
                    min="0"
                    value={splitDigital}
                    onChange={e => setSplitDigital(e.target.value)}
                    className="w-28 px-2 py-1 bg-white border border-purple-300 rounded text-right font-mono font-bold"
                  />
                </div>
                <div className="pt-2 border-t border-purple-200 flex items-center justify-between font-bold">
                  <span>বাকি থাকবে (Remaining Due):</span>
                  <span className="font-mono text-rose-600">
                    {formatCurrency(Math.max(0, netPayableTotal - (parseFloat(splitCash) || 0) - (parseFloat(splitDigital) || 0)))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Note Input */}
          <input
            type="text"
            value={checkoutNote}
            onChange={e => setCheckoutNote(e.target.value)}
            placeholder="বিশেষ নোট বা ইনভয়েস মন্তব্য (ঐচ্ছিক)..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />

        </div>

        {/* MASTER CHECKOUT BUTTON & IN-PANEL ERROR DISPLAY */}
        <div className="p-3 pb-6 sm:pb-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-200 shrink-0 space-y-2">
          
          {/* Real-time In-Drawer Error Display directly on top of action button */}
          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-rose-700 animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
              <button 
                onClick={() => setValidationError(null)} 
                className="text-rose-500 hover:text-rose-700 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleExecuteCheckout}
            disabled={isSubmitting || cart.length === 0}
            className={`w-full py-3.5 text-white rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
              saleMode === 'cash' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' 
                : saleMode === 'due'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
                : saleMode === 'installment'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20'
                : saleMode === 'digital'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isSubmitting 
                ? 'প্রক্রিয়াধীন...' 
                : saleMode === 'cash' 
                ? 'নগদ বিক্রয় সম্পন্ন ও ইনভয়েস প্রিন্ট (F4)' 
                : saleMode === 'due'
                ? 'বাকি বিক্রয় সংরক্ষণ ও ইনভয়েস তৈরি'
                : saleMode === 'installment'
                ? 'কিস্তি চুক্তি ও সেল কনফার্ম করুন'
                : saleMode === 'digital'
                ? 'ডিজিটাল সেল সম্পন্ন করুন'
                : 'স্প্লিট পেমেন্ট বিক্রয় কনফার্ম'}
            </span>
          </button>
        </div>

      </div>

      {/* Barcode Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          setBarcodeInput(code);
          processBarcodeCode(code);
          setIsScannerOpen(false);
        }}
      />

      {/* Customer Picker Modal */}
      {showCustomerPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">বিদ্যমান কাস্টমার নির্বাচন</h3>
              <button onClick={() => setShowCustomerPickerModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {customerProfiles.map(p => (
                <div
                  key={p.phone}
                  onClick={() => handleSelectCustomer(p)}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.phone}</div>
                    {p.address && <div className="text-[10px] text-slate-400 truncate">{p.address}</div>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}

              {customerProfiles.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  কোনো সংরক্ষিত কাস্টমার প্রোফাইল নেই।
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomerPickerModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Serial / IMEI Picker Modal */}
      {activeSerialModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">IMEI বা সিরিয়াল নম্বর নির্বাচন</h4>
                <p className="text-xs text-slate-500 truncate">{activeSerialModalProduct.product.name}</p>
              </div>
              <button onClick={() => setActiveSerialModalProduct(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="text-xs text-slate-600">
              প্রয়োজনীয় পরিমাণ: <strong className="font-mono text-indigo-700">{activeSerialModalProduct.quantity} টি</strong>
            </div>

            {/* Stock serials */}
            {activeSerialModalProduct.product.serialNumbers && activeSerialModalProduct.product.serialNumbers.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeSerialModalProduct.product.serialNumbers.map(sn => {
                  const isSelected = tempSerials.includes(sn);
                  return (
                    <div
                      key={sn}
                      onClick={() => handleToggleSerial(sn)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sn}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">স্টকে কোনো প্রিসেট সিরিয়াল নেই। নিচে কাস্টম IMEI লিখুন:</p>
            )}

            {/* Custom serial input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customSerialInput}
                onChange={e => setCustomSerialInput(e.target.value)}
                placeholder="নতুন IMEI / Serial লিখুন..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomSerial}
                className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-700"
              >
                যুক্ত
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSerialModalProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveSerials}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parked Carts Manager Modal */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">হোল্ড / পার্ক করা বিল তালিকা</h3>
              </div>
              <button onClick={() => setShowParkedModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {parkedCarts.map(p => (
                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{p.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      সময়: {p.time} • মোট {p.cart.length} টি পণ্য
                    </div>
                    <div className="font-bold font-mono text-indigo-700 text-xs mt-1">
                      {formatCurrency(p.total)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        restoreParkedCart(p.id);
                        setShowParkedModal(false);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      রিস্টোর
                    </button>
                    <button
                      onClick={() => deleteParkedCart(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {parkedCarts.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  কোনো হোল্ড বা পার্ক করা বিল নেই।
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowParkedModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Item Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">+ কাস্টম পণ্য বা সার্ভিস যোগ করুন</h3>
              <button onClick={() => setShowCustomItemModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">পণ্যের নাম / সেবার বিবরণ:</label>
                <input
                  type="text"
                  value={customItemName}
                  onChange={e => setCustomItemName(e.target.value)}
                  placeholder="যেমন: মোবাইল গ্লাস প্রটেক্টর / সার্ভিসিং ফি..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">বিক্রয় মূল্য (৳):</label>
                <input
                  type="number"
                  min="0"
                  value={customItemPrice}
                  onChange={e => setCustomItemPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ক্যাটাগরি:</label>
                <select
                  value={customItemCategory}
                  onChange={e => setCustomItemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="এক্সেসরিজ">এক্সেসরিজ</option>
                  <option value="সার্ভিসিং ও মেরামত">সার্ভিসিং ও মেরামত</option>
                  <option value="স্মার্টফোন ও গ্যাজেট">স্মার্টফোন ও গ্যাজেট</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                কার্টে যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
