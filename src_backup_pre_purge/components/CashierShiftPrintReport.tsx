import React from 'react';
import { ShiftRecord, POSSettings } from '../types';
import { Printer, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Building, User, Clock, Calendar, Hash } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface CashierShiftPrintReportProps {
  shift: ShiftRecord;
  settings: POSSettings;
  onClose?: () => void;
}

export const CashierShiftPrintReport: React.FC<CashierShiftPrintReportProps> = ({
  shift,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    posAudio.playPrinter();
    window.print();
  };

  const isShortage = shift.difference < 0;
  const isSurplus = shift.difference > 0;
  const isBalanced = shift.difference === 0;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">معاينة تقرير التقفيلة المالية (Z-Report)</h3>
            <p className="text-xs text-slate-400">
              تقرير رسمي جاهز للطباعة الحرارية أو بتنسيق A4 المعتمد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير (Print)</span>
          </button>
        </div>
      </div>

      {/* Official Thermal / Paper Report Sheet */}
      <div 
        id="shift-printable-report"
        className="w-full bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 font-sans print:p-0 print:border-none print:shadow-none print:w-full print:rounded-none"
      >
        {/* Restaurant Header */}
        <div className="text-center pb-5 border-b-2 border-dashed border-slate-300 space-y-1">
          <h1 className="text-xl font-black text-slate-950 tracking-tight">{settings.restaurantName}</h1>
          <p className="text-xs font-medium text-slate-600">{settings.restaurantBranch}</p>
          <div className="inline-block bg-slate-100 text-slate-700 text-[11px] font-mono-num font-bold px-3 py-0.5 rounded-full border border-slate-300 mt-1">
            الرقم الضريبي: {settings.taxNumber}
          </div>
          <div className="pt-2">
            <span className="inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-md uppercase tracking-wider">
              تقرير تقفيل الوردية المالي (Z-REPORT)
            </span>
          </div>
        </div>

        {/* Shift Info Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-dashed border-slate-300 font-mono-num">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">رقم الوردية:</span>
              <span className="font-bold text-slate-900 font-mono-num">#{shift.shiftNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">اسم الكاشير:</span>
              <span className="font-bold text-slate-900 font-sans">{shift.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">كود الموظف:</span>
              <span className="font-bold text-slate-900 font-mono-num">{shift.cashierCode}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">تاريخ التقفيل:</span>
              <span className="font-bold text-slate-900 font-mono-num">{shift.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">وقت البدء:</span>
              <span className="font-bold text-slate-900 font-mono-num">{shift.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">وقت الإغلاق:</span>
              <span className="font-bold text-slate-900 font-mono-num">{shift.endTime || 'الآن (مباشر)'}</span>
            </div>
          </div>
        </div>

        {/* Main Sales Summary */}
        <div className="py-4 border-b border-dashed border-slate-300 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            1. ملخص المبيعات وطرق الدفع
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="font-bold text-slate-800">مبيعات النقد (كاش الكاشير):</span>
              <span className="font-mono-num font-black text-emerald-700 text-sm">
                {shift.cashSales.toFixed(2)} {settings.currency}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="font-bold text-slate-800">مبيعات البطاقات (مدى / فيزا / شبكة):</span>
              <span className="font-mono-num font-black text-blue-700 text-sm">
                {shift.cardSales.toFixed(2)} {settings.currency}
              </span>
            </div>

            {shift.onlineSales > 0 && (
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-800">مبيعات تطبيقات أونلاين:</span>
                <span className="font-mono-num font-black text-purple-700 text-sm">
                  {shift.onlineSales.toFixed(2)} {settings.currency}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 px-1">
              <span className="text-slate-600">إجمالي الخصومات الممنوحة:</span>
              <span className="font-mono-num font-semibold text-rose-600">
                - {shift.totalDiscount.toFixed(2)} {settings.currency}
              </span>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-slate-600">ضريبة القيمة المضافة (15% VAT):</span>
              <span className="font-mono-num font-semibold text-slate-700">
                {shift.totalTax.toFixed(2)} {settings.currency}
              </span>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-slate-600">إجمالي عدد الفواتير المنفذة:</span>
              <span className="font-mono-num font-bold text-slate-900">
                {shift.totalOrdersCount} فاتورة
              </span>
            </div>

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center">
              <span className="text-sm font-black text-slate-950">إجمالي المبيعات الإجمالية:</span>
              <span className="text-lg font-black text-slate-950 font-mono-num">
                {shift.totalSales.toFixed(2)} {settings.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Channels Breakdown */}
        <div className="py-4 border-b border-dashed border-slate-300 space-y-2 text-xs">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. توزيع المبيعات حسب القنوات
          </h2>

          <div className="grid grid-cols-2 gap-2 font-mono-num">
            <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="text-slate-600">محلي (Dine-In):</span>
              <span className="font-bold text-slate-900">
                {shift.channelBreakdown.dineIn.total.toFixed(2)} {settings.currency} ({shift.channelBreakdown.dineIn.count})
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="text-slate-600">توصيل (Delivery):</span>
              <span className="font-bold text-slate-900">
                {shift.channelBreakdown.delivery.total.toFixed(2)} {settings.currency} ({shift.channelBreakdown.delivery.count})
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="text-slate-600">سفري (Takeaway):</span>
              <span className="font-bold text-slate-900">
                {shift.channelBreakdown.takeaway.total.toFixed(2)} {settings.currency} ({shift.channelBreakdown.takeaway.count})
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="text-slate-600">استلام (Pick Up):</span>
              <span className="font-bold text-slate-900">
                {shift.channelBreakdown.pickup.total.toFixed(2)} {settings.currency} ({shift.channelBreakdown.pickup.count})
              </span>
            </div>
          </div>
        </div>

        {/* Cash Drawer Audit & Reconciliation (CRUCIAL SECTION) */}
        <div className="py-4 border-b-2 border-slate-900 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. جرد وتسوية الدرج المالي (Cash Drawer Audit)
          </h2>

          <div className="space-y-1.5 text-xs font-mono-num">
            <div className="flex justify-between text-slate-700">
              <span>عهدة بداية الوردية (Opening Float):</span>
              <span className="font-bold">{shift.openingCash.toFixed(2)} {settings.currency}</span>
            </div>

            <div className="flex justify-between text-slate-700">
              <span>(+) مقبوضات مبيعات الكاش النقدية:</span>
              <span className="font-bold text-emerald-700">+{shift.cashSales.toFixed(2)} {settings.currency}</span>
            </div>

            {shift.cashIn > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>(+) إيداعات وتغذية نقدية (Cash In):</span>
                <span className="font-bold text-blue-700">+{shift.cashIn.toFixed(2)} {settings.currency}</span>
              </div>
            )}

            {shift.cashOut > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>(-) مصروفات وسحوبات نقدية (Cash Out):</span>
                <span className="font-bold text-rose-700">-{shift.cashOut.toFixed(2)} {settings.currency}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>(=) الرصيد النقدي المتوقع في الدرج:</span>
              <span className="text-sm font-black">{shift.expectedCash.toFixed(2)} {settings.currency}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
              <span>المبلغ النقدي الفعلي المجرود:</span>
              <span className="text-sm font-black">{shift.actualCashCounted.toFixed(2)} {settings.currency}</span>
            </div>
          </div>

          {/* Difference Banner (عجز أو زيادة أو متطابق) */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isShortage
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : isSurplus
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}>
            <div className="flex items-center gap-2">
              {isShortage && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
              {isSurplus && <ArrowUpRight className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isBalanced && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
              <div>
                <p className="text-xs font-black">
                  {isShortage ? 'يوجد عجز مالي في الدرج (Cash Shortage)' : isSurplus ? 'توجد زيادة مالية في الدرج (Cash Surplus)' : 'الدرج متطابق تماماً (Balanced)'}
                </p>
                {shift.differenceReason && (
                  <p className="text-[11px] opacity-85 font-sans mt-0.5">{shift.differenceReason}</p>
                )}
              </div>
            </div>

            <div className="text-left font-mono-num">
              <span className="text-base font-black">
                {shift.difference > 0 ? `+${shift.difference.toFixed(2)}` : shift.difference.toFixed(2)} {settings.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Movements Details if any */}
        {shift.movements && shift.movements.length > 0 && (
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              حركات المصروفات والإيداعات أثناء الوردية:
            </h2>
            <div className="space-y-1">
              {shift.movements.map((m) => (
                <div key={m.id} className="flex justify-between text-[11px] text-slate-600">
                  <span>
                    • [{m.time}] {m.type === 'cash_in' ? 'إيداع: ' : 'سحب مصروف: '} {m.reason}
                  </span>
                  <span className={`font-mono-num font-bold ${m.type === 'cash_in' ? 'text-blue-600' : 'text-rose-600'}`}>
                    {m.type === 'cash_in' ? '+' : '-'}{m.amount.toFixed(2)} {settings.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-sans">
          <div className="space-y-6">
            <p className="font-bold text-slate-800">توقيع الكاشير المسؤول</p>
            <div className="border-b border-slate-400 w-32 mx-auto"></div>
            <p className="text-[10px] text-slate-500">{shift.cashierName}</p>
          </div>

          <div className="space-y-6">
            <p className="font-bold text-slate-800">اعتماد المشرف / مدير الفرع</p>
            <div className="border-b border-slate-400 w-32 mx-auto"></div>
            <p className="text-[10px] text-slate-500">ختم وتوقيع الإدارة</p>
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="pt-6 text-center text-[10px] text-slate-400 font-mono-num">
          تم استخراج التقرير آلياً من نظام نقاط البيع • {new Date().toLocaleString('ar-SA')}
        </div>
      </div>
    </div>
  );
};
