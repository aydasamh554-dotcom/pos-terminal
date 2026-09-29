import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Printer, 
  ExternalLink, 
  Copy, 
  Check, 
  Smartphone, 
  Sparkles, 
  Utensils, 
  ChefHat, 
  ShoppingBag,
  Plus,
  Minus
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import { RestaurantTable } from '../types';
import { INVO_CATEGORIES, INVO_MENU_ITEMS } from '../data/invoData';

interface TableInstantQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  sectionName?: string;
  currency?: string;
  onOrderSubmitted?: (tableName: string, items: any[]) => void;
}

export const TableInstantQRModal: React.FC<TableInstantQRModalProps> = ({
  isOpen,
  onClose,
  table,
  sectionName = 'الصالة العامة',
  currency = 'ر.ع',
  onOrderSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'qr_card' | 'customer_mobile'>('qr_card');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeMenuCat, setActiveMenuCat] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [customerCart, setCustomerCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([
    { id: 'chk-1', name: 'مضغوط دجاج', price: 1.900, qty: 1 },
    { id: 'rc-1', name: 'عيش زربيان', price: 0.800, qty: 1 }
  ]);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<boolean>(false);

  if (!isOpen || !table) return null;

  const tableIdOrName = encodeURIComponent(table.name);
  const tableOrderUrl = `https://restaurant.menu.app/order?table=${tableIdOrName}&section=${encodeURIComponent(sectionName)}&id=${table.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableOrderUrl)}&margin=10`;

  const handleCopyLink = () => {
    posAudio.playTap();
    navigator.clipboard.writeText(tableOrderUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCard = () => {
    posAudio.playCash();
    window.print();
  };

  const currentCategoryItems = INVO_MENU_ITEMS[activeMenuCat] || [];
  const cartTotal = customerCart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    posAudio.playTap();
    setCustomerCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    posAudio.playTap();
    setCustomerCart(prev => {
      return prev
        .map(i => i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0);
    });
  };

  const handleSubmitMobileOrder = () => {
    if (customerCart.length === 0) return;
    posAudio.playChefBell();
    setOrderPlacedSuccess(true);
    if (onOrderSubmitted) {
      onOrderSubmitted(table.name, customerCart);
    }
    setTimeout(() => {
      setOrderPlacedSuccess(false);
    }, 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-black text-base sm:text-lg flex items-center gap-2">
                <span>باركود وقائمة الطلب الذاتي: {table.name}</span>
                {table.isVip && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    VIP
                  </span>
                )}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                القسم: <span className="text-indigo-300 font-semibold">{sectionName}</span> • السعة: {table.capacity} أشخاص
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-900/60 p-2.5 border-b border-slate-800 flex items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('qr_card');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'qr_card'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>بطاقة الـ QR الأكريليك للطاولة</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('customer_mobile');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'customer_mobile'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>محاكي طلب العميل المباشر من الجوال</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          
          {/* 1. QR STAND CARD & PRINT PREVIEW */}
          {activeTab === 'qr_card' && (
            <div className="flex flex-col items-center gap-6">
              {/* Stand Visual Preview */}
              <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-indigo-500/40 shadow-2xl flex flex-col items-center text-center text-white">
                {/* Brand Badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-2xl font-black tracking-tighter text-white lowercase">invo</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs text-indigo-300 font-bold mr-1">مطعم فاخر</span>
                </div>

                <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-3 py-1 text-xs text-indigo-200 font-bold mb-3">
                  {sectionName}
                </div>

                <h3 className="text-xl font-black text-amber-400 mb-1">
                  {table.name}
                </h3>
                <p className="text-xs text-slate-300 mb-4 font-medium">
                  امسح الباركود بكاميرا جوالك واطلب فوراُ بدون انتظار
                </p>

                {/* The QR Image */}
                <div className="bg-white p-3.5 rounded-2xl shadow-xl border-4 border-slate-800 relative group">
                  <img 
                    src={qrImageUrl} 
                    alt={`QR Code for ${table.name}`}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-indigo-500/60 flex items-center justify-center text-white shadow-lg">
                      <Utensils className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span>Self-Ordering Digital Table Menu</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrintCard}
                  className="h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة ستيكر الطاولة</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>نسخ رابط الطلب</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. LIVE CUSTOMER MOBILE SIMULATOR */}
          {activeTab === 'customer_mobile' && (
            <div className="flex flex-col items-center">
              {/* Phone Mockup */}
              <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 border-4 border-slate-700 shadow-2xl flex flex-col text-slate-100 overflow-hidden min-h-[520px]">
                {/* Phone Speaker & Notch */}
                <div className="w-full flex justify-center pb-2">
                  <div className="w-20 h-3 bg-slate-800 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  </div>
                </div>

                {/* Mobile App Header */}
                <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 mb-2 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-white">منيو الطلب الذكي</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">مباشر</span>
                    </div>
                    <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                      {table.name} ({sectionName})
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Category Slider inside phone */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2">
                  {INVO_CATEGORIES.slice(0, 6).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        posAudio.playTap();
                        setActiveMenuCat(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeMenuCat === cat.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Menu items inside phone */}
                <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56 pr-0.5 scrollbar-thin">
                  {currentCategoryItems.map(item => {
                    const inCart = customerCart.find(c => c.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        className="bg-slate-800/70 hover:bg-slate-800 p-2 rounded-xl border border-slate-700/60 flex items-center justify-between transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                          <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                            {item.price.toFixed(3)} {currency}
                          </p>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-indigo-500/40">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-white px-1">{inCart.qty}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إضافة</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Cart & Order Submission */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  {orderPlacedSuccess ? (
                    <div className="bg-emerald-600/20 border border-emerald-500/50 rounded-xl p-2.5 text-center text-emerald-300 animate-in zoom-in-95">
                      <p className="font-black text-xs">تم إرسال طلبك إلى المطبخ والكاشير بنجاح!</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">جاري تحضير طلب الطاولة {table.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">الإجمالي ({customerCart.reduce((s, i) => s + i.qty, 0)} أصناف)</span>
                        <p className="text-sm font-black text-emerald-400">{cartTotal.toFixed(3)} {currency}</p>
                      </div>

                      <button
                        onClick={handleSubmitMobileOrder}
                        disabled={customerCart.length === 0}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                          customerCart.length > 0
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>إرسال الطلب للمطبخ</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            تحديث الـ QR فوري ودائم لجميع الصالات والغرف
          </span>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
