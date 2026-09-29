import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  Printer, 
  TrendingUp, 
  ShoppingBag, 
  UserPlus, 
  Key, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Layers, 
  Lock, 
  FileText,
  CreditCard,
  Banknote,
  Receipt,
  Clock,
  Calendar,
  Eye,
  Sliders,
  Check,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  ChefHat,
  QrCode,
  Smartphone,
  Bike,
  Award,
  Cloud,
  Store,
  Building,
  Phone,
  MapPin,
  Sparkles,
  Shield,
  KeyRound,
  Globe,
  Percent,
  Save,
  UtensilsCrossed,
  LayoutGrid,
  Tag,
  Palette,
  Image,
  Link,
  ExternalLink,
  Copy,
  Share2,
  ShieldCheck,
  LineChart,
  Truck,
  Scale
} from 'lucide-react';
import { 
  POSSettings, 
  Employee, 
  PurchaseInvoice, 
  InventoryItem, 
  EmployeeAdvance, 
  PrinterConfig, 
  Order, 
  CashierSession,
  RestaurantSection,
  RestaurantTable,
  RolePermissions
} from '../types';
import { posAudio } from '../utils/audio';
import { ThermalPrintersSettings } from './ThermalPrintersSettings';
import { generateSalt, hashPinWithSalt } from '../utils/security';
import { SellerAccountStatementModal } from './SellerAccountStatementModal';
import { KitchenDisplaySystemModal } from './KitchenDisplaySystemModal';
import { ZatcaQRCodeModal } from './ZatcaQRCodeModal';
import { TableQRMenuModal } from './TableQRMenuModal';
import { DeliveryFleetModal } from './DeliveryFleetModal';
import { LoyaltyAndCouponsModal } from './LoyaltyAndCouponsModal';
import { MultiDeviceSyncModal } from './MultiDeviceSyncModal';
import { TableAndRoomManagerModal } from './TableAndRoomManagerModal';
import { DeletedOrdersScreen } from './DeletedOrdersScreen';
import { MenuItemsMap, MenuItemData } from './MenuManagerModal';
import { ProfitLossModal } from './ProfitLossModal';
import { DeliveryAggregatorsModal } from './DeliveryAggregatorsModal';
import { RecipeManagerModal } from './RecipeManagerModal';
import { InvoOrder, INVO_CATEGORIES, INVO_MENU_ITEMS } from '../data/invoData';

export type AdminSection = 
  | 'overview'
  | 'store_info'          // 0. بيانات ومعلومات المحل
  | 'menu_manager'        // 1. إدارة وتعديل قائمة الطعام والوجبات والأسعار
  | 'table_room_manager'  // 2. إدارة الصالات والغرف والطاولات و QR
  | 'deleted_orders'      // 3. سجل المحذوفات والفواتير الملغية
  | 'worker_pins'         // 4. كلمات السر والصلاحيات
  | 'shifts'              // 5. التقفيلات وجرد الوردية
  | 'printing'            // 6. الطباعة وإعدادات الطابعات
  | 'all_sales'           // 7. المبيعات كاملة
  | 'seller_statement'    // 8. كشف حساب ومبيعات البائعين
  | 'purchases'           // 9. المشتريات والموردين
  | 'add_workers'         // 10. إضافة العمال
  | 'inventory'           // 11. المخزون والمستودع
  | 'advances'            // 12. سحبيات الموظفين
  | 'kds'                 // 13. شاشة المطبخ KDS
  | 'zatca_qr'            // 14. الفاتورة الإلكترونية والباركود
  | 'table_qr'            // 15. منيو الطاولة الرقمي QR
  | 'delivery_fleet'      // 16. أسطول السائقين والتوصيل
  | 'loyalty_coupons'     // 17. ولاء العملاء والكوبونات
  | 'cloud_sync'          // 18. الربط والمزامنة السحابية
  | 'profit_loss'         // 19. الأرباح والخسائر والتحليل المالي (P&L)
  | 'delivery_aggregators'// 20. منصات وتطبيقات التوصيل (جاهز، هنقرستيشن، مرسول...)
  | 'recipes_bom'         // 21. الوصفات وتكاليف الوجبات BOM وخصم المستودع
  | 'security_hub';       // 22. نظام الأمان وإدارة الصلاحيات المتطور

interface AdminMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: AdminSection;
  settings: POSSettings;
  onUpdateSettings: (newSettings: Partial<POSSettings>) => void;
  orders: Order[];
  cashier: CashierSession;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  purchases: PurchaseInvoice[];
  onUpdatePurchases: (purchases: PurchaseInvoice[]) => void;
  inventory: InventoryItem[];
  onUpdateInventory: (inventory: InventoryItem[]) => void;
  advances: EmployeeAdvance[];
  onUpdateAdvances: (advances: EmployeeAdvance[]) => void;
  printerConfig: PrinterConfig;
  onUpdatePrinterConfig: (config: Partial<PrinterConfig>) => void;
  onOpenShiftModal: () => void;
  onOpenSecurityHub?: () => void;
  settledOrders?: InvoOrder[];
  menuItemsMap?: MenuItemsMap;
  onSaveMenuItemsMap?: (newMap: MenuItemsMap) => void;
  sections?: RestaurantSection[];
  tables?: RestaurantTable[];
  onSaveSections?: (newSections: RestaurantSection[]) => void;
  onSaveTables?: (newTables: RestaurantTable[]) => void;
  deletedOrders?: InvoOrder[];
  onRestoreDeletedOrder?: (order: InvoOrder) => void;
  onPermanentlyDeleteOrder?: (orderId: string) => void;
  onClearAllDeleted?: () => void;
}

export const AdminMenuModal: React.FC<AdminMenuModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview',
  settings,
  onUpdateSettings,
  orders,
  cashier,
  employees,
  onUpdateEmployees,
  purchases,
  onUpdatePurchases,
  inventory,
  onUpdateInventory,
  advances,
  onUpdateAdvances,
  printerConfig,
  onUpdatePrinterConfig,
  onOpenShiftModal,
  onOpenSecurityHub,
  settledOrders = [],
  menuItemsMap = INVO_MENU_ITEMS,
  onSaveMenuItemsMap,
  sections = [],
  tables = [],
  onSaveSections,
  onSaveTables,
  deletedOrders = [],
  onRestoreDeletedOrder,
  onPermanentlyDeleteOrder,
  onClearAllDeleted,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  // -------------------------
  // 0. Store Profile & Info state
  // -------------------------
  const [storeName, setStoreName] = useState<string>(settings.restaurantName || 'مطعم مذاق الشام والأصيل');
  const [storeBranch, setStoreBranch] = useState<string>(settings.restaurantBranch || 'الفرع الرئيسي');
  const [storePhone, setStorePhone] = useState<string>(settings.restaurantPhone || '+966 55 112 2334');
  const [storeAddress, setStoreAddress] = useState<string>(settings.restaurantAddress || 'طريق الملك فهد - الرياض');
  const [storeTaxNumber, setStoreTaxNumber] = useState<string>(settings.taxNumber || '310458921400003');
  const [storeCommercialRegister, setStoreCommercialRegister] = useState<string>(settings.commercialRegister || '1010784920');
  const [storeCurrency, setStoreCurrency] = useState<string>(settings.currency || 'ر.س');
  const [storeVatRate, setStoreVatRate] = useState<string>((settings.vatRate ? settings.vatRate * 100 : 15).toString());
  const [storeReceiptHeader, setStoreReceiptHeader] = useState<string>(settings.receiptHeader || 'أهلاً وسهلاً بكم في مطعم مذاق الشام والأصيل');
  const [storeReceiptFooter, setStoreReceiptFooter] = useState<string>(settings.receiptFooter || 'شكراً لزيارتكم ونتشرف بخدمتكم دائماً');
  const [storeSoundEnabled, setStoreSoundEnabled] = useState<boolean>(settings.soundEnabled ?? true);
  const [storeHidePrices, setStoreHidePrices] = useState<boolean>(settings.hidePricesOnMealButtons ?? false);
  const [storeRequirePin, setStoreRequirePin] = useState<boolean>(settings.requirePinForOrderType ?? true);

  // -------------------------
  // 1. Menu Items Management state (إدارة وتعديل قائمة الطعام والوجبات)
  // -------------------------
  const [menuActiveCategory, setMenuActiveCategory] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');
  const [isMealModalOpen, setIsMealModalOpen] = useState<boolean>(false);
  const [editingMealItem, setEditingMealItem] = useState<MenuItemData | null>(null);
  const [mealCategory, setMealCategory] = useState<string>(INVO_CATEGORIES[0]?.id || 'chicken');
  const [mealName, setMealName] = useState<string>('');
  const [mealPrice, setMealPrice] = useState<string>('1.500');
  const [mealBorderColor, setMealBorderColor] = useState<string>('border-rose-500');
  const [mealPrinter, setMealPrinter] = useState<string>('prn-kitchen');
  const [mealImage, setMealImage] = useState<string>('');
  const [mealDescription, setMealDescription] = useState<string>('');
  const [mealIsAvailable, setMealIsAvailable] = useState<boolean>(true);
  const [mealError, setMealError] = useState<string>('');

  // -------------------------
  // 3. Sales state
  // -------------------------
  const [salesSearch, setSalesSearch] = useState<string>('');
  const [salesTypeFilter, setSalesTypeFilter] = useState<string>('all');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState<string>('all');

  // -------------------------
  // 4. Purchases state
  // -------------------------
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState<boolean>(false);
  const [newSupplier, setNewSupplier] = useState<string>('');
  const [newPurchaseItems, setNewPurchaseItems] = useState<string>('');
  const [newPurchaseTotal, setNewPurchaseTotal] = useState<string>('');
  const [newPurchasePayment, setNewPurchasePayment] = useState<'نقدي' | 'تحويل بنكي' | 'آجل'>('نقدي');

  // -------------------------
  // 5. Add Workers state
  // -------------------------
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpCode, setNewEmpCode] = useState<string>('');
  const [newEmpPhone, setNewEmpPhone] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<Employee['role']>('كاشير رئيسي');
  const [newEmpSalary, setNewEmpSalary] = useState<string>('4500');
  const [newEmpPin, setNewEmpPin] = useState<string>('1234');

  // -------------------------
  // 6. Worker PINs & Permissions state
  // -------------------------
  const [adminPinInput, setAdminPinInput] = useState<string>(settings.adminPin || '1234');
  const [editingEmpPinId, setEditingEmpPinId] = useState<string | null>(null);
  const [tempEmpPin, setTempEmpPin] = useState<string>('');
  const [pinTestInput, setPinTestInput] = useState<string>('');
  const [editingPermissionsEmp, setEditingPermissionsEmp] = useState<Employee | null>(null);

  // -------------------------
  // 7. Inventory state
  // -------------------------
  const [invSearch, setInvSearch] = useState<string>('');
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');
  const [showAddInvModal, setShowAddInvModal] = useState<boolean>(false);
  const [newInvName, setNewInvName] = useState<string>('');
  const [newInvSku, setNewInvSku] = useState<string>('');
  const [newInvCategory, setNewInvCategory] = useState<InventoryItem['category']>('لحوم ودواجن');
  const [newInvStock, setNewInvStock] = useState<string>('10');
  const [newInvMinStock, setNewInvMinStock] = useState<string>('5');
  const [newInvUnit, setNewInvUnit] = useState<InventoryItem['unit']>('كجم');
  const [newInvCost, setNewInvCost] = useState<string>('25');

  // -------------------------
  // 8. Employee Advances state
  // -------------------------
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState<boolean>(false);
  const [advEmpId, setAdvEmpId] = useState<string>(employees[0]?.id || '');
  const [advAmount, setAdvAmount] = useState<string>('');
  const [advReason, setAdvReason] = useState<string>('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Menu items count
  const totalMealsCount = Object.values(menuItemsMap).reduce((acc, list) => acc + list.length, 0);

  // Categorized Admin Cards
  const adminMenuItems = [
    {
      id: 'menu_manager' as AdminSection,
      num: '1',
      title: 'إدارة وتعديل قائمة الطعام والوجبات',
      desc: 'تعديل أسعار وأسماء الوجبات، إضافة وجبات وأصناف جديدة، وتعيين طابعات المطبخ',
      icon: UtensilsCrossed,
      color: 'from-blue-600 to-indigo-700',
      badge: `${totalMealsCount} وجبة مسجلة`,
    },
    {
      id: 'table_room_manager' as AdminSection,
      num: '2',
      title: 'إدارة الصالات والغرف والطاولات',
      desc: 'تخصيص الصالات والغرف، إضافة طاولات، وتوليد باركود QR للطلب الذاتي',
      icon: LayoutGrid,
      color: 'from-teal-600 to-emerald-700',
      badge: `${tables.length || 0} طاولة`,
    },
    {
      id: 'deleted_orders' as AdminSection,
      num: '3',
      title: 'سجل المحذوفات والفواتير الملغية',
      desc: 'أرشيف وتوثيق الفواتير المحذوفة مع توضيح سبب الحذف واسم الموظف وإمكانية الاسترجاع',
      icon: Trash2,
      color: 'from-rose-600 to-red-700',
      badge: `${deletedOrders.length || 0} محذوف`,
    },
    {
      id: 'store_info' as AdminSection,
      num: '★',
      title: 'بيانات ومعلومات المحل والإعدادات',
      desc: 'اسم المحل والفرع، الرقم الضريبي، السجل، أرقام التواصل، والترويسة',
      icon: Store,
      color: 'from-amber-500 to-amber-600',
      badge: 'البيانات الأساسية',
    },
    {
      id: 'security_hub' as AdminSection,
      num: '🛡️',
      title: 'نظام الأمان وإدارة الصلاحيات المتطور',
      desc: 'صلاحيات دقيقة لكل موظف، سجل تدقيق حي Audit Trail، سلة المحذوفات Soft Delete، وموافقات المدير المؤقتة',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      badge: 'نظام أمان V2',
    },
    {
      id: 'worker_pins' as AdminSection,
      num: '🔑',
      title: 'كلمات السر والصلاحيات',
      desc: 'إضافة وتعديل رموز PIN للموظفين، تعيين رمز المدير العام Master PIN',
      icon: Key,
      color: 'from-rose-600 to-rose-700',
      badge: 'إدارة كلمات السر',
    },
    {
      id: 'shifts' as AdminSection,
      num: '4',
      title: 'التقفيلات وجرد الوردية',
      desc: 'تسوية الصندوق، جرد النقدية، فروقات الدرج، وطباعة Z-Report',
      icon: Receipt,
      color: 'from-amber-600 to-amber-700',
      badge: 'الوردية الحالية',
    },
    {
      id: 'printing' as AdminSection,
      num: '5',
      title: 'إعدادات واختبار الطباعة',
      desc: 'اختبار الطابعات الحرارية، طابعة المطبخ، وحجم الورق 80mm/58mm',
      icon: Printer,
      color: 'from-blue-600 to-blue-700',
      badge: settings.printerConnected ? 'متصل' : 'غير متصل',
    },
    {
      id: 'all_sales' as AdminSection,
      num: '6',
      title: 'المبيعات كاملة والتقارير',
      desc: 'سجل الفواتير التفصيلي، مبيعات القنوات، والتحليلات الضريبية',
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-700',
      badge: `${orders.length} طلب`,
    },
    {
      id: 'seller_statement' as AdminSection,
      num: '7',
      title: 'كشف حساب ومبيعات البائعين',
      desc: 'كشف حساب تفصيلي بالحبّة والإجمالي لكل بائع، مبيعات اليوم والشهر، وسجل الفواتير',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-amber-700',
      badge: `${employees.length} بائع`,
    },
    {
      id: 'purchases' as AdminSection,
      num: '8',
      title: 'المشتريات والموردين',
      desc: 'فواتير الموردين، المواد الأولية، وحساب التكاليف والمصروفات',
      icon: ShoppingBag,
      color: 'from-violet-600 to-violet-700',
      badge: `${purchases.length} فاتورة`,
    },
    {
      id: 'add_workers' as AdminSection,
      num: '9',
      title: 'إضافة وإدارة العمال',
      desc: 'سجل الموظفين، الأدوار والصلاحيات، الأرقام الوظيفية والرواتب',
      icon: UserPlus,
      color: 'from-cyan-600 to-cyan-700',
      badge: `${employees.length} موظف`,
    },
    {
      id: 'inventory' as AdminSection,
      num: '10',
      title: 'المخزون والمستودع',
      desc: 'متابعة كميات المواد الخام، تنبيهات النواقص، وتكلفة الوحدات',
      icon: Package,
      color: 'from-indigo-600 to-indigo-700',
      badge: `${inventory.filter(i => i.currentStock <= i.minStock).length} نواقص`,
    },
    {
      id: 'advances' as AdminSection,
      num: '11',
      title: 'سحبيات وسلف الموظفين',
      desc: 'تسجيل السلف المالية، استقطاعات الراتب، وحركات العهد',
      icon: DollarSign,
      color: 'from-teal-600 to-teal-700',
      badge: `${advances.length} حركة`,
    },
    {
      id: 'kds' as AdminSection,
      num: '12',
      title: 'شاشة المطبخ والتحضير (KDS)',
      desc: 'نظام شاشات الطهاة، تذاكر الطلبات، التنبيهات الصوتية، وأوقات التحضير',
      icon: ChefHat,
      color: 'from-orange-600 to-amber-700',
      badge: 'Live KDS',
    },
    {
      id: 'zatca_qr' as AdminSection,
      num: '13',
      title: 'الفاتورة الإلكترونية والباركود (ZATCA)',
      desc: 'ترميز TLV Base64، رمز الاستجابة السريعة، وتكامل قارئ الباركود',
      icon: QrCode,
      color: 'from-emerald-600 to-teal-700',
      badge: 'المرحلة 2',
    },
    {
      id: 'table_qr' as AdminSection,
      num: '14',
      title: 'المنيو الرقمي وطلب الطاولة (QR)',
      desc: 'توليد بطاقات QR لكل طاولة، ومحاكي طلب العميل المباشر من الجوال',
      icon: Smartphone,
      color: 'from-indigo-600 to-purple-700',
      badge: 'طلب ذاتي',
    },
    {
      id: 'delivery_fleet' as AdminSection,
      num: '15',
      title: 'أسطول السائقين والتوصيل الخارجي',
      desc: 'سجل السائقين، تتبع المشاوير، وتصفية العهد النقدية المحصلة من الزبائن',
      icon: Bike,
      color: 'from-amber-600 to-orange-700',
      badge: 'سائقين وعهد',
    },
    {
      id: 'loyalty_coupons' as AdminSection,
      num: '16',
      title: 'برنامج ولاء العملاء والكوبونات',
      desc: 'دليل الزبائن، تجميع واستبدال النقاط، وإنشاء قسائم وأكواد الخصم الترويجية',
      icon: Award,
      color: 'from-pink-600 to-rose-700',
      badge: 'نقاط وكوبونات',
    },
    {
      id: 'cloud_sync' as AdminSection,
      num: '17',
      title: 'الربط السحابي ومزامنة الأجهزة',
      desc: 'شبكة الأجهزة المتصلة (الكاشير، تابلت الويتر، المطبخ)، والنسخ الاحتياطي',
      icon: Cloud,
      color: 'from-cyan-600 to-blue-700',
      badge: 'Realtime Mesh',
    },
    {
      id: 'profit_loss' as AdminSection,
      num: '18',
      title: 'تقرير الأرباح والخسائر والتحليل المالي (P&L)',
      desc: 'حساب صافي الأرباح، تكلفة البضاعة المباعة COGS، المصاريف التشغيلية، ومجمل الربح',
      icon: LineChart,
      color: 'from-emerald-600 to-teal-700',
      badge: 'صافي الأرباح COGS',
    },
    {
      id: 'delivery_aggregators' as AdminSection,
      num: '19',
      title: 'منصات وتطبيقات التوصيل (Aggregators)',
      desc: 'إدارة وتكامل طلبات تطبيقات جاهز، هنقرستيشن، مرسول، كيتا، وتويو والعمولات',
      icon: Truck,
      color: 'from-amber-500 to-orange-600',
      badge: 'جاهز وهنقرستيشن',
    },
    {
      id: 'recipes_bom' as AdminSection,
      num: '20',
      title: 'معايير الوصفات ومقادير الوجبات (Recipes BOM)',
      desc: 'ربط الوجبات بالمخزون، تحديد مقادير الطهي، وحساب تكلفة الوجبة الغذائية بدقة',
      icon: ChefHat,
      color: 'from-indigo-600 to-purple-700',
      badge: 'خصم آلي للمستودع',
    },
    {
      id: 'security_hub' as AdminSection,
      num: '21',
      title: 'إدارة الصلاحيات والأمان المتقدم (RBAC)',
      desc: 'تشفير PINs، التحكم في 49 صلاحية دقيقة لكل موظف، حدود الخصم، وسجل التدقيق الحي',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      badge: 'نظام الأمان الكامل',
    },
  ];

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSaveStoreProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const vatRateNum = (parseFloat(storeVatRate) || 15) / 100;
    onUpdateSettings({
      restaurantName: storeName.trim() || 'مطعم مذاق الشام والأصيل',
      restaurantBranch: storeBranch.trim() || 'الفرع الرئيسي',
      restaurantPhone: storePhone.trim(),
      restaurantAddress: storeAddress.trim(),
      taxNumber: storeTaxNumber.trim(),
      commercialRegister: storeCommercialRegister.trim(),
      currency: storeCurrency.trim() || 'ر.س',
      vatRate: vatRateNum,
      receiptHeader: storeReceiptHeader.trim(),
      receiptFooter: storeReceiptFooter.trim(),
      soundEnabled: storeSoundEnabled,
      hidePricesOnMealButtons: storeHidePrices,
      requirePinForOrderType: storeRequirePin,
    });
    posAudio.playSuccess();
    showToast('تم حفظ وتحديث بيانات المحل والإعدادات بنجاح!');
  };

  const handleSaveAdminPin = () => {
    if (!adminPinInput || adminPinInput.length < 4) {
      alert('رمز الإدارة يجب ألا يقل عن 4 أرقام');
      return;
    }
    onUpdateSettings({ adminPin: adminPinInput });
    posAudio.playSuccess();
    showToast('تم تحديث رمز المدير العام Master PIN بنجاح!');
  };

  const handleUpdateEmpPin = (empId: string) => {
    if (!tempEmpPin || tempEmpPin.length < 3) {
      alert('رمز الدخول يجب أن يكون 3 أرقام على الأقل');
      return;
    }
    const cleanPin = tempEmpPin.trim();
    const salt = generateSalt(12);
    const pinHash = hashPinWithSalt(cleanPin, salt);
    const updated = employees.map(e => e.id === empId ? { ...e, pin: cleanPin, pinHash, salt } : e);
    onUpdateEmployees(updated);
    setEditingEmpPinId(null);
    setTempEmpPin('');
    posAudio.playSuccess();
    showToast('تم تحديث كلمة سر / PIN الموظف بنجاح!');
  };

  const handleToggleEmpPermission = (empId: string, permissionKey: keyof RolePermissions) => {
    const updated = employees.map(e => {
      if (e.id !== empId) return e;
      const currentPerms = e.permissions || {
        canEditMenu: false,
        canManageTables: false,
        canDeleteOrders: false,
        canViewReports: false,
        canCloseShift: false,
        canManageWorkers: false,
        canManageSettings: false,
      };
      const newPerms: RolePermissions = {
        ...currentPerms,
        [permissionKey]: !currentPerms[permissionKey],
      };
      return { ...e, permissions: newPerms };
    });
    onUpdateEmployees(updated);
    if (editingPermissionsEmp && editingPermissionsEmp.id === empId) {
      const found = updated.find(e => e.id === empId);
      if (found) setEditingPermissionsEmp(found);
    }
    posAudio.playTap();
    showToast('تم تحديث صلاحيات الموظف بنجاح');
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    const cleanPin = (newEmpPin || '1234').trim();
    const salt = generateSalt(12);
    const pinHash = hashPinWithSalt(cleanPin, salt);
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpName.trim(),
      code: newEmpCode.trim() || `POS-${Math.floor(100 + Math.random() * 900)}`,
      role: newEmpRole,
      phone: newEmpPhone.trim() || '05XXXXXXXX',
      pin: cleanPin,
      pinHash,
      salt,
      salary: parseFloat(newEmpSalary) || 4000,
      active: true,
      joinDate: new Date().toISOString().split('T')[0],
    };
    onUpdateEmployees([...employees, newEmp]);
    setShowAddEmployeeModal(false);
    setNewEmpName('');
    setNewEmpCode('');
    setNewEmpPhone('');
    setNewEmpPin('1234');
    posAudio.playSuccess();
    showToast('تم إضافة الموظف وكلمة السر بنجاح!');
  };

  const handleAddNewPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(newPurchaseTotal);
    if (!newSupplier || isNaN(tot) || tot <= 0) return;
    const tax = Math.round(tot * 0.15 * 100) / 100;
    const newPur: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNumber: `INV-PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: newSupplier,
      date: new Date().toISOString().split('T')[0],
      itemsSummary: newPurchaseItems || 'مستلزمات مطعم ومواد خام',
      total: tot,
      tax: tax,
      paymentMethod: newPurchasePayment,
      status: 'مدفوع',
    };
    onUpdatePurchases([newPur, ...purchases]);
    setShowAddPurchaseModal(false);
    setNewSupplier('');
    setNewPurchaseItems('');
    setNewPurchaseTotal('');
    posAudio.playSuccess();
    showToast('تم تسجيل فاتورة المشتريات بنجاح!');
  };

  const handleAddNewInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newInvName.trim(),
      sku: newInvSku.trim() || `RAW-${Math.floor(100 + Math.random() * 900)}`,
      category: newInvCategory,
      currentStock: parseFloat(newInvStock) || 0,
      minStock: parseFloat(newInvMinStock) || 5,
      unit: newInvUnit,
      unitCost: parseFloat(newInvCost) || 10,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    onUpdateInventory([...inventory, newItem]);
    setShowAddInvModal(false);
    setNewInvName('');
    setNewInvSku('');
    posAudio.playSuccess();
    showToast('تم إضافة الصنف للمخزون بنجاح!');
  };

  const handleAddNewAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(advAmount);
    if (!advEmpId || isNaN(amt) || amt <= 0) return;
    const emp = employees.find(e => e.id === advEmpId);
    const newAdv: EmployeeAdvance = {
      id: `adv-${Date.now()}`,
      employeeId: advEmpId,
      employeeName: emp ? emp.name : 'موظف',
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      reason: advReason || 'سلفة مقدمة على الراتب',
      status: 'تم الصرف',
      approvedBy: cashier.cashierName,
    };
    onUpdateAdvances([newAdv, ...advances]);
    setShowAddAdvanceModal(false);
    setAdvAmount('');
    setAdvReason('');
    posAudio.playSuccess();
    showToast('تم تسجيل السلفة وصرفها بنجاح!');
  };

  const handleTestPrint = (type: 'receipt' | 'kitchen' | 'test') => {
    posAudio.playPrinter();
    showToast(`تم إرسال أمر الطباعة التجريبي (${type === 'receipt' ? 'إيصال كاشير' : type === 'kitchen' ? 'طلب مطبخ' : 'تقرير اختبار'})`);
  };

  // -------------------------
  // Menu Item Handlers
  // -------------------------
  const handleOpenAddMeal = () => {
    posAudio.playTap();
    setEditingMealItem(null);
    setMealCategory(menuActiveCategory);
    setMealName('');
    setMealPrice('1.500');
    setMealBorderColor('border-rose-500');
    setMealPrinter(menuActiveCategory === 'drinks' ? 'prn-bar' : menuActiveCategory === 'sweets' ? 'prn-bakery' : 'prn-kitchen');
    setMealImage('');
    setMealDescription('');
    setMealIsAvailable(true);
    setMealError('');
    setIsMealModalOpen(true);
  };

  const handleOpenEditMeal = (item: MenuItemData) => {
    posAudio.playTap();
    setEditingMealItem(item);
    setMealCategory(menuActiveCategory);
    setMealName(item.name);
    setMealPrice(item.price.toFixed(3));
    setMealBorderColor(item.borderColor || 'border-rose-500');
    setMealPrinter(item.targetPrinterId || 'prn-kitchen');
    setMealImage(item.image || '');
    setMealDescription(item.description || '');
    setMealIsAvailable(item.isAvailable !== false);
    setMealError('');
    setIsMealModalOpen(true);
  };

  const handleDeleteMeal = (itemId: string) => {
    posAudio.playTrash();
    const updatedCategoryItems = (menuItemsMap[menuActiveCategory] || []).filter(it => it.id !== itemId);
    const updatedMap = {
      ...menuItemsMap,
      [menuActiveCategory]: updatedCategoryItems,
    };
    if (onSaveMenuItemsMap) {
      onSaveMenuItemsMap(updatedMap);
    }
    showToast('تم حذف الوجبة من قائمة الطعام بنجاح');
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setMealError('يرجى إدخال اسم الوجبة');
      return;
    }
    const parsedPrice = parseFloat(mealPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setMealError('يرجى إدخال سعر صحيح للوجبة');
      return;
    }

    posAudio.playSuccess();
    const newOrUpdatedItem: MenuItemData = {
      id: editingMealItem ? editingMealItem.id : `dish-${Date.now()}`,
      name: mealName.trim(),
      price: parsedPrice,
      borderColor: mealBorderColor,
      targetPrinterId: mealPrinter,
      image: mealImage.trim() || undefined,
      description: mealDescription.trim() || undefined,
      isAvailable: mealIsAvailable,
    };

    let updatedMap = { ...menuItemsMap };

    if (editingMealItem) {
      // Check if category changed
      if (mealCategory !== menuActiveCategory) {
        // Remove from old category
        updatedMap[menuActiveCategory] = (updatedMap[menuActiveCategory] || []).filter(
          it => it.id !== editingMealItem.id
        );
        // Add to new category
        updatedMap[mealCategory] = [...(updatedMap[mealCategory] || []), newOrUpdatedItem];
      } else {
        // Update in same category
        updatedMap[menuActiveCategory] = (updatedMap[menuActiveCategory] || []).map(it => 
          it.id === editingMealItem.id ? newOrUpdatedItem : it
        );
      }
    } else {
      // Adding new
      updatedMap[mealCategory] = [...(updatedMap[mealCategory] || []), newOrUpdatedItem];
    }

    if (onSaveMenuItemsMap) {
      onSaveMenuItemsMap(updatedMap);
    }
    setIsMealModalOpen(false);
    showToast(editingMealItem ? 'تم تحديث بيانات وسعر الوجبة بنجاح!' : 'تمت إضافة الوجبة الجديدة لقائمة الطعام بنجاح!');
  };

  const handleQuickPriceChange = (itemId: string, newPriceNum: number) => {
    if (isNaN(newPriceNum) || newPriceNum < 0) return;
    const updatedCategoryItems = (menuItemsMap[menuActiveCategory] || []).map(it => 
      it.id === itemId ? { ...it, price: newPriceNum } : it
    );
    const updatedMap = {
      ...menuItemsMap,
      [menuActiveCategory]: updatedCategoryItems,
    };
    if (onSaveMenuItemsMap) {
      onSaveMenuItemsMap(updatedMap);
    }
    showToast('تم تحديث السعر مباشرة!');
  };

  // Filtered sales
  const filteredSales = orders.filter(o => {
    const matchesSearch = !salesSearch || o.orderNumber.toString().includes(salesSearch) || (o.customerName && o.customerName.includes(salesSearch));
    const matchesType = salesTypeFilter === 'all' || o.type === salesTypeFilter;
    const matchesPay = salesPaymentFilter === 'all' || o.paymentMethod === salesPaymentFilter;
    return matchesSearch && matchesType && matchesPay;
  });

  const totalSalesAmount = orders.reduce((acc, o) => acc + o.total, 0);
  const totalTaxAmount = orders.reduce((acc, o) => acc + o.tax, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200 select-none overflow-hidden">
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[900px] bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl border border-emerald-400/40 text-sm font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* MODAL HEADER */}
        {/* ----------------------------------------------------------- */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {activeSection !== 'overview' && (
              <button
                onClick={() => {
                  posAudio.playTap();
                  setActiveSection('overview');
                }}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للقائمة الإدارية</span>
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                📂
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {activeSection === 'overview' ? 'القائمة الإدارية والإعدادات الشاملة' : 
                   activeSection === 'store_info' ? '★ بيانات ومعلومات المحل والإعدادات' :
                   activeSection === 'menu_manager' ? '1. إدارة وتعديل قائمة الطعام والوجبات والأسعار' :
                   activeSection === 'table_room_manager' ? '2. إدارة الصالات والغرف وتخصيص الطاولات و QR' :
                   activeSection === 'deleted_orders' ? '3. سجل المحذوفات والفواتير الملغية وأرشيف العمليات' :
                   activeSection === 'worker_pins' ? '🔑 كلمات السر والصلاحيات' :
                   activeSection === 'shifts' ? '4. التقفيلات وجرد الوردية' :
                   activeSection === 'printing' ? '5. الطباعة وإعدادات الطابعات' :
                   activeSection === 'all_sales' ? '6. المبيعات كاملة والتقارير' :
                   activeSection === 'seller_statement' ? '7. كشف حساب ومبيعات البائعين' :
                   activeSection === 'purchases' ? '8. المشتريات والموردين' :
                   activeSection === 'add_workers' ? '9. إضافة وإدارة العمال' :
                   activeSection === 'inventory' ? '10. المخزون والمستودع' :
                   activeSection === 'advances' ? '11. سحبيات وسلف الموظفين' :
                   activeSection === 'kds' ? '12. شاشة المطبخ والتحضير KDS' :
                   activeSection === 'zatca_qr' ? '13. الفاتورة الإلكترونية والباركود' :
                   activeSection === 'table_qr' ? '14. المنيو الرقمي وطلب الطاولة' :
                   activeSection === 'delivery_fleet' ? '15. أسطول السائقين والتوصيل' :
                   activeSection === 'loyalty_coupons' ? '16. ولاء العملاء والكوبونات' :
                   '17. الربط والمزامنة السحابية'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.restaurantName} - {settings.restaurantBranch}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-mono-num shadow-xs">
              المدير المسؤول: <strong className="text-blue-600">{cashier.cashierName}</strong>
            </span>
            <button
              onClick={() => {
                posAudio.playTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* MODAL BODY */}
        {/* ----------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50">

          {/* ========================================================= */}
          {/* 1. OVERVIEW: THE 8 BIG ADMIN BUTTONS GRID */}
          {/* ========================================================= */}
          {activeSection === 'overview' && (
            <div className="max-w-5xl mx-auto py-2">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-1">لوحة الإدارة والعمليات التشغيلية</h3>
                <p className="text-xs text-slate-500">اختر القسم الإداري المطلوب لإدارة التقفيلات، الحسابات، الموظفين، والمخزون</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        posAudio.playCardSelect();
                        if (item.id === 'shifts') {
                          onOpenShiftModal();
                        } else if (item.id === 'security_hub') {
                          if (onOpenSecurityHub) onOpenSecurityHub();
                        } else {
                          setActiveSection(item.id);
                        }
                      }}
                      className="group relative bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-blue-400 rounded-3xl p-5 text-right transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[170px] cursor-pointer overflow-hidden shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono-num">
                          {item.badge}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-blue-600 font-bold font-mono-num text-sm">{item.num}.</span>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Admin Toggles Footer */}
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">حماية طلبات البيع بكلمة سر</h5>
                    <p className="text-[11px] text-slate-500">طلب إدخال رمز التحقق عند الضغط على أزرار أنواع الطلبات الرئيسية</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !settings.requirePinForOrderType;
                    onUpdateSettings({ requirePinForOrderType: nextVal });
                    posAudio.playTap();
                    showToast(nextVal ? 'تم تفعيل طلب الرمز للأزرار' : 'تم إلغاء طلب الرمز للأزرار');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    settings.requirePinForOrderType
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {settings.requirePinForOrderType ? 'مفعل (يطلب رمز)' : 'معطل (دخول مباشر)'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. MENU ITEMS & MEALS MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'menu_manager' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Top Controls & Stats */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xl">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">إدارة وتعديل قائمة الطعام والوجبات والأسعار</h3>
                    <p className="text-xs text-slate-500">
                      تعديل أسعار الوجبات، إضافة وجبات وأصناف جديدة، وحذف أو تخصيص طابعات المطبخ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleOpenAddMeal}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة وجبة جديدة</span>
                  </button>
                </div>
              </div>

              {/* Category Pills & Search */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      placeholder="بحث عن وجبة أو صنف..."
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    {menuSearchQuery && (
                      <button
                        onClick={() => setMenuSearchQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500">
                    إجمالي الوجبات في هذا القسم: <strong className="text-blue-600 font-mono-num">{menuItemsMap[menuActiveCategory]?.length || 0}</strong>
                  </span>
                </div>

                {/* Categories Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {INVO_CATEGORIES.map((cat) => {
                    const isSelected = menuActiveCategory === cat.id;
                    const catCount = menuItemsMap[cat.id]?.length || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          posAudio.playTap();
                          setMenuActiveCategory(cat.id);
                        }}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                        <span>{cat.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-num font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(menuItemsMap[menuActiveCategory] || [])
                  .filter((item) => !menuSearchQuery || item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()))
                  .map((item) => {
                    const menuItem = item as MenuItemData;
                    const targetPrinter = menuItem.targetPrinterId;
                    const printerLabel = targetPrinter === 'prn-kitchen' ? 'طابعة المطبخ' :
                      targetPrinter === 'prn-bar' ? 'طابعة البار' :
                      targetPrinter === 'prn-bakery' ? 'طابعة المعجنات' : 'طابعة التحضير';

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-3xl p-4 border-2 ${item.borderColor || 'border-slate-200'} shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {printerLabel}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditMeal(item)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                                title="تعديل الوجبة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeal(item.id)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                                title="حذف الوجبة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            {menuItem.image && (
                              <img 
                                src={menuItem.image} 
                                alt={item.name} 
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-900 mb-0.5 leading-snug truncate">
                                {item.name}
                              </h4>
                              {menuItem.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">
                                  {menuItem.description}
                                </p>
                              )}
                              {menuItem.isAvailable === false && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                                  غير متوفر حالياً
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-blue-600 font-mono-num">
                              {item.price.toFixed(3)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {settings.currency || 'ر.ع'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickPriceChange(item.id, Math.max(0, item.price - 0.1))}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
                              title="إنقاص السعر 0.100"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleQuickPriceChange(item.id, item.price + 0.1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
                              title="زيادة السعر 0.100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {(menuItemsMap[menuActiveCategory] || []).length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                  <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-700 mb-1">لا توجد وجبات مسجلة في هذا القسم</h4>
                  <p className="text-xs text-slate-400 mb-4">انقر على الزر أدناه لإضافة أول وجبة في هذا التصنيف</p>
                  <button
                    onClick={handleOpenAddMeal}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة وجبة الآن</span>
                  </button>
                </div>
              )}

              {/* Add / Edit Meal Modal */}
              {isMealModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {editingMealItem ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">
                            {editingMealItem ? 'تعديل بيانات الوجبة' : 'إضافة وجبة جديدة'}
                          </h4>
                          <p className="text-xs text-slate-500">تحديد الاسم، السعر، التصنيف، ولون الإطار</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMealModalOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {mealError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{mealError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveMeal} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          تصنيف الوجبة
                        </label>
                        <select
                          value={mealCategory}
                          onChange={(e) => setMealCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                        >
                          {INVO_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          اسم الوجبة / الصنف *
                        </label>
                        <input
                          type="text"
                          value={mealName}
                          onChange={(e) => setMealName(e.target.value)}
                          placeholder="مثال: شاورما دجاج عربي صاروخ"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            السعر ({settings.currency || 'ر.ع'}) *
                          </label>
                          <input
                            type="number"
                            step="0.050"
                            min="0"
                            value={mealPrice}
                            onChange={(e) => setMealPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-num font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none text-left"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            طابعة التحضير
                          </label>
                          <select
                            value={mealPrinter}
                            onChange={(e) => setMealPrinter(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="prn-kitchen">طابعة المطبخ</option>
                            <option value="prn-bar">طابعة البار والمشروبات</option>
                            <option value="prn-bakery">طابعة المعجنات والفرن</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          رابط صورة الوجبة (اختياري للمنيو أونلاين)
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={mealImage}
                            onChange={(e) => setMealImage(e.target.value)}
                            placeholder="https://images.unsplash.com/... أو رابط الصورة"
                            className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none text-left"
                            dir="ltr"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Image className="w-4 h-4" />
                          </div>
                        </div>
                        {mealImage && (
                          <div className="mt-2 flex items-center gap-3 p-2 bg-slate-100 rounded-xl">
                            <img 
                              src={mealImage} 
                              alt="معاينة الوجبة" 
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <span className="text-[11px] text-slate-600 font-medium">معاينة ظهور الصورة في المنيو أونلاين</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          وصف الوجبة ومكوناتها (يظهر للعميل في المنيو)
                        </label>
                        <textarea
                          rows={2}
                          value={mealDescription}
                          onChange={(e) => setMealDescription(e.target.value)}
                          placeholder="مثال: لحم ضأن طازج مطهو مع الأرز البسمتي والمكسرات والبهارات الخاصة..."
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="text-xs font-bold text-slate-800">حالة توفر الوجبة للطلب</p>
                          <p className="text-[10px] text-slate-500">إذا نفد الصنف يمكنك إيقافه مؤقتاً عن الكاشير والمنيو أونلاين</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mealIsAvailable}
                            onChange={(e) => setMealIsAvailable(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          لون تمييز البطاقة
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { label: 'أحمر', cls: 'border-rose-500 bg-rose-50' },
                            { label: 'أزرق', cls: 'border-blue-500 bg-blue-50' },
                            { label: 'أخضر', cls: 'border-emerald-500 bg-emerald-50' },
                            { label: 'برتقالي', cls: 'border-amber-500 bg-amber-50' },
                            { label: 'بنفسجي', cls: 'border-purple-500 bg-purple-50' },
                          ].map((col) => (
                            <button
                              type="button"
                              key={col.cls}
                              onClick={() => setMealBorderColor(col.cls.split(' ')[0])}
                              className={`p-2 rounded-xl border-2 text-center text-[10px] font-bold cursor-pointer transition-all ${col.cls} ${
                                mealBorderColor === col.cls.split(' ')[0] ? 'ring-2 ring-blue-500 shadow-xs' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              {col.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsMealModalOpen(false)}
                          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                        >
                          {editingMealItem ? 'حفظ التعديلات' : 'إضافة الوجبة الآن'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TABLE & ROOM MANAGER (صالات وغرف وطاولات) */}
          {/* ========================================================= */}
          {activeSection === 'table_room_manager' && (
            <TableAndRoomManagerModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              sections={sections}
              tables={tables}
              onSaveSections={onSaveSections || (() => {})}
              onSaveTables={onSaveTables || (() => {})}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 3. DELETED ORDERS SCREEN (سجل المحذوفات والفواتير الملغية) */}
          {/* ========================================================= */}
          {activeSection === 'deleted_orders' && (
            <DeletedOrdersScreen
              deletedOrders={deletedOrders}
              onBack={() => setActiveSection('overview')}
              onRestoreOrder={onRestoreDeletedOrder || (() => {})}
              onPermanentlyDeleteOrder={onPermanentlyDeleteOrder || (() => {})}
              onClearAllDeleted={onClearAllDeleted || (() => {})}
              currentEmployee={employees.find(e => e.name === cashier.cashierName) || employees[0]}
              adminPin={settings.adminPin || '1234'}
              employees={employees}
            />
          )}

          {/* ========================================================= */}
          {/* 0. STORE INFO & PROFILE SETTINGS */}
          {/* ========================================================= */}
          {activeSection === 'store_info' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <form onSubmit={handleSaveStoreProfile} className="space-y-6">
                {/* Store Basic Data Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">بيانات وهوية المنشأة / المحل</h3>
                      <p className="text-xs text-slate-500">الاسم، الفرع، وأرقام التواصل التي تظهر في رأس الفواتير والتقارير</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-amber-600" />
                        <span>اسم المحل / المطعم</span>
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="مثال: مطعم مذاق الشام والأصيل"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        <span>اسم الفرع</span>
                      </label>
                      <input
                        type="text"
                        value={storeBranch}
                        onChange={(e) => setStoreBranch(e.target.value)}
                        placeholder="مثال: الفرع الرئيسي - طريق الملك فهد"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>رقم الهاتف / الواتساب</span>
                      </label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="+966 55 112 2334"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono-num focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>العنوان والمدينة</span>
                      </label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="الرياض - حي العليا"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax & Commercial Info Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">البيانات الضريبية والسجل التجاري</h3>
                      <p className="text-xs text-slate-500">متطلبات هيئة الزكاة والضريبة والجمارك والفاتورة الإلكترونية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>الرقم الضريبي VAT Number (15 رقم)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={storeTaxNumber}
                        onChange={(e) => setStoreTaxNumber(e.target.value)}
                        placeholder="310458921400003"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>رقم السجل التجاري CR</span>
                      </label>
                      <input
                        type="text"
                        value={storeCommercialRegister}
                        onChange={(e) => setStoreCommercialRegister(e.target.value)}
                        placeholder="1010784920"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-blue-600" />
                        <span>نسبة ضريبة القيمة المضافة (%)</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={storeVatRate}
                        onChange={(e) => setStoreVatRate(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono-num font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        <span>العملة المعتمدة</span>
                      </label>
                      <input
                        type="text"
                        value={storeCurrency}
                        onChange={(e) => setStoreCurrency(e.target.value)}
                        placeholder="ر.س"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Receipt Header and Footer Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">نصوص ترويسة وتذييل الفاتورة الحرارية</h3>
                      <p className="text-xs text-slate-500">رسائل الترحيب والشكر المطبوعة في أعلى وأسفل كل إيصال</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ترويسة الفاتورة (أعلى الإيصال)
                      </label>
                      <input
                        type="text"
                        value={storeReceiptHeader}
                        onChange={(e) => setStoreReceiptHeader(e.target.value)}
                        placeholder="أهلاً وسهلاً بكم في مطعم مذاق الشام والأصيل"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        تذييل الفاتورة (أسفل الإيصال)
                      </label>
                      <input
                        type="text"
                        value={storeReceiptFooter}
                        onChange={(e) => setStoreReceiptFooter(e.target.value)}
                        placeholder="شكراً لزيارتكم ونتشرف بخدمتكم دائماً"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتثبيت بيانات المحل</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. PRINTING SECTION */}
          {/* ========================================================= */}
          {activeSection === 'printing' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <ThermalPrintersSettings
                printerConfig={printerConfig}
                onUpdatePrinterConfig={onUpdatePrinterConfig}
                showToast={showToast}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. ALL SALES SECTION */}
          {/* ========================================================= */}
          {activeSection === 'all_sales' && (
            <div className="space-y-4">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-xs text-slate-400">إجمالي المبيعات</span>
                  <p className="text-xl font-bold font-mono-num text-emerald-400 mt-1">
                    {totalSalesAmount.toLocaleString()} {settings.currency}
                  </p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-xs text-slate-400">عدد الطلبات المنجزة</span>
                  <p className="text-xl font-bold font-mono-num text-blue-400 mt-1">
                    {orders.length} طلب
                  </p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-xs text-slate-400">إجمالي الضريبة (15%)</span>
                  <p className="text-xl font-bold font-mono-num text-purple-400 mt-1">
                    {totalTaxAmount.toFixed(1)} {settings.currency}
                  </p>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-xs text-slate-400">متوسط قيمة الفاتورة</span>
                  <p className="text-xl font-bold font-mono-num text-amber-400 mt-1">
                    {orders.length ? (totalSalesAmount / orders.length).toFixed(1) : 0} {settings.currency}
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    placeholder="بحث برقم الطلب أو اسم العميل..."
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={salesTypeFilter}
                    onChange={(e) => setSalesTypeFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value="dine_in">محلي</option>
                    <option value="takeaway">سفري</option>
                    <option value="delivery">توصيل</option>
                    <option value="pickup">Pick Up</option>
                  </select>
                  <select
                    value={salesPaymentFilter}
                    onChange={(e) => setSalesPaymentFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    <option value="all">جميع طرق الدفع</option>
                    <option value="cash">نقدي (Cash)</option>
                    <option value="card">شبكة / فيزا</option>
                  </select>
                  <button
                    onClick={() => {
                      posAudio.playSuccess();
                      showToast('تم تصدير سجل المبيعات كتقرير جاهز!');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير</span>
                  </button>
                </div>
              </div>

              {/* Sales Invoices Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[420px] custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/90 text-slate-300 uppercase sticky top-0">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3">الوقت</th>
                        <th className="p-3">الأصناف</th>
                        <th className="p-3">طريقة الدفع</th>
                        <th className="p-3">الكاشير</th>
                        <th className="p-3 text-left">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredSales.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-bold font-mono-num text-blue-400">
                            #{order.orderNumber}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              order.type === 'dine_in' ? 'bg-blue-900/60 text-blue-300' :
                              order.type === 'takeaway' ? 'bg-amber-900/60 text-amber-300' :
                              order.type === 'delivery' ? 'bg-emerald-900/60 text-emerald-300' :
                              'bg-purple-900/60 text-purple-300'
                            }`}>
                              {order.type === 'dine_in' ? 'محلي' :
                               order.type === 'takeaway' ? 'سفري' :
                               order.type === 'delivery' ? 'توصيل' : 'Pick Up'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono-num">{order.createdAt}</td>
                          <td className="p-3 text-slate-300 max-w-[200px] truncate">
                            {order.items.map(i => `${i.menuItem.name} (${i.quantity})`).join(', ')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              order.paymentMethod === 'cash' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                            }`}>
                              {order.paymentMethod === 'cash' ? 'نقدي' : 'شبكة / مدى'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{order.cashierName}</td>
                          <td className="p-3 font-bold font-mono-num text-emerald-400 text-left">
                            {order.total.toLocaleString()} {settings.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SELLER ACCOUNT STATEMENT SECTION (كشف حساب ومبيعات البائعين) */}
          {/* ========================================================= */}
          {activeSection === 'seller_statement' && (
            <SellerAccountStatementModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              employees={employees}
              settledOrders={settledOrders}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 5. PURCHASES SECTION */}
          {/* ========================================================= */}
          {activeSection === 'purchases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">سجل فواتير المشتريات والموردين</h3>
                  <p className="text-xs text-slate-400">إجمالي المشتريات المسجلة: <span className="text-emerald-400 font-bold font-mono-num">{purchases.reduce((a,b)=>a+b.total,0).toLocaleString()} {settings.currency}</span></p>
                </div>
                <button
                  onClick={() => setShowAddPurchaseModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فاتورة مشتريات</span>
                </button>
              </div>

              {/* Purchases Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[460px] custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/90 text-slate-300 uppercase sticky top-0">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">اسم المورد</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">تفاصيل الأصناف</th>
                        <th className="p-3">طريقة الدفع</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-left">الإجمالي شامل الضريبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-mono text-violet-400 font-bold">{p.invoiceNumber}</td>
                          <td className="p-3 font-semibold text-slate-200">{p.supplierName}</td>
                          <td className="p-3 text-slate-400 font-mono-num">{p.date}</td>
                          <td className="p-3 text-slate-300 max-w-[260px] truncate">{p.itemsSummary}</td>
                          <td className="p-3 text-slate-300">{p.paymentMethod}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'مدفوع' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold font-mono-num text-slate-100 text-left">
                            {p.total.toLocaleString()} {settings.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Purchase Modal */}
              {showAddPurchaseModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
                    <h4 className="text-lg font-bold mb-4">تسجيل فاتورة مشتريات جديدة</h4>
                    <form onSubmit={handleAddNewPurchase} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم المورد أو الشركة</label>
                        <input
                          type="text"
                          required
                          value={newSupplier}
                          onChange={(e) => setNewSupplier(e.target.value)}
                          placeholder="مثال: شركة المراعي / مؤسسة اللحوم"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">المبلغ الإجمالي (ر.س)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newPurchaseTotal}
                          onChange={(e) => setNewPurchaseTotal(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">تفاصيل الأصناف المشتراة</label>
                        <textarea
                          rows={2}
                          value={newPurchaseItems}
                          onChange={(e) => setNewPurchaseItems(e.target.value)}
                          placeholder="مثال: 5 كراتين جبن، 2 كيس رز، 50 كجم دجاج"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">طريقة السداد</label>
                        <select
                          value={newPurchasePayment}
                          onChange={(e) => setNewPurchasePayment(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        >
                          <option value="نقدي">نقدي (من صندوق الكاش)</option>
                          <option value="تحويل بنكي">تحويل بنكي</option>
                          <option value="آجل">آجل (سداد لاحق)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddPurchaseModal(false)}
                          className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-lg"
                        >
                          حفظ الفاتورة
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. ADD WORKERS / EMPLOYEES SECTION */}
          {/* ========================================================= */}
          {activeSection === 'add_workers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">سجل الكادر الوظيفي والعمال</h3>
                  <p className="text-xs text-slate-400">إجمالي فريق العمل: <span className="text-blue-400 font-bold font-mono-num">{employees.length} موظف</span></p>
                </div>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة عامل جديد</span>
                </button>
              </div>

              {/* Employees Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp) => (
                  <div key={emp.id} className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-base">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                          <span className="text-xs text-blue-400 font-mono-num">#{emp.code}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {emp.active ? 'نشط' : 'موقف'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>المسمى الوظيفي:</span>
                        <strong className="text-slate-200">{emp.role}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>رقم الجوال:</span>
                        <strong className="text-slate-200 font-mono-num">{emp.phone}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>الراتب الشهري:</span>
                        <strong className="text-emerald-400 font-mono-num">{emp.salary || 4000} {settings.currency}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-xs">
                      <span className="text-slate-500 font-mono-num">الرمز: {emp.pin}</span>
                      <button
                        onClick={() => {
                          const updated = employees.map(e => e.id === emp.id ? { ...e, active: !e.active } : e);
                          onUpdateEmployees(updated);
                          posAudio.playTap();
                        }}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {emp.active ? 'تعطيل الحساب' : 'تفعيل'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Employee Modal */}
              {showAddEmployeeModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
                    <h4 className="text-lg font-bold mb-4">إضافة موظف / عامل جديد</h4>
                    <form onSubmit={handleAddNewEmployee} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم الموظف الثلاثي</label>
                        <input
                          type="text"
                          required
                          value={newEmpName}
                          onChange={(e) => setNewEmpName(e.target.value)}
                          placeholder="مثال: يوسف العبدالله"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">الرقم الوظيفي</label>
                          <input
                            type="text"
                            value={newEmpCode}
                            onChange={(e) => setNewEmpCode(e.target.value)}
                            placeholder="POS-109"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">رمز الدخول PIN</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={newEmpPin}
                            onChange={(e) => setNewEmpPin(e.target.value)}
                            placeholder="1234"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-center"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">الدور الوظيفي</label>
                          <select
                            value={newEmpRole}
                            onChange={(e) => setNewEmpRole(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                          >
                            <option value="كاشير رئيسي">كاشير رئيسي</option>
                            <option value="كاشير مسائي">كاشير مسائي</option>
                            <option value="مشرف صالة">مشرف صالة</option>
                            <option value="مدير فرع">مدير فرع</option>
                            <option value="طاهي رئيسي">طاهي رئيسي</option>
                            <option value="كابتن صالة">كابتن صالة</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">الراتب الأساسي</label>
                          <input
                            type="number"
                            value={newEmpSalary}
                            onChange={(e) => setNewEmpSalary(e.target.value)}
                            placeholder="4500"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">رقم الجوال</label>
                        <input
                          type="text"
                          value={newEmpPhone}
                          onChange={(e) => setNewEmpPhone(e.target.value)}
                          placeholder="05XXXXXXXX"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num"
                        />
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddEmployeeModal(false)}
                          className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg"
                        >
                          حفظ الموظف
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. WORKER PINS & CREDENTIALS SECTION */}
          {/* ========================================================= */}
          {activeSection === 'worker_pins' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Security Hub Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-3xl border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">لوحة الأمان والصلاحيات الدقيقة (V-NOX Security Hub)</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        موصى به
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      تشفير كلمات السر PIN Hashing، التحكم في 49 عملية مفصلة، حدود الخصومات، وسجل تدقيق حي
                    </p>
                  </div>
                </div>
                {onOpenSecurityHub && (
                  <button
                    onClick={() => {
                      posAudio.playCardSelect();
                      onOpenSecurityHub();
                    }}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>إدارة الصلاحيات المتقدمة</span>
                  </button>
                )}
              </div>

              {/* Master Admin PIN Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border-2 border-rose-500/40 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">رمز المدير العام Master Admin PIN</h3>
                      <p className="text-xs text-slate-400">الرمز السري المعتمد للدخول إلى لوحة الإدارة، التقفيلات الحساسة، وتغيير الإعدادات</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold font-mono">
                    صلاحية كاملة (مدير)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 max-w-lg">
                  <input
                    type="password"
                    maxLength={8}
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="flex-1 min-w-[140px] px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-center text-xl font-mono text-rose-400 tracking-widest outline-none focus:border-rose-500"
                    placeholder="1234"
                  />
                  <button
                    onClick={handleSaveAdminPin}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ وتثبيت رمز المدير</span>
                  </button>
                </div>
              </div>

              {/* Realtime PIN Verification Simulator */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">محاكي فحص واختبار كلمات السر (Live PIN Tester)</h4>
                      <p className="text-xs text-slate-500">اكتب أي رمز لتجربة الصلاحيات وهوية المستخدم المعتمد</p>
                    </div>
                  </div>
                  {pinTestInput && (
                    <button
                      onClick={() => setPinTestInput('')}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={8}
                    value={pinTestInput}
                    onChange={(e) => setPinTestInput(e.target.value)}
                    placeholder="أدخل رمز للتجربة..."
                    className="w-48 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center tracking-widest font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />

                  {pinTestInput ? (
                    (() => {
                      const isMaster = !!settings.adminPin && pinTestInput === settings.adminPin;
                      const matchedEmp = employees.find(e => e.pin === pinTestInput);

                      if (isMaster) {
                        return (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>رمز المدير العام Master PIN (صلاحيات كاملة وغير مقيدة)</span>
                          </div>
                        );
                      }
                      if (matchedEmp) {
                        return (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span>الموظف: {matchedEmp.name} ({matchedEmp.role}) - الرمز: {matchedEmp.pin}</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>رمز غير معرّف في النظام!</span>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-xs text-slate-400">اكتب الرمز في الحقل لفحصه فوراً</span>
                  )}
                </div>
              </div>

              {/* Staff PIN Codes List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">رموز وكلمات سر الكادر والموظفين</h4>
                    <p className="text-xs text-slate-500">قائمة رموز PIN لكل موظف مسجل في النظام</p>
                  </div>
                  <button
                    onClick={() => setShowAddEmployeeModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إضافة موظف / كلمة سر جديدة</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <div key={emp.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs font-mono">
                          {emp.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                            {emp.role.includes('مدير') && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                مدير
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{emp.role} • {emp.phone}</span>
                        </div>
                      </div>

                      {editingEmpPinId === emp.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={tempEmpPin}
                            onChange={(e) => setTempEmpPin(e.target.value)}
                            placeholder="رمز جديد"
                            className="w-24 px-2 py-1.5 bg-slate-50 border border-blue-500 rounded-xl text-center text-sm font-mono text-blue-600 font-bold outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateEmpPin(emp.id)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                            title="حفظ"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                            setEditingEmpPinId(null);
                            setTempEmpPin('');
                          }}
                            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
                            title="إلغاء"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold tracking-widest text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                            {emp.pin}
                          </span>
                          <button
                            onClick={() => {
                              setEditingEmpPinId(emp.id);
                              setTempEmpPin(emp.pin);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تغيير الرمز</span>
                          </button>
                          <button
                            onClick={() => setEditingPermissionsEmp(emp)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>الصلاحيات</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Management Modal */}
              {editingPermissionsEmp && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-lg text-slate-900 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">صلاحيات: {editingPermissionsEmp.name}</h4>
                          <p className="text-xs text-slate-500">الوظيفة: {editingPermissionsEmp.role} | رمز PIN: {editingPermissionsEmp.pin}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingPermissionsEmp(null)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: 'canEditMenu', label: 'تعديل قائمة الطعام والأسعار والصور', desc: 'إضافة وتعديل وحذف الوجبات وتحديث الأسعار' },
                        { key: 'canManageTables', label: 'إدارة الصالات والغرف والطاولات', desc: 'إضافة صالات وترتيب الطاولات وباركود QR' },
                        { key: 'canDeleteOrders', label: 'إلغاء وحذف الفواتير والأصناف', desc: 'حذف عناصر من الطلب أو إرجاع فواتير مسددة' },
                        { key: 'canViewReports', label: 'مشاهدة المبيعات وكشوف الحسابات', desc: 'الاطلاع على تقارير الأرباح والمبيعات الكاملة' },
                        { key: 'canCloseShift', label: 'تقفيل الوردية والجرد النقدي', desc: 'إنهاء الشفت وإدخال مبالغ الصندوق' },
                        { key: 'canManageWorkers', label: 'إدارة بيانات ورموز الموظفين', desc: 'إضافة موظفين جدد وتغيير رموز المرور' },
                        { key: 'canManageSettings', label: 'تعديل إعدادات النظام والطابعات', desc: 'تغيير بيانات المنشأة والضريبة وربط الطابعات' },
                      ].map(perm => {
                        const isGranted = !!editingPermissionsEmp.permissions?.[perm.key as keyof RolePermissions];
                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleToggleEmpPermission(editingPermissionsEmp.id, perm.key as keyof RolePermissions)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isGranted 
                                ? 'bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100/60' 
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <p className={`text-xs font-bold ${isGranted ? 'text-indigo-950' : 'text-slate-700'}`}>
                                {perm.label}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{perm.desc}</p>
                            </div>
                            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                              isGranted ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                            }`}>
                              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setEditingPermissionsEmp(null)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                      >
                        تم وحفظ الصلاحيات
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. INVENTORY SECTION */}
          {/* ========================================================= */}
          {activeSection === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">إدارة المخزون والمواد الأولية</h3>
                  <p className="text-xs text-slate-400">إجمالي المواد المتتبعة: <span className="text-indigo-400 font-bold font-mono-num">{inventory.length} مادة</span></p>
                </div>
                <button
                  onClick={() => setShowAddInvModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مادة للمستودع</span>
                </button>
              </div>

              {/* Inventory Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[460px] custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/90 text-slate-300 uppercase sticky top-0">
                      <tr>
                        <th className="p-3">رمز المادة SKU</th>
                        <th className="p-3">اسم الصنف</th>
                        <th className="p-3">التصنيف</th>
                        <th className="p-3">الرصيد الحالي</th>
                        <th className="p-3">حد الطلب الأدنى</th>
                        <th className="p-3">تكلفة الوحدة</th>
                        <th className="p-3">حالة التوفر</th>
                        <th className="p-3 text-left">تعديل سريع للكمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {inventory.map((item) => {
                        const isLow = item.currentStock <= item.minStock;
                        return (
                          <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                            <td className="p-3 font-mono text-indigo-400 font-bold">{item.sku}</td>
                            <td className="p-3 font-semibold text-white">{item.name}</td>
                            <td className="p-3 text-slate-400">{item.category}</td>
                            <td className="p-3 font-bold font-mono-num text-white">
                              {item.currentStock} {item.unit}
                            </td>
                            <td className="p-3 font-mono-num text-slate-400">{item.minStock} {item.unit}</td>
                            <td className="p-3 font-mono-num text-slate-300">{item.unitCost} {settings.currency}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isLow ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {isLow ? 'مستوى منخفض (اطلب)' : 'متوفر بشكل ممتاز'}
                              </span>
                            </td>
                            <td className="p-3 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    const updated = inventory.map(i => i.id === item.id ? { ...i, currentStock: Math.max(0, i.currentStock - 1) } : i);
                                    onUpdateInventory(updated);
                                    posAudio.playTap();
                                  }}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = inventory.map(i => i.id === item.id ? { ...i, currentStock: i.currentStock + 5 } : i);
                                    onUpdateInventory(updated);
                                    posAudio.playTap();
                                  }}
                                  className="px-2.5 h-7 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold flex items-center justify-center border border-indigo-500/40 text-[11px]"
                                >
                                  +5 توريد
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Inventory Modal */}
              {showAddInvModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
                    <h4 className="text-lg font-bold mb-4">إضافة صنف جديد للمخزون</h4>
                    <form onSubmit={handleAddNewInventory} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم المادة / الصنف</label>
                        <input
                          type="text"
                          required
                          value={newInvName}
                          onChange={(e) => setNewInvName(e.target.value)}
                          placeholder="مثال: لحم غنم مفروم"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">رمز SKU</label>
                          <input
                            type="text"
                            value={newInvSku}
                            onChange={(e) => setNewInvSku(e.target.value)}
                            placeholder="RAW-MEAT-02"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">التصنيف</label>
                          <select
                            value={newInvCategory}
                            onChange={(e) => setNewInvCategory(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                          >
                            <option value="لحوم ودواجن">لحوم ودواجن</option>
                            <option value="خضار وفواكه">خضار وفواكه</option>
                            <option value="أرز وحبوب">أرز وحبوب</option>
                            <option value="مشروبات">مشروبات</option>
                            <option value="تغليف وصناديق">تغليف وصناديق</option>
                            <option value="بهارات وزيوت">بهارات وزيوت</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">الرصيد</label>
                          <input
                            type="number"
                            value={newInvStock}
                            onChange={(e) => setNewInvStock(e.target.value)}
                            className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">حد الإنذار</label>
                          <input
                            type="number"
                            value={newInvMinStock}
                            onChange={(e) => setNewInvMinStock(e.target.value)}
                            className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">الوحدة</label>
                          <select
                            value={newInvUnit}
                            onChange={(e) => setNewInvUnit(e.target.value as any)}
                            className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                          >
                            <option value="كجم">كجم</option>
                            <option value="لتر">لتر</option>
                            <option value="كرتون">كرتون</option>
                            <option value="حبة">حبة</option>
                            <option value="كيس">كيس</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddInvModal(false)}
                          className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg"
                        >
                          حفظ الصنف
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. EMPLOYEE ADVANCES (سحبيات الموظفين) */}
          {/* ========================================================= */}
          {activeSection === 'advances' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">سجل سحبيات وسلف الموظفين</h3>
                  <p className="text-xs text-slate-400">إجمالي مبالغ السحب المصروفة: <span className="text-teal-400 font-bold font-mono-num">{advances.reduce((a,b)=>a+b.amount,0).toLocaleString()} {settings.currency}</span></p>
                </div>
                <button
                  onClick={() => setShowAddAdvanceModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-600/30"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>تسجيل سحب / سلفة موظف</span>
                </button>
              </div>

              {/* Advances Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[460px] custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/90 text-slate-300 uppercase sticky top-0">
                      <tr>
                        <th className="p-3">اسم الموظف</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">سبب السلفة / السحب</th>
                        <th className="p-3">المعتمد</th>
                        <th className="p-3">حالة الاستقطاع</th>
                        <th className="p-3 text-left">المبلغ المصروف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {advances.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-bold text-white">{adv.employeeName}</td>
                          <td className="p-3 text-slate-400 font-mono-num">{adv.date}</td>
                          <td className="p-3 text-slate-300">{adv.reason}</td>
                          <td className="p-3 text-slate-400">{adv.approvedBy}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800">
                              {adv.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold font-mono-num text-teal-400 text-left">
                            {adv.amount.toLocaleString()} {settings.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Advance Modal */}
              {showAddAdvanceModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
                    <h4 className="text-lg font-bold mb-4">صرف سلفة مالية لموظف</h4>
                    <form onSubmit={handleAddNewAdvance} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اختر الموظف</label>
                        <select
                          value={advEmpId}
                          onChange={(e) => setAdvEmpId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        >
                          {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">المبلغ المطلوب (ر.س)</label>
                        <input
                          type="number"
                          step="10"
                          required
                          value={advAmount}
                          onChange={(e) => setAdvAmount(e.target.value)}
                          placeholder="مثال: 500"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono-num"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">سبب السحب / ملاحظات</label>
                        <textarea
                          rows={2}
                          value={advReason}
                          onChange={(e) => setAdvReason(e.target.value)}
                          placeholder="مثال: سلفة طارئة لصيانة السيارة"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddAdvanceModal(false)}
                          className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-lg"
                        >
                          صرف واعتماد السلفة
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. KDS KITCHEN DISPLAY SYSTEM */}
          {/* ========================================================= */}
          {activeSection === 'kds' && (
            <KitchenDisplaySystemModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
            />
          )}

          {/* ========================================================= */}
          {/* 11. ZATCA QR & BARCODE E-INVOICE */}
          {/* ========================================================= */}
          {activeSection === 'zatca_qr' && (
            <ZatcaQRCodeModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 12. TABLE QR DIGITAL MENU & SELF-ORDER */}
          {/* ========================================================= */}
          {activeSection === 'table_qr' && (
            <TableQRMenuModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 13. DELIVERY FLEET & DRIVERS */}
          {/* ========================================================= */}
          {activeSection === 'delivery_fleet' && (
            <DeliveryFleetModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 14. LOYALTY PROGRAM & COUPONS */}
          {/* ========================================================= */}
          {activeSection === 'loyalty_coupons' && (
            <LoyaltyAndCouponsModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              currency={settings.currency || 'ر.ع'}
            />
          )}

          {/* ========================================================= */}
          {/* 15. CLOUD SYNC & MULTI-DEVICE MESH */}
          {/* ========================================================= */}
          {activeSection === 'cloud_sync' && (
            <MultiDeviceSyncModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
            />
          )}

          {/* ========================================================= */}
          {/* 16. PROFIT & LOSS (P&L) FINANCIAL DASHBOARD */}
          {/* ========================================================= */}
          {activeSection === 'profit_loss' && (
            <ProfitLossModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              orders={orders}
              settledOrders={settledOrders}
              inventory={inventory}
              settings={settings}
            />
          )}

          {/* ========================================================= */}
          {/* 17. DELIVERY AGGREGATORS HUB */}
          {/* ========================================================= */}
          {activeSection === 'delivery_aggregators' && (
            <DeliveryAggregatorsModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              settings={settings}
            />
          )}

          {/* ========================================================= */}
          {/* 18. RECIPES & FOOD COST (BOM) */}
          {/* ========================================================= */}
          {activeSection === 'recipes_bom' && (
            <RecipeManagerModal
              isOpen={true}
              onClose={() => setActiveSection('overview')}
              inventory={inventory}
              settings={settings}
              onSaveRecipes={(rec) => {
                // optionally update inventory state if needed
              }}
            />
          )}

          {/* ========================================================= */}
          {/* 19. ADVANCED SECURITY & GRANULAR PERMISSIONS HUB */}
          {/* ========================================================= */}
          {activeSection === 'security_hub' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shrink-0">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-white">لوحة الأمان وإدارة الصلاحيات (V-NOX RBAC)</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                          نشط ومحمي
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                        نظام حماية مؤسسي متكامل: تشفير PINs عبر Salted Hashes، التحكم في 49 عملية دقيقة، تعيين حدود الخصومات لكل موظف، طلب موافقة المدير اللحظية One-Time Manager Approval، وسجل تدقيق حي للأحداث وسلة محذوفات آمنة.
                      </p>
                    </div>
                  </div>

                  {onOpenSecurityHub && (
                    <button
                      onClick={() => {
                        posAudio.playCardSelect();
                        onOpenSecurityHub();
                      }}
                      className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>فتح لوحة الصلاحيات كاملة ⚡</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-500/20 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تشفير كلمات السر وحماية التخزين</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>موافقة المدير المؤقتة لعملية واحدة فقط</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>سجل تدقيق Audit Log غير قابل للتلاعب</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
