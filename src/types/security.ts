// =======================================================================
// V-NOX POS - Enterprise Security, Permissions & Audit Types
// =======================================================================

// -----------------------------------------------------------------------
// 1. Granular Permission Keys (الصلاحيات الدقيقة)
// -----------------------------------------------------------------------

export type SalesPermissionKey =
  | 'sales.create_invoice'      // إنشاء فاتورة
  | 'sales.edit_invoice'        // تعديل الفاتورة
  | 'sales.delete_item'         // حذف صنف من الفاتورة
  | 'sales.edit_quantity'       // تعديل كمية
  | 'sales.edit_price'          // تعديل السعر (حساسة)
  | 'sales.apply_discount'      // تطبيق خصم (مقيد بالحد الأقصى)
  | 'sales.change_order_type'   // تغيير نوع الطلب (محلي / سفري / توصيل)
  | 'sales.hold_invoice'        // تعليق الفاتورة
  | 'sales.recall_invoice'      // استرجاع الفاتورة المعلقة
  | 'sales.cancel_invoice'      // إلغاء الفاتورة (حساسة)
  | 'sales.reprint_invoice'     // إعادة طباعة الفاتورة
  | 'sales.delete_invoice'      // حذف فاتورة (حساسة - سلة المحذوفات)
  | 'sales.refund_invoice';     // استرجاع مبلغ / مرتجع (حساسة)

export type ProductsPermissionKey =
  | 'products.view'             // مشاهدة المنتجات
  | 'products.create'           // إضافة منتج
  | 'products.edit'             // تعديل منتج
  | 'products.delete'           // حذف منتج (حساسة - سلة المحذوفات)
  | 'products.change_price'     // تغيير السعر (حساسة)
  | 'products.change_category'  // تغيير التصنيف
  | 'products.change_image'     // تغيير الصورة
  | 'products.change_availability'; // تغيير حالة المنتج (متوفر / غير متوفر)

export type InventoryPermissionKey =
  | 'inventory.view'            // مشاهدة المخزون
  | 'inventory.add_stock'       // إضافة كمية وتوريد
  | 'inventory.deduct_stock'    // خصم كمية وهدر
  | 'inventory.edit_manual'     // تعديل كمية يدويًا (حساسة)
  | 'inventory.stocktake'       // إجراء جرد
  | 'inventory.edit_cost'       // تعديل تكلفة المنتج (حساسة)
  | 'inventory.view_movements'; // مشاهدة حركات المخزون

export type FinancePermissionKey =
  | 'finance.view_sales'        // مشاهدة المبيعات
  | 'finance.view_profits'      // مشاهدة الأرباح وقائمة الدخل (حساسة)
  | 'finance.view_reports'      // مشاهدة التقارير العامة
  | 'finance.open_shift'        // فتح الوردية
  | 'finance.close_shift'       // إغلاق الوردية (حساسة)
  | 'finance.cash_in'           // إضافة نقدية
  | 'finance.cash_out'          // سحب نقدية (حساسة)
  | 'finance.open_drawer'       // فتح درج النقدية يدوياً بدون بيع (حساسة)
  | 'finance.edit_payment';     // تعديل عملية دفع (حساسة)

export type StaffPermissionKey =
  | 'staff.view'                // مشاهدة الموظفين
  | 'staff.create'              // إضافة موظف
  | 'staff.edit'                // تعديل موظف
  | 'staff.suspend'             // إيقاف موظف (حساسة)
  | 'staff.delete'              // حذف موظف (حساسة)
  | 'staff.change_permissions'  // تغيير صلاحيات موظف (حساسة)
  | 'staff.reset_pin';          // إعادة تعيين PIN (حساسة)

export type SettingsPermissionKey =
  | 'settings.general'          // إعدادات النظام (حساسة)
  | 'settings.printers'         // إعدادات الطابعة
  | 'settings.taxes'            // إعدادات الضرائب والفوترة الإلكترونية (حساسة)
  | 'settings.payment_methods'  // إعدادات طرق الدفع
  | 'settings.branches'         // إعدادات الفروع (حساسة)
  | 'settings.backup'           // النسخ الاحتياطي
  | 'settings.restore'          // استعادة النسخة الاحتياطية (حساسة)
  | 'settings.view_audit_logs'; // مشاهدة سجل التدقيق الأمني

export type PermissionKey =
  | SalesPermissionKey
  | ProductsPermissionKey
  | InventoryPermissionKey
  | FinancePermissionKey
  | StaffPermissionKey
  | SettingsPermissionKey;

// Metadata for rendering and UI categorizations
export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'sales' | 'products' | 'inventory' | 'finance' | 'staff' | 'settings';
  isSensitive: boolean;
  requiresReason?: boolean;
}

export interface PermissionCategoryGroup {
  id: 'sales' | 'products' | 'inventory' | 'finance' | 'staff' | 'settings';
  title: string;
  iconName: string;
  permissions: PermissionDefinition[];
}

// -----------------------------------------------------------------------
// 2. Roles & Definitions (نظام الأدوار)
// -----------------------------------------------------------------------

export type SystemRoleType = 
  | 'admin'         // مدير النظام
  | 'supervisor'    // مشرف
  | 'cashier'       // كاشير
  | 'inventory'     // موظف مخزون
  | 'sales'         // موظف مبيعات
  | 'custom';       // دور مخصص ينشئه المدير

export interface SecurityRole {
  id: string;
  name: string;
  description: string;
  type: SystemRoleType;
  isSystem: boolean; // cannot be deleted
  color: string;
  maxDiscountPercent: number; // 0 to 100
  permissions: Record<PermissionKey, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------
// 3. User & Employee Identity (بيانات المستخدم والموظف والأمان)
// -----------------------------------------------------------------------

export type AccountStatus = 'active' | 'suspended';

export interface SecurityUser {
  id: string;
  name: string;
  code: string;                 // الرقم الوظيفي e.g. EMP-101
  phone?: string;
  roleId: string;               // معرف الدور
  roleName: string;             // اسم الدور
  pinHash: string;              // تشفير آمن لرمز الـ PIN
  salt: string;                 // ملح التشفير العشوائي
  status: AccountStatus;        // فعال / موقوف
  maxDiscountPercent: number;   // حد الخصم الأقصى المسموح لهذا الموظف
  customPermissions: Partial<Record<PermissionKey, boolean>>; // استثناءات خاصة بهذا الموظف (Overrides)
  allowedBranches: string[];    // الفروع المصرح للموظف العمل بها
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------
// 4. Authorization Context & Check Results (محرك فحص الصلاحيات)
// -----------------------------------------------------------------------

export interface PermissionCheckContext {
  discountPercent?: number;
  branchId?: string;
  invoiceId?: string;
  itemId?: string;
  amount?: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiresManagerApproval?: boolean;
  currentLimit?: number;
  requestedValue?: number;
  isSensitive?: boolean;
}

// -----------------------------------------------------------------------
// 5. Manager Approval & One-Time Tokens (نظام موافقة المدير المؤقتة)
// -----------------------------------------------------------------------

export interface ManagerApprovalRequest {
  id: string;
  action: PermissionKey;
  actionTitle: string;
  resourceDescription?: string;
  requiresReason: boolean;
  reasonPrompt?: string;
  context?: PermissionCheckContext;
  requestedByEmployeeId: string;
  requestedByEmployeeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  oneTimeToken?: string;
  expiresAt?: number; // ms timestamp
}

// -----------------------------------------------------------------------
// 6. Enterprise Audit Log (سجل التدقيق الأمني الشامل)
// -----------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  timestamp: string;            // ISO formatted timestamp
  timeFormatted: string;        // Human readable time e.g. 15:32:10
  dateFormatted: string;        // Human readable date e.g. 24/09/2026
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  action: PermissionKey | string;
  actionTitle: string;
  targetResource: string;       // e.g. "فاتورة #68214" or "صنف: برجر لحم دبل"
  branchId: string;
  device: string;               // e.g. "POS Terminal 1 (Browser)"
  requiresApproval: boolean;
  approvedBy?: string;          // اسم المدير الذي وافق بالـ PIN
  approvedByManagerId?: string;
  reason?: string;              // سبب تنفيذ العملية الحساسة
  status: 'success' | 'failed' | 'denied';
  details?: Record<string, any>;
}

// -----------------------------------------------------------------------
// 7. Soft Delete & Recycle Bin (الحذف الآمن وسلة المحذوفات)
// -----------------------------------------------------------------------

export type SoftDeleteRecordType = 'invoice' | 'menu_item' | 'employee' | 'table' | 'inventory_item';

export interface SoftDeleteRecord {
  id: string;
  recordType: SoftDeleteRecordType;
  recordTitle: string;
  recordIdentifier: string;     // e.g. invoice number or SKU
  data: any;                    // original item payload for recovery
  deletedAt: string;            // timestamp
  deletedByEmployeeId: string;
  deletedByEmployeeName: string;
  reason: string;
  canRestore: boolean;
}

// -----------------------------------------------------------------------
// 8. Permission Change History (سجل تغييرات الصلاحيات)
// -----------------------------------------------------------------------

export interface PermissionChangeLog {
  id: string;
  timestamp: string;
  managerName: string;
  targetEmployeeName: string;
  changeSummary: string;
  beforeState: string;
  afterState: string;
}
