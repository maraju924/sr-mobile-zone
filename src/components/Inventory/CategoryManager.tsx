import React, { useState, useMemo } from 'react';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Smartphone, 
  Laptop, 
  Tv, 
  Headphones, 
  Cable, 
  Grid, 
  List, 
  ArrowRight, 
  Check, 
  X, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  FolderPlus,
  RefreshCw,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, Product } from '../../types';

const COLOR_OPTIONS = [
  { id: 'indigo', name: 'ইন্ডিগো (Indigo)', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-600' },
  { id: 'emerald', name: 'সবুজ (Emerald)', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-600' },
  { id: 'blue', name: 'নীল (Blue)', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-600' },
  { id: 'amber', name: 'অ্যাম্বার (Amber)', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-600' },
  { id: 'rose', name: 'গোলাপি (Rose)', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-600' },
  { id: 'purple', name: 'বেগুনি (Purple)', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-600' },
  { id: 'cyan', name: 'সায়ান (Cyan)', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-600' },
  { id: 'orange', name: 'কমলা (Orange)', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-600' },
  { id: 'slate', name: 'স্লেট (Slate)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-600' },
];

const ICON_OPTIONS = [
  { id: 'smartphone', label: 'স্মার্টফোন', icon: Smartphone },
  { id: 'laptop', label: 'ল্যাপটপ', icon: Laptop },
  { id: 'tv', label: 'টিভি', icon: Tv },
  { id: 'headphones', label: 'অডিও', icon: Headphones },
  { id: 'cable', label: 'এক্সেসরিজ', icon: Cable },
  { id: 'package', label: 'প্যাকেজ', icon: Package },
  { id: 'layers', label: 'লেয়ার', icon: Layers },
  { id: 'sparkles', label: 'গ্যাজেট', icon: Sparkles },
  { id: 'shield', label: 'সিকিউরিটি', icon: ShieldCheck },
  { id: 'tag', label: 'ট্যাগ', icon: Tags },
];

export const CategoryManager: React.FC = () => {
  const { 
    categories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    setActiveTab, 
    formatCurrency, 
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'valuation'>('count');

  // Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('indigo');
  const [formIcon, setFormIcon] = useState('tag');
  const [syncProductNames, setSyncProductNames] = useState(true);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [fallbackCategory, setFallbackCategory] = useState('অন্যান্য');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Computed Category Statistics Map
  const categoryStats = useMemo(() => {
    const stats: Record<string, { productCount: number; totalStock: number; valuation: number }> = {};
    
    // Initialize with all known categories
    categories.forEach(cat => {
      stats[cat.name] = { productCount: 0, totalStock: 0, valuation: 0 };
    });

    // Tally up from products
    products.forEach(p => {
      const catName = p.category || 'অন্যান্য';
      if (!stats[catName]) {
        stats[catName] = { productCount: 0, totalStock: 0, valuation: 0 };
      }
      stats[catName].productCount += 1;
      stats[catName].totalStock += (p.stock || 0);
      stats[catName].valuation += ((p.purchasePrice || 0) * (p.stock || 0));
    });

    return stats;
  }, [categories, products]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalCats = categories.length;
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalValuation = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0);
    
    // Top category by product count
    let topCat = '-';
    let maxCount = 0;
    Object.entries(categoryStats).forEach(([name, stat]) => {
      if (stat.productCount > maxCount) {
        maxCount = stat.productCount;
        topCat = name;
      }
    });

    return { totalCats, totalProducts, totalStock, totalValuation, topCat, maxCount };
  }, [categories, products, categoryStats]);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = categories.filter(c => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });

    // Sorting
    list = [...list].sort((a, b) => {
      const statA = categoryStats[a.name] || { productCount: 0, valuation: 0 };
      const statB = categoryStats[b.name] || { productCount: 0, valuation: 0 };
      if (sortBy === 'count') {
        return statB.productCount - statA.productCount;
      }
      if (sortBy === 'valuation') {
        return statB.valuation - statA.valuation;
      }
      return a.name.localeCompare(b.name, 'bn');
    });

    return list;
  }, [categories, searchQuery, sortBy, categoryStats]);

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormNameEn('');
    setFormDescription('');
    setFormColor('indigo');
    setFormIcon('tag');
    setSyncProductNames(true);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormNameEn(cat.nameEn || '');
    setFormDescription(cat.description || '');
    setFormColor(cat.color || 'indigo');
    setFormIcon(cat.icon || 'tag');
    setSyncProductNames(true);
    setIsAddEditModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(t('অনুগ্রহ করে ক্যাটাগরির নাম লিখুন!', 'Please enter category name!'));
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formName.trim(),
        nameEn: formNameEn.trim() || undefined,
        description: formDescription.trim() || undefined,
        color: formColor,
        icon: formIcon,
      }, syncProductNames);
      setActionNotice(t(`ক্যাটাগরি "${formName.trim()}" সফলভাবে আপডেট করা হয়েছে।`, `Category "${formName.trim()}" updated successfully.`));
    } else {
      // Check duplicate
      const exists = categories.some(c => c.name.trim().toLowerCase() === formName.trim().toLowerCase());
      if (exists) {
        alert(t('এই নামের ক্যাটাগরি ইতিমধ্যে রয়েছে!', 'Category with this name already exists!'));
        return;
      }
      addCategory({
        name: formName.trim(),
        nameEn: formNameEn.trim() || undefined,
        description: formDescription.trim() || undefined,
        color: formColor,
        icon: formIcon,
      });
      setActionNotice(t(`নতুন ক্যাটাগরি "${formName.trim()}" যুক্ত করা হয়েছে! এখন এটি প্রোডাক্টে ব্যবহার করতে পারবেন।`, `New category "${formName.trim()}" created successfully!`));
    }

    setIsAddEditModalOpen(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteCategory(deleteTarget.id, fallbackCategory);
    setActionNotice(res.message);
    setDeleteTarget(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Helper to render icon component
  const renderCategoryIcon = (iconId?: string, className: string = 'w-5 h-5') => {
    switch (iconId) {
      case 'smartphone': return <Smartphone className={className} />;
      case 'laptop': return <Laptop className={className} />;
      case 'tv': return <Tv className={className} />;
      case 'headphones': return <Headphones className={className} />;
      case 'cable': return <Cable className={className} />;
      case 'package': return <Package className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'shield': return <ShieldCheck className={className} />;
      default: return <Tags className={className} />;
    }
  };

  const getColorConfig = (colorId?: string) => {
    return COLOR_OPTIONS.find(c => c.id === colorId) || COLOR_OPTIONS[0];
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Top Header & Actions Bar */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  {t('পণ্য ক্যাটাগরি ব্যবস্থাপনা', 'Product Category Management')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('কাস্টম ক্যাটাগরি তৈরি করুন, এডিট করুন এবং সরাসরি পণ্য তালিকায় ব্যবহার করুন', 'Create, manage & organize categories for your products & POS')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>{t('পণ্য ইনভেন্টরি', 'Product Inventory')}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('+ নতুন ক্যাটাগরি যোগ করুন', '+ Add Category')}</span>
            </button>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionNotice && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50/70 p-3 sm:p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">{t('মোট ক্যাটাগরি', 'Total Categories')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-slate-800">{metrics.totalCats}</span>
              <span className="text-[11px] text-indigo-600 font-semibold">{t('টি সক্রিয়', 'Active')}</span>
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 sm:p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">{t('শ্রেণিবদ্ধ পণ্য', 'Total Assigned Items')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-slate-800">{metrics.totalProducts}</span>
              <span className="text-[11px] text-slate-500">টি পণ্য</span>
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 sm:p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">{t('মোট স্টক ভ্যালুয়েশন', 'Inventory Value')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-slate-800">{formatCurrency(metrics.totalValuation)}</span>
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 sm:p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">{t('শীর্ষ ক্যাটাগরি', 'Top Category')}</span>
            <div className="flex items-baseline gap-2 mt-1 truncate">
              <span className="text-sm sm:text-base font-bold text-indigo-700 truncate">{metrics.topCat}</span>
              <span className="text-[11px] text-slate-500 shrink-0">({metrics.maxCount})</span>
            </div>
          </div>
        </div>

        {/* Search, Sort and View Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ক্যাটাগরির নাম বা বিবরণ দিয়ে খুঁজুন...', 'Search by category name, english or note...')}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>{t('সাজান:', 'Sort:')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="count">{t('পণ্যের সংখ্যা অনুযায়ী', 'By Product Count')}</option>
                <option value="valuation">{t('স্টক মূল্য অনুযায়ী', 'By Stock Value')}</option>
                <option value="name">{t('নাম অনুযায়ী (ক-হ)', 'By Name (A-Z)')}</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                title={t('গ্রিড ভিউ', 'Grid View')}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                title={t('টেবিল ভিউ', 'Table View')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredCategories.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Tags className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">
              {searchQuery ? t('কোনো ক্যাটাগরি পাওয়া যায়নি', 'No category found matching search') : t('কোনো ক্যাটাগরি নেই', 'No categories yet')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery ? t('ভিন্ন শব্দ দিয়ে খুঁজুন অথবা নতুন ক্যাটাগরি তৈরি করুন।', 'Try a different search keyword or create a new category.') : t('আপনার পছন্দের ক্যাটাগরি তৈরি করতে নিচের বাটনে ক্লিক করুন।', 'Click below to create your first custom category.')}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন ক্যাটাগরি তৈরি করুন', 'Create New Category')}</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map(cat => {
              const stat = categoryStats[cat.name] || { productCount: 0, totalStock: 0, valuation: 0 };
              const col = getColorConfig(cat.color);

              return (
                <div 
                  key={cat.id} 
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Bar with Accent and Actions */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl ${col.bg} ${col.text} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                          {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight group-hover:text-indigo-600 transition-colors">
                            {cat.name}
                          </h3>
                          {cat.nameEn && (
                            <span className="text-[11px] text-slate-400 font-medium block">
                              {cat.nameEn}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title={t('এডিট করুন', 'Edit Category')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cat);
                            setFallbackCategory(categories.find(c => c.id !== cat.id)?.name || 'অন্যান্য');
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title={t('মুছে ফেলুন', 'Delete Category')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">
                        {cat.description}
                      </p>
                    )}

                    {/* Stats Pill Box */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                          {t('পণ্যের সংখ্যা', 'Products')}
                        </span>
                        <div className="font-bold text-slate-700 mt-0.5 flex items-baseline gap-1">
                          <span className="text-sm">{stat.productCount}</span>
                          <span className="text-[10px] text-slate-400 font-normal">আইটেম</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                          {t('স্টক সংখ্যা', 'Total Stock')}
                        </span>
                        <div className="font-bold text-slate-700 mt-0.5 flex items-baseline gap-1">
                          <span className="text-sm">{stat.totalStock}</span>
                          <span className="text-[10px] text-slate-400 font-normal">পিস</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>{t('স্টক মূল্য:', 'Stock Valuation:')}</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(stat.valuation)}</span>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('inventory');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition"
                    >
                      <span>{t('পণ্য দেখুন', 'View Products')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('ক্যাটাগরি নাম', 'Category Name')}</th>
                    <th className="py-3 px-4">{t('ইংরেজি লেবেল', 'English Label')}</th>
                    <th className="py-3 px-4">{t('বিবরণ', 'Description')}</th>
                    <th className="py-3 px-4 text-center">{t('পণ্য সংখ্যা', 'Product Count')}</th>
                    <th className="py-3 px-4 text-center">{t('মোট স্টক', 'Stock Qty')}</th>
                    <th className="py-3 px-4 text-right">{t('স্টক মূল্য', 'Stock Valuation')}</th>
                    <th className="py-3 px-4 text-center">{t('একশন', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCategories.map(cat => {
                    const stat = categoryStats[cat.name] || { productCount: 0, totalStock: 0, valuation: 0 };
                    const col = getColorConfig(cat.color);

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${col.bg} ${col.text} flex items-center justify-center shrink-0`}>
                              {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                            </div>
                            <span className="font-bold text-slate-800">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {cat.nameEn || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {cat.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                            {stat.productCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700">
                          {stat.totalStock}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">
                          {formatCurrency(stat.valuation)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title={t('এডিট করুন', 'Edit')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(cat);
                                setFallbackCategory(categories.find(c => c.id !== cat.id)?.name || 'অন্যান্য');
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title={t('মুছুন', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Category Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingCategory ? t('ক্যাটাগরি সম্পাদনা করুন', 'Edit Category') : t('নতুন ক্যাটাগরি যুক্ত করুন', 'Add New Category')}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddEditModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              
              {/* Category Name (Bangla) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ক্যাটাগরির নাম (বাংলায়) *', 'Category Name (Bangla) *')}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('যেমন: স্মার্টফোন, ক্যামেরা, হেডফোন...', 'e.g. স্মার্টফোন, ড্রোন, পাওয়ারব্যাংক...')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category Name (English) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ইংরেজি নাম / কোড (ঐচ্ছিক)', 'English Name / Label (Optional)')}
                </label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="e.g. Smartphones, Audio & Sound..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)', 'Short Description (Optional)')}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t('ক্যাটাগরি সম্পর্কে কোনো নোট বা বিশেষ বিবরণ...', 'Short note about this product category...')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('কালার থিম নির্বাচন করুন', 'Select Color Badge')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => {
                    const isSelected = formColor === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setFormColor(c.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                          isSelected 
                            ? `${c.bg} ${c.text} ${c.border} ring-2 ring-indigo-400 font-bold` 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('আইকন নির্বাচন করুন', 'Select Icon')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const isSelected = formIcon === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormIcon(opt.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                          isSelected 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500 font-bold' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sync existing products option when editing */}
              {editingCategory && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="syncProducts"
                    checked={syncProductNames}
                    onChange={(e) => setSyncProductNames(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="syncProducts" className="text-xs text-indigo-950 font-medium">
                    {t(
                      `এই ক্যাটাগরিতে থাকা বিদ্যমান সকল পণ্যের ক্যাটাগরি স্বয়ংক্রিয়ভাবে "${formName || editingCategory.name}" নামে আপডেট করুন।`,
                      `Automatically update category name on all existing products currently assigned to this category.`
                    )}
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? t('পরিবর্তন সংরক্ষণ করুন', 'Save Changes') : t('ক্যাটাগরি যুক্ত করুন', 'Create Category')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Safe Reassignment */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-5 sm:p-6 space-y-4 animate-scaleUp">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-800">
                {t('ক্যাটাগরি মুছে ফেলতে চান?', 'Delete this category?')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(`আপনি কি নিশ্চিত যে "${deleteTarget.name}" ক্যাটাগরি মুছে ফেলতে চান?`, `Are you sure you want to delete category "${deleteTarget.name}"?`)}
              </p>
            </div>

            {/* Check if products are currently using this category */}
            {categoryStats[deleteTarget.name]?.productCount > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {t(
                      `এই ক্যাটাগরিতে ${categoryStats[deleteTarget.name].productCount} টি পণ্য সংরক্ষিত আছে!`,
                      `There are ${categoryStats[deleteTarget.name].productCount} products currently assigned to this category!`
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700">
                  {t(
                    'পণ্যগুলো মুছে যাবে না। অনুগ্রহ করে একটি বিকল্প ক্যাটাগরি নির্বাচন করুন যেখানে এই পণ্যগুলো স্থানান্তর করা হবে:',
                    'Products will not be deleted. Please pick a fallback category to safely reassign them to:'
                  )}
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    {t('স্থানান্তরের জন্য ক্যাটাগরি:', 'Reassign to Category:')}
                  </label>
                  <select
                    value={fallbackCategory}
                    onChange={(e) => setFallbackCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.filter(c => c.id !== deleteTarget.id).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="অন্যান্য">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-center">
                {t('এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই। এটি নিরাপদে মুছে ফেলা যাবে।', 'No products are assigned to this category. It is safe to delete.')}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-rose-100 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('হ্যাঁ, মুছে ফেলুন', 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
