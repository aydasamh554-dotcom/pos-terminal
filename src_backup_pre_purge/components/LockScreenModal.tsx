import React, { useState } from 'react';
import { CashierSession } from '../types';
import { posAudio } from '../utils/audio';
import { Lock, Unlock, User, ShieldCheck } from 'lucide-react';

interface LockScreenModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  cashier: CashierSession;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isOpen,
  onUnlock,
  cashier,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    posAudio.playTap();
    if (digit === 'C') {
      setPin('');
      setError(false);
    } else if (digit === 'del') {
      setPin((prev) => prev.slice(0, -1));
      setError(false);
    } else if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      // Auto check when 4 digits entered
      if (newPin.length === 4) {
        if (newPin === '1234' || newPin === '0000' || newPin.length === 4) {
          posAudio.playSuccess();
          setTimeout(() => {
            onUnlock();
            setPin('');
          }, 200);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Cashier Info */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-xl">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-white">{cashier.cashierName}</h2>
          <p className="text-xs text-slate-400">
            شاشة الكاشير مقفلة • أدخل الرمز السري (PIN) لفتح الشاشة
          </p>
        </div>

        {/* PIN Circles */}
        <div className="flex items-center gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-blue-500 border-blue-400 scale-110 shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 border-slate-700'
              } ${error ? 'bg-red-500 border-red-400 animate-shake' : ''}`}
            />
          ))}
        </div>

        {/* PIN Numeric Keypad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'del'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKeyPress(k)}
              className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 active:scale-95 text-white font-mono-num font-bold text-xl flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500">
          الرمز الافتراضي للتجربة: أي 4 أرقام أو (1234)
        </p>
      </div>
    </div>
  );
};
