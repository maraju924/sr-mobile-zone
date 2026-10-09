import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Barcode as BarcodeIcon, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Printer, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  X, 
  Package, 
  ArrowUpDown, 
  Tag,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeGenerator } from '../Common/BarcodeGenerator';
import { BarcodeSheetModal } from '../Common/BarcodeSheetModal';
import { ReportExportModal } from '../Reports/ReportExportModal';
import { BarcodeScannerModal } from '../POS/BarcodeScannerModal';

export const ProductList: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, formatCurrency, exportToCsv, settings, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'barcode' | 'serial' | null>(null);
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBarcodePrintModalOpen, setIsBarcodePrintModalOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
  const [barcodePrintCount, setBarcodePrintCount] = useState<number>(4);
  const [showExportModal, setShowExportModal] = useState(false);

  // Multi-selection for batch barcode printing
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [initialBatchForModal, setInitialBatchForModal] = useState<{ product: Product; count: number }[] | undefined>(undefined);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('স্মার্টফোন');
  const [formBarcode, setFormBarcode] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(1);
  const [formMinAlert, setFormMinAlert] = useState<number>(2);
  const [formWarrantyMonths, setFormWarrantyMonths] = useState<number>(12);
  const [formSerials, setFormSerials] = useState<string[]>([]);
  const [serialInputText, setSerialInputText] = useState('');

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...list];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      let matchStock = true;
      if (stockFilter === 'low') {
        matchStock = p.stock <= p.minStockAlert && p.stock > 0;
      } else if (stockFilter === 'out') {
        matchStock = p.stock <= 0;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q) ||
        (p.serialNumbers || []).some(s => s.toLowerCase().includes(q));

      return matchCat && matchStock && matchQuery;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('');
    setFormCategory('স্মার্টফোন');
    setFormBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString());
    setFormPurchasePrice(0);
    setFormSellingPrice(0);
    setFormStock(5);
    setFormMinAlert(2);
    setFormWarrantyMonths(12);
    setFormSerials([]);
    setSerialInputText('');
    setIsAddEditModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormBarcode(p.barcode);
    setFormPurchasePrice(p.purchasePrice || 0);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.stock);
    setFormMinAlert(p.minStockAlert);
    setFormWarrantyMonths(p.warrantyMonths || 12);
    setFormSerials(p.serialNumbers ? [...p.serialNumbers] : []);
    setSerialInputText('');
    setIsAddEditModalOpen(true);
  };

  // Add Serial chip
  const handleAddSerial = () => {
    if (serialInputText.trim() && !formSerials.includes(serialInputText.trim())) {
      setFormSerials([...formSerials, serialInputText.trim()]);
      setSerialInputText('');
    }
  };

  // Remove Serial chip
  const handleRemoveSerial = (sn: string) => {
    setFormSerials(formSerials.filter(s => s !== sn));
  };

  // Save Product form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formSellingPrice <= 0) {
      alert(t('পণ্যের নাম এবং বিক্রয়মূল্য সঠিকভাবে পূরণ করুন!', 'Please enter product name and selling price!'));
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        brand: formBrand.trim() || 'General',
        category: formCategory,
        barcode: formBarcode.trim(),
        purchasePrice: formPurchasePrice,
        sellingPrice: formSellingPrice,
        stock: formStock,
        minStockAlert: formMinAlert,
        warrantyMonths: formWarrantyMonths,
        serialNumbers: formSerials
      });
    } else {
      addProduct({
        name: formName.trim(),
        brand: formBrand.trim() || 'General',
        category: formCategory,
        barcode: formBarcode.trim() || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        purchasePrice: formPurchasePrice,
        sellingPrice: formSellingPrice,
        stock: formStock,
        minStockAlert: formMinAlert,
        warrantyMonths: formWarrantyMonths,
        serialNumbers: formSerials
      });
    }

    setIsAddEditModalOpen(false);
  };

  // Open Barcode Label Print Modal
  const handleOpenBarcodePrint = (p: Product) => {
    setSelectedProductForBarcode(p);
    setInitialBatchForModal(undefined);
    setBarcodePrintCount(4);
    setIsBarcodePrintModalOpen(true);
  };

  // Multi-select helpers
  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id));
  const isSomeSelected = filteredProducts.some(p => selectedProductIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handlePrintSelectedBarcodes = (mode: 'single' | 'stock') => {
    const selected = products.filter(p => selectedProductIds.includes(p.id));
    if (selected.length === 0) return;
    const batch = selected.map(p => ({
      product: p,
      count: mode === 'stock' ? Math.max(1, p.stock) : 1
    }));
    setSelectedProductForBarcode(null);
    setInitialBatchForModal(batch);
    setIsBarcodePrintModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Top Header & Actions */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              {t('পণ্য ও ইনভেন্টরি স্টক ব্যবস্থাপনা', 'Product & Inventory Stock Management')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('মোট পণ্য:', 'Total Items:')} <b className="text-slate-700">{products.length}</b> • {t('মোট স্টক মূল্য:', 'Stock Valuation:')} <b className="text-slate-700">{formatCurrency(products.reduce((s, p) => s + (p.purchasePrice * p.stock), 0))}</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedProductForBarcode(null);
                setIsBarcodePrintModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              title="যেকোনো মডেলের থার্মাল বা এ৪ প্রিন্টার দিয়ে স্টিকার প্রিন্ট করুন"
            >
              <Tag className="w-4 h-4 text-amber-400" />
              <span>{t('বারকোড স্টুডিও', 'Barcode Studio')}</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('স্টক মূল্যায়ন রিপোর্ট', 'Inventory Report')}</span>
            </button>
            <button
              onClick={() => exportToCsv(products, 'Product_Inventory')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('CSV', 'CSV')}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('+ নতুন পণ্য যোগ করুন', '+ Add New Product')}</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('পণ্যের নাম, ব্র্যান্ড, বারকোড বা IMEI দিয়ে খুঁজুন...', 'Search by product name, brand, barcode, IMEI...')}
              className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => {
                setScannerTarget('search');
                setIsScannerOpen(true);
              }}
              title="ক্যামেরা দিয়ে বারকোড স্ক্যান করুন"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 rounded transition"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? t('সকল ক্যাটাগরি', 'All Categories') : c}
              </option>
            ))}
          </select>

          {/* Stock Alert Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t('সকল', 'All')}
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg transition ${
                stockFilter === 'low' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600'
              }`}
            >
              {t('সীমিত স্টক', 'Low Stock')}
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-lg transition ${
                stockFilter === 'out' ? 'bg-rose-500 text-white font-bold' : 'text-slate-600'
              }`}
            >
              {t('স্টক শেষ', 'Out of Stock')}
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Desktop) & Cards (Mobile) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 sm:pb-6">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Package className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm font-medium">{t('কোন পণ্য পাওয়া যায়নি', 'No products matched criteria')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-3.5 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-indigo-600 focus:outline-none flex items-center justify-center mx-auto"
                        title={isAllSelected ? t('সব সিলেকশন বাদ দিন', 'Deselect All') : t('সব পণ্য সিলেক্ট করুন', 'Select All')}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : isSomeSelected ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-600 bg-indigo-100 rounded-xs flex items-center justify-center">
                            <div className="w-2 h-0.5 bg-indigo-600" />
                          </div>
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">{t('পণ্য ও বিবরণ', 'Product & Brand')}</th>
                    <th className="py-3.5 px-3">{t('ক্যাটাগরি', 'Category')}</th>
                    <th className="py-3.5 px-3 font-mono">{t('বারকোড', 'Barcode')}</th>
                    <th className="py-3.5 px-3 text-right">{t('ক্রয়মূল্য', 'Cost')}</th>
                    <th className="py-3.5 px-3 text-right">{t('বিক্রয়মূল্য', 'Price')}</th>
                    <th className="py-3.5 px-3 text-center">{t('স্টক পরিমাণ', 'Stock')}</th>
                    <th className="py-3.5 px-3 text-center">{t('ওয়ারেন্টি', 'Warranty')}</th>
                    <th className="py-3.5 px-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isOut = p.stock <= 0;
                    const isLow = p.stock <= p.minStockAlert && !isOut;
                    const profitMargin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - (p.purchasePrice || 0)) / p.sellingPrice) * 100) : 0;
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <tr 
                        key={p.id} 
                        className={`transition ${isSelected ? 'bg-indigo-50/70 hover:bg-indigo-50' : 'hover:bg-slate-50/80'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectProduct(p.id);
                            }}
                            className="text-slate-400 hover:text-indigo-600 focus:outline-none flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Name & Serials */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 leading-snug">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-medium px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{p.brand}</span>
                            {p.serialNumbers && p.serialNumbers.length > 0 && (
                              <span className="font-mono text-indigo-600">
                                {p.serialNumbers.length} {t('টি IMEI সংরক্ষিত', 'IMEI(s)')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                            {p.category}
                          </span>
                        </td>

                        {/* Barcode */}
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          {p.barcode}
                        </td>

                        {/* Purchase Price */}
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(p.purchasePrice || 0)}
                        </td>

                        {/* Selling Price & Margin */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-bold text-slate-900">{formatCurrency(p.sellingPrice)}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">+{profitMargin}% {t('লাভ', 'margin')}</div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                              isOut 
                                ? 'bg-rose-100 text-rose-700' 
                                : isLow 
                                ? 'bg-amber-100 text-amber-800 animate-pulse' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock}
                            </span>
                          </div>
                        </td>

                        {/* Warranty */}
                        <td className="py-3 px-3 text-center">
                          {p.warrantyMonths > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              {p.warrantyMonths}m
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Print barcode */}
                            <button
                              onClick={() => handleOpenBarcodePrint(p)}
                              title={t('বারকোড স্টিকার প্রিন্ট', 'Print Barcode Label')}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title={t('সম্পাদনা', 'Edit')}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(t(`আপনি কি নিশ্চিত যে "${p.name}" মুছে ফেলতে চান?`, `Are you sure you want to delete "${p.name}"?`))) {
                                  deleteProduct(p.id);
                                }
                              }}
                              title={t('মুছে ফেলুন', 'Delete')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-auto border border-slate-100 animate-in fade-in">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">
                {editingProduct ? t('পণ্য তথ্য সম্পাদনা', 'Edit Product Details') : t('নতুন পণ্য যুক্ত করুন', 'Add New Electronics Item')}
              </h3>
              <button onClick={() => setIsAddEditModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('পণ্যের নাম ও মডেল *', 'Product Name & Model *')}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('যেমন: Samsung Galaxy S24 Ultra 512GB', 'e.g. Samsung Galaxy S24 Ultra 512GB')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('ব্র্যান্ড / প্রস্তুতকারক', 'Brand / Manufacturer')}
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Samsung, Sony, Walton, Apple..."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('ক্যাটাগরি', 'Category')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="স্মার্টফোন">স্মার্টফোন (Smartphones)</option>
                    <option value="ল্যাপটপ ও কম্পিউটার">ল্যাপটপ ও কম্পিউটার (Laptops & PC)</option>
                    <option value="টেলিভিশন">টেলিভিশন (TV & Displays)</option>
                    <option value="এসি ও রেফ্রিজারেটর">এসি ও রেফ্রিজারেটর (AC & Fridge)</option>
                    <option value="হোম অ্যাপ্লায়েন্স">হোম অ্যাপ্লায়েন্স (Home Appliances)</option>
                    <option value="অডিও ও সাউন্ড">অডিও ও সাউন্ড (Audio & Sound)</option>
                    <option value="এক্সেসরিজ">এক্সেসরিজ (Accessories)</option>
                    <option value="অন্যান্য">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>

              {/* Barcode / SKU */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('বারকোড / SKU কোড', 'Barcode / SKU Code')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString())}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {t('র‍্যান্ডম বারকোড তৈরি করুন', 'Generate Code')}
                  </button>
                </div>
                <div className="relative">
                  <BarcodeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="880609..."
                    className="w-full pl-9 pr-10 py-2 font-mono text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('barcode');
                      setIsScannerOpen(true);
                    }}
                    title="ক্যামেরা দিয়ে বারকোড স্ক্যান করুন"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('ক্রয়মূল্য (৳)', 'Cost Price')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 font-mono text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('বিক্রয়মূল্য (৳) *', 'Sell Price *')}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 font-mono text-sm font-bold text-slate-900 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('বর্তমান স্টক', 'Current Stock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 font-mono text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {t('কম স্টক এলার্ট', 'Min Alert')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-2 font-mono text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Warranty Months */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ওয়ারেন্টি মেয়াদ (মাস হিসেবে)', 'Warranty Duration (Months)')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormWarrantyMonths(m)}
                      className={`py-1.5 rounded-lg border text-xs font-medium transition ${
                        formWarrantyMonths === m 
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m === 0 ? t('কোন ওয়ারেন্টি নেই', 'No Warranty') : `${m} ${t('মাস', 'Months')}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMEI / Serial Numbers Storage */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    {t('IMEI বা সিরিয়াল নম্বরসমূহ (ঐচ্ছিক)', 'IMEI / Serial Numbers (Optional)')}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {formSerials.length} {t('টি যুক্ত', 'added')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serialInputText}
                    onChange={(e) => setSerialInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSerial();
                      }
                    }}
                    placeholder={t('IMEI/সিরিয়াল লিখে এন্টার চাপুন...', 'Enter IMEI/Serial & press Enter...')}
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerTarget('serial');
                      setIsScannerOpen(true);
                    }}
                    title="ক্যামেরা দিয়ে IMEI স্ক্যান করুন"
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSerial}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    {t('যোগ করুন', 'Add')}
                  </button>
                </div>

                {/* Chips */}
                {formSerials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formSerials.map((sn) => (
                      <span key={sn} className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                        {sn}
                        <button type="button" onClick={() => handleRemoveSerial(sn)} className="hover:text-rose-600">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition"
                >
                  {editingProduct ? t('আপডেট সংরক্ষণ করুন', 'Save Changes') : t('পণ্য যুক্ত করুন', 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Sticker Print Sheet Modal */}
      <BarcodeSheetModal
        product={selectedProductForBarcode}
        initialBatch={initialBatchForModal}
        allProducts={products}
        isOpen={isBarcodePrintModalOpen}
        onClose={() => setIsBarcodePrintModalOpen(false)}
      />

      {/* Floating Bulk Action Bar for Selected Products */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 sm:gap-4 max-w-[95vw] animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold whitespace-nowrap">
              {selectedProductIds.length} {t('টি পণ্য নির্বাচিত', 'items selected')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePrintSelectedBarcodes('single')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
              title="নির্বাচিত প্রতিটি পণ্যের ১টি করে স্টিকার প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('১টি করে স্টিকার প্রিন্ট', '1 Label Each')}</span>
            </button>

            <button
              onClick={() => handlePrintSelectedBarcodes('stock')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition"
              title="বর্তমান স্টক সংখ্যা অনুযায়ী সমপরিমাণ স্টিকার প্রিন্ট করুন"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{t('স্টক সংখ্যা অনুযায়ী প্রিন্ট', 'By Stock Qty')}</span>
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white transition underline"
            >
              {t('বাতিল', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialType="inventory_summary"
      />

      {/* Barcode & IMEI Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'search') {
            setSearchQuery(code);
          } else if (scannerTarget === 'barcode') {
            setFormBarcode(code);
          } else if (scannerTarget === 'serial') {
            if (!formSerials.includes(code)) {
              setFormSerials(prev => [...prev, code]);
            }
          }
          setIsScannerOpen(false);
          setScannerTarget(null);
        }}
      />
    </div>
  );
};
