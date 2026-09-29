import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Plus, 
  Calendar, 
  FileText, 
  Download, 
  Filter, 
  Trash2, 
  Receipt,
  Building,
  Users,
  Zap,
  Package,
  Wrench,
  Megaphone,
  Briefcase
} from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { OperatingExpense, ExpenseCategory, POSSettings } from '../types';
import { calculateInvoicesCogs, DEFAULT_MEAL_RECIPES } from '../data/recipeData';
import { posAudio } from '../utils/audio';

interface ProfitLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  settledOrders: InvoOrder[];
  expenses: OperatingExpense[];
  onUpdateExpenses: (expenses: OperatingExpense[]) => void;
  settings: POSSettings;
}

export const ProfitLossModal: React.FC<ProfitLossModalProps> = ({
  isOpen,
  onClose,
  settledOrders = [],
  expenses = [],
  onUpdateExpenses = (_newExp: OperatingExpense[]) => {},
  settings,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);

  // New Expense form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('salaries');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [newNotes, setNewNotes] = useState<string>('');

  // Filter settled orders by period
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return settledOrders.filter(order => {
      if (selectedPeriod === 'all') return true;
      if (!order.createdAt) return true;
      const orderTime = order.createdAt;
      if (selectedPeriod === 'today') {
        return now - orderTime <= 24 * 60 * 60 * 1000;
      }
      if (selectedPeriod === 'week') {
        return now - orderTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (selectedPeriod === 'month') {
        return now - orderTime <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [settledOrders, selectedPeriod]);

  // Financial calculations
  const grossSales = useMemo(() => {
    return (filteredOrders || []).reduce((sum, ord) => sum + (ord.subtotal ?? ord.total ?? 0), 0);
  }, [filteredOrders]);

  const discountsGiven = useMemo(() => {
    return (filteredOrders || []).reduce((sum, ord) => sum + (ord.discount || 0), 0);
  }, [filteredOrders]);

  const taxCollected = useMemo(() => {
    return (filteredOrders || []).reduce((sum, ord) => sum + (ord.tax || 0), 0);
  }, [filteredOrders]);

  const netSales = grossSales - discountsGiven;

  // COGS / Food Cost calculation
  const cogsFoodCost = useMemo(() => {
    return calculateInvoicesCogs(filteredOrders || [], DEFAULT_MEAL_RECIPES);
  }, [filteredOrders]);

  const grossProfit = netSales - cogsFoodCost;
  const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter(exp => {
      if (selectedCategoryFilter === 'all') return true;
      return exp.category === selectedCategoryFilter;
    });
  }, [expenses, selectedCategoryFilter]);

  const totalOperatingExpenses = useMemo(() => {
    return (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  const netProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = netSales > 0 ? (netProfit / netSales) * 100 : 0;

  // Handle adding new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      posAudio.playError();
      alert('يرجى إدخال عنوان ومبلغ صالح للمصروف');
      return;
    }

    const newExp: OperatingExpense = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      amount: parsedAmount,
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'المدير العام',
      paymentMethod: newPaymentMethod,
      notes: newNotes.trim() || undefined,
    };

    onUpdateExpenses([newExp, ...expenses]);
    posAudio.playSuccess();
    setShowAddExpenseModal(false);
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      onUpdateExpenses(expenses.filter(e => e.id !== id));
      posAudio.playTap();
    }
  };

  const getCategoryMeta = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'salaries':
        return { label: 'رواتب وأجور', icon: Users, color: 'text-blue-400 bg-blue-950/60 border-blue-800' };
      case 'rent':
        return { label: 'إيجار المحل', icon: Building, color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      case 'utilities':
        return { label: 'كهرباء ومياه وغاز', icon: Zap, color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800' };
      case 'packaging':
        return { label: 'تغليف وأكياس', icon: Package, color: 'text-purple-400 bg-purple-950/60 border-purple-800' };
      case 'maintenance':
        return { label: 'صيانة ومعدات', icon: Wrench, color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
      case 'marketing':
        return { label: 'تسويق وإعلانات', icon: Megaphone, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
      default:
        return { label: 'مصاريف أخرى', icon: Briefcase, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">لوحة الأرباح والخسائر والتحليل المالي (P&L Dashboard)</h2>
              <p className="text-xs text-slate-400">
                حساب صافي المبيعات، تكلفة المواد الأولية COGS، والمصروفات التشغيلية لحساب صافي الربح الحقيقي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedPeriod('today')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPeriod === 'today' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                اليوم
              </button>
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPeriod === 'week' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                الأسبوع
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPeriod === 'month' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                الشهر
              </button>
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPeriod === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
            </div>

            <button
              onClick={() => { posAudio.playTap(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Key Metric Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Net Sales */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>صافي الإيرادات (Net Sales)</span>
                <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  {filteredOrders.length} فواتير
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-mono-num text-white">
                  {netSales.toFixed(3)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  إجمالي قبل الخصم: {grossSales.toFixed(3)} | خصومات: {discountsGiven.toFixed(3)}
                </p>
              </div>
            </div>

            {/* 2. COGS (Food Cost) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>تكلفة المقادير والمواد (COGS)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  {netSales > 0 ? ((cogsFoodCost / netSales) * 100).toFixed(1) : 0}% من المبيعات
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-mono-num text-amber-400">
                  {cogsFoodCost.toFixed(3)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  محسوبة آلياً من وصفات المواد الأولية للوجبات
                </p>
              </div>
            </div>

            {/* 3. Operating Expenses */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>المصروفات التشغيلية (Opex)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                  {expenses.length} بنود
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-mono-num text-rose-400">
                  {totalOperatingExpenses.toFixed(3)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  رواتب، إيجار، كهرباء، صيانة ومصروفات نثرية
                </p>
              </div>
            </div>

            {/* 4. NET PROFIT */}
            <div className={`border rounded-3xl p-4.5 flex flex-col justify-between shadow-xl ${
              netProfit >= 0 
                ? 'bg-gradient-to-br from-emerald-950/60 to-slate-950 border-emerald-500/40 text-emerald-300' 
                : 'bg-gradient-to-br from-rose-950/60 to-slate-950 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold">صافي الربح الفعلي (Net Profit)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  هامش: {netMarginPercent.toFixed(1)}%
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black font-mono-num">
                  {netProfit.toFixed(3)} <span className="text-xs font-normal opacity-80">{settings.currency}</span>
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  {netProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{netProfit >= 0 ? 'العمليات في منطقة ربحية ممتازة' : 'يوجد عجز تشغيلي يحتاج ترشيداً'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Visual Breakdown Bar */}
          <div className="bg-slate-950/70 p-4 rounded-3xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>توزيع المبيعات والإيرادات (Income Breakdown)</span>
            </h4>
            <div className="h-6 w-full bg-slate-800 rounded-xl overflow-hidden flex">
              {netSales > 0 ? (
                <>
                  <div 
                    style={{ width: `${Math.min(100, Math.max(0, (cogsFoodCost / netSales) * 100))}%` }} 
                    className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                    title={`تكلفة المواد: ${cogsFoodCost.toFixed(3)}`}
                  >
                    مواد {((cogsFoodCost / netSales) * 100).toFixed(0)}%
                  </div>
                  <div 
                    style={{ width: `${Math.min(100, Math.max(0, (totalOperatingExpenses / netSales) * 100))}%` }} 
                    className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
                    title={`مصروفات تشغيل: ${totalOperatingExpenses.toFixed(3)}`}
                  >
                    تشغيل {((totalOperatingExpenses / netSales) * 100).toFixed(0)}%
                  </div>
                  {netProfit > 0 && (
                    <div 
                      style={{ width: `${Math.min(100, Math.max(0, (netProfit / netSales) * 100))}%` }} 
                      className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                      title={`صافي ربح: ${netProfit.toFixed(3)}`}
                    >
                      ربح صافي {((netProfit / netSales) * 100).toFixed(0)}%
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full text-center text-xs text-slate-500 py-1">لا توجد مبيعات في هذه الفترة</div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>تكلفة المقادير (COGS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>المصروفات التشغيلية</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>صافي الربح التجاري</span>
              </div>
            </div>
          </div>

          {/* Operating Expenses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">سجل المصروفات التشغيلية للمحل</h3>
                <p className="text-xs text-slate-400">إدارة وتقييد الإيجار والرواتب وفواتير الصيانة الدورية</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">جميع الفئات</option>
                  <option value="salaries">رواتب وأجور</option>
                  <option value="rent">إيجار</option>
                  <option value="utilities">كهرباء ومياه</option>
                  <option value="packaging">تغليف وسفري</option>
                  <option value="maintenance">صيانة</option>
                  <option value="marketing">تسويق</option>
                </select>

                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل مصروف جديد</span>
                </button>
              </div>
            </div>

            {/* Expenses List Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 uppercase sticky top-0">
                    <tr>
                      <th className="p-3.5">بند المصروف</th>
                      <th className="p-3.5">الفئة</th>
                      <th className="p-3.5">التاريخ</th>
                      <th className="p-3.5">المسؤول</th>
                      <th className="p-3.5">طريقة الدفع</th>
                      <th className="p-3.5">المبلغ</th>
                      <th className="p-3.5 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredExpenses.map((exp) => {
                      const meta = getCategoryMeta(exp.category);
                      const Icon = meta.icon;
                      return (
                        <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold text-white">
                            <div>{exp.title}</div>
                            {exp.notes && <div className="text-[10px] text-slate-500 font-normal">{exp.notes}</div>}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 w-fit ${meta.color}`}>
                              <Icon className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono-num">{exp.date}</td>
                          <td className="p-3.5 text-slate-300">{exp.recordedBy}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">
                              {exp.paymentMethod === 'cash' ? 'نقدي من الصندوق' : 'تحويل بنكي'}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold font-mono-num text-rose-400 text-sm">
                            {exp.amount.toFixed(3)} {settings.currency}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="حذف المصروف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>مطعم {settings.restaurantName} - نظام التحليل المالي المتوافق مع المعايير المحاسبية</span>
          </div>
          <button
            onClick={() => {
              posAudio.playPrintSound();
              alert('تم تجهيز كشف الأرباح والخسائر للطباعة والتصدير!');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير تقرير P&L</span>
          </button>
        </div>

        {/* Add Expense Submodal */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold">تسجيل مصروف تشغيلي جديد</h4>
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">وصف المصروف</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: فاتورة كهرباء وتكييف لشهر سبتمبر"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">المبلغ ({settings.currency})</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.000"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">فئة المصروف</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="salaries">رواتب وأجور</option>
                      <option value="rent">إيجار المحل</option>
                      <option value="utilities">كهرباء ومياه وغاز</option>
                      <option value="packaging">تغليف وأكياس</option>
                      <option value="maintenance">صيانة ومعدات</option>
                      <option value="marketing">تسويق وإعلانات</option>
                      <option value="general">مصاريف عامة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">طريقة الدفع</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPaymentMethod('cash')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        newPaymentMethod === 'cash' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      نقداً من درج الكاش
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPaymentMethod('transfer')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        newPaymentMethod === 'transfer' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      تحويل بنكي
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="رقم السند أو الفاتورة الضريبية للمورد..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    حفظ المصروف
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
