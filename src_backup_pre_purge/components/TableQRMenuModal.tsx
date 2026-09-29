import React, { useState } from 'react';
import { 
  Smartphone, 
  QrCode, 
  Printer, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Send, 
  Utensils, 
  Clock, 
  Flame, 
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import { INVO_CATEGORIES, INVO_MENU_ITEMS } from '../data/invoData';

interface TableQRMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOrderToPOS?: (order: any) => void;
  currency?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export const TableQRMenuModal: React.FC<TableQRMenuModalProps> = ({
  isOpen,
  onClose,
  onSendOrderToPOS,
  currency = 'ر.ع'
}) => {
  const [selectedTable, setSelectedTable] = useState<number>(4);
  const [activeCategory, setActiveCategory] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'item-1', name: 'شاورما دجاج صاج عربي', price: 1.500, quantity: 2, notes: 'زيادة ثوم' },
    { id: 'item-2', name: 'بطاطس ودجز حارة', price: 0.800, quantity: 1 }
  ]);
  const [orderSent, setOrderSent] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('أحمد (طاولة 4)');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  // QR Code for the specific table
  const tableUrl = `https://restaurant.menu.app/order?table=${selectedTable}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tableUrl)}`;

  const currentCategoryItems = INVO_MENU_ITEMS[activeCategory] || [];

  const handleAddToCart = (item: any) => {
    posAudio.playTap();
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    posAudio.playTap();
    setCart(prev => {
      return prev.map(ci => {
        if (ci.id === itemId) {
          const newQty = ci.quantity + delta;
          return newQty > 0 ? { ...ci, quantity: newQty } : null;
        }
        return ci;
      }).filter(Boolean) as CartItem[];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSendSelfOrder = () => {
    posAudio.playSuccess();
    setOrderSent(true);

    if (onSendOrderToPOS) {
      onSendOrderToPOS({
        orderNumber: `Order ${Math.floor(68960 + Math.random() * 100)}`,
        tableName: `طاولة ${selectedTable}`,
        customerName: customerName,
        items: cart.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          selected: true
        })),
        total: totalAmount,
        status: 'open',
        createdAt: Date.now()
      });
    }

    setTimeout(() => {
      setOrderSent(false);
      setCart([]);
    }, 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-5xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                منيو الطاولة الرقمي والطلب الذاتي (QR Self-Order)
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                  Digital Menu Engine
                </span>
              </h2>
              <p className="text-slate-400 text-xs">توليد كود QR لكل طاولة ومحاكاة تجربة طلب الزبون المباشرة من الجوال</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Split Left Table QR Print / Right Phone Simulator */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0f172a]">
          
          {/* Left Column: Table Selection & QR Card Generator (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/80 space-y-4">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>اختر الطاولة لتوليد الـ QR الخاص بها:</span>
              </h3>

              {/* Tables grid */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      posAudio.playTap();
                      setSelectedTable(num);
                    }}
                    className={`py-2 rounded-xl font-black text-xs transition-all border ${
                      selectedTable === num
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    طاولة {num}
                  </button>
                ))}
              </div>

              {/* Printable Table Stand Acrylic Card Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                  <Utensils className="w-6 h-6" />
                </div>
                
                <h4 className="text-white font-black text-base">مطعم ومقهى نكهة الشرق</h4>
                <p className="text-indigo-400 font-bold text-xs mt-0.5">امسح الكود واطلب من جوالك مباشرة</p>
                
                <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-slate-800 my-4">
                  <img 
                    src={qrUrl} 
                    alt={`Table ${selectedTable} QR Code`} 
                    className="w-36 h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="bg-indigo-950/80 border border-indigo-600/50 px-4 py-1.5 rounded-full text-indigo-200 font-black text-sm">
                  طاولة رقم ({selectedTable})
                </div>
                
                <p className="text-[10px] text-slate-400 font-mono mt-2">
                  {tableUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    posAudio.playTap();
                    navigator.clipboard?.writeText(tableUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط الطاولة'}</span>
                </button>
                <button
                  onClick={() => {
                    posAudio.playTap();
                    alert(`جاري إرسال تصميم استيكر طاولة ${selectedTable} إلى طابعة الملصقات...`);
                  }}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة الأكريليك</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Phone Interactive Simulator (7 Cols) */}
          <div className="lg:col-span-7 flex justify-center items-start">
            <div className="w-full max-w-[380px] bg-[#000000] p-3 rounded-[36px] shadow-2xl border-4 border-slate-700 ring-4 ring-black/40 flex flex-col">
              
              {/* Phone Notch / Speaker */}
              <div className="h-4 flex items-center justify-center mb-1">
                <div className="w-20 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
              </div>

              {/* Phone Screen Container */}
              <div className="bg-[#0f172a] rounded-[24px] overflow-hidden flex flex-col h-[560px] border border-slate-800 text-slate-100">
                
                {/* Mobile Header */}
                <div className="bg-[#1e293b] p-3 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                      🍽️
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-white">منيو الطلب الذاتي</h5>
                      <span className="text-[10px] text-amber-400 font-bold">طاولة {selectedTable} • صالة العوائل</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold">
                    مفتوح للطلب
                  </span>
                </div>

                {/* Categories Bar */}
                <div className="bg-slate-900/90 p-2 flex gap-1.5 overflow-x-auto border-b border-slate-800 scrollbar-none">
                  {INVO_CATEGORIES.slice(0, 5).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                        activeCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 shadow font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Menu Items List inside Phone */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {currentCategoryItems.map(item => (
                    <div 
                      key={item.id}
                      className="bg-[#1e293b] p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <h6 className="font-bold text-xs text-white truncate">{item.name}</h6>
                        <p className="text-amber-400 font-mono font-bold text-xs mt-0.5">
                          {item.price.toFixed(3)} {currency}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow active:scale-90 transition-transform cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart & Checkout Footer inside Phone */}
                <div className="bg-[#1e293b] p-3 border-t border-slate-700/80 space-y-2">
                  {orderSent ? (
                    <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-center text-emerald-300 font-bold text-xs space-y-1 animate-in zoom-in-95">
                      <div className="flex items-center justify-center gap-1.5 text-sm font-black">
                        <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                        <span>تم إرسال طلبك للكاشير والمطبخ بنجاح!</span>
                      </div>
                      <p className="text-[10px] text-emerald-400/80">رقم الطلب #68962 • جاري التحضير الآن</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">عدد الأصناف: <b className="text-white">{cart.reduce((a, c) => a + c.quantity, 0)}</b></span>
                        <span className="text-slate-400">الإجمالي: <b className="text-amber-400 font-mono text-sm">{totalAmount.toFixed(3)} {currency}</b></span>
                      </div>

                      <button
                        disabled={cart.length === 0}
                        onClick={handleSendSelfOrder}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                          cart.length > 0
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>تأكيد وإرسال الطلب للمطبخ والكاشير</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            نظام مسح المنيو بدون الحاجة لتثبيت أي تطبيق على جوال العميل
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
