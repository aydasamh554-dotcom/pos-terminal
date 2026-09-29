import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Users, 
  MapPin, 
  Phone, 
  User, 
  Check, 
  Bike, 
  Car, 
  Clock, 
  Navigation 
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import { DeliveryDriver } from '../data/restaurantSuiteData';

interface OrderOptionsModalProps {
  isOpen: boolean;
  currentChannel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  currentTable?: string;
  currentCustomerName?: string;
  currentCustomerPhone?: string;
  currentDeliveryAddress?: string;
  currentDeliveryDriverId?: string;
  currentDeliveryDriverName?: string;
  currentCarDetails?: string;
  currentPickupTime?: string;
  guestCount: number;
  availableDrivers?: DeliveryDriver[];
  onClose: () => void;
  onUpdateOptions: (opts: {
    channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
    tableName: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDriverId?: string;
    deliveryDriverName?: string;
    carDetails?: string;
    pickupTime?: string;
    guestCount: number;
  }) => void;
}

export const OrderOptionsModal: React.FC<OrderOptionsModalProps> = ({
  isOpen,
  currentChannel,
  currentTable = 'جلسة 1',
  currentCustomerName = '',
  currentCustomerPhone = '',
  currentDeliveryAddress = '',
  currentDeliveryDriverId = '',
  currentDeliveryDriverName = '',
  currentCarDetails = '',
  currentPickupTime = '',
  guestCount: initialGuestCount,
  availableDrivers = [],
  onClose,
  onUpdateOptions,
}) => {
  const [channel, setChannel] = useState(currentChannel);
  const [tableName, setTableName] = useState(currentTable);
  const [customerName, setCustomerName] = useState(currentCustomerName);
  const [customerPhone, setCustomerPhone] = useState(currentCustomerPhone);
  const [deliveryAddress, setDeliveryAddress] = useState(currentDeliveryAddress);
  const [deliveryDriverId, setDeliveryDriverId] = useState(currentDeliveryDriverId);
  const [deliveryDriverName, setDeliveryDriverName] = useState(currentDeliveryDriverName);
  const [carDetails, setCarDetails] = useState(currentCarDetails);
  const [pickupTime, setPickupTime] = useState(currentPickupTime);
  const [guestCount, setGuestCount] = useState(initialGuestCount);

  if (!isOpen) return null;

  const handleSave = () => {
    posAudio.playSuccess();
    onUpdateOptions({
      channel,
      tableName: channel === 'dine_in' ? tableName : (channel === 'takeaway' ? 'سفري' : channel === 'delivery' ? 'توصيل' : 'Pick Up'),
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDriverId,
      deliveryDriverName,
      carDetails,
      pickupTime,
      guestCount,
    });
    onClose();
  };

  const handleDriverSelect = (driverId: string) => {
    if (!driverId) {
      setDeliveryDriverId('');
      setDeliveryDriverName('');
      return;
    }
    const matched = availableDrivers.find(d => d.id === driverId);
    if (matched) {
      setDeliveryDriverId(matched.id);
      setDeliveryDriverName(matched.name);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        <div className="bg-[#1e293b] text-white p-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">خيارات وبيانات الطلب</h3>
              <p className="text-[11px] text-slate-300">العميل، القناة، عنوان التوصيل، والسائق</p>
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

        <div className="p-4 space-y-4 bg-[#f8fafc] overflow-y-auto flex-1">
          {/* Channel Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الطلب (قناة البيع):</label>
            <div className="grid grid-cols-4 gap-2">
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
                  className={`py-2 px-1 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
                    channel === ch.id
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dine-In specific options */}
          {channel === 'dine_in' && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>اسم الطاولة / الجلسة:</span>
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="مثال: جلسة 1، عوائل 3، طاولة 2..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>عدد الضيوف / الأشخاص (لتوزيع الفاتورة):</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        posAudio.playTap();
                        setGuestCount(num);
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-mono font-black text-xs transition-all cursor-pointer ${
                        guestCount === num
                          ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Name & Phone (All Channels) */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>بيانات العميل:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم العميل:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: سالم الوهيبي..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>رقم الهاتف:</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="مثال: 96891234567"
                  dir="ltr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Delivery Specific Fields */}
          {channel === 'delivery' && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-blue-600" />
                <span>تفاصيل التوصيل والأسطول (Delivery Dispatch):</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-blue-950 mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>عنوان التوصيل / تفاصيل الموقع:</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="المنطقة، رقم الشارع، رقم المبنى أو الشقة، علامة مميزة..."
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-950 mb-1 flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                  <span>إسناد سائق من الأسطول:</span>
                </label>
                <select
                  value={deliveryDriverId}
                  onChange={(e) => handleDriverSelect(e.target.value)}
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- لم يتم إسناد سائق بعد --</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehicle} - {d.phone}) {d.status === 'on_delivery' ? '⚡ (في مهمة)' : '🟢 (متاح)'}
                    </option>
                  ))}
                </select>
                {deliveryDriverName && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">
                    تم إسناد الطلب للسائق: {deliveryDriverName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Takeaway Specific Fields */}
          {channel === 'takeaway' && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-600" />
                <span>بيانات استلام السفري / خدمة السيارات (Car Pick):</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  تفاصيل السيارة / رقم اللوحة أو لون السيارة:
                </label>
                <input
                  type="text"
                  value={carDetails}
                  onChange={(e) => setCarDetails(e.target.value)}
                  placeholder="مثال: لاندكروزر أبيض لوحة 4212 أو تسليم داخل المحل"
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Pick Up Specific Fields */}
          {channel === 'pickup' && (
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>موعد الاستلام (Pick Up Time):</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1">
                  وقت الاستلام المحدد من العميل:
                </label>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="مثال: بعد 25 دقيقة (الساعة 2:30 م)"
                  className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-transform"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>حفظ البيانات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
