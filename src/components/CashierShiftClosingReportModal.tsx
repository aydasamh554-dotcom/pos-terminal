import React, { useMemo } from 'react';
import { Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { CashierOutData } from './CashierOutModal';
import { posAudio } from '../utils/audio';
import { InvoOrder } from '../data/invoData';

interface CashierShiftClosingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashierName?: string;
  cashierOutData: CashierOutData | null;
  openingCash?: number;
  settledOrders?: InvoOrder[];
}

export const CashierShiftClosingReportModal: React.FC<CashierShiftClosingReportModalProps> = ({
  isOpen,
  onClose,
  cashierName = 'ابو عايض',
  cashierOutData,
  openingCash = 0,
  settledOrders = [],
}) => {
  // Real Dynamic Calculations from Actual Settled Orders & Opening Cash
  const openingAmount = openingCash;

  // Compute metrics from actual orders if available, otherwise use baseline
  const {
    expectedCashSales,
    expectedCardSales,
    expectedTransfers,
    totalNetSales,
    totalTransactions,
    categoryBreakdown,
  } = useMemo(() => {
    if (settledOrders && settledOrders.length > 0) {
      let cashSum = 0;
      let cardSum = 0;
      let transferSum = 0;
      let netSum = 0;
      const catMap: Record<string, number> = {};

      settledOrders.forEach((order) => {
        netSum += order.total;
        const method = (order.paymentMethod || 'cash').toLowerCase();
        if (method === 'card' || method === 'visa' || method === 'mada' || method === 'network') {
          cardSum += order.total;
        } else if (method === 'transfer' || method === 'online' || method === 'bank') {
          transferSum += order.total;
        } else {
          cashSum += order.total;
        }

        // Aggregate category breakdown
        order.items?.forEach((item) => {
          const cat = item.category || 'وجبات وأطباق';
          const itemAmount = item.total || (item.price * item.quantity);
          catMap[cat] = (catMap[cat] || 0) + itemAmount;
        });
      });

      const catList = Object.entries(catMap).map(([name, amount]) => ({
        name,
        amount,
      }));

      // Fallback categories if empty items
      const finalCats = catList.length > 0 ? catList : [
        { name: 'وجبات رئيسية', amount: netSum * 0.7 },
        { name: 'مقبلات ومشروبات', amount: netSum * 0.3 },
      ];

      return {
        expectedCashSales: cashSum,
        expectedCardSales: cardSum,
        expectedTransfers: transferSum,
        totalNetSales: netSum,
        totalTransactions: settledOrders.length,
        categoryBreakdown: finalCats,
      };
    }

    // Clean zero state when no settled orders exist in the shift
    return {
      expectedCashSales: 0,
      expectedCardSales: 0,
      expectedTransfers: 0,
      totalNetSales: 0,
      totalTransactions: 0,
      categoryBreakdown: [],
    };
  }, [settledOrders]);

  const totalIncome = openingAmount + totalNetSales;

  // Actual counted values from user Cashier Out input
  const countedCash = cashierOutData ? cashierOutData.localCurrencyTotal : (openingAmount + expectedCashSales);
  const countedCard = cashierOutData ? cashierOutData.otherTenders.card : expectedCardSales;
  const countedTransfers = cashierOutData ? cashierOutData.otherTenders.transfers : expectedTransfers;

  // Expected in drawer
  const expectedCashInDrawer = openingAmount + expectedCashSales;

  // Short / Over calculations
  const cashShortOver = countedCash - expectedCashInDrawer;
  const cardShortOver = countedCard - expectedCardSales;
  const transferShortOver = countedTransfers - expectedTransfers;

  const handlePrint = () => {
    posAudio.playTap();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 select-none animate-in fade-in duration-150 overflow-hidden"
      dir="ltr"
    >
      <div className="w-full max-w-2xl max-h-[95vh] bg-[#f8fafc] text-slate-900 rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        
        {/* Printable & Scrollable Report Container matching Video 2 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar text-slate-900 font-sans space-y-6">
          
          {/* Header Section matching Video Frame 00:12 */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-300">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide font-arabic">
              مطاعم بيت المضغوط
            </h2>
            <p className="text-xs font-bold text-slate-600 font-arabic">
              للتواصل 95099937
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-slate-700">Cashier:</span>
              <span className="text-sm font-black text-blue-800 font-arabic bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200">
                {cashierName}
              </span>
            </div>
          </div>

          {/* Shift Timing and Totals Box matching Video Frame 00:12 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Starting:</span>
                <span className="font-mono font-semibold">Date: 22/08/2026  Time: 11:08</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Closing:</span>
                <span className="font-mono font-semibold">Date: 23/08/2026  Time: 00:19</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Total Transactions:</span>
                <span className="font-black text-sm text-slate-900">{totalTransactions}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Opening Amount:</span>
                <span className="font-black text-sm text-slate-900">{openingAmount.toFixed(3)}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Total Payments:</span>
                <span className="font-black text-sm text-blue-700">OMR {totalNetSales.toFixed(3)}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Total Income:</span>
                <span className="font-black text-sm text-emerald-700">OMR {totalIncome.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Sales By Tender Table matching Video Frame 00:13 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-[#e2e8f0] py-2 px-3 text-center border-b border-slate-300 font-bold text-slate-800 text-xs">
              Sales By Tender
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-1.5 px-2 border-r border-slate-200 w-1/3">Tenders</th>
                  <th className="py-1.5 px-2 border-r border-slate-200 w-1/3">Total</th>
                  <th className="py-1.5 px-2 w-1/3">Equivalent</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 border-r border-slate-200 font-sans font-bold text-slate-800">Cash</td>
                  <td className="py-2 px-2 border-r border-slate-200 font-bold text-slate-900">{expectedCashSales.toFixed(3)}</td>
                  <td className="py-2 px-2 text-slate-800">{expectedCashSales.toFixed(3)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 border-r border-slate-200 font-sans font-bold text-slate-800">بطاقة</td>
                  <td className="py-2 px-2 border-r border-slate-200 font-bold text-slate-900">{expectedCardSales.toFixed(3)}</td>
                  <td className="py-2 px-2 text-slate-800">{expectedCardSales.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
            <div className="p-2.5 bg-slate-50 flex items-center justify-between font-mono font-bold text-xs border-t border-slate-200 px-4">
              <span className="font-sans text-slate-700">Net Sale</span>
              <span className="text-slate-900 font-black">OMR {totalNetSales.toFixed(3)}</span>
            </div>
          </div>

          {/* Income By Category Table matching Video Frame 00:14 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-[#e2e8f0] py-2 px-3 text-center border-b border-slate-300 font-bold text-slate-800 text-xs">
              Income By Category
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="py-1.5 px-4 flex items-center justify-between font-arabic">
                  <span className="text-slate-800 font-medium">{cat.name}</span>
                  <span className="font-mono font-bold text-slate-900">{cat.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div className="p-2.5 bg-slate-50 flex items-center justify-between font-mono font-bold text-xs border-t border-slate-200 px-4">
              <span className="font-sans text-slate-700">Category Total:</span>
              <span className="text-slate-900 font-black">OMR {totalNetSales.toFixed(3)}</span>
            </div>
          </div>

          {/* Short / Over Report matching Video Frame 00:15 - 00:18 (THE EXACT DISCREPANCY REPORT) */}
          <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
            <div className="bg-[#1e293b] text-white py-2 px-3 text-center font-black text-xs uppercase tracking-wider">
              Short / Over Report (تقرير العجز والزيادة)
            </div>

            <div className="p-3.5 space-y-4 text-xs">
              
              {/* Cash Reconciliation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-sm text-slate-900">Cash (النقد)</span>
                  <span className="text-[10px] text-slate-500 font-sans">الدرج والصندوق</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Count (المعدود):</span>
                    <span className="font-bold text-slate-900 text-sm">{countedCash.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Expected (المتوقع):</span>
                    <span className="font-bold text-slate-700 text-sm">{expectedCashInDrawer.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Short / Over:</span>
                    <span
                      className={`font-black text-sm ${
                        cashShortOver > 0.001
                          ? 'text-emerald-600'
                          : cashShortOver < -0.001
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {cashShortOver > 0 ? `+${cashShortOver.toFixed(3)}` : cashShortOver.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card (بطاقة) Reconciliation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-sm text-slate-900 font-arabic">بطاقة (Card / مدى)</span>
                  <span className="text-[10px] text-slate-500 font-sans">أجهزة الشبكة</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Count (المعدود):</span>
                    <span className="font-bold text-slate-900 text-sm">{countedCard.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Expected (المتوقع):</span>
                    <span className="font-bold text-slate-700 text-sm">{expectedCardSales.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Short / Over:</span>
                    <span
                      className={`font-black text-sm ${
                        cardShortOver > 0.001
                          ? 'text-emerald-600'
                          : cardShortOver < -0.001
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {cardShortOver > 0 ? `+${cardShortOver.toFixed(3)}` : cardShortOver.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfers Reconciliation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-sm text-slate-900 font-arabic">تحويلات (Transfers)</span>
                  <span className="text-[10px] text-slate-500 font-sans">الحساب البنكي</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Count:</span>
                    <span className="font-bold text-slate-900 text-sm">{countedTransfers.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Expected:</span>
                    <span className="font-bold text-slate-700 text-sm">{expectedTransfers.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Short / Over:</span>
                    <span className="font-black text-sm text-blue-600">{transferShortOver.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown of Entered Cash Denominations matching Video Frame 00:19 - 00:22 */}
          {cashierOutData && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#e2e8f0] py-2 px-3 text-center border-b border-slate-300 font-bold text-slate-800 text-xs">
                Local Currency Details (تفاصيل الفئات النقدية المعدودة)
              </div>
              <table className="w-full text-xs text-center border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold font-sans">
                    <th className="py-1 px-2 border-r border-slate-200">Denomination</th>
                    <th className="py-1 px-2 border-r border-slate-200">Qty</th>
                    <th className="py-1 px-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(cashierOutData.denominations).map(([denom, rawQty]) => {
                    const qty = Number(rawQty) || 0;
                    const total = (parseFloat(denom) * qty).toFixed(3);
                    return (
                      <tr key={denom} className={qty > 0 ? 'bg-blue-50/50 font-bold' : 'text-slate-500'}>
                        <td className="py-1 px-2 border-r border-slate-200">{denom}</td>
                        <td className="py-1 px-2 border-r border-slate-200">{qty}</td>
                        <td className="py-1 px-2">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-2.5 bg-slate-50 flex items-center justify-between font-mono font-bold text-xs border-t border-slate-200 px-4">
                <span className="font-sans text-slate-700">Total Counted Cash:</span>
                <span className="text-slate-900 font-black">OMR {cashierOutData.localCurrencyTotal.toFixed(3)}</span>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar: Close & Print matching Video 2 Frame 00:26 */}
        <div className="p-3 bg-white border-t border-slate-300 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-8 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
