import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface ItemKeypadModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  initialValue: string | number;
  mode: 'price' | 'qty';
  onClose: () => void;
  onConfirm: (val: number) => void;
}

export const ItemKeypadModal: React.FC<ItemKeypadModalProps> = ({
  isOpen,
  title,
  subtitle,
  initialValue,
  mode,
  onClose,
  onConfirm,
}) => {
  const [valStr, setValStr] = useState<string>(initialValue.toString());

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    posAudio.playTap();
    if (digit === '.') {
      if (valStr.includes('.')) return;
      setValStr(prev => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    if (valStr === '0' || valStr === '') {
      setValStr(digit);
    } else {
      setValStr(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    posAudio.playTap();
    if (valStr.length <= 1) {
      setValStr('0');
    } else {
      setValStr(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    posAudio.playTap();
    setValStr('0');
  };

  const handleEnter = () => {
    posAudio.playSuccess();
    const num = parseFloat(valStr) || 0;
    onConfirm(num);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="ltr"
    >
      <div className="w-full max-w-[320px] bg-[#162033] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 text-white flex flex-col animate-in zoom-in-95">
        {/* Top Display with Title and Backspace */}
        <div className="p-3 bg-[#0f172a] flex items-center gap-2 border-b border-slate-800">
          <div className="flex-1 bg-[#1e293b] rounded-xl px-3 py-2 text-center border border-slate-700/60 min-h-[50px] flex flex-col justify-center">
            <span className="text-[11px] font-bold text-slate-400 truncate">
              {title} {subtitle ? `(${subtitle})` : ''}
            </span>
            <span className="font-mono text-xl font-black text-white tracking-wider">
              {valStr || '0'} {mode === 'price' ? 'OMR' : ''}
            </span>
          </div>

          <button
            onClick={handleBackspace}
            className="w-12 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 rounded-xl flex items-center justify-center font-black text-xl active:scale-95 transition-transform cursor-pointer shadow-md"
          >
            <X className="w-6 h-6 stroke-[3.5]" />
          </button>
        </div>

        {/* Keypad Buttons */}
        <div className="p-3 space-y-2 bg-[#162033]">
          <div className="grid grid-cols-3 gap-2">
            {['7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                {digit}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['4', '5', '6'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                {digit}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                {digit}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleClear}
              className="h-13 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-xs font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
            >
              0
            </button>
            {mode === 'price' ? (
              <button
                onClick={() => handleDigit('.')}
                className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                .
              </button>
            ) : (
              <button
                onClick={() => handleDigit('00')}
                className="h-13 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-sm font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                00
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                posAudio.playTap();
                onClose();
              }}
              className="h-12 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEnter}
              className="h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer gap-1"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
