import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, ArrowRightLeft, ShoppingBag } from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { posAudio } from '../utils/audio';

interface InvoPaymentModalProps {
  isOpen: boolean;
  order: InvoOrder | null;
  total: number;
  guestCount?: number;
  onClose: () => void;
  onConfirmPayment: (paymentDetails: {
    method: 'cash' | 'card' | 'transfer' | 'talabat';
    tendered: number;
    change: number;
    splitCount: number;
  }) => void;
}

export const InvoPaymentModal: React.FC<InvoPaymentModalProps> = ({
  isOpen,
  order,
  total,
  guestCount = 1,
  onClose,
  onConfirmPayment,
}) => {
  const [enteredPrice, setEnteredPrice] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'transfer' | 'talabat'>('cash');
  const [splitCount, setSplitCount] = useState<number>(guestCount > 1 ? guestCount : 1);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(guestCount > 1);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setEnteredPrice(total.toFixed(3));
      setSelectedMethod('cash');
      setSplitCount(guestCount > 1 ? guestCount : 1);
      setIsSplitMode(guestCount > 1);
    }
  }, [isOpen, total, guestCount]);

  if (!isOpen) return null;

  const currentTendered = parseFloat(enteredPrice) || 0;
  const currentTotal = total;
  const splitAmountPerPerson = splitCount > 0 ? currentTotal / splitCount : currentTotal;

  // Preset quick cash buttons: exact total, 5.000, 10.000, 20.000, 50.000
  const presets = [
    { label: currentTotal.toFixed(3), value: currentTotal, isExact: true },
    { label: '5.000', value: 5.000 },
    { label: '10.000', value: 10.000 },
    { label: '20.000', value: 20.000 },
    { label: '50.000', value: 50.000 },
  ];

  const handleDigit = (digit: string) => {
    posAudio.playTap();
    if (digit === '.') {
      if (!enteredPrice.includes('.')) {
        setEnteredPrice(prev => (prev === '' ? '0.' : prev + '.'));
      }
      return;
    }

    if (enteredPrice === '0' || enteredPrice === total.toFixed(3)) {
      setEnteredPrice(digit);
    } else {
      // Allow up to 3 decimal places
      const parts = (enteredPrice + digit).split('.');
      if (parts.length > 1 && parts[1].length > 3) return;
      setEnteredPrice(prev => prev + digit);
    }
  };

  const handleClear = () => {
    posAudio.playTap();
    setEnteredPrice('');
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setEnteredPrice(prev => prev.slice(0, -1));
  };

  const handlePresetClick = (val: number) => {
    posAudio.playTap();
    setEnteredPrice(val.toFixed(3));
  };

  const handleConfirm = () => {
    posAudio.playSuccess();
    const tendered = parseFloat(enteredPrice) || currentTotal;
    const change = Math.max(0, tendered - currentTotal);
    onConfirmPayment({
      method: selectedMethod,
      tendered,
      change,
      splitCount,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 select-none text-slate-800 animate-in fade-in duration-150"
      dir="ltr"
    >
      <div className="w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl p-3 border border-slate-700 flex flex-col gap-2.5 max-h-[96vh] overflow-y-auto">
        
        {/* Top: Enter Price Input + Backspace X button matching video Frame 00:03 */}
        <div className="flex gap-2">
          {/* Enter Price Display */}
          <div className="flex-1 h-12 bg-[#0f172a] rounded-xl border border-slate-700 px-3 flex items-center justify-between text-white">
            <span className="text-xs font-bold text-slate-400">
              {enteredPrice === '' ? 'Enter Price' : ''}
            </span>
            <span className="font-mono text-xl font-black tracking-wider text-amber-400">
              {enteredPrice || '0.000'}
            </span>
            <button
              onClick={handleBackspace}
              className="w-8 h-8 rounded-lg bg-[#334155] hover:bg-slate-600 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick Preset #1 (Exact Total in Orange matching video Frame 00:03) */}
          <button
            onClick={() => handlePresetClick(presets[0].value)}
            className="w-20 h-12 bg-[#ea580c] hover:bg-[#c2410c] text-white font-mono font-black text-sm rounded-xl flex items-center justify-center shadow active:scale-95 cursor-pointer"
          >
            {presets[0].label}
          </button>
        </div>

        {/* Keypad + Presets Column Grid matching Video Frame 00:03 */}
        <div className="flex gap-2">
          {/* Keypad 4x3 */}
          <div className="flex-1 grid grid-cols-3 gap-1.5 font-mono text-xl font-black text-white">
            <button
              onClick={() => handleDigit('7')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              7
            </button>
            <button
              onClick={() => handleDigit('8')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              8
            </button>
            <button
              onClick={() => handleDigit('9')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              9
            </button>

            <button
              onClick={() => handleDigit('4')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              4
            </button>
            <button
              onClick={() => handleDigit('5')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              5
            </button>
            <button
              onClick={() => handleDigit('6')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              6
            </button>

            <button
              onClick={() => handleDigit('1')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              1
            </button>
            <button
              onClick={() => handleDigit('2')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              2
            </button>
            <button
              onClick={() => handleDigit('3')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              3
            </button>

            <button
              onClick={handleClear}
              className="h-12 bg-[#334155] hover:bg-[#475569] text-xs font-bold font-sans rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer text-slate-300"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              0
            </button>
            <button
              onClick={() => handleDigit('.')}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#64748b] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm text-2xl"
            >
              .
            </button>
          </div>

          {/* Right Column: Quick Cash Presets (5, 10, 20, 50 OMR) */}
          <div className="w-20 flex flex-col gap-1.5 font-mono font-black text-xs">
            {presets.slice(1).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(p.value)}
                className="flex-1 bg-[#0f172a] hover:bg-slate-800 active:bg-blue-900 text-white rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition-transform cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split Bill Option (تقسيم الفاتورة على عدد الأشخاص) */}
        <div className="bg-[#0f172a] rounded-xl p-2 border border-slate-700 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">تقسيم الفاتورة:</span>
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
              <button
                onClick={() => {
                  posAudio.playTap();
                  if (splitCount > 1) {
                    const newCount = splitCount - 1;
                    setSplitCount(newCount);
                    setEnteredPrice((currentTotal / newCount).toFixed(3));
                  }
                }}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold active:scale-95 cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-mono font-black text-amber-400 text-sm">
                {splitCount}
              </span>
              <button
                onClick={() => {
                  posAudio.playTap();
                  const newCount = splitCount + 1;
                  setSplitCount(newCount);
                  setEnteredPrice((currentTotal / newCount).toFixed(3));
                }}
                className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-slate-400">أشخاص</span>
          </div>

          {splitCount > 1 && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400">لكل شخص</div>
              <div className="font-mono font-black text-emerald-400 text-xs">
                OMR {splitAmountPerPerson.toFixed(3)}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Row matching video Frame 00:03 & 00:12 */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Cash */}
          <button
            onClick={() => {
              posAudio.playTap();
              setSelectedMethod('cash');
            }}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
              selectedMethod === 'cash'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-md text-slate-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <div className="w-8 h-5 bg-emerald-600 rounded flex items-center justify-center text-white shadow-xs">
              <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black">Cash</span>
          </button>

          {/* Card */}
          <button
            onClick={() => {
              posAudio.playTap();
              setSelectedMethod('card');
            }}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
              selectedMethod === 'card'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md text-slate-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-[11px] font-black">بطاقة</span>
          </button>

          {/* Transfer */}
          <button
            onClick={() => {
              posAudio.playTap();
              setSelectedMethod('transfer');
            }}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
              selectedMethod === 'transfer'
                ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500 shadow-md text-slate-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            <span className="text-[11px] font-black">تحويلات</span>
          </button>

          {/* Talabat / Aggregator */}
          <button
            onClick={() => {
              posAudio.playTap();
              setSelectedMethod('talabat');
            }}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
              selectedMethod === 'talabat'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500 shadow-md text-slate-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span className="text-[11px] font-black">طلبات</span>
          </button>
        </div>

        {/* Total & Change Info Bar */}
        <div className="bg-[#0f172a] rounded-xl px-3 py-2 border border-slate-700 flex items-center justify-between text-white">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-400">Total: </span>
            <span className="font-mono font-black text-sm text-emerald-400">
              OMR {total.toFixed(3)}
            </span>
          </div>

          {currentTendered > total && (
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">Change: </span>
              <span className="font-mono font-black text-sm text-amber-400">
                OMR {(currentTendered - total).toFixed(3)}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Buttons: Cancel and Confirm matching video Frame 00:03 & 00:17 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="py-3 bg-[#334155] hover:bg-[#475569] text-white font-black text-sm rounded-xl active:scale-95 transition-all cursor-pointer shadow text-center"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="py-3 bg-[#059669] hover:bg-[#047857] text-white font-black text-sm rounded-xl active:scale-95 transition-all cursor-pointer shadow text-center flex items-center justify-center gap-2"
          >
            <span>Confirm</span>
          </button>
        </div>

      </div>
    </div>
  );
};
