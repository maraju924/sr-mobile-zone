import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Settings, 
  Tag, 
  Sliders, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Sparkles,
  QrCode,
  Search,
  CheckSquare,
  Square,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeGenerator, BarcodeFormat } from './BarcodeGenerator';

// Supported Printer & Paper Presets
export interface LabelPreset {
  id: string;
  category: 'thermal' | 'sheet' | 'custom';
  name: string;
  nameBn: string;
  widthMm: number;
  heightMm: number;
  columns: number;
  gapMm: number;
  isThermalRoll: boolean;
  description: string;
}

export const LABEL_PRESETS: LabelPreset[] = [
  // --- Thermal Barcode Roll Printers (Xprinter, Rongta, TSC, Zebra, Gprinter etc.) ---
  {
    id: 'thermal-38x25-1up',
    category: 'thermal',
    name: '38mm × 25mm (1.5" × 1") - Single Roll',
    nameBn: '৩৮×২৫ মিমি (১ কলাম থার্মাল রোল) [মোবাইল ও এক্সেসরিজ]',
    widthMm: 38,
    heightMm: 25,
    columns: 1,
    gapMm: 2,
    isThermalRoll: true,
    description: 'Xprinter/TSC থার্মাল প্রিন্টারের সবচেয়ে জনপ্রিয় মোবাইল ও ছোট পণ্য সাইজ'
  },
  {
    id: 'thermal-40x30-1up',
    category: 'thermal',
    name: '40mm × 30mm - Single Roll',
    nameBn: '৪০×৩০ মিমি (১ কলাম রোল) [স্ট্যান্ডার্ড ইলেকট্রনিক্স]',
    widthMm: 40,
    heightMm: 30,
    columns: 1,
    gapMm: 2,
    isThermalRoll: true,
    description: 'স্ট্যান্ডার্ড গ্যাজেটস ও কিউআর কোড লেবেল'
  },
  {
    id: 'thermal-50x25-1up',
    category: 'thermal',
    name: '50mm × 25mm (2" × 1") - Single Roll',
    nameBn: '৫০×২৫ মিমি (২" × ১" রোল) [রিটেইল বারকোড সাইজ]',
    widthMm: 50,
    heightMm: 25,
    columns: 1,
    gapMm: 2,
    isThermalRoll: true,
    description: 'রিটেইল শপ ও সুপারশপ উপযোগী চওড়া বারকোড লেবেল'
  },
  {
    id: 'thermal-50x30-1up',
    category: 'thermal',
    name: '50mm × 30mm - Single Roll',
    nameBn: '৫০×৩০ মিমি (১ কলাম রোল) [বিস্তারিত বিবরণী সাইজ]',
    widthMm: 50,
    heightMm: 30,
    columns: 1,
    gapMm: 2,
    isThermalRoll: true,
    description: 'দোকানের নাম, দাম, মডেল ও ওয়ারেন্টি সুন্দরভাবে আঁটার সাইজ'
  },
  {
    id: 'thermal-75x50-1up',
    category: 'thermal',
    name: '75mm × 50mm (3" × 2") - Single Roll',
    nameBn: '৭৫×৫০ মিমি (৩" × ২" রোল) [বড় বক্স ও অ্যাপ্লায়েন্স]',
    widthMm: 75,
    heightMm: 50,
    columns: 1,
    gapMm: 3,
    isThermalRoll: true,
    description: 'ব্লেন্ডার, রাইস কুকার, রাউটার ও বড় বক্স আইটেম'
  },
  {
    id: 'thermal-100x50-1up',
    category: 'thermal',
    name: '100mm × 50mm (4" × 2") - Shipping / Carton',
    nameBn: '১০০×৫০ মিমি (৪" × ২" বড় রোল) [টিভি, ফ্রিজ ও কার্টন]',
    widthMm: 100,
    heightMm: 50,
    columns: 1,
    gapMm: 3,
    isThermalRoll: true,
    description: 'হোম অ্যাপ্লায়েন্স কার্টন ও বড় শিপিং লেবেল'
  },
  {
    id: 'thermal-38x25-2up',
    category: 'thermal',
    name: '38mm × 25mm - 2 Column Roll (80mm width)',
    nameBn: '৩৮×২৫ মিমি (২ কলাম ডাবল রোল - ৮০ মিমি প্রস্থ)',
    widthMm: 38,
    heightMm: 25,
    columns: 2,
    gapMm: 2,
    isThermalRoll: true,
    description: 'পাশাপাশি ২টি করে স্টিকার বিশিষ্ট থার্মাল রোল'
  },

  // --- Office Flatbed A4 / Letter Sticker Sheets (HP, Canon, Epson etc.) ---
  {
    id: 'sheet-a4-24up',
    category: 'sheet',
    name: 'A4 - 24 Labels (3 × 8) 70mm × 37mm',
    nameBn: 'A4 পেপার - ২৪ লেবেল (৩ × ৮) [সবচেয়ে বহুল বিক্রিত]',
    widthMm: 70,
    heightMm: 37,
    columns: 3,
    gapMm: 1.5,
    isThermalRoll: false,
    description: 'স্ট্যান্ডার্ড এ৪ স্টিকার শিট পেপারের জন্য আদর্শ'
  },
  {
    id: 'sheet-a4-65up',
    category: 'sheet',
    name: 'A4 - 65 Labels (5 × 13) 38.1mm × 21.2mm',
    nameBn: 'A4 পেপার - ৬৫ লেবেল (৫ × ১৩) [ক্ষুদ্র এক্সেসরিজ]',
    widthMm: 38.1,
    heightMm: 21.2,
    columns: 5,
    gapMm: 1,
    isThermalRoll: false,
    description: 'কেবল, অ্যাডাপ্টার, মেমোরি কার্ড ও ছোট পার্টস'
  },
  {
    id: 'sheet-a4-40up',
    category: 'sheet',
    name: 'A4 - 40 Labels (4 × 10) 48.5mm × 25.4mm',
    nameBn: 'A4 পেপার - ৪০ লেবেল (৪ × ১০)',
    widthMm: 48.5,
    heightMm: 25.4,
    columns: 4,
    gapMm: 1.5,
    isThermalRoll: false,
    description: 'মাঝারি সাইজের এ৪ স্টিকার পেপার'
  },
  {
    id: 'sheet-a4-21up',
    category: 'sheet',
    name: 'A4 - 21 Labels (3 × 7) 70mm × 42.4mm',
    nameBn: 'A4 পেপার - ২১ লেবেল (৩ × ৭)',
    widthMm: 70,
    heightMm: 42.4,
    columns: 3,
    gapMm: 1.5,
    isThermalRoll: false,
    description: 'উঁচু সাইজের ৩ কলাম এ৪ লেবেল'
  },
  {
    id: 'sheet-a4-14up',
    category: 'sheet',
    name: 'A4 - 14 Labels (2 × 7) 105mm × 42.4mm',
    nameBn: 'A4 পেপার - ১৪ লেবেল (২ × ৭) [প্রশস্ত স্টিকার]',
    widthMm: 105,
    heightMm: 42.4,
    columns: 2,
    gapMm: 2,
    isThermalRoll: false,
    description: 'বড় ও প্রশস্ত ২ কলাম এ৪ শিট'
  }
];

interface BatchPrintItem {
  product: Product;
  count: number;
}

interface BarcodeSheetModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  allProducts?: Product[];
  initialBatch?: BatchPrintItem[];
}

export const BarcodeSheetModal: React.FC<BarcodeSheetModalProps> = ({
  product,
  isOpen,
  onClose,
  allProducts = [],
  initialBatch
}) => {
  const { settings, products: contextProducts, formatCurrency, t } = useApp();
  const availableProducts = allProducts.length > 0 ? allProducts : contextProducts;

  // Active Preset & Custom Dimension
  const [selectedPresetId, setSelectedPresetId] = useState<string>('thermal-38x25-1up');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(50);
  const [customHeight, setCustomHeight] = useState<number>(30);
  const [customColumns, setCustomColumns] = useState<number>(1);
  const [customGap, setCustomGap] = useState<number>(2);

  // Active Batch Print Queue
  const [batchQueue, setBatchQueue] = useState<BatchPrintItem[]>([]);
  const [isBatchSearchOpen, setIsBatchSearchOpen] = useState<boolean>(false);
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');

  // Design & Element Customization Toggles
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [customStoreTitle, setCustomStoreTitle] = useState<string>('');
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [productNameFontSize, setProductNameFontSize] = useState<'xs' | 'sm' | 'md'>('sm');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [pricePrefix, setPricePrefix] = useState<'bdt' | 'mrp' | 'none'>('mrp');
  const [showWarranty, setShowWarranty] = useState<boolean>(true);
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true);
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [barcodeHeight, setBarcodeHeight] = useState<number>(34); // px
  const [barcodeBarWidth, setBarcodeBarWidth] = useState<number>(1.4);
  const [showSecretCostCode, setShowSecretCostCode] = useState<boolean>(false);
  const [secretCodePrefix, setSecretCodePrefix] = useState<string>('C-');
  const [showCutGuide, setShowCutGuide] = useState<boolean>(true);
  const [monochromeCrisp, setMonochromeCrisp] = useState<boolean>(true);

  // Preview Zoom & Active Tab
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'presets' | 'products' | 'design' | 'printer'>('presets');

  // Initialize batch queue when single product or initialBatch is provided
  useEffect(() => {
    if (initialBatch && initialBatch.length > 0) {
      setBatchQueue(initialBatch);
    } else if (product) {
      setBatchQueue([{ product, count: 6 }]);
    } else if (availableProducts.length > 0 && batchQueue.length === 0) {
      setBatchQueue([{ product: availableProducts[0], count: 6 }]);
    }
  }, [product, initialBatch, availableProducts]);

  const activePreset = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'custom',
        category: 'custom' as const,
        name: `Custom (${customWidth}mm × ${customHeight}mm)`,
        nameBn: `কাস্টম সাইজ (${customWidth}×${customHeight} মিমি)`,
        widthMm: customWidth,
        heightMm: customHeight,
        columns: customColumns,
        gapMm: customGap,
        isThermalRoll: customColumns === 1,
        description: 'ব্যবহারকারী নির্ধারিত নিজস্ব লেবেল সাইজ'
      };
    }
    return LABEL_PRESETS.find(p => p.id === selectedPresetId) || LABEL_PRESETS[0];
  }, [selectedPresetId, isCustomMode, customWidth, customHeight, customColumns, customGap]);

  // Total label count across all items in batch queue
  const totalStickersToPrint = useMemo(() => {
    return batchQueue.reduce((sum, item) => sum + Math.max(1, item.count), 0);
  }, [batchQueue]);

  // Flattened stickers list for rendering
  const flattenedStickers = useMemo(() => {
    const list: Product[] = [];
    batchQueue.forEach(item => {
      for (let i = 0; i < Math.max(1, item.count); i++) {
        list.push(item.product);
      }
    });
    return list;
  }, [batchQueue]);

  if (!isOpen) return null;

  // Add a product to batch queue
  const handleAddToBatch = (p: Product) => {
    setBatchQueue(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) {
        return prev.map(item => item.product.id === p.id ? { ...item, count: item.count + 4 } : item);
      }
      return [...prev, { product: p, count: 4 }];
    });
  };

  // Remove a product from batch queue
  const handleRemoveFromBatch = (productId: string) => {
    setBatchQueue(prev => prev.filter(item => item.product.id !== productId));
  };

  // Update count for a product
  const handleUpdateCount = (productId: string, count: number) => {
    setBatchQueue(prev => prev.map(item => item.product.id === productId ? { ...item, count: Math.max(1, count) } : item));
  };

  // Fill batch with current stock quantities
  const handleFillStockCounts = () => {
    setBatchQueue(prev => prev.map(item => ({
      ...item,
      count: Math.max(1, item.product.stock)
    })));
  };

  // Quick Preset Selector
  const handleSelectPreset = (presetId: string) => {
    setIsCustomMode(false);
    setSelectedPresetId(presetId);
    
    // Auto-tune barcode height/density for small presets
    const p = LABEL_PRESETS.find(pr => pr.id === presetId);
    if (p) {
      if (p.heightMm <= 25) {
        setBarcodeHeight(26);
        setBarcodeBarWidth(1.2);
      } else if (p.heightMm <= 35) {
        setBarcodeHeight(34);
        setBarcodeBarWidth(1.4);
      } else {
        setBarcodeHeight(45);
        setBarcodeBarWidth(1.7);
      }
    }
  };

  // Direct Print Execution using isolated print iframe with fallback
  const handlePrint = (singleTest: boolean = false) => {
    try {
      // 1. Target the live preview grid where all barcodes and labels are already rendered
      const liveGrid = document.getElementById('barcode-live-render-grid');
      if (!liveGrid) {
        window.print();
        return;
      }

      // 2. Clone the live rendered stickers to capture all SVG and DOM elements
      const clonedGrid = liveGrid.cloneNode(true) as HTMLElement;

      // Handle any QR code canvas elements by converting them to data URL images
      const originalCanvases = liveGrid.querySelectorAll('canvas');
      const clonedCanvases = clonedGrid.querySelectorAll('canvas');
      originalCanvases.forEach((orig, idx) => {
        const cloned = clonedCanvases[idx];
        if (cloned) {
          try {
            const img = document.createElement('img');
            img.src = orig.toDataURL('image/png');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            cloned.parentNode?.replaceChild(img, cloned);
          } catch (e) {
            console.warn('Canvas conversion note:', e);
          }
        }
      });

      // 3. Determine exact page and layout specifications
      const isThermal = activePreset.isThermalRoll;
      const isSingleRoll = isThermal && activePreset.columns === 1;

      const pageWidth = isSingleRoll
        ? `${activePreset.widthMm}mm`
        : isThermal
        ? `${activePreset.widthMm * activePreset.columns + (activePreset.gapMm * (activePreset.columns - 1))}mm`
        : '210mm';

      const pageHeight = isThermal
        ? `${activePreset.heightMm}mm`
        : '297mm';

      const pageMargin = isThermal ? '0mm' : '4mm';

      // 4. Create or reuse isolated printing iframe
      const iframeId = 'barcode-studio-print-frame';
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.setAttribute('style', 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;z-index:-9999;');
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (!frameDoc) {
        window.print();
        return;
      }

      // Collect styles from main page head to preserve fonts and classes
      const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(el => el.outerHTML)
        .join('\n');

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${settings.storeName} - ${activePreset.nameBn || activePreset.name}</title>
            ${headStyles}
            <style>
              @page {
                size: ${pageWidth} ${pageHeight};
                margin: ${pageMargin};
              }
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-grid-container {
                display: grid !important;
                grid-template-columns: repeat(${activePreset.columns}, ${activePreset.widthMm}mm) !important;
                gap: ${activePreset.gapMm}mm !important;
                justify-content: ${activePreset.columns === 1 ? 'center' : 'start'} !important;
                align-content: start !important;
                width: 100% !important;
                margin: 0 auto !important;
                padding: 0 !important;
              }
              .barcode-sticker-cell {
                width: ${activePreset.widthMm}mm !important;
                height: ${activePreset.heightMm}mm !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: space-between !important;
                text-align: center !important;
                overflow: hidden !important;
                background: #ffffff !important;
                color: #000000 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                ${isSingleRoll ? 'page-break-after: always !important; break-after: page !important;' : ''}
                border: ${showCutGuide ? '0.5px dashed #666666' : '0.5px solid transparent'} !important;
                padding: ${activePreset.heightMm <= 25 ? '1mm 0.8mm' : '1.5mm 1mm'} !important;
              }
              svg {
                display: block !important;
                margin: 0 auto !important;
                max-width: 100% !important;
                height: auto !important;
              }
              img {
                display: block !important;
                margin: 0 auto !important;
                max-width: 100% !important;
                height: auto !important;
              }
              /* Fail-safe typography & layout classes */
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              .items-center { align-items: center !important; }
              .justify-between { justify-content: space-between !important; }
              .justify-center { justify-content: center !important; }
              .text-center { text-align: center !important; }
              .text-left { text-align: left !important; }
              .text-right { text-align: right !important; }
              .w-full { width: 100% !important; }
              .shrink-0 { flex-shrink: 0 !important; }
              .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
              .font-bold { font-weight: 700 !important; }
              .font-black { font-weight: 900 !important; }
              .font-mono { font-family: monospace, monospace !important; }
              .uppercase { text-transform: uppercase !important; }
              .border-t { border-top: 0.5px solid #000000 !important; }
              .leading-tight { line-height: 1.15 !important; }
              .overflow-hidden { overflow: hidden !important; }
            </style>
          </head>
          <body>
            <div class="print-grid-container">
              ${clonedGrid.innerHTML}
            </div>
          </body>
        </html>
      `;

      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print error, falling back to window.print', e);
          window.print();
        }
      }, 250);
    } catch (err) {
      console.error('Label print preparation error:', err);
      window.print();
    }
  };

  // Secret cost code generator (e.g., purchase price 1200 -> C-1200 or custom cipher)
  const getSecretCode = (purchasePrice: number) => {
    return `${secretCodePrefix}${Math.round(purchasePrice)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="barcode-modal-root fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in">
      
      {/* Dynamic Print CSS for Thermal and A4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${activePreset.isThermalRoll && activePreset.columns === 1 
              ? `${activePreset.widthMm}mm ${activePreset.heightMm}mm` 
              : activePreset.isThermalRoll 
              ? `${activePreset.widthMm * activePreset.columns + (activePreset.gapMm * (activePreset.columns - 1))}mm ${activePreset.heightMm}mm`
              : 'A4 portrait'};
            margin: ${activePreset.isThermalRoll ? '0mm' : '4mm'};
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
            height: auto !important;
          }
          /* Reset modal container so it does not clip */
          .barcode-modal-root {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .barcode-modal-root > div {
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          /* Hide all app chrome during print */
          .print\\:hidden,
          .no-print {
            display: none !important;
          }
          #barcode-sheet-print-container {
            display: block !important;
            visibility: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          #barcode-sheet-print-container * {
            visibility: visible !important;
          }
          .barcode-sticker-cell {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            ${activePreset.isThermalRoll && activePreset.columns === 1 ? 'page-break-after: always !important; break-after: page !important;' : ''}
            border-color: ${showCutGuide ? '#666666' : 'transparent'} !important;
            box-shadow: none !important;
            visibility: visible !important;
          }
        }
      `}} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {t('ইউনিভার্সাল বারকোড স্টিকার প্রিন্ট স্টুডিও', 'Universal Barcode Label Studio')}
                </h3>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {activePreset.isThermalRoll ? 'Thermal Roll Ready' : 'A4 Sheet Ready'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                যেকোনো মডেলের থার্মাল প্রিন্টার (Xprinter, Rongta, TSC, Zebra) ও সাধারণ এ৪ স্টিকার পেপারে নিখুঁত প্রিন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handlePrint(false)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/40 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t('প্রিন্ট করুন', 'Print Labels')} ({totalStickersToPrint})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 print:hidden">
          
          {/* Left Controls Panel */}
          <div className="w-full md:w-[380px] lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
            
            {/* Control Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveSettingsTab('presets')}
                className={`flex-1 py-2.5 px-2 text-center transition border-b-2 flex items-center justify-center gap-1 ${
                  activeSettingsTab === 'presets'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>প্রিন্টার ও সাইজ</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('products')}
                className={`flex-1 py-2.5 px-2 text-center transition border-b-2 flex items-center justify-center gap-1 ${
                  activeSettingsTab === 'products'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>পণ্য ও কিউ ({batchQueue.length})</span>
              </button>

              <button
                onClick={() => setActiveSettingsTab('design')}
                className={`flex-1 py-2.5 px-2 text-center transition border-b-2 flex items-center justify-center gap-1 ${
                  activeSettingsTab === 'design'
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>লেবেল ডিজাইন</span>
              </button>
            </div>

            {/* Scrollable Settings Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* Tab 1: Presets & Paper Sizes */}
              {activeSettingsTab === 'presets' && (
                <div className="space-y-4">
                  {/* Category Filter Cards */}
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5">
                      ১. প্রিন্টার ও পেপারের ক্যাটাগরি:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsCustomMode(false);
                          setSelectedPresetId('thermal-38x25-1up');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          !isCustomMode && activePreset.isThermalRoll
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-bold block text-xs">থার্মাল বারকোড প্রিন্টার</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Xprinter, TSC, Rongta রোল</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsCustomMode(false);
                          setSelectedPresetId('sheet-a4-24up');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          !isCustomMode && !activePreset.isThermalRoll
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-bold block text-xs">অফিস A4 স্টিকার শিট</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">HP, Canon, Epson লেজার</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset List Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800">
                        ২. জনপ্রিয় মডেল ও পেপার প্রিসেট:
                      </span>
                      <button
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        {isCustomMode ? 'প্রিসেট তালিকা দেখুন' : '+ কাস্টম সাইজ দিন'}
                      </button>
                    </div>

                    {!isCustomMode ? (
                      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                        {LABEL_PRESETS.map((preset) => {
                          const isSelected = selectedPresetId === preset.id;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => handleSelectPreset(preset.id)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-2xs ring-1 ring-indigo-600'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{preset.nameBn}</span>
                                <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-semibold text-slate-600">
                                  {preset.widthMm}×{preset.heightMm}mm
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {preset.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Custom Dimension Box */
                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 space-y-3">
                        <span className="font-bold text-slate-800 block text-xs">
                          কাস্টম স্টিকার সাইজ নির্ধারণ করুন:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">প্রস্থ (Width in mm):</label>
                            <input
                              type="number"
                              min="20"
                              max="210"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(Math.max(20, parseFloat(e.target.value) || 20))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">উচ্চতা (Height in mm):</label>
                            <input
                              type="number"
                              min="15"
                              max="297"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(Math.max(15, parseFloat(e.target.value) || 15))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">কলাম সংখ্যা (Columns):</label>
                            <select
                              value={customColumns}
                              onChange={(e) => setCustomColumns(parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                            >
                              <option value={1}>১ কলাম (সিঙ্গেল রোল)</option>
                              <option value={2}>২ কলাম (ডাবল রোল)</option>
                              <option value={3}>৩ কলাম</option>
                              <option value={4}>৪ কলাম</option>
                              <option value={5}>৫ কলাম</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">গ্যাপ (Gap in mm):</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={customGap}
                              onChange={(e) => setCustomGap(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cut Guide Borders & Print Sharpness Toggle */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                      <span className="font-semibold">কাটিং গাইডলাইন (ড্যাশড বর্ডার):</span>
                      <input
                        type="checkbox"
                        checked={showCutGuide}
                        onChange={(e) => setShowCutGuide(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between text-slate-700 cursor-pointer border-t border-slate-200/60 pt-2">
                      <div>
                        <span className="font-semibold block">থার্মাল আল্ট্রা-শার্প মোড (100% Crisp)</span>
                        <span className="text-[10px] text-slate-500">203/300 DPI থার্মাল প্রিন্টারে পিওর ব্ল্যাক লাইন</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={monochromeCrisp}
                        onChange={(e) => setMonochromeCrisp(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Products & Multi-Item Batch Queue */}
              {activeSettingsTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        প্রিন্ট ব্যাচ কিউ ({batchQueue.length} টি পণ্য):
                      </span>
                      <span className="text-[11px] text-slate-500">
                        সর্বমোট স্টিকার: <strong className="text-indigo-700 font-mono">{totalStickersToPrint} টি</strong>
                      </span>
                    </div>

                    <button
                      onClick={handleFillStockCounts}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition"
                      title="ইনভেন্টরির বর্তমান স্টক অনুযায়ী স্টিকার সংখ্যা সেট করুন"
                    >
                      স্টক অনুযায়ী কোয়ান্টিটি
                    </button>
                  </div>

                  {/* Add Product Search Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setIsBatchSearchOpen(!isBatchSearchOpen)}
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-left flex items-center justify-between text-slate-700 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        আরেকটি পণ্য যুক্ত করুন...
                      </span>
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Search Dropdown */}
                    {isBatchSearchOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-56 overflow-y-auto">
                        <input
                          type="text"
                          value={batchSearchQuery}
                          onChange={(e) => setBatchSearchQuery(e.target.value)}
                          placeholder="পণ্য বা বারকোড খুঁজুন..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-2 focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <div className="space-y-1">
                          {availableProducts
                            .filter(p => {
                              const q = batchSearchQuery.toLowerCase().trim();
                              if (!q) return true;
                              return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
                            })
                            .slice(0, 15)
                            .map(p => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  handleAddToBatch(p);
                                  setIsBatchSearchOpen(false);
                                  setBatchSearchQuery('');
                                }}
                                className="p-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 line-clamp-1">{p.name}</span>
                                  <span className="font-mono text-[10px] text-slate-400">{p.barcode} • স্টক: {p.stock}</span>
                                </div>
                                <span className="font-mono font-bold text-indigo-700 text-xs">{formatCurrency(p.sellingPrice)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Batch Queue Item List */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {batchQueue.map((item) => (
                      <div 
                        key={item.product.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-xs truncate">
                            {item.product.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{item.product.barcode}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">{formatCurrency(item.product.sellingPrice)}</span>
                          </div>
                        </div>

                        {/* Count controller */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500">কপি:</span>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={item.count}
                            onChange={(e) => handleUpdateCount(item.product.id, parseInt(e.target.value) || 1)}
                            className="w-14 px-1.5 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-xs"
                          />
                          <button
                            onClick={() => handleRemoveFromBatch(item.product.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="তালিকা থেকে বাদ দিন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Fine-grained Label Design Controls */}
              {activeSettingsTab === 'design' && (
                <div className="space-y-4">
                  {/* Store Name Header */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <label className="flex items-center justify-between font-bold text-slate-800 cursor-pointer">
                      <span>দোকানের নাম (Store Header)</span>
                      <input
                        type="checkbox"
                        checked={showStoreName}
                        onChange={(e) => setShowStoreName(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4"
                      />
                    </label>

                    {showStoreName && (
                      <input
                        type="text"
                        value={customStoreTitle}
                        onChange={(e) => setCustomStoreTitle(e.target.value)}
                        placeholder={settings.storeName}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  {/* Product Title & Font Size */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showProductName}
                          onChange={(e) => setShowProductName(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4"
                        />
                        <span>পণ্যের নাম প্রদর্শন</span>
                      </label>

                      {showProductName && (
                        <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px]">
                          <button
                            onClick={() => setProductNameFontSize('xs')}
                            className={`px-1.5 py-0.5 rounded ${productNameFontSize === 'xs' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}
                          >
                            ছোট
                          </button>
                          <button
                            onClick={() => setProductNameFontSize('sm')}
                            className={`px-1.5 py-0.5 rounded ${productNameFontSize === 'sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}
                          >
                            মাঝারি
                          </button>
                          <button
                            onClick={() => setProductNameFontSize('md')}
                            className={`px-1.5 py-0.5 rounded ${productNameFontSize === 'md' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}
                          >
                            বড়
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barcode Symbology & Dimensions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                    <span className="font-bold text-slate-800 block text-xs">
                      বারকোড সিম্বোলজি ও সাইজ:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">বারকোড ফরম্যাট:</label>
                        <select
                          value={barcodeFormat}
                          onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          <option value="CODE128">Code 128 (স্ট্যান্ডার্ড)</option>
                          <option value="EAN13">EAN-13 (১৩ ডিজিট)</option>
                          <option value="UPC">UPC (১২ ডিজিট)</option>
                          <option value="CODE39">Code 39</option>
                          <option value="QR">2D QR Code (স্মার্টফোন)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">বারকোড উচ্চতা (Height):</label>
                        <select
                          value={barcodeHeight}
                          onChange={(e) => setBarcodeHeight(parseInt(e.target.value) || 30)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        >
                          <option value={22}>২২ পিক্সেল (কম্প্যাক্ট)</option>
                          <option value={28}>২৮ পিক্সেল (ছোট রোল)</option>
                          <option value={34}>৩৪ পিক্সেল (স্ট্যান্ডার্ড)</option>
                          <option value={42}>৪২ পিক্সেল (বড় সাইজ)</option>
                          <option value={52}>৫২ পিক্সেল (হাই-লেভেল)</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center justify-between text-slate-700 cursor-pointer pt-1 border-t border-slate-200/60">
                      <span>বারকোডের নিচে নাম্বার লেখা থাকবে</span>
                      <input
                        type="checkbox"
                        checked={showBarcodeText}
                        onChange={(e) => setShowBarcodeText(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4"
                      />
                    </label>
                  </div>

                  {/* Selling Price & Prefix */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPrice}
                          onChange={(e) => setShowPrice(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4"
                        />
                        <span>বিক্রয়মূল্য (Selling Price)</span>
                      </label>

                      {showPrice && (
                        <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[10px]">
                          <button
                            onClick={() => setPricePrefix('mrp')}
                            className={`px-1.5 py-0.5 rounded ${pricePrefix === 'mrp' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}
                          >
                            MRP: ৳
                          </button>
                          <button
                            onClick={() => setPricePrefix('bdt')}
                            className={`px-1.5 py-0.5 rounded ${pricePrefix === 'bdt' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'}`}
                          >
                            ৳ টাকা
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warranty & Secret Cost Code */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                      <span className="font-semibold">ওয়ারেন্টি ট্যাগ (যেমন: 12M War.)</span>
                      <input
                        type="checkbox"
                        checked={showWarranty}
                        onChange={(e) => setShowWarranty(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between text-slate-700 cursor-pointer border-t border-slate-200/60 pt-2">
                      <div>
                        <span className="font-semibold block">গোপন ক্রয়মূল্য কোড (Secret Cost Code)</span>
                        <span className="text-[10px] text-slate-500">মালিকের বোঝার জন্য কেনা দামের গোপন কোড</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showSecretCostCode}
                        onChange={(e) => setShowSecretCostCode(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4"
                      />
                    </label>

                    {showSecretCostCode && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-600">কোড প্রিফিক্স:</span>
                        <input
                          type="text"
                          value={secretCodePrefix}
                          onChange={(e) => setSecretCodePrefix(e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions for Left Panel */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-600">
                সাইজ: <strong className="font-mono text-slate-900">{activePreset.widthMm}×{activePreset.heightMm}mm</strong>
              </span>
              <button
                onClick={() => handlePrint(false)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Right Live Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-200/60">
            
            {/* Preview Toolbar */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  লাইভ প্রিন্ট প্রিভিউ:
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {flattenedStickers.length} টি স্টিকার তৈরি হয়েছে
                </span>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewZoom(prev => Math.max(50, prev - 25))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-700 w-12 text-center">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Label Preview Canvas */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
              <div 
                className="bg-white shadow-xl transition-transform origin-top p-4"
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  width: activePreset.isThermalRoll && activePreset.columns === 1 
                    ? `${activePreset.widthMm * 3.78 + 32}px` 
                    : activePreset.isThermalRoll 
                    ? `${(activePreset.widthMm * activePreset.columns + (activePreset.gapMm * (activePreset.columns - 1))) * 3.78 + 32}px` 
                    : '210mm',
                  minHeight: activePreset.isThermalRoll ? 'auto' : '297mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* Print Sheet Grid */}
                <div 
                  id="barcode-live-render-grid"
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${activePreset.columns}, minmax(0, 1fr))`,
                    gap: `${activePreset.gapMm}mm`
                  }}
                >
                  {flattenedStickers.map((p, index) => {
                    const storeHeader = customStoreTitle || settings.storeName;
                    
                    return (
                      <div
                        key={`${p.id}_${index}`}
                        className={`barcode-sticker-cell bg-white text-slate-900 flex flex-col items-center justify-between text-center overflow-hidden transition ${
                          showCutGuide ? 'border border-dashed border-slate-300' : 'border border-transparent'
                        } ${monochromeCrisp ? 'filter contrast-125' : ''}`}
                        style={{
                          width: `${activePreset.widthMm}mm`,
                          height: `${activePreset.heightMm}mm`,
                          padding: activePreset.heightMm <= 25 ? '1.5mm 1mm' : '2mm 1.5mm',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* 1. Store Header */}
                        {showStoreName && (
                          <div className="w-full truncate leading-tight shrink-0">
                            <span className="font-black text-slate-900 uppercase tracking-tighter" style={{ fontSize: activePreset.heightMm <= 25 ? '7.5px' : '9px' }}>
                              {storeHeader}
                            </span>
                          </div>
                        )}

                        {/* 2. Product Name */}
                        {showProductName && (
                          <div className="w-full truncate leading-tight px-0.5 shrink-0">
                            <span 
                              className={`font-bold text-slate-800 line-clamp-1 ${
                                productNameFontSize === 'xs' ? 'text-[8px]' : productNameFontSize === 'sm' ? 'text-[9.5px]' : 'text-[11px]'
                              }`}
                            >
                              {p.name}
                            </span>
                          </div>
                        )}

                        {/* 3. Barcode or QR Code Visual */}
                        <div className="w-full flex items-center justify-center my-0.5 shrink-0 overflow-hidden">
                          <BarcodeGenerator
                            value={p.barcode}
                            format={barcodeFormat}
                            width={barcodeBarWidth}
                            height={barcodeHeight}
                            fontSize={activePreset.heightMm <= 25 ? 8 : 9}
                            displayValue={showBarcodeText && barcodeFormat !== 'QR'}
                            noBorder={true}
                            margin={0}
                          />
                        </div>

                        {/* 4. Footer Row: Warranty / Price / Secret Code */}
                        <div className="w-full flex items-center justify-between border-t border-slate-900/20 pt-0.5 px-0.5 shrink-0 leading-tight">
                          {/* Left: Warranty or Secret Code */}
                          <div className="text-left shrink-0">
                            {showWarranty && p.warrantyMonths > 0 ? (
                              <span className="font-bold text-[7.5px] uppercase tracking-tighter bg-slate-100 px-0.5 rounded">
                                {p.warrantyMonths}M War.
                              </span>
                            ) : showSecretCostCode ? (
                              <span className="font-mono text-[7px] text-slate-600">
                                {getSecretCode(p.purchasePrice)}
                              </span>
                            ) : (
                              <span className="text-[7px] text-slate-400 font-mono">
                                {p.category.slice(0, 5)}
                              </span>
                            )}
                          </div>

                          {/* Right: Selling Price */}
                          {showPrice && (
                            <div className="text-right shrink-0">
                              <span className="font-black font-mono text-slate-950" style={{ fontSize: activePreset.heightMm <= 25 ? '9px' : '11px' }}>
                                {pricePrefix === 'mrp' ? 'MRP ' : ''}{formatCurrency(p.sellingPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preview Status Footer */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                প্রিন্টারের কাগজ লোড করার পর <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">Ctrl + P</kbd> বা 'প্রিন্ট' বাটনে ক্লিক করুন।
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(false)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('এখনই প্রিন্ট করুন', 'Print Now')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PRINT ONLY RENDER (Visible when window.print() is called) */}
        <div id="barcode-sheet-print-container" className="hidden print:block w-full bg-white">
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${activePreset.columns}, minmax(0, 1fr))`,
              gap: `${activePreset.gapMm}mm`
            }}
          >
            {flattenedStickers.map((p, index) => {
              const storeHeader = customStoreTitle || settings.storeName;
              return (
                <div
                  key={`print_${p.id}_${index}`}
                  className={`barcode-sticker-cell bg-white text-slate-900 flex flex-col items-center justify-between text-center overflow-hidden ${
                    showCutGuide ? 'border border-dashed border-slate-400' : 'border border-transparent'
                  }`}
                  style={{
                    width: `${activePreset.widthMm}mm`,
                    height: `${activePreset.heightMm}mm`,
                    padding: activePreset.heightMm <= 25 ? '1mm 0.8mm' : '1.5mm 1mm',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Store Name */}
                  {showStoreName && (
                    <div className="w-full truncate leading-tight shrink-0">
                      <span className="font-black text-black uppercase tracking-tighter" style={{ fontSize: activePreset.heightMm <= 25 ? '7.5px' : '9px' }}>
                        {storeHeader}
                      </span>
                    </div>
                  )}

                  {/* Product Title */}
                  {showProductName && (
                    <div className="w-full truncate leading-tight px-0.5 shrink-0">
                      <span 
                        className={`font-bold text-black line-clamp-1 ${
                          productNameFontSize === 'xs' ? 'text-[8px]' : productNameFontSize === 'sm' ? 'text-[9.5px]' : 'text-[11px]'
                        }`}
                      >
                        {p.name}
                      </span>
                    </div>
                  )}

                  {/* Barcode / QR */}
                  <div className="w-full flex items-center justify-center my-0.5 shrink-0 overflow-hidden">
                    <BarcodeGenerator
                      value={p.barcode}
                      format={barcodeFormat}
                      width={barcodeBarWidth}
                      height={barcodeHeight}
                      fontSize={activePreset.heightMm <= 25 ? 8 : 9}
                      displayValue={showBarcodeText && barcodeFormat !== 'QR'}
                      noBorder={true}
                      margin={0}
                    />
                  </div>

                  {/* Price & Info */}
                  <div className="w-full flex items-center justify-between border-t border-black pt-0.5 px-0.5 shrink-0 leading-tight">
                    <div className="text-left shrink-0">
                      {showWarranty && p.warrantyMonths > 0 ? (
                        <span className="font-bold text-[7.5px] uppercase tracking-tighter">
                          {p.warrantyMonths}M War.
                        </span>
                      ) : showSecretCostCode ? (
                        <span className="font-mono text-[7px] text-black">
                          {getSecretCode(p.purchasePrice)}
                        </span>
                      ) : null}
                    </div>

                    {showPrice && (
                      <div className="text-right shrink-0">
                        <span className="font-black font-mono text-black" style={{ fontSize: activePreset.heightMm <= 25 ? '9px' : '11px' }}>
                          {pricePrefix === 'mrp' ? 'MRP ' : ''}{formatCurrency(p.sellingPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
