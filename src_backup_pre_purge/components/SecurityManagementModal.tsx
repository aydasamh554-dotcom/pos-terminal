import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  X, 
  Users, 
  Shield, 
  Layers, 
  History, 
  Trash2, 
  UserPlus, 
  Key, 
  Check, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  UserX, 
  Percent, 
  Building2, 
  Smartphone,
  Eye,
  Plus
} from 'lucide-react';
import { 
  SecurityUser, 
  SecurityRole, 
  PermissionKey, 
  AuditLogEntry, 
  SoftDeleteRecord 
} from '../types/security';
import { 
  ALL_PERMISSIONS_CATALOG, 
  PERMISSION_GROUPS, 
  DEFAULT_SYSTEM_ROLES, 
  generateSalt, 
  hashPinWithSalt, 
  logAuditEvent,
  buildPermissionsDictionary
} from '../utils/security';
import { posAudio } from '../utils/audio';

interface SecurityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityUsers: SecurityUser[];
  onUpdateSecurityUsers: (users: SecurityUser[]) => void;
  roles: SecurityRole[];
  onUpdateRoles: (roles: SecurityRole[]) => void;
  auditLogs: AuditLogEntry[];
  softDeletedRecords: SoftDeleteRecord[];
  onRestoreRecord: (recordId: string) => void;
  onPermanentDeleteRecord: (recordId: string) => void;
  currentEmployee: { id: string; name: string };
  currency?: string;
}

export const SecurityManagementModal: React.FC<SecurityManagementModalProps> = ({
  isOpen,
  onClose,
  securityUsers,
  onUpdateSecurityUsers,
  roles,
  onUpdateRoles,
  auditLogs,
  softDeletedRecords,
  onRestoreRecord,
  onPermanentDeleteRecord,
  currentEmployee,
  currency = 'ر.ع',
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix' | 'audit' | 'recycle'>('users');
  
  // User Management State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<SecurityUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserCode, setNewUserCode] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserRoleId, setNewUserRoleId] = useState<string>(roles[2]?.id || 'role_cashier');
  const [newUserPin, setNewUserPin] = useState<string>('1234');
  const [newUserMaxDiscount, setNewUserMaxDiscount] = useState<number>(10);
  const [newUserBranch, setNewUserBranch] = useState<string>('main');

  // Custom Permissions Override Modal for Selected User
  const [userForCustomPermissions, setUserForCustomPermissions] = useState<SecurityUser | null>(null);
  const [tempUserCustomPermissions, setTempUserCustomPermissions] = useState<Partial<Record<PermissionKey, boolean>>>({});

  // Reset PIN Dialog State
  const [userForPinReset, setUserForPinReset] = useState<SecurityUser | null>(null);
  const [newResetPin, setNewResetPin] = useState<string>('');

  // Role Creation State
  const [isAddRoleOpen, setIsAddRoleOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [newRoleDiscount, setNewRoleDiscount] = useState<number>(15);
  const [newRolePermissions, setNewRolePermissions] = useState<Record<PermissionKey, boolean>>(() => buildPermissionsDictionary(false));

  // Audit Logs Filter
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditEmployeeFilter, setAuditEmployeeFilter] = useState<string>('all');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        !auditSearchQuery ||
        log.actionTitle.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.targetResource.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.employeeName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        (log.reason && log.reason.toLowerCase().includes(auditSearchQuery.toLowerCase()));

      const matchEmployee = auditEmployeeFilter === 'all' || log.employeeId === auditEmployeeFilter;
      const matchCategory =
        auditCategoryFilter === 'all' ||
        (auditCategoryFilter === 'sensitive' && log.requiresApproval) ||
        (typeof log.action === 'string' && log.action.startsWith(auditCategoryFilter));

      return matchSearch && matchEmployee && matchCategory;
    });
  }, [auditLogs, auditSearchQuery, auditEmployeeFilter, auditCategoryFilter]);

  if (!isOpen) return null;

  // --- Handlers for User Management ---
  const handleToggleUserStatus = (userId: string) => {
    posAudio.playTap();
    const targetUser = securityUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const updated = securityUsers.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    onUpdateSecurityUsers(updated);

    // Audit log this sensitive action!
    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: 'مدير النظام',
      action: 'staff.suspend',
      actionTitle: newStatus === 'suspended' ? `تعطيل حساب الموظف (${targetUser.name})` : `تفعيل حساب الموظف (${targetUser.name})`,
      targetResource: `كود الموظف: ${targetUser.code}`,
      branchId: 'main',
      device: 'لوحة الأمان POS',
      requiresApproval: true,
      reason: newStatus === 'suspended' ? 'إيقاف حساب طارئ / إداري' : 'إعادة تفعيل الحساب',
      status: 'success',
    });
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserCode.trim() || !newUserPin.trim()) return;

    posAudio.playSuccess();
    const salt = generateSalt(12);
    const pinHash = hashPinWithSalt(newUserPin.trim(), salt);
    const selectedRole = roles.find((r) => r.id === newUserRoleId) || roles[0];

    const newUser: SecurityUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newUserName.trim(),
      code: newUserCode.trim(),
      phone: newUserPhone.trim(),
      roleId: selectedRole.id,
      roleName: selectedRole.name,
      pinHash,
      salt,
      status: 'active',
      maxDiscountPercent: newUserMaxDiscount,
      customPermissions: {},
      allowedBranches: [newUserBranch],
      createdAt: new Date().toISOString(),
    };

    const updated = [...securityUsers, newUser];
    onUpdateSecurityUsers(updated);

    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: 'مدير النظام',
      action: 'staff.create',
      actionTitle: `إضافة موظف جديد: ${newUser.name}`,
      targetResource: `الدور: ${selectedRole.name}`,
      branchId: newUserBranch,
      device: 'شاشة الأمان POS',
      requiresApproval: false,
      reason: 'تسجيل موظف جديد في النظام',
      status: 'success',
    });

    // Reset Form
    setNewUserName('');
    setNewUserCode('');
    setNewUserPhone('');
    setNewUserPin('1234');
    setIsAddUserModalOpen(false);
  };

  const handleSaveResetPin = () => {
    if (!userForPinReset || !newResetPin.trim()) return;
    posAudio.playSuccess();

    const salt = generateSalt(12);
    const pinHash = hashPinWithSalt(newResetPin.trim(), salt);

    const updated = securityUsers.map((u) =>
      u.id === userForPinReset.id ? { ...u, pinHash, salt, updatedAt: new Date().toISOString() } : u
    );
    onUpdateSecurityUsers(updated);

    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: 'مدير النظام',
      action: 'staff.reset_pin',
      actionTitle: `إعادة تعيين PIN للموظف (${userForPinReset.name})`,
      targetResource: `كود الموظف: ${userForPinReset.code}`,
      branchId: 'main',
      device: 'شاشة الأمان POS',
      requiresApproval: true,
      reason: 'إعادة تعيين كلمة السر بطلب الإدارة',
      status: 'success',
    });

    setUserForPinReset(null);
    setNewResetPin('');
  };

  const handleSaveCustomPermissions = () => {
    if (!userForCustomPermissions) return;
    posAudio.playSuccess();

    const updated = securityUsers.map((u) =>
      u.id === userForCustomPermissions.id
        ? { ...u, customPermissions: tempUserCustomPermissions, updatedAt: new Date().toISOString() }
        : u
    );
    onUpdateSecurityUsers(updated);

    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: 'مدير النظام',
      action: 'staff.change_permissions',
      actionTitle: `تعديل صلاحيات مخصصة (Overrides) للموظف (${userForCustomPermissions.name})`,
      targetResource: `الموظف: ${userForCustomPermissions.name}`,
      branchId: 'main',
      device: 'شاشة الأمان POS',
      requiresApproval: true,
      reason: 'تخصيص استثناءات للصلاحيات',
      status: 'success',
    });

    setUserForCustomPermissions(null);
  };

  // --- Handlers for Custom Role Creation ---
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    posAudio.playSuccess();
    const newRole: SecurityRole = {
      id: `role_custom_${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || 'دور وظيفي مخصص',
      type: 'custom',
      isSystem: false,
      color: 'indigo',
      maxDiscountPercent: newRoleDiscount,
      permissions: newRolePermissions,
      createdAt: new Date().toISOString(),
    };

    const updatedRoles = [...roles, newRole];
    onUpdateRoles(updatedRoles);

    logAuditEvent({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: 'مدير النظام',
      action: 'staff.change_permissions',
      actionTitle: `إنشاء دور وظيفي مخصص: ${newRole.name}`,
      targetResource: `حد الخصم: ${newRoleDiscount}%`,
      branchId: 'main',
      device: 'شاشة الأمان POS',
      requiresApproval: true,
      reason: 'إضافة دور وصلاحيات جديدة',
      status: 'success',
    });

    setNewRoleName('');
    setNewRoleDescription('');
    setIsAddRoleOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[105] flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 select-none animate-in fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-700/60 overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">إدارة الصلاحيات والأمان المتكاملة</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                  RBAC & Audit Engine V2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تحكم دقيق في عمليات البيع والمخزون والمالية، سجل تدقيق حي، وحذف آمن Soft Delete
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 flex gap-1.5 overflow-x-auto shrink-0 py-2 scrollbar-none">
          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('users');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الموظفون وفريق العمل ({securityUsers.length})</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('roles');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>الأدوار والصلاحيات ({roles.length})</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('matrix');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مصفوفة الصلاحيات الدقيقة ({ALL_PERMISSIONS_CATALOG.length})</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('audit');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التدقيق والموافقات ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => {
              posAudio.playTap();
              setActiveTab('recycle');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'recycle'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>سلة المحذوفات الآمنة ({softDeletedRecords.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900/60">
          {/* ========================================================= */}
          {/* TAB 1: USERS & STAFF MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">قائمة الموظفين والحسابات النشطة</h3>
                  <p className="text-xs text-slate-400">
                    يمكن للمدير إيقاف الحساب فورياً، تخصيص استثناءات للصلاحيات، وتعديل حد الخصم
                  </p>
                </div>
                <button
                  onClick={() => {
                    posAudio.playTap();
                    setIsAddUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة موظف جديد</span>
                </button>
              </div>

              {/* Grid of Users Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {securityUsers.map((user) => {
                  const roleObj = roles.find((r) => r.id === user.roleId) || roles[0];
                  const hasCustomOverrides = user.customPermissions && Object.keys(user.customPermissions).length > 0;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        user.status === 'suspended'
                          ? 'bg-rose-950/20 border-rose-900/50 opacity-80'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                            user.status === 'suspended'
                              ? 'bg-rose-900/40 text-rose-300'
                              : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">{user.name}</h4>
                              {user.status === 'suspended' ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                                  موقوف
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                  نشط
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="font-mono">{user.code}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">{user.roleName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fast Kill-Switch Button */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          title={user.status === 'active' ? 'تعطيل الحساب فوراً' : 'إعادة تفعيل الحساب'}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            user.status === 'active'
                              ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60'
                              : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>تفعيل</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* User Stats & Capabilities */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          <span className="block text-[10px] text-slate-400">حد الخصم</span>
                          <span className="font-bold text-amber-400 font-mono-num">{user.maxDiscountPercent}%</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          <span className="block text-[10px] text-slate-400">صلاحيات مخصصة</span>
                          <span className="font-bold text-indigo-400 font-mono-num">
                            {hasCustomOverrides ? `${Object.keys(user.customPermissions).length} استثناء` : 'افتراضي'}
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          <span className="block text-[10px] text-slate-400">حماية الـ PIN</span>
                          <span className="font-bold text-emerald-400 font-mono">Hashed 🔒</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            posAudio.playTap();
                            setUserForCustomPermissions(user);
                            setTempUserCustomPermissions(user.customPermissions || {});
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-blue-400" />
                          <span>تعديل الصلاحيات</span>
                        </button>

                        <button
                          onClick={() => {
                            posAudio.playTap();
                            setUserForPinReset(user);
                            setNewResetPin('');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>تغيير PIN</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ROLES & PERMISSIONS */}
          {/* ========================================================= */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">الأدوار القياسية والمخصصة</h3>
                  <p className="text-xs text-slate-400">
                    يمكن للمدير إنشاء أدوار مخصصة وتحديد سقف الخصم والصلاحيات المسموحة
                  </p>
                </div>
                <button
                  onClick={() => {
                    posAudio.playTap();
                    setIsAddRoleOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-transform cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء دور جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const allowedCount = Object.values(role.permissions || {}).filter(Boolean).length;
                  return (
                    <div
                      key={role.id}
                      className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{role.name}</h4>
                            {role.isSystem ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                                نظامي
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">
                                مخصص
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{role.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          الصلاحيات الممنوحة: <strong className="text-emerald-400 font-mono-num">{allowedCount}</strong> من {ALL_PERMISSIONS_CATALOG.length}
                        </span>
                        <span className="text-slate-400">
                          الحد الأقصى للخصم: <strong className="text-amber-400 font-mono-num">{role.maxDiscountPercent}%</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: GRANULAR MATRIX */}
          {/* ========================================================= */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white">مصفوفة الصلاحيات الدقيقة ({ALL_PERMISSIONS_CATALOG.length} عملية)</h3>
                <p className="text-xs text-slate-400">
                  تفصيل كامل لجميع العمليات الحساسة والعادية التي يتحقق منها النظام قبل كل ضغطة زر
                </p>
              </div>

              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.id} className="bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">{group.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono-num">{group.permissions.length} صلاحية</span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {group.permissions.map((perm) => (
                        <div key={perm.key} className="p-3 flex items-center justify-between hover:bg-slate-800/20">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{perm.label}</span>
                              {perm.isSensitive && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                                  عملية حساسة ⚠️
                                </span>
                              )}
                              {perm.requiresReason && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                                  سبب إلزامي
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{perm.description}</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                            {perm.key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ENTERPRISE AUDIT LOG & APPROVALS */}
          {/* ========================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>سجل التدقيق والموافقات الأمني (Audit Trail)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      تسجيل غير قابل للحذف لجميع العمليات الحساسة، الإلغاءات، والموافقات المؤقتة
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        posAudio.playTap();
                        const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `VNOX_Audit_Logs_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تصدير JSON</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="بحث في العمليات أو الموظف أو السبب..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full text-xs font-medium pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={auditEmployeeFilter}
                    onChange={(e) => setAuditEmployeeFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">جميع الموظفين</option>
                    {securityUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                    ))}
                  </select>

                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">جميع أنواع العمليات</option>
                    <option value="sensitive">عمليات حساسة بموافقة المدير فقط</option>
                    <option value="sales">عمليات المبيعات والفواتير</option>
                    <option value="products">عمليات المنتجات والمنيو</option>
                    <option value="inventory">عمليات المخزون</option>
                    <option value="staff">عمليات الموظفين والأمان</option>
                  </select>
                </div>
              </div>

              {/* Logs Timeline List */}
              <div className="space-y-2">
                {filteredAuditLogs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400">لا توجد سجلات مطابقة لمعايير البحث الحالية.</p>
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.requiresApproval
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {log.actionTitle}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{log.targetResource}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{log.dateFormatted}</span>
                          <span>•</span>
                          <span>{log.timeFormatted}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-800/60 gap-2">
                        <div className="flex items-center gap-3 text-slate-300">
                          <span>الموظف: <strong>{log.employeeName}</strong> ({log.employeeRole})</span>
                          {log.approvedBy && (
                            <span className="text-emerald-400 font-bold">
                              ✓ موافقة المدير: {log.approvedBy}
                            </span>
                          )}
                        </div>

                        {log.reason && (
                          <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded-md">
                            السبب: {log.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SOFT DELETE & RECYCLE BIN */}
          {/* ========================================================= */}
          {activeTab === 'recycle' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>سلة المحذوفات الآمنة (Soft Delete Recycle Bin)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  الفواتير والمنتجات لا تُفقد نهائياً من قاعدة البيانات، بل تبقى هنا مع إمكانية استعادتها فورياً بنقرة زر
                </p>
              </div>

              {softDeletedRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">سلة المحذوفات فارغة حالياً</p>
                  <p className="text-[11px] text-slate-500">أي فاتورة أو وجبة محذوفة ستظهر هنا تلقائياً مع تفاصيل الحذف</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {softDeletedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{record.recordTitle}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {record.recordIdentifier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          حذف بواسطة: <strong className="text-slate-300">{record.deletedByEmployeeName}</strong> • السبب: <span className="text-amber-400">{record.reason}</span>
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          تاريخ الحذف: {new Date(record.deletedAt).toLocaleString('ar-SA')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            posAudio.playSuccess();
                            onRestoreRecord(record.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من الحذف النهائي الذي لا رجعة فيه للسجل (${record.recordTitle})؟`)) {
                              posAudio.playTrash();
                              onPermanentDeleteRecord(record.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/80 cursor-pointer active:scale-95 transition-transform"
                          title="حذف نهائي لا رجعة فيه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Add New User */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/75 p-3 select-none">
            <form
              onSubmit={handleCreateNewUser}
              className="w-full max-w-md bg-slate-900 rounded-3xl p-5 border border-slate-700 space-y-4 shadow-2xl animate-in zoom-in-95 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>إضافة حساب موظف جديد</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الموظف الثلاثي:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد سعيد العتيبي"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الرقم الوظيفي:</label>
                    <input
                      type="text"
                      required
                      placeholder="POS-109"
                      value={newUserCode}
                      onChange={(e) => setNewUserCode(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      placeholder="050xxxxxxx"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الدور الوظيفي:</label>
                    <select
                      value={newUserRoleId}
                      onChange={(e) => {
                        setNewUserRoleId(e.target.value);
                        const r = roles.find((x) => x.id === e.target.value);
                        if (r) setNewUserMaxDiscount(r.maxDiscountPercent);
                      }}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none cursor-pointer"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رمز PIN الافتراضي:</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value)}
                      placeholder="1234"
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الحد الأقصى للخصم المسموح به لهذا الموظف: ({newUserMaxDiscount}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newUserMaxDiscount}
                    onChange={(e) => setNewUserMaxDiscount(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  حفظ وتشفير الحساب
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Reset PIN */}
        {userForPinReset && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/75 p-3 select-none">
            <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-5 border border-slate-700 space-y-4 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>إعادة تعيين PIN للموظف ({userForPinReset.name})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setUserForPinReset(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">أدخل رمز PIN الجديد:</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="رمز جديد من 4-6 أرقام"
                  value={newResetPin}
                  onChange={(e) => setNewResetPin(e.target.value)}
                  className="w-full text-center text-lg font-mono font-black tracking-widest px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-400">
                  سيتم تشفير الرمز فوراً وحفظه بتقنية Hashing الآمنة ولن يتمكن أحد من رؤيته.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserForPinReset(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveResetPin}
                  className="flex-[2] py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                >
                  تحديث وتشفير PIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Custom Permissions Overrides per Employee */}
        {userForCustomPermissions && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/80 p-3 select-none">
            <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 rounded-3xl p-5 border border-slate-700 flex flex-col shadow-2xl text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>تخصيص استثناءات الصلاحيات: {userForCustomPermissions.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الدور الموروث: <strong className="text-amber-400">{userForCustomPermissions.roleName}</strong> • الاستثناء هنا يتجاوز الصلاحية الافتراضية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUserForCustomPermissions(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.id} className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="bg-slate-900 px-3.5 py-2 font-bold text-xs text-emerald-400 border-b border-slate-800">
                      {group.title}
                    </div>
                    <div className="p-2 space-y-1">
                      {group.permissions.map((perm) => {
                        const isOverridden = tempUserCustomPermissions[perm.key] !== undefined;
                        const isGranted = Boolean(tempUserCustomPermissions[perm.key]);

                        return (
                          <div
                            key={perm.key}
                            className="p-2 rounded-xl bg-slate-900/50 flex items-center justify-between text-xs hover:bg-slate-900"
                          >
                            <div>
                              <span className="font-bold text-slate-200">{perm.label}</span>
                              {perm.isSensitive && (
                                <span className="mr-2 text-[10px] text-rose-400 font-bold">⚠️ حساسة</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  posAudio.playTap();
                                  setTempUserCustomPermissions((prev) => ({
                                    ...prev,
                                    [perm.key]: !isGranted,
                                  }));
                                }}
                                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                  isGranted
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isGranted ? 'مسموح ✓' : 'ممنوع ✕'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserForCustomPermissions(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomPermissions}
                  className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  حفظ الاستثناءات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
