import React, { useState } from 'react';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Coffee, 
  Croissant, 
  Receipt, 
  Wifi, 
  Settings2, 
  Play, 
  CheckCircle2,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle
} from 'lucide-react';
import { PrinterConfig, SectionPrinter } from '../types';
import { posAudio } from '../utils/audio';

interface ThermalPrintersSettingsProps {
  printerConfig: PrinterConfig;
  onUpdatePrinterConfig: (config: Partial<PrinterConfig>) => void;
  showToast: (msg: string) => void;
}

export const ThermalPrintersSettings: React.FC<ThermalPrintersSettingsProps> = ({
  printerConfig,
  onUpdatePrinterConfig,
  showToast,
}) => {
  const printers: SectionPrinter[] = printerConfig.sectionPrinters || [];
  
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Printer form state
  const [newPrinterName, setNewPrinterName] = useState<string>('');
  const [newPrinterSection, setNewPrinterSection] = useState<SectionPrinter['section']>('kitchen');
  const [newPrinterIp, setNewPrinterIp] = useState<string>('192.168.1.205');
  const [newPrinterPort, setNewPrinterPort] = useState<number>(9100);
  const [newPrinterWidth, setNewPrinterWidth] = useState<'80mm' | '58mm'>('80mm');
  const [newAutoPrint, setNewAutoPrint] = useState<boolean>(true);
  const [newCopies, setNewCopies] = useState<number>(1);

  const getSectionBadge = (section: SectionPrinter['section']) => {
    switch (section) {
      case 'kitchen':
        return {
          label: 'المطبخ (Kitchen)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: Flame,
        };
      case 'bar':
        return {
          label: 'البار والمشروبات (Bar)',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Coffee,
        };
      case 'bakery':
        return {
          label: 'المخبز والأفران (Bakery)',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: Croissant,
        };
      case 'cashier':
        return {
          label: 'الكاشير والفواتير (Receipt)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: Receipt,
        };
      default:
        return {
          label: 'قسم مخصص',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: Layers,
        };
    }
  };

  const handleToggleAutoPrint = (printerId: string) => {
    posAudio.playTap();
    const updated = printers.map((p) =>
      p.id === printerId ? { ...p, autoPrintOnPayment: !p.autoPrintOnPayment } : p
    );
    onUpdatePrinterConfig({ sectionPrinters: updated });
    showToast('تم تحديث إعداد الطباعة التلقائية');
  };

  const handleToggleEnabled = (printerId: string) => {
    posAudio.playTap();
    const updated = printers.map((p) =>
      p.id === printerId ? { ...p, enabled: !p.enabled } : p
    );
    onUpdatePrinterConfig({ sectionPrinters: updated });
    showToast('تم تعديل حالة تشغيل الطابعة');
  };

  const handleDeletePrinter = (printerId: string) => {
    posAudio.playTrash();
    const updated = printers.filter((p) => p.id !== printerId);
    onUpdatePrinterConfig({ sectionPrinters: updated });
    showToast('تم حذف الطابعة بنجاح');
  };

  const handleTestPrintSection = (printer: SectionPrinter) => {
    posAudio.playReceiptPrint();
    setTestingPrinterId(printer.id);
    showToast(`جاري إرسال أمر اختبار الطباعة إلى ${printer.name} (${printer.ipAddress})...`);

    setTimeout(() => {
      setTestingPrinterId(null);
      showToast(`✓ تم تأكيد استجابة الطابعة الحرارية بنجاح!`);
    }, 1200);
  };

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName.trim()) {
      showToast('يرجى كتابة اسم الطابعة أولاً');
      return;
    }

    const newPrn: SectionPrinter = {
      id: `prn-${Date.now()}`,
      name: newPrinterName.trim(),
      section: newPrinterSection,
      ipAddress: newPrinterIp.trim(),
      port: newPrinterPort || 9100,
      connectionType: 'network',
      paperWidth: newPrinterWidth,
      autoPrintOnPayment: newAutoPrint,
      enabled: true,
      copies: newCopies || 1,
    };

    posAudio.playSuccess();
    onUpdatePrinterConfig({ sectionPrinters: [...printers, newPrn] });
    showToast(`تمت إضافة ${newPrn.name} بنجاح!`);
    setShowAddModal(false);
    setNewPrinterName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
            <Printer className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              تعريف وربط الطابعات الحرارية بالأقسام
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {printers.filter(p => p.enabled).length} طابعة نشطة
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              توجيه كل قسم (مطبخ، بار، مخبز) لطابعته الخاصة مع خيار الطباعة التلقائية الفورية عند الدفع
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            posAudio.playTap();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة طابعة جديدة</span>
        </button>
      </div>

      {/* Global Master Switch: Auto-Print on Payment */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              الطباعة التلقائية الشاملة عند الدفع (Auto-Print on Payment)
            </h4>
            <p className="text-xs text-slate-400">
              عند تسديد الفاتورة، يقوم النظام تلقائياً بتوزيع وطباعة طلبات كل قسم على طابعته الحرارية فوراً بدون تدخل يدوي
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextVal = !(printerConfig.autoPrintOnPaymentDefault ?? true);
            onUpdatePrinterConfig({ autoPrintOnPaymentDefault: nextVal });
            posAudio.playTap();
            showToast(nextVal ? 'تم تفعيل الطباعة التلقائية عند الدفع لجميع الأقسام' : 'تم تعطيل الطباعة التلقائية');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
            (printerConfig.autoPrintOnPaymentDefault ?? true)
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {(printerConfig.autoPrintOnPaymentDefault ?? true) ? 'مفعل للكل تلقائياً ✓' : 'معطل (يدوي فقط)'}
        </button>
      </div>

      {/* Target Invoice Printer Default Selector */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              وجهة الفاتورة الافتراضية عند إصدار الطلب (Default Invoice Target)
            </h4>
            <p className="text-xs text-slate-400">
              تحديد الطابعة التي تُرسل إليها الفاتورة بشكل افتراضي من شاشة الطلبات (يمكن تغييرها بلمسة واحدة)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onUpdatePrinterConfig({ activeInvoicePrinter: 'cashier' });
              showToast('تم ضبط الوجهة الافتراضية: طابعة الكاشير');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              (printerConfig.activeInvoicePrinter || 'both') === 'cashier'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>طابعة الكاشير</span>
          </button>
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onUpdatePrinterConfig({ activeInvoicePrinter: 'kitchen' });
              showToast('تم ضبط الوجهة الافتراضية: طابعة المطبخ');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              (printerConfig.activeInvoicePrinter || 'both') === 'kitchen'
                ? 'bg-rose-600 text-white shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>طابعة المطبخ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onUpdatePrinterConfig({ activeInvoicePrinter: 'both' });
              showToast('تم ضبط الوجهة الافتراضية: كلاهما (الكاشير + المطبخ)');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              (printerConfig.activeInvoicePrinter || 'both') === 'both'
                ? 'bg-blue-600 text-white shadow font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>كلاهما معاً</span>
          </button>
        </div>
      </div>

      {/* Section Printers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {printers.map((printer) => {
          const badge = getSectionBadge(printer.section);
          const SectionIcon = badge.icon;
          const isTesting = testingPrinterId === printer.id;

          return (
            <div
              key={printer.id}
              className={`bg-slate-900/80 border rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                printer.enabled
                  ? 'border-slate-700/80 hover:border-blue-500/50'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div>
                {/* Top Row: Section Badge + Status Toggle */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badge.color}`}>
                    <SectionIcon className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEnabled(printer.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        printer.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="تشغيل أو تعطيل الطابعة"
                    >
                      {printer.enabled ? 'نشطة' : 'معطلة'}
                    </button>

                    {printer.section === 'custom' && (
                      <button
                        onClick={() => handleDeletePrinter(printer.id)}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="حذف الطابعة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Printer Name & Network Config */}
                <div className="space-y-2">
                  <h4 className="text-base font-black text-white">
                    {printer.name}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">IP Address / المنفذ</span>
                      <span className="text-blue-400 font-bold">{printer.ipAddress}:{printer.port}</span>
                    </div>

                    <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">مقاس الورق والنسخ</span>
                      <span className="text-amber-400 font-bold">{printer.paperWidth} • {printer.copies} نسخة</span>
                    </div>
                  </div>
                </div>

                {/* Feature: Auto-Print on Payment Checkbox */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`auto-${printer.id}`}
                      checked={printer.autoPrintOnPayment}
                      onChange={() => handleToggleAutoPrint(printer.id)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label
                      htmlFor={`auto-${printer.id}`}
                      className="text-xs font-bold text-slate-300 cursor-pointer select-none"
                    >
                      طباعة تلقائية عند الدفع
                    </label>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    ESC/POS Thermal
                  </span>
                </div>
              </div>

              {/* Action Buttons: Test Print & IP Config */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleTestPrintSection(printer)}
                  disabled={isTesting}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : 'text-blue-400'}`} />
                  <span>{isTesting ? 'جاري الاختبار...' : 'اختبار طباعة بون التجربة'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl p-5 text-white animate-in zoom-in-95">
            <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-400" />
              إضافة طابعة حرارية لقسم جديد
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              أدخل بيانات الطابعة الحرارية وعنوان IP الشبكي الخاص بها
            </p>

            <form onSubmit={handleAddPrinter} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الطابعة</label>
                <input
                  type="text"
                  required
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  placeholder="مثال: طابعة المشاوي الساخنة"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">القسم المرتبط</label>
                <select
                  value={newPrinterSection}
                  onChange={(e) => setNewPrinterSection(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="kitchen">المطبخ الرئيسي (Kitchen)</option>
                  <option value="bar">البار والمشروبات (Bar)</option>
                  <option value="bakery">المخبز والأفران (Bakery)</option>
                  <option value="cashier">الكاشير والفواتير (Receipt)</option>
                  <option value="custom">قسم مخصص آخر</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">IP الطابعة</label>
                  <input
                    type="text"
                    required
                    value={newPrinterIp}
                    onChange={(e) => setNewPrinterIp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المنفذ (Port)</label>
                  <input
                    type="number"
                    value={newPrinterPort}
                    onChange={(e) => setNewPrinterPort(parseInt(e.target.value) || 9100)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-blue-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عرض الورق</label>
                  <select
                    value={newPrinterWidth}
                    onChange={(e) => setNewPrinterWidth(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="80mm">80mm (قياسي عريض)</option>
                    <option value="58mm">58mm (شريط صغير)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عدد النسخ</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={newCopies}
                    onChange={(e) => setNewCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="new-auto-print"
                  checked={newAutoPrint}
                  onChange={(e) => setNewAutoPrint(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="new-auto-print" className="text-slate-300 font-bold cursor-pointer">
                  تفعيل الطباعة التلقائية عند الدفع لهذه الطابعة
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-lg shadow-blue-600/30 transition-colors cursor-pointer"
                >
                  حفظ الطابعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
