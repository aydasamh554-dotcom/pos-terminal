import React, { useState } from 'react';
import { X, Check, FileText, Sparkles } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface ItemNoteModalProps {
  isOpen: boolean;
  itemName: string;
  currentNote?: string;
  onClose: () => void;
  onSaveNote: (note: string) => void;
}

const PRESET_NOTES = [
  'بدون بصل',
  'شطة زيادة',
  'مشوي زيادة',
  'سفري / خارجي',
  'رز زيادة',
  'بارد بدون فلفل',
  'حار جداً 🌶️',
  'بدون ملح',
  'مرق زيادة',
  'طحينة زيادة',
  'سلطة إضافية',
  'خبز ساخن',
  'استواء كامل',
  'تجهيز سريع ⚡',
];

export const ItemNoteModal: React.FC<ItemNoteModalProps> = ({
  isOpen,
  itemName,
  currentNote = '',
  onClose,
  onSaveNote,
}) => {
  const [noteText, setNoteText] = useState<string>(currentNote);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    posAudio.playTap();
    if (noteText.includes(tag)) {
      setNoteText(prev => prev.replace(tag, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim());
    } else {
      setNoteText(prev => (prev ? `${prev}، ${tag}` : tag));
    }
  };

  const handleSave = () => {
    posAudio.playSuccess();
    onSaveNote(noteText.trim());
    onClose();
  };

  const handleClear = () => {
    posAudio.playTap();
    setNoteText('');
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#1e293b] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">إضافة ملاحظة للوجبة</h3>
              <p className="text-xs text-slate-300 font-semibold truncate max-w-[200px]">
                {itemName}
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

        {/* Note Input Box */}
        <div className="p-3.5 space-y-3 bg-[#f8fafc]">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>نص الملاحظة أو التعليمات للمطبخ:</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب أي ملاحظة خاصة بالوجبة (مثلاً: بدون بصل، زيادة شطة)..."
              rows={3}
              className="w-full p-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden font-bold text-slate-900 placeholder:text-slate-400 shadow-inner resize-none"
            />
          </div>

          {/* Quick Preset Badges */}
          <div>
            <span className="block text-xs font-bold text-slate-600 mb-2">
              اختيارات سريعة:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
              {PRESET_NOTES.map((tag) => {
                const isSelected = noteText.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white border border-blue-700 ring-2 ring-blue-300 font-black'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            مسح الملاحظة
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                posAudio.playTap();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ الملاحظة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
