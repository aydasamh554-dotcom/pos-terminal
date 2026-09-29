import React, { useState } from 'react';
import { X, Percent, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface ItemDiscountModalProps {
  isOpen: boolean;
  itemName: string;
  itemPrice: number;
  onClose: () => void;
  onApplyDiscount: (percent: number) => void;
  userMaxDiscount?: number;
  onRequestApproval?: (percent: number) => void;
}

const PRESET_DISCOUNTS = [5, 10, 15, 20, 25, 30, 50, 100];

export const ItemDiscountModal: React.FC<ItemDiscountModalProps> = ({
  isOpen,
  itemName,
  itemPrice,
  onClose,
  onApplyDiscount,
  userMaxDiscount = 10,
  onRequestApproval,
}) => {
  const [selectedPercent, setSelectedPercent] = useState<number>(0);
  const [customPercent, setCustomPercent] = useState<string>('');

  if (!isOpen) return null;

  const handleApply = (pct: number) => {
    // Check if percent exceeds allowed threshold
    if (pct > userMaxDiscount && onRequestApproval) {
      posAudio.playTap();
      onRequestApproval(pct);
      onClose();
      return;
    }
    posAudio.playSuccess();
    onApplyDiscount(pct);
    onClose();
  };

  const handleCustomApply = () => {
    const p = parseFloat(customPercent) || 0;
    handleApply(Math.min(100, Math.max(0, p)));
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-[#1e293b] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">خصم على الصنف</h3>
              <p className="text-xs text-slate-300 font-semibold truncate max-w-[200px]">
                {itemName} (OMR {itemPrice.toFixed(3)})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 bg-[#f8fafc]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>اختر نسبة الخصم:</span>
            <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
              حدك المسموح: {userMaxDiscount}%
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {PRESET_DISCOUNTS.map((pct) => {
              const requiresApproval = pct > userMaxDiscount;
              return (
                <button
                  key={pct}
                  onClick={() => {
                    setSelectedPercent(pct);
                    handleApply(pct);
                  }}
                  className={`relative py-3 rounded-xl font-mono font-black text-sm transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center ${
                    selectedPercent === pct
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : requiresApproval
                      ? 'bg-white hover:bg-rose-50 text-slate-700 border border-rose-300'
                      : 'bg-white hover:bg-amber-50 text-slate-800 border border-slate-300'
                  }`}
                >
                  {requiresApproval && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] bg-rose-500 text-white font-sans px-1 rounded-full shadow-xs">
                      إذن 🔒
                    </span>
                  )}
                  <span>{pct}%</span>
                  <span className="text-[10px] font-normal opacity-75">
                    -{(itemPrice * (pct / 100)).toFixed(3)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">أو نسبة مخصصة:</span>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={customPercent}
                onChange={(e) => setCustomPercent(e.target.value)}
                placeholder="مثال: 12%"
                className="flex-1 p-2 bg-white border-2 border-slate-300 rounded-xl text-center font-mono font-black text-sm focus:border-amber-500 focus:outline-hidden"
              />
              <button
                onClick={handleCustomApply}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95"
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex justify-between">
          <button
            onClick={() => handleApply(0)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            إلغاء الخصم (0%)
          </button>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
