import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Employee, RolePermissions } from '../types';
import { EMPLOYEES_LIST } from '../data/mockData';
import { posAudio } from '../utils/audio';
import { verifyPin } from '../utils/security';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employee?: Employee) => void;
  title?: string;
  allowedEmployees?: Employee[];
  employees?: Employee[];
  managerOnly?: boolean;
  requiredPermission?: keyof RolePermissions;
  adminPin?: string;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  allowedEmployees,
  employees,
  managerOnly = false,
  requiredPermission,
  adminPin,
}) => {
  const [pin, setPin] = useState<string>('');
  const [showAccessDenied, setShowAccessDenied] = useState<boolean>(false);
  const [deniedMessage, setDeniedMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShowAccessDenied(false);
      setDeniedMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    posAudio.playTap();
    if (pin.length < 8) {
      setPin(prev => prev + d);
    }
  };

  const handleBackspace = () => {
    posAudio.playTap();
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    posAudio.playTap();
    setPin('');
  };

  const handleEnter = () => {
    // Resolve live employees: prefer passed allowedEmployees, then employees, then localStorage, then default mock
    let validEmployees: Employee[] = [];
    if (allowedEmployees && allowedEmployees.length > 0) {
      validEmployees = allowedEmployees;
    } else if (employees && employees.length > 0) {
      validEmployees = employees;
    } else if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('invo_employees_list');
      if (saved) {
        try {
          validEmployees = JSON.parse(saved);
        } catch (e) {}
      }
    }
    if (!validEmployees || validEmployees.length === 0) {
      validEmployees = EMPLOYEES_LIST;
    }

    const trimmedPin = pin.trim();
    const isMasterAdmin = Boolean(adminPin && trimmedPin === adminPin.trim());

    // Also inspect invo_security_users for newly updated/created PINs
    let securityUsersList: any[] = [];
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const savedSec = localStorage.getItem('invo_security_users');
        if (savedSec) securityUsersList = JSON.parse(savedSec);
      } catch (e) {}
    }

    // Helper to verify an employee with cryptographic salt/hash or plain PIN
    const checkEmp = (emp: Employee, entered: string): boolean => {
      if (!emp || emp.active === false) return false;
      const cleanEntered = entered.trim();
      if (!cleanEntered) return false;

      // Check if there is an updated record in securityUsersList for this employee
      const secUser = securityUsersList.find(s => s.id === emp.id || s.code === emp.code || s.name === emp.name);
      if (secUser && secUser.pinHash && secUser.salt) {
        return verifyPin(cleanEntered, secUser.pinHash, secUser.salt);
      }

      // 1. Authoritative check: cryptographic salt/hash
      if (emp.pinHash && emp.salt) {
        return verifyPin(cleanEntered, emp.pinHash, emp.salt);
      }

      // 2. Fallback check: plain PIN
      if (emp.pin) {
        return String(emp.pin).trim() === cleanEntered;
      }
      return false;
    };

    // Comprehensive employee matcher that never misses an updated PIN
    const findMatchedEmployee = (): Employee | null => {
      // 1. Direct check in validEmployees
      for (const emp of validEmployees) {
        if (checkEmp(emp, trimmedPin)) return emp;
      }
      // 2. Check in securityUsersList
      for (const secUser of securityUsersList) {
        if (secUser.status !== 'suspended' && secUser.isActive !== false && secUser.pinHash && secUser.salt) {
          if (verifyPin(trimmedPin, secUser.pinHash, secUser.salt)) {
            // Find in validEmployees
            const existingEmp = validEmployees.find(e => e.id === secUser.id || e.code === secUser.code);
            if (existingEmp) {
              existingEmp.pin = trimmedPin;
              existingEmp.pinHash = secUser.pinHash;
              existingEmp.salt = secUser.salt;
              return existingEmp;
            }
            // Synthesize employee
            return {
              id: secUser.id,
              name: secUser.name,
              code: secUser.code || 'POS-EMP',
              role: secUser.roleName || 'كاشير',
              phone: secUser.phone || '05XXXXXXXX',
              pin: trimmedPin,
              pinHash: secUser.pinHash,
              salt: secUser.salt,
              active: true,
              permissions: {
                canEditMenu: true,
                canManageTables: true,
                canDeleteOrders: secUser.roleName?.includes('مدير') || secUser.roleName?.includes('مشرف') || false,
                canViewReports: true,
                canCloseShift: true,
                canManageWorkers: secUser.roleName?.includes('مدير') || false,
                canManageSettings: secUser.roleName?.includes('مدير') || false,
              }
            };
          }
        }
      }
      return null;
    };

    const matchedEmployee = findMatchedEmployee();

    // 1. If a specific granular permission is required (e.g. canDeleteOrders, canEditMenu, canCloseShift)
    if (requiredPermission) {
      if (isMasterAdmin) {
        posAudio.playSuccess();
        const managerEmp = validEmployees.find(e => e.role.includes('مدير')) || validEmployees[0];
        onSuccess(managerEmp);
        return;
      }

      if (matchedEmployee) {
        const hasPermission = matchedEmployee.role.includes('مدير') || !!matchedEmployee.permissions?.[requiredPermission];
        if (hasPermission) {
          posAudio.playSuccess();
          onSuccess(matchedEmployee);
        } else {
          posAudio.playError();
          setDeniedMessage(`الموظف (${matchedEmployee.name}) لا يمتلك صلاحية لتنفيذ هذا الإجراء.`);
          setShowAccessDenied(true);
        }
      } else {
        posAudio.playError();
        setDeniedMessage('رمز الدخول غير صحيح!');
        setShowAccessDenied(true);
      }
      return;
    }

    // 2. If managerOnly protection is requested (such as settled invoices archive & sales reports)
    if (managerOnly) {
      if (isMasterAdmin) {
        posAudio.playSuccess();
        const managerEmp = validEmployees.find(e => e.role.includes('مدير')) || validEmployees[0];
        onSuccess(managerEmp);
        return;
      }

      if (matchedEmployee && (matchedEmployee.role.includes('مدير') || matchedEmployee.role.includes('مشرف') || matchedEmployee.permissions?.canDeleteOrders)) {
        posAudio.playSuccess();
        onSuccess(matchedEmployee);
      } else {
        // Wrong Manager PIN or Regular Cashier trying to open manager reports
        posAudio.playError();
        setDeniedMessage('عذراً، هذه العملية تتطلب رمز وصلاحية المدير المباشر');
        setShowAccessDenied(true);
      }
      return;
    }

    // Standard POS Login / Table Selection PIN Verification (Strict Match Only)
    if (matchedEmployee) {
      posAudio.playSuccess();
      onSuccess(matchedEmployee);
    } else if (isMasterAdmin) {
      posAudio.playSuccess();
      onSuccess(validEmployees[0]);
    } else {
      // Wrong PIN: trigger "Access Denied" modal dialog
      posAudio.playError();
      setDeniedMessage('الرمز الذي أدخلته غير مطابق لأي موظف مسجل');
      setShowAccessDenied(true);
    }
  };

  const handleDismissAccessDenied = () => {
    posAudio.playTap();
    setShowAccessDenied(false);
    setDeniedMessage('');
    setPin('');
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150" 
        dir="rtl"
      >
        <div className="w-full max-w-[320px] bg-[#162033] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 text-white flex flex-col">
          {/* Header Title with security badge */}
          {title && (
            <div className="px-4 py-2 bg-[#0b1329] border-b border-slate-800 text-center flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${managerOnly ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span className="text-xs font-black text-slate-200">
                {title}
              </span>
            </div>
          )}

          {/* Top Password Field Bar matching Video 00:01 */}
          <div className="p-3 bg-[#0f172a] flex items-center gap-2 border-b border-slate-800">
            <div className="flex-1 bg-[#1e293b] rounded-xl px-4 py-3 text-center border border-slate-700/60 min-h-[50px] flex items-center justify-center">
              {pin ? (
                <span className="text-2xl tracking-[0.35em] font-mono text-white font-black">
                  {'*'.repeat(pin.length)}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  {managerOnly ? 'أدخل رمز المدير (PIN)' : 'Enter Your Password'}
                </span>
              )}
            </div>

            {/* White Square Backspace Button */}
            <button
              onClick={handleBackspace}
              className="w-12 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 rounded-xl flex items-center justify-center font-black text-xl active:scale-95 transition-transform cursor-pointer shadow-md"
            >
              <X className="w-7 h-7 stroke-[3.5]" />
            </button>
          </div>

          {/* Keypad Grid matching video Frame 00:01 - 00:02 */}
          <div className="p-3.5 space-y-2 bg-[#162033]">
            {/* Row 1: 7, 8, 9 */}
            <div className="grid grid-cols-3 gap-2">
              {['7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-14 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-2xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Row 2: 4, 5, 6 */}
            <div className="grid grid-cols-3 gap-2">
              {['4', '5', '6'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-14 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-2xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Row 3: 1, 2, 3 */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-14 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-2xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Row 4: Clear & 0 */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleClear}
                className="h-14 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="h-14 bg-[#26354a] hover:bg-[#324560] active:bg-[#1e2b3c] text-white rounded-xl text-2xl font-black font-mono active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                0
              </button>
              <div className="h-14"></div>
            </div>

            {/* Bottom Row: Cancel & Enter (matching video 00:02) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  posAudio.playTap();
                  onClose();
                }}
                className="h-13 bg-[#334155] hover:bg-[#475569] active:bg-[#1e293b] text-white rounded-xl text-base font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-700/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEnter}
                className="h-13 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl text-base font-black active:scale-95 transition-all flex items-center justify-center shadow border border-slate-600 cursor-pointer"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Access Denied Dialog exactly matching Video Frame 00:03 - 00:04 */}
      {showAccessDenied && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150" 
          dir="rtl"
        >
          <div className="w-full max-w-[300px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center text-slate-800 border border-slate-200">
            <h3 className="text-base font-black text-rose-600 mb-2">
              غير مصرح • Access Denied
            </h3>
            <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
              {deniedMessage || 'Access Denied: صلاحية غير متوفرة أو رمز خاطئ'}
            </p>
            <button
              onClick={handleDismissAccessDenied}
              className="w-24 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md"
            >
              موافق (OK)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
