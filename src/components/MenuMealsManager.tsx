import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ArrowRightLeft, 
  DollarSign, 
  Tag, 
  Layers, 
  Printer, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Flame, 
  Coffee, 
  Croissant, 
  Receipt,
  CheckCircle2,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';
import { InvoCategory, InvoMenuItem, SectionPrinter, POSSettings } from '../types';
import { posAudio } from '../utils/audio';

interface MenuMealsManagerProps {
  categories: InvoCategory[];
  menuItems: Record<string, InvoMenuItem[]>;
  onUpdateCategories: (newCats: InvoCategory[]) => void;
  onUpdateMenuItems: (newItems: Record<string, InvoMenuItem[]>) => void;
  sectionPrinters?: SectionPrinter[];
  settings: POSSettings;
  onUpdateSettings: (newSettings: Partial<POSSettings>) => void;
  showToast: (msg: string) => void;
}

export const MenuMealsManager: React.FC<MenuMealsManagerProps> = ({
  categories,
  menuItems,
  onUpdateCategories,
  onUpdateMenuItems,
  sectionPrinters = [],
  settings,
  onUpdateSettings,
  showToast,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriceMode, setFilterPriceMode] = useState<'all' | 'priced' | 'free' | 'hidden_price'>('all');

  // Modal states
  const [showAddMealModal, setShowAddMealModal] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<{ catId: string; item: InvoMenuItem } | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);

  // Add/Edit Meal Form State
  const [mealName, setMealName] = useState<string>('');
  const [mealCategoryId, setMealCategoryId] = useState<string>(categories[0]?.id || 'chicken');
  const [mealPrice, setMealPrice] = useState<string>('1.500');
  const [mealIsFree, setMealIsFree] = useState<boolean>(false);
  const [mealHidePriceOnCard, setMealHidePriceOnCard] = useState<boolean>(false);
  const [mealBorderColor, setMealBorderColor] = useState<string>('border-rose-600');
  const [mealPrinterId, setMealPrinterId] = useState<string>('prn-kitchen');

  // Add Category Form State
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatColor, setNewCatColor] = useState<string>('bg-[#b81d24]');

  // Flattened all items for global search/stats
  const allMealsList: Array<{ catId: string; catName: string; item: InvoMenuItem }> = [];
  categories.forEach((cat) => {
    const itemsInCat = menuItems[cat.id] || [];
    itemsInCat.forEach((item) => {
      allMealsList.push({
        catId: cat.id,
        catName: cat.name,
        item,
      });
    });
  });

  // Filtered meals
  const displayedMeals = allMealsList.filter(({ catId, item }) => {
    if (selectedCategoryTab !== 'all' && catId !== selectedCategoryTab) {
      return false;
    }
    if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterPriceMode === 'free' && !item.isFreeOrNoPrice && item.price > 0) {
      return false;
    }
    if (filterPriceMode === 'priced' && (item.isFreeOrNoPrice || item.price === 0)) {
      return false;
    }
    if (filterPriceMode === 'hidden_price' && !item.isPriceHiddenOnCard) {
      return false;
    }
    return true;
  });

  // Colors available for borders
  const BORDER_COLORS = [
    { label: 'أحمر داكن', value: 'border-rose-600', bg: 'bg-rose-600' },
    { label: 'أزرق ملكي', value: 'border-blue-500', bg: 'bg-blue-500' },
    { label: 'أخضر زمردي', value: 'border-emerald-500', bg: 'bg-emerald-500' },
    { label: 'برتقالي كهرماني', value: 'border-amber-500', bg: 'bg-amber-500' },
    { label: 'بنفسجي داكن', value: 'border-purple-600', bg: 'bg-purple-600' },
    { label: 'سماوي بارد', value: 'border-sky-500', bg: 'bg-sky-500' },
    { label: 'رمادي غامق', value: 'border-slate-500', bg: 'bg-slate-500' },
  ];

  // Category Colors
  const CATEGORY_COLORS = [
    { label: 'أحمر', color: 'bg-[#b81d24]', activeColor: 'bg-[#881318]' },
    { label: 'برتقالي', color: 'bg-[#d97706]', activeColor: 'bg-[#b45309]' },
    { label: 'أزرق', color: 'bg-[#1d4ed8]', activeColor: 'bg-[#1e40af]' },
    { label: 'كحلي', color: 'bg-[#1e3a8a]', activeColor: 'bg-[#172554]' },
    { label: 'أخضر', color: 'bg-[#15803d]', activeColor: 'bg-[#166534]' },
    { label: 'بنفسجي', color: 'bg-[#312e81]', activeColor: 'bg-[#1e1b4b]' },
    { label: 'وردي داكن', color: 'bg-[#831843]', activeColor: 'bg-[#500724]' },
    { label: 'أرجواني', color: 'bg-[#701a75]', activeColor: 'bg-[#4a044e]' },
  ];

  // Open Edit Modal for a Meal
  const handleOpenEditMeal = (catId: string, item: InvoMenuItem) => {
    posAudio.playTap();
    setEditingMeal({ catId, item });
    setMealName(item.name);
    setMealCategoryId(catId);
    setMealPrice(item.price.toString());
    setMealIsFree(item.isFreeOrNoPrice || false);
    setMealHidePriceOnCard(item.isPriceHiddenOnCard || false);
    setMealBorderColor(item.borderColor || 'border-rose-600');
    setMealPrinterId(item.targetPrinterId || 'prn-kitchen');
    setShowAddMealModal(true);
  };

  // Open Add New Meal Modal
  const handleOpenAddMeal = () => {
    posAudio.playTap();
    setEditingMeal(null);
    setMealName('');
    setMealCategoryId(selectedCategoryTab === 'all' ? (categories[0]?.id || 'chicken') : selectedCategoryTab);
    setMealPrice('1.500');
    setMealIsFree(false);
    setMealHidePriceOnCard(false);
    setMealBorderColor('border-rose-600');
    setMealPrinterId('prn-kitchen');
    setShowAddMealModal(true);
  };

  // Save Meal (Add or Update)
  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      alert('يرجى إدخال اسم الوجبة');
      return;
    }

    const priceNum = mealIsFree ? 0 : (parseFloat(mealPrice) || 0);

    const updatedItems = { ...menuItems };

    if (editingMeal) {
      const oldCatId = editingMeal.catId;
      const itemId = editingMeal.item.id;

      // Remove from old category if category changed
      if (oldCatId !== mealCategoryId) {
        updatedItems[oldCatId] = (updatedItems[oldCatId] || []).filter((i) => i.id !== itemId);
      }

      // Updated item object
      const updatedItem: InvoMenuItem = {
        ...editingMeal.item,
        name: mealName.trim(),
        price: priceNum,
        borderColor: mealBorderColor,
        categoryId: mealCategoryId,
        isFreeOrNoPrice: mealIsFree,
        isPriceHiddenOnCard: mealHidePriceOnCard,
        targetPrinterId: mealPrinterId,
        isAvailable: true,
      };

      if (!updatedItems[mealCategoryId]) {
        updatedItems[mealCategoryId] = [];
      }

      if (oldCatId === mealCategoryId) {
        updatedItems[mealCategoryId] = updatedItems[mealCategoryId].map((i) =>
          i.id === itemId ? updatedItem : i
        );
      } else {
        updatedItems[mealCategoryId].push(updatedItem);
      }

      showToast(`تم تحديث وجبة "${mealName}" وتثبيت مكانها بنجاح!`);
    } else {
      // Add new item
      const newItem: InvoMenuItem = {
        id: `itm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: mealName.trim(),
        price: priceNum,
        borderColor: mealBorderColor,
        categoryId: mealCategoryId,
        isFreeOrNoPrice: mealIsFree,
        isPriceHiddenOnCard: mealHidePriceOnCard,
        targetPrinterId: mealPrinterId,
        isAvailable: true,
      };

      if (!updatedItems[mealCategoryId]) {
        updatedItems[mealCategoryId] = [];
      }
      updatedItems[mealCategoryId].push(newItem);
      showToast(`تمت إضافة وجبة "${mealName}" إلى قسم ${categories.find(c => c.id === mealCategoryId)?.name || ''} بنجاح!`);
    }

    posAudio.playSuccess();
    onUpdateMenuItems(updatedItems);
    setShowAddMealModal(false);
  };

  // Quick Move Meal to another Category directly from the card
  const handleQuickMoveCategory = (fromCatId: string, itemId: string, toCatId: string) => {
    if (fromCatId === toCatId) return;
    posAudio.playCardSelect();
    const updated = { ...menuItems };
    const itemToMove = (updated[fromCatId] || []).find((i) => i.id === itemId);
    if (!itemToMove) return;

    // Remove from source
    updated[fromCatId] = (updated[fromCatId] || []).filter((i) => i.id !== itemId);

    // Add to target with updated categoryId
    if (!updated[toCatId]) updated[toCatId] = [];
    updated[toCatId].push({ ...itemToMove, categoryId: toCatId });

    onUpdateMenuItems(updated);
    const targetCatName = categories.find((c) => c.id === toCatId)?.name || toCatId;
    showToast(`تم نقل "${itemToMove.name}" إلى قسم "${targetCatName}" فوراً!`);
  };

  // Quick Toggle Free/No-Price for a Meal
  const handleToggleFreePrice = (catId: string, itemId: string) => {
    posAudio.playTap();
    const updated = { ...menuItems };
    updated[catId] = (updated[catId] || []).map((i) => {
      if (i.id === itemId) {
        const nextFree = !i.isFreeOrNoPrice;
        return {
          ...i,
          isFreeOrNoPrice: nextFree,
          price: nextFree ? 0 : (i.price || 1.500),
        };
      }
      return i;
    });
    onUpdateMenuItems(updated);
    showToast('تم تعديل حالة تسعير الوجبة (بدون سعر / بسعر)');
  };

  // Quick Toggle Hide/Show Price for a Meal on Card
  const handleToggleHidePriceOnCard = (catId: string, itemId: string) => {
    posAudio.playTap();
    const updated = { ...menuItems };
    updated[catId] = (updated[catId] || []).map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          isPriceHiddenOnCard: !i.isPriceHiddenOnCard,
        };
      }
      return i;
    });
    onUpdateMenuItems(updated);
    showToast('تم تعديل ظهور السعر على بطاقة الوجبة للعمال');
  };

  // Quick Inline Price Change
  const handleUpdatePriceQuick = (catId: string, itemId: string, newPriceStr: string) => {
    const val = parseFloat(newPriceStr);
    if (isNaN(val) || val < 0) return;
    const updated = { ...menuItems };
    updated[catId] = (updated[catId] || []).map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          price: val,
          isFreeOrNoPrice: val === 0,
        };
      }
      return i;
    });
    onUpdateMenuItems(updated);
  };

  // Delete Meal
  const handleDeleteMeal = (catId: string, itemId: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف وجبة "${name}" نهائياً من القائمة؟`)) {
      posAudio.playTrash();
      const updated = { ...menuItems };
      updated[catId] = (updated[catId] || []).filter((i) => i.id !== itemId);
      onUpdateMenuItems(updated);
      showToast(`تم حذف وجبة "${name}" بنجاح`);
    }
  };

  // Add New Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('يرجى إدخال اسم القسم');
      return;
    }
    const colorObj = CATEGORY_COLORS.find(c => c.color === newCatColor) || CATEGORY_COLORS[0];
    const catId = `cat-${Date.now()}`;
    const newCat: InvoCategory = {
      id: catId,
      name: newCatName.trim(),
      color: colorObj.color,
      activeColor: colorObj.activeColor,
    };
    onUpdateCategories([...categories, newCat]);
    setShowAddCategoryModal(false);
    setNewCatName('');
    posAudio.playSuccess();
    showToast(`تم إنشاء قسم "${newCat.name}" الجديد بنجاح!`);
    setSelectedCategoryTab(catId);
  };

  // Global Master Toggle for Worker Price Visibility
  const handleSetGlobalHidePrices = (hide: boolean) => {
    posAudio.playTap();
    onUpdateSettings({ hidePricesOnMealButtons: hide });
    showToast(
      hide 
        ? 'تم إخفاء الأسعار من أزرار الوجبات لجميع العمال (عرض الاسم فقط)' 
        : 'تم إظهار الأسعار على أزرار الوجبات لجميع العمال'
    );
  };

  const isGlobalPriceHidden = settings.hidePricesOnMealButtons ?? false;

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      
      {/* 1. Header Banner & Manager Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
            <Utensils className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                إدارة وتعديل قائمة الوجبات والأقسام والأسعار
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                صلاحية المدير العام
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تعديل أسماء الوجبات، إضافة وجبات، نقلها بين الأقسام (لحوم، دجاج، صوصات)، وضبط الأسعار أو جعلها بدون سعر
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              posAudio.playTap();
              setShowAddCategoryModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>إضافة قسم جديد</span>
          </button>

          <button
            onClick={handleOpenAddMeal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة وجبة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Dual Master Control: Show vs Hide Prices for Workers (الزرين المطلوبين تماماً) */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              التحكم في ظهور الأسعار للعمال على أزرار الوجبات
            </h4>
            <p className="text-xs text-slate-400">
              اختر ما إذا كان السعر يظهر للعامل على بطاقة الوجبة في الشاشة الرئيسية، أو إخفاء السعر بحيث يظهر اسم الوجبة فقط (مع بقاء الحساب في السلة)
            </p>
          </div>
        </div>

        {/* The Two Distinct Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {/* Button 1: Show Price to Workers */}
          <button
            onClick={() => handleSetGlobalHidePrices(false)}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              !isGlobalPriceHidden
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40 scale-102'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>إظهار السعر للعمال ✓</span>
          </button>

          {/* Button 2: Hide Price from Meal Name for Workers */}
          <button
            onClick={() => handleSetGlobalHidePrices(true)}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isGlobalPriceHidden
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/40 scale-102'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <EyeOff className="w-4 h-4 stroke-[2.5]" />
            <span>إخفاء السعر عند اسم الوجبة ✕</span>
          </button>
        </div>
      </div>

      {/* 3. Stats & Quick Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 block font-bold">إجمالي الأقسام</span>
          <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">{categories.length} قسم</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 block font-bold">إجمالي الوجبات</span>
          <span className="text-xl font-black text-blue-400 font-mono mt-0.5 block">{allMealsList.length} وجبة</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 block font-bold">وجبات بدون سعر (مجاني)</span>
          <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
            {allMealsList.filter(m => m.item.isFreeOrNoPrice || m.item.price === 0).length}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 block font-bold">وجبات مخفية السعر</span>
          <span className="text-xl font-black text-purple-400 font-mono mt-0.5 block">
            {allMealsList.filter(m => m.item.isPriceHiddenOnCard).length}
          </span>
        </div>
      </div>

      {/* 4. Category Filter Bar (لحوم، دجاج، عيوش، صوصات، حلا، ذبائح، مشروبات، وجبات عاملين، إلخ) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-300">
            تصفح الأقسام والتصنيفات:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {displayedMeals.length} وجبة معروضة
          </span>
        </div>

        {/* Scrollable Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => {
              posAudio.playTap();
              setSelectedCategoryTab('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategoryTab === 'all'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            كل الأقسام ({allMealsList.length})
          </button>

          {categories.map((cat) => {
            const count = (menuItems[cat.id] || []).length;
            const isSelected = selectedCategoryTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  posAudio.playTap();
                  setSelectedCategoryTab(cat.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'ring-2 ring-white text-white shadow-lg ' + cat.activeColor + ' border-transparent'
                    : 'text-slate-300 hover:text-white ' + cat.color + ' border-slate-700/50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Search and Filters */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم (مثال: مضغوط، شواية، لحم، ثومية)..."
            className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterPriceMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterPriceMode === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterPriceMode('priced')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterPriceMode === 'priced' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            مسعرة
          </button>
          <button
            onClick={() => setFilterPriceMode('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterPriceMode === 'free' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            بدون سعر / مجانية
          </button>
        </div>
      </div>

      {/* 6. Meals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedMeals.map(({ catId, catName, item }) => {
          const isFree = item.isFreeOrNoPrice || item.price === 0;
          const isPriceHidden = item.isPriceHiddenOnCard || false;

          return (
            <div
              key={`${catId}-${item.id}`}
              className={`bg-slate-900 border rounded-3xl p-4 shadow-md flex flex-col justify-between transition-all hover:border-slate-600 ${
                item.borderColor ? `border-l-4 ${item.borderColor}` : 'border-slate-800'
              }`}
            >
              <div>
                {/* Top Row: Category Badge + Actions */}
                <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {catName}
                    </span>

                    {/* Quick Move Category Dropdown */}
                    <select
                      value={catId}
                      onChange={(e) => handleQuickMoveCategory(catId, item.id, e.target.value)}
                      className="bg-slate-950 text-[10px] text-slate-300 border border-slate-700 rounded-lg px-2 py-1 cursor-pointer hover:border-amber-500 font-bold"
                      title="نقل الوجبة إلى قسم آخر فوراً"
                    >
                      <option value="" disabled>نقل إلى قسم آخر...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          نقل إلى: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMeal(catId, item)}
                      className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="تعديل بيانات الوجبة بالكامل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(catId, item.id, item.name)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="حذف الوجبة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meal Name & Price Input */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-black text-white">
                    {item.name}
                  </h4>

                  {/* Price Setting Box */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">سعر الوجبة:</span>
                      
                      {isFree ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          بدون سعر (0.000)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 font-mono">OMR</span>
                          <input
                            type="number"
                            step="0.050"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleUpdatePriceQuick(catId, item.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-black text-amber-400 text-center"
                          />
                        </div>
                      )}
                    </div>

                    {/* Quick Button: Toggle Free/No Price */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <button
                        onClick={() => handleToggleFreePrice(catId, item.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border ${
                          isFree
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isFree ? 'إلغاء وجعلها بسعر ↺' : 'جعلها بدون سعر (مجانية)'}
                      </button>

                      {/* Toggle Price Visible on Button for Workers */}
                      <button
                        onClick={() => handleToggleHidePriceOnCard(catId, item.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border flex items-center gap-1 ${
                          isPriceHidden
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="إخفاء السعر عند اسم الوجبة للعمال على الشاشة"
                      >
                        {isPriceHidden ? (
                          <>
                            <EyeOff className="w-3 h-3 text-purple-400" />
                            <span>السعر مخفي بالزر</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>السعر ظاهر بالزر</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom info: Target Printer */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Printer className="w-3 h-3 text-slate-400" />
                  {sectionPrinters.find(p => p.id === item.targetPrinterId)?.name || 'طابعة المطبخ'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {item.borderColor.replace('border-', '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. Modal: Add or Edit Meal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl p-5 text-white animate-in zoom-in-95" dir="rtl">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                {editingMeal ? 'تعديل بيانات الوجبة' : 'إضافة وجبة جديدة للقائمة'}
              </h3>
              <button
                onClick={() => setShowAddMealModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الوجبة</label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="مثال: دجاج شواية مع بشاور عائلي"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  القسم / التصنيف (مكان وضع الوجبة)
                </label>
                <select
                  value={mealCategoryId}
                  onChange={(e) => setMealCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Setup */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">سعر الوجبة (OMR)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="meal-free-check"
                      checked={mealIsFree}
                      onChange={(e) => setMealIsFree(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="meal-free-check" className="text-emerald-400 font-bold cursor-pointer select-none">
                      بدون سعر (0.000)
                    </label>
                  </div>
                </div>

                {!mealIsFree && (
                  <input
                    type="number"
                    step="0.050"
                    min="0"
                    required
                    value={mealPrice}
                    onChange={(e) => setMealPrice(e.target.value)}
                    placeholder="1.500"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-black text-sm"
                  />
                )}
              </div>

              {/* Hide Price on Card Toggle */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold block">إخفاء السعر عند اسم الوجبة للعمال</span>
                  <span className="text-[10px] text-slate-400">يظهر اسم الوجبة فقط على الزر بدون السعر</span>
                </div>
                <input
                  type="checkbox"
                  checked={mealHidePriceOnCard}
                  onChange={(e) => setMealHidePriceOnCard(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Target Printer */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الطابعة الموجه إليها</label>
                <select
                  value={mealPrinterId}
                  onChange={(e) => setMealPrinterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  {sectionPrinters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.section})
                    </option>
                  ))}
                </select>
              </div>

              {/* Border Color */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">لون إطار البطاقة</label>
                <div className="flex items-center gap-2">
                  {BORDER_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setMealBorderColor(col.value)}
                      className={`w-7 h-7 rounded-xl ${col.bg} transition-all cursor-pointer flex items-center justify-center ${
                        mealBorderColor === col.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={col.label}
                    >
                      {mealBorderColor === col.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
                >
                  {editingMeal ? 'حفظ التعديلات' : 'إضافة الوجبة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Add New Custom Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl p-5 text-white animate-in zoom-in-95" dir="rtl">
            <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              إضافة قسم / تصنيف جديد
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              أنشئ قسماً جديداً (مثل: المشاوي، المعجنات، المقبلات، الأسماك)
            </p>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم القسم الجديد</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثال: المشاوي والأسياخ"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">لون القسم</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setNewCatColor(c.color)}
                      className={`h-9 rounded-xl ${c.color} flex items-center justify-center text-white font-bold cursor-pointer transition-transform ${
                        newCatColor === c.color ? 'ring-2 ring-white scale-105 shadow' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {newCatColor === c.color && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
                >
                  إنشاء القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
