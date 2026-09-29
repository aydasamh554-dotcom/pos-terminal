import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  RotateCcw, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  Eye, 
  FileText, 
  CheckCircle2, 
  X, 
  ShieldAlert,
  Printer,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { Employee } from '../types';
import { posAudio } from '../utils/audio';
import { PinPadModal } from './PinPadModal';

interface DeletedOrdersScreenProps {
  deletedOrders: InvoOrder[];
  onBack: () => void;
  onRestoreOrder: (order: InvoOrder) => void;
  onPermanentlyDeleteOrder: (orderId: string) => void;
  onClearAllDeleted: () => void;
  currentEmployee?: Employee;
  adminPin?: string;
  employees?: Employee[];
}

export const DeletedOrdersScreen: React.FC<DeletedOrdersScreenProps> = ({
  deletedOrders,
  onBack,
  onRestoreOrder,
  onPermanentlyDeleteOrder,
  onClearAllDeleted,
  currentEmployee,
  adminPin = '1234',
  employees = [],
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery' | 'pickup'>('all');
  const [selectedOrder, setSelectedOrder] = useState<InvoOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);
  const [isConfirmDeleteOneOpen, setIsConfirmDeleteOneOpen] = useState<boolean>(false);
  const [orderToDeleteOne, setOrderToDeleteOne] = useState<InvoOrder | null>(null);
  
  // Manager status check
  const isManager = Boolean(
    currentEmployee && (
      currentEmployee.role?.includes('مدير') ||
      currentEmployee.role?.includes('مشرف') ||
      currentEmployee.code === 'POS-101'
    )
  );

  const [isPinPadOpen, setIsPinPadOpen] = useState<boolean>(false);
  const [pinActionType, setPinActionType] = useState<'purge_all' | 'delete_one' | 'restore'>('restore');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return deletedOrders.filter(ord => {
      // Channel filter
      if (selectedChannel !== 'all' && ord.channel !== selectedChannel) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = (ord.orderNumber || '').toLowerCase().includes(q);
        const subMatch = (ord.subNumber || '').toLowerCase().includes(q);
        const tableMatch = (ord.tableName || '').toLowerCase().includes(q);
        const custMatch = (ord.customerName || '').toLowerCase().includes(q);
        const deletedByMatch = (ord.deletedBy || '').toLowerCase().includes(q);
        const reasonMatch = (ord.deleteReason || '').toLowerCase().includes(q);
        const itemsMatch = (ord.items || []).some(it => it.name.toLowerCase().includes(q));
        return numMatch || subMatch || tableMatch || custMatch || deletedByMatch || reasonMatch || itemsMatch;
      }
      return true;
    });
  }, [deletedOrders, selectedChannel, searchQuery]);

  // Statistics
  const totalVoidedAmount = deletedOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

  // Handle Restore
  const handleRestore = (order: InvoOrder) => {
    posAudio.playTap();
    if (isManager) {
      posAudio.playSuccess();
      onRestoreOrder(order);
      if (selectedOrder?.id === order.id) {
        setIsReceiptModalOpen(false);
      }
    } else {
      setSelectedOrder(order);
      setPinActionType('restore');
      setIsPinPadOpen(true);
    }
  };

  // Handle Permanent Delete One
  const handleRequestPermanentDelete = (order: InvoOrder) => {
    posAudio.playTap();
    setOrderToDeleteOne(order);
    if (isManager) {
      setIsConfirmDeleteOneOpen(true);
    } else {
      setPinActionType('delete_one');
      setIsPinPadOpen(true);
    }
  };

  const handleConfirmDeleteOne = () => {
    if (!orderToDeleteOne) return;
    posAudio.playTrash();
    onPermanentlyDeleteOrder(orderToDeleteOne.id);
    setIsConfirmDeleteOneOpen(false);
    setOrderToDeleteOne(null);
    if (selectedOrder?.id === orderToDeleteOne.id) {
      setIsReceiptModalOpen(false);
    }
  };

  // Handle Purge All
  const handleRequestPurgeAll = () => {
    posAudio.playTap();
    if (isManager) {
      setIsConfirmClearOpen(true);
    } else {
      setPinActionType('purge_all');
      setIsPinPadOpen(true);
    }
  };

  const handleConfirmPurgeAll = () => {
    posAudio.playTrash();
    onClearAllDeleted();
    setIsConfirmClearOpen(false);
    setIsReceiptModalOpen(false);
  };

  const handlePinSuccess = () => {
    setIsPinPadOpen(false);
    if (pinActionType === 'purge_all') {
      handleConfirmPurgeAll();
    } else if (pinActionType === 'delete_one' && orderToDeleteOne) {
      handleConfirmDeleteOne();
    } else if (pinActionType === 'restore' && selectedOrder) {
      posAudio.playSuccess();
      onRestoreOrder(selectedOrder);
      setIsReceiptModalOpen(false);
    }
  };

  const formatDeletedDate = (timestamp?: number) => {
    if (!timestamp) return 'غير محدد';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-screen h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-cairo select-none" dir="rtl">
      
      {/* 1. Header Bar */}
      <header className="h-16 bg-[#1e293b] text-white px-4 flex items-center justify-between shadow-md shrink-0">
        
        {/* Right side: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              posAudio.playTap();
              onBack();
            }}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-700"
            title="الرجوع للرئيسية"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
                <span>سجل المحذوفات والفواتير الملغية</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-xs font-bold">
                  {deletedOrders.length}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                أرشيف الفواتير والوجبات المحذوفة مع إمكانية المراجعة والاسترجاع
              </p>
            </div>
          </div>
        </div>

        {/* Left side: Current User & Quick Purge Button */}
        <div className="flex items-center gap-2.5">
          {deletedOrders.length > 0 && (
            <button
              onClick={handleRequestPurgeAll}
              className="px-3 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
              title="تفريغ سلة المحذوفات نهائياً"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تفريغ المحذوفات</span>
            </button>
          )}

          {/* User Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isManager 
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' 
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <User className="w-3.5 h-3.5" />
            <span>{currentEmployee?.name || 'ابو عايض'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded">
              {isManager ? 'مدير' : 'كاشير'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Top Stats & Filter Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، الطاولة، العميل، أو سبب الحذف..."
            className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedChannel === 'all'
                ? 'bg-[#1e293b] text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({deletedOrders.length})
          </button>
          <button
            onClick={() => setSelectedChannel('dine_in')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedChannel === 'dine_in'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المحلي ({deletedOrders.filter(o => o.channel === 'dine_in').length})
          </button>
          <button
            onClick={() => setSelectedChannel('takeaway')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedChannel === 'takeaway'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            سفري ({deletedOrders.filter(o => o.channel === 'takeaway').length})
          </button>
          <button
            onClick={() => setSelectedChannel('delivery')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedChannel === 'delivery'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            توصيل ({deletedOrders.filter(o => o.channel === 'delivery').length})
          </button>
          <button
            onClick={() => setSelectedChannel('pickup')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedChannel === 'pickup'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pick Up ({deletedOrders.filter(o => o.channel === 'pickup').length})
          </button>
        </div>

        {/* Total Voided Sum */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-bold text-rose-700">إجمالي المبالغ الملغية:</span>
          <span className="font-mono text-sm font-black text-rose-700">
            OMR {totalVoidedAmount.toFixed(3)}
          </span>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Trash2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700">لا توجد فواتير محذوفة حالياً</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              عند إلغاء أو حذف أي فاتورة من شاشات الكاشير أو الطاولات، سيتم نقلها مباشرة إلى هذا القسم ليتمكن المدير من مراجعتها أو استعادتها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => {
              const channelLabel = ord.channel === 'dine_in' ? 'محلي' : ord.channel === 'takeaway' ? 'سفري' : ord.channel === 'delivery' ? 'توصيل' : 'Pick Up';
              const channelColor = ord.channel === 'dine_in' ? 'bg-blue-100 text-blue-800 border-blue-200' : ord.channel === 'takeaway' ? 'bg-amber-100 text-amber-800 border-amber-200' : ord.channel === 'delivery' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-purple-100 text-purple-800 border-purple-200';

              return (
                <div 
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  {/* Top Line: Order # + Channel + Total */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        ({ord.subNumber || '01'})
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${channelColor}`}>
                        {channelLabel} {ord.tableName ? `• ${ord.tableName}` : ''}
                      </span>
                    </div>

                    <div className="font-mono font-black text-rose-600 text-base">
                      OMR {(ord.total || 0).toFixed(3)}
                    </div>
                  </div>

                  {/* Deletion Metadata (Who deleted, when, and reason) */}
                  <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-1 font-bold text-rose-900">
                        <User className="w-3 h-3 text-rose-500" />
                        <span>تم الحذف بواسطة: {ord.deletedBy || 'المدير'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDeletedDate(ord.deletedAt)}</span>
                      </div>
                    </div>

                    {ord.deleteReason && (
                      <div className="text-[11px] text-rose-800 font-medium pt-0.5">
                        <span className="font-bold">السبب: </span>
                        <span>{ord.deleteReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Items Preview List */}
                  <div className="space-y-1 py-1">
                    <div className="text-[11px] font-bold text-slate-500">
                      الأصناف ({ord.items.length}):
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={it.id || idx} className="flex items-center justify-between text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                          <span className="font-bold">{it.qty}x {it.name}</span>
                          <span className="font-mono text-slate-500 font-semibold">
                            OMR {(it.price * it.qty).toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    {/* View Receipt */}
                    <button
                      onClick={() => {
                        posAudio.playTap();
                        setSelectedOrder(ord);
                        setIsReceiptModalOpen(true);
                      }}
                      className="py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                      title="عرض تفاصيل الفاتورة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </button>

                    {/* Restore */}
                    <button
                      onClick={() => handleRestore(ord)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                      title="استرجاع الفاتورة للطلبات النشطة"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استرجاع</span>
                    </button>

                    {/* Permanent Delete */}
                    <button
                      onClick={() => handleRequestPermanentDelete(ord)}
                      className="py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all border border-rose-200"
                      title="حذف نهائي من الأرشيف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف نهائي</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Full Receipt Viewer Modal */}
      {isReceiptModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm">
                  تفاصيل الفاتورة المحذوفة ({selectedOrder.orderNumber})
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs text-slate-800">
              
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <div className="font-bold text-base font-cairo">مطعم ومطبخ الضيافة</div>
                <div className="text-slate-500">فاتورة ملغية / محذوفة</div>
                <div className="text-xs text-rose-600 font-bold bg-rose-50 py-1 px-3 rounded-full inline-block mt-1">
                  حالة السجل: محذوفة من النظام
                </div>
              </div>

              <div className="space-y-1 text-slate-600 pb-2 border-b border-slate-200">
                <div className="flex justify-between">
                  <span>رقم الطلب:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.orderNumber} ({selectedOrder.subNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span>القناة:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrder.channel === 'dine_in' ? 'محلي' : selectedOrder.channel === 'takeaway' ? 'سفري' : 'توصيل'} 
                    {selectedOrder.tableName ? ` (${selectedOrder.tableName})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>حذفت بواسطة:</span>
                  <span className="font-bold text-rose-700">{selectedOrder.deletedBy || 'المدير'}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ وتوقيت الحذف:</span>
                  <span className="font-bold">{formatDeletedDate(selectedOrder.deletedAt)}</span>
                </div>
                {selectedOrder.deleteReason && (
                  <div className="flex justify-between text-rose-600 pt-1">
                    <span>سبب الحذف:</span>
                    <span className="font-bold">{selectedOrder.deleteReason}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 font-cairo pb-1 border-b border-slate-200 flex justify-between">
                  <span>الصنف</span>
                  <span>الإجمالي</span>
                </div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100">
                    <div>
                      <span className="font-bold font-cairo">{it.name}</span>
                      <span className="text-slate-400 mr-2 font-mono">({it.qty} × {it.price.toFixed(3)})</span>
                    </div>
                    <span className="font-bold">{(it.qty * it.price).toFixed(3)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center font-bold text-sm">
                <span>الإجمالي الكلي:</span>
                <span className="text-rose-600 font-black text-base">OMR {selectedOrder.total.toFixed(3)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => handleRestore(selectedOrder)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استرجاع الفاتورة</span>
              </button>

              <button
                onClick={() => handleRequestPermanentDelete(selectedOrder)}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف نهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirm Purge All Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تأكيد تفريغ سلة المحذوفات</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                هل أنت متأكد من حذف جميع الفواتير الملغية ({deletedOrders.length} فاتورة) بشكل نهائي؟ لا يمكن التراجع عن هذه الخطوة.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleConfirmPurgeAll}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all"
              >
                نعم، تفريغ الكل
              </button>
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Confirm Single Delete Modal */}
      {isConfirmDeleteOneOpen && orderToDeleteOne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">حذف الفاتورة نهائياً</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                سيتم مسح الفاتورة رقم <span className="font-mono font-bold text-slate-900">{orderToDeleteOne.orderNumber}</span> بالكامل من قاعدة البيانات.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteOne}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all"
              >
                نعم، حذف نهائي
              </button>
              <button
                onClick={() => setIsConfirmDeleteOneOpen(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PIN Pad for Cashier Authorization */}
      <PinPadModal
        isOpen={isPinPadOpen}
        onClose={() => setIsPinPadOpen(false)}
        onSuccess={handlePinSuccess}
        title="مطلوب رمز المدير لإجراء العمليات على المحذوفات"
        managerOnly={true}
        adminPin={adminPin}
        employees={employees}
      />
    </div>
  );
};
