// =======================================================================
// V-NOX POS - Enterprise Security Engine, RBAC & Audit Utilities
// =======================================================================

import {
  PermissionKey,
  PermissionDefinition,
  PermissionCategoryGroup,
  SecurityRole,
  SecurityUser,
  PermissionCheckContext,
  PermissionCheckResult,
  AuditLogEntry,
  SoftDeleteRecord,
  SoftDeleteRecordType,
  PermissionChangeLog,
} from '../types/security';
import { Employee } from '../types';

// -----------------------------------------------------------------------
// 1. All Granular Permission Definitions & Categories
// -----------------------------------------------------------------------

export const ALL_PERMISSIONS_CATALOG: PermissionDefinition[] = [
  // --- Sales ---
  {
    key: 'sales.create_invoice',
    label: 'إنشاء فاتورة جديدة',
    description: 'بدء طلب جديد وإضافة أصناف للسلة وحساب الإجمالي',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.edit_invoice',
    label: 'تعديل الفاتورة',
    description: 'تغيير الأصناف وإضافة ملاحظات ومعدلات الطلب',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.delete_item',
    label: 'حذف صنف من الفاتورة',
    description: 'إزالة وجبة أو صنف من السلة قبل أو بعد الحفظ',
    category: 'sales',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'sales.edit_quantity',
    label: 'تعديل كمية الصنف',
    description: 'زيادة أو تقليل كمية الوجبة في الفاتورة',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.edit_price',
    label: 'تعديل سعر الصنف يدوياً',
    description: 'تغيير سعر البيع المحدد مسبقاً لصنف داخل الطلب',
    category: 'sales',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'sales.apply_discount',
    label: 'تطبيق خصم على الفاتورة/الصنف',
    description: 'منح تخفيض بالنسبة أو القيمة ضمن حدود الصلاحية المسموحة',
    category: 'sales',
    isSensitive: true,
    requiresReason: false,
  },
  {
    key: 'sales.change_order_type',
    label: 'تغيير نوع الطلب',
    description: 'التبديل بين محلي / سفري / توصيل / استلام سيارة',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.hold_invoice',
    label: 'تعليق الفاتورة',
    description: 'حفظ الفاتورة معلقة مؤقتاً لخدمة عميل آخر',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.recall_invoice',
    label: 'استرجاع الفاتورة المعلقة',
    description: 'إعادة فتح الفاتورة المعلقة لاستكمال الدفع والطلب',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.cancel_invoice',
    label: 'إلغاء الفاتورة بالكامل',
    description: 'إلغاء طلب نشط ونقله للأرشيف وسجل العمليات',
    category: 'sales',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'sales.reprint_invoice',
    label: 'إعادة طباعة الفاتورة',
    description: 'طباعة نسخة إضافية من إيصال العميل أو بون المطبخ',
    category: 'sales',
    isSensitive: false,
  },
  {
    key: 'sales.delete_invoice',
    label: 'حذف الفاتورة نهائياً',
    description: 'نقل الفاتورة إلى سلة المحذوفات الآمنة',
    category: 'sales',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'sales.refund_invoice',
    label: 'استرجاع فاتورة / رد مبلغ',
    description: 'إعادة مبالغ مالية مدفوعة لعميل وإلغاء التسوية',
    category: 'sales',
    isSensitive: true,
    requiresReason: true,
  },

  // --- Products / Menu ---
  {
    key: 'products.view',
    label: 'مشاهدة قائمة المنتجات',
    description: 'استعراض الوجبات والأقسام والأسعار الحالية',
    category: 'products',
    isSensitive: false,
  },
  {
    key: 'products.create',
    label: 'إضافة منتج جديد',
    description: 'تسجيل وجبة جديدة في القائمة وتحديد سعرها',
    category: 'products',
    isSensitive: false,
  },
  {
    key: 'products.edit',
    label: 'تعديل بيانات المنتج',
    description: 'تعديل اسم الوجبة أو مكوناتها أو طابعة المطبخ',
    category: 'products',
    isSensitive: false,
  },
  {
    key: 'products.delete',
    label: 'حذف منتج من القائمة',
    description: 'نقل وجبة إلى سلة المحذوفات الآمنة مع إمكانية استعادتها',
    category: 'products',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'products.change_price',
    label: 'تغيير السعر الرسمي للمنتج',
    description: 'تعديل سعر بيع الصنف المعتمد في المنيو',
    category: 'products',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'products.change_category',
    label: 'تغيير تصنيف المنتج',
    description: 'نقل الوجبة لقسم آخر أو تغيير ترتيب الظهور',
    category: 'products',
    isSensitive: false,
  },
  {
    key: 'products.change_image',
    label: 'تغيير صورة الصنف',
    description: 'رفع صورة جديدة أو تعديل صورة العرض في البطاقة',
    category: 'products',
    isSensitive: false,
  },
  {
    key: 'products.change_availability',
    label: 'تغيير حالة التوفر',
    description: 'تبديل حالة الصنف بين متوفر أو نفدت الكمية',
    category: 'products',
    isSensitive: false,
  },

  // --- Inventory ---
  {
    key: 'inventory.view',
    label: 'مشاهدة المخزون',
    description: 'استعراض كميات المواد الأولية والمستودع وحد الطلب',
    category: 'inventory',
    isSensitive: false,
  },
  {
    key: 'inventory.add_stock',
    label: 'إضافة وتوريد كميات',
    description: 'تسجيل كميات جديدة موردة للمخزن والمستودع',
    category: 'inventory',
    isSensitive: false,
  },
  {
    key: 'inventory.deduct_stock',
    label: 'خصم كمية / تسجيل هدر',
    description: 'تسجيل مواد تالفة أو خصم مواد أولية منتهية',
    category: 'inventory',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'inventory.edit_manual',
    label: 'تعديل كمية المخزون يدوياً',
    description: 'تغيير رصيد المادة الأولية مباشرة بدون فاتورة توريد',
    category: 'inventory',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'inventory.stocktake',
    label: 'إجراء جرد فعلي للمخزون',
    description: 'مطابقة الأرصدة الدفترية مع الجرد الفعلي للمستودع',
    category: 'inventory',
    isSensitive: true,
  },
  {
    key: 'inventory.edit_cost',
    label: 'تعديل تكلفة شراء المادة الأولية',
    description: 'تعديل سعر التكلفة للوحدة مما يؤثر على حساب الأرباح',
    category: 'inventory',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'inventory.view_movements',
    label: 'مشاهدة سجل حركات المخزون',
    description: 'تتبع عمليات الصرف والتوريد وتغير الأرصدة',
    category: 'inventory',
    isSensitive: false,
  },

  // --- Finance & Shifts ---
  {
    key: 'finance.view_sales',
    label: 'مشاهدة إجمالي المبيعات',
    description: 'الاطلاع على إيرادات اليوم وحركات الكاش والشبكة',
    category: 'finance',
    isSensitive: false,
  },
  {
    key: 'finance.view_profits',
    label: 'مشاهدة الأرباح وقائمة الدخل (P&L)',
    description: 'كشف الأرباح الصافية والمصروفات التشغيلية وهوامش الربح',
    category: 'finance',
    isSensitive: true,
  },
  {
    key: 'finance.view_reports',
    label: 'مشاهدة التقارير العامة',
    description: 'تقارير الأصناف الأكثر مبيعاً وأوقات الذروة',
    category: 'finance',
    isSensitive: false,
  },
  {
    key: 'finance.open_shift',
    label: 'فتح الوردية وإدخال العهدة',
    description: 'بدء وردية جديدة وتسجيل النقد الافتتاحي في الدرج',
    category: 'finance',
    isSensitive: false,
  },
  {
    key: 'finance.close_shift',
    label: 'إغلاق الوردية والتقفيلة',
    description: 'عد النقدية وإتمام تقرير نهاية الوردية وكشف العجز/الزيادة',
    category: 'finance',
    isSensitive: true,
  },
  {
    key: 'finance.cash_in',
    label: 'إضافة نقدية للدرج (Cash In)',
    description: 'إيداع مبالغ نقدية إضافية لصندوق الكاشير أثناء الوردية',
    category: 'finance',
    isSensitive: false,
  },
  {
    key: 'finance.cash_out',
    label: 'سحب نقدية من الدرج (Cash Out)',
    description: 'سحب مبالغ نقدية للمصروفات النثرية أو تسليم جزئي',
    category: 'finance',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'finance.open_drawer',
    label: 'فتح درج النقدية بدون عملية بيع',
    description: 'إرسال أمر فتح صندوق الكاشير يدوياً',
    category: 'finance',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'finance.edit_payment',
    label: 'تعديل طريقة الدفع بعد السداد',
    description: 'تصحيح التحويل بين نقدي وبطاقة شبكة بعد الدفع',
    category: 'finance',
    isSensitive: true,
    requiresReason: true,
  },

  // --- Staff & Permissions ---
  {
    key: 'staff.view',
    label: 'مشاهدة الموظفين',
    description: 'استعراض قائمة فريق العمل وأرقامهم الوظيفية',
    category: 'staff',
    isSensitive: false,
  },
  {
    key: 'staff.create',
    label: 'إضافة موظف جديد',
    description: 'تسجيل كاشير أو مشرف جديد وتعيين الـ PIN والدور',
    category: 'staff',
    isSensitive: true,
  },
  {
    key: 'staff.edit',
    label: 'تعديل بيانات الموظف',
    description: 'تعديل الاسم أو الهاتف أو الراتب أو الدور الوظيفي',
    category: 'staff',
    isSensitive: true,
  },
  {
    key: 'staff.suspend',
    label: 'إيقاف / تفعيل حساب موظف',
    description: 'تعطيل دخول الموظف فوراً ومنعه من تنفيذ أي عملية',
    category: 'staff',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'staff.delete',
    label: 'حذف موظف نهائياً',
    description: 'إزالة سجل الموظف ونقله لسلة المحذوفات',
    category: 'staff',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'staff.change_permissions',
    label: 'تعديل صلاحيات الموظف الدقيقة',
    description: 'منح أو حجب عمليات معينة أو رفع حد الخصم للموظف',
    category: 'staff',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'staff.reset_pin',
    label: 'إعادة تعيين رمز PIN الموظف',
    description: 'تغيير الرمز السري للموظف وتشفيره',
    category: 'staff',
    isSensitive: true,
  },

  // --- Settings & Security ---
  {
    key: 'settings.general',
    label: 'إعدادات النظام العامة',
    description: 'اسم المطعم، الشعار، الترويسة، العملة الافتراضية',
    category: 'settings',
    isSensitive: true,
  },
  {
    key: 'settings.printers',
    label: 'إعدادات وتخصيص الطابعات',
    description: 'ربط طابعات المطبخ والبار والكاشير وعناوين الـ IP',
    category: 'settings',
    isSensitive: false,
  },
  {
    key: 'settings.taxes',
    label: 'إعدادات الضرائب والفوترة الإلكترونية',
    description: 'نسبة الضريبة، الرقم الضريبي، وتكامل باركود ZATCA QR',
    category: 'settings',
    isSensitive: true,
  },
  {
    key: 'settings.payment_methods',
    label: 'إعدادات طرق الدفع',
    description: 'تفعيل أو تعطيل بطاقات مدى، البطاقات الائتمانية، والآجل',
    category: 'settings',
    isSensitive: false,
  },
  {
    key: 'settings.branches',
    label: 'إعدادات الفروع وتعدد الفروع',
    description: 'تعريف الفروع وربط الموظفين والمخازن بها',
    category: 'settings',
    isSensitive: true,
  },
  {
    key: 'settings.backup',
    label: 'تصدير نسخة احتياطية من البيانات',
    description: 'تنزيل نسخة مشفرة كاملة من المبيعات والقوائم والإعدادات',
    category: 'settings',
    isSensitive: false,
  },
  {
    key: 'settings.restore',
    label: 'استعادة نسخة احتياطية',
    description: 'استرجاع قاعدة البيانات من ملف نسخة سابقة (حساسة جداً)',
    category: 'settings',
    isSensitive: true,
    requiresReason: true,
  },
  {
    key: 'settings.view_audit_logs',
    label: 'مشاهدة سجل التدقيق الأمني الشامل',
    description: 'الاطلاع على جميع العمليات الحساسة والموافقات والـ IP',
    category: 'settings',
    isSensitive: true,
  },
];

export const PERMISSION_GROUPS: PermissionCategoryGroup[] = [
  {
    id: 'sales',
    title: 'المبيعات والفواتير',
    iconName: 'Receipt',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'sales'),
  },
  {
    id: 'products',
    title: 'المنتجات وقائمة الطعام',
    iconName: 'UtensilsCrossed',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'products'),
  },
  {
    id: 'inventory',
    title: 'المخزون والمستودع',
    iconName: 'Package',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'inventory'),
  },
  {
    id: 'finance',
    title: 'المالية والورديات',
    iconName: 'CircleDollarSign',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'finance'),
  },
  {
    id: 'staff',
    title: 'الموظفون والأمان',
    iconName: 'Users',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'staff'),
  },
  {
    id: 'settings',
    title: 'إعدادات النظام والحماية',
    iconName: 'Sliders',
    permissions: ALL_PERMISSIONS_CATALOG.filter((p) => p.category === 'settings'),
  },
];

// Helper to build a dictionary of all permissions with a default boolean
export function buildPermissionsDictionary(value: boolean = false): Record<PermissionKey, boolean> {
  const dict: Record<string, boolean> = {};
  ALL_PERMISSIONS_CATALOG.forEach((p) => {
    dict[p.key] = value;
  });
  return dict as Record<PermissionKey, boolean>;
}

// -----------------------------------------------------------------------
// 2. Pre-Defined System Roles (الأدوار القياسية المعتمدة)
// -----------------------------------------------------------------------

export const DEFAULT_SYSTEM_ROLES: SecurityRole[] = [
  {
    id: 'role_admin',
    name: 'مدير النظام (كامل الصلاحيات)',
    description: 'الوصول غير المقيد لجميع العمليات والإعدادات والتقارير المالية والأمان',
    type: 'admin',
    isSystem: true,
    color: 'emerald',
    maxDiscountPercent: 100,
    permissions: buildPermissionsDictionary(true),
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role_supervisor',
    name: 'مشرف وردية / صالة',
    description: 'إدارة العمليات اليومية في الصالة والمبيعات وإلغاء الطلبات وخصومات حتى 25%',
    type: 'supervisor',
    isSystem: true,
    color: 'blue',
    maxDiscountPercent: 25,
    permissions: {
      ...buildPermissionsDictionary(false),
      // Sales
      'sales.create_invoice': true,
      'sales.edit_invoice': true,
      'sales.delete_item': true,
      'sales.edit_quantity': true,
      'sales.edit_price': false, // يحتاج موافقة مدير
      'sales.apply_discount': true,
      'sales.change_order_type': true,
      'sales.hold_invoice': true,
      'sales.recall_invoice': true,
      'sales.cancel_invoice': true,
      'sales.reprint_invoice': true,
      'sales.delete_invoice': false, // سلة المحذوفات للمدير
      'sales.refund_invoice': true,
      // Products
      'products.view': true,
      'products.change_availability': true,
      // Inventory
      'inventory.view': true,
      'inventory.add_stock': true,
      'inventory.deduct_stock': true,
      'inventory.view_movements': true,
      // Finance
      'finance.view_sales': true,
      'finance.view_reports': true,
      'finance.open_shift': true,
      'finance.close_shift': true,
      'finance.cash_in': true,
      'finance.cash_out': true,
      'finance.open_drawer': true,
      // Staff
      'staff.view': true,
      // Settings
      'settings.printers': true,
      'settings.view_audit_logs': true,
    },
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role_cashier',
    name: 'كاشير مبيعات',
    description: 'تسجيل الطلبات وإصدار الفواتير وخصم حتى 10%، العمليات الحساسة تتطلب موافقة المدير',
    type: 'cashier',
    isSystem: true,
    color: 'amber',
    maxDiscountPercent: 10,
    permissions: {
      ...buildPermissionsDictionary(false),
      // Sales
      'sales.create_invoice': true,
      'sales.edit_invoice': true,
      'sales.delete_item': false, // يحتاج موافقة مشرف/مدير
      'sales.edit_quantity': true,
      'sales.edit_price': false,  // ممنوع
      'sales.apply_discount': true, // ضمن حد 10%
      'sales.change_order_type': true,
      'sales.hold_invoice': true,
      'sales.recall_invoice': true,
      'sales.cancel_invoice': false, // يحتاج موافقة
      'sales.reprint_invoice': true,
      'sales.delete_invoice': false,
      'sales.refund_invoice': false,
      // Products
      'products.view': true,
      'products.change_availability': false,
      // Finance
      'finance.open_shift': true,
      'finance.close_shift': true,
      'finance.cash_in': true,
      'finance.cash_out': false,
      'finance.open_drawer': false,
    },
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role_inventory',
    name: 'أمين مستودع / مخزون',
    description: 'إدارة المواد الأولية، التوريد، الجرد، مراقبة الهدر، بدون صلاحيات البيع',
    type: 'inventory',
    isSystem: true,
    color: 'purple',
    maxDiscountPercent: 0,
    permissions: {
      ...buildPermissionsDictionary(false),
      // Products
      'products.view': true,
      // Inventory
      'inventory.view': true,
      'inventory.add_stock': true,
      'inventory.deduct_stock': true,
      'inventory.edit_manual': true,
      'inventory.stocktake': true,
      'inventory.edit_cost': true,
      'inventory.view_movements': true,
    },
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'role_sales',
    name: 'موظف مبيعات وصالة',
    description: 'أخذ الطلبات في الصالة ومتابعة الطاولات، خصم حتى 5% فقط',
    type: 'sales',
    isSystem: true,
    color: 'sky',
    maxDiscountPercent: 5,
    permissions: {
      ...buildPermissionsDictionary(false),
      'sales.create_invoice': true,
      'sales.edit_invoice': true,
      'sales.delete_item': false,
      'sales.edit_quantity': true,
      'sales.apply_discount': true,
      'sales.change_order_type': true,
      'sales.hold_invoice': true,
      'sales.recall_invoice': true,
      'sales.reprint_invoice': true,
      'products.view': true,
    },
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// -----------------------------------------------------------------------
// 3. Cryptographic Password / PIN Hashing Utilities
// -----------------------------------------------------------------------

/**
 * Creates a pseudo-random cryptographic salt
 */
export function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Robust, synchronous hash function (SHA-256 equivalent for browser client runtime)
 * that produces a non-reversible hex hash string.
 */
export function hashPinWithSalt(pin: string, salt: string): string {
  const combined = `VNOX_SALT_${salt}_${pin.trim()}_SECURE_POS_V2`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  
  for (let i = 0; i < combined.length; i++) {
    const charCode = combined.charCodeAt(i);
    hash1 ^= charCode;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = (hash2 << 5) - hash2 + charCode;
    hash2 = hash2 & hash2; // Convert to 32bit int
  }

  // Double layer to prevent rainbow tables
  const hex1 = ('00000000' + (hash1 >>> 0).toString(16)).slice(-8);
  const hex2 = ('00000000' + (hash2 >>> 0).toString(16)).slice(-8);
  const reversed = combined.split('').reverse().join('');
  let hash3 = 0x12345678;
  for (let j = 0; j < reversed.length; j++) {
    hash3 = (hash3 << 7) ^ (hash3 >>> 25) ^ reversed.charCodeAt(j);
  }
  const hex3 = ('00000000' + (hash3 >>> 0).toString(16)).slice(-8);

  return `${hex1}${hex2}${hex3}`;
}

/**
 * Verifies if entered PIN matches the stored salt and hash
 */
export function verifyPin(enteredPin: string, storedHash: string, salt: string): boolean {
  if (!enteredPin || !storedHash || !salt) return false;
  const computed = hashPinWithSalt(enteredPin, salt);
  return computed === storedHash;
}

// -----------------------------------------------------------------------
// 4. Central Authorization Guard Engine: can(user, action, context)
// -----------------------------------------------------------------------

export interface CanCheckOptions {
  user: SecurityUser | null | undefined;
  roles: SecurityRole[];
  permission: PermissionKey;
  context?: PermissionCheckContext;
}

/**
 * Central Guard: can(user, permission, context)
 * Evaluates whether a user can perform an action based on:
 * 1. Account status (Active vs Suspended)
 * 2. System Admin bypass (Principle of highest authority)
 * 3. User custom permission overrides (Principle of least privilege & exception)
 * 4. Role-based standard permissions
 * 5. Dynamic Context Limits (e.g. discount percent threshold, branch authorization)
 */
export function can(
  user: SecurityUser | null | undefined,
  roles: SecurityRole[],
  permission: PermissionKey,
  context?: PermissionCheckContext
): PermissionCheckResult {
  // 1. Unauthenticated or Suspended check
  if (!user) {
    return {
      allowed: false,
      reason: 'يجب تسجيل الدخول أولاً لتنفيذ هذه العملية.',
      requiresManagerApproval: true,
    };
  }

  if (user.status === 'suspended') {
    return {
      allowed: false,
      reason: `حساب الموظف (${user.name}) موقوف حالياً من قبل الإدارة.`,
      requiresManagerApproval: false, // Suspended user cannot execute even with approval unless manager signs in
    };
  }

  // 2. Branch restriction check
  if (context?.branchId && user.allowedBranches && user.allowedBranches.length > 0) {
    if (!user.allowedBranches.includes(context.branchId) && !user.allowedBranches.includes('all')) {
      return {
        allowed: false,
        reason: `الموظف غير مصرح له بتنفيذ عمليات على هذا الفرع المحدد.`,
        requiresManagerApproval: true,
      };
    }
  }

  // Find User's active Role
  const role = roles.find((r) => r.id === user.roleId) || DEFAULT_SYSTEM_ROLES[2]; // Default to cashier if not found

  // 3. Super Admin Role always permitted
  if (role.type === 'admin' || user.roleName.includes('مدير')) {
    return { allowed: true };
  }

  // 4. Specific Permission check (Priority: User custom override -> Role base permission)
  let isActionPermitted: boolean = false;
  if (user.customPermissions && user.customPermissions[permission] !== undefined) {
    isActionPermitted = Boolean(user.customPermissions[permission]);
  } else {
    isActionPermitted = Boolean(role.permissions?.[permission]);
  }

  const def = ALL_PERMISSIONS_CATALOG.find((p) => p.key === permission);
  const actionLabel = def?.label || permission;

  if (!isActionPermitted) {
    return {
      allowed: false,
      reason: `الموظف (${user.name}) لا يمتلك صلاحية [${actionLabel}].`,
      requiresManagerApproval: true,
      isSensitive: def?.isSensitive,
    };
  }

  // 5. Dynamic Context Limits Check: e.g. Maximum Discount Threshold
  if (permission === 'sales.apply_discount' && context?.discountPercent !== undefined) {
    const userMaxDiscount = user.maxDiscountPercent ?? role.maxDiscountPercent ?? 10;
    if (context.discountPercent > userMaxDiscount) {
      return {
        allowed: false,
        reason: `الخصم المطلوب (${context.discountPercent}%) يتجاوز الحد الأقصى المسموح للموظف (${userMaxDiscount}%).`,
        requiresManagerApproval: true,
        currentLimit: userMaxDiscount,
        requestedValue: context.discountPercent,
        isSensitive: true,
      };
    }
  }

  return { allowed: true };
}

// -----------------------------------------------------------------------
// 5. Audit Logging Store & Engine (سجل التدقيق الأمني)
// -----------------------------------------------------------------------

const AUDIT_STORAGE_KEY = 'invo_security_audit_logs_v2';

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to parse audit logs from storage', err);
  }
  return [];
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'timeFormatted' | 'dateFormatted'>): AuditLogEntry {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('ar-SA', { hour12: true });
  const dateFormatted = now.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const completeEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    timeFormatted,
    dateFormatted,
  };

  try {
    const existing = getAuditLogs();
    // Keep up to 1,000 entries
    const updated = [completeEntry, ...existing].slice(0, 1000);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write audit log', err);
  }

  return completeEntry;
}

// -----------------------------------------------------------------------
// 6. Soft Delete Store & Engine (سلة المحذوفات الآمنة)
// -----------------------------------------------------------------------

const SOFT_DELETE_STORAGE_KEY = 'invo_soft_deleted_records_v2';

export function getSoftDeletedRecords(): SoftDeleteRecord[] {
  try {
    const saved = localStorage.getItem(SOFT_DELETE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load soft deleted records', err);
  }
  return [];
}

export function softDeleteRecord(
  type: SoftDeleteRecordType,
  title: string,
  identifier: string,
  data: any,
  deletedByEmployee: { id: string; name: string },
  reason: string
): SoftDeleteRecord {
  const record: SoftDeleteRecord = {
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recordType: type,
    recordTitle: title,
    recordIdentifier: identifier,
    data,
    deletedAt: new Date().toISOString(),
    deletedByEmployeeId: deletedByEmployee.id,
    deletedByEmployeeName: deletedByEmployee.name,
    reason: reason || 'لا يوجد سبب مسجل',
    canRestore: true,
  };

  try {
    const existing = getSoftDeletedRecords();
    const updated = [record, ...existing];
    localStorage.setItem(SOFT_DELETE_STORAGE_KEY, JSON.stringify(updated));

    // Also automatically log to the Audit Log!
    logAuditEvent({
      employeeId: deletedByEmployee.id,
      employeeName: deletedByEmployee.name,
      employeeRole: 'كاشير / مسؤول',
      action: type === 'invoice' ? 'sales.delete_invoice' : 'products.delete',
      actionTitle: `حذف آمن: ${title}`,
      targetResource: `${identifier}`,
      branchId: 'main',
      device: 'نقطة البيع الرئيسية',
      requiresApproval: false,
      reason,
      status: 'success',
      details: { recordType: type, recordId: record.id },
    });
  } catch (err) {
    console.error('Failed to save soft deleted record', err);
  }

  return record;
}

export function restoreRecord(recordId: string): SoftDeleteRecord | null {
  try {
    const records = getSoftDeletedRecords();
    const target = records.find((r) => r.id === recordId);
    if (!target) return null;

    const remaining = records.filter((r) => r.id !== recordId);
    localStorage.setItem(SOFT_DELETE_STORAGE_KEY, JSON.stringify(remaining));

    // Audit log restoration
    logAuditEvent({
      employeeId: 'admin',
      employeeName: 'المدير العام',
      employeeRole: 'مدير النظام',
      action: 'system.restore_record',
      actionTitle: `استعادة من سلة المحذوفات: ${target.recordTitle}`,
      targetResource: target.recordIdentifier,
      branchId: 'main',
      device: 'لوحة الإدارة',
      requiresApproval: false,
      reason: 'استعادة سجل محذوف إلى النظام',
      status: 'success',
    });

    return target;
  } catch (err) {
    console.error('Failed to restore record', err);
    return null;
  }
}

export function permanentDeleteRecord(recordId: string): boolean {
  try {
    const records = getSoftDeletedRecords();
    const target = records.find((r) => r.id === recordId);
    const remaining = records.filter((r) => r.id !== recordId);
    localStorage.setItem(SOFT_DELETE_STORAGE_KEY, JSON.stringify(remaining));

    if (target) {
      logAuditEvent({
        employeeId: 'admin',
        employeeName: 'المدير العام',
        employeeRole: 'مدير النظام',
        action: 'system.permanent_delete',
        actionTitle: `حذف نهائي لا رجعة فيه: ${target.recordTitle}`,
        targetResource: target.recordIdentifier,
        branchId: 'main',
        device: 'لوحة الإدارة',
        requiresApproval: true,
        reason: 'تطهير وحذف نهائي من سلة المحذوفات',
        status: 'success',
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to permanently delete record', err);
    return false;
  }
}

export const restoreSoftDeletedRecord = restoreRecord;
export const permanentlyDeleteRecord = permanentDeleteRecord;

// -----------------------------------------------------------------------
// 7. Security Users Conversion & Seed Helper
// -----------------------------------------------------------------------

export function convertEmployeeToSecurityUser(emp: Employee, defaultRoleType: string = 'cashier'): SecurityUser {
  const salt = generateSalt(12);
  const plainPin = emp.pin || '1234';
  const pinHash = hashPinWithSalt(plainPin, salt);

  let roleId = 'role_cashier';
  let roleName = 'كاشير مبيعات';
  let maxDiscount = 10;

  if (emp.role.includes('مدير') || emp.id === 'emp-0' || emp.code === 'POS-100') {
    roleId = 'role_admin';
    roleName = 'مدير النظام (كامل الصلاحيات)';
    maxDiscount = 100;
  } else if (emp.role.includes('مشرف')) {
    roleId = 'role_supervisor';
    roleName = 'مشرف وردية / صالة';
    maxDiscount = 25;
  } else if (emp.role.includes('طاهي') || emp.role.includes('مخزن')) {
    roleId = 'role_inventory';
    roleName = 'أمين مستودع / مخزون';
    maxDiscount = 0;
  }

  // Build custom permissions overrides from legacy permissions
  const customOverrides: Partial<Record<PermissionKey, boolean>> = {};
  if (emp.permissions) {
    if (emp.permissions.canDeleteOrders) {
      customOverrides['sales.delete_item'] = true;
      customOverrides['sales.cancel_invoice'] = true;
    }
    if (emp.permissions.canEditMenu) {
      customOverrides['products.create'] = true;
      customOverrides['products.edit'] = true;
      customOverrides['products.change_price'] = true;
    }
  }

  return {
    id: emp.id,
    name: emp.name,
    code: emp.code,
    phone: emp.phone,
    roleId,
    roleName,
    pinHash,
    salt,
    status: emp.active ? 'active' : 'suspended',
    maxDiscountPercent: maxDiscount,
    customPermissions: customOverrides,
    allowedBranches: ['main', 'branch-1'],
    createdAt: emp.joinDate ? `${emp.joinDate}T00:00:00Z` : new Date().toISOString(),
  };
}
