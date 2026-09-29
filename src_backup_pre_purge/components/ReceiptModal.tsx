import React, { useRef, useState } from 'react';
import { Order, POSSettings, DigitalReceiptData } from '../types';
import { posAudio } from '../utils/audio';
import { Printer, Check, X, QrCode, Utensils, Bike, ShoppingBag, Car, MessageCircle } from 'lucide-react';
import { DigitalReceiptShareModal } from './DigitalReceiptShareModal';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  settings: POSSettings;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  onNewOrder,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    posAudio.playPrintSound();
    // Simulate printer feedback
    setTimeout(() => {
      posAudio.playSuccess();
    }, 400);
  };

  const getOrderTypeBadge = (type: Order['type']) => {
    switch (type) {
      case 'dine_in':
        return { label: 'طلب محلي (Dine In)', icon: Utensils, color: 'bg-blue-100 text-blue-800' };
      case 'delivery':
        return { label: 'طلب توصيل (Delivery)', icon: Bike, color: 'bg-emerald-100 text-emerald-800' };
      case 'pickup':
        return { label: 'استلام Pick Up', icon: ShoppingBag, color: 'bg-amber-100 text-amber-800' };
      case 'takeaway':
        return { label: 'طلب سفري (Takeaway)', icon: Car, color: 'bg-purple-100 text-purple-800' };
    }
  };

  const badgeInfo = getOrderTypeBadge(order.type);
  const IconComponent = badgeInfo.icon;

  const shareData: DigitalReceiptData = {
    orderNumber: order.orderNumber,
    restaurantName: settings.restaurantName || 'مطعم مذاق الشام والأصيل',
    restaurantPhone: settings.restaurantPhone || '+966 55 112 2334',
    customerPhone: order.customerPhone || '',
    customerName: order.customerName || '',
    items: order.items.map(i => ({
      name: i.menuItem.name,
      qty: i.quantity,
      price: i.menuItem.price,
    })),
    total: order.total,
    taxAmount: order.tax,
    taxNumber: settings.taxNumber || '310458921400003',
    paymentMethod: order.paymentMethod === 'cash' ? 'نقدي (Cash)' : 'بطاقة مدى / ائتمانية',
    dateString: order.createdAt || new Date().toLocaleString('ar-SA'),
    tableName: order.tableName,
    channelName: badgeInfo.label,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col items-center max-h-[95vh]">
        {/* Actions bar above receipt */}
        <div className="w-full flex items-center justify-between mb-3 text-white">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-sm font-bold text-emerald-400">تم حفظ الطلب بنجاح</span>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper */}
        <div
          ref={receiptRef}
          className="receipt-slide w-full bg-[#fafafa] text-slate-900 rounded-lg shadow-2xl p-6 overflow-y-auto max-h-[70vh] border border-slate-300 font-mono text-xs select-text"
          style={{ fontFamily: 'Cairo, monospace' }}
        >
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-400 space-y-1">
            <h1 className="text-lg font-black text-slate-900 font-sans tracking-wide">
              {settings.restaurantName}
            </h1>
            <p className="text-[11px] text-slate-600 font-sans">{settings.restaurantBranch}</p>
            <p className="text-[10px] text-slate-500">الرقم الضريبي: {settings.taxNumber}</p>
            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded mt-1 font-sans">
              فاتورة ضريبية مبسطة
            </div>
          </div>

          {/* Order Meta Info */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">رقم الفاتورة:</span>
              <span className="font-bold text-slate-900">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">التاريخ والوقت:</span>
              <span>{order.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">الكاشير:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600">نوع الطلب:</span>
              <span className="font-bold font-sans flex items-center gap-1 text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                <IconComponent className="w-3 h-3" />
                {badgeInfo.label}
              </span>
            </div>

            {order.tableName && (
              <div className="flex justify-between font-bold text-slate-900 bg-amber-100 p-1.5 rounded">
                <span>الطاولة المحددة:</span>
                <span>{order.tableName} ({order.guestCount || 1} ضيوف)</span>
              </div>
            )}

            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-600">العميل:</span>
                <span className="font-semibold">{order.customerName} ({order.customerPhone || 'بدون هاتف'})</span>
              </div>
            )}

            {order.deliveryAddress && (
              <div className="flex flex-col text-slate-700 bg-slate-100 p-1.5 rounded">
                <span className="text-slate-500">عنوان التوصيل:</span>
                <span className="font-sans text-slate-900">{order.deliveryAddress}</span>
              </div>
            )}

            {order.carDetails && (
              <div className="flex justify-between">
                <span className="text-slate-600">بيانات السيارة:</span>
                <span className="font-semibold">{order.carDetails}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-slate-700 pb-2 border-b border-slate-300 text-[11px]">
              <span className="w-1/2 text-right">الصنف</span>
              <span className="w-1/6 text-center">الكمية</span>
              <span className="w-1/3 text-left">السعر</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-1">
              {order.items.map((item) => (
                <div key={item.cartId} className="pt-1.5 pb-1">
                  <div className="flex justify-between items-start font-medium text-slate-900">
                    <span className="w-1/2 font-sans font-semibold text-slate-900">{item.menuItem.name}</span>
                    <span className="w-1/6 text-center font-bold">{item.quantity}</span>
                    <span className="w-1/3 text-left font-bold">{item.itemTotal.toFixed(2)} {settings.currency}</span>
                  </div>

                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-slate-500 pr-2 space-y-0.5">
                      {item.selectedModifiers.map((mod) => (
                        <div key={mod.optionId} className="flex justify-between">
                          <span>+ {mod.optionName}</span>
                          {mod.price > 0 && <span>+{mod.price}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[10px] text-amber-700 italic pr-2">ملاحظة: {item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span>{order.subtotal.toFixed(2)} {settings.currency}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span>{order.tax.toFixed(2)} {settings.currency}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل:</span>
                <span>{order.deliveryFee.toFixed(2)} {settings.currency}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>الخصم الممنوح:</span>
                <span>-{order.discount.toFixed(2)} {settings.currency}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-400 flex justify-between items-center text-sm font-black text-slate-900">
              <span>الإجمالي الكلي:</span>
              <span className="text-base font-bold font-sans">{order.total.toFixed(2)} {settings.currency}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[10px]">
              <span>طريقة الدفع:</span>
              <span className="font-bold">{order.paymentMethod === 'cash' ? 'نقدي (Cash)' : 'بطاقة مدى / ائتمانية'}</span>
            </div>
          </div>

          {/* ZATCA Compliant QR Code simulation */}
          <div className="py-4 text-center flex flex-col items-center justify-center space-y-2">
            <div className="p-2 bg-white border border-slate-400 rounded inline-block shadow-sm">
              <QrCode className="w-24 h-24 text-slate-900" />
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              رمز الاستجابة السريع المعتمد لهيئة الزكاة والضريبة والجمارك (ZATCA)
            </p>
            <p className="text-[11px] font-bold text-slate-800 font-sans mt-2">
              شكراً لزيارتكم! نتمنى لكم وجبة شهية
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-4">
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة الإيصال (Print)</span>
            </button>

            <button
              onClick={() => {
                posAudio.playTap();
                onNewOrder();
              }}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>طلب جديد (Home)</span>
            </button>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              setIsShareModalOpen(true);
            }}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            <span>إرسال الفاتورة عبر WhatsApp / SMS للعميل</span>
          </button>
        </div>

        {/* Digital Receipt Share Modal */}
        {isShareModalOpen && (
          <DigitalReceiptShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            data={shareData}
          />
        )}
      </div>
    </div>
  );
};
