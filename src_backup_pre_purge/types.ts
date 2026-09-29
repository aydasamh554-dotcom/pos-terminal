export type OrderType = 'dine_in' | 'delivery' | 'takeaway' | 'pickup';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required?: boolean;
  multiple?: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
  badge?: string;
  color?: string;
  prepTimeMinutes?: number;
  modifierGroups?: ModifierGroup[];
}

export interface CartItemModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: CartItemModifier[];
  notes: string;
  itemTotal: number;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';
export type TableShape = 'square' | 'round' | 'rectangle' | 'booth' | 'majlis';

export interface RestaurantSection {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder?: number;
}

export interface RestaurantTable {
  id: string;
  number?: number;
  name: string;
  section: string; // e.g. "singles", "families", "rooms" or section ID
  sectionId?: string;
  capacity: number;
  shape?: TableShape;
  status: TableStatus;
  isOccupied?: boolean;
  isVip?: boolean;
  ticketCount?: number;
  elapsed?: string;
  elapsedSeconds?: number;
  orderId?: string;
  currentOrderId?: string;
  occupiedSince?: string;
  guestCount?: number;
  currentTotal?: number;
  qrUrl?: string;
  notes?: string;
  sortOrder?: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'online' | 'split' | 'unpaid';

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  tax: number; // 15% VAT
  discount: number; // in currency or %
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  
  // Type specific details
  tableId?: string;
  tableName?: string;
  guestCount?: number;
  
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryDriver?: string;
  
  carDetails?: string; // For Takeaway
  pickupTime?: string; // For Pick Up
  
  generalNotes?: string;
}

export interface CashMovement {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  time: string;
  cashierName: string;
}

export interface ChannelSalesBreakdown {
  dineIn: { count: number; total: number };
  delivery: { count: number; total: number };
  takeaway: { count: number; total: number };
  pickup: { count: number; total: number };
}

export interface ShiftRecord {
  id: string;
  shiftNumber: number;
  cashierId: string;
  cashierName: string;
  cashierCode: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime?: string;
  status: 'open' | 'closed';
  openingCash: number;
  cashSales: number;
  cardSales: number;
  onlineSales: number;
  totalSales: number;
  totalOrdersCount: number;
  totalDiscount: number;
  totalTax: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCashCounted: number;
  difference: number; // positive = surplus (زيادة), negative = shortage (عجز)
  differenceReason?: string;
  channelBreakdown: ChannelSalesBreakdown;
  movements: CashMovement[];
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  code: string;
  role: 'كاشير رئيسي' | 'كاشير مسائي' | 'مشرف صالة' | 'مدير فرع' | 'طاهي رئيسي' | 'كابتن صالة';
  phone: string;
  pin: string;
  salary?: number;
  active: boolean;
  joinDate?: string;
  permissions?: RolePermissions;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  itemsSummary: string;
  total: number;
  tax: number;
  paymentMethod: 'نقدي' | 'تحويل بنكي' | 'آجل';
  status: 'مدفوع' | 'معلق' | 'مسودة';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'لحوم ودواجن' | 'خضار وفواكه' | 'أرز وحبوب' | 'مشروبات' | 'تغليف وصناديق' | 'بهارات وزيوت';
  currentStock: number;
  minStock: number;
  unit: 'كجم' | 'لتر' | 'كرتون' | 'حبة' | 'كيس';
  unitCost: number;
  lastRestocked: string;
}

export interface EmployeeAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  status: 'تم الصرف' | 'مخصوم من الراتب' | 'قيد المراجعة';
  approvedBy: string;
}

export interface SectionPrinter {
  id: string;
  name: string; // e.g. "طابعة الكاشير والفواتير", "طابعة المطبخ الرئيسي", "طابعة البار والمشروبات", "طابعة المخبز والمعجنات"
  section: 'cashier' | 'kitchen' | 'bar' | 'bakery' | 'grill' | 'custom';
  ipAddress: string;
  port: number;
  connectionType: 'network' | 'usb' | 'bluetooth';
  paperWidth: '80mm' | '58mm';
  autoPrintOnPayment: boolean; // خيار الطباعة التلقائية عند الدفع
  enabled: boolean;
  copies: number;
}

export type InvoiceTargetPrinter = 'cashier' | 'kitchen' | 'both' | 'all';

export interface DefinedPrinterDevice {
  id: string;
  name: string;
  role: 'cashier' | 'kitchen' | 'bar' | 'custom';
  ipAddress: string;
  port: number;
  connectionType: 'network' | 'usb' | 'bluetooth';
  paperWidth: '80mm' | '58mm';
  enabled: boolean;
  autoPrintOnOrder: boolean;
  copies: number;
}

export interface PrinterConfig {
  receiptPrinterIp: string;
  kitchenPrinterIp: string;
  autoPrintReceipt: boolean;
  autoPrintKitchen: boolean;
  paperWidth: '80mm' | '58mm';
  printCopies: number;
  headerText: string;
  footerText: string;
  sectionPrinters?: SectionPrinter[]; // قائمة الطابعات المعرفة لكل قسم
  autoPrintOnPaymentDefault?: boolean;
  activeInvoicePrinter?: InvoiceTargetPrinter; // اختيار الطابعة المستهدفة لإرسال الفاتورة إليها من شاشة الطلبات
  definedPrinters?: DefinedPrinterDevice[];
}

export interface CashierSession {
  id: string;
  cashierName: string;
  cashierCode: string;
  shiftNumber: number;
  startTime: string;
  openingCash: number;
  totalCashSales: number;
  totalCardSales: number;
  totalOrdersCount: number;
  cashIn: number;
  cashOut: number;
  movements: CashMovement[];
}

export interface POSSettings {
  serverIp: string;
  serverPort: string;
  isConnected: boolean;
  restaurantName: string;
  restaurantBranch: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  commercialRegister?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  taxNumber: string;
  vatRate: number; // e.g. 0.15 for 15%
  currency: string;
  soundEnabled: boolean;
  printerConnected: boolean;
  cashDrawerOpen: boolean;
  adminPin: string;
  requirePinForOrderType?: boolean;
  hidePricesOnMealButtons?: boolean; // خيار إخفاء الأسعار من عند أسماء الوجبات للعمال
}

export interface InvoCategory {
  id: string;
  name: string;
  color: string;
  activeColor: string;
  icon?: string;
}

export interface InvoMenuItem {
  id: string;
  name: string;
  price: number;
  borderColor: string;
  categoryId?: string;
  image?: string;                // رابط أو بيانات صورة الصنف
  description?: string;          // وصف المكونات والنكهة
  isAvailable?: boolean;         // حالة التوفر (متوفر / نفدت الكمية)
  isPriceHiddenOnCard?: boolean; // خيار إخفاء السعر عند اسم الوجبة للعمال
  isFreeOrNoPrice?: boolean;     // وجبة بدون سعر / مجانية
  targetPrinterId?: string;      // طابعة القسم المرتبطة (مطبخ، بار، مخبز، إلخ)
}

export interface RolePermissions {
  canEditMenu: boolean;           // تعديل الوجبات والأسعار والصور
  canManageTables: boolean;       // تعديل الصالات والطاولات
  canDeleteOrders: boolean;       // حذف الفواتير والأصناف
  canViewReports: boolean;        // مشاهدة كشوف الحسابات والمبيعات
  canCloseShift: boolean;         // جرد وتقفيلة الوردية
  canManageWorkers: boolean;      // إدارة العمال والموظفين
  canManageSettings: boolean;     // إعدادات المحل والطابعات
}

export interface AppUserRole {
  roleId: string;
  roleName: string;
  permissions: RolePermissions;
}

// -------------------------------------------------------------
// 1. Recipe & Inventory Deduction Types (المخزون والمقادير والوصفات)
// -------------------------------------------------------------
export interface RecipeIngredient {
  inventoryItemId: string; // SKU or ID in Inventory
  name: string;
  quantity: number;        // Quantity needed per 1 meal
  unit: string;            // 'كجم' | 'جرام' | 'حبة' | 'لتر' | 'مل'
  unitCost: number;        // Cost per unit of ingredient
}

export interface MealRecipe {
  mealId: string;
  mealName: string;
  ingredients: RecipeIngredient[];
  totalFoodCost: number;   // Calculated sum of ingredient costs
  lastUpdated?: string;
}

// -------------------------------------------------------------
// 2. Profit & Loss (P&L) & Operating Expenses Types (الأرباح والخسائر)
// -------------------------------------------------------------
export type ExpenseCategory = 
  | 'salaries'     // رواتب وأجور
  | 'rent'         // إيجار المحل
  | 'utilities'    // كهرباء ومياه وإنترنت
  | 'packaging'    // تغليف وأكياس وسفري
  | 'maintenance'  // صيانة ومعدات
  | 'marketing'    // تسويق وإعلانات
  | 'general';     // مصاريف نثرية عامة

export interface OperatingExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recordedBy: string;
  paymentMethod: 'cash' | 'transfer';
  notes?: string;
}

export interface ProfitLossReport {
  grossSales: number;
  discountsGiven: number;
  netSales: number;
  taxCollected: number;
  cogsFoodCost: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  marginPercent: number;
}

// -------------------------------------------------------------
// 3. Delivery Aggregators Hub Types (منصات وتطبيقات التوصيل)
// -------------------------------------------------------------
export type AggregatorPlatformKey = 'jahez' | 'hungerstation' | 'marsool' | 'talabat' | 'toyou' | 'ninja';

export interface AggregatorPlatform {
  key: AggregatorPlatformKey;
  name: string;
  nameEn: string;
  logoColor: string;
  textColor: string;
  borderColor: string;
  commissionPercent: number; // e.g. 18 for 18%
  isActive: boolean;
  autoAcceptOrders: boolean;
}

export interface AggregatorOrderItem {
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface AggregatorOrder {
  id: string;
  platform: AggregatorPlatformKey;
  platformOrderCode: string; // e.g. #JHZ-8921
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  driverName?: string;
  driverPhone?: string;
  items: AggregatorOrderItem[];
  orderTotal: number;
  platformCommission: number;
  netPayoutToRestaurant: number;
  status: 'incoming' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'delivered' | 'cancelled';
  receivedAt: string;
  estimatedPickupMinutes: number;
}

// -------------------------------------------------------------
// 4. Digital Receipt & WhatsApp Types (الفاتورة الرقمية وواتساب)
// -------------------------------------------------------------
export interface DigitalReceiptData {
  orderNumber: string;
  restaurantName: string;
  restaurantPhone: string;
  customerPhone?: string;
  customerName?: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  taxAmount: number;
  taxNumber: string;
  paymentMethod: string;
  dateString: string;
  tableName?: string;
  channelName: string;
}
