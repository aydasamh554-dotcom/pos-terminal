import React, { useState } from 'react';
import { X, Lock, DollarSign, ArrowRight, CheckCircle2, User, KeyRound, Sparkles, AlertTriangle } from 'lucide-react';
import { posAudio } from '../utils/audio';
import { Employee } from '../types';
import { EMPLOYEES_LIST } from '../data/mockData';

interface OpenShiftDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOpenShift: (openingAmount: number, cashierName: string, notes?: string) => void;
  onProceedToPayment?: () => void;
  currentEmployeeName?: string;
  employees?: Employee[];
  currency?: string;
  isTriggeredByPayment?: boolean;
}

export const OpenShiftDrawerModal: React.FC<OpenShiftDrawerModalProps> = ({
  isOpen,
  onClose,
  onConfirmOpenShift,
  onProceedToPayment,
  currentEmployeeName = 'ابو عايض',
  employees = EMPLOYEES_LIST,
  currency = 'ر.ع',
  isTriggeredByPayment = true,
}) => {
  const [openingAmount, setOpeningAmount] = useState<string>('10.000');
  const [selectedCashier, setSelectedCashier] = useState<string>(currentEmployeeName);
  const [notes, setNotes] = useState<string>('عهدة الوردية الصباحية');
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickAmounts = ['5.000', '10.000', '20.000', '50.000', '100.000'];

  const handleDigit = (val: string) => {
    posAudio.playTap();
    if (openingAmount === '0' || openingAmount === '0.000') {
      setOpeningAmount(val);
    } else {
      setOpeningAmount(prev => prev + val);
    }
  };

  const handleClear = () => {
    posAudio.playTap();
    setOpeningAmount('0');
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setOpeningAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleConfirm = () => {
    const val = parseFloat(openingAmount) || 0;
    posAudio.playCash();
    setIsSuccess(true);

    onConfirmOpenShift(val, selectedCashier, notes);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onProceedToPayment) {
        onProceedToPayment();
      }
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 select-none animate-in fade-in duration-150"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black font-cairo text-white flex items-center gap-2">
                <span>فتح صندوق الوردية الصباحية</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  عهدة نقدية
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد رصيد البداية لبدء استلام مبالغ وتسديد الفواتير
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Warning Badge if triggered during checkout */}
        {isTriggeredByPayment && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-black text-amber-950 block mb-0.5">
                تنبيه: لا يمكن تسديد الفاتورة قبل فتح الصندوق!
              </strong>
              نظام نقاط البيع يتطلب فتح صندوق الوردية وإدخال العهدة الصباحية أولاً لضمان ضبط الحسابات اليومية والتقفيلة.
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Opening Cash Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>مبلغ العهدة / الخردة الصباحية ({currency}):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer underline"
              >
                {showKeypad ? 'إخفاء لوحة الأرقام' : 'لوحة الأرقام باللمس'}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full text-2xl font-black font-mono text-center py-3 px-4 bg-emerald-50 text-emerald-800 border-2 border-emerald-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-inner"
                placeholder="0.000"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                {currency}
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    posAudio.playTap();
                    setOpeningAmount(amt);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer active:scale-95 ${
                    openingAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            {/* On-Screen Keypad if toggled */}
            {showKeypad && (
              <div className="grid grid-cols-3 gap-1.5 pt-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 animate-in fade-in">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleDigit(k)}
                    className="h-10 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-900 rounded-xl font-bold font-mono text-base border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {k}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="col-span-1 h-9 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer active:scale-95"
                >
                  مسح
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="col-span-2 h-9 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold border border-amber-200 cursor-pointer active:scale-95"
                >
                  تراجع ⌫
                </button>
              </div>
            )}
          </div>

          {/* 2. Cashier In Charge */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>الكاشير المسؤول عن الوردية والصندوق:</span>
            </label>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {employees && employees.length > 0 ? (
                employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))
              ) : (
                <option value={currentEmployeeName}>{currentEmployeeName}</option>
              )}
            </select>
          </div>

          {/* 3. Shift Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">ملاحظات فتح الصندوق:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: عهدة بداية اليوم، فئات 1 و 5 ريالات"
            />
          </div>

          {/* Success Flash */}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-300 flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>تم فتح الصندوق بنجاح! جاري الانتقال لشاشة الدفع...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="flex-1 py-3 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            إلغاء والعودة
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isTriggeredByPayment ? 'فتح الصندوق ومتابعة السداد ⚡' : 'تأكيد وفتح الصندوق'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
