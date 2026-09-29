import React from 'react';
import { Printer, Check, X, Flame, Coffee, Croissant, Receipt, Layers, Smartphone } from 'lucide-react';
import { SectionPrinter } from '../types';
import { posAudio } from '../utils/audio';

interface ItemPrinterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  currentPrinterId?: string;
  printers: SectionPrinter[];
  onSelectPrinter: (printerId: string) => void;
}

export const ItemPrinterSelectModal: React.FC<ItemPrinterSelectModalProps> = ({
  isOpen,
  onClose,
  itemName,
  currentPrinterId,
  printers,
  onSelectPrinter,
}) => {
  if (!isOpen) return null;

  const getSectionIcon = (section: SectionPrinter['section']) => {
    switch (section) {
      case 'kitchen':
        return { icon: Flame, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'bar':
        return { icon: Coffee, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'bakery':
        return { icon: Croissant, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'cashier':
        return { icon: Receipt, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { icon: Layers, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 text-white">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                توجيه الوجبة إلى طابعة / جهاز محدد
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                الوجبة: <span className="text-amber-400 font-bold">{itemName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content / Printer List */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-slate-400 mb-1">
            اختر الطابعة الحرارية أو شاشة القسم المطلوب إرسال الوجبة إليها:
          </div>

          {printers.map((prn) => {
            const isSelected = currentPrinterId === prn.id;
            const sec = getSectionIcon(prn.section);
            const Icon = sec.icon;

            return (
              <button
                key={prn.id}
                onClick={() => {
                  posAudio.playCardSelect();
                  onSelectPrinter(prn.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white shadow-lg'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${sec.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="font-black text-xs sm:text-sm text-white">
                      {prn.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>IP: {prn.ipAddress}</span>
                      <span>•</span>
                      <span>{prn.paperWidth}</span>
                      {prn.autoPrintOnPayment && (
                        <span className="text-emerald-400 font-bold">• طباعة تلقائية</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700 bg-slate-800/50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>✓ يتم حفظ توجيه الطابعة للطلب فوراً</span>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
