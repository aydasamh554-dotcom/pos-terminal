import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  User, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ShoppingBag, 
  Receipt, 
  Printer, 
  Download, 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  PieChart, 
  BarChart3, 
  ChevronDown, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  SlidersHorizontal,
  Flame,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Employee } from '../types';
import { InvoOrder } from '../data/invoData';
import { 
  SellerAccountStatement, 
  SellerItemSalesSummary, 
  SellerInvoiceRecord, 
  generateSellerStatement 
} from '../data/sellerSalesData';
import { posAudio } from '../utils/audio';

interface SellerAccountStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  settledOrders?: InvoOrder[];
  initialEmployeeId?: string;
  currency?: string;
}

export const SellerAccountStatementModal: React.FC<SellerAccountStatementModalProps> = ({
  isOpen,
  onClose,
  employees,
  settledOrders = [],
  initialEmployeeId,
  currency = 'ر.ع',
}) => {
  // حالة الموظف المختار (إما موظف محدد أو 'all' للجميع)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || employees[0]?.id || 'emp-0');
  
  // حالة الفترة الزمنية
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'this_week' | 'this_month' | 'all_time' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // التبويب النشط: كشف الأصناف بالحبة | سجل الفواتير | التحليل والأقسام
  const [activeTab, setActiveTab] = useState<'items' | 'invoices' | 'analytics'>('items');

  // البحث والفرز في جدول الأصناف
  const [itemSearch, setItemSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'qty' | 'total' | 'price' | 'name'>('qty');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // الفاتورة المعروضة بالتفصيل
  const [selectedInvoice, setSelectedInvoice] = useState<SellerInvoiceRecord | null>(null);

  // إشعار النسخ والطباعة
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // مرجع الطباعة
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // الموظف الحالي
  const currentEmployee = useMemo(() => {
    if (selectedEmpId === 'all') return null;
    return employees.find(e => e.id === selectedEmpId) || employees[0] || null;
  }, [selectedEmpId, employees]);

  // حساب بيانات كشف الحساب المتكامل
  const statement: SellerAccountStatement = useMemo(() => {
    return generateSellerStatement(
      currentEmployee,
      employees,
      settledOrders,
      selectedPeriod,
      customStartDate,
      customEndDate
    );
  }, [currentEmployee, employees, settledOrders, selectedPeriod, customStartDate, customEndDate]);

  // تصفية وترتيب جدول الأصناف بالحبة
  const filteredItems = useMemo(() => {
    let list = [...statement.itemBreakdown];

    if (itemSearch.trim()) {
      const q = itemSearch.trim().toLowerCase();
      list = list.filter(it => it.itemName.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
    }

    if (categoryFilter !== 'all') {
      list = list.filter(it => it.category === categoryFilter);
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'qty') diff = b.quantitySold - a.quantitySold;
      else if (sortBy === 'total') diff = b.totalSales - a.totalSales;
      else if (sortBy === 'price') diff = b.unitPrice - a.unitPrice;
      else if (sortBy === 'name') diff = a.itemName.localeCompare(b.itemName);
      return sortOrder === 'desc' ? diff : -diff;
    });

    return list;
  }, [statement.itemBreakdown, itemSearch, categoryFilter, sortBy, sortOrder]);

  // قائمة جميع التصنيفات المتاحة
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    statement.itemBreakdown.forEach(it => set.add(it.category));
    return Array.from(set);
  }, [statement.itemBreakdown]);

  // نسخ البيانات إلى الحافظة
  const handleCopyToClipboard = () => {
    posAudio.playTap();
    let text = `=====================================\n`;
    text += `كشف حساب ومبيعات: ${statement.employeeName} (${statement.employeeCode})\n`;
    text += `الفترة: ${statement.periodLabel}\n`;
    text += `إجمالي مبيعات اليوم: ${statement.todaySales.toFixed(3)} ${currency} (${statement.todayOrdersCount} طلب - ${statement.todayItemsCount} حبة)\n`;
    text += `إجمالي مبيعات الشهر: ${statement.monthSales.toFixed(3)} ${currency} (${statement.monthOrdersCount} طلب - ${statement.monthItemsCount} حبة)\n`;
    text += `إجمالي الفترة المحددة: ${statement.totalSales.toFixed(3)} ${currency} (${statement.totalOrdersCount} طلب - ${statement.totalItemsCount} حبة)\n`;
    text += `-------------------------------------\n`;
    text += `تفصيل مبيعات الأصناف بالحبّة:\n`;
    statement.itemBreakdown.forEach((it, i) => {
      text += `${i + 1}. ${it.itemName} [${it.category}] : ${it.quantitySold} حبة × ${it.unitPrice.toFixed(3)} = ${it.totalSales.toFixed(3)} ${currency} (${it.percentageOfTotal}%)\n`;
    });
    text += `=====================================\n`;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      showToast('تم نسخ كشف الحساب بالكامل إلى الحافظة!');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // تصدير CSV
  const handleExportCSV = () => {
    posAudio.playTap();
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `اسم البائع,${statement.employeeName}\n`;
    csv += `الكود الوظيفي,${statement.employeeCode}\n`;
    csv += `الفترة,${statement.periodLabel}\n`;
    csv += `مبيعات اليوم,${statement.todaySales.toFixed(3)} ${currency}\n`;
    csv += `مبيعات الشهر,${statement.monthSales.toFixed(3)} ${currency}\n`;
    csv += `إجمالي الفترة,${statement.totalSales.toFixed(3)} ${currency}\n`;
    csv += `عدد الحبات المباعة,${statement.totalItemsCount}\n\n`;
    csv += `م,اسم الصنف,القسم,سعر الحبة,الكمية المباعة (بالحبه),إجمالي المبيعات,النسبة المئوية\n`;

    statement.itemBreakdown.forEach((it, idx) => {
      csv += `${idx + 1},"${it.itemName}","${it.category}",${it.unitPrice.toFixed(3)},${it.quantitySold},${it.totalSales.toFixed(3)},${it.percentageOfTotal}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `كشف_حساب_${statement.employeeName.replace(/\s+/g, '_')}_${statement.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تحميل ملف كشف الحساب بصيغة Excel/CSV بنجاح!');
  };

  // طباعة كشف الحساب الحراري
  const handlePrintThermalSlip = () => {
    posAudio.playTap();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 select-none animate-in fade-in duration-150 font-cairo"
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div 
        className="w-full max-w-6xl max-h-[96vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================
            1. الهيدر الرئيسي مع اختيار البائع والفترة
            ======================================================== */}
        <header className="bg-slate-950 border-b border-slate-800 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* عنوان الكشف واسم البائع */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  كشف حساب ومبيعات البائع
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  تفصيلي بالحبّة والإجمالي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة مبيعات اليوم والشهر، تفصيل الأصناف المباعة، وسجل الفواتير
              </p>
            </div>
          </div>

          {/* قائمة اختيار البائع (Dropdown) وأزرار الإغلاق والطباعة */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* اختيار البائع */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-400 hidden xs:inline">البائع:</span>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  posAudio.playTap();
                  setSelectedEmpId(e.target.value);
                }}
                className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-amber-400 font-bold">🌟 جميع البائعين (تقرير إجمالي)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-white font-bold">
                    {emp.name} ({emp.code} - {emp.role})
                  </option>
                ))}
              </select>
            </div>

            {/* زر النسخ */}
            <button
              onClick={handleCopyToClipboard}
              title="نسخ كشف الحساب"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">نسخ الكشف</span>
            </button>

            {/* زر التصدير CSV */}
            <button
              onClick={handleExportCSV}
              title="تصدير Excel/CSV"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">تصدير Excel</span>
            </button>

            {/* زر الطباعة */}
            <button
              onClick={handlePrintThermalSlip}
              title="طباعة تقرير كشف الحساب"
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف</span>
            </button>

            {/* زر الإغلاق */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* ========================================================
            2. شريط الفترات الزمنية (اليوم، الأسبوع، الشهر، شامل)
            ======================================================== */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-bold text-slate-400 pl-1">فترة التقرير:</span>
            
            <button
              onClick={() => { posAudio.playTap(); setSelectedPeriod('today'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'today'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>اليوم</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setSelectedPeriod('this_week'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'this_week'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>هذا الأسبوع</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setSelectedPeriod('this_month'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'this_month'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>هذا الشهر</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setSelectedPeriod('all_time'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'all_time'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>شامل الكل</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setSelectedPeriod('custom'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'custom'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>تاريخ مخصص</span>
            </button>
          </div>

          {/* منتقي التاريخ المخصص إذا تم اختياره */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400">من:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-950 text-white px-2 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700"
              />
              <span className="text-[11px] text-slate-400">إلى:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-950 text-white px-2 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700"
              />
            </div>
          )}

          <div className="text-xs text-slate-400 font-bold hidden md:block">
            الفترة الحالية: <span className="text-amber-400 font-black">{statement.periodLabel}</span>
          </div>
        </div>

        {/* ========================================================
            3. كروت الملخص المالي السريع للبائع (مبيعات اليوم والشهر)
            ======================================================== */}
        <div className="p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 shrink-0 bg-slate-900/60 border-b border-slate-800">
          
          {/* كرت 1: مبيعات اليوم كاملة */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-3 sm:p-3.5 rounded-2xl border border-emerald-500/30 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs font-black text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                مبيعات اليوم كاملة
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 font-mono">
                {statement.todayOrdersCount} طلب
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
              {statement.todaySales.toFixed(3)}{' '}
              <span className="text-xs font-sans text-emerald-400 font-bold">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-1 flex items-center justify-between border-t border-emerald-500/10 pt-1">
              <span>إجمالي الحبات اليوم:</span>
              <span className="text-emerald-300 font-mono font-black">{statement.todayItemsCount} حبة</span>
            </div>
          </div>

          {/* كرت 2: مبيعات الشهر كاملة */}
          <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 p-3 sm:p-3.5 rounded-2xl border border-blue-500/30 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs font-black text-blue-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                مبيعات الشهر كاملة
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 font-mono">
                {statement.monthOrdersCount} طلب
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
              {statement.monthSales.toFixed(3)}{' '}
              <span className="text-xs font-sans text-blue-400 font-bold">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-1 flex items-center justify-between border-t border-blue-500/10 pt-1">
              <span>إجمالي الحبات بالشهر:</span>
              <span className="text-blue-300 font-mono font-black">{statement.monthItemsCount} حبة</span>
            </div>
          </div>

          {/* كرت 3: إجمالي مبيعات الفترة المحددة */}
          <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 p-3 sm:p-3.5 rounded-2xl border border-amber-500/30 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs font-black text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                إجمالي الفترة المحددة
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 font-mono">
                {statement.totalOrdersCount} طلب
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
              {statement.totalSales.toFixed(3)}{' '}
              <span className="text-xs font-sans text-slate-300 font-bold">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-1 flex items-center justify-between border-t border-amber-500/10 pt-1">
              <span>متوسط الفاتورة:</span>
              <span className="text-slate-200 font-mono font-black">{statement.averageOrderValue.toFixed(3)} {currency}</span>
            </div>
          </div>

          {/* كرت 4: إجمالي الحبات المباعة وتوزيع الدفع */}
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 p-3 sm:p-3.5 rounded-2xl border border-purple-500/30 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs font-black text-purple-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                إجمالي عدد الحبات المباعة
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 font-mono">
                {statement.itemBreakdown.length} صنف
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
              {statement.totalItemsCount}{' '}
              <span className="text-xs font-sans text-purple-300 font-bold">حبة / وجبة</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-1 flex items-center justify-between border-t border-purple-500/10 pt-1">
              <span>كاش: <span className="text-white font-mono font-bold">{statement.paymentBreakdown.cash.toFixed(1)}</span></span>
              <span>شبكة: <span className="text-white font-mono font-bold">{statement.paymentBreakdown.card.toFixed(1)}</span></span>
            </div>
          </div>

        </div>

        {/* ========================================================
            4. التبويبات الثلاثة (الأصناف بالحبة | الفواتير | التحليل)
            ======================================================== */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { posAudio.playTap(); setActiveTab('items'); }}
              className={`py-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'items'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>كشف الأصناف المباعة بالحبّة والإجمالي</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono font-bold">
                {filteredItems.length}
              </span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setActiveTab('invoices'); }}
              className={`py-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'invoices'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>سجل الفواتير التفصيلي</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono font-bold">
                {statement.invoices.length}
              </span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setActiveTab('analytics'); }}
              className={`py-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>تحليل الأقسام وطرق الدفع</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-bold hidden lg:block">
            البائع: <span className="text-white font-black">{statement.employeeName}</span> ({statement.employeeRole})
          </div>
        </div>

        {/* ========================================================
            5. محتوى التبويبات
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-950">
          
          {/* ----------------------------------------------------
              تبويب 1: كشف الأصناف المباعة بالحبّة والإجمالي
              ---------------------------------------------------- */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              
              {/* شريط البحث والفلترة والفرز */}
              <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                
                {/* البحث عن صنف */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="ابحث عن اسم الوجبة أو القسم..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                  />
                  {itemSearch && (
                    <button 
                      onClick={() => setItemSearch('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* تصفية حسب القسم */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold">القسم:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">جميع الأقسام ({statement.itemBreakdown.length})</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* خيارات الفرز */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold">الترتيب:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="qty">الكمية بالحبّة (الأكثر مبيعاً)</option>
                    <option value="total">إجمالي المبيعات (الأعلى إيراداً)</option>
                    <option value="price">سعر الحبة</option>
                    <option value="name">أبجدياً (اسم الصنف)</option>
                  </select>

                  <button
                    onClick={() => {
                      posAudio.playTap();
                      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                    }}
                    title="عكس اتجاه الترتيب"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* جدول الأصناف التفصيلي */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-black text-xs">
                        <th className="py-3 px-3 text-center w-12">#</th>
                        <th className="py-3 px-4">اسم الصنف / الوجبة</th>
                        <th className="py-3 px-3">القسم</th>
                        <th className="py-3 px-3 text-center">سعر الحبة</th>
                        <th className="py-3 px-4 text-center bg-amber-500/10 text-amber-300 font-black">
                          الكمية المباعة (بالحبّة)
                        </th>
                        <th className="py-3 px-4 text-left bg-emerald-500/10 text-emerald-300 font-black">
                          الإجمالي المالي
                        </th>
                        <th className="py-3 px-4 text-center w-36">النسبة والمؤشر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredItems.map((item, idx) => {
                        const isTop = idx < 3 && sortBy === 'qty';
                        return (
                          <tr 
                            key={item.itemId || idx}
                            className="hover:bg-slate-800/60 transition-colors group"
                          >
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                              {isTop ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                                  {idx + 1}
                                </span>
                              ) : (
                                idx + 1
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-black text-white flex items-center gap-1.5">
                                {isTop && <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                <span>{item.itemName}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                                {item.category}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                              {item.unitPrice.toFixed(3)} <span className="text-[10px] text-slate-500">{currency}</span>
                            </td>

                            <td className="py-3 px-4 text-center bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">
                              <span className="inline-block px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-sm border border-amber-500/40 shadow-xs">
                                {item.quantitySold} <span className="text-[10px] font-sans">حبة</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 text-left font-mono font-black text-emerald-400 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors text-sm">
                              {item.totalSales.toFixed(3)}{' '}
                              <span className="text-xs font-sans text-slate-400 font-bold">{currency}</span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                                  <span>المساهمة:</span>
                                  <span className="text-amber-400">{item.percentageOfTotal}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(item.percentageOfTotal * 3, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                            لا توجد أصناف مطابقة للبحث في هذه الفترة
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* صف المجموع الإجمالي */}
                    <tfoot>
                      <tr className="bg-slate-950 font-black text-white border-t-2 border-slate-700 text-xs sm:text-sm">
                        <td colSpan={4} className="py-3.5 px-4 text-right">
                          المجموع الإجمالي للأصناف المباعة ({filteredItems.length} صنف):
                        </td>
                        <td className="py-3.5 px-4 text-center bg-amber-500/20 text-amber-300 font-mono font-black text-base border-r border-l border-amber-500/30">
                          {filteredItems.reduce((sum, it) => sum + it.quantitySold, 0)} حبة
                        </td>
                        <td className="py-3.5 px-4 text-left bg-emerald-500/20 text-emerald-300 font-mono font-black text-base border-r border-l border-emerald-500/30">
                          {filteredItems.reduce((sum, it) => sum + it.totalSales, 0).toFixed(3)} {currency}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-amber-400">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------
              تبويب 2: سجل الفواتير التفصيلي للبائع
              ---------------------------------------------------- */}
          {activeTab === 'invoices' && (
            <div className="space-y-3">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-black text-xs">
                        <th className="py-3 px-3 text-center">#</th>
                        <th className="py-3 px-4">رقم الفاتورة</th>
                        <th className="py-3 px-3">التاريخ والوقت</th>
                        <th className="py-3 px-3">القناة / الصالة</th>
                        <th className="py-3 px-3">العميل / الطاولة</th>
                        <th className="py-3 px-3 text-center">طريقة السداد</th>
                        <th className="py-3 px-3 text-center">عدد الحبات</th>
                        <th className="py-3 px-4 text-left">إجمالي الفاتورة</th>
                        <th className="py-3 px-3 text-center">معاينة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {statement.invoices.map((inv, idx) => (
                        <tr key={inv.id || idx} className="hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-black text-amber-400">{inv.orderNumber}</td>
                          <td className="py-3 px-3 font-mono text-slate-300 text-xs">
                            {inv.dateStr} <span className="text-slate-500">{inv.timeStr}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              inv.channel === 'dine_in' ? 'bg-amber-500/20 text-amber-300' :
                              inv.channel === 'takeaway' ? 'bg-blue-500/20 text-blue-300' :
                              inv.channel === 'delivery' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {inv.channelLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-white">{inv.customerName || inv.tableName || '-'}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                              {inv.paymentMethodLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-amber-300">
                            {inv.itemsCount} حبة
                          </td>
                          <td className="py-3 px-4 text-left font-mono font-black text-emerald-400 text-sm">
                            {inv.total.toFixed(3)} {currency}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                posAudio.playTap();
                                setSelectedInvoice(inv);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 cursor-pointer"
                            >
                              عرض الأصناف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              تبويب 3: تحليل الأقسام وطرق الدفع
              ---------------------------------------------------- */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* بطاقة توزيع الأقسام */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-black text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  <span>توزيع مبيعات البائع حسب أقسام المنيو</span>
                </h3>

                <div className="space-y-2.5">
                  {allCategories.map(cat => {
                    const catItems = statement.itemBreakdown.filter(it => it.category === cat);
                    const catQty = catItems.reduce((sum, it) => sum + it.quantitySold, 0);
                    const catTotal = Math.round(catItems.reduce((sum, it) => sum + it.totalSales, 0) * 1000) / 1000;
                    const catPercent = statement.totalSales > 0 ? Math.round((catTotal / statement.totalSales) * 100 * 10) / 10 : 0;

                    return (
                      <div key={cat} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-white font-black">{cat} ({catItems.length} وجبة)</span>
                          <span className="font-mono text-amber-400">{catTotal.toFixed(3)} {currency} ({catPercent}%)</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5">
                          <span>الكمية المباعة:</span>
                          <span className="font-mono text-slate-200 font-bold">{catQty} حبة</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${catPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* بطاقة تفصيل طرق السداد */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-black text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>توزيع مبيعات البائع حسب طرق الدفع</span>
                </h3>

                <div className="space-y-3">
                  
                  {/* كاش نقدي */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        💵
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">نقدي (كاش الصندوق)</div>
                        <div className="text-[10px] text-slate-400">السيولة النقدية المستلمة في الدرج</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-black text-emerald-400 text-sm">
                      {statement.paymentBreakdown.cash.toFixed(3)} {currency}
                    </div>
                  </div>

                  {/* بطاقة شبكة */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        💳
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">بطاقة بنكية / شبكة مدى</div>
                        <div className="text-[10px] text-slate-400">أجهزة نقاط البيع الإلكترونية POS</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-black text-blue-400 text-sm">
                      {statement.paymentBreakdown.card.toFixed(3)} {currency}
                    </div>
                  </div>

                  {/* تحويل بنكي */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        🏦
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">تحويل بنكي مباشر</div>
                        <div className="text-[10px] text-slate-400">إيداعات الحساب البنكي للمطعم</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-black text-purple-400 text-sm">
                      {statement.paymentBreakdown.transfer.toFixed(3)} {currency}
                    </div>
                  </div>

                  {/* تطبيقات التوصيل */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        🛵
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">تطبيقات التوصيل / آجل</div>
                        <div className="text-[10px] text-slate-400">طلبات التوصيل والتطبيقات الخارجية</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-black text-amber-400 text-sm">
                      {statement.paymentBreakdown.apps.toFixed(3)} {currency}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================
            6. الفوتر السفلي مع معلومات الموظف
            ======================================================== */}
        <footer className="bg-slate-950 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between text-xs text-slate-400 font-bold shrink-0">
          <div className="flex items-center gap-3">
            <span>البائع: <span className="text-white font-black">{statement.employeeName}</span></span>
            <span>الكود: <span className="font-mono text-amber-400 font-black">{statement.employeeCode}</span></span>
            <span>الوظيفة: <span className="text-slate-300">{statement.employeeRole}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <span>مبيعات اليوم: <span className="font-mono text-emerald-400 font-black">{statement.todaySales.toFixed(3)} {currency}</span></span>
            <span>•</span>
            <span>مبيعات الشهر: <span className="font-mono text-blue-400 font-black">{statement.monthSales.toFixed(3)} {currency}</span></span>
          </div>
        </footer>

      </div>

      {/* ========================================================
          7. نافذة منبثقة لمعاينة أصناف فاتورة محددة
          ======================================================== */}
      {selectedInvoice && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
              <div>
                <h4 className="font-black text-white text-base">تفاصيل الفاتورة {selectedInvoice.orderNumber}</h4>
                <span className="text-xs text-slate-400">{selectedInvoice.dateStr} - {selectedInvoice.timeStr}</span>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {selectedInvoice.items.map((it, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-black text-white">{it.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{it.price.toFixed(3)} {currency} × {it.qty} حبة</div>
                  </div>
                  <div className="font-mono font-black text-amber-400">
                    {(it.price * it.qty).toFixed(3)} {currency}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs mb-4">
              <div className="flex justify-between text-slate-400">
                <span>القناة / الطاولة:</span>
                <span className="text-white font-bold">{selectedInvoice.channelLabel} - {selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>طريقة السداد:</span>
                <span className="text-emerald-400 font-bold">{selectedInvoice.paymentMethodLabel}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-800">
                <span>إجمالي الفاتورة:</span>
                <span className="text-amber-400 font-mono">{selectedInvoice.total.toFixed(3)} {currency}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          8. قالب الطباعة الحرارية لكشف حساب البائع (Thermal Slip)
          ======================================================== */}
      <div 
        ref={printRef}
        id="thermal-seller-statement"
        className="hidden print:block p-4 text-black bg-white font-mono text-xs max-w-[80mm] mx-auto"
      >
        <div className="text-center pb-2 border-b border-black">
          <h2 className="text-base font-black">مطعم ومطبخ الأصالة الملكي</h2>
          <p className="text-xs font-bold mt-1">كشف حساب ومبيعات البائع التفصيلي</p>
          <p className="text-[10px] mt-0.5">البائع: {statement.employeeName} ({statement.employeeCode})</p>
          <p className="text-[10px]">الفترة: {statement.periodLabel}</p>
          <p className="text-[10px]">تاريخ التقرير: {new Date().toLocaleString('ar-EG')}</p>
        </div>

        {/* مبيعات اليوم والشهر */}
        <div className="py-2 border-b border-black space-y-1 text-[11px]">
          <div className="flex justify-between font-bold">
            <span>مبيعات اليوم:</span>
            <span>{statement.todaySales.toFixed(3)} {currency} ({statement.todayItemsCount} حبة)</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>مبيعات الشهر:</span>
            <span>{statement.monthSales.toFixed(3)} {currency} ({statement.monthItemsCount} حبة)</span>
          </div>
          <div className="flex justify-between font-black pt-1 border-t border-dashed border-black">
            <span>إجمالي مبيعات الفترة:</span>
            <span>{statement.totalSales.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span>عدد الفواتير الصادرة:</span>
            <span>{statement.totalOrdersCount} طلب</span>
          </div>
          <div className="flex justify-between">
            <span>إجمالي الحبات المباعة:</span>
            <span>{statement.totalItemsCount} حبة</span>
          </div>
        </div>

        {/* تفصيل الأصناف بالحبة */}
        <div className="py-2 border-b border-black">
          <div className="font-black text-center mb-1">تفصيل الأصناف المباعة بالحبّة:</div>
          <table className="w-full text-right text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-0.5">الصنف</th>
                <th className="py-0.5 text-center">الحبات</th>
                <th className="py-0.5 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {statement.itemBreakdown.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-0.5">{it.itemName}</td>
                  <td className="py-0.5 text-center font-bold">{it.quantitySold}</td>
                  <td className="py-0.5 text-left font-bold">{it.totalSales.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* توزيع طرق الدفع */}
        <div className="pt-2 text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>كاش نقدي:</span>
            <span>{statement.paymentBreakdown.cash.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span>شبكة بنكية:</span>
            <span>{statement.paymentBreakdown.card.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span>تحويل بنكي:</span>
            <span>{statement.paymentBreakdown.transfer.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span>تطبيقات توصيل:</span>
            <span>{statement.paymentBreakdown.apps.toFixed(3)} {currency}</span>
          </div>
          <p className="text-center pt-2 font-bold text-[9px]">نظام نقاط البيع والكاشير المعتمد</p>
        </div>
      </div>

    </div>
  );
};
