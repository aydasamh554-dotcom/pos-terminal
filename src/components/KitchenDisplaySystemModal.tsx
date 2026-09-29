import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Flame, 
  Filter, 
  Check, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bell
} from 'lucide-react';
import { KDSTicket, KDSTicketItem, INITIAL_KDS_TICKETS } from '../data/restaurantSuiteData';
import { InvoOrder } from '../data/invoData';
import { posAudio } from '../utils/audio';

interface KitchenDisplaySystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveOrders?: InvoOrder[];
}

export const KitchenDisplaySystemModal: React.FC<KitchenDisplaySystemModalProps> = ({
  isOpen,
  onClose,
  liveOrders = []
}) => {
  const [tickets, setTickets] = useState<KDSTicket[]>(() => {
    const saved = localStorage.getItem('kds_tickets_data');
    return saved ? JSON.parse(saved) : INITIAL_KDS_TICKETS;
  });

  // Automatically sync live incoming orders from Cloud / POS into KDS tickets
  useEffect(() => {
    if (!liveOrders || liveOrders.length === 0) return;

    setTickets(prev => {
      const updated = [...prev];
      liveOrders.forEach(ord => {
        const ticketId = `kds-${ord.id}`;
        const existingIdx = updated.findIndex(t => t.id === ticketId || t.orderNumber === ord.orderNumber);

        const channelLabel = ord.channel === 'dine_in' 
          ? (ord.tableName || 'محلي') 
          : ord.channel === 'delivery' 
          ? `توصيل 🛵 (${ord.customerName || 'عميل'})`
          : ord.channel === 'takeaway'
          ? `سفري 🛍️ (${ord.customerName || 'سيارة'})`
          : `Pick Up 📦 (${ord.customerName || 'استلام'})`;

        const newItems: KDSTicketItem[] = (ord.items || []).map((it, idx) => ({
          id: `ki-${ord.id}-${idx}`,
          name: it.name,
          quantity: it.qty,
          notes: it.notes || '',
          station: (it.categoryId === 'drinks' ? 'drinks' : it.categoryId === 'sweets' ? 'dessert' : 'kitchen') as any,
          isDone: false,
        }));

        if (existingIdx > -1) {
          // If already existing, keep current cooking status & item done marks
          const cur = updated[existingIdx];
          updated[existingIdx] = {
            ...cur,
            tableOrChannel: channelLabel,
            serverName: ord.cashierName || cur.serverName,
            items: cur.items.length === newItems.length ? cur.items : newItems,
          };
        } else {
          // Newly arrived live order!
          const newTicket: KDSTicket = {
            id: ticketId,
            orderNumber: ord.orderNumber,
            tableOrChannel: channelLabel,
            orderType: ord.channel,
            serverName: ord.cashierName || 'الكاشير',
            elapsedSeconds: ord.createdAt ? Math.max(0, Math.floor((Date.now() - ord.createdAt) / 1000)) : 0,
            status: 'new',
            createdAt: ord.createdAt || Date.now(),
            items: newItems,
          };
          updated.unshift(newTicket);
        }
      });
      return updated;
    });
  }, [liveOrders]);

  const [activeStation, setActiveStation] = useState<'all' | 'grill' | 'kitchen' | 'drinks'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'ready' | 'served'>('active');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live timer tick every 10 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTickets(prev => 
        prev.map(t => t.status !== 'served' ? { ...t, elapsedSeconds: t.elapsedSeconds + 10 } : t)
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('kds_tickets_data', JSON.stringify(tickets));
  }, [tickets]);

  if (!isOpen) return null;

  const playChime = () => {
    if (soundEnabled) {
      posAudio.playSuccess();
    }
  };

  const handleToggleItemDone = (ticketId: string, itemId: string) => {
    posAudio.playTap();
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedItems = t.items.map(item => 
          item.id === itemId ? { ...item, isDone: !item.isDone } : item
        );
        // If all items are done, automatically set status to ready
        const allDone = updatedItems.every(i => i.isDone);
        return {
          ...t,
          items: updatedItems,
          status: allDone ? 'ready' : (t.status === 'ready' ? 'preparing' : t.status)
        };
      }
      return t;
    }));
  };

  const handleAdvanceStatus = (ticketId: string) => {
    playChime();
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (t.status === 'new') return { ...t, status: 'preparing' };
        if (t.status === 'preparing') {
          return { 
            ...t, 
            status: 'ready', 
            items: t.items.map(i => ({ ...i, isDone: true })) 
          };
        }
        if (t.status === 'ready') return { ...t, status: 'served' };
      }
      return t;
    }));
  };

  const handleResetTicket = (ticketId: string) => {
    posAudio.playTap();
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'preparing',
          items: t.items.map(i => ({ ...i, isDone: false }))
        };
      }
      return t;
    }));
  };

  const handleAddNewRandomTicket = () => {
    posAudio.playSuccess();
    const newNum = Math.floor(68960 + Math.random() * 100);
    const newTicket: KDSTicket = {
      id: `kds-${Date.now()}`,
      orderNumber: `Order ${newNum}`,
      tableOrChannel: `طاولة ${Math.floor(Math.random() * 8) + 1} (محلي)`,
      orderType: 'dine_in',
      serverName: 'الكاشير',
      elapsedSeconds: 0,
      status: 'new',
      createdAt: Date.now(),
      items: [
        { id: `ki-${Date.now()}-1`, name: 'شاورما لحم صاج عربي', quantity: 2, notes: 'بدون بقدونس، حار', station: 'grill' },
        { id: `ki-${Date.now()}-2`, name: 'سلطة فتوش شامية', quantity: 1, station: 'kitchen' },
        { id: `ki-${Date.now()}-3`, name: 'عصير رمان طازج', quantity: 2, station: 'drinks' }
      ]
    };
    setTickets([newTicket, ...tickets]);
  };

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    // Tab filter
    if (activeTab === 'active' && (t.status !== 'new' && t.status !== 'preparing')) return false;
    if (activeTab === 'ready' && t.status !== 'ready') return false;
    if (activeTab === 'served' && t.status !== 'served') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = t.orderNumber.toLowerCase().includes(q);
      const matchTable = t.tableOrChannel.toLowerCase().includes(q);
      const matchItem = t.items.some(i => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchTable && !matchItem) return false;
    }

    return true;
  });

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getUrgencyBadge = (sec: number) => {
    if (sec < 600) {
      return { bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50', label: 'طبيعي', color: 'emerald' };
    } else if (sec < 1200) {
      return { bg: 'bg-amber-950/80 text-amber-300 border-amber-700/50', label: 'متوسط', color: 'amber' };
    } else {
      return { bg: 'bg-rose-950/80 text-rose-300 border-rose-700/50 animate-pulse', label: 'متأخر!', color: 'rose' };
    }
  };

  const activeCount = tickets.filter(t => t.status === 'new' || t.status === 'preparing').length;
  const readyCount = tickets.filter(t => t.status === 'ready').length;
  const servedCount = tickets.filter(t => t.status === 'served').length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Top Header Bar */}
      <header className="h-16 bg-[#0f172a] border-b border-slate-700/80 px-4 md:px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-black text-lg tracking-wide">شاشة المطبخ والتحضير (KDS)</h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Live Kitchen Display
              </span>
            </div>
            <p className="text-slate-400 text-xs">نظام استلام وإدارة الطلبات وتنبيه الطهاة في الوقت الفعلي</p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-10 px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              soundEnabled 
                ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' 
                : 'bg-rose-950/50 border-rose-700 text-rose-300'
            }`}
            title="تفعيل/تعطيل التنبيهات الصوتية"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'صوت التنبيه مفعّل' : 'صامت'}</span>
          </button>

          {/* Test Order Button */}
          <button
            onClick={handleAddNewRandomTicket}
            className="h-10 px-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>محاكاة طلب جديد</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="h-10 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع للكاشير</span>
          </button>
        </div>
      </header>

      {/* Sub Header: Stations & Tabs */}
      <div className="bg-[#1e293b] border-b border-slate-700/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'active' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>تحت التحضير</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-900/60 text-slate-200">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'ready' 
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>جاهزة للتسليم</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-900/60 text-slate-200">
              {readyCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('served')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'served' 
                ? 'bg-blue-600 text-white shadow-md font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>المكتملة والمسلّمة</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-900/60 text-slate-200">
              {servedCount}
            </span>
          </button>
        </div>

        {/* Stations Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            المحطة:
          </span>
          {[
            { id: 'all', label: 'كل المحطات' },
            { id: 'grill', label: 'الشوايات والصاج' },
            { id: 'kitchen', label: 'المطبخ الساخن' },
            { id: 'drinks', label: 'المشروبات والبار' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeStation === st.id
                  ? 'bg-slate-700 text-white border-amber-500/60 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KDS Grid Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0b1120]">
        {filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60" />
            </div>
            <h3 className="text-white text-lg font-bold mb-1">لا توجد طلبات في هذا القسم حالياً</h3>
            <p className="text-slate-400 text-xs max-w-sm">جميع طلبات المطبخ تمت معالجتها وجاهزة للتقديم، اضغط "محاكاة طلب جديد" لتجربة التنبيهات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredTickets.map(ticket => {
              const urgency = getUrgencyBadge(ticket.elapsedSeconds);
              
              // Filter ticket items by station if selected
              const visibleItems = ticket.items.filter(item => 
                activeStation === 'all' ? true : item.station === activeStation || item.station === 'all'
              );

              if (visibleItems.length === 0) return null;

              const isAllDone = ticket.items.every(i => i.isDone);

              return (
                <div 
                  key={ticket.id}
                  className={`rounded-2xl border transition-all shadow-xl overflow-hidden flex flex-col bg-[#1e293b] ${
                    ticket.status === 'ready' 
                      ? 'border-emerald-500/80 shadow-emerald-500/10 ring-2 ring-emerald-500/20' 
                      : ticket.status === 'served'
                      ? 'border-slate-700 opacity-60'
                      : urgency.color === 'rose'
                      ? 'border-rose-500/80 shadow-rose-500/20 ring-1 ring-rose-500/40'
                      : 'border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-3 border-b border-slate-700/60 flex items-center justify-between ${
                    ticket.status === 'ready' 
                      ? 'bg-emerald-950/40' 
                      : urgency.color === 'rose'
                      ? 'bg-rose-950/40'
                      : 'bg-slate-900/60'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-base">{ticket.orderNumber}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {ticket.tableOrChannel}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        الكاشير: {ticket.serverName}
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs ${urgency.bg}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatElapsed(ticket.elapsedSeconds)}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3 space-y-2 flex-1 divide-y divide-slate-800/80">
                    {visibleItems.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleToggleItemDone(ticket.id, item.id)}
                        className={`pt-2 first:pt-0 flex items-start justify-between gap-3 cursor-pointer group select-none transition-all ${
                          item.isDone ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Checkbox button */}
                          <div className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-all ${
                            item.isDone 
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' 
                              : 'border-slate-600 group-hover:border-amber-400 bg-slate-800/80'
                          }`}>
                            {item.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-mono font-black text-sm bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-700/40">
                                {item.quantity}x
                              </span>
                              <span className="text-white font-bold text-sm group-hover:text-amber-200">
                                {item.name}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-amber-300/90 text-xs font-semibold mt-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                ملاحظة: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Station Tag */}
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                          {item.station === 'grill' ? 'شواية' : item.station === 'drinks' ? 'بار' : 'مطبخ'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Action Footer */}
                  <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2">
                    {ticket.status !== 'served' ? (
                      <button
                        onClick={() => handleAdvanceStatus(ticket.id)}
                        className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                          ticket.status === 'ready'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 font-black'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20'
                        }`}
                      >
                        {ticket.status === 'new' && (
                          <>
                            <Flame className="w-4 h-4" />
                            <span>بدء التحضير بالمطبخ</span>
                          </>
                        )}
                        {ticket.status === 'preparing' && (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>اكتمل وتحويل إلى (جاهز للتسليم)</span>
                          </>
                        )}
                        {ticket.status === 'ready' && (
                          <>
                            <Bell className="w-4 h-4" />
                            <span>تم التسليم للزبون / الويتر</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResetTicket(ticket.id)}
                        className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إعادة فتح الطلب</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Info Strip */}
      <footer className="h-10 bg-[#0f172a] border-t border-slate-800 px-6 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          KDS Real-Time Station Engine • متزامن مع نقطة البيع
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            المطبخ متصل بالشبكة (192.168.1.105)
          </span>
        </div>
      </footer>
    </div>
  );
};
