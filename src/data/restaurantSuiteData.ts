export interface KDSTicketItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  station: 'grill' | 'kitchen' | 'drinks' | 'dessert' | 'all';
  isDone?: boolean;
}

export interface KDSTicket {
  id: string;
  orderNumber: string;
  tableOrChannel: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  serverName: string;
  elapsedSeconds: number;
  status: 'new' | 'preparing' | 'ready' | 'served';
  createdAt: number;
  items: KDSTicketItem[];
}

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  status: 'available' | 'on_delivery' | 'off_duty';
  totalDeliveriesToday: number;
  cashOnHand: number;
  activeOrdersCount: number;
  avatarColor: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: 'silver' | 'gold' | 'platinum';
  lastOrderDate: string;
  notes?: string;
}

export interface PromoCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  expiryDate: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  description: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'pos' | 'kds' | 'waiter_tablet' | 'customer_display' | 'online_portal';
  ipAddress: string;
  lastPing: string;
  status: 'online' | 'offline' | 'syncing';
  batteryLevel?: number;
}

// Initial Sample Data
export const INITIAL_KDS_TICKETS: KDSTicket[] = [
  {
    id: 'kds-1',
    orderNumber: 'Order 68953',
    tableOrChannel: 'طاولة 4 (محلي)',
    orderType: 'dine_in',
    serverName: 'ابو عايض',
    elapsedSeconds: 240, // 4 mins
    status: 'preparing',
    createdAt: Date.now() - 240000,
    items: [
      { id: 'ki-1', name: 'شاورما دجاج عربي', quantity: 2, notes: 'زيادة ثوم وبطاطس', station: 'grill' },
      { id: 'ki-2', name: 'برجر لحم مدخن دوبل', quantity: 1, notes: 'بدون بصل', station: 'grill' },
      { id: 'ki-3', name: 'عصير برتقال طازج', quantity: 2, station: 'drinks', isDone: true },
      { id: 'ki-4', name: 'بطاطس مقلية متبلة', quantity: 1, station: 'kitchen' }
    ]
  },
  {
    id: 'kds-2',
    orderNumber: 'Order 68954',
    tableOrChannel: 'سفري (تيك أواي)',
    orderType: 'takeaway',
    serverName: 'فهد السالم',
    elapsedSeconds: 780, // 13 mins
    status: 'preparing',
    createdAt: Date.now() - 780000,
    items: [
      { id: 'ki-5', name: 'مشاوي مشكلة عائلي', quantity: 1, notes: 'طحينة زيادة وخبز حار', station: 'grill' },
      { id: 'ki-6', name: 'حمص بيروتي', quantity: 1, station: 'kitchen' },
      { id: 'ki-7', name: 'بيبسي عائلي', quantity: 1, station: 'drinks', isDone: true }
    ]
  },
  {
    id: 'kds-3',
    orderNumber: 'Order 68955',
    tableOrChannel: 'توصيل - حي المروج',
    orderType: 'delivery',
    serverName: 'خالد العتيبي',
    elapsedSeconds: 1350, // 22.5 mins (Late / Red)
    status: 'new',
    createdAt: Date.now() - 1350000,
    items: [
      { id: 'ki-8', name: 'بيتزا سوبر سوبريم كبير', quantity: 2, notes: 'جبنة زيادة ومقرمشة', station: 'kitchen' },
      { id: 'ki-9', name: 'سلطة سيزر بالدجاج', quantity: 1, station: 'kitchen' },
      { id: 'ki-10', name: 'موهيتو فراولة', quantity: 2, station: 'drinks' }
    ]
  },
  {
    id: 'kds-4',
    orderNumber: 'Order 68950',
    tableOrChannel: 'طاولة 2 (محلي)',
    orderType: 'dine_in',
    serverName: 'سلطان القحطاني',
    elapsedSeconds: 120,
    status: 'ready',
    createdAt: Date.now() - 120000,
    items: [
      { id: 'ki-11', name: 'كباب دجاج حلبي', quantity: 2, station: 'grill', isDone: true },
      { id: 'ki-12', name: 'شوربة عدس تركي', quantity: 2, station: 'kitchen', isDone: true }
    ]
  }
];

export const INITIAL_DRIVERS: DeliveryDriver[] = [
  {
    id: 'drv-1',
    name: 'أحمد مراد (دباب)',
    phone: '0501234567',
    vehicle: 'دراجة نارية هوندا',
    plateNumber: 'د-ب-ب 4412',
    status: 'on_delivery',
    totalDeliveriesToday: 9,
    cashOnHand: 48.500,
    activeOrdersCount: 2,
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'drv-2',
    name: 'محمد الشمري (سيارة)',
    phone: '0559876543',
    vehicle: 'تويوتا يارس 2023',
    plateNumber: 'س-ي-ر 9821',
    status: 'available',
    totalDeliveriesToday: 14,
    cashOnHand: 112.000,
    activeOrdersCount: 0,
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'drv-3',
    name: 'ياسين الفاضل',
    phone: '0543322114',
    vehicle: 'دراجة نارية ياماها',
    plateNumber: 'ب-ك-ر 5530',
    status: 'available',
    totalDeliveriesToday: 7,
    cashOnHand: 32.200,
    activeOrdersCount: 0,
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'drv-4',
    name: 'سالم الكندي',
    phone: '0567788990',
    vehicle: 'هيونداي أكسنت',
    plateNumber: 'ع-م-ن 1044',
    status: 'off_duty',
    totalDeliveriesToday: 0,
    cashOnHand: 0.000,
    activeOrdersCount: 0,
    avatarColor: 'bg-slate-600'
  }
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'سعود بن عبدالعزيز',
    phone: '0501112233',
    address: 'شارع الملك فهد، برج 12، شقة 402',
    totalOrders: 28,
    totalSpent: 412.500,
    loyaltyPoints: 340,
    tier: 'platinum',
    lastOrderDate: 'اليوم 08:30 م',
    notes: 'يفضل الشاورما حارة دائماً مع صوص الثوم'
  },
  {
    id: 'cust-2',
    name: 'د. طارق الحوسني',
    phone: '0554445566',
    address: 'حي الواحة، فيلا 18 قرب مسجد الهدى',
    totalOrders: 15,
    totalSpent: 245.000,
    loyaltyPoints: 180,
    tier: 'gold',
    lastOrderDate: 'أمس 02:15 م',
    notes: 'عميل دائم لطلبات الغداء العائلية'
  },
  {
    id: 'cust-3',
    name: 'مها بنت فهد',
    phone: '0548889900',
    address: 'حي النخيل، مجمع الروز 4',
    totalOrders: 8,
    totalSpent: 98.400,
    loyaltyPoints: 85,
    tier: 'silver',
    lastOrderDate: 'منذ 3 أيام',
    notes: 'تفضل الدفع بالشبكة عند الباب'
  },
  {
    id: 'cust-4',
    name: 'عبدالله السعدي',
    phone: '0537771122',
    address: 'شارع الخدمات، عمارة الأمل دور 2',
    totalOrders: 21,
    totalSpent: 310.000,
    loyaltyPoints: 260,
    tier: 'gold',
    lastOrderDate: 'اليوم 01:10 م',
    notes: 'طلب متكرر: برجر ومشاوي'
  }
];

export const INITIAL_COUPONS: PromoCoupon[] = [
  {
    id: 'cp-1',
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minOrderAmount: 5.0,
    expiryDate: '2026-12-31',
    usageCount: 142,
    maxUsage: 500,
    isActive: true,
    description: 'خصم 10% للعملاء الجدد والطلبات فوق 5 ريال'
  },
  {
    id: 'cp-2',
    code: 'RAMADAN20',
    discountType: 'percentage',
    value: 20,
    minOrderAmount: 15.0,
    expiryDate: '2026-06-30',
    usageCount: 89,
    maxUsage: 200,
    isActive: true,
    description: 'خصم 20% على الوجبات العائلية والمشاوي'
  },
  {
    id: 'cp-3',
    code: 'SAVE3OMR',
    discountType: 'fixed',
    value: 3.0,
    minOrderAmount: 10.0,
    expiryDate: '2026-09-30',
    usageCount: 65,
    maxUsage: 300,
    isActive: true,
    description: 'خصم مباشر بقيمة 3 ر.ع للطلبات فوق 10 ر.ع'
  },
  {
    id: 'cp-4',
    code: 'VIP50',
    discountType: 'percentage',
    value: 50,
    minOrderAmount: 20.0,
    expiryDate: '2026-12-31',
    usageCount: 12,
    maxUsage: 50,
    isActive: true,
    description: 'كوبون خاص لعملاء الفئة البلاتينية وكبار الضيوف'
  }
];

export const INITIAL_CONNECTED_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-1',
    name: 'الكاشير الرئيسي (Main POS Terminal)',
    type: 'pos',
    ipAddress: '192.168.1.100',
    lastPing: 'الآن (متصل)',
    status: 'online',
    batteryLevel: 100
  },
  {
    id: 'dev-2',
    name: 'شاشة المطبخ الذكية (Kitchen KDS Display)',
    type: 'kds',
    ipAddress: '192.168.1.105',
    lastPing: 'منذ 2 ثانية',
    status: 'online',
    batteryLevel: 98
  },
  {
    id: 'dev-3',
    name: 'تابلت الويتر 1 - صالة العوائل (Waiter Tablet A)',
    type: 'waiter_tablet',
    ipAddress: '192.168.1.112',
    lastPing: 'منذ 5 ثواني',
    status: 'online',
    batteryLevel: 76
  },
  {
    id: 'dev-4',
    name: 'شاشة العميل الإعلانية (Customer Display CDS)',
    type: 'customer_display',
    ipAddress: '192.168.1.120',
    lastPing: 'منذ 8 ثواني',
    status: 'online',
    batteryLevel: 100
  },
  {
    id: 'dev-5',
    name: 'بوابة الطلب الذاتي عبر الـ QR (Self-Order Cloud Gateway)',
    type: 'online_portal',
    ipAddress: 'cloud.foodpos.live',
    lastPing: 'منذ ثانية واحدة',
    status: 'online'
  }
];
