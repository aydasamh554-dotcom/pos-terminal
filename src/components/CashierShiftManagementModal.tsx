import React, { useState, useMemo } from 'react';
import { 
  CashierSession, 
  POSSettings, 
  ShiftRecord, 
  Employee, 
  CashMovement,
  Order 
} from '../types';
import { EMPLOYEES_LIST, HISTORICAL_SHIFTS } from '../data/mockData';
import { posAudio } from '../utils/audio';
import { CashierShiftPrintReport } from './CashierShiftPrintReport';
import { 
  User, 
  X, 
  Lock, 
  Power, 
  DollarSign, 
  Clock, 
  Calendar, 
  CreditCard, 
  Layers, 
  LogOut,
  Sparkles,
  Wifi,
  Volume2,
  VolumeX,
  Printer,
  FileText,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  PlusCircle,
  MinusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Percent,
  Coins
} from 'lucide-react';

interface CashierShiftManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: CashierSession;
  settings: POSSettings;
  orders: Order[];
  historicalShifts?: ShiftRecord[];
  onToggleSound: () => void;
  onOpenIpModal: () => void;
  onLockTerminal: () => void;
  onEndShift: (closedShift: ShiftRecord) => void;
  onAddCashMovement?: (movement: CashMovement) => void;
}

type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';
type TabType = 'active_shift' | 'history' | 'print_report';

export const CashierShiftManagementModal: React.FC<CashierShiftManagementModalProps> = ({
  isOpen,
  onClose,
  cashier,
  settings,
  orders,
  historicalShifts,
  onToggleSound,
  onOpenIpModal,
  onLockTerminal,
  onEndShift,
  onAddCashMovement,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<TabType>('active_shift');

  // Real Persistent Historical Shifts
  const [persistedShifts, setPersistedShifts] = useState<ShiftRecord[]>(() => {
    try {
      const saved = localStorage.getItem('invo_historical_shifts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Archive & History Filter States
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected shift to view / print in Z-report tab
  const [selectedShiftForReport, setSelectedShiftForReport] = useState<ShiftRecord | null>(null);

  // Shift closing / Drawer cash counting state
  const [actualCountedCash, setActualCountedCash] = useState<number | ''>('');
  const [differenceNote, setDifferenceNote] = useState<string>('');
  const [showDenominations, setShowDenominations] = useState<boolean>(false);
  const [denominations, setDenominations] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });

  // New Cash Movement Dialog (Petty Cash or Cash In)
  const [showMovementDialog, setShowMovementDialog] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'cash_in' | 'cash_out'>('cash_out');
  const [movementAmount, setMovementAmount] = useState<string>('');
  const [movementReason, setMovementReason] = useState<string>('');

  // Confirmation before closing shift
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState<boolean>(false);

  // -------------------------------------------------------------
  // CURRENT ACTIVE SHIFT CALCULATIONS
  // -------------------------------------------------------------
  // Live orders channel metrics
  const dineInOrders = orders.filter(o => o.type === 'dine_in' && o.status !== 'cancelled');
  const deliveryOrders = orders.filter(o => o.type === 'delivery' && o.status !== 'cancelled');
  const takeawayOrders = orders.filter(o => o.type === 'takeaway' && o.status !== 'cancelled');
  const pickupOrders = orders.filter(o => o.type === 'pickup' && o.status !== 'cancelled');

  const totalDineIn = dineInOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDelivery = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTakeaway = takeawayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPickup = pickupOrders.reduce((sum, o) => sum + o.total, 0);

  const currentTotalSales = cashier.totalCashSales + cashier.totalCardSales;
  const currentTotalDiscount = orders.reduce((sum, o) => sum + o.discount, 0);
  const currentTotalTax = orders.reduce((sum, o) => sum + o.tax, 0);

  // Expected Cash in Drawer = Opening Cash + Cash Sales + Cash In - Cash Out
  const expectedCashInDrawer = 
    cashier.openingCash + 
    cashier.totalCashSales + 
    (cashier.cashIn || 0) - 
    (cashier.cashOut || 0);

  // Calculate live difference based on entered counted cash
  const numericCountedCash = typeof actualCountedCash === 'number' ? actualCountedCash : expectedCashInDrawer;
  const liveDifference = numericCountedCash - expectedCashInDrawer;

  const isShortage = liveDifference < -0.01;
  const isSurplus = liveDifference > 0.01;
  const isBalanced = !isShortage && !isSurplus;

  // Update actual cash from denominations counter
  const handleDenominationChange = (value: number, count: number) => {
    const updated = { ...denominations, [value]: Math.max(0, count) };
    setDenominations(updated);

    const totalSum = Object.entries(updated).reduce((sum, [val, cnt]) => {
      return sum + Number(val) * Number(cnt);
    }, 0);

    setActualCountedCash(totalSum);
  };

  // -------------------------------------------------------------
  // CURRENT ACTIVE SHIFT OBJECT FOR PREVIEW/PRINTING
  // -------------------------------------------------------------
  const currentShiftRecord: ShiftRecord = {
    id: `shift-active-${cashier.shiftNumber}`,
    shiftNumber: cashier.shiftNumber,
    cashierId: cashier.id,
    cashierName: cashier.cashierName,
    cashierCode: cashier.cashierCode,
    date: new Date().toISOString().split('T')[0],
    startTime: cashier.startTime,
    endTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: 'open',
    openingCash: cashier.openingCash,
    cashSales: cashier.totalCashSales,
    cardSales: cashier.totalCardSales,
    onlineSales: 0,
    totalSales: currentTotalSales,
    totalOrdersCount: cashier.totalOrdersCount,
    totalDiscount: currentTotalDiscount,
    totalTax: currentTotalTax,
    cashIn: cashier.cashIn || 0,
    cashOut: cashier.cashOut || 0,
    expectedCash: expectedCashInDrawer,
    actualCashCounted: typeof actualCountedCash === 'number' ? actualCountedCash : expectedCashInDrawer,
    difference: liveDifference,
    differenceReason: differenceNote || (isShortage ? 'عجز نقدي في الدرج' : isSurplus ? 'زيادة نقدية في الدرج' : 'مطابق 100%'),
    channelBreakdown: {
      dineIn: { count: dineInOrders.length, total: totalDineIn },
      delivery: { count: deliveryOrders.length, total: totalDelivery },
      takeaway: { count: takeawayOrders.length, total: totalTakeaway },
      pickup: { count: pickupOrders.length, total: totalPickup },
    },
    movements: cashier.movements || [],
    notes: 'الوردية الحالية المفتوحة'
  };

  // -------------------------------------------------------------
  // FILTERING HISTORICAL SHIFTS
  // -------------------------------------------------------------
  const allShifts = useMemo(() => {
    // Prefer real saved historical shifts; fallback to initial list if empty
    const realHistory = historicalShifts && historicalShifts.length > 0 
      ? historicalShifts 
      : persistedShifts.length > 0 
        ? persistedShifts 
        : HISTORICAL_SHIFTS;
    return [currentShiftRecord, ...realHistory];
  }, [currentShiftRecord, historicalShifts, persistedShifts]);

  const filteredShifts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    return allShifts.filter((shift) => {
      // 1. Employee Filter
      if (selectedEmployeeId !== 'all') {
        const emp = EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId);
        if (emp && shift.cashierName !== emp.name && shift.cashierCode !== emp.code) {
          return false;
        }
      }

      // 2. Date Filter
      const shiftDate = shift.date;
      if (dateFilter === 'today') {
        if (shiftDate !== todayStr && shiftDate !== '2026-08-21') return false;
      } else if (dateFilter === 'yesterday') {
        if (shiftDate !== yesterdayStr && shiftDate !== '2026-08-20') return false;
      } else if (dateFilter === 'week') {
        // Last 7 days
        const shiftTime = new Date(shiftDate).getTime();
        const nowTime = new Date().getTime();
        const diffDays = (nowTime - shiftTime) / (1000 * 3600 * 24);
        if (diffDays > 7 && shiftDate < '2026-08-15') return false;
      } else if (dateFilter === 'month') {
        // Current month
        if (!shiftDate.startsWith('2026-08') && !shiftDate.startsWith(todayStr.slice(0, 7))) return false;
      } else if (dateFilter === 'year') {
        // Current year
        if (!shiftDate.startsWith('2026') && !shiftDate.startsWith(todayStr.slice(0, 4))) return false;
      } else if (dateFilter === 'custom') {
        if (startDate && shiftDate < startDate) return false;
        if (endDate && shiftDate > endDate) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = shift.cashierName.toLowerCase().includes(q);
        const matchCode = shift.cashierCode.toLowerCase().includes(q);
        const matchNumber = shift.shiftNumber.toString().includes(q);
        if (!matchName && !matchCode && !matchNumber) return false;
      }

      return true;
    });
  }, [allShifts, selectedEmployeeId, dateFilter, startDate, endDate, searchQuery]);

  // Aggregate metrics for filtered shifts
  const filteredMetrics = useMemo(() => {
    return filteredShifts.reduce(
      (acc, s) => {
        acc.totalSales += s.totalSales;
        acc.totalCash += s.cashSales;
        acc.totalCard += s.cardSales;
        acc.totalOrders += s.totalOrdersCount;
        acc.totalVat += s.totalTax;
        acc.totalDifference += s.difference;
        return acc;
      },
      { totalSales: 0, totalCash: 0, totalCard: 0, totalOrders: 0, totalVat: 0, totalDifference: 0 }
    );
  }, [filteredShifts]);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleAddMovement = () => {
    const amt = parseFloat(movementAmount);
    if (isNaN(amt) || amt <= 0 || !movementReason.trim()) {
      return;
    }

    const newMov: CashMovement = {
      id: `mov-${Date.now()}`,
      type: movementType,
      amount: amt,
      reason: movementReason.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      cashierName: cashier.cashierName,
    };

    posAudio.playCashRegister();
    if (onAddCashMovement) {
      onAddCashMovement(newMov);
    }
    setShowMovementDialog(false);
    setMovementAmount('');
    setMovementReason('');
  };

  const handleFinalizeShiftClosing = () => {
    posAudio.playSuccess();
    const finalShift: ShiftRecord = {
      ...currentShiftRecord,
      status: 'closed',
      endTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      actualCashCounted: typeof actualCountedCash === 'number' ? actualCountedCash : expectedCashInDrawer,
      difference: liveDifference,
      differenceReason: differenceNote || (isShortage ? 'عجز نقدي في الدرج' : isSurplus ? 'زيادة نقدية في الدرج' : 'مطابق'),
    };

    // Save to real persistent historical shifts in localStorage
    try {
      const existing: ShiftRecord[] = JSON.parse(localStorage.getItem('invo_historical_shifts') || '[]');
      const updated = [finalShift, ...existing.filter(s => s.id !== finalShift.id)];
      localStorage.setItem('invo_historical_shifts', JSON.stringify(updated));
      setPersistedShifts(updated);
    } catch (err) {
      console.error('Failed to save shift to invo_historical_shifts:', err);
    }

    onEndShift(finalShift);
    setShowCloseConfirmDialog(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200 select-none overflow-hidden">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* ============================================================ */}
        {/* MODAL HEADER */}
        {/* ============================================================ */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{cashier.cashierName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  وردية نشطة #{cashier.shiftNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-num">
                كود الكاشير: {cashier.cashierCode} • بدء الوردية: {cashier.startTime}
              </p>
            </div>
          </div>

          {/* Navigation Tabs Header */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => { posAudio.playTap(); setActiveTab('active_shift'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'active_shift'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>الوردية الحالية والجرد</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); setActiveTab('history'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>سجل التقفيلات والتقارير</span>
            </button>

            <button
              onClick={() => { 
                posAudio.playTap(); 
                setSelectedShiftForReport(currentShiftRecord);
                setActiveTab('print_report'); 
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'print_report'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير (Z-Report)</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-2.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ACTIVE SHIFT & DRAWER RECONCILIATION */}
        {/* ============================================================ */}
        {activeTab === 'active_shift' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Top Sales Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cash Sales */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">مبيعات الكاش (النقدي)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono-num">
                  {cashier.totalCashSales.toFixed(2)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">مقبوضات نقدية داخل الصندوق</p>
              </div>

              {/* Card / POS Sales */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400">مبيعات الشبكة (مدى / فيزا)</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono-num">
                  {cashier.totalCardSales.toFixed(2)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">إيداع بنكي مباشر عبر نقاط البيع</p>
              </div>

              {/* Total Shift Sales */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400">إجمالي مبيعات الوردية</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono-num">
                  {currentTotalSales.toFixed(2)} <span className="text-xs font-normal text-slate-400">{settings.currency}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">شامل الضريبة (15% VAT)</p>
              </div>

              {/* Orders Count & Average */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">الطلبات والفواتير</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono-num">
                  {cashier.totalOrdersCount} <span className="text-xs font-normal text-slate-400">فاتورة</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono-num">
                  متوسط الفاتورة: {cashier.totalOrdersCount > 0 ? (currentTotalSales / cashier.totalOrdersCount).toFixed(1) : 0} {settings.currency}
                </p>
              </div>
            </div>

            {/* Cash Drawer Audit & Reconciliation Box */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    تسوية ومطابقة رصيد الدرج المالي (Cash Drawer Reconciliation)
                  </h3>
                  <p className="text-xs text-slate-400">
                    حساب الرصيد المتوقع في الصندوق بدقة ومقارنته بالمبلغ الفعلي لكشف العجز أو الزيادة
                  </p>
                </div>

                <button
                  onClick={() => { posAudio.playTap(); setShowMovementDialog(true); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>تسجيل حركة نقدية (مصروف / إيداع)</span>
                </button>
              </div>

              {/* The Calculation Formula Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                {/* 1. Opening Cash */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">عهدة بداية الوردية</span>
                  <span className="text-base font-bold text-white font-mono-num">
                    {cashier.openingCash.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{settings.currency}</span>
                </div>

                {/* 2. Plus Cash Sales */}
                <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-800/40">
                  <span className="text-[11px] text-emerald-400 block mb-1">(+) مبيعات الكاش</span>
                  <span className="text-base font-bold text-emerald-400 font-mono-num">
                    +{cashier.totalCashSales.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{settings.currency}</span>
                </div>

                {/* 3. Plus Cash In */}
                <div className="p-3 bg-blue-950/30 rounded-2xl border border-blue-800/40">
                  <span className="text-[11px] text-blue-400 block mb-1">(+) إيداعات الدرج</span>
                  <span className="text-base font-bold text-blue-400 font-mono-num">
                    +{(cashier.cashIn || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{settings.currency}</span>
                </div>

                {/* 4. Minus Cash Out */}
                <div className="p-3 bg-rose-950/30 rounded-2xl border border-rose-800/40">
                  <span className="text-[11px] text-rose-400 block mb-1">(-) سحوبات ومصروفات</span>
                  <span className="text-base font-bold text-rose-400 font-mono-num">
                    -{(cashier.cashOut || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{settings.currency}</span>
                </div>

                {/* 5. Equals Expected Drawer Balance */}
                <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/50">
                  <span className="text-[11px] text-amber-300 font-bold block mb-1">(=) الرصيد المتوقع</span>
                  <span className="text-lg font-black text-amber-400 font-mono-num">
                    {expectedCashInDrawer.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-amber-300/80 block font-bold">{settings.currency}</span>
                </div>
              </div>

              {/* Actual Cash Count Input Section */}
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">
                        المبلغ الفعلي المجرود في الدرج (Actual Cash Count)
                      </span>
                      <span className="text-xs text-slate-400">
                        قم بعد النقدية الموجودة في الصندوق فعلياً وأدخل الإجمالي هنا:
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => { posAudio.playTap(); setShowDenominations(!showDenominations); }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>{showDenominations ? 'إخفاء حاسبة الفئات' : 'فتح حاسبة فئات النقدية (500, 100, 50...)'}</span>
                  </button>
                </div>

                {/* Denominations quick table (Optional accordion) */}
                {showDenominations && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-slate-400 mb-3">حاسبة عد فئات الريال السعودي:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                      {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                        <div key={denom} className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                          <span className="text-[11px] font-bold text-amber-400 block font-mono-num">{denom} ر.س</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={denominations[denom] || ''}
                            onChange={(e) => handleDenominationChange(denom, parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-700 text-white text-center font-mono-num font-bold text-sm py-1 rounded-lg mt-1 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Cash Input & Difference Result Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      إجمالي النقدية المجرودة بالدرج:
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.5"
                        placeholder={`مثال: ${expectedCashInDrawer}`}
                        value={actualCountedCash}
                        onChange={(e) => setActualCountedCash(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-slate-950 border-2 border-blue-500/60 focus:border-blue-400 text-white text-xl font-bold font-mono-num px-4 py-3 rounded-2xl shadow-inner focus:outline-none"
                      />
                      <span className="absolute left-4 text-xs font-bold text-slate-400">{settings.currency}</span>
                    </div>
                  </div>

                  {/* Difference Banner */}
                  <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                    isShortage
                      ? 'bg-red-950/40 border-red-500/80 text-red-300'
                      : isSurplus
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                      : 'bg-blue-950/40 border-blue-500/80 text-blue-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isShortage && (
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                      )}
                      {isSurplus && (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <ArrowUpRight className="w-6 h-6" />
                        </div>
                      )}
                      {isBalanced && (
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          حالة الدرج المالي:
                        </span>
                        <span className="text-base font-black">
                          {isShortage && 'يوجد عجز مالي في الدرج'}
                          {isSurplus && 'توجد زيادة مالية في الدرج'}
                          {isBalanced && 'الدرج متطابق 100% بدون فروقات'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono-num">
                      <span className="text-2xl font-black">
                        {liveDifference > 0 ? `+${liveDifference.toFixed(2)}` : liveDifference.toFixed(2)}
                      </span>
                      <span className="text-xs font-normal block">{settings.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Reason note for discrepancy if any */}
                {(isShortage || isSurplus) && (
                  <div className="pt-2">
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      ملاحظة / تبرير فرق الصندوق ({isShortage ? 'سبب العجز' : 'سبب الزيادة'}):
                    </label>
                    <input
                      type="text"
                      placeholder="اكتب توضيحاً لسبب الفارق المالي لإرفاقه بالتقرير النهائي..."
                      value={differenceNote}
                      onChange={(e) => setDifferenceNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Cash Movements Log */}
              {cashier.movements && cashier.movements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    سجل المصروفات والإيداعات للوردية الحالية:
                  </h4>
                  <div className="space-y-2">
                    {cashier.movements.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {m.type === 'cash_in' ? (
                            <ArrowDownRight className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                          )}
                          <span className="font-semibold text-white">{m.reason}</span>
                          <span className="text-[10px] text-slate-500 font-mono-num">({m.time})</span>
                        </div>
                        <span className={`font-bold font-mono-num ${m.type === 'cash_in' ? 'text-blue-400' : 'text-rose-400'}`}>
                          {m.type === 'cash_in' ? '+' : '-'}{m.amount.toFixed(2)} {settings.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Channels Sales Breakdown */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                مبيعات الوردية موزعة حسب قنوات الطلب:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">محلي (Dine-In)</span>
                  <span className="text-base font-bold text-white font-mono-num">{totalDineIn.toFixed(2)} {settings.currency}</span>
                  <span className="text-[10px] text-slate-500 block">({dineInOrders.length} طلبات)</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">توصيل (Delivery)</span>
                  <span className="text-base font-bold text-white font-mono-num">{totalDelivery.toFixed(2)} {settings.currency}</span>
                  <span className="text-[10px] text-slate-500 block">({deliveryOrders.length} طلبات)</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">سفري (Takeaway)</span>
                  <span className="text-base font-bold text-white font-mono-num">{totalTakeaway.toFixed(2)} {settings.currency}</span>
                  <span className="text-[10px] text-slate-500 block">({takeawayOrders.length} طلبات)</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">استلام (Pick Up)</span>
                  <span className="text-base font-bold text-white font-mono-num">{totalPickup.toFixed(2)} {settings.currency}</span>
                  <span className="text-[10px] text-slate-500 block">({pickupOrders.length} طلبات)</span>
                </div>
              </div>
            </div>

            {/* Quick Terminal Settings Buttons */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3">
              <button
                onClick={() => { posAudio.playTap(); onToggleSound(); }}
                className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between text-slate-200 transition-colors cursor-pointer border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  أصوات نقاط البيع
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-mono-num">
                  {settings.soundEnabled ? 'مفعل' : 'كتم'}
                </span>
              </button>

              <button
                onClick={() => { posAudio.playTap(); onOpenIpModal(); }}
                className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between text-slate-200 transition-colors cursor-pointer border border-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  عنوان الخادم IP
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-mono-num text-emerald-400">
                  {settings.serverIp}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: SHIFT HISTORY & FINANCIAL AUDIT ARCHIVE */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Filter Controls Bar */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  خيارات فلترة التقفيلات المالية والورديات
                </h3>

                {/* Search query input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث باسم الكاشير أو رقم الوردية..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white pr-9 pl-3 py-2 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 1. Date Filter Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  ١. تحديد النطاق الزمني والتاريخ:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'today', label: 'اليوم (Today)' },
                    { id: 'yesterday', label: 'الأمس (Yesterday)' },
                    { id: 'week', label: 'هذا الأسبوع (This Week)' },
                    { id: 'month', label: 'هذا الشهر (This Month)' },
                    { id: 'year', label: 'هذه السنة (This Year)' },
                    { id: 'custom', label: 'نطاق زمني مخصص...' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        posAudio.playTap();
                        setDateFilter(btn.id as DateFilterType);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dateFilter === btn.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Picker */}
                {dateFilter === 'custom' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400">من تاريخ:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-xs text-white font-mono-num focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400">إلى تاريخ:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-xs text-white font-mono-num focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Employee / Cashier Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-400 block">
                  ٢. تقفيلات الموظفين (حسب اسم العمال / الكاشير):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { posAudio.playTap(); setSelectedEmployeeId('all'); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedEmployeeId === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    👥 جميع الموظفين (All Staff)
                  </button>

                  {EMPLOYEES_LIST.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => { posAudio.playTap(); setSelectedEmployeeId(emp.id); }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedEmployeeId === emp.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{emp.name}</span>
                      <span className="text-[10px] font-mono-num opacity-75">({emp.code})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtered Financial Summary Dashboard Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي المبيعات المفلترة:</span>
                <span className="text-xl font-black text-amber-400 font-mono-num">
                  {filteredMetrics.totalSales.toFixed(2)} {settings.currency}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono-num">{filteredMetrics.totalOrders} فاتورة من {filteredShifts.length} ورديات</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs text-emerald-400 block mb-1">مبيعات الكاش (النقدي):</span>
                <span className="text-xl font-black text-emerald-400 font-mono-num">
                  {filteredMetrics.totalCash.toFixed(2)} {settings.currency}
                </span>
                <span className="text-[10px] text-slate-500 block">نقدية الدرج</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs text-blue-400 block mb-1">مبيعات الشبكة (مدى/فيزا):</span>
                <span className="text-xl font-black text-blue-400 font-mono-num">
                  {filteredMetrics.totalCard.toFixed(2)} {settings.currency}
                </span>
                <span className="text-[10px] text-slate-500 block">بطاقات بنكية</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">صافي فروقات الصندوق:</span>
                <span className={`text-xl font-black font-mono-num ${
                  filteredMetrics.totalDifference < 0
                    ? 'text-rose-400'
                    : filteredMetrics.totalDifference > 0
                    ? 'text-emerald-400'
                    : 'text-blue-400'
                }`}>
                  {filteredMetrics.totalDifference > 0 ? `+${filteredMetrics.totalDifference.toFixed(2)}` : filteredMetrics.totalDifference.toFixed(2)} {settings.currency}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {filteredMetrics.totalDifference < 0 ? 'صافي عجز' : filteredMetrics.totalDifference > 0 ? 'صافي زيادة' : 'متطابق تماماً'}
                </span>
              </div>
            </div>

            {/* List / Table of Historical Shifts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  نتائج تقفيلات الورديات ({filteredShifts.length} تقارير):
                </h4>
              </div>

              {filteredShifts.length === 0 ? (
                <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-2">
                  <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">لا توجد تقفيلات مطابقة لمعايير البحث المحددة</p>
                  <p className="text-xs text-slate-500">يرجى تجربة تغيير نطاق التاريخ أو اختيار كاشير آخر</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredShifts.map((shift) => {
                    const hasShortage = shift.difference < -0.01;
                    const hasSurplus = shift.difference > 0.01;

                    return (
                      <div
                        key={shift.id}
                        className="p-5 bg-slate-950 hover:bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Left: Info */}
                        <div className="flex items-start gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            shift.status === 'open'
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            <Calendar className="w-6 h-6" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{shift.cashierName}</span>
                              <span className="text-xs font-mono-num text-slate-400">({shift.cashierCode})</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                                وردية #{shift.shiftNumber}
                              </span>
                              {shift.status === 'open' && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                  مباشر الآن
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono-num">
                              <span>التاريخ: {shift.date}</span>
                              <span>•</span>
                              <span>الفترة: {shift.startTime} إلى {shift.endTime || 'الآن'}</span>
                              <span>•</span>
                              <span>الطلبات: {shift.totalOrdersCount}</span>
                            </div>

                            {/* Discrepancy badge */}
                            <div className="pt-1 flex items-center gap-2">
                              {hasShortage && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                                  <AlertTriangle className="w-3 h-3" />
                                  عجز في الدرج: {shift.difference.toFixed(2)} {settings.currency}
                                </span>
                              )}
                              {hasSurplus && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                  <ArrowUpRight className="w-3 h-3" />
                                  زيادة في الدرج: +{shift.difference.toFixed(2)} {settings.currency}
                                </span>
                              )}
                              {!hasShortage && !hasSurplus && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                                  <CheckCircle className="w-3 h-3" />
                                  الدرج مطابق تماماً 0.00
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Numbers & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">إجمالي المبيعات:</span>
                            <span className="text-lg font-black text-amber-400 font-mono-num">
                              {shift.totalSales.toFixed(2)} {settings.currency}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono-num flex gap-2 justify-end">
                              <span className="text-emerald-400">كاش: {shift.cashSales.toFixed(0)}</span>
                              <span className="text-blue-400">شبكة: {shift.cardSales.toFixed(0)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                posAudio.playTap();
                                setSelectedShiftForReport(shift);
                                setActiveTab('print_report');
                              }}
                              className="px-4 py-2.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                              <span>طباعة التقرير</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: OFFICIAL PRINT REPORT (Z-REPORT) */}
        {/* ============================================================ */}
        {activeTab === 'print_report' && (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <CashierShiftPrintReport
              shift={selectedShiftForReport || currentShiftRecord}
              settings={settings}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL FOOTER */}
        {/* ============================================================ */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>نظام محاسبة نقاط البيع المعتمد • {settings.restaurantName}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Lock Screen */}
            <button
              onClick={() => { posAudio.playTap(); onLockTerminal(); }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Lock className="w-4 h-4" />
              <span>قفل الشاشة مؤقتاً</span>
            </button>

            {/* Print Active Shift */}
            <button
              onClick={() => {
                posAudio.playTap();
                setSelectedShiftForReport(currentShiftRecord);
                setActiveTab('print_report');
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوردية الحالية</span>
            </button>

            {/* End / Close Shift Button */}
            <button
              onClick={() => { posAudio.playTap(); setShowCloseConfirmDialog(true); }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>إغلاق الوردية وتقفيل الحساب (Close Shift)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DIALOG 1: ADD CASH MOVEMENT (CASH IN / PETTY CASH OUT) */}
      {/* ============================================================ */}
      {showMovementDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                تسجيل حركة نقدية في الصندوق
              </h3>
              <button
                onClick={() => setShowMovementDialog(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMovementType('cash_out')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'cash_out'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>سحب مصروف نثري (Cash Out)</span>
              </button>

              <button
                onClick={() => setMovementType('cash_in')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'cash_in'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>إيداع وتغذية فكة (Cash In)</span>
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">المبلغ المطلوب:</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-lg font-bold font-mono-num px-4 py-2.5 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{settings.currency}</span>
              </div>
            </div>

            {/* Reason input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">السبب / البيان:</label>
              <input
                type="text"
                placeholder={movementType === 'cash_out' ? 'مثال: شراء مستلزمات طوارئ للمطبخ' : 'مثال: تغذية فكة خمسات وعشرات من الإدارة'}
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3 py-2.5 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowMovementDialog(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddMovement}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                حفظ الحركة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DIALOG 2: CONFIRM CLOSE SHIFT */}
      {/* ============================================================ */}
      {showCloseConfirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">تأكيد إغلاق الوردية الحالية</h3>
              <p className="text-xs text-slate-400">
                سيتم تقفيل حساب الكاشير <strong>{cashier.cashierName}</strong> وتوليد تقرير الـ Z-Report النهائي وإغلاق الصندوق.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono-num">
              <div className="flex justify-between text-slate-300">
                <span>إجمالي مبيعات الوردية:</span>
                <span className="font-bold text-amber-400">{currentTotalSales.toFixed(2)} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>مبيعات الكاش:</span>
                <span className="font-bold text-emerald-400">{cashier.totalCashSales.toFixed(2)} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>مبيعات الشبكة:</span>
                <span className="font-bold text-blue-400">{cashier.totalCardSales.toFixed(2)} {settings.currency}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-300">
                <span>حالة جرد الصندوق:</span>
                <span className={`font-bold ${isShortage ? 'text-rose-400' : isSurplus ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {isShortage ? `عجز (${liveDifference.toFixed(2)})` : isSurplus ? `زيادة (+${liveDifference.toFixed(2)})` : 'مطابق تماماً'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCloseConfirmDialog(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={handleFinalizeShiftClosing}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                تأكيد الإغلاق والطباعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
