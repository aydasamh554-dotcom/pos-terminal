import React, { useState } from 'react';
import { X, Send, MessageCircle, Phone, Copy, Check, Share2, Receipt } from 'lucide-react';
import { DigitalReceiptData } from '../types';
import { posAudio } from '../utils/audio';

interface DigitalReceiptShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DigitalReceiptData;
}

export const DigitalReceiptShareModal: React.FC<DigitalReceiptShareModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(data.customerPhone || '');
  const [countryCode, setCountryCode] = useState<string>('968'); // Default Oman/KSA (+968 / +966)
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  // Build structured message for WhatsApp & SMS
  const buildReceiptText = () => {
    const itemsLines = data.items
      .map((it, idx) => `${idx + 1}. ${it.name} × ${it.qty} = ${(it.price * it.qty).toFixed(3)} ر.ع`)
      .join('\n');

    return `🧾 *فاتورة إلكترونية - ${data.restaurantName}*
----------------------------------------
📍 الفرع: الصالة الرئيسية
🔢 رقم الفاتورة: #${data.orderNumber}
📅 التاريخ: ${data.dateString}
🏷️ نوع الطلب: ${data.channelName} ${data.tableName ? `(طاولة: ${data.tableName})` : ''}
💳 طريقة الدفع: ${data.paymentMethod}

🍴 *الأصناف والوجبات:*
${itemsLines}

----------------------------------------
💵 *المجموع الإجمالي: ${data.total.toFixed(3)} ر.ع*
(شامل ضريبة القيمة المضافة 5%: ${data.taxAmount.toFixed(3)} ر.ع)
الرقم الضريبي: ${data.taxNumber}

✨ شكراً لزيارتكم! نتمنى لكم وجبة هنيئة.
📞 للاستفسار والطلبات: ${data.restaurantPhone}`;
  };

  const cleanPhone = (phone: string, code: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    if (!cleaned.startsWith(code)) {
      cleaned = code + cleaned;
    }
    return cleaned;
  };

  const handleSendWhatsApp = () => {
    if (!phoneNumber.trim()) {
      posAudio.playError();
      alert('يرجى إدخال رقم هاتف العميل أولاً');
      return;
    }

    posAudio.playSuccess();
    const finalPhone = cleanPhone(phoneNumber, countryCode);
    const message = encodeURIComponent(buildReceiptText());
    const waUrl = `https://wa.me/${finalPhone}?text=${message}`;

    window.open(waUrl, '_blank');
    setSendSuccessMessage('جاري فتح تطبيق WhatsApp لإرسال الفاتورة...');
    setTimeout(() => setSendSuccessMessage(''), 4000);
  };

  const handleSendSMS = () => {
    if (!phoneNumber.trim()) {
      posAudio.playError();
      alert('يرجى إدخال رقم هاتف العميل أولاً');
      return;
    }

    posAudio.playSuccess();
    const finalPhone = cleanPhone(phoneNumber, countryCode);
    const message = encodeURIComponent(buildReceiptText());
    const smsUrl = `sms:${finalPhone}?body=${message}`;

    window.open(smsUrl, '_blank');
    setSendSuccessMessage('جاري تحويل نص الفاتورة لتطبيق الرسائل SMS...');
    setTimeout(() => setSendSuccessMessage(''), 4000);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildReceiptText());
      posAudio.playSuccess();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-black">إرسال الفاتورة الرقمية</h3>
              <p className="text-xs text-emerald-100">عبر WhatsApp أو رسالة نصية SMS</p>
            </div>
          </div>
          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* Quick Invoice Summary Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">فاتورة #{data.orderNumber}</span>
            </div>
            <span className="text-xs font-black text-emerald-600 font-mono-num">
              {data.total.toFixed(3)} ر.ع
            </span>
          </div>

          {/* Customer Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم جوال العميل (مع مفتاح الدولة)
            </label>
            <div className="flex items-center gap-2" dir="ltr">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="968">🇴🇲 +968 (عُمان)</option>
                <option value="966">🇸🇦 +966 (السعودية)</option>
                <option value="971">🇦🇪 +971 (الإمارات)</option>
                <option value="974">🇶🇦 +974 (قطر)</option>
                <option value="965">🇰🇼 +965 (الكويت)</option>
                <option value="973">🇧🇭 +973 (البحرين)</option>
              </select>

              <div className="flex-1 relative flex items-center">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="91234567"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm font-bold font-mono tracking-wider outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              أدخل رقم الجوال وسيتم تجهيز وإرسال الفاتورة مباشرة للمحادثة
            </p>
          </div>

          {/* Receipt Preview Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500">معاينة نص الرسالة:</span>
              <button
                onClick={handleCopyText}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl text-[11px] font-mono max-h-36 overflow-y-auto leading-relaxed border border-slate-800 whitespace-pre-line custom-scrollbar">
              {buildReceiptText()}
            </div>
          </div>

          {sendSuccessMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in fade-in">
              {sendSuccessMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSendWhatsApp}
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white stroke-none" />
              <span>إرسال واتساب (WhatsApp)</span>
            </button>

            <button
              onClick={handleSendSMS}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال رسالة SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
