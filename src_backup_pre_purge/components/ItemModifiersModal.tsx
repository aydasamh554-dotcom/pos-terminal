import React from 'react';
import { X, Plus, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

const EXTRA_MODIFIERS: ModifierOption[] = [
  { id: 'm-1', name: 'صوص ثومية إضافي', price: 0.200 },
  { id: 'm-2', name: 'شطة سومطرة حارة', price: 0.200 },
  { id: 'm-3', name: 'طحينة سمسم بلدي', price: 0.250 },
  { id: 'm-4', name: 'دقوس طماطم حار', price: 0.200 },
  { id: 'm-5', name: 'مرق لحم/دجاج دسم', price: 0.300 },
  { id: 'm-6', name: 'سلطة خضراء طازجة', price: 0.300 },
  { id: 'm-7', name: 'بصل مقلي ومكسرات', price: 0.350 },
  { id: 'm-8', name: 'لبن عيران بارد', price: 0.350 },
  { id: 'm-9', name: 'خبز تنور ساخن (2 حبة)', price: 0.200 },
];

interface ItemModifiersModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onAddModifierItem: (mod: ModifierOption) => void;
}

export const ItemModifiersModal: React.FC<ItemModifiersModalProps> = ({
  isOpen,
  itemName,
  onClose,
  onAddModifierItem,
}) => {
  if (!isOpen) return null;

  const handleSelect = (mod: ModifierOption) => {
    posAudio.playAddItem();
    onAddModifierItem(mod);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-[#1e293b] text-white p-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">إضافات وتعديلات (Extra Modifiers)</h3>
            <p className="text-xs text-slate-300 font-semibold truncate max-w-[200px]">
              للوجبة: {itemName}
            </p>
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

        <div className="p-3 bg-[#f8fafc] max-h-80 overflow-y-auto space-y-2">
          <span className="block text-xs font-bold text-slate-700">اختر الإضافات المطلوبة:</span>
          
          <div className="grid grid-cols-1 gap-1.5">
            {EXTRA_MODIFIERS.map((mod) => (
              <button
                key={mod.id}
                onClick={() => handleSelect(mod)}
                className="flex items-center justify-between p-2.5 bg-white hover:bg-blue-50 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">{mod.name}</span>
                </div>
                <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  +OMR {mod.price.toFixed(3)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer active:scale-95 transition-transform"
          >
            تم الانتهاء
          </button>
        </div>
      </div>
    </div>
  );
};
