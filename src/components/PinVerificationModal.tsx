import React, { useState, useEffect, useRef } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { posAudio } from '../utils/audio';

export interface WorkerPin {
  id: string;
  name: string;
  role: string;
  code: string;
}

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAction: string;
  expectedPin?: string;
  workersList?: WorkerPin[];
  onSuccess: (matchedWorker?: WorkerPin) => void;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  targetAction,
  expectedPin = '1234',
  workersList = [
    { id: '104', name: 'أحمد السعيد', role: 'كاشير رئيسي', code: '1234' },
    { id: '105', name: 'محمد الغامدي', role: 'كاشير مسائي', code: '2233' },
    { id: '101', name: 'فهد المنصور', role: 'مدير فرع', code: '5544' },
  ],
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    posAudio.playTap();
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    posAudio.playTap();
    setPin('');
    setErrorMsg('');
  };

  const verifyPin = (pinToTest?: string) => {
    const code = pinToTest !== undefined ? pinToTest : pin;
    if (!code) {
      setErrorMsg('يرجى إدخال رمز المرور');
      return;
    }

    // Check strictly if matching worker code or expected admin PIN
    const matchedWorker = workersList.find(w => w.code === code);
    const isMasterCode = !!expectedPin && code === expectedPin;

    if (matchedWorker || isMasterCode) {
      posAudio.playSuccess();
      onSuccess(matchedWorker);
      onClose();
    } else {
      posAudio.playError();
      setErrorMsg('كلمة المرور غير صحيحة! لا يمكنك الدخول إلى هذا القسم.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      verifyPin();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div 
        className={`relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center transition-transform duration-200 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-3 shadow-inner">
          <KeyRound className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center mb-1 text-white">رمز الأمان والتحقق</h3>
        <p className="text-xs text-slate-400 text-center mb-4">
          الدخول إلى: <span className="text-blue-400 font-bold font-mono-num">{targetAction || 'القائمة الإدارية'}</span>
        </p>

        {/* PIN Display / Input */}
        <div className="w-full mb-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                setPin(val);
                setErrorMsg('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="••••"
              maxLength={8}
              className="w-full py-3.5 px-4 bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-2xl text-center text-3xl font-mono tracking-[0.4em] text-blue-400 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>

          {/* Error Message */}
          {errorMsg ? (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-rose-400 text-xs font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 text-center mt-1.5">
              الرمز الافتراضي للإدارة: <span className="font-mono-num font-bold text-slate-400">1234</span>
            </p>
          )}
        </div>

        {/* Numeric Touch Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 border border-slate-700/60 active:scale-95 text-2xl font-bold font-mono-num text-white transition-all shadow-md flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm font-bold border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600 border border-slate-700/60 active:scale-95 text-2xl font-bold font-mono-num text-white transition-all shadow-md flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all border border-slate-700 active:scale-95"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => verifyPin()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>تأكيد ودخول</span>
          </button>
        </div>
      </div>
    </div>
  );
};
