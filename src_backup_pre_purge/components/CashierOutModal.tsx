import React, { useState, useMemo } from 'react';
import { X, Grid } from 'lucide-react';
import { posAudio } from '../utils/audio';

export interface CashierOutData {
  denominations: Record<string, number>;
  otherTenders: {
    card: number;
    transfers: number;
  };
  foreignCurrency: {
    talabat: number;
  };
  extraCash: number;
  totalOmr: number;
  localCurrencyTotal: number;
}

interface CashierOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CashierOutData) => void;
}

const LOCAL_DENOMINATIONS = [
  '50.000',
  '20.000',
  '10.000',
  '5.000',
  '1.000',
  '0.500',
  '0.100',
  '0.050',
  '0.025',
  '0.010',
];

export const CashierOutModal: React.FC<CashierOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // Local Currency Quantities
  const [quantities, setQuantities] = useState<Record<string, number>>({
    '50.000': 0,
    '20.000': 0,
    '10.000': 0,
    '5.000': 0,
    '1.000': 0,
    '0.500': 0,
    '0.100': 0,
    '0.050': 0,
    '0.025': 0,
    '0.010': 0,
  });

  // Foreign Currency (طلبات)
  const [talabatAmount, setTalabatAmount] = useState<number>(0);

  // Other Tenders (بطاقة، تحويلات)
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [transfersAmount, setTransfersAmount] = useState<number>(0);

  // Extra Cash
  const [extraCashAmount, setExtraCashAmount] = useState<number>(0);

  // Keypad Dialog State
  const [keypadConfig, setKeypadConfig] = useState<{
    isOpen: boolean;
    title: string;
    fieldKey: string;
    fieldType: 'denom' | 'other' | 'foreign' | 'extra';
    currentVal: string;
    isDecimal: boolean;
  }>({
    isOpen: false,
    title: '',
    fieldKey: '',
    fieldType: 'denom',
    currentVal: '',
    isDecimal: false,
  });

  // Calculate local cash total
  const localCashTotal = useMemo(() => {
    return LOCAL_DENOMINATIONS.reduce((sum, denom) => {
      const val = parseFloat(denom);
      const qty = quantities[denom] || 0;
      return sum + val * qty;
    }, 0);
  }, [quantities]);

  // Calculate overall Total OMR
  const totalOmr = useMemo(() => {
    return localCashTotal + cardAmount + transfersAmount + talabatAmount + extraCashAmount;
  }, [localCashTotal, cardAmount, transfersAmount, talabatAmount, extraCashAmount]);

  if (!isOpen) return null;

  // Open keypad for a specific field
  const handleOpenKeypad = (
    fieldKey: string,
    title: string,
    fieldType: 'denom' | 'other' | 'foreign' | 'extra',
    isDecimal: boolean = false
  ) => {
    posAudio.playTap();
    let initialVal = '';
    if (fieldType === 'denom') {
      const qty = quantities[fieldKey];
      initialVal = qty > 0 ? qty.toString() : '';
    } else if (fieldKey === 'card') {
      initialVal = cardAmount > 0 ? cardAmount.toString() : '';
    } else if (fieldKey === 'transfers') {
      initialVal = transfersAmount > 0 ? transfersAmount.toString() : '';
    } else if (fieldKey === 'talabat') {
      initialVal = talabatAmount > 0 ? talabatAmount.toString() : '';
    } else if (fieldKey === 'extra') {
      initialVal = extraCashAmount > 0 ? extraCashAmount.toString() : '';
    }

    setKeypadConfig({
      isOpen: true,
      title,
      fieldKey,
      fieldType,
      currentVal: initialVal,
      isDecimal,
    });
  };

  // Keypad input handlers
  const handleKeypadDigit = (digit: string) => {
    posAudio.playTap();
    setKeypadConfig((prev) => {
      if (digit === '.' && prev.currentVal.includes('.')) return prev;
      if (prev.currentVal.length >= 10) return prev;
      return { ...prev, currentVal: prev.currentVal + digit };
    });
  };

  const handleKeypadBackspace = () => {
    posAudio.playTap();
    setKeypadConfig((prev) => ({
      ...prev,
      currentVal: prev.currentVal.slice(0, -1),
    }));
  };

  const handleKeypadClear = () => {
    posAudio.playTap();
    setKeypadConfig((prev) => ({
      ...prev,
      currentVal: '',
    }));
  };

  const handleKeypadEnter = () => {
    posAudio.playTap();
    const num = parseFloat(keypadConfig.currentVal) || 0;

    if (keypadConfig.fieldType === 'denom') {
      setQuantities((prev) => ({
        ...prev,
        [keypadConfig.fieldKey]: Math.max(0, Math.floor(num)),
      }));
    } else if (keypadConfig.fieldKey === 'card') {
      setCardAmount(Math.max(0, num));
    } else if (keypadConfig.fieldKey === 'transfers') {
      setTransfersAmount(Math.max(0, num));
    } else if (keypadConfig.fieldKey === 'talabat') {
      setTalabatAmount(Math.max(0, num));
    } else if (keypadConfig.fieldKey === 'extra') {
      setExtraCashAmount(Math.max(0, num));
    }

    setKeypadConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmSubmit = () => {
    posAudio.playSuccess();
    onConfirm({
      denominations: quantities,
      otherTenders: {
        card: cardAmount,
        transfers: transfersAmount,
      },
      foreignCurrency: {
        talabat: talabatAmount,
      },
      extraCash: extraCashAmount,
      totalOmr,
      localCurrencyTotal: localCashTotal,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 select-none animate-in fade-in duration-150 overflow-hidden"
      dir="ltr"
    >
      {/* Phone container matching exact Video design and single column layout */}
      <div className="w-full max-w-[420px] max-h-[96vh] bg-[#2a3447] text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-700/80 flex flex-col overflow-hidden">
        
        {/* Scrollable vertical content matching Video */}
        <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar space-y-3 bg-[#e2e8f0]">
          
          {/* Section 1: Local Currency matching Video */}
          <div className="bg-white rounded-t-xl rounded-b-lg border border-slate-300 overflow-hidden shadow-xs">
            <div className="bg-[#242e3f] text-white py-1.5 px-3 text-center font-bold text-sm tracking-wide">
              Local Currency
            </div>

            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-1.5 px-2 border-r border-slate-300 w-1/3"></th>
                  <th className="py-1.5 px-2 border-r border-slate-300 w-1/3 text-slate-700 font-bold text-xs">Qty</th>
                  <th className="py-1.5 px-2 w-1/3 text-slate-700 font-bold text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {LOCAL_DENOMINATIONS.map((denom, index) => {
                  const qty = quantities[denom] || 0;
                  const total = (parseFloat(denom) * qty).toFixed(3);

                  return (
                    <tr
                      key={denom}
                      onClick={() => handleOpenKeypad(denom, `Enter Number of ${parseFloat(denom)}`, 'denom', false)}
                      className={`border-b border-slate-200 cursor-pointer transition-colors hover:bg-blue-50 active:bg-blue-100 ${
                        index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-slate-800 text-xs text-left pl-3">
                        {denom}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-slate-900 text-xs">
                        {qty}
                      </td>
                      <td className="py-1.5 px-2 font-mono font-bold text-slate-700 text-xs">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Foreign Currency matching Video */}
          <div className="bg-white rounded-t-xl rounded-b-lg border border-slate-300 overflow-hidden shadow-xs">
            <div className="bg-[#242e3f] text-white py-1.5 px-3 text-center font-bold text-sm tracking-wide">
              Foreign Currency
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-1.5 px-2 border-r border-slate-300 w-1/3 text-slate-700 font-bold text-xs">Amount</th>
                  <th className="py-1.5 px-2 border-r border-slate-300 w-1/3 text-slate-700 font-bold text-xs">Currency</th>
                  <th className="py-1.5 px-2 w-1/3 text-slate-700 font-bold text-xs">Equivalent</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  onClick={() => handleOpenKeypad('talabat', 'Enter Number of طلبات', 'foreign', true)}
                  className="border-b border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <td className="py-2 px-2 border-r border-slate-300 font-mono font-bold text-slate-800 text-xs">
                    {talabatAmount.toFixed(3)}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 font-bold text-slate-800 text-xs font-arabic">
                    طلبات
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs">
                    {talabatAmount.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Other Tenders matching Video */}
          <div className="bg-white rounded-t-xl rounded-b-lg border border-slate-300 overflow-hidden shadow-xs">
            <div className="bg-[#242e3f] text-white py-1.5 px-3 text-center font-bold text-sm tracking-wide">
              Other Tenders
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-1.5 px-2 border-r border-slate-300 w-1/2 text-slate-700 font-bold text-xs">Currency</th>
                  <th className="py-1.5 px-2 w-1/2 text-slate-700 font-bold text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* بطاقة (Card) */}
                <tr
                  onClick={() => handleOpenKeypad('card', 'Enter Number of بطاقة', 'other', true)}
                  className="border-b border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <td className="py-2 px-2 border-r border-slate-300 font-bold text-slate-800 text-xs font-arabic">
                    بطاقة
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-slate-800 text-xs">
                    {cardAmount.toFixed(3)}
                  </td>
                </tr>

                {/* تحويلات (Transfers) */}
                <tr
                  onClick={() => handleOpenKeypad('transfers', 'Enter Number of تحويلات', 'other', true)}
                  className="border-b border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <td className="py-2 px-2 border-r border-slate-300 font-bold text-slate-800 text-xs font-arabic">
                    تحويلات
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-slate-800 text-xs">
                    {transfersAmount.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Extra Cash & Total OMR matching Video Frame 00:03 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Extra Cash Box */}
            <div className="bg-white rounded-xl border border-slate-300 p-2 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-800 block mb-1">Extra Cash</span>
              <div
                onClick={() => handleOpenKeypad('extra', 'Enter Extra Cash', 'extra', true)}
                className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <span className="font-mono font-bold text-xs text-slate-800">
                  {extraCashAmount.toFixed(3)}
                </span>
                <Grid className="w-4 h-4 text-slate-600 stroke-[2.5]" />
              </div>
            </div>

            {/* Total OMR Box */}
            <div className="bg-white rounded-xl border border-slate-300 p-2 shadow-xs flex flex-col justify-center text-center">
              <span className="text-lg font-black text-slate-800 leading-tight">Total</span>
              <span className="text-lg font-black text-slate-800 leading-tight font-mono">
                OMR {totalOmr.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Bottom Buttons: Cancel & Confirm matching Video Frame 00:03 */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                posAudio.playTap();
                onClose();
              }}
              className="py-2.5 bg-[#2b3547] hover:bg-[#39465e] active:bg-[#1f2736] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-center"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmSubmit}
              className="py-2.5 bg-[#2b3547] hover:bg-[#39465e] active:bg-[#1f2736] text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-center"
            >
              Confirm
            </button>
          </div>

        </div>
      </div>

      {/* Numerical Keypad Modal matching Video */}
      {keypadConfig.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150"
          dir="ltr"
        >
          <div className="w-full max-w-[320px] bg-[#162033] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 text-white flex flex-col">
            {/* Top Display with Title and Backspace (X) */}
            <div className="p-3 bg-[#0f172a] flex items-center gap-2 border-b border-slate-800">
              <div className="flex-1 bg-[#1e293b] rounded-xl px-4 py-2 text-center border border-slate-700/60 min-h-[46px] flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 truncate">
                  {keypadConfig.title || 'Enter Value'}
                </span>
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  {keypadConfig.currentVal || '0'}
                </span>
              </div>

              {/* White Square Backspace Button */}
              <button
                onClick={handleKeypadBackspace}
                className="w-11 h-11 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 rounded-xl flex items-center justify-center font-black text-xl active:scale-95 transition-transform cursor-pointer shadow-md"
              >
                <X className="w-6 h-6 stroke-[3.5]" />
              </button>
            </div>

            {/* Keypad Grid */}
            <div className="p-3 space-y-2 bg-[#162033]">
              {/* Row 1: 7, 8, 9 */}
              <div className="grid grid-cols-3 gap-2">
                {['7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeypadDigit(digit)}
                    className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Row 2: 4, 5, 6 */}
              <div className="grid grid-cols-3 gap-2">
                {['4', '5', '6'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeypadDigit(digit)}
                    className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Row 3: 1, 2, 3 */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeypadDigit(digit)}
                    className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Row 4: Clear & 0 & . */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleKeypadClear}
                  className="h-13 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-xs font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleKeypadDigit('0')}
                  className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeypadDigit('.')}
                  className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  .
                </button>
              </div>

              {/* Bottom Row: Cancel & Enter */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    posAudio.playTap();
                    setKeypadConfig((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleKeypadEnter}
                  className="h-12 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-600 cursor-pointer"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

