import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  ChefHat, 
  QrCode, 
  Smartphone, 
  Bike, 
  Award, 
  Cloud, 
  LogOut, 
  Sliders, 
  Wifi, 
  TrendingUp, 
  History,
  ChevronLeft,
  Search,
  Trash2, 
  BarChart3,
  Receipt,
  Flame,
  Printer,
  MessageCircle,
  CheckCircle2,
  Clock,
  Layers,
  Store,
  DollarSign,
  Power,
  ShieldCheck
} from 'lucide-react';
import { Employee, PrinterConfig, InvoiceTargetPrinter } from '../types';
import { posAudio } from '../utils/audio';

interface TerminalMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Shifts & Drawer
  isShiftOpen?: boolean;
  openingCash?: number;
  onOpenShiftModal?: () => void;
  onOpenCashierShiftHub?: () => void;
  onCashierIn: () => void;
  onCashierOut: () => void;
  onCashierHistory: () => void;
  // Printers & Routing
  printerConfig?: PrinterConfig;
  onUpdatePrinterConfig?: (config: Partial<PrinterConfig>) => void;
  onOpenTerminalSettings: () => void;
  // Delivery & Digital Receipt
  onOpenDeliveryAggregators?: () => void;
  onOpenDigitalReceipt?: () => void;
  // Menu & Recipes BOM
  onOpenMenuManager?: () => void;
  onOpenRecipeManager?: () => void;
  // Analytics & Reports
  onOpenSalesAnalytics?: () => void;
  onOpenProfitLoss?: () => void;
  onDailySalesReport: () => void;
  onOpenSellerStatement?: () => void;
  // Other modules
  onOpenDeletedOrders?: () => void;
  onOpenFloorManager?: () => void;
  onOpenKDS?: () => void;
  onOpenZatca?: () => void;
  onOpenTableQr?: () => void;
  onOpenDeliveryFleet?: () => void;
  onOpenLoyalty?: () => void;
  onOpenCloudSync?: () => void;
  onChangeConnection: () => void;
  onLogout: () => void;
  onOpenSecurityHub?: () => void;
  onOpenAdmin?: () => void;
  employees?: Employee[];
  adminPin?: string;
}

export const TerminalMenuModal: React.FC<TerminalMenuModalProps> = ({
  isOpen,
  onClose,
  isShiftOpen = false,
  openingCash = 10.000,
  onOpenShiftModal,
  onOpenCashierShiftHub,
  onCashierIn,
  onCashierOut,
  onCashierHistory,
  printerConfig,
  onUpdatePrinterConfig,
  onOpenTerminalSettings,
  onOpenDeliveryAggregators,
  onOpenDigitalReceipt,
  onOpenMenuManager,
  onOpenRecipeManager,
  onOpenSalesAnalytics,
  onOpenProfitLoss,
  onDailySalesReport,
  onOpenSellerStatement,
  onOpenDeletedOrders,
  onOpenFloorManager,
  onOpenKDS,
  onOpenZatca,
  onOpenTableQr,
  onOpenDeliveryFleet,
  onOpenLoyalty,
  onOpenCloudSync,
  onChangeConnection,
  onLogout,
  onOpenSecurityHub,
  onOpenAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePrinterTarget, setActivePrinterTarget] = useState<InvoiceTargetPrinter>(
    printerConfig?.activeInvoicePrinter || 'both'
  );
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  useEffect(() => {
    if (printerConfig?.activeInvoicePrinter) {
      setActivePrinterTarget(printerConfig.activeInvoicePrinter);
    }
  }, [printerConfig?.activeInvoicePrinter]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFeedbackToast(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAction = (actionFn?: () => void) => {
    posAudio.playTap();
    onClose();
    if (actionFn) actionFn();
  };

  const handleSelectPrinterTarget = (target: InvoiceTargetPrinter) => {
    posAudio.playTap();
    setActivePrinterTarget(target);
    if (onUpdatePrinterConfig) {
      onUpdatePrinterConfig({ activeInvoicePrinter: target });
    }
    const label = target === 'cashier' 
      ? 'طابعة الكاشير والفواتير 🧾' 
      : target === 'kitchen' 
      ? 'طابعة المطبخ والشيف 🍳' 
      : 'كلاهما (الكاشير + المطبخ) ⚡';
    setFeedbackToast(`تم ضبط توجيه الفواتير إلى: ${label}`);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.trim().toLowerCase());
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-cairo text-white flex items-center gap-2">
                <span>الإعدادات وإدارة النظام</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-sans font-bold">
                  Terminal Hub
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                كافة أقسام الصندوق، الطابعات، التوصيل، المنيو، والتقارير
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Feedback Toast Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-col gap-2 shrink-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأقسام، الصندوق، الطابعات، الوجبات، التقارير..."
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl pr-9 pl-4 py-2 border border-slate-700 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {feedbackToast && (
            <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
          )}
        </div>

        {/* Scrollable Body: Separated Distinct Sections */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
          
          {/* SECTION 1: قسم الصندوق والورديات (Cash Drawer & Shifts) */}
          {(matchesSearch('صندوق') || matchesSearch('وردية') || matchesSearch('خردة') || matchesSearch('كاشير')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white">
                    قسم الصندوق والورديات
                  </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isShiftOpen
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                  <span>{isShiftOpen ? `الصندوق مفتوح (${openingCash.toFixed(3)} ر.ع)` : 'الصندوق مغلق'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. فتح / تعديل العهدة */}
                <button
                  onClick={() => handleOpenAction(onOpenShiftModal)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-right flex flex-col justify-between gap-1 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center justify-between text-emerald-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">العهدة</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      {isShiftOpen ? 'تعديل العهدة' : 'فتح الصندوق'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {openingCash.toFixed(3)} ر.ع حالياً
                    </span>
                  </div>
                </button>

                {/* 2. Cashier In (الخردة الصباحية) */}
                <button
                  onClick={() => handleOpenAction(onOpenCashierShiftHub || onCashierIn)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/50 rounded-xl text-right flex flex-col justify-between gap-1 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center justify-between text-blue-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[9px] bg-blue-500/20 px-1.5 py-0.5 rounded font-bold">صباحي</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-blue-300">
                      الفتح الصباحي
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      إثبات الخردة والاستلام
                    </span>
                  </div>
                </button>

                {/* 3. Cashier Out (إقفال الوردية) */}
                <button
                  onClick={() => handleOpenAction(onOpenCashierShiftHub || onCashierOut)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 rounded-xl text-right flex flex-col justify-between gap-1 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center justify-between text-amber-400">
                    <LogOut className="w-4 h-4" />
                    <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded font-bold">مسائي</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-amber-300">
                      إقفال الوردية
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      تسليم الصندوق وجرد العجز
                    </span>
                  </div>
                </button>

                {/* 4. Cashier History (سجل الورديات) */}
                <button
                  onClick={() => handleOpenAction(onCashierHistory)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/50 rounded-xl text-right flex flex-col justify-between gap-1 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center justify-between text-purple-400">
                    <History className="w-4 h-4" />
                    <span className="text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded font-bold">سجل</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-purple-300">
                      سجل الورديات
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      تقارير الإغلاقات السابقة
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: قسم توجيه وطباعة الفواتير (Invoice Routing & Thermal Printers) */}
          {(matchesSearch('طابعة') || matchesSearch('طباعة') || matchesSearch('فاتورة') || matchesSearch('مطبخ') || matchesSearch('كاشير')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      قسم توجيه وطباعة الفواتير
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      تحديد مسار إرسال الفواتير التلقائي وإعدادات الطابعات الحرارية
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAction(onOpenTerminalSettings)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>تخصيص الطابعات</span>
                </button>
              </div>

              {/* 3-Way Switch Card */}
              <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 shrink-0">
                  توجيه الفاتورة التلقائي:
                </span>
                <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectPrinterTarget('cashier')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activePrinterTarget === 'cashier'
                        ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-400'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>الكاشير فقط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPrinterTarget('kitchen')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activePrinterTarget === 'kitchen'
                        ? 'bg-rose-600 text-white shadow-md font-black ring-1 ring-rose-400'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>المطبخ فقط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPrinterTarget('both')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activePrinterTarget === 'both'
                        ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>كلاهما معاً</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: قسم منصات التوصيل والفواتير الرقمية (Delivery Aggregators & WhatsApp) */}
          {(matchesSearch('توصيل') || matchesSearch('جاهز') || matchesSearch('هنقرستيشن') || matchesSearch('واتساب') || matchesSearch('فاتورة') || matchesSearch('sms')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  قسم منصات التوصيل والفواتير الرقمية
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* منصات التوصيل */}
                <button
                  onClick={() => handleOpenAction(onOpenDeliveryAggregators)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Bike className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-amber-300">
                        منصات وتطبيقات التوصيل
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        جاهز • هنقرستيشن • مرسول • كيتا
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* الفاتورة الرقمية واتساب */}
                <button
                  onClick={() => handleOpenAction(onOpenDigitalReceipt)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-[#25D366] flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-emerald-300">
                        الفاتورة الرقمية وواتساب
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        إرسال الإيصالات برابط وQR عبر SMS / WhatsApp
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: قسم قائمة الطعام والوجبات والمقادير (Menu & Recipe BOM) */}
          {(matchesSearch('منيو') || matchesSearch('وجبات') || matchesSearch('وصفات') || matchesSearch('مقادير') || matchesSearch('طعام') || matchesSearch('تعديل')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  قسم قائمة الطعام والوجبات والمقادير
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* تعديل الوجبات */}
                <button
                  onClick={() => handleOpenAction(onOpenMenuManager)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-indigo-300">
                        تعديل وإدارة قائمة الطعام والوجبات
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        تعديل الأسعار وإضافة وحذف وإخفاء الوجبات
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* معايير الوصفات والمخزون BOM */}
                <button
                  onClick={() => handleOpenAction(onOpenRecipeManager)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-purple-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <ChefHat className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-purple-300">
                        معايير الوصفات ومقادير الطهي (BOM)
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ربط الوجبات بالمخزون وحساب تكاليف Food Cost
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: قسم التحليلات والأرباح والتقارير المالية (Analytics & Financial Reports) */}
          {(matchesSearch('تحليل') || matchesSearch('أرباح') || matchesSearch('مبيعات') || matchesSearch('تقرير') || matchesSearch('رسوم') || matchesSearch('بائع')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  قسم التحليلات والتقارير المالية
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* لوحة تحليلات Recharts */}
                <button
                  onClick={() => handleOpenAction(onOpenSalesAnalytics)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-cyan-300">
                        لوحة تحليلات ورسوم المبيعات
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        مقارنة أداء الموظفين، ساعات الذروة، ومبيعات اليوم والشهر
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* تقرير الأرباح والخسائر P&L */}
                <button
                  onClick={() => handleOpenAction(onOpenProfitLoss)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-emerald-300">
                        تقرير وتحليل الأرباح والخسائر (P&L)
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        صافي الأرباح، COGS، والمصاريف التشغيلية
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* تقرير المبيعات اليومي */}
                <button
                  onClick={() => handleOpenAction(onDailySalesReport)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-blue-300">
                        تقرير المبيعات اليومي
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        كشف الحساب الإجمالي لمبيعات اليوم
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* كشف حساب البائعين */}
                <button
                  onClick={() => handleOpenAction(onOpenSellerStatement)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 rounded-xl text-right flex items-center justify-between transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-white group-hover:text-amber-300">
                        كشف حساب ومبيعات البائع (بالحبّة)
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        تفاصيل مبيعات كل بائع والفواتير المسددة
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 6: قسم الأنظمة والعمليات المتقدمة (Advanced Operations & POS Systems) */}
          {(matchesSearch('محذوف') || matchesSearch('مطبخ') || matchesSearch('صالة') || matchesSearch('طاولة') || matchesSearch('فاتورة') || matchesSearch('qr') || matchesSearch('سائق') || matchesSearch('ولاء') || matchesSearch('سحاب') || matchesSearch('ip')) && (
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  قسم الأنظمة والعمليات المتقدمة
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* نظام الصلاحيات والأمان RBAC */}
                <button
                  onClick={() => handleOpenAction(onOpenSecurityHub)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95 ring-1 ring-emerald-500/30"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-300">
                      الصلاحيات والأمان
                    </span>
                    <span className="block text-[10px] text-emerald-400/90 font-bold">نظام RBAC والتدقيق</span>
                  </div>
                </button>

                {/* لوحة الإدارة والتحكم */}
                <button
                  onClick={() => handleOpenAction(onOpenAdmin)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-rose-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Power className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-rose-300">
                      لوحة الإدارة
                    </span>
                    <span className="block text-[10px] text-slate-400">الإعدادات والعمليات الكبرى</span>
                  </div>
                </button>

                {/* سجل المحذوفات */}
                <button
                  onClick={() => handleOpenAction(onOpenDeletedOrders)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-rose-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-rose-300">
                      سجل المحذوفات
                    </span>
                    <span className="block text-[10px] text-slate-400">الفواتير والطلبات الملغية</span>
                  </div>
                </button>

                {/* شاشة المطبخ KDS */}
                <button
                  onClick={() => handleOpenAction(onOpenKDS)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      شاشة المطبخ KDS
                    </span>
                    <span className="block text-[10px] text-slate-400">أوامر الطهي والتجهيز</span>
                  </div>
                </button>

                {/* إدارة الصالات والطاولات */}
                <button
                  onClick={() => handleOpenAction(onOpenFloorManager)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-blue-300">
                      إدارة الصالات
                    </span>
                    <span className="block text-[10px] text-slate-400">تخصيص الطاولات والـ QR</span>
                  </div>
                </button>

                {/* الفوترة الإلكترونية ZATCA */}
                <button
                  onClick={() => handleOpenAction(onOpenZatca)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-300">
                      الفوترة ZATCA
                    </span>
                    <span className="block text-[10px] text-slate-400">الباركود الضريبي المعتمد</span>
                  </div>
                </button>

                {/* منيو QR للطاولة */}
                <button
                  onClick={() => handleOpenAction(onOpenTableQr)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-indigo-300">
                      منيو QR الطاولة
                    </span>
                    <span className="block text-[10px] text-slate-400">الطلب الذاتي للعملاء</span>
                  </div>
                </button>

                {/* أسطول التوصيل والسائقين */}
                <button
                  onClick={() => handleOpenAction(onOpenDeliveryFleet)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-orange-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Bike className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-orange-300">
                      أسطول التوصيل
                    </span>
                    <span className="block text-[10px] text-slate-400">توزيع الطلبات والسائقين</span>
                  </div>
                </button>

                {/* برنامج الولاء */}
                <button
                  onClick={() => handleOpenAction(onOpenLoyalty)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      برنامج الولاء
                    </span>
                    <span className="block text-[10px] text-slate-400">النقاط والكوبونات</span>
                  </div>
                </button>

                {/* المزامنة السحابية */}
                <button
                  onClick={() => handleOpenAction(onOpenCloudSync)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-sky-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Cloud className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-sky-300">
                      المزامنة السحابية
                    </span>
                    <span className="block text-[10px] text-slate-400">النسخ الاحتياطي والـ Cloud</span>
                  </div>
                </button>

                {/* تغيير الاتصال والـ IP */}
                <button
                  onClick={() => handleOpenAction(onChangeConnection)}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/50 rounded-xl text-right flex flex-col justify-between gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-blue-300">
                      تغيير الاتصال
                    </span>
                    <span className="block text-[10px] text-slate-400">IP الشبكة والسيرفر</span>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer with Logout and Quick Close */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => handleOpenAction(onLogout)}
            className="py-2 px-4 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من الكاشير</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
