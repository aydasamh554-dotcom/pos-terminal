import React, { useState } from 'react';
import { 
  Bike, 
  Car, 
  Phone, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Plus, 
  UserCheck, 
  ArrowUpRight, 
  Receipt,
  Search,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { DeliveryDriver, INITIAL_DRIVERS } from '../data/restaurantSuiteData';
import { posAudio } from '../utils/audio';

interface DeliveryFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export const DeliveryFleetModal: React.FC<DeliveryFleetModalProps> = ({
  isOpen,
  onClose,
  currency = 'ر.ع'
}) => {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(() => {
    const saved = localStorage.getItem('pos_drivers_data');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingDriver, setIsAddingDriver] = useState<boolean>(false);
  const [newDriverName, setNewDriverName] = useState<string>('');
  const [newDriverPhone, setNewDriverPhone] = useState<string>('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<string>('دراجة نارية');

  if (!isOpen) return null;

  const handleSettleCash = (driverId: string) => {
    posAudio.playCashRegister();
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return {
          ...d,
          cashOnHand: 0,
          status: 'available',
          activeOrdersCount: 0
        };
      }
      return d;
    }));
    if (selectedDriver?.id === driverId) {
      setSelectedDriver(prev => prev ? { ...prev, cashOnHand: 0, status: 'available', activeOrdersCount: 0 } : null);
    }
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim()) return;
    posAudio.playSuccess();

    const newDriver: DeliveryDriver = {
      id: `drv-${Date.now()}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      vehicle: newDriverVehicle,
      plateNumber: 'ع-م-ن ' + Math.floor(1000 + Math.random() * 9000),
      status: 'available',
      totalDeliveriesToday: 0,
      cashOnHand: 0,
      activeOrdersCount: 0,
      avatarColor: 'bg-emerald-600'
    };

    setDrivers([newDriver, ...drivers]);
    setIsAddingDriver(false);
    setNewDriverName('');
    setNewDriverPhone('');
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.phone.includes(searchQuery) ||
    d.vehicle.includes(searchQuery)
  );

  const totalCashWithDrivers = drivers.reduce((sum, d) => sum + d.cashOnHand, 0);
  const totalDeliveriesToday = drivers.reduce((sum, d) => sum + d.totalDeliveriesToday, 0);
  const activeDriversCount = drivers.filter(d => d.status !== 'off_duty').length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-5xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                إدارة أسطول السائقين والتوصيل (Delivery Fleet)
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  {drivers.length} سائق مسجل
                </span>
              </h2>
              <p className="text-slate-400 text-xs">تعيين السائقين، تتبع الطلبات الخارجية، وتصفية العهد النقدية للدرج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Stats Strip */}
        <div className="bg-[#0f172a] px-6 py-3 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold">إجمالي عهد السائقين (النقدية معهم)</p>
              <p className="text-amber-400 font-mono font-black text-lg mt-0.5">
                {totalCashWithDrivers.toFixed(3)} {currency}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold">طلبات التوصيل المنجزة اليوم</p>
              <p className="text-emerald-400 font-mono font-black text-lg mt-0.5">
                {totalDeliveriesToday} طلب توصيل
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold">السائقين على رأس العمل</p>
              <p className="text-blue-400 font-mono font-black text-lg mt-0.5">
                {activeDriversCount} من {drivers.length} سائق
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content Body: Drivers List & Detail / Form */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0b1120]">
          
          {/* Left Column: Drivers List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="البحث باسم السائق، الهاتف، المركبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => {
                  posAudio.playTap();
                  setIsAddingDriver(true);
                  setSelectedDriver(null);
                }}
                className="h-9 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سائق</span>
              </button>
            </div>

            {/* Drivers Cards */}
            <div className="space-y-2.5">
              {filteredDrivers.map(driver => (
                <div
                  key={driver.id}
                  onClick={() => {
                    posAudio.playTap();
                    setSelectedDriver(driver);
                    setIsAddingDriver(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedDriver?.id === driver.id
                      ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-[#1e293b] border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${driver.avatarColor} text-white font-black flex items-center justify-center text-sm shadow`}>
                      {driver.vehicle.includes('سيارة') ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm">{driver.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          driver.status === 'on_delivery'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                            : driver.status === 'available'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {driver.status === 'on_delivery' ? 'في الطريق (توصيل)' : driver.status === 'available' ? 'متاح للطلب' : 'إجازة / غير متاح'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                        <span>{driver.phone}</span>
                        <span>•</span>
                        <span>{driver.vehicle} ({driver.plateNumber})</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-slate-400">العهدة النقدية:</p>
                    <p className="text-amber-400 font-mono font-black text-sm">
                      {driver.cashOnHand.toFixed(3)} {currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Driver Details / Settle / Add Form (5 Cols) */}
          <div className="lg:col-span-5">
            {isAddingDriver ? (
              /* Add New Driver Form */
              <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <h3 className="text-white font-black text-sm flex items-center gap-2 border-b border-slate-700 pb-3">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>تسجيل سائق توصيل جديد</span>
                </h3>

                <form onSubmit={handleAddDriver} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">اسم السائق الكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: يوسف اليعقوبي"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">رقم الهاتف / الواتساب</label>
                    <input
                      type="tel"
                      required
                      placeholder="0501234567"
                      value={newDriverPhone}
                      onChange={(e) => setNewDriverPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">نوع المركبة</label>
                    <select
                      value={newDriverVehicle}
                      onChange={(e) => setNewDriverVehicle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="دراجة نارية هوندا">دراجة نارية هوندا</option>
                      <option value="دراجة نارية ياماها">دراجة نارية ياماها</option>
                      <option value="سيارة تويوتا يارس">سيارة تويوتا يارس</option>
                      <option value="سيارة هيونداي أكسنت">سيارة هيونداي أكسنت</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow"
                    >
                      حفظ السائق
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingDriver(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedDriver ? (
              /* Selected Driver Details & Settlement Card */
              <div className="bg-[#1e293b] p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${selectedDriver.avatarColor} text-white flex items-center justify-center`}>
                      {selectedDriver.vehicle.includes('سيارة') ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm">{selectedDriver.name}</h3>
                      <p className="text-slate-400 text-xs">{selectedDriver.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400">المركبة واللوحة:</span>
                    <span className="text-white font-bold">{selectedDriver.vehicle} ({selectedDriver.plateNumber})</span>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400">عدد المشاوير المكتملة اليوم:</span>
                    <span className="text-emerald-400 font-bold">{selectedDriver.totalDeliveriesToday} مشوار</span>
                  </div>

                  <div className="flex justify-between p-2.5 bg-amber-950/40 rounded-xl border border-amber-700/50">
                    <span className="text-amber-300 font-bold">العهدة النقدية المطلوب توريدها:</span>
                    <span className="text-amber-400 font-mono font-black text-sm">
                      {selectedDriver.cashOnHand.toFixed(3)} {currency}
                    </span>
                  </div>
                </div>

                {/* Settle Cash Button */}
                <button
                  disabled={selectedDriver.cashOnHand === 0}
                  onClick={() => handleSettleCash(selectedDriver.id)}
                  className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                    selectedDriver.cashOnHand > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>تصفية العهدة واستلام النقدية وإيداعها في الصندوق</span>
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[220px] bg-[#1e293b]/60 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bike className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-400">اختر سائقاً من القائمة لعرض حسابه وتصفية عهدته</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            يتم تحديث عهدة السائق تلقائياً فور إتمام أي طلب توصيل خارجي
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
