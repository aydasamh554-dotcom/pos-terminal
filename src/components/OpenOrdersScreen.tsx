import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Printer, 
  CreditCard, 
  Edit3, 
  Bike, 
  Car, 
  Clock, 
  Phone, 
  MapPin, 
  Navigation, 
  Check, 
  UserCheck,
  Trash2
} from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { DeliveryDriver } from '../data/restaurantSuiteData';
import { posAudio } from '../utils/audio';
import { InvoPaymentModal } from './InvoPaymentModal';
import { OpenShiftDrawerModal } from './OpenShiftDrawerModal';

interface OpenOrdersScreenProps {
  orders: InvoOrder[];
  selectedChannel?: 'takeaway' | 'delivery' | 'pickup';
  onBack: () => void;
  onNewOrder: (channel: 'takeaway' | 'delivery' | 'pickup') => void;
  onSelectOrder: (order: InvoOrder) => void;
  onOrderPaid?: (orderId: string, method: string) => void;
  onAssignDriver?: (orderId: string, driverId: string, driverName: string) => void;
  onDeleteOrder?: (orderId: string, reason?: string) => void;
  drivers?: DeliveryDriver[];
  employeeName?: string;
  isShiftOpen?: boolean;
  onOpenShift?: (amount: number, cashierName: string, notes?: string) => void;
  currency?: string;
}

export const OpenOrdersScreen: React.FC<OpenOrdersScreenProps> = ({
  orders,
  selectedChannel = 'takeaway',
  onBack,
  onNewOrder,
  onSelectOrder,
  onOrderPaid,
  onAssignDriver,
  onDeleteOrder,
  drivers = [],
  employeeName = 'ابو عايض',
  isShiftOpen = false,
  onOpenShift,
  currency = 'ر.ع',
}) => {
  const [activeTab, setActiveTab] = useState<'takeaway' | 'delivery' | 'pickup'>(selectedChannel);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<InvoOrder | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isVoidPromptOpen, setIsVoidPromptOpen] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('إلغاء الطلب من قبل الزبون');

  // Keep viewingOrder synced with live orders from cloud
  useEffect(() => {
    if (viewingOrder) {
      const refreshed = orders.find(o => o.id === viewingOrder.id);
      if (refreshed) {
        setViewingOrder(refreshed);
      }
    }
  }, [orders]);

  // Live timer tick every second for real-time moving seconds & minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live elapsed time for an order
  const getLiveElapsedTime = (ord: InvoOrder): string => {
    const subNumStr = ord.subNumber ? ` (${ord.subNumber})` : '';
    if (!ord.createdAt) {
      return ord.elapsedTime || `0s${subNumStr}`;
    }
    const elapsedSecs = Math.max(0, Math.floor((Date.now() - ord.createdAt) / 1000));
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    if (mins === 0) {
      return `${secs}s${subNumStr}`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s${subNumStr}`;
  };

  const channels: { id: 'takeaway' | 'delivery' | 'pickup'; label: string; icon: string }[] = [
    { id: 'takeaway', label: 'سفري', icon: '🛍️' },
    { id: 'delivery', label: 'توصيل', icon: '🛵' },
    { id: 'pickup', label: 'Pick Up', icon: '📦' },
  ];

  const filteredOrders = orders.filter((o) => o.channel === activeTab);

  const handleCardClick = (ord: InvoOrder) => {
    posAudio.playTap();
    setSelectedOrderId(ord.id);
    setViewingOrder(ord);
    setSelectedDriverId(ord.deliveryDriverId || '');
  };

  const handlePrint = () => {
    posAudio.playPrint();
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 2000);
  };

  const handlePayComplete = (method: string) => {
    if (viewingOrder) {
      if (onOrderPaid) {
        onOrderPaid(viewingOrder.id, method);
      }
      setIsPaymentOpen(false);
      setViewingOrder(null);
      setSelectedOrderId(null);
    }
  };

  const handleDriverChangeInModal = (driverId: string) => {
    setSelectedDriverId(driverId);
    if (!viewingOrder) return;
    const foundDriver = drivers.find(d => d.id === driverId);
    const driverName = foundDriver ? foundDriver.name : '';
    if (onAssignDriver) {
      onAssignDriver(viewingOrder.id, driverId, driverName);
    }
    posAudio.playSuccess();
  };

  return (
    <div 
      className="h-screen w-screen max-w-lg mx-auto bg-white flex flex-col justify-between p-3 select-none text-slate-800 shadow-2xl relative" 
      dir="rtl"
    >
      {/* Top Header Bar matching Video Frame 00:03 & 00:07 */}
      <header className="w-full flex items-center justify-between px-2 py-1.5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          {/* invo logo with green dot */}
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 lowercase font-sans">
              invo
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          {/* Real-time Open Orders Counter Badge */}
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-black text-xs font-mono">
            {filteredOrders.length}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-slate-800">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold truncate max-w-[80px]">{employeeName}</span>
          </div>
        </div>

        {/* Channel Selection Tabs matching Video 00:03 */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                posAudio.playTap();
                setActiveTab(ch.id);
                setSelectedOrderId(null);
              }}
              className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === ch.id
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Sub-Header: Open Orders Title & Count */}
      <div className="w-full px-2 pt-2 pb-1 flex items-center justify-between text-xs font-bold text-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-900 font-black text-sm">
            {activeTab === 'delivery' ? 'طلبات التوصيل المفتوحة' : activeTab === 'takeaway' ? 'طلبات السفري المفتوحة' : 'طلبات Pick Up المفتوحة'}
          </span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[11px] font-black">
            {filteredOrders.length} طلب
          </span>
        </div>
        <span className="text-slate-500 text-[11px] hidden sm:inline">
          مزامنة سحابية لحظية ⚡
        </span>
      </div>

      {/* Orders Cards Grid: 2 Invoices per row (Video Frame 00:04 & 00:18) */}
      <div className="flex-1 bg-slate-50/70 rounded-2xl p-3 border border-slate-200 overflow-y-auto my-1">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
              {activeTab === 'delivery' ? '🛵' : activeTab === 'takeaway' ? '🛍️' : '📦'}
            </div>
            <p className="text-sm font-bold">لا توجد طلبات معلقة في هذا القسم</p>
            <p className="text-xs text-slate-400">الطلبات الجديدة تُزامن تلقائياً عبر السحابة فور إنشائها</p>
            <button
              onClick={() => onNewOrder(activeTab)}
              className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>فتح طلب جديد الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredOrders.map((ord) => {
              const isSelected = selectedOrderId === ord.id;
              const liveElapsed = getLiveElapsedTime(ord);

              return (
                <div
                  key={ord.id}
                  onClick={() => handleCardClick(ord)}
                  className={`bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px] active:scale-[0.98] group relative ${
                    isSelected 
                      ? 'border-2 border-red-500 ring-2 ring-red-200 shadow-md' 
                      : 'border border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {/* Order Details matching Video Frame 00:04 */}
                  <div className="text-right space-y-1">
                    {/* Live Ticking Elapsed Time with subNumber */}
                    <div className="font-mono text-[11px] text-slate-500 font-bold leading-none flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{liveElapsed}</span>
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    {/* Order Number */}
                    <div className="font-black text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {ord.orderNumber}
                    </div>

                    {/* Customer Name or Cashier */}
                    <div className="text-xs font-black text-slate-800 truncate">
                      {ord.customerName || ord.cashierName || 'زبون'}
                    </div>

                    {/* Delivery Specific metadata: Phone & Driver status */}
                    {ord.channel === 'delivery' && (
                      <div className="space-y-0.5 pt-0.5">
                        {ord.customerPhone && (
                          <div className="text-[10px] text-slate-600 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{ord.customerPhone}</span>
                          </div>
                        )}
                        <div className="text-[10px] font-bold">
                          {ord.deliveryDriverName ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              <Bike className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{ord.deliveryDriverName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              <span>⚠️ بدون سائق</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Takeaway vehicle note if present */}
                    {ord.channel === 'takeaway' && ord.carDetails && (
                      <div className="text-[10px] text-amber-700 truncate font-bold flex items-center gap-1">
                        <Car className="w-2.5 h-2.5 shrink-0" />
                        <span>{ord.carDetails}</span>
                      </div>
                    )}

                    {/* Pick up scheduled time if present */}
                    {ord.channel === 'pickup' && ord.pickupTime && (
                      <div className="text-[10px] text-purple-700 truncate font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span>{ord.pickupTime}</span>
                      </div>
                    )}

                    {/* Items count */}
                    <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                      {ord.items?.length || 0} أصناف
                    </div>
                  </div>

                  {/* Bottom Green Price Pill Button matching video */}
                  <div className="mt-2 w-full py-1.5 px-2 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs sm:text-sm rounded-xl font-mono text-center shadow-sm">
                    {currency} {ord.total.toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Footer with Back & New Order buttons matching Video Frame 00:04 */}
      <footer className="w-full flex items-center justify-between pt-2 border-t border-slate-200 shrink-0">
        <button
          onClick={() => {
            posAudio.playTap();
            onBack();
          }}
          className="w-32 sm:w-36 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-transform"
        >
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            posAudio.playTap();
            onNewOrder(activeTab);
          }}
          className="w-32 sm:w-36 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-transform"
        >
          <span>New</span>
        </button>
      </footer>

      {/* Receipt / Order Details Modal matching Video Frame 00:06 - 00:12 & 00:17 */}
      {viewingOrder && !isPaymentOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-150"
          dir="rtl"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Header matching Video Frame 00:06 */}
            <div className="bg-[#0f172a] text-white p-3 flex items-center justify-between shrink-0">
              <span className="font-mono font-black text-sm tracking-wide">
                {viewingOrder.orderNumber} ({viewingOrder.subNumber || '32'})
              </span>
              <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                {viewingOrder.channel === 'takeaway' ? 'سفري' : viewingOrder.channel === 'delivery' ? 'توصيل' : 'Pick Up'}
              </span>
              <button
                onClick={() => {
                  posAudio.playTap();
                  setViewingOrder(null);
                }}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer shadow active:scale-95"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Customer & Delivery Dispatch Section (Simplified Delivery Channel) */}
            {viewingOrder.channel === 'delivery' && (
              <div className="bg-blue-50/70 p-3 border-b border-blue-100 text-xs space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewingOrder.customerName || 'عميل توصيل'}</span>
                  </div>
                  {viewingOrder.customerPhone && (
                    <a 
                      href={`tel:${viewingOrder.customerPhone}`}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs hover:bg-emerald-700"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{viewingOrder.customerPhone}</span>
                    </a>
                  )}
                </div>

                {viewingOrder.deliveryAddress && (
                  <div className="text-[11px] text-slate-600 flex items-start gap-1 bg-white p-1.5 rounded-lg border border-blue-200">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{viewingOrder.deliveryAddress}</span>
                  </div>
                )}

                <div className="text-[10px] text-blue-600 font-bold bg-blue-100/60 px-2 py-1 rounded-md text-center">
                  قناة التوصيل مبسطة (إسناد وتتبع الأسطول مؤجل لمرحلة لاحقة)
                </div>
              </div>
            )}

            {/* Receipt Body matching Video Frame 00:06 */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5 bg-white">
              {viewingOrder.items?.map((it, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between text-blue-600 font-bold text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-slate-800">{it.qty}</span>
                      <span>{it.name}</span>
                    </div>
                    <span className="font-mono">{(it.price * it.qty).toFixed(3)}</span>
                  </div>

                  {/* Notes / Modifiers matching video Frame 00:06 */}
                  {it.notes && (
                    <div className="mr-8 mt-1 text-xs text-slate-500 font-medium whitespace-pre-line bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {it.notes}
                    </div>
                  )}
                </div>
              ))}

              {printSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg text-center border border-emerald-200 animate-in fade-in">
                  تمت طباعة التذكرة بنجاح 🖨️
                </div>
              )}

              {/* Confirmation / Void Prompt inside Receipt Modal */}
              {isVoidPromptOpen && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-red-700 font-bold text-xs">
                    <span className="flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تأكيد إلغاء / حذف الطلب</span>
                    </span>
                    <button 
                      onClick={() => setIsVoidPromptOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-red-600">
                    سيتم حذف الطلب من السحابة ونقله لأرشيف المحذوفات مع توثيق السبب والكاشير.
                  </p>

                  <select
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    className="w-full p-1.5 bg-white border border-red-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="إلغاء الطلب من قبل الزبون">إلغاء الطلب من قبل الزبون</option>
                    <option value="خطأ في تسجيل الأصناف">خطأ في تسجيل الأصناف</option>
                    <option value="تأخر تجهيز الطلب">تأخر تجهيز الطلب</option>
                    <option value="طلب تجريبي">طلب تجريبي / تدريب</option>
                  </select>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (onDeleteOrder && viewingOrder) {
                          posAudio.playTap();
                          onDeleteOrder(viewingOrder.id, voidReason, viewingOrder);
                          setIsVoidPromptOpen(false);
                          setViewingOrder(null);
                          setSelectedOrderId(null);
                        }
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-95 transition-transform"
                    >
                      تأكيد الحذف النهائي
                    </button>
                    <button
                      onClick={() => setIsVoidPromptOpen(false)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Green Total Box matching Video Frame 00:06 */}
            <div className="px-4 py-2 bg-emerald-600 text-white flex items-center justify-between font-black text-base font-mono shrink-0">
              <span>Total</span>
              <span>{currency} {viewingOrder.total.toFixed(3)}</span>
            </div>

            {/* Action Buttons: Edit Order, Print Ticket, Pay + Cancel/Void */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    posAudio.playTap();
                    onSelectOrder(viewingOrder);
                  }}
                  className="py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Edit Order</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Ticket</span>
                </button>

                <button
                  onClick={() => {
                    posAudio.playTap();
                    if (!isShiftOpen) {
                      setIsOpenShiftModalOpen(true);
                      return;
                    }
                    setIsPaymentOpen(true);
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay</span>
                </button>
              </div>

              {/* Red Void / Cancel Order Button */}
              <button
                onClick={() => {
                  posAudio.playTap();
                  setIsVoidPromptOpen(true);
                }}
                className="w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إلغاء / حذف الطلب من السحابة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal opened from Receipt Pay button matching Video Frame 00:13 - 00:16 */}
      {isPaymentOpen && viewingOrder && (
        <InvoPaymentModal
          isOpen={isPaymentOpen}
          total={viewingOrder.total}
          onClose={() => setIsPaymentOpen(false)}
          onConfirmPayment={handlePayComplete}
        />
      )}

      {/* Open Morning Shift Drawer Modal if attempting to settle without active shift */}
      <OpenShiftDrawerModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        onConfirmOpenShift={(amount, cashier, notes) => {
          if (onOpenShift) {
            onOpenShift(amount, cashier, notes);
          }
          setIsOpenShiftModalOpen(false);
          setIsPaymentOpen(true);
        }}
        currentEmployeeName={employeeName}
        isTriggeredByPayment={true}
      />
    </div>
  );
};
