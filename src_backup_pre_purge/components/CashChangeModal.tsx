import React from 'react';
import { CheckCircle2, ArrowRight, Printer, Coins, DollarSign, Wallet, ArrowLeft } from 'lucide-react';
import { InvoOrder } from '../data/invoData';
import { posAudio } from '../utils/audio';

export interface PaymentSummaryData {
  order: InvoOrder;
  method: 'cash' | 'card' | 'transfer' | 'talabat';
  total: number;
  tendered: number;
  change: number;
}

interface CashChangeModalProps {
  isOpen: boolean;
  data: PaymentSummaryData | null;
  onClose: () => void;
}

// Calculate smart denomination breakdown for Omani Rial
function getDenominationBreakdown(change: number) {
  if (change <= 0) return [];
  
  let remaining = Math.round(change * 1000); // work in Baisa (1 OMR = 1000 Baisa)
  const denominations = [
    { name: '20 ريال', value: 20000, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { name: '10 ريال', value: 10000, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: '5 ريال', value: 5000, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { name: '1 ريال', value: 1000, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { name: 'نصف ريال (500 بيسة)', value: 500, color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { name: '100 بيسة', value: 100, color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { name: '50 بيسة', value: 50, color: 'bg-slate-100 text-slate-800 border-slate-300' },
  ];

  const breakdown: { name: string; count: number; color: string }[] = [];

  for (const denom of denominations) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      remaining %= denom.value;
      breakdown.push({
        name: denom.name,
        count,
        color: denom.color,
      });
    }
  }

  return breakdown;
}

export const CashChangeModal: React.FC<CashChangeModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  const { order, method, total, tendered, change } = data;
  const isCash = method === 'cash';
  const denominationBreakdown = isCash ? getDenominationBreakdown(change) : [];

  const handlePrint = () => {
    posAudio.playReceiptPrint();
    window.print();
  };

  const handleBack = () => {
    posAudio.playTap();
    onClose();
  };

  const getMethodLabel = (m: string) => {
    switch (m) {
      case 'cash':
        return 'نقداً (كاش)';
      case 'card':
        return 'بطاقة بنكية';
      case 'transfer':
        return 'تحويل بنكي';
      case 'talabat':
        return 'تطبيق طلبات';
      default:
        return m;
    }
  };

  const getChannelLabel = (ch: string) => {
    switch (ch) {
      case 'dine_in':
        return `محلي (${order.tableName || 'طاولة'})`;
      case 'takeaway':
        return 'سفري';
      case 'delivery':
        return 'توصيل';
      case 'pickup':
        return 'Pick Up';
      default:
        return ch;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-in zoom-in-95 text-white">
        
        {/* Header with Success Badge */}
        <div className="bg-[#1e293b] p-4 text-center border-b border-slate-800 flex flex-col items-center justify-center relative">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black text-white">
            تم تسديد الفاتورة بنجاح
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            {order.orderNumber} • {getChannelLabel(order.channel)}
          </p>
        </div>

        {/* Hero Change Box (المبلغ المتبقي للعميل) */}
        <div className="p-4 space-y-3.5 bg-[#0f172a]">
          
          {isCash ? (
            <div className="bg-gradient-to-br from-emerald-950/80 via-[#132d25] to-emerald-900/60 rounded-2xl p-4 border-2 border-emerald-500/60 text-center shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>المبلغ المتبقي للعميل (الباقي)</span>
              </div>
              
              <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight my-1">
                {change.toFixed(3)}{' '}
                <span className="text-lg sm:text-xl font-bold font-cairo text-emerald-200">
                  ريال
                </span>
              </div>

              {change > 0 ? (
                <p className="text-xs font-bold text-emerald-200/90 mt-1 bg-emerald-900/50 py-1 px-3 rounded-lg inline-block border border-emerald-700/50">
                  💵 يُرجى إرجاع <span className="font-mono font-black text-white">{change.toFixed(3)} OMR</span> للعميل
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-300 mt-1">
                  ✓ تم دفع المبلغ المطلوب بالكامل (لا يوجد متبقي)
                </p>
              )}
            </div>
          ) : (
            <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-600/40 text-center">
              <span className="text-xs font-bold text-blue-300">تم الدفع بواسطة</span>
              <div className="text-xl font-black text-blue-400 mt-1">
                {getMethodLabel(method)}
              </div>
              <div className="font-mono text-2xl font-black text-white mt-1">
                OMR {total.toFixed(3)}
              </div>
            </div>
          )}

          {/* Payment Breakdown Cards */}
          <div className="bg-[#1e293b] rounded-2xl p-3 border border-slate-700/80 space-y-2 text-xs">
            {/* Total Amount */}
            <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
              <span className="text-slate-400 font-bold">إجمالي الفاتورة:</span>
              <span className="font-mono font-black text-sm text-white">
                OMR {total.toFixed(3)}
              </span>
            </div>

            {/* Tendered Amount */}
            {isCash && (
              <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">المبلغ المستلم كاش:</span>
                <span className="font-mono font-black text-sm text-amber-400">
                  OMR {tendered.toFixed(3)}
                </span>
              </div>
            )}

            {/* Change Amount */}
            {isCash && (
              <div className="flex items-center justify-between py-1">
                <span className="text-emerald-400 font-bold">المتبقي (الباقي):</span>
                <span className="font-mono font-black text-sm text-emerald-400">
                  OMR {change.toFixed(3)}
                </span>
              </div>
            )}
          </div>

          {/* Suggested Cash Denominations (اقتراح الفئات النقدية للإرجاع السريع) */}
          {isCash && denominationBreakdown.length > 0 && (
            <div className="bg-[#1e293b] rounded-2xl p-3 border border-slate-700/80">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>الفئات النقدية المقترحة لإرجاع الباقي:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {denominationBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs"
                  >
                    <span className="font-black text-emerald-400 font-mono">
                      {item.count}×
                    </span>
                    <span className="font-bold text-slate-200">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Print + Big Back (رجوع) Button */}
        <div className="p-3 bg-[#1e293b] border-t border-slate-800 flex items-center gap-2">
          {/* Print Receipt Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shrink-0"
            title="طباعة الفاتورة"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>

          {/* Big Prominent Back Button (رجوع) matching user request */}
          <button
            onClick={handleBack}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 stroke-[3]" />
            <span>رجوع (Back)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
