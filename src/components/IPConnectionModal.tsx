import React, { useState } from 'react';
import { posAudio } from '../utils/audio';
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface IPConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIp: string;
  onConnect: (newIp: string) => void;
}

export const IPConnectionModal: React.FC<IPConnectionModalProps> = ({
  isOpen,
  onClose,
  currentIp,
  onConnect,
}) => {
  const [octets, setOctets] = useState<string[]>(() => {
    const parts = currentIp.split('.');
    return [parts[0] || '192', parts[1] || '168', parts[2] || '1', parts[3] || '17'];
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOctetChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 3);
    const newOctets = [...octets];
    newOctets[index] = numeric;
    setOctets(newOctets);
    setErrorMessage(null);

    // Auto focus next input if 3 chars entered
    if (numeric.length === 3 && index < 3) {
      const nextInput = document.getElementById(`ip-octet-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && octets[index] === '' && index > 0) {
      const prevInput = document.getElementById(`ip-octet-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === '.' && index < 3) {
      e.preventDefault();
      const nextInput = document.getElementById(`ip-octet-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConnect = () => {
    posAudio.playTap();
    setIsConnecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullIp = octets.join('.');

    // Validate IP format
    const isValid = octets.every(o => o !== '' && Number(o) >= 0 && Number(o) <= 255);
    
    setTimeout(() => {
      setIsConnecting(false);
      if (!isValid) {
        posAudio.playError();
        setErrorMessage('Cannot Connect , Please check your connection');
      } else {
        posAudio.playSuccess();
        setSuccessMessage(`تم الاتصال بنجاح بخادم الكاشير (${fullIp})`);
        onConnect(fullIp);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => { posAudio.playTap(); onClose(); }}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Layered Burger / Food Logo - matching image 2 */}
        <div className="relative w-36 h-36 mb-8 mt-2 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-[10px] border-slate-950 bg-slate-950 overflow-hidden flex flex-col justify-between shadow-lg">
            {/* Layer 1: Top Cyan/Blue Bun/Sky */}
            <div className="h-[22%] w-full bg-[#29b6f6] rounded-t-full"></div>
            {/* Layer 2: Yellow Cheese/Patty */}
            <div className="h-[22%] w-full bg-[#fbc02d]"></div>
            {/* Layer 3: Green Lettuce */}
            <div className="h-[24%] w-full bg-[#4caf50]"></div>
            {/* Layer 4: Red Tomato/Bottom bun with wave */}
            <div className="h-[32%] w-full bg-[#d32f2f] rounded-b-full"></div>
          </div>
        </div>

        {/* Title matching image 2 */}
        <h2 className="text-xl font-black tracking-wider text-slate-900 mb-6 uppercase">
          ENTER IP ADDRESS
        </h2>

        {/* Segmented 4-box IP Input matching Image 2 */}
        <div className="w-full bg-[#f1f3f5] rounded-2xl p-4 mb-6 shadow-inner flex items-center justify-center gap-2">
          {octets.map((octet, idx) => (
            <React.Fragment key={idx}>
              <input
                id={`ip-octet-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={octet}
                onChange={(e) => handleOctetChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-16 h-14 bg-white rounded-xl text-center text-xl font-bold text-slate-800 border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                placeholder="0"
              />
              {idx < 3 && (
                <span className="text-2xl font-black text-slate-400 select-none">.</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CONNECT Button matching Image 2 */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-4 bg-[#2196f3] hover:bg-[#1e88e5] active:scale-[0.98] text-white font-bold text-lg rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:opacity-75"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>جاري الاتصال...</span>
            </>
          ) : (
            <span>CONNECT</span>
          )}
        </button>

        {/* Error or Success notification matching Image 2 error text */}
        {errorMessage && (
          <p className="mt-5 text-red-500 font-medium text-sm flex items-center justify-center gap-1.5 animate-bounce">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {successMessage && (
          <p className="mt-5 text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 w-full text-xs text-slate-400 flex items-center justify-between">
          <span>خادم نقاط البيع: v2.4.0</span>
          <span>المنفذ الافتراضي: 8080</span>
        </div>
      </div>
    </div>
  );
};
