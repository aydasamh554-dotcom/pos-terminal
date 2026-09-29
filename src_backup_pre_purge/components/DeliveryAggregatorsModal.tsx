import React, { useState } from 'react';
import { 
  X, 
  Bike, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  AlertCircle, 
  Plus, 
  Power, 
  DollarSign, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Percent, 
  Send 
} from 'lucide-react';
import { AggregatorPlatform, AggregatorOrder, AggregatorPlatformKey, POSSettings } from '../types';
import { DEFAULT_AGGREGATOR_PLATFORMS, INITIAL_AGGREGATOR_ORDERS } from '../data/aggregatorsData';
import { posAudio } from '../utils/audio';

interface DeliveryAggregatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: POSSettings;
  onSendToKitchen?: (order: AggregatorOrder) => void;
}

export const DeliveryAggregatorsModal: React.FC<DeliveryAggregatorsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSendToKitchen,
}) => {
  const [platforms, setPlatforms] = useState<AggregatorPlatform[]>(() => {
    const saved = localStorage.getItem('invo_aggregator_platforms');
    return saved ? JSON.parse(saved) : DEFAULT_AGGREGATOR_PLATFORMS;
  });

  const [orders, setOrders] = useState<AggregatorOrder[]>(() => {
    const saved = localStorage.getItem('invo_aggregator_orders');
    return saved ? JSON.parse(saved) : INITIAL_AGGREGATOR_ORDERS;
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'platforms' | 'reconciliation'>('orders');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');

  if (!isOpen) return null;

  const savePlatforms = (updated: AggregatorPlatform[]) => {
    setPlatforms(updated);
    localStorage.setItem('invo_aggregator_platforms', JSON.stringify(updated));
  };

  const saveOrders = (updated: AggregatorOrder[]) => {
    setOrders(updated);
    localStorage.setItem('invo_aggregator_orders', JSON.stringify(updated));
  };

  const handleTogglePlatform = (key: AggregatorPlatformKey) => {
    posAudio.playTap();
    const updated = platforms.map(p => p.key === key ? { ...p, isActive: !p.isActive } : p);
    savePlatforms(updated);
  };

  const handleSimulateIncomingOrder = () => {
    posAudio.playAddItem();
    const activePlatforms = platforms.filter(p => p.isActive);
    const plat = activePlatforms.length > 0 
      ? activePlatforms[Math.floor(Math.random() * activePlatforms.length)]
      : platforms[0];

    const randomCodes = ['JHZ-5412', 'HNG-8902', 'MSL-3145', 'TLB-2299'];
    const names = ['سلطان الحربي', 'خالد الغامدي', 'نورة السبيعي', 'محمد القحطاني', 'فيصل الدوسري'];
    const neighborhoods = ['حي النرجس', 'حي حطين', 'حي الربيع', 'حي العقيق'];

    const chosenCode = `#${plat.nameEn.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenAddress = `${neighborhoods[Math.floor(Math.random() * neighborhoods.length)]} - شارع الأمير تركي`;

    const sampleMeals = [
      { name: 'مضغوط دجاج', price: 1.900 },
      { name: 'دجاج شواية مع بشاور', price: 1.900 },
      { name: 'دجاج مظبي', price: 1.500 },
      { name: 'علبة بيبسي', price: 0.300 },
    ];

    const count = 1 + Math.floor(Math.random() * 3);
    const selectedItems = [];
    let subtotal = 0;
    for (let i = 0; i < count; i++) {
      const meal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      selectedItems.push({ name: meal.name, qty, price: meal.price });
      subtotal += meal.price * qty;
    }

    const commissionAmount = (subtotal * plat.commissionPercent) / 100;
    const netPayout = subtotal - commissionAmount;

    const newOrder: AggregatorOrder = {
      id: `agg-${Date.now()}`,
      platform: plat.key,
      platformOrderCode: chosenCode,
      customerName: chosenName,
      customerPhone: '+966 5' + Math.floor(10000000 + Math.random() * 90000000),
      deliveryAddress: chosenAddress,
      driverName: `كابتن ${plat.name}`,
      driverPhone: '+966 5' + Math.floor(10000000 + Math.random() * 90000000),
      items: selectedItems,
      orderTotal: subtotal,
      platformCommission: Math.round(commissionAmount * 1000) / 1000,
      netPayoutToRestaurant: Math.round(netPayout * 1000) / 1000,
      status: 'incoming',
      receivedAt: 'الآن',
      estimatedPickupMinutes: 15,
    };

    saveOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: AggregatorOrder['status']) => {
    posAudio.playSuccess();
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        if (nextStatus === 'preparing' && onSendToKitchen) {
          onSendToKitchen(ord);
        }
        return { ...ord, status: nextStatus };
      }
      return ord;
    });
    saveOrders(updated);
  };

  const filteredOrders = orders.filter(o => {
    if (selectedPlatformFilter === 'all') return true;
    return o.platform === selectedPlatformFilter;
  });

  // Financial statistics
  const totalAggregatorGross = orders.reduce((s, o) => s + o.orderTotal, 0);
  const totalCommissions = orders.reduce((s, o) => s + o.platformCommission, 0);
  const totalNetPayout = orders.reduce((s, o) => s + o.netPayoutToRestaurant, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">مركز تكامل تطبيقات ومنصات التوصيل (Aggregators Hub)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                  متصل ومفعل
                </span>
              </div>
              <p className="text-xs text-slate-400">
                جاهز، هنقرستيشن، مرسول، طلبات، تويو ونينجا - استقبال الطلبات آلياً وحساب عمولات المنصات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSimulateIncomingOrder}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>محاكاة طلب تطبيق جديد</span>
            </button>

            <button
              onClick={() => { posAudio.playTap(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/70 px-6 py-2 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'orders' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الطلبات الواردة الحية ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'platforms' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              إعدادات المنصات والعمولات ({platforms.filter(p => p.isActive).length} نشطة)
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'reconciliation' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              المطابقة المالية ومستحقات المطعم
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">تصفية المنصة:</span>
              <select
                value={selectedPlatformFilter}
                onChange={(e) => setSelectedPlatformFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 outline-none"
              >
                <option value="all">جميع المنصات</option>
                {platforms.map(p => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

          {/* TAB 1: LIVE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm font-bold">لا توجد طلبات جارية من تطبيقات التوصيل حالياً</p>
                  <p className="text-xs">اضغط على زر "محاكاة طلب تطبيق جديد" بالأعلى لتجربة تدفق الطلبات</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map(order => {
                    const platformMeta = platforms.find(p => p.key === order.platform) || platforms[0];

                    return (
                      <div 
                        key={order.id} 
                        className={`bg-slate-950/70 border rounded-3xl p-4.5 flex flex-col justify-between space-y-3 transition-all ${
                          order.status === 'incoming' ? 'border-orange-500/70 shadow-lg shadow-orange-500/10' : 'border-slate-800'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`px-2.5 py-1 rounded-xl text-xs font-black text-white ${platformMeta.logoColor}`}>
                              {platformMeta.name}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white font-mono">{order.platformOrderCode}</h4>
                              <p className="text-[11px] text-slate-400">{order.receivedAt}</p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'incoming' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse' :
                            order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            order.status === 'ready_for_pickup' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {order.status === 'incoming' ? 'طلب جديد وارد' :
                             order.status === 'preparing' ? 'قيد التحضير بالمطبخ' :
                             order.status === 'ready_for_pickup' ? 'جاهز للتسليم للسائق' : 'تم التسليم'}
                          </span>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="bg-slate-900/80 rounded-2xl p-3 space-y-1.5 text-xs text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold">{order.customerName}</span>
                            <span className="text-[11px] font-mono text-slate-400" dir="ltr">{order.customerPhone}</span>
                          </div>
                          {order.deliveryAddress && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{order.deliveryAddress}</span>
                            </div>
                          )}
                        </div>

                        {/* Meal Items */}
                        <div className="space-y-1 py-1">
                          <span className="text-[11px] font-bold text-slate-400 block mb-1">الوجبات المطلوبة:</span>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-white">
                              <span>{it.qty} × {it.name}</span>
                              <span className="font-mono-num text-slate-400">{(it.price * it.qty).toFixed(3)} {settings.currency}</span>
                            </div>
                          ))}
                        </div>

                        {/* Financial summary for order */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[11px] text-slate-400 block">الإجمالي:</span>
                            <strong className="text-sm font-black font-mono-num text-white">
                              {order.orderTotal.toFixed(3)} {settings.currency}
                            </strong>
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 block">
                              عمولة {platformMeta.commissionPercent}%: -{order.platformCommission.toFixed(3)}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 font-mono-num">
                              صافي المحل: {order.netPayoutToRestaurant.toFixed(3)} {settings.currency}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                          {order.status === 'incoming' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>قبول الطلب وتوجيهه للمطبخ KDS</span>
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>اكتمل التجهيز (بانتظار السائق)</span>
                            </button>
                          )}

                          {order.status === 'ready_for_pickup' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Bike className="w-4 h-4" />
                              <span>تسليم للكابتن (إتمام الطلب)</span>
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <div className="text-center py-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 rounded-xl">
                              تم التسليم بنجاح
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLATFORMS SETTINGS */}
          {activeTab === 'platforms' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">الربط الإلكتروني مع منصات وتطبيقات التوصيل</h3>
                <p className="text-xs text-slate-400">
                  قم بتفعيل أو إيقاف التطبيقات وتحديد نسبة العمولة المتفق عليها في عقد الامتياز لكل منصة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map(platform => (
                  <div 
                    key={platform.key}
                    className={`bg-slate-950/70 border rounded-3xl p-5 flex items-center justify-between transition-all ${
                      platform.isActive ? 'border-slate-700 shadow-md' : 'border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${platform.logoColor} text-white flex items-center justify-center font-black text-base shadow-md`}>
                        {platform.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{platform.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">({platform.nameEn})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>نسبة العمولة:</span>
                          <strong className="text-amber-400 font-bold font-mono-num">{platform.commissionPercent}%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTogglePlatform(platform.key)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          platform.isActive 
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title={platform.isActive ? 'تعطيل الاستقبال' : 'تفعيل الاستقبال'}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4.5">
                  <span className="text-xs text-slate-400 block mb-1">إجمالي مبيعات التطبيقات (Gross)</span>
                  <h3 className="text-2xl font-black font-mono-num text-white">
                    {totalAggregatorGross.toFixed(3)} {settings.currency}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">{orders.length} طلب منفذ</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4.5">
                  <span className="text-xs text-slate-400 block mb-1">إجمالي العمولات المقتطعة للمنصات</span>
                  <h3 className="text-2xl font-black font-mono-num text-rose-400">
                    -{totalCommissions.toFixed(3)} {settings.currency}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">متوسط عمولة المنصات ~18%</span>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-3xl p-4.5">
                  <span className="text-xs text-emerald-300 font-bold block mb-1">صافي مستحقات المطعم للتحويل البنكي</span>
                  <h3 className="text-2xl font-black font-mono-num text-emerald-400">
                    {totalNetPayout.toFixed(3)} {settings.currency}
                  </h3>
                  <span className="text-[11px] text-emerald-200/70 mt-1 block">جاهز للمطابقة والتسوية البنكية</span>
                </div>
              </div>

              {/* Table of Reconciliation by Platform */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 uppercase">
                    <tr>
                      <th className="p-3.5">المنصة</th>
                      <th className="p-3.5">عدد الطلبات</th>
                      <th className="p-3.5">إجمالي المبيعات</th>
                      <th className="p-3.5">نسبة العمولة</th>
                      <th className="p-3.5">مبلغ العمولة المقتطع</th>
                      <th className="p-3.5 text-left">صافي المستحق للمطعم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {platforms.map(plat => {
                      const platOrders = orders.filter(o => o.platform === plat.key);
                      const gross = platOrders.reduce((s, o) => s + o.orderTotal, 0);
                      const comm = platOrders.reduce((s, o) => s + o.platformCommission, 0);
                      const net = platOrders.reduce((s, o) => s + o.netPayoutToRestaurant, 0);

                      return (
                        <tr key={plat.key} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${plat.logoColor}`}></span>
                            <span>{plat.name}</span>
                          </td>
                          <td className="p-3.5 font-mono-num">{platOrders.length} طلب</td>
                          <td className="p-3.5 font-mono-num font-bold text-white">{gross.toFixed(3)} {settings.currency}</td>
                          <td className="p-3.5 font-mono-num text-slate-400">{plat.commissionPercent}%</td>
                          <td className="p-3.5 font-mono-num text-rose-400">-{comm.toFixed(3)} {settings.currency}</td>
                          <td className="p-3.5 font-mono-num font-bold text-emerald-400 text-left text-sm">
                            {net.toFixed(3)} {settings.currency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
