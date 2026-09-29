import React, { useState } from 'react';
import { Order, OrderType, OrderStatus } from '../types';
import { posAudio } from '../utils/audio';
import { 
  X, 
  Utensils, 
  Bike, 
  ShoppingBag, 
  Car, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Eye, 
  AlertCircle,
  Filter
} from 'lucide-react';

interface ActiveOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewReceipt: (order: Order) => void;
  currency: string;
}

export const ActiveOrdersModal: React.FC<ActiveOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  onViewReceipt,
  currency,
}) => {
  const [filterType, setFilterType] = useState<OrderType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  if (!isOpen) return null;

  const filteredOrders = orders.filter((order) => {
    const matchesType = filterType === 'all' || order.type === filterType;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getChannelBadge = (type: OrderType) => {
    switch (type) {
      case 'dine_in':
        return { label: 'المحلي', icon: Utensils, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'delivery':
        return { label: 'توصيل', icon: Bike, bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'pickup':
        return { label: 'Pick Up', icon: ShoppingBag, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'takeaway':
        return { label: 'سفري', icon: Car, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-1 rounded-full font-bold">جديد</span>;
      case 'preparing':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">قيد التحضير 🍳</span>;
      case 'ready':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">جاهز للاستلام ✨</span>;
      case 'served':
      case 'delivered':
      case 'completed':
        return <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">مكتمل</span>;
      default:
        return <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-1 rounded-full">ملغي</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">إدارة ومتابعة طلبات اليوم</h2>
              <p className="text-xs text-slate-400">
                إجمالي الطلبات المسجلة: {orders.length} طلب | المفتوحة النشطة: {orders.filter(o => o.status !== 'completed').length}
              </p>
            </div>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Filter tabs */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => { posAudio.playTap(); setFilterType('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              جميع القنوات ({orders.length})
            </button>
            <button
              onClick={() => { posAudio.playTap(); setFilterType('dine_in'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'dine_in' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              المحلي ({orders.filter(o => o.type === 'dine_in').length})
            </button>
            <button
              onClick={() => { posAudio.playTap(); setFilterType('delivery'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'delivery' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              توصيل ({orders.filter(o => o.type === 'delivery').length})
            </button>
            <button
              onClick={() => { posAudio.playTap(); setFilterType('takeaway'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'takeaway' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              سفري ({orders.filter(o => o.type === 'takeaway').length})
            </button>
            <button
              onClick={() => { posAudio.playTap(); setFilterType('pickup'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'pickup' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Pick Up ({orders.filter(o => o.type === 'pickup').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold">لا توجد طلبات مسجلة في هذا القسم</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const channel = getChannelBadge(order.type);
              const ChannelIcon = channel.icon;

              return (
                <div
                  key={order.id}
                  className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white font-mono-num">
                        #{order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1 ${channel.bg}`}>
                        <ChannelIcon className="w-3.5 h-3.5" />
                        {channel.label}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-slate-400 font-mono-num">
                        {order.createdAt}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                      {order.tableName && (
                        <span className="font-bold text-amber-400">
                          {order.tableName} ({order.guestCount || 1} ضيوف)
                        </span>
                      )}
                      {order.customerName && (
                        <span>العميل: {order.customerName} {order.customerPhone && `(${order.customerPhone})`}</span>
                      )}
                      {order.carDetails && (
                        <span className="text-purple-300">السيارة: {order.carDetails}</span>
                      )}
                      {order.deliveryAddress && (
                        <span className="text-emerald-300">العنوان: {order.deliveryAddress}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      الأصناف ({order.items.reduce((acc, i) => acc + i.quantity, 0)}):{' '}
                      {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(' • ')}
                    </p>
                  </div>

                  {/* Right: Total and Quick Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-700/60">
                    <div className="text-right pl-3">
                      <span className="text-xs text-slate-400 block">الإجمالي:</span>
                      <span className="text-base font-black text-emerald-400 font-mono-num">
                        {order.total.toFixed(2)} {currency}
                      </span>
                    </div>

                    {/* Status Changer */}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => {
                          posAudio.playTap();
                          onUpdateOrderStatus(order.id, 'ready');
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        تحويل لـ (جاهز)
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => {
                          posAudio.playSuccess();
                          onUpdateOrderStatus(order.id, 'completed');
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم التسليم / إنهاء
                      </button>
                    )}

                    {/* View / Print Receipt */}
                    <button
                      onClick={() => {
                        posAudio.playTap();
                        onViewReceipt(order);
                      }}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
                      title="عرض الفاتورة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
