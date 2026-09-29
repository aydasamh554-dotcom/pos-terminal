import React, { useState } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Check, 
  Search, 
  Tag, 
  DollarSign, 
  Printer, 
  Palette,
  ShieldCheck,
  Image
} from 'lucide-react';
import { INVO_CATEGORIES } from '../data/invoData';
import { posAudio } from '../utils/audio';
import { Employee } from '../types';

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  borderColor: string;
  targetPrinterId?: string;
  description?: string;
  image?: string;
  isAvailable?: boolean;
}

export type MenuItemsMap = Record<string, MenuItemData[]>;

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemsMap: MenuItemsMap;
  onSaveMenuItemsMap: (updatedMap: MenuItemsMap) => void;
  currentEmployee?: Employee;
}

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({
  isOpen,
  onClose,
  menuItemsMap,
  onSaveMenuItemsMap,
  currentEmployee,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Edit & Add Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>(activeCategory);
  
  // Form fields
  const [itemName, setItemName] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [itemBorderColor, setItemBorderColor] = useState<string>('border-rose-500');
  const [itemPrinter, setItemPrinter] = useState<string>('prn-kitchen');
  const [itemImage, setItemImage] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemIsAvailable, setItemIsAvailable] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  const currentCategoryItems = menuItemsMap[activeCategory] || [];
  
  const filteredItems = currentCategoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    posAudio.playTap();
    setEditingItem(null);
    setEditingCategory(activeCategory);
    setItemName('');
    setItemPrice('1.500');
    setItemBorderColor('border-rose-500');
    setItemPrinter(activeCategory === 'drinks' ? 'prn-bar' : activeCategory === 'sweets' ? 'prn-bakery' : 'prn-kitchen');
    setItemImage('');
    setItemDescription('');
    setItemIsAvailable(true);
    setFormError('');
    setIsEditing(true);
  };

  const handleOpenEditModal = (item: MenuItemData) => {
    posAudio.playTap();
    setEditingItem(item);
    setEditingCategory(activeCategory);
    setItemName(item.name);
    setItemPrice(item.price.toFixed(3));
    setItemBorderColor(item.borderColor || 'border-rose-500');
    setItemPrinter(item.targetPrinterId || 'prn-kitchen');
    setItemImage(item.image || '');
    setItemDescription(item.description || '');
    setItemIsAvailable(item.isAvailable !== false);
    setFormError('');
    setIsEditing(true);
  };

  const handleDeleteItem = (itemId: string) => {
    posAudio.playTrash();
    const updatedCategoryItems = (menuItemsMap[activeCategory] || []).filter(it => it.id !== itemId);
    const updatedMap = {
      ...menuItemsMap,
      [activeCategory]: updatedCategoryItems,
    };
    onSaveMenuItemsMap(updatedMap);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setFormError('يرجى إدخال اسم الوجبة');
      return;
    }
    const parsedPrice = parseFloat(itemPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('يرجى إدخال سعر صحيح');
      return;
    }

    posAudio.playSuccess();

    const newOrUpdatedItem: MenuItemData = {
      id: editingItem ? editingItem.id : `dish-${Date.now()}`,
      name: itemName.trim(),
      price: parsedPrice,
      borderColor: itemBorderColor,
      targetPrinterId: itemPrinter,
      image: itemImage.trim() || undefined,
      description: itemDescription.trim() || undefined,
      isAvailable: itemIsAvailable,
    };

    let updatedMap = { ...menuItemsMap };

    if (editingItem) {
      // If category changed
      if (editingCategory !== activeCategory) {
        // Remove from old category
        updatedMap[activeCategory] = (updatedMap[activeCategory] || []).filter(i => i.id !== editingItem.id);
        // Add to new category
        updatedMap[editingCategory] = [...(updatedMap[editingCategory] || []), newOrUpdatedItem];
      } else {
        // Update in place
        updatedMap[activeCategory] = (updatedMap[activeCategory] || []).map(i => 
          i.id === editingItem.id ? newOrUpdatedItem : i
        );
      }
    } else {
      // Add new
      updatedMap[editingCategory] = [...(updatedMap[editingCategory] || []), newOrUpdatedItem];
    }

    onSaveMenuItemsMap(updatedMap);
    setIsEditing(false);
  };

  const COLOR_OPTIONS = [
    { label: 'أحمر', class: 'border-rose-600', bg: 'bg-rose-500' },
    { label: 'أزرق', class: 'border-blue-500', bg: 'bg-blue-500' },
    { label: 'أخضر', class: 'border-emerald-500', bg: 'bg-emerald-500' },
    { label: 'برتقالي', class: 'border-amber-500', bg: 'bg-amber-500' },
    { label: 'بنفسجي', class: 'border-purple-600', bg: 'bg-purple-500' },
    { label: 'وردي', class: 'border-fuchsia-600', bg: 'bg-fuchsia-500' },
    { label: 'سماوي', class: 'border-sky-500', bg: 'bg-sky-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[90vh] max-h-[800px] overflow-hidden font-cairo">
        
        {/* Header */}
        <div className="p-4 bg-[#1e293b] text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
                <span>إدارة وتعديل قائمة الطعام والوجبات</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                  تعديل وتسجيل حقيقي
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                إضافة وجبات جديدة، تعديل الأسعار، الأقسام، وتخصيص الطابعات
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Right Side: Categories Navigation */}
          <div className="w-52 bg-slate-50 border-l border-slate-200 p-2 overflow-y-auto space-y-1 shrink-0">
            <div className="text-[11px] font-black text-slate-500 px-2 py-1">
              أقسام قائمة الطعام:
            </div>
            {INVO_CATEGORIES.map((cat) => {
              const count = (menuItemsMap[cat.id] || []).length;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    posAudio.playTap();
                    setActiveCategory(cat.id);
                  }}
                  className={`w-full p-2 rounded-xl text-right font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                    <span>{cat.name}</span>
                  </div>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Left Side: Meals Table & Search */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الوجبات..."
                  className="w-full pl-3 pr-9 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة وجبة جديدة</span>
              </button>
            </div>

            {/* Meals List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <UtensilsCrossed className="w-12 h-12 stroke-1 mb-2" />
                  <p className="font-bold text-sm">لا توجد وجبات في هذا القسم</p>
                  <button
                    onClick={handleOpenAddModal}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    أضف أول وجبة
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl bg-white border-2 ${item.borderColor || 'border-slate-200'} shadow-xs hover:shadow-md transition-all flex items-center justify-between`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-slate-900">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-emerald-600 text-sm">
                            OMR {item.price.toFixed(3)}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.targetPrinterId === 'prn-bar' ? 'طابعة المشروبات' : item.targetPrinterId === 'prn-bakery' ? 'طابعة المخبز' : 'طابعة المطبخ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-blue-200"
                          title="تعديل الوجبة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-rose-200"
                          title="حذف الوجبة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit / Add Meal Modal Overlay */}
        {isEditing && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                  <span>{editingItem ? 'تعديل بيانات الوجبة' : 'إضافة وجبة جديدة'}</span>
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الوجبة / الصنف:</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="مثال: مضغوط دجاج مخصوص..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">السعر (OMR):</label>
                    <input
                      type="number"
                      step="0.050"
                      min="0"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسم / التصنيف:</label>
                    <select
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    >
                      {INVO_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط صورة الوجبة (للمنيو أونلاين):</label>
                  <input
                    type="url"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... رابط الصورة"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 text-left"
                    dir="ltr"
                  />
                  {itemImage && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={itemImage} 
                        alt="معاينة" 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <span className="text-[11px] text-slate-500">معاينة الصورة</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وصف الصنف للعميل:</label>
                  <textarea
                    rows={2}
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="مكونات الوجبة وتفاصيلها..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">حالة الصنف</p>
                    <p className="text-[10px] text-slate-500">متوفر للطلب في الكاشير والمنيو أونلاين</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemIsAvailable}
                      onChange={(e) => setItemIsAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طابعة القسم (KDS / Kitchen):</label>
                  <select
                    value={itemPrinter}
                    onChange={(e) => setItemPrinter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="prn-kitchen">طابعة المطبخ الرئيسي</option>
                    <option value="prn-bar">طابعة البار والمشروبات</option>
                    <option value="prn-bakery">طابعة المخبز والأفران</option>
                    <option value="prn-cashier">طابعة الكاشير</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">لون الإطار في شاشة الكاشير:</label>
                  <div className="flex items-center gap-2 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.class}
                        onClick={() => setItemBorderColor(c.class)}
                        className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center cursor-pointer transition-all ${
                          itemBorderColor === c.class ? 'ring-3 ring-blue-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                      >
                        {itemBorderColor === c.class && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    type="submit"
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'حفظ التعديلات' : 'إضافة الوجبة'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
