import React, { useState } from 'react';
import { X, Sliders, Users, MapPin, Phone, User, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface OrderOptionsModalProps {
  isOpen: boolean;
  currentChannel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  currentTable?: string;
  currentCustomerName?: string;
  guestCount: number;
  onClose: () => void;
  onUpdateOptions: (opts: {
    channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
    tableName: string;
    customerName: string;
    guestCount: number;
  }) => void;
}

export const OrderOptionsModal: React.FC<OrderOptionsModalProps> = ({
  isOpen,
  currentChannel,
  currentTable = 'جلسة 1',
  currentCustomerName = '',
  guestCount: initialGuestCount,
  onClose,
  onUpdateOptions,
}) => {
  const [channel, setChannel] = useState(currentChannel);
  const [tableName, setTableName] = useState(currentTable);
  const [customerName, setCustomerName] = useState(currentCustomerName);
  const [guestCount, setGuestCount] = useState(initialGuestCount);

  if (!isOpen) return null;

  const handleSave = () => {
    posAudio.playSuccess();
    onUpdateOptions({
      channel,
      tableName,
      customerName,
      guestCount,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-[#1e293b] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm">خيارات الطلب والفاتورة (Options)</h3>
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

        <div className="p-4 space-y-3.5 bg-[#f8fafc]">
          {/* Channel Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع الطلب:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'dine_in', label: 'المحلي' },
                { id: 'takeaway', label: 'سفري' },
                { id: 'delivery', label: 'توصيل' },
                { id: 'pickup', label: 'Pick Up' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    posAudio.playTap();
                    setChannel(ch.id as any);
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
                    channel === ch.id
                      ? 'bg-blue-600 text-white font-black ring-2 ring-blue-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table / Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>اسم الطاولة / الجلسة / العنوان:</span>
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="مثال: جلسة 1، عوائل 3، طاولة 2..."
              className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>اسم العميل / رقم الهاتف (اختياري):</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="اسم العميل أو الهاتف..."
              className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Guest Count for Split */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>عدد الأشخاص لتقسيم الفاتورة:</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    posAudio.playTap();
                    setGuestCount(num);
                  }}
                  className={`flex-1 py-2 rounded-xl font-mono font-black text-xs transition-all cursor-pointer ${
                    guestCount === num
                      ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
