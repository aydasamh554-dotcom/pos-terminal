import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Utensils, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  X, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  Share2, 
  Send, 
  ChevronRight, 
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import { INVO_CATEGORIES } from '../data/invoData';
import { InvoMenuItem, POSSettings } from '../types';

interface CustomerOnlineMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemsMap: Record<string, InvoMenuItem[]>;
  settings: POSSettings;
  onSendCustomerOrder: (order: {
    customerName: string;
    customerPhone: string;
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      notes?: string;
    }>;
    total: number;
  }) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

export const CustomerOnlineMenu: React.FC<CustomerOnlineMenuProps> = ({
  isOpen,
  onClose,
  menuItemsMap,
  settings,
  onSendCustomerOrder,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState<boolean>(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderType, setOrderType] = useState<'takeaway' | 'dine_in' | 'delivery'>('takeaway');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Selected item modal for viewing details
  const [viewingItem, setViewingItem] = useState<InvoMenuItem | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState<string>('');

  if (!isOpen) return null;

  // Filtered items
  const categoryItems = menuItemsMap[activeCategory] || [];
  const displayedItems = categoryItems.filter(item => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddToCart = (item: InvoMenuItem, customNotes: string = '') => {
    if (item.isAvailable === false) return;
    posAudio.playTap();
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.id === item.id && (ci.notes || '') === customNotes);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        notes: customNotes
      }];
    });
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    posAudio.playTap();
    setCart(prev => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, idx) => idx !== index);
      }
      item.quantity = newQty;
      return next;
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('يرجى إدخال اسمك الكريم لتسجيل الطلب');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('يرجى كتابة رقم الجوال لتأكيد استلام الطلب');
      return;
    }
    if (orderType === 'dine_in' && !tableNumber.trim()) {
      setFormError('يرجى كتابة رقم الطاولة المتواجد عليها في الصالة');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setFormError('يرجى كتابة عنوان التوصيل بالتفصيل');
      return;
    }
    if (cart.length === 0) {
      setFormError('سلة المشتريات فارغة! اختر بعض الوجبات أولاً');
      return;
    }

    setFormError('');
    posAudio.playSuccess();

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber.trim() : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      notes: generalNotes.trim() || undefined,
      items: cart.map(ci => ({
        id: ci.id,
        name: ci.name,
        price: ci.price,
        quantity: ci.quantity,
        notes: ci.notes,
      })),
      total: cartTotal,
    };

    onSendCustomerOrder(orderPayload);
    setLastOrderDetails(orderPayload);
    setOrderSentSuccess(true);
    setCart([]);
  };

  const currentWebUrl = window.location.href.split('?')[0];
  const shareText = `قائمة طعام ${settings.restaurantName} - تفضل بطلب وجبتك مباشرة عبر الرابط: ${currentWebUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentWebUrl);
    posAudio.playTap();
    alert('تم نسخ رابط منيو المتجر بنجاح! شاركه مع زبائنك عبر الواتساب أو التواصل الاجتماعي.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-150">
      {/* Top Navigation & Store Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-500/20">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">{settings.restaurantName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  مفتوح للطلب الآن
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {settings.restaurantBranch} • {settings.restaurantAddress || 'قائمة الطعام والطلب المباشر'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              title="نسخ ومشاركة رابط المنيو"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">مشاركة الرابط</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer relative"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>السلة</span>
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-black">
                  {cartItemCount}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="إغلاق والعودة لنظام الكاشير"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 max-w-4xl w-full mx-auto space-y-4">
        {/* Search Bar & Banner */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن وجبتك المفضلة (شاورما، لحم، عيوش، عصائر...)"
            className="w-full pl-4 pr-10 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {INVO_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const itemsCount = (menuItemsMap[cat.id] || []).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  posAudio.playTap();
                  setActiveCategory(cat.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {itemsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Food Items Grid with Photos and Fast Add */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {displayedItems.map((item) => {
            const isAvailable = item.isAvailable !== false;
            const cartQty = cart.filter(ci => ci.id === item.id).reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={item.id}
                className={`bg-slate-800/90 rounded-3xl border border-slate-700/70 overflow-hidden shadow-md flex flex-col justify-between hover:border-slate-500 transition-all ${
                  !isAvailable ? 'opacity-60 grayscale' : ''
                }`}
              >
                {/* Meal Image */}
                <div 
                  onClick={() => setViewingItem(item)}
                  className="relative h-36 bg-slate-900 cursor-pointer overflow-hidden group"
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 gap-2">
                      <Utensils className="w-8 h-8 opacity-40 text-blue-400" />
                      <span className="text-[11px] font-medium text-slate-400">صورة الوجبة الشهية</span>
                    </div>
                  )}

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-xl">
                        نفدت الكمية اليوم
                      </span>
                    </div>
                  )}

                  {cartQty > 0 && (
                    <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black shadow-lg">
                      {cartQty} في السلة
                    </div>
                  )}
                </div>

                {/* Meal Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-sm font-black text-white leading-snug">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-amber-400 font-mono-num">
                        {item.price.toFixed(3)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {settings.currency || 'ر.ع'}
                      </span>
                    </div>

                    {isAvailable ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-rose-400 font-bold">غير متوفر</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayedItems.length === 0 && (
          <div className="p-12 text-center bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl space-y-2">
            <Utensils className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">لا توجد وجبات متطابقة مع البحث في هذا القسم</p>
            <p className="text-xs text-slate-500">جرب كتابة اسم صنف آخر أو تصفح بقية الأقسام في الأعلى</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {cart.length > 0 && !isCartOpen && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                {cartItemCount}
              </div>
              <div>
                <span className="text-xs text-slate-400">إجمالي الوجبات المختارة:</span>
                <div className="text-base font-black text-amber-400 font-mono-num">
                  {cartTotal.toFixed(3)} {settings.currency || 'ر.ع'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
            >
              <span>متابعة الطلب وإتمام الحجز</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Item Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">{viewingItem.name}</h3>
              <button 
                onClick={() => setViewingItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingItem.image && (
              <img 
                src={viewingItem.image} 
                alt={viewingItem.name} 
                className="w-full h-48 object-cover rounded-2xl border border-slate-700" 
              />
            )}

            {viewingItem.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                {viewingItem.description}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                ملاحظات خاصة للطهي (اختياري)
              </label>
              <input
                type="text"
                value={itemNoteInput}
                onChange={(e) => setItemNoteInput(e.target.value)}
                placeholder="مثال: بدون بصل، زيادة شطة، صوص جانبي..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-base font-black text-amber-400 font-mono-num">
                {viewingItem.price.toFixed(3)} {settings.currency || 'ر.ع'}
              </div>

              <button
                onClick={() => {
                  handleAddToCart(viewingItem, itemNoteInput.trim());
                  setItemNoteInput('');
                  setViewingItem(null);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة إلى سلة الطلبات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl text-white">
            {/* Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black">سلة طلبك الكريم وتأكيد الإرسال</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {/* Cart Items List */}
              <div className="space-y-2">
                {cart.map((ci, idx) => (
                  <div key={`${ci.id}-${idx}`} className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{ci.name}</h4>
                      {ci.notes && (
                        <p className="text-[10px] text-amber-400">ملاحظة: {ci.notes}</p>
                      )}
                      <span className="text-xs font-black text-amber-400 font-mono-num">
                        {(ci.price * ci.quantity).toFixed(3)} {settings.currency || 'ر.ع'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700">
                      <button
                        onClick={() => handleUpdateCartQuantity(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300"
                      >
                        -
                      </button>
                      <span className="font-mono-num font-bold text-xs text-white px-1">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQuantity(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-blue-400">بيانات استلام الطلب</h4>

                {formError && (
                  <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Order Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'takeaway', label: 'سفري واستلام' },
                    { id: 'dine_in', label: 'محلي بالصالة' },
                    { id: 'delivery', label: 'توصيل للمنزل' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setOrderType(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        orderType === t.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">الاسم الكريم *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: صالح اليمني"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم الجوال *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9XXXXXXX"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono-num focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {orderType === 'dine_in' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم الطاولة المتواجد عليها *</label>
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="مثال: طاولة 4 / كابينة 2"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">عنوان التوصيل بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="مثال: الحيل الجنوبية - قرب المسجد - فيلا 12"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">ملاحظة عامة على الفاتورة</label>
                  <input
                    type="text"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="مثال: نرجو تجهيز الطلب الساعة 8:30 تماماً"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Footer Submit */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">إجمالي الحساب:</span>
                    <div className="text-lg font-black text-amber-400 font-mono-num">
                      {cartTotal.toFixed(3)} {settings.currency || 'ر.ع'}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>تأكيد وإرسال الطلب للكاشير</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Order Confirmation Modal */}
      {orderSentSuccess && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 w-full max-w-md text-center space-y-4 shadow-2xl text-white">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">تم إرسال طلبك بنجاح للمطعم!</h3>
              <p className="text-xs text-slate-300 mt-1">
                وصل الطلب فوراً إلى كاشير {settings.restaurantName} وشاشة المطبخ، وبدأ فريق العمل بتجهيز وجبتك بكل حب وإتقان.
              </p>
            </div>

            {lastOrderDetails && (
              <div className="bg-slate-800/80 p-4 rounded-2xl text-right text-xs space-y-2 border border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم العميل:</span>
                  <strong className="text-white">{lastOrderDetails.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم الجوال:</span>
                  <strong className="text-emerald-400 font-mono-num">{lastOrderDetails.customerPhone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نوع الطلب:</span>
                  <strong className="text-blue-400">
                    {lastOrderDetails.orderType === 'dine_in' ? `محلي (${lastOrderDetails.tableNumber})` :
                     lastOrderDetails.orderType === 'delivery' ? `توصيل (${lastOrderDetails.deliveryAddress})` : 'سفري'}
                  </strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700">
                  <span className="text-slate-400">المجموع المطلوب:</span>
                  <strong className="text-amber-400 font-mono-num font-bold">
                    {lastOrderDetails.total.toFixed(3)} {settings.currency || 'ر.ع'}
                  </strong>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setOrderSentSuccess(false);
                setIsCartOpen(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              تم وموافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
