import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  QrCode, 
  Plus, 
  Trash2, 
  Edit3, 
  Crown, 
  Sparkles, 
  Check, 
  LayoutGrid, 
  Layers,
  Smartphone
} from 'lucide-react';
import { RestaurantSection, RestaurantTable, TableShape } from '../types';
import { InvoOrder } from '../data/invoData';
import { posAudio } from '../utils/audio';
import { TableInstantQRModal } from './TableInstantQRModal';
import { TableAndRoomManagerModal } from './TableAndRoomManagerModal';
import { TableSessionsModal } from './TableSessionsModal';

interface TableSelectionScreenProps {
  orders?: InvoOrder[];
  sections: RestaurantSection[];
  tables: RestaurantTable[];
  onUpdateSections: (newSections: RestaurantSection[]) => void;
  onUpdateTables: (newTables: RestaurantTable[]) => void;
  onBack: () => void;
  onSelectTable: (tableName: string, orderId?: string, tableNotes?: string) => void;
  onPayOrder?: (order: InvoOrder) => void;
  onTransferOrder?: (orderId: string, newTableName: string) => void;
  employeeName?: string;
  currency?: string;
}

export const TableSelectionScreen: React.FC<TableSelectionScreenProps> = ({
  orders = [],
  sections,
  tables,
  onUpdateSections,
  onUpdateTables,
  onBack,
  onSelectTable,
  onPayOrder,
  onTransferOrder,
  employeeName = 'ابو عايض',
  currency = 'ر.ع'
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || 'singles');
  const [isManagerModalOpen, setIsManagerModalOpen] = useState<boolean>(false);
  const [selectedQRTable, setSelectedQRTable] = useState<RestaurantTable | null>(null);
  const [selectedSessionsTable, setSelectedSessionsTable] = useState<RestaurantTable | null>(null);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  // Live timer tick every second for real-time moving seconds & minutes!
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live elapsed time for an occupied table
  const getLiveTableTime = (tbl: RestaurantTable, activeOrd?: InvoOrder): string => {
    if (activeOrd?.createdAt) {
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - activeOrd.createdAt) / 1000));
      const mins = Math.floor(elapsedSecs / 60);
      const secs = elapsedSecs % 60;
      return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    const baseSecs = tbl.elapsedSeconds || 1870;
    const currentTotalSecs = baseSecs + tick;
    const mins = Math.floor(currentTotalSecs / 60);
    const secs = currentTotalSecs % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Fast swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is stronger than vertical
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIndex = sections.findIndex((t) => t.id === activeSectionId);
      if (diffX > 0) {
        if (currentIndex < sections.length - 1) {
          posAudio.playTap();
          setActiveSectionId(sections[currentIndex + 1].id);
        }
      } else {
        if (currentIndex > 0) {
          posAudio.playTap();
          setActiveSectionId(sections[currentIndex - 1].id);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Helper to find dynamic orders for table (supports multiple concurrent sessions)
  const getTableOrders = (tblName: string) => {
    return orders.filter(
      (o) => o.channel === 'dine_in' && 
             o.status === 'open' && 
             o.items && o.items.length > 0 &&
             (o.tableName === tblName || (o.tableName && tblName.includes(o.tableName)))
    );
  };

  const getTableOrder = (tblName: string) => {
    const tblOrders = getTableOrders(tblName);
    return tblOrders[0];
  };

  // Tables in current section
  const currentTables = tables.filter(
    (t) => t.sectionId === activeSectionId || t.section === activeSectionId
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div 
      className="h-screen w-screen max-w-xl mx-auto bg-slate-50 flex flex-col justify-between p-3 select-none text-slate-800 overflow-hidden shadow-2xl"
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar matching Video Frame 00:25 */}
      <header className="w-full flex items-center justify-between px-2 py-1.5 border-b border-slate-200 bg-white rounded-xl shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          {/* invo logo with green dot */}
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
        </div>

        {/* User Profile matching Video Frame 00:25 */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-slate-800 border border-slate-200">
          <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold font-cairo">{employeeName}</span>
        </div>
      </header>

      {/* Top Dynamic Section Tabs Slider - Pure Operational Browsing */}
      <div className="w-full pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto scroll-smooth">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                posAudio.playTap();
                setActiveSectionId(sec.id);
              }}
              className={`py-2 px-5 rounded-lg font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 shrink-0 min-w-fit justify-center ${
                activeSectionId === sec.id
                  ? 'bg-[#1e293b] text-white shadow-md'
                  : 'bg-transparent hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{sec.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tables Grid Area matching Video Frame 00:26 & 00:30 */}
      <div className="flex-1 overflow-y-auto px-1 py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 py-2 animate-in fade-in duration-150">
          {currentTables.map((tbl) => {
            const tblOrders = getTableOrders(tbl.name);
            const activeOrd = tblOrders[0];
            const isOccupied = tblOrders.length > 0;
            const liveTimer = isOccupied ? getLiveTableTime(tbl, activeOrd) : '';
            const tableBorderClass = isOccupied
              ? 'border-[3px] border-[#ef4444] text-white shadow-rose-200'
              : 'border-[3px] border-[#22c55e] text-white shadow-emerald-200';

            return (
              <div
                key={tbl.id}
                onClick={() => {
                  posAudio.playTap();
                  if (tblOrders.length > 0) {
                    onSelectTable(tbl.name, tblOrders[0].orderNumber, tbl.notes);
                  } else {
                    onSelectTable(tbl.name, undefined, tbl.notes);
                  }
                }}
                className="relative flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-transform"
              >
                {/* Visual Restaurant Table with Green Chairs and Border matching Video */}
                
                {/* 1. ROUND SHAPE (for Rooms VIP / الغرف) */}
                {tbl.shape === 'round' ? (
                  <div className="relative flex items-center justify-center">
                    {/* Surrounding Green Chairs matching video */}
                    <div className="absolute -top-2 w-6 h-3 bg-[#65a30d] rounded-t-full"></div>
                    <div className="absolute -bottom-2 w-6 h-3 bg-[#65a30d] rounded-b-full"></div>
                    <div className="absolute -right-2.5 h-6 w-3 bg-[#65a30d] rounded-r-full"></div>
                    <div className="absolute -left-2.5 h-6 w-3 bg-[#65a30d] rounded-l-full"></div>

                    {/* Circular Table Surface */}
                    <div 
                      className={`w-28 h-28 rounded-full bg-[#1e293b] flex flex-col items-center justify-center p-2 shadow-lg transition-all relative ${tableBorderClass}`}
                    >
                      <span className="font-black text-xs sm:text-sm text-white text-center leading-tight">
                        {tbl.name}
                      </span>
                      {isOccupied && (
                        <div className="flex flex-col items-center text-[10px] font-bold text-rose-300 mt-1 leading-tight text-center">
                          <span className={tblOrders.length > 1 ? "bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black text-[9px]" : ""}>
                            {tblOrders.length > 1 ? `${tblOrders.length} جلسات` : '1 Ticket'}
                          </span>
                          <span className="font-mono text-[11px] font-black text-white">{liveTimer}</span>
                        </div>
                      )}
                      {tbl.notes && (
                        <div 
                          className="mt-1 px-1.5 py-0.5 max-w-[92%] bg-amber-400 text-slate-950 rounded-md text-[9px] font-black truncate shadow-xs flex items-center gap-1 leading-tight"
                          title={`ملاحظات: ${tbl.notes}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-800 shrink-0" />
                          <span className="truncate">{tbl.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2. RECTANGLE / SQUARE SHAPE (for الافراد & العوائل) */
                  <div className="relative flex flex-col items-center">
                    {/* Top Chairs: 2 Green Rounded Capsules */}
                    <div className="flex gap-4 mb-1">
                      <div className="w-6 h-3.5 bg-[#65a30d] rounded-t-full"></div>
                      <div className="w-6 h-3.5 bg-[#65a30d] rounded-t-full"></div>
                    </div>

                    {/* Side Chairs: Left & Right Green Capsules */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-3 h-8 bg-[#65a30d] rounded-l-full"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-3 h-8 bg-[#65a30d] rounded-r-full"></div>

                    {/* Table Surface */}
                    <div
                      className={`w-32 sm:w-36 h-20 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-lg transition-all bg-[#1e293b] ${tableBorderClass}`}
                    >
                      <span className="font-black text-xs sm:text-sm text-white tracking-wide">
                        {tbl.name}
                      </span>

                      {isOccupied && (
                        <div className="flex flex-col items-center text-[10px] font-bold text-rose-300 mt-0.5 leading-tight text-center">
                          <span className={tblOrders.length > 1 ? "bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black text-[9px]" : ""}>
                            {tblOrders.length > 1 ? `${tblOrders.length} جلسات` : '1 Ticket'}
                          </span>
                          <span className="font-mono text-[11px] font-black text-white">{liveTimer}</span>
                        </div>
                      )}
                      {tbl.notes && (
                        <div 
                          className="mt-0.5 px-1.5 py-0.5 max-w-[92%] bg-amber-400 text-slate-950 rounded-md text-[9px] font-black truncate shadow-xs flex items-center gap-1 leading-tight"
                          title={`ملاحظات: ${tbl.notes}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-800 shrink-0" />
                          <span className="truncate">{tbl.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Chairs: 2 Green Rounded Capsules */}
                    <div className="flex gap-4 mt-1">
                      <div className="w-6 h-3.5 bg-[#65a30d] rounded-b-full"></div>
                      <div className="w-6 h-3.5 bg-[#65a30d] rounded-b-full"></div>
                    </div>
                  </div>
                )}

                {/* BUILT-IN FAST QR CODE BUTTON ON EVERY TABLE */}
                <button
                  title="مسح كود الـ QR لطلب العميل المباشر"
                  onClick={(e) => {
                    e.stopPropagation();
                    posAudio.playTap();
                    setSelectedQRTable(tbl);
                  }}
                  className="absolute -top-1 -right-1 z-20 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>

              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer with Back Button matching video Frame 00:25 */}
      <footer className="w-full flex items-center justify-start pt-2 pb-1 border-t border-slate-200 shrink-0 px-2">
        <button
          onClick={() => {
            posAudio.playTap();
            onBack();
          }}
          className="w-32 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition-transform"
        >
          <span>Back</span>
        </button>
      </footer>

      {/* Table Instant QR Modal */}
      {selectedQRTable && (
        <TableInstantQRModal
          isOpen={true}
          onClose={() => setSelectedQRTable(null)}
          table={selectedQRTable}
          sectionName={sections.find((s) => s.id === selectedQRTable.sectionId)?.name || selectedQRTable.section}
          currency={currency}
          onOrderSubmitted={(tName, items) => {
            setSelectedQRTable(null);
            onSelectTable(tName);
          }}
        />
      )}

      {/* Full Floor & Sections Manager Modal */}
      {isManagerModalOpen && (
        <TableAndRoomManagerModal
          isOpen={true}
          onClose={() => setIsManagerModalOpen(false)}
          sections={sections}
          tables={tables}
          onSaveSections={onUpdateSections}
          onSaveTables={onUpdateTables}
          currency={currency}
        />
      )}

      {/* Multi-Session / Multi-Order Management Modal for Table */}
      {isSessionsModalOpen && selectedSessionsTable && (
        <TableSessionsModal
          isOpen={true}
          onClose={() => {
            setIsSessionsModalOpen(false);
            setSelectedSessionsTable(null);
          }}
          table={selectedSessionsTable}
          tableOrders={getTableOrders(selectedSessionsTable.name)}
          allTables={tables}
          onSelectOrder={(ord) => {
            setIsSessionsModalOpen(false);
            onSelectTable(ord.tableName || selectedSessionsTable.name, ord.id, ord.tableNotes);
          }}
          onNewSession={(tableName) => {
            setIsSessionsModalOpen(false);
            onSelectTable(tableName);
          }}
          onPayOrder={(ord) => {
            setIsSessionsModalOpen(false);
            if (onPayOrder) {
              onPayOrder(ord);
            }
          }}
          onTransferOrder={(orderId, newTableName) => {
            setIsSessionsModalOpen(false);
            if (onTransferOrder) {
              onTransferOrder(orderId, newTableName);
            }
          }}
          currency={currency}
        />
      )}
    </div>
  );
};

