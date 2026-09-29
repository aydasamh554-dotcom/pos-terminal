import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  Delete, 
  KeyRound, 
  UserCheck,
  FileText
} from 'lucide-react';
import { SecurityUser, SecurityRole, AuditLogEntry } from '../types/security';
import { verifyPin, logAuditEvent } from '../utils/security';
import { posAudio } from '../utils/audio';

interface ManagerApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (managerInfo: { id: string; name: string }, reason: string) => void;
  actionTitle: string;
  actionKey?: string;
  resourceDescription?: string;
  currentEmployee: { id: string; name: string; roleName?: string };
  reasonPrompt?: string;
  isReasonMandatory?: boolean;
  securityUsers?: SecurityUser[];
  roles?: SecurityRole[];
  masterAdminPin?: string;
}

const QUICK_REASONS = [
  'طلب العميل إلغاء الصنف/الطلب',
  'خطأ في تسجيل الصنف من الكاشير',
  'خصم خاص واستثنائي لعميل VIP',
  'الصنف غير متوفر بالمطبخ',
  'تأخر في تحضير الطلب',
  'تعديل سعر بناء على موافقة الإدارة',
];

export const ManagerApprovalModal: React.FC<ManagerApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  actionTitle,
  actionKey = 'sales.sensitive_operation',
  resourceDescription,
  currentEmployee,
  reasonPrompt,
  isReasonMandatory = true,
  securityUsers = [],
  roles = [],
  masterAdminPin = '1234',
}) => {
  const [pin, setPin] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [approvedManager, setApprovedManager] = useState<SecurityUser | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setReason('');
      setErrorMsg('');
      setApprovedManager(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    posAudio.playTap();
    if (pin.length < 8) {
      setPin((prev) => prev + d);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    posAudio.playTap();
    setPin('');
    setErrorMsg('');
  };

  const handleVerifyAndApprove = () => {
    // 1. Mandatory Reason validation
    if (isReasonMandatory && !reason.trim()) {
      posAudio.playError();
      setErrorMsg('يجب إدخال سبب العملية للمتابعة والتدقيق الأمني!');
      return;
    }

    if (!pin.trim()) {
      posAudio.playError();
      setErrorMsg('الرجاء إدخال رمز PIN للمدير أو المشرف.');
      return;
    }

    // 2. Identify managers or supervisors
    // Check against master admin PIN (1234, 0000, 789 or custom)
    const isMasterPin = pin === masterAdminPin || pin === '1234' || pin === '789' || pin === '0000';
    let matchedManager: { id: string; name: string } | null = null;

    if (isMasterPin) {
      matchedManager = {
        id: 'admin-master',
        name: 'المدير العام (Master PIN)',
      };
    } else {
      // Find within active security users with admin or supervisor role
      const foundUser = securityUsers.find((user) => {
        if (user.status === 'suspended') return false;
        const userRole = roles.find((r) => r.id === user.roleId);
        const isManagerOrSupervisor = 
          userRole?.type === 'admin' || 
          userRole?.type === 'supervisor' || 
          user.roleName.includes('مدير') || 
          user.roleName.includes('مشرف');

        if (!isManagerOrSupervisor) return false;

        // Verify cryptographic hash
        return verifyPin(pin, user.pinHash, user.salt);
      });

      if (foundUser) {
        matchedManager = {
          id: foundUser.id,
          name: foundUser.name,
        };
      }
    }

    if (!matchedManager) {
      posAudio.playError();
      setErrorMsg('رمز PIN غير صحيح أو أن الموظف لا يملك صلاحية اعتماد هذا الإجراء!');
      return;
    }

    // 3. Success: Log to Audit Log immediately
    posAudio.playSuccess();

    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: currentEmployee.roleName || 'كاشير',
      action: actionKey,
      actionTitle,
      targetResource: resourceDescription || 'الطلب الحالي',
      branchId: 'main',
      device: 'شاشة الطلبات POS',
      requiresApproval: true,
      approvedBy: matchedManager.name,
      approvedByManagerId: matchedManager.id,
      reason: reason.trim(),
      status: 'success',
      details: {
        oneTimeAuthorization: true,
        expiresImmediately: true,
      },
    });

    // Execute callback for one-time operation
    onApprove(matchedManager, reason.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 select-none animate-in fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-slate-700/30 overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                  موافقة أمنية مؤقتة
                </span>
                <span className="text-[11px] text-rose-300 font-mono">One-Time Token</span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">صلاحية المدير مطلوبة</h3>
            </div>
          </div>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 bg-slate-50 overflow-y-auto max-h-[80vh]">
          {/* Action & Context Info Box */}
          <div className="bg-rose-50 border-r-4 border-rose-600 p-3 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">الإجراء المطلوب:</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-950 font-black">
                {actionTitle}
              </span>
            </div>
            {resourceDescription && (
              <p className="text-xs text-slate-700 font-semibold truncate">
                المستهدف: <span className="text-rose-700 font-bold">{resourceDescription}</span>
              </p>
            )}
            {reasonPrompt && (
              <p className="text-[11px] text-amber-800 bg-amber-100/70 p-1.5 rounded-lg border border-amber-300/60 font-medium">
                ⚠️ {reasonPrompt}
              </p>
            )}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-rose-200/60">
              <span>الموظف الحالي: <strong>{currentEmployee.name}</strong></span>
              <span className="text-rose-600 font-bold">جلسة مؤقتة لعملية واحدة</span>
            </div>
          </div>

          {/* Mandatory Reason Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>سبب الإجراء {isReasonMandatory ? '(إلزامي للتدقيق الأمني)' : '(اختياري)'}:</span>
              </label>
              {isReasonMandatory && (
                <span className="text-[10px] text-rose-600 font-black bg-rose-100 px-1.5 py-0.5 rounded">مطلوب</span>
              )}
            </div>

            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="اكتب سبب الموافقة أو اختر سبباً سريعاً من الأسفل..."
              className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
            />

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_REASONS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    posAudio.playTap();
                    setReason(r);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    reason === r
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* PIN Input & Pad */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>رمز PIN للمدير أو المشرف:</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Master PIN: 1234 / 789</span>
            </div>

            {/* PIN Display Dots */}
            <div className="h-12 bg-white rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-3 px-4 shadow-inner">
              {pin.length === 0 ? (
                <span className="text-xs text-slate-400 font-medium">أدخل رمز الـ PIN هنا</span>
              ) : (
                Array.from({ length: Math.min(8, pin.length) }).map((_, idx) => (
                  <div key={idx} className="w-3.5 h-3.5 rounded-full bg-slate-900 shadow-xs animate-in zoom-in-75" />
                ))
              )}
            </div>

            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="h-12 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 shadow-xs text-lg font-black font-mono text-slate-800 transition-transform cursor-pointer flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 text-rose-700 text-xs font-bold transition-transform cursor-pointer flex items-center justify-center"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-12 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 shadow-xs text-lg font-black font-mono text-slate-800 transition-transform cursor-pointer flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 text-slate-700 transition-transform cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-transform cursor-pointer"
          >
            إلغاء العملية
          </button>
          <button
            type="button"
            onClick={handleVerifyAndApprove}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-500 hover:to-rose-700 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-transform cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد العملية وتمريرها</span>
          </button>
        </div>
      </div>
    </div>
  );
};
