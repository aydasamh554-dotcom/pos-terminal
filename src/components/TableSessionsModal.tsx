import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Layers, 
  Clock, 
  ArrowRightLeft, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight,
  Receipt,
  Utensils
} from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { RestaurantTable } from '../types';
import { posAudio } from '../utils/audio';

interface TableSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  tableOrders: InvoOrder[];
  allTables: RestaurantTable[];
  onSelectOrder: (order: InvoOrder) => void;
  onNewSession: (tableName: string) => void;
  onPayOrder: (order: InvoOrder) => void;
  onTransferOrder: (orderId: string, newTableName: string) => void;
  currency?: string;
}

export const TableSessionsModal: React.FC<TableSessionsModalProps> = ({
  isOpen,
  onClose,
  table,
  tableOrders,
  allTables,
  onSelectOrder,
  onNewSession,
  onPayOrder,
  onTransferOrder,
  currency = 'ر.ع'
}) => {
  const [transferringOrderId, setTransferringOrderId] = useState<string | null>(null);
  const [targetTableName, setTargetTableName] = useState<string>('');

  if (!isOpen || !table) return null;

  const handleStartTransfer = (orderId: string) => {
    posAudio.playTap();
    setTransferringOrderId(orderId);
    const otherTables = allTables.filter(t => t.name !== table.name);
    if (otherTables.length > 0) {
      setTargetTableName(otherTables[0].name);
    }
  };

  const handleConfirmTransfer = (orderId: string) => {
    if (!targetTableName) return;
    posAudio.playSuccess();
    onTransferOrder(orderId, targetTableName);
    setTransferringOrderId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-cairo">
                  {table.name}
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                  {tableOrders.length} {tableOrders.length === 1 ? 'فاتورة مفتوحة' : 'فواتير مفتوحة'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة الجلسات والفواتير المتعددة على نفس الطاولة
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Create New Separate Session on this Table */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800">
          <button
            onClick={() => {
              posAudio.playTap();
              onNewSession(table.name);
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>+ فتح جلسة / فاتورة جديدة مستقلة على ({table.name})</span>
          </button>
        </div>

        {/* List of active sessions on this table */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {tableOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="text-sm font-bold">لا توجد طلبات أو جلسات مفتوحة على هذه الطاولة حالياً</p>
              <p className="text-xs text-slate-500 mt-1">اضغط على الزر الأخضر أعلاه لفتح أول جلسة</p>
            </div>
          ) : (
            tableOrders.map((ord, idx) => (
              <div 
                key={ord.id}
                className="bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 rounded-xl p-3.5 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-black text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">
                          {ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] font-bold rounded-md">
                          جلسة {idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {ord.elapsedTime || 'الآن'}
                        </span>
                        <span>•</span>
                        <span>{ord.items?.length || 0} أصناف</span>
                        {ord.tableNotes && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 truncate max-w-[130px]">
                              {ord.tableNotes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {(ord.total || 0).toFixed(3)} {currency}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {ord.cashierName || 'الكاشير'}
                    </span>
                  </div>
                </div>

                {/* Transfer UI if active */}
                {transferringOrderId === ord.id ? (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        اختر الطاولة المستهدفة لنقل الجلسة #{idx + 1}:
                      </span>
                      <button 
                        onClick={() => setTransferringOrderId(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={targetTableName}
                        onChange={e => setTargetTableName(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-bold focus:border-amber-500 outline-none"
                      >
                        {allTables
                          .filter(t => t.name !== table.name)
                          .map(t => (
                            <option key={t.id} value={t.name}>
                              {t.name} ({t.status === 'occupied' ? 'مشغولة - سيتم الإضافة كجلسة إضافية' : 'متاحة'})
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() => handleConfirmTransfer(ord.id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg cursor-pointer transition-colors shadow-sm"
                      >
                        تأكيد النقل
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons */
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        posAudio.playTap();
                        onSelectOrder(ord);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>فتح وتعديل الفاتورة</span>
                    </button>

                    <button
                      onClick={() => {
                        posAudio.playTap();
                        onPayOrder(ord);
                        onClose();
                      }}
                      className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>دفع هذه الجلسة</span>
                    </button>

                    <button
                      onClick={() => handleStartTransfer(ord.id)}
                      title="نقل هذه الجلسة لطاولة أخرى"
                      className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>نقل</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          يمكنك فتح فواتير منفصلة غير محدودة لنفس الطاولة وسداد أو نقل كل فاتورة على حدة.
        </div>
      </div>
    </div>
  );
};
