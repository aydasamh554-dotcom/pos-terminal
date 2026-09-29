import React, { useState, useEffect } from 'react';
import { 
  OrderType, 
  MenuItem, 
  CartItem, 
  RestaurantTable, 
  Order, 
  POSSettings 
} from '../types';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/mockData';
import { posAudio } from '../utils/audio';
import { 
  Utensils, 
  Bike, 
  ShoppingBag, 
  Car, 
  ArrowRight, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Check, 
  X,
  Clock,
  LayoutGrid,
  Sparkles,
  SlidersHorizontal,
  FileText,
  Percent,
  User,
  Phone,
  CreditCard,
  Banknote,
  Send,
  Users,
  CheckCircle2,
  Receipt,
  ArrowLeft,
  Hourglass,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Home,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export interface SavedOrder {
  id: number | string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  status: 'pending' | 'paid'; // معلقة لم تدفع بعد، أو مدفوعة
  date: string;
  paymentMethod?: 'cash' | 'transfer' | 'visa';
  customerName?: string;
  tableName?: string;
  orderType: OrderType;
  splitCount?: number;
}

interface WorkerPin {
  id: string;
  name: string;
  role: string;
  code: string;
}

interface OrderingScreenProps {
  orderType: OrderType;
  selectedTable?: RestaurantTable;
  onBackToMain: () => void;
  onOpenTableModal: () => void;
  onCheckout: (orderData: Partial<Order>) => void;
  settings: POSSettings;
  activeOrdersCount: number;
  onOpenActiveOrders: () => void;
}

export const OrderingScreen: React.FC<OrderingScreenProps> = ({
  orderType,
  selectedTable,
  onBackToMain,
  onOpenTableModal,
  onCheckout,
  settings,
  activeOrdersCount,
  onOpenActiveOrders,
}) => {
  // Navigation / Screen mode: 'menu' | 'invoice' | 'orders' | 'admin' | 'split_view'
  const [activeScreen, setActiveScreen] = useState<'menu' | 'invoice' | 'orders' | 'admin' | 'split_view'>('menu');
  
  // Categories & Menu
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPricesOnMenuButtons, setShowPricesOnMenuButtons] = useState<boolean>(false);

  // قائمة الكادر والعمال وكلمات السر الخاصة بهم (يديرها المدير)
  const [workersList, setWorkersList] = useState<WorkerPin[]>([
    { id: '104', name: 'أحمد السعيد', role: 'كاشير رئيسي', code: '1234' },
    { id: '105', name: 'محمد الغامدي', role: 'كاشير مسائي', code: '2233' },
    { id: '101', name: 'فهد المنصور', role: 'مدير فرع', code: '5544' },
  ]);
  const [newWorkerName, setNewWorkerName] = useState<string>('');
  const [newWorkerId, setNewWorkerId] = useState<string>('');
  const [newWorkerRole, setNewWorkerRole] = useState<string>('كاشير');
  const [newWorkerCode, setNewWorkerCode] = useState<string>('1122');
  const [showAddWorkerForm, setShowAddWorkerForm] = useState<boolean>(false);

  // Cart and selection state
  const [cart, setCart] = useState<CartItem[]>([
    {
      cartId: 'c-init-1',
      menuItem: MENU_ITEMS[0],
      quantity: 2,
      selectedModifiers: [],
      notes: 'كيندا حار',
      itemTotal: 1.900 * 2,
    },
    {
      cartId: 'c-init-2',
      menuItem: MENU_ITEMS[1],
      quantity: 2,
      selectedModifiers: [],
      notes: '',
      itemTotal: 0.500 * 2,
    },
    {
      cartId: 'c-init-3',
      menuItem: MENU_ITEMS.find(m => m.name === 'روب خيار') || MENU_ITEMS[0],
      quantity: 2,
      selectedModifiers: [],
      notes: '',
      itemTotal: 0.500 * 2,
    },
  ]);

  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(0);
  const [noteInput, setNoteInput] = useState<string>('بدون بصل');
  const [noteSuccessToast, setNoteSuccessToast] = useState<boolean>(false);

  // Payment & Bill Split state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'visa'>('cash');
  const [splitCount, setSplitCount] = useState<number>(1);

  // قائمة الطلبات المحفوظة (المعلقة والمدفوعة)
  const [ordersList, setOrdersList] = useState<SavedOrder[]>([
    {
      id: 101,
      items: [
        {
          cartId: 's-1',
          menuItem: MENU_ITEMS[2],
          quantity: 2,
          selectedModifiers: [],
          notes: 'حار سبايسي',
          itemTotal: 3.000,
        },
        {
          cartId: 's-2',
          menuItem: MENU_ITEMS[4],
          quantity: 1,
          selectedModifiers: [],
          notes: '',
          itemTotal: 1.900,
        }
      ],
      total: 4.900,
      subtotal: 4.900,
      tax: 0,
      discount: 0,
      deliveryFee: 0,
      status: 'pending',
      date: '12:45 م',
      orderType: 'dine_in',
      tableName: 'T-02',
      customerName: 'طاولة 2 (صالة عوائل)',
    },
    {
      id: 102,
      items: [
        {
          cartId: 's-3',
          menuItem: MENU_ITEMS[3],
          quantity: 1,
          selectedModifiers: [],
          notes: 'زيادة ثوم',
          itemTotal: 1.500,
        }
      ],
      total: 1.500,
      subtotal: 1.500,
      tax: 0,
      discount: 0,
      deliveryFee: 0,
      status: 'paid',
      date: '12:30 م',
      paymentMethod: 'cash',
      orderType: 'takeaway',
      customerName: 'عميل سفري سريع',
    }
  ]);

  // Alert/Toast state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick note presets
  const quickNotes = [
    'بدون بصل',
    'حار / سبايسي 🔥',
    'زيادة صوص ثوم',
    'شطة إضافية',
    'سفري معزول',
    'مستوي زيادة',
    'بدون ملح',
    'خبز إضافي',
  ];

  // Options Modal State
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [carDetails, setCarDetails] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Print Feedback Toast State
  const [showPrintToast, setShowPrintToast] = useState(false);

  const handleDirectPrint = () => {
    setShowPrintToast(true);
    showToast('جاري طباعة الفاتورة للطابعة الحرارية', 'تم إرسال أمر الطباعة بنجاح 🖨️', 'success');
    setTimeout(() => {
      setShowPrintToast(false);
    }, 2500);
  };

  // Synchronize note input when selection changes
  useEffect(() => {
    if (selectedItemIndex !== null && cart[selectedItemIndex]) {
      setNoteInput(cart[selectedItemIndex].notes || '');
    }
  }, [selectedItemIndex]);

  // Filter menu items
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const rawSubtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const tax = subtotal * (settings.vatRate || 0);
  const deliveryFee = orderType === 'delivery' && cart.length > 0 ? 1.500 : 0;
  const total = subtotal + tax + deliveryFee;
  const perPersonAmount = splitCount > 0 ? total / splitCount : total;

  // Add Item to cart
  const addToCart = (product: MenuItem) => {
    posAudio.playAddItem();
    const existingIndex = cart.findIndex((item) => item.menuItem.id === product.id && !item.notes);

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      newCart[existingIndex].itemTotal = newCart[existingIndex].quantity * product.price;
      setCart(newCart);
      setSelectedItemIndex(existingIndex);
      setNoteInput(newCart[existingIndex].notes || '');
    } else {
      const newItem: CartItem = {
        cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuItem: product,
        quantity: 1,
        selectedModifiers: [],
        notes: '',
        itemTotal: product.price,
      };
      const updatedCart = [...cart, newItem];
      setCart(updatedCart);
      const newIdx = updatedCart.length - 1;
      setSelectedItemIndex(newIdx);
      setNoteInput('');
    }
  };

  // Save Note for selected item
  const saveNote = (noteToApply?: string) => {
    const finalNote = noteToApply !== undefined ? noteToApply : noteInput;
    if (selectedItemIndex !== null && cart[selectedItemIndex]) {
      posAudio.playTap();
      const newCart = [...cart];
      newCart[selectedItemIndex].notes = finalNote.trim();
      setCart(newCart);
      setNoteInput(finalNote.trim());
      setNoteSuccessToast(true);
      setTimeout(() => setNoteSuccessToast(false), 2000);
      showToast('تم حفظ الملاحظة بنجاح!', `تم ربط الملاحظة بالوجبة (${cart[selectedItemIndex].menuItem.name})`);
    }
  };

  // Update Item Quantity
  const handleUpdateQuantity = (index: number, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    posAudio.playTap();
    const targetItem = cart[index];
    if (!targetItem) return;

    const newQty = targetItem.quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(index, e);
      return;
    }

    const newCart = [...cart];
    newCart[index] = {
      ...targetItem,
      quantity: newQty,
      itemTotal: newQty * targetItem.menuItem.price,
    };
    setCart(newCart);
  };

  // Remove Item
  const handleRemoveItem = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    posAudio.playTap();
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    if (selectedItemIndex === index) {
      setSelectedItemIndex(newCart.length > 0 ? 0 : null);
    } else if (selectedItemIndex !== null && selectedItemIndex > index) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  };

  // Print Receipt / KOT slip
  const handlePrintTest = () => {
    if (cart.length === 0) {
      posAudio.playError();
      return;
    }
    posAudio.playReceiptPrint();
    setShowPrintToast(true);
    setTimeout(() => setShowPrintToast(false), 3500);
  };

  // 1. حفظ الطلب كمعلق (لم يدفع بعد ويترك في المكان المخصص للمتابعة والسداد لاحقاً)
  const handleSaveAsPending = () => {
    if (cart.length === 0) {
      posAudio.playError();
      showToast('السلة فارغة!', 'يرجى إضافة وجبات أولاً قبل الحفظ', 'warning');
      return;
    }
    posAudio.playTap();
    const newOrder: SavedOrder = {
      id: Date.now(),
      items: [...cart],
      total,
      subtotal,
      tax,
      discount: discountAmount,
      deliveryFee,
      status: 'pending',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderType,
      tableName: selectedTable?.name,
      customerName: customerName || (selectedTable ? `طاولة: ${selectedTable.name}` : (orderType === 'dine_in' ? 'عميل صالة' : 'عميل المطعم')),
      splitCount,
    };
    setOrdersList([newOrder, ...ordersList]);
    setCart([]);
    setSelectedItemIndex(null);
    setNoteInput('');
    setActiveScreen('orders');
    showToast('تم حفظ الطلب في الطلبات المعلقة ⏳', 'يمكنك مراجعته وسداده لاحقاً من شاشة إدارة الطلبات');
  };

  // 2. سداد الطلب فوراً في نفس اللحظة
  const handleInstantPay = () => {
    if (cart.length === 0) {
      posAudio.playError();
      showToast('السلة فارغة!', 'يرجى إضافة وجبات أولاً قبل السداد', 'warning');
      return;
    }
    posAudio.playSuccess();
    const paidOrder: SavedOrder = {
      id: Date.now(),
      items: [...cart],
      total,
      subtotal,
      tax,
      discount: discountAmount,
      deliveryFee,
      status: 'paid',
      paymentMethod,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderType,
      tableName: selectedTable?.name,
      customerName: customerName || (selectedTable ? `طاولة: ${selectedTable.name}` : 'عميل المطعم'),
      splitCount,
    };
    setOrdersList([paidOrder, ...ordersList]);
    
    onCheckout({
      type: orderType,
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      deliveryFee,
      total,
      paymentMethod: paymentMethod === 'visa' ? 'card' : paymentMethod === 'transfer' ? 'online' : 'cash',
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      guestCount: selectedTable?.guestCount || splitCount || 2,
      customerName: customerName || (orderType === 'dine_in' ? 'عميل الصالة' : 'عميل المطعم'),
      customerPhone,
      deliveryAddress,
      carDetails,
      generalNotes: generalNotes ? `${generalNotes} | تقسيم: ${splitCount} أشخاص` : (splitCount > 1 ? `تقسيم الحساب: ${splitCount} أشخاص` : ''),
    });

    setCart([]);
    setSelectedItemIndex(null);
    setNoteInput('');
    setActiveScreen('orders');
    showToast(`تم تسديد الفاتورة بنجاح عبر (${paymentMethod === 'cash' ? 'كاش' : paymentMethod === 'transfer' ? 'تحويل' : 'فيزا'})!`, `الإجمالي: ${total.toFixed(3)} ${settings.currency}`);
  };

  // تحويل طلب معلق إلى مدفوع لاحقاً
  const payLaterOrder = (orderId: number | string) => {
    posAudio.playSuccess();
    setOrdersList(ordersList.map(ord => ord.id === orderId ? { ...ord, status: 'paid', paymentMethod: 'cash' } : ord));
    showToast('تم تسجيل سداد الفاتورة بنجاح ✓', 'تم نقل الطلب إلى قائمة الطلبات المسددة');
  };

  // استرجاع الطلب المعلق إلى السلة للتعديل
  const restorePendingOrderToCart = (order: SavedOrder) => {
    posAudio.playTap();
    setCart([...order.items]);
    setOrdersList(ordersList.filter(o => o.id !== order.id));
    setSelectedItemIndex(0);
    setActiveScreen('invoice');
    showToast('تم استرجاع الطلب إلى السلة', 'يمكنك التعديل عليه أو إضافة وجبات وسداده الآن', 'info');
  };

  // Header Title & Colors
  const getOrderBadge = () => {
    switch (orderType) {
      case 'dine_in':
        return {
          label: selectedTable ? `المحلي (${selectedTable.name})` : 'طلب محلي (Dine-In)',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Utensils,
        };
      case 'takeaway':
        return {
          label: 'طلب سفري (Takeaway)',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Car,
        };
      case 'delivery':
        return {
          label: 'طلب توصيل (Delivery)',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Bike,
        };
      case 'pickup':
        return {
          label: 'استلام فرع (Pick Up)',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: ShoppingBag,
        };
    }
  };

  const badgeInfo = getOrderBadge();
  const pendingOrdersCount = ordersList.filter(o => o.status === 'pending').length;

  return (
    <div className="flex flex-col h-screen w-full bg-white text-slate-900 font-sans select-none overflow-hidden" dir="rtl">
      
      {/* ============================================================ */}
      {/* TOP GLOBAL BAR: شريط التنقل الشامل مع زر عودة واضح وبارز */}
      {/* ============================================================ */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xs">
        
        {/* Left Side: Dedicated Back to Main Button & Order Channel Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { posAudio.playTap(); onBackToMain(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs sm:text-sm font-black rounded-xl transition-all border border-slate-300 cursor-pointer shadow-xs"
            title="العودة للشاشة الرئيسية لأقسام البيع"
          >
            <ArrowRight className="w-4 h-4 text-blue-600 stroke-[2.5]" />
            <span className="font-bold">الرئيسية</span>
          </button>

          <span className={`hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-bold border ${badgeInfo.bg}`}>
            {badgeInfo.label}
          </span>
        </div>

        {/* Center: Navigation Tabs for all sections (Scrollable smoothly on mobile) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-[65vw] sm:max-w-none">
          
          {/* 1. شاشة المنتجات */}
          <button 
            onClick={() => { posAudio.playTap(); setActiveScreen('menu'); }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScreen === 'menu' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>1. المنتجات</span>
          </button>

          {/* 2. الفاتورة والسداد */}
          <button 
            onClick={() => { posAudio.playTap(); setActiveScreen('invoice'); }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScreen === 'invoice' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>2. الفاتورة والسداد</span>
            {cart.length > 0 && (
              <span className="bg-emerald-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono-num">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* 3. إدارة الطلبات (معلقة / مدفوعة) */}
          <button 
            onClick={() => { posAudio.playTap(); setActiveScreen('orders'); }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 relative cursor-pointer ${
              activeScreen === 'orders' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
            <span>3. إدارة الطلبات</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full font-mono-num animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* 4. إعدادات المدير ورموز الكادر */}
          <button 
            onClick={() => { posAudio.playTap(); setActiveScreen('admin'); }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScreen === 'admin' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>4. رموز الكادر</span>
          </button>

          {/* زر العرض المزدوج للشاشات الكبيرة */}
          <button 
            onClick={() => { posAudio.playTap(); setActiveScreen('split_view'); }}
            className={`hidden xl:flex px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all items-center gap-1.5 cursor-pointer ${
              activeScreen === 'split_view' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>العرض المزدوج</span>
          </button>
        </div>

        {/* Right Side: Quick toggles and active orders */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeScreen === 'menu' && (
            <button
              onClick={() => setShowPricesOnMenuButtons(!showPricesOnMenuButtons)}
              className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold transition-colors cursor-pointer"
              title="إظهار أو إخفاء الأسعار في شاشة المنتجات للسرعة"
            >
              {showPricesOnMenuButtons ? 'إخفاء الأسعار' : 'إظهار الأسعار'}
            </button>
          )}

          <button
            onClick={() => { posAudio.playTap(); onOpenActiveOrders(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-black text-[11px] font-mono-num">
              {activeOrdersCount}
            </span>
          </button>
        </div>

      </header>

      {/* ============================================================ */}
      {/* 1. الشاشة الأولى: اختيار المنتجات (خلفية بيضاء نقية مع أزرار عريضة سريعة) */}
      {/* ============================================================ */}
      {activeScreen === 'menu' && (
        <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-5 bg-white overflow-hidden animate-in fade-in duration-150">
          
          {/* Header Row: Title, Back to Main button & Quick Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { posAudio.playTap(); onBackToMain(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>عودة للرئيسية</span>
              </button>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900">اختر الوجبات</h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">أزرار لمسية سريعة بحجم مناسب للجوال والشاشات</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث سريع عن وجبة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-1.5 sm:py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { posAudio.playTap(); setActiveCategory(cat.id); }}
                className={`px-3.5 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer text-white shadow-xs ${
                  cat.color || 'bg-blue-600'
                } ${
                  activeCategory === cat.id
                    ? 'ring-2 ring-blue-600 ring-offset-2 scale-102 shadow-md'
                    : 'opacity-85 hover:opacity-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid - الحجم المناسب للجوال والشاشات الكبيرة */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 overflow-y-auto flex-1 p-0.5 custom-scrollbar">
            {filteredItems.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod)}
                className={`${
                  prod.color || 'bg-teal-700'
                } hover:opacity-95 active:scale-96 p-3 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm transition-all cursor-pointer group min-h-[80px] sm:min-h-[105px] text-white`}
              >
                <span className="text-sm sm:text-base md:text-lg font-black leading-snug drop-shadow-xs">
                  {prod.name}
                </span>
                {showPricesOnMenuButtons && (
                  <span className="mt-1.5 text-[11px] font-black bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20 font-mono-num">
                    {prod.price.toFixed(3)} {settings.currency}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom Action Footer Bar */}
          <div className="mt-3 flex flex-wrap sm:flex-nowrap justify-between items-center bg-slate-50 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 shrink-0 shadow-xs gap-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { posAudio.playTap(); onBackToMain(); }}
                className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors shadow-xs"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>الرئيسية</span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="text-xs sm:text-sm">
                  <span className="text-slate-500 font-bold">السلة: </span>
                  <span className="font-black text-blue-600 font-mono-num">
                    {cart.reduce((s, i) => s + i.quantity, 0)} وجبة
                  </span>
                  <span className="text-slate-700 text-xs mr-2 font-mono-num font-bold">
                    ({total.toFixed(3)} {settings.currency})
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { posAudio.playTap(); setActiveScreen('invoice'); }}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>متابعة إلى الفاتورة والدفع</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 2. الشاشة الثانية: الفاتورة، الملاحظات، وخيارات السداد الفوري أو التأجيل */}
      {/* ============================================================ */}
      {activeScreen === 'invoice' && (
        <div className="flex-1 flex flex-col bg-white text-slate-900 p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150" dir="rtl">
          
          {/* Header Bar with Back Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mb-4 border-b border-slate-200 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { posAudio.playTap(); setActiveScreen('menu'); }} 
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>العودة للمنتجات</span>
              </button>
              <button 
                onClick={() => { posAudio.playTap(); onBackToMain(); }} 
                className="bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-300 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>الرئيسية</span>
              </button>
            </div>

            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 text-left sm:text-right">إدارة الفاتورة والملاحظات</h2>
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">مراجعة أصناف الطلب، الملاحظات تحت كل وجبة، السداد الفوري أو الحفظ المعلق</p>
            </div>
          </div>

          {/* 2-Columns Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1">
            
            {/* العمود الأيمن: تفاصيل الوجبات والملاحظات تحتها */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs min-h-[420px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>الوجبات والملاحظات</span>
                  </h3>
                  <span className="text-xs bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-bold font-mono-num">
                    {cart.length} أصناف
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 mb-3 max-h-[300px] overflow-y-auto p-0.5 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-bold text-xs sm:text-sm">
                      السلة فارغة. اضغط على "العودة للمنتجات" لإضافة وجبات.
                    </div>
                  ) : (
                    cart.map((item, index) => {
                      const isSelected = selectedItemIndex === index;
                      return (
                        <div 
                          key={item.cartId} 
                          onClick={() => { 
                            setSelectedItemIndex(index); 
                            setNoteInput(item.notes || ''); 
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-400/30' 
                              : 'bg-white border-slate-200 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="flex justify-between items-center font-bold text-xs sm:text-sm">
                            <span className="text-slate-900">
                              <span className="text-blue-600 font-black ml-1.5 font-mono-num">{item.quantity}x</span>
                              {item.menuItem.name}
                            </span>
                            <span className="text-blue-600 font-mono-num font-black">
                              {item.itemTotal.toFixed(3)} {settings.currency}
                            </span>
                          </div>

                          {/* عرض الملاحظة تحت الوجبة */}
                          {item.notes && (
                            <div className="text-xs text-red-600 mt-2 bg-red-50 p-1.5 rounded-lg font-bold border border-red-200 flex items-center justify-between">
                              <span>ملاحظة: {item.notes}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newCart = [...cart];
                                  newCart[index].notes = '';
                                  setCart(newCart);
                                  if (selectedItemIndex === index) setNoteInput('');
                                }}
                                className="text-slate-400 hover:text-red-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* Quick quantity controls when selected */}
                          {isSelected && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 text-xs">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleUpdateQuantity(index, -1, e)}
                                  className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center font-black font-mono-num">{item.quantity}</span>
                                <button
                                  onClick={(e) => handleUpdateQuantity(index, 1, e)}
                                  className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={(e) => handleRemoveItem(index, e)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                حذف الوجبة
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* إضافة ملاحظة للوجبة المحددة */}
              {selectedItemIndex !== null && cart[selectedItemIndex] && (
                <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>تسجيل ملاحظة لـ: ({cart[selectedItemIndex].menuItem.name})</span>
                    {noteSuccessToast && (
                      <span className="text-green-600 flex items-center gap-1 text-[11px] font-bold animate-pulse">
                        <Check className="w-3 h-3" /> تم حفظ الملاحظة!
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={noteInput} 
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveNote(); }}
                      placeholder="اكتب الملاحظة هنا (مثال: بدون بصل)..."
                      className="flex-1 border border-slate-300 p-2 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <button 
                      onClick={() => saveNote()} 
                      className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                    >
                      حفظ
                    </button>
                  </div>

                  {/* Preset note tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {quickNotes.slice(0, 5).map((qNote) => (
                      <button
                        key={qNote}
                        onClick={() => saveNote(qNote)}
                        className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2 py-0.5 rounded font-semibold transition-colors"
                      >
                        {qNote}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* العمود الأيسر: خيارات السداد والتقسيم */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs space-y-3">
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>خيارات السداد والتقسيم</span>
                </h3>
                
                {/* 1. اختيار طريقة الدفع للسداد الفوري */}
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الدفع (للسداد الفوري):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => { posAudio.playTap(); setPaymentMethod('cash'); }} 
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'cash' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>كاش</span>
                    </button>

                    <button 
                      onClick={() => { posAudio.playTap(); setPaymentMethod('transfer'); }} 
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'transfer' 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>تحويل</span>
                    </button>

                    <button 
                      onClick={() => { posAudio.playTap(); setPaymentMethod('visa'); }} 
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'visa' 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>فيزا</span>
                    </button>
                  </div>
                </div>

                {/* 2. تقسيم الفاتورة على أشخاص */}
                <div className="mb-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>تقسيم الفاتورة على عدد الأشخاص:</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => { posAudio.playTap(); setSplitCount(Math.max(1, splitCount - 1)); }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-sm"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        value={splitCount} 
                        onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 p-1.5 text-center text-sm font-black bg-white focus:outline-none font-mono-num text-slate-900"
                      />
                      <button
                        onClick={() => { posAudio.playTap(); setSplitCount(splitCount + 1); }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold text-slate-600">شخص / أشخاص</span>
                  </div>
                </div>

                {/* 3. أزرار إضافية: طباعة وخيارات */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintTest}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة بون تجريبي</span>
                  </button>
                  <button
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>خيارات وخصومات</span>
                  </button>
                </div>
              </div>

              {/* الملخص وزرا السداد الفوري أو الحفظ المعلق */}
              <div className="border-t border-slate-200 pt-3 bg-white p-3.5 rounded-xl shadow-xs space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-700">
                  <span>الإجمالي:</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono-num">
                    {total.toFixed(3)} {settings.currency}
                  </span>
                </div>

                {splitCount > 1 && (
                  <div className="flex justify-between items-center text-xs font-black text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <span>حصة الشخص الواحد ({splitCount} أشخاص):</span>
                    <span className="font-mono-num text-sm">
                      {perPersonAmount.toFixed(3)} {settings.currency}
                    </span>
                  </div>
                )}

                {/* زر تأكيد وتسديد الفاتورة الرئيسي */}
                <div className="space-y-2 pt-1">
                  <button 
                    onClick={handleInstantPay}
                    disabled={cart.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد وتسديد الفاتورة فورا</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleSaveAsPending}
                      disabled={cart.length === 0}
                      className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>حفظ معلق (سداد لاحقاً)</span>
                    </button>

                    <button 
                      onClick={handlePrintTest}
                      disabled={cart.length === 0}
                      className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white py-2 rounded-xl font-bold text-xs border border-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة بون الطلب</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. الشاشة الثالثة: إدارة الطلبات (المعلقة لم تدفع بعد vs المدفوعة) */}
      {/* ============================================================ */}
      {activeScreen === 'orders' && (
        <div className="flex-1 flex flex-col bg-white text-slate-900 p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150" dir="rtl">
          
          {/* Header Bar with Back Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mb-4 border-b border-slate-200 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { posAudio.playTap(); setActiveScreen('menu'); }} 
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>العودة للمنتجات</span>
              </button>
              <button 
                onClick={() => { posAudio.playTap(); onBackToMain(); }} 
                className="bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-300 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>الرئيسية</span>
              </button>
            </div>

            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 text-left sm:text-right">إدارة الطلبات (المعلقة والمدفوعة)</h2>
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">متابعة الفواتير غير المسددة وسدادها لاحقاً، وأرشيف الطلبات المسددة فوراً</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1">
            
            {/* القسم الأول: الطلبات المعلقة */}
            <div className="bg-amber-50/60 p-3.5 sm:p-4 rounded-2xl border border-amber-300 flex flex-col min-h-[460px] shadow-xs">
              <h3 className="font-black text-sm sm:text-base mb-3 text-amber-900 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4 text-amber-600" />
                  <span>الطلبات المعلقة (لم تدفع بعد)</span>
                </span>
                <span className="bg-amber-200 text-amber-950 font-black px-2.5 py-0.5 rounded-full text-xs border border-amber-300 font-mono-num">
                  {ordersList.filter(o => o.status === 'pending').length} طلبات
                </span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 p-0.5 custom-scrollbar">
                {ordersList.filter(o => o.status === 'pending').length === 0 ? (
                  <div className="text-center text-amber-700/60 py-20 font-bold text-xs sm:text-sm">
                    لا توجد طلبات معلقة حالياً. كل الفواتير مسددة ✓
                  </div>
                ) : (
                  ordersList.filter(o => o.status === 'pending').map((order) => (
                    <div key={order.id} className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-xs hover:shadow-sm transition-shadow">
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-bold border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-mono-num font-black">طلب #{order.id.toString().slice(-4)}</span>
                          {order.tableName && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                              طاولة: {order.tableName}
                            </span>
                          )}
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black border border-amber-200 text-[11px]">
                          غير مدفوع (معلق)
                        </span>
                      </div>

                      {/* Items & Notes */}
                      <div className="space-y-1 mb-2.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-xs font-semibold text-slate-800 flex justify-between items-center bg-slate-50 p-1 rounded">
                            <span>
                              <span className="text-blue-600 font-black ml-1">{it.quantity}x</span>
                              {it.menuItem.name}
                            </span>
                            {it.notes && (
                              <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded border border-red-100">
                                ({it.notes})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Pay Action */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 gap-2">
                        <div>
                          <div className="text-[11px] text-slate-500 font-semibold">وقت الطلب: {order.date}</div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 font-mono-num">
                            المبلغ: {order.total.toFixed(3)} {settings.currency}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => restorePendingOrderToCart(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 transition-colors"
                          >
                            تعديل
                          </button>
                          <button 
                            onClick={() => payLaterOrder(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>سداد الفاتورة الآن ✓</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

            {/* القسم الثاني: الطلبات المدفوعة */}
            <div className="bg-emerald-50/60 p-3.5 sm:p-4 rounded-2xl border border-emerald-300 flex flex-col min-h-[460px] shadow-xs">
              <h3 className="font-black text-sm sm:text-base mb-3 text-emerald-900 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>الطلبات المسددة (المدفوعة)</span>
                </span>
                <span className="bg-emerald-200 text-emerald-950 font-black px-2.5 py-0.5 rounded-full text-xs border border-emerald-300 font-mono-num">
                  {ordersList.filter(o => o.status === 'paid').length} طلبات
                </span>
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3 p-0.5 custom-scrollbar">
                {ordersList.filter(o => o.status === 'paid').length === 0 ? (
                  <div className="text-center text-emerald-700/60 py-20 font-bold text-xs sm:text-sm">
                    لا توجد طلبات مسددة حتى الآن في هذا السجل
                  </div>
                ) : (
                  ordersList.filter(o => o.status === 'paid').map((order) => (
                    <div key={order.id} className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-xs">
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-bold border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-mono-num font-black">طلب #{order.id.toString().slice(-4)}</span>
                          <span className="text-slate-600 font-semibold">{order.customerName || 'عميل'}</span>
                        </div>
                        <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>تم السداد ({order.paymentMethod === 'visa' ? 'فيزا' : order.paymentMethod === 'transfer' ? 'تحويل' : 'كاش'})</span>
                        </span>
                      </div>

                      <div className="space-y-1 mb-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-xs font-semibold text-slate-700 flex justify-between">
                            <span>{it.quantity}x {it.menuItem.name}</span>
                            <span className="text-slate-500 font-mono-num">{it.itemTotal.toFixed(3)} {settings.currency}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">وقت السداد: {order.date}</span>
                        <div className="text-xs sm:text-sm font-black text-emerald-700 font-mono-num">
                          <span>الإجمالي: </span>
                          <span>{order.total.toFixed(3)} {settings.currency}</span>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. شاشة إعدادات المدير - رموز دخول الكادر والعمال (Admin PINs) */}
      {/* ============================================================ */}
      {activeScreen === 'admin' && (
        <div className="flex-1 flex flex-col bg-white text-slate-900 p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mb-4 border-b border-slate-200 pb-3 shrink-0">
            <div>
              <h2 className="text-base sm:text-xl font-black text-purple-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>إعدادات المدير - رموز دخول الكادر والعمال</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد وتعديل كلمات السر ورموز الدخول لكل موظف لحماية الأقسام
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAddWorkerForm(!showAddWorkerForm)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة موظف جديد</span>
              </button>

              <button 
                onClick={() => { posAudio.playTap(); setActiveScreen('menu'); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-300 transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>العودة للمنتجات</span>
              </button>

              <button 
                onClick={() => { posAudio.playTap(); onBackToMain(); }}
                className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-slate-300 transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-4">
            
            {/* New Worker Form */}
            {showAddWorkerForm && (
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-xs space-y-3 animate-in fade-in duration-150">
                <h4 className="font-bold text-xs text-purple-900">إضافة كاشير / موظف جديد</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="اسم الموظف..."
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="p-2 border border-purple-200 rounded-xl bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="رقم الموظف (ID)..."
                    value={newWorkerId}
                    onChange={(e) => setNewWorkerId(e.target.value)}
                    className="p-2 border border-purple-200 rounded-xl bg-white font-mono-num text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="المسمى الوظيفي (كاشير، مدير)..."
                    value={newWorkerRole}
                    onChange={(e) => setNewWorkerRole(e.target.value)}
                    className="p-2 border border-purple-200 rounded-xl bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="رمز الدخول (PIN)..."
                    value={newWorkerCode}
                    onChange={(e) => setNewWorkerCode(e.target.value)}
                    className="p-2 border border-purple-200 rounded-xl bg-white font-mono-num text-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowAddWorkerForm(false)}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={() => {
                      if (!newWorkerName || !newWorkerCode) {
                        alert('يرجى إدخال اسم الموظف ورمز الدخول');
                        return;
                      }
                      setWorkersList([...workersList, {
                        id: newWorkerId || `${Date.now().toString().slice(-3)}`,
                        name: newWorkerName,
                        role: newWorkerRole || 'كاشير',
                        code: newWorkerCode,
                      }]);
                      setNewWorkerName('');
                      setNewWorkerId('');
                      setShowAddWorkerForm(false);
                      showToast('تمت إضافة الموظف بنجاح ✓', 'يمكنه الآن الدخول برمز PIN الجديد');
                    }}
                    className="px-4 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    إضافة الموظف
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">تعديل رموز الدخول الخاصة بالموظفين</h3>
                <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  {workersList.length} كادر مسجل
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                عندما يقوم المدير بتغيير كلمة السر لأي موظف هنا، لن يتمكن الكاشير من فتح أقسام الطلبات إلا بالرمز الجديد.
              </p>

              <div className="space-y-2.5 pt-2">
                {workersList.map((worker) => (
                  <div key={worker.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center hover:border-purple-300 transition-colors">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                        <span>{worker.name}</span>
                        <span className="text-xs text-slate-400 font-mono-num font-normal">({worker.id})</span>
                      </div>
                      <div className="text-xs text-purple-700 font-semibold mt-0.5">{worker.role}</div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500">رمز PIN:</span>
                        <input 
                          type="text" 
                          value={worker.code} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setWorkersList(workersList.map(w => w.id === worker.id ? { ...w, code: val } : w));
                          }}
                          className="w-20 border-2 border-purple-200 focus:border-purple-600 p-1.5 text-center rounded-xl font-mono-num font-black text-xs sm:text-sm bg-purple-50/50 text-purple-900 outline-none transition-colors"
                        />
                      </div>
                      <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold border border-emerald-200">
                        مفعل ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold">رمز الطوارئ والمدير العام: <strong className="font-mono-num text-slate-800">9999</strong> / <strong className="font-mono-num text-slate-800">1234</strong></span>
                <button 
                  onClick={() => {
                    posAudio.playSuccess();
                    showToast('تم حفظ وتحديث رموز الدخول بنجاح! ✓', 'تم تطبيق نظام الحماية والأمان فوراً');
                    setTimeout(() => setActiveScreen('menu'), 800);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  حفظ كافة التغييرات والرموز
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. الشاشة الخامسة: العرض المزدوج جنباً إلى جنب (Split Side-by-Side) */}
      {/* ============================================================ */}
      {activeScreen === 'split_view' && (
        <div className="flex-1 flex overflow-hidden bg-white text-slate-900">
          
          {/* Main / Menu Products */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 bg-white border-l border-slate-200 overflow-hidden">
            {/* Top Bar with Categories */}
            <div className="flex justify-between items-center mb-3 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {MENU_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { posAudio.playTap(); setActiveCategory(cat.id); }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white ${
                      cat.color || 'bg-blue-600'
                    } ${
                      activeCategory === cat.id 
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-102 shadow-sm' 
                        : 'opacity-85 hover:opacity-100'
                    } transition cursor-pointer`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { posAudio.playTap(); setActiveScreen('menu'); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border border-slate-300"
                >
                  العودة للمنتجات
                </button>
                <button 
                  onClick={() => { posAudio.playTap(); onBackToMain(); }}
                  className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border border-slate-300"
                >
                  الرئيسية
                </button>
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 p-0.5 custom-scrollbar">
              {filteredItems.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className={`${
                    prod.color || 'bg-teal-700'
                  } hover:opacity-95 active:scale-95 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs text-white transition cursor-pointer min-h-[90px]`}
                >
                  <span className="text-xs sm:text-sm font-black drop-shadow-xs">{prod.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Side Invoice View */}
          <div className="w-[360px] bg-slate-50 text-slate-900 flex flex-col justify-between shadow-lg shrink-0 border-r border-slate-200">
            
            {/* Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center text-xs font-bold">
              <span className="font-mono-num font-bold">طلب: #{Date.now().toString().slice(-5)}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                {orderType === 'dine_in' ? 'Dinner / المحلي' : badgeInfo.label}
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {cart.map((item, idx) => (
                <div key={idx} className="border-b border-slate-200 pb-2 text-xs bg-white p-2.5 rounded-xl border">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span className="text-blue-700 font-black font-mono-num">{(item.itemTotal).toFixed(3)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-red-600 mt-1 font-semibold">
                      ملاحظة: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Banner */}
            <div className="bg-emerald-600 text-white p-3.5 flex justify-between items-center">
              <span className="text-sm font-bold">الإجمالي Total</span>
              <span className="text-lg font-black font-mono-num">{total.toFixed(3)} {settings.currency}</span>
            </div>

            {/* 4 Bottom Action Buttons */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900 text-white text-xs font-bold text-center">
              <button 
                onClick={() => {
                  posAudio.playTap();
                  setCart([]);
                  showToast('تم إفراغ السلة', 'Cancel', 'info');
                }} 
                className="bg-red-600 hover:bg-red-700 py-2.5 rounded-lg active:scale-95 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  posAudio.playTap();
                  setIsOptionsModalOpen(true);
                }} 
                className="bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg active:scale-95 transition"
              >
                خيارات
              </button>
              <button 
                onClick={() => {
                  posAudio.playTap();
                  handleDirectPrint();
                }} 
                className="bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg active:scale-95 transition"
              >
                طباعة
              </button>
              <button 
                onClick={() => {
                  posAudio.playSuccess();
                  handleInstantPay();
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg active:scale-95 transition"
              >
                سداد
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* OPTIONS MODAL (نافذة خيارات الطلب الإضافية والخصومات - ثيم أبيض نقي) */}
      {/* ============================================================ */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150" dir="rtl">
          <div className="relative w-full max-w-md bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">خيارات وتفاصيل الطلب (Options)</h3>
              </div>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              
              {/* Discount selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  <span>تطبيق خصم على الفاتورة:</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15, 20, 25, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => { posAudio.playTap(); setDiscountPercent(pct); }}
                      className={`py-1.5 rounded-xl font-bold border transition-all ${
                        discountPercent === pct 
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {pct === 0 ? 'بدون خصم' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Switcher (for Dine In) */}
              {orderType === 'dine_in' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-blue-600" />
                    <span>طاولة الصالة:</span>
                  </label>
                  <button
                    onClick={() => {
                      setIsOptionsModalOpen(false);
                      onOpenTableModal();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-blue-800 border border-blue-200 rounded-xl font-bold flex items-center justify-between"
                  >
                    <span>{selectedTable ? `طاولة: ${selectedTable.name} (${selectedTable.section})` : 'اختر الطاولة'}</span>
                    <span className="text-[11px] underline text-blue-600">تغيير</span>
                  </button>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>بيانات العميل (اختياري):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="اسم العميل..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono-num"
                  />
                </div>
              </div>

              {/* General Order Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>ملاحظات عامة على الطلب:</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تعليمات للمطبخ أو الكاشير..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

            </div>

            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                إلغاء وعودة
              </button>
              <button
                onClick={() => { posAudio.playTap(); setIsOptionsModalOpen(false); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
              >
                تطبيق الخيارات
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOAST / ALERTS FEEDBACK */}
      {/* ============================================================ */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-white text-slate-900 border border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{toastMessage.title}</div>
            {toastMessage.desc && <div className="text-[11px] text-slate-500">{toastMessage.desc}</div>}
          </div>
        </div>
      )}

      {/* PRINT TEST FEEDBACK TOAST */}
      {showPrintToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-slate-900 border border-blue-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>تم إرسال أمر طباعة البون بنجاح!</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[10px] text-slate-500">
              طابعة الإيصالات: {settings.receiptPrinterName || 'طابعة الكاشير الرئيسية (80mm)'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
