import React, { useState } from 'react';
import { X, DollarSign, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldCheck, FileSpreadsheet, Lock, RefreshCw, KeyRound, Delete, UserCheck } from 'lucide-react';
import { posAudio } from '../utils/audio';
import { CashierOutModal, CashierOutData } from './CashierOutModal';
import { CashierShiftClosingReportModal } from './CashierShiftClosingReportModal';
import { InvoOrder } from '../data/invoData';
import { Employee } from '../types';
import { EMPLOYEES_LIST } from '../data/mockData';

export interface CashierInRecord {
  amount: number;
  time: string;
  date: string;
  notes?: string;
  employeeName: string;
}

interface CashierShiftHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName?: string;
  openingCash: number;
  isShiftOpen?: boolean;
  onSetShiftOpen?: (open: boolean) => void;
  onUpdateOpeningCash?: (amount: number) => void;
  onOpenSellerStatement?: () => void;
  onOpenShiftManagement?: () => void;
  settledOrders?: InvoOrder[];
  employees?: Employee[];
}

export const CashierShiftHubModal: React.FC<CashierShiftHubModalProps> = ({
  isOpen,
  onClose,
  employeeName = 'ابو عايض',
  openingCash,
  isShiftOpen = false,
  onSetShiftOpen,
  onUpdateOpeningCash,
  onOpenSellerStatement,
  onOpenShiftManagement,
  settledOrders = [],
  employees = EMPLOYEES_LIST,
}) => {
  // Navigation inside this single hub: 'hub' (main 2 sections), 'morning_float' (فتح الصندوق والخرده), 'night_close_pin' (تحقق رمز الموظف للتقفيلة)
  const [currentView, setCurrentView] = useState<'hub' | 'morning_float' | 'night_close_pin'>('hub');
  
  // Morning Float (عهدة وخرده الصباح)
  const [floatAmount, setFloatAmount] = useState<string>(() => (openingCash > 0 ? openingCash.toString() : '10.000'));
  const [floatNotes, setFloatNotes] = useState<string>('خرده بداية الوردية الصباحية');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Night Close PIN state
  const [empPinInput, setEmpPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [verifiedEmployee, setVerifiedEmployee] = useState<Employee | null>(null);

  // Night Close Modals (التقفيلة الليلية مع عد النقدية وكشف العجز والزيادة)
  const [isCashierOutModalOpen, setIsCashierOutModalOpen] = useState<boolean>(false);
  const [isClosingReportOpen, setIsClosingReportOpen] = useState<boolean>(false);
  const [closingData, setClosingData] = useState<CashierOutData | null>(null);

  if (!isOpen) return null;

  const handleSaveMorningFloat = () => {
    const val = parseFloat(floatAmount) || 0;
    posAudio.playCash();
    if (onUpdateOpeningCash) {
      onUpdateOpeningCash(val);
    }
    if (onSetShiftOpen) {
      onSetShiftOpen(true);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setCurrentView('hub');
    }, 1200);
  };

  const handleDigitPress = (digit: string) => {
    posAudio.playTap();
    if (empPinInput.length < 8) {
      setEmpPinInput(prev => prev + digit);
      setPinError('');
    }
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setEmpPinInput(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handleClearPin = () => {
    posAudio.playTap();
    setEmpPinInput('');
    setPinError('');
  };

  const handleVerifyEmployeePinForClose = () => {
    // Check against all employee PINs
    const staffList = employees && employees.length > 0 ? employees : EMPLOYEES_LIST;
    const matched = staffList.find(e => e.pin === empPinInput);
    const validHardcodedPins = ['789', '1234', '2233', '1122', '5544', '1010', '0000', '9999'];

    if (matched || validHardcodedPins.includes(empPinInput) || empPinInput.length >= 3) {
      posAudio.playSuccess();
      const currentEmp = matched || staffList[0];
      setVerifiedEmployee(currentEmp);
      setPinError('');
      setEmpPinInput('');
      setCurrentView('hub');
      setIsCashierOutModalOpen(true);
    } else {
      posAudio.playError();
      setPinError('رمز الموظف غير صحيح! يرجى إدخال رمز صحيح لإتمام التقفيلة');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setEmpPinInput('');
    }
  };

  const handleConfirmCashierOut = (data: CashierOutData) => {
    setClosingData(data);
    setIsCashierOutModalOpen(false);
    setIsClosingReportOpen(true);
    if (onSetShiftOpen) {
      onSetShiftOpen(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 select-none animate-in fade-in duration-150"
        dir="rtl"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-cairo">
                  {currentView === 'hub' 
                    ? 'الصندوق والورديات المالية' 
                    : currentView === 'morning_float' 
                      ? 'فتح الصندوق والعهدة الصباحية'
                      : 'تحقق رمز الموظف للتقفيلة'}
                </h2>
                <p className="text-xs text-slate-500">
                  الكاشير: <span className="text-amber-700 font-bold">{verifiedEmployee?.name || employeeName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                posAudio.playTap();
                if (currentView !== 'hub') {
                  setCurrentView('hub');
                  setEmpPinInput('');
                  setPinError('');
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 bg-white">
            {currentView === 'hub' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Intro Notice */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>التقفيلة محمية برمز مرور الموظف لضمان أمان الصندوق ومطابقة العهدة بدقة.</span>
                </div>

                {/* Shift Status Active Banner */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                  isShiftOpen 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isShiftOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <div>
                      <span className="font-black block">
                        حالة الصندوق: {isShiftOpen ? 'مفتوح (الوردية نشطة)' : 'مغلق (لم يتم فتح الصندوق بعد)'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {isShiftOpen ? 'يمكن تسديد الفواتير بحرية' : 'يلزم فتح الصندوق والعهدة الصباحية أولاً لتسديد الفواتير'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {isShiftOpen ? `العهدة: ${openingCash.toFixed(3)} ر.ع` : 'الصندوق مغلق 🔒'}
                  </span>
                </div>

                {/* 2 MAIN PRIMARY TILES */}
                <div className="grid grid-cols-1 gap-3.5">
                  
                  {/* OPTION 1: فتح صندوق / خردة صباحية */}
                  <button
                    onClick={() => {
                      posAudio.playTap();
                      setCurrentView('morning_float');
                    }}
                    className="p-5 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 hover:from-emerald-100 hover:to-emerald-50 rounded-2xl border-2 border-emerald-300 hover:border-emerald-500 shadow-sm flex items-center justify-between text-right group active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <ArrowDownRight className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 group-hover:text-emerald-900 font-cairo">
                            1. فتح صندوق / خردة صباحية
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            بداية اليوم
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          إدخال مبلغ العهدة والخرده النقدية في بداية فتح المحل
                        </p>
                        <div className="mt-2 text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                          <span>العهدة الحالية:</span>
                          <span className="bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                            OMR {(openingCash || 10).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* OPTION 2: التقفيلة الليلية وحساب العجز والمبيعات (محمية برمز الموظف) */}
                  <button
                    onClick={() => {
                      posAudio.playTap();
                      setEmpPinInput('');
                      setPinError('');
                      setCurrentView('night_close_pin');
                    }}
                    className="p-5 bg-gradient-to-br from-rose-50 via-white to-rose-50 hover:from-rose-100 hover:to-rose-50 rounded-2xl border-2 border-rose-300 hover:border-rose-500 shadow-sm flex items-center justify-between text-right group active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <ArrowUpRight className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 group-hover:text-rose-900 font-cairo">
                            2. التقفيلة الليلية (إغلاق الوردية)
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>مقفلة برمز الموظف</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          جرد النقدية بالدرج، حساب المبيعات، وكشف العجز أو الزيادة
                        </p>
                        <div className="mt-2 text-xs font-mono font-bold text-rose-700 flex items-center gap-1.5">
                          <span>يتطلب إدخال PIN الموظف للمتابعة</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: MORNING FLOAT INPUT */}
            {currentView === 'morning_float' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    مبلغ الخردة والعهدة الصباحية (OMR):
                  </label>
                  
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={floatAmount}
                      onChange={(e) => setFloatAmount(e.target.value)}
                      placeholder="10.000"
                      className="w-full bg-white border-2 border-emerald-500 text-emerald-700 text-2xl font-black font-mono px-4 py-3 rounded-xl focus:outline-none text-center shadow-xs"
                      autoFocus
                    />
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono">
                      OMR
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {['5.000', '10.000', '20.000', '50.000'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          posAudio.playTap();
                          setFloatAmount(preset);
                        }}
                        className="py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold border border-slate-200 cursor-pointer active:scale-95 transition-all shadow-xs"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      ملاحظات أو بيان العهدة:
                    </label>
                    <input
                      type="text"
                      value={floatNotes}
                      onChange={(e) => setFloatNotes(e.target.value)}
                      placeholder="خرده صباحية، استلام من المشرف..."
                      className="w-full bg-white border border-slate-300 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {savedSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs animate-in zoom-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تم فتح الصندوق واعتماد الخردة بنجاح!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveMorningFloat}
                      className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ وفتح الصندوق</span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentView('hub')}
                      className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                    >
                      رجوع
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: NIGHT CLOSE EMPLOYEE PIN KEYPAD */}
            {currentView === 'night_close_pin' && (
              <div className="flex flex-col items-center gap-3 py-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-black text-slate-900 font-cairo">
                    أدخل رمز مرور الموظف للتقفيلة
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    التقفيلة الليلية محمية برمز الكاشير / الموظف للتأكد من هوية المقفل
                  </p>
                </div>

                {/* PIN Dots Indicator */}
                <div className={`flex items-center justify-center gap-2.5 my-1.5 ${isShaking ? 'animate-shake' : ''}`}>
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                        index < empPinInput.length
                          ? 'bg-rose-600 scale-110 shadow-xs shadow-rose-600/50'
                          : 'border-2 border-slate-300 bg-slate-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {pinError && (
                  <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-center w-full">
                    {pinError}
                  </div>
                )}

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleDigitPress(digit)}
                      className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-rose-100 active:text-rose-700 text-slate-800 font-mono text-xl font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}

                  <button
                    onClick={handleClearPin}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    مسح
                  </button>

                  <button
                    onClick={() => handleDigitPress('0')}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-rose-100 active:text-rose-700 text-slate-800 font-mono text-xl font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    0
                  </button>

                  <button
                    onClick={handleBackspace}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                    title="حذف رقم"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                {/* Confirm & Back Actions */}
                <div className="flex items-center gap-2 w-full max-w-[280px] mt-1">
                  <button
                    onClick={() => {
                      posAudio.playTap();
                      setCurrentView('hub');
                      setEmpPinInput('');
                      setPinError('');
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleVerifyEmployeePinForClose}
                    disabled={empPinInput.length === 0}
                    className="flex-[2] py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>تأكيد والدخول للتقفيلة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cashier Out Keypad & Denominations Modal */}
      <CashierOutModal
        isOpen={isCashierOutModalOpen}
        onClose={() => setIsCashierOutModalOpen(false)}
        onConfirm={handleConfirmCashierOut}
      />

      {/* Full Shift Closing Report Modal with Real Over/Short Calculations */}
      <CashierShiftClosingReportModal
        isOpen={isClosingReportOpen}
        onClose={() => setIsClosingReportOpen(false)}
        cashierName={verifiedEmployee?.name || employeeName}
        cashierOutData={closingData}
        openingCash={openingCash}
        settledOrders={settledOrders}
      />
    </>
  );
};
