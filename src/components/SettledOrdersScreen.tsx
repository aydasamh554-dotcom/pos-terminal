import React, { useState, useMemo } from 'react';
import { User, X, Printer, Ban, Search as SearchIcon, Calendar, Clock, ShieldAlert, MessageCircle } from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { Employee, DigitalReceiptData } from '../types';
import { EMPLOYEES_LIST } from '../data/mockData';
import { PinPadModal } from './PinPadModal';
import { DigitalReceiptShareModal } from './DigitalReceiptShareModal';
import { posAudio } from '../utils/audio';

interface SettledOrdersScreenProps {
  settledOrders: InvoOrder[];
  onBack: () => void;
  onVoidOrder?: (orderId: string) => void;
  onOpenDeletedOrders?: () => void;
  currentEmployee?: Employee;
  employeeName?: string;
  adminPin?: string;
  employees?: Employee[];
}

export const SettledOrdersScreen: React.FC<SettledOrdersScreenProps> = ({
  settledOrders,
  onBack,
  onVoidOrder,
  onOpenDeletedOrders,
  currentEmployee,
  employeeName = 'ابو عايض',
  adminPin = '1234',
  employees = EMPLOYEES_LIST,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<InvoOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery' | 'pickup'>('all');
  const [isManagerPinOpen, setIsManagerPinOpen] = useState<boolean>(false);
  const [orderToVoid, setOrderToVoid] = useState<InvoOrder | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Manager status check:
  const isManager = Boolean(
    currentEmployee && (
      currentEmployee.role?.includes('مدير') ||
      currentEmployee.role?.includes('مشرف') ||
      currentEmployee.code === 'POS-101'
    )
  );

  // 24-Hour Auto Expiration Filter: Only show invoices created within the last 24 hours
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const validOrders = useMemo(() => {
    return settledOrders.filter((order) => {
      // If order has createdAt, ensure it is within 24 hours; otherwise keep it
      if (order.createdAt && now - order.createdAt > TWENTY_FOUR_HOURS_MS) {
        return false; // Auto-expired after 24 hours
      }
      return true;
    });
  }, [settledOrders, now]);

  const filteredOrders = useMemo(() => {
    return validOrders.filter((ord) => {
      // Tab filter
      if (activeTab !== 'all' && ord.channel !== activeTab) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = ord.orderNumber?.toLowerCase().includes(q);
        const matchesCustomer = ord.customerName?.toLowerCase().includes(q);
        const matchesSub = ord.subNumber?.includes(q);
        const matchesTable = ord.tableName?.toLowerCase().includes(q);
        return matchesNumber || matchesCustomer || matchesSub || matchesTable;
      }
      return true;
    });
  }, [validOrders, activeTab, searchQuery]);

  const handlePrint = (ord: InvoOrder) => {
    posAudio.playTap();
    window.print();
  };

  const handleRequestVoid = (ord: InvoOrder) => {
    posAudio.playTap();
    if (isManager) {
      // Manager logged in: Void immediately without PIN prompt!
      posAudio.playTrash();
      if (onVoidOrder) {
        onVoidOrder(ord.id);
      }
      setSelectedOrder(null);
    } else {
      // Worker logged in: Must ask manager for PIN
      setOrderToVoid(ord);
      setIsManagerPinOpen(true);
    }
  };

  const handleManagerVoidSuccess = () => {
    setIsManagerPinOpen(false);
    if (orderToVoid && onVoidOrder) {
      posAudio.playTrash();
      onVoidOrder(orderToVoid.id);
    }
    setOrderToVoid(null);
    setSelectedOrder(null);
  };

  return (
    <div 
      className="h-screen w-screen max-w-lg mx-auto bg-white flex flex-col justify-between p-3 select-none text-slate-800 shadow-2xl relative overflow-hidden" 
      dir="rtl"
    >
      {/* Top Header Bar matching Video 00:05 & 00:06 */}
      <header className="w-full flex items-center justify-between px-2 py-1.5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* invo logo */}
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 lowercase font-sans">
              invo
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>

          {/* Green Circle 0 Badge */}
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-black text-xs font-mono">
            0
          </div>

          {/* User Profile with Role indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isManager ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800'}`}>
            <div className={`w-5 h-5 rounded flex items-center justify-center text-white font-bold text-xs ${isManager ? 'bg-amber-600' : 'bg-blue-600'}`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">
              {currentEmployee?.name || employeeName} {isManager ? '(مدير)' : '(كاشير)'}
            </span>
          </div>
        </div>

        {/* Right side in RTL: Deleted Archive button and "All" Badge */}
        <div className="flex items-center gap-1.5">
          {onOpenDeletedOrders && (
            <button
              onClick={() => {
                posAudio.playTap();
                onOpenDeletedOrders();
              }}
              className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="سجل المحذوفات والفواتير الملغية"
            >
              <span>المحذوفات</span>
            </button>
          )}
          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('all');
            }}
            className={`py-1 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
        </div>
      </header>

      {/* Sub-Header & 24h Expiration Tag */}
      <div className="w-full px-2 pt-1.5 pb-1 flex items-center justify-between text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-900 text-sm">الفواتير المسددة</span>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full font-mono text-[11px] font-bold">
            {filteredOrders.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>تنتهي تلقائياً كل 24 ساعة</span>
        </div>
      </div>

      {/* Search Input Bar (Toggleable) */}
      {isSearchOpen && (
        <div className="px-2 py-1.5 bg-slate-100 rounded-xl mb-1 flex items-center gap-2 animate-in fade-in shrink-0">
          <SearchIcon className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الفاتورة أو اسم العميل..."
            className="flex-1 bg-transparent text-xs font-bold outline-none text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="w-5 h-5 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Grid: 2 Invoices per Row ("في كل خط مستقيم فتورتين: فتوره يسار وفتوره يمين") matching video 00:06-00:13 */}
      <div className="flex-1 bg-slate-50/70 rounded-2xl p-2 border border-slate-200 overflow-y-auto my-1">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
            <p className="text-sm font-bold">لا توجد فواتير مسددة حالياً</p>
            <p className="text-xs text-slate-400">الفواتير تظهر هنا بعد الدفع وتختفي بعد 24 ساعة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  posAudio.playTap();
                  setSelectedOrder(ord);
                }}
                className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between min-h-[125px] active:scale-[0.98] group"
              >
                {/* Header Line: Elapsed Time + Order Number */}
                <div className="text-right space-y-0.5">
                  <div className="font-mono text-[10px] text-slate-500 font-semibold leading-none">
                    {ord.elapsedTime || '0m 00s'}
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ord.orderNumber}
                  </div>
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {ord.customerName || 'زبون'}
                  </div>
                </div>

                {/* Bottom Section: Amount Pill (Green) or Table Bar (Orange) matching video */}
                <div className="mt-2 space-y-1">
                  <div className="w-full py-1 px-2 bg-slate-100 text-emerald-600 group-hover:bg-emerald-50 font-black text-xs rounded-lg font-mono text-center">
                    OMR {ord.total.toFixed(3)}
                  </div>
                  
                  {ord.tableName && (
                    <div className="w-full py-0.5 px-1 bg-[#ea580c] text-white font-bold text-[10px] rounded text-center truncate">
                      {ord.tableName} {ord.tableName.includes('Table') ? '' : `Table: ${ord.subNumber || '1'}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer with Back & Search buttons matching Video 00:06 */}
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
            setIsSearchOpen(!isSearchOpen);
          }}
          className="w-32 sm:w-36 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-transform"
        >
          <SearchIcon className="w-4 h-4" />
          <span>Search</span>
        </button>
      </footer>

      {/* FULL INVOICE DETAILS MODAL MATCHING VIDEO 00:14 */}
      {selectedOrder && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh] border border-slate-200 text-slate-800">
            
            {/* Modal Header matching Video 00:14 */}
            <div className="p-3 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-900">
                  {selectedOrder.orderNumber} ({selectedOrder.subNumber || '1'})
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-xs rounded-md">
                  {selectedOrder.channel === 'takeaway' ? 'سفري' : selectedOrder.channel === 'delivery' ? 'توصيل' : selectedOrder.channel === 'pickup' ? 'Pick Up' : 'المحلي'}
                </span>
              </div>

              {/* Red X Close Button */}
              <button
                onClick={() => {
                  posAudio.playTap();
                  setSelectedOrder(null);
                }}
                className="w-8 h-8 bg-[#e53935] hover:bg-rose-600 text-white rounded-lg flex items-center justify-center active:scale-95 cursor-pointer shadow"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Items List matching Video 00:14 */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              <div className="text-xs text-slate-400 font-bold pb-1 border-b border-slate-100 flex justify-between">
                <span>اسم الصنف والكمية</span>
                <span>السعر</span>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 text-xs">
                    <div className="flex items-center gap-3 text-right">
                      <span className="font-bold text-slate-800">{it.name}</span>
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[11px]">
                        {it.qty}
                      </span>
                    </div>
                    <span className="font-mono font-black text-[#2563eb] text-xs">
                      {(it.price * it.qty).toFixed(3)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-bold">
                  لا توجد أصناف مسجلة
                </div>
              )}
            </div>

            {/* Modal Summary matching Video 00:14 */}
            <div className="p-3 bg-[#f8fafc] border-t border-slate-200 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total</span>
                <span className="font-mono font-black text-sm text-emerald-600">
                  OMR {selectedOrder.total.toFixed(3)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Tendered</span>
                <span className="font-mono font-bold">
                  OMR {selectedOrder.total.toFixed(3)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Change</span>
                <span className="font-mono font-bold">
                  OMR 0.000
                </span>
              </div>

              {/* Action Buttons: Print Ticket & Void Ticket matching Video 00:14 */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePrint(selectedOrder)}
                    className="py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Ticket</span>
                  </button>

                  <button
                    onClick={() => handleRequestVoid(selectedOrder)}
                    className="py-2 bg-slate-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    title="إلغاء الفاتورة (يتطلب صلاحية المدير)"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Void Ticket</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    posAudio.playTap();
                    setIsShareModalOpen(true);
                  }}
                  className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                  <span>إرسال الفاتورة عبر WhatsApp / SMS للعميل</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Digital Receipt Share Modal for Settled Order */}
      {isShareModalOpen && selectedOrder && (
        <DigitalReceiptShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={{
            orderNumber: selectedOrder.orderNumber,
            restaurantName: 'مطعم مذاق الشام والأصيل',
            restaurantPhone: '+966 55 112 2334',
            customerPhone: selectedOrder.customerPhone || '',
            customerName: selectedOrder.customerName || '',
            items: selectedOrder.items ? selectedOrder.items.map(i => ({
              name: i.name,
              qty: i.qty,
              price: i.price,
            })) : [],
            total: selectedOrder.total,
            taxAmount: selectedOrder.tax || (selectedOrder.total * 0.05),
            taxNumber: '310458921400003',
            paymentMethod: selectedOrder.paymentMethod === 'card' ? 'بطاقة مدى / ائتمان' : 'نقدي (Cash)',
            dateString: selectedOrder.timeString || 'اليوم',
            tableName: selectedOrder.tableName,
            channelName: selectedOrder.channel === 'dine_in' ? 'محلي' : 
                         selectedOrder.channel === 'takeaway' ? 'سفري' :
                         selectedOrder.channel === 'delivery' ? 'توصيل' : 'Pick Up',
          }}
        />
      )}

      {/* Security Manager PIN Modal for Voiding Invoices */}
      <PinPadModal
        isOpen={isManagerPinOpen}
        onClose={() => {
          setIsManagerPinOpen(false);
          setOrderToVoid(null);
        }}
        onSuccess={handleManagerVoidSuccess}
        allowedEmployees={employees}
        managerOnly={true}
        adminPin={adminPin}
        title="صلاحية المدير مطلوبة لإلغاء وحذف الفاتورة"
      />
    </div>
  );
};
