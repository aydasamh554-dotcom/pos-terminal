import React, { useState } from 'react';
import { PaymentMethod } from '../types';
import { posAudio } from '../utils/audio';
import { 
  CreditCard, 
  Banknote, 
  Percent, 
  Check, 
  X, 
  Receipt, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  onConfirmPayment: (method: PaymentMethod, amountPaid: number, change: number, discountAmount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  tax,
  deliveryFee,
  total,
  currency,
  onConfirmPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>(total.toFixed(2));
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = Math.max(0, total - discountAmount);
  const cashNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashNum - finalTotal);

  const quickCashAmounts = [
    Math.ceil(finalTotal),
    Math.ceil(finalTotal / 10) * 10,
    50,
    100,
    200,
    500,
  ].filter((v, idx, arr) => v >= finalTotal && arr.indexOf(v) === idx);

  const handleKeypadPress = (val: string) => {
    posAudio.playTap();
    if (val === 'C') {
      setCashGiven('0');
    } else if (val === 'backspace') {
      setCashGiven((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!cashGiven.includes('.')) {
        setCashGiven((prev) => prev + '.');
      }
    } else {
      setCashGiven((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'cash' && cashNum < finalTotal) {
      posAudio.playError();
      return;
    }

    posAudio.playSuccess();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(paymentMethod, paymentMethod === 'cash' ? cashNum : finalTotal, changeDue, discountAmount);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">إتمام عملية الدفع والمحاسبة</h2>
              <p className="text-xs text-slate-400">اختر طريقة السداد وأصدر الفاتورة الضريبية</p>
            </div>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left / Order Summary & Methods */}
          <div className="flex flex-col justify-between space-y-4">
            {/* Payment Method Selectors */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold block">طريقة الدفع:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { posAudio.playTap(); setPaymentMethod('cash'); }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 font-bold text-sm transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span>نقدي (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { posAudio.playTap(); setPaymentMethod('card'); }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 font-bold text-sm transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>شبكة / مدى (Card)</span>
                </button>
              </div>
            </div>

            {/* Discount Quick Buttons */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  خصم ترويجي:
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs text-amber-400 font-bold">
                    خصم {discountPercent}% ({discountAmount.toFixed(2)} {currency})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => { posAudio.playTap(); setDiscountPercent(pct); }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      discountPercent === pct
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pct === 0 ? 'بدون خصم' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Financial Breakdown */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>المجموع الفرعي:</span>
                <span className="font-mono-num">{subtotal.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono-num">{tax.toFixed(2)} {currency}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono-num">{deliveryFee.toFixed(2)} {currency}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400 text-xs font-medium">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono-num">-{discountAmount.toFixed(2)} {currency}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-lg font-black text-white">
                <span>المبلغ الإجمالي:</span>
                <span className="text-emerald-400 text-2xl font-mono-num">
                  {finalTotal.toFixed(2)} <span className="text-xs text-emerald-300 font-normal">{currency}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right / Cash calculator / Keypad */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            {paymentMethod === 'cash' ? (
              <>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">المبلغ المدفوع كاش:</label>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl mb-3">
                    <span className="text-2xl font-bold font-mono-num text-white tracking-wider">
                      {cashGiven}
                    </span>
                    <span className="text-xs text-slate-400">{currency}</span>
                  </div>

                  {/* Quick cash pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {quickCashAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { posAudio.playTap(); setCashGiven(amt.toString()); }}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                      >
                        {amt} {currency}
                      </button>
                    ))}
                  </div>

                  {/* Numeric Touch Keypad */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeypadPress(k)}
                        className={`h-11 rounded-xl text-base font-bold font-mono-num transition-all flex items-center justify-center ${
                          k === 'C'
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* Change display */}
                  <div className={`p-3 rounded-xl flex items-center justify-between border ${
                    cashNum >= finalTotal 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}>
                    <span className="text-xs font-bold">المتبقي للزبون (الباقي):</span>
                    <span className="text-lg font-black font-mono-num">
                      {cashNum >= finalTotal ? `${changeDue.toFixed(2)} ${currency}` : `غير كافٍ (${(finalTotal - cashNum).toFixed(2)})`}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
                  <CreditCard className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">جاهز لعملية جهاز نقاط البيع (مدى / فيزا)</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    مرر البطاقة أو استخدم الهاتف عبر تقنية NFC على جهاز الدفع
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span>اتصال جهاز الشبكة نشط وجاهز</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
          >
            تراجع
          </button>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || (paymentMethod === 'cash' && cashNum < finalTotal)}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Receipt className="w-5 h-5" />
            <span>تأكيد الدفع وطباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
