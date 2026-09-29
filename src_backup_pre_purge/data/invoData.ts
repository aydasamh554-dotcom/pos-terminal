import { MenuItem, RestaurantTable } from '../types';

export interface InvoOrder {
  id: string;
  orderNumber: string; // e.g. "Order 68943"
  subNumber: string; // e.g. "20"
  channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  tableName?: string;
  tableNotes?: string;
  customerName?: string;
  elapsedTime: string; // e.g. "38m 51s (20)"
  total: number;
  items: InvoOrderItem[];
  status: 'open' | 'paid';
  createdAt?: number; // timestamp for 24-hour auto expiration
  cashierName?: string;
  cashierId?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'talabat';
  isDeleted?: boolean;
  deletedAt?: number;
  deletedBy?: string;
  deletedByRole?: string;
  deleteReason?: string;
  originalStatus?: 'open' | 'paid';
}

export interface InvoOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
  isHeld?: boolean;
  discountPercent?: number;
  targetPrinterId?: string; // طابعة القسم المحددة للصنف (مطبخ، بار، مخبز، إلخ)
  categoryId?: string;
}

// Exactly the categories from the video (placed at top in a scrollable multi-row slider)
export const INVO_CATEGORIES = [
  { id: 'chicken', name: 'الدجاج', color: 'bg-[#b81d24]', activeColor: 'bg-[#881318]' },
  { id: 'meat', name: 'اللحوم', color: 'bg-[#d97706]', activeColor: 'bg-[#b45309]' },
  { id: 'rice', name: 'العيوش', color: 'bg-[#1d4ed8]', activeColor: 'bg-[#1e40af]' },
  { id: 'sauces', name: 'الصوصات', color: 'bg-[#1e3a8a]', activeColor: 'bg-[#172554]' },
  { id: 'sweets', name: 'الحلا', color: 'bg-[#15803d]', activeColor: 'bg-[#166534]' },
  { id: 'sacrifices', name: 'ذبائح', color: 'bg-[#312e81]', activeColor: 'bg-[#1e1b4b]' },
  { id: 'drinks', name: 'المشروبات', color: 'bg-[#ea580c]', activeColor: 'bg-[#c2410c]' },
  { id: 'worker_mazbi', name: 'وجبه مظبي عاملين', color: 'bg-[#831843]', activeColor: 'bg-[#500724]' },
  { id: 'worker_press', name: 'وجبه مضغوط عاملين', color: 'bg-[#991b1b]', activeColor: 'bg-[#7f1d1d]' },
  { id: 'worker_shwaya', name: 'وجبه عاملين شوايه', color: 'bg-[#701a75]', activeColor: 'bg-[#4a044e]' },
];

export const INVO_MENU_ITEMS: Record<string, Array<{ id: string; name: string; price: number; borderColor: string }>> = {
  chicken: [
    { id: 'chk-1', name: 'مضغوط دجاج', price: 1.900, borderColor: 'border-rose-600' },
    { id: 'chk-2', name: 'دجاج شواية', price: 1.500, borderColor: 'border-blue-500' },
    { id: 'chk-3', name: 'دجاج مظبي', price: 1.500, borderColor: 'border-emerald-500' },
    { id: 'chk-4', name: 'ربع شواية مع بشاور', price: 1.200, borderColor: 'border-rose-600' },
    { id: 'chk-5', name: 'شواية مع بشاور', price: 1.900, borderColor: 'border-blue-500' },
    { id: 'chk-6', name: 'مظبي مع بشاور', price: 1.900, borderColor: 'border-emerald-500' },
    { id: 'chk-7', name: 'ربع شواية مع بخاري', price: 1.200, borderColor: 'border-rose-600' },
    { id: 'chk-8', name: 'شواية مع بخاري', price: 1.900, borderColor: 'border-blue-500' },
    { id: 'chk-9', name: 'مظبي مع بخاري', price: 1.900, borderColor: 'border-emerald-500' },
    { id: 'chk-10', name: 'ربع شواية مع حضرمي', price: 1.200, borderColor: 'border-rose-600' },
    { id: 'chk-11', name: 'شواية مع حضرمي', price: 1.900, borderColor: 'border-blue-500' },
    { id: 'chk-12', name: 'مظبي مع حضرمي', price: 1.900, borderColor: 'border-emerald-500' },
    { id: 'chk-13', name: 'دجاج مطهي', price: 1.500, borderColor: 'border-emerald-500' },
    { id: 'chk-14', name: 'مطهي مع بشاور', price: 1.900, borderColor: 'border-emerald-500' },
    { id: 'chk-15', name: 'مطهي مع بخاري', price: 1.900, borderColor: 'border-emerald-500' },
  ],
  rice: [
    { id: 'rc-1', name: 'عيش زربيان', price: 0.800, borderColor: 'border-rose-500' },
    { id: 'rc-2', name: 'عيش بشاور', price: 0.650, borderColor: 'border-rose-500' },
    { id: 'rc-3', name: 'عيش حضرمي', price: 0.650, borderColor: 'border-rose-500' },
    { id: 'rc-4', name: 'عيش بخاري', price: 0.650, borderColor: 'border-rose-500' },
    { id: 'rc-5', name: 'عيش مندي', price: 0.700, borderColor: 'border-rose-500' },
  ],
  meat: [
    { id: 'mt-1', name: 'لحم مضغوط', price: 4.500, borderColor: 'border-amber-500' },
    { id: 'mt-2', name: 'لحم مندي', price: 4.500, borderColor: 'border-amber-500' },
    { id: 'mt-3', name: 'لحم مدفون', price: 4.800, borderColor: 'border-amber-500' },
    { id: 'mt-4', name: 'لحم كابلي', price: 4.500, borderColor: 'border-amber-500' },
    { id: 'mt-5', name: 'مشاوي مشكلة', price: 3.500, borderColor: 'border-amber-500' },
    { id: 'mt-6', name: 'أوصال لحم', price: 2.500, borderColor: 'border-amber-500' },
    { id: 'mt-7', name: 'مقلقل مع بخاري', price: 3.300, borderColor: 'border-amber-600' },
  ],
  sauces: [
    { id: 'sc-1', name: 'صوص ثومية', price: 0.200, borderColor: 'border-blue-500' },
    { id: 'sc-2', name: 'شطة حارة', price: 0.200, borderColor: 'border-blue-500' },
    { id: 'sc-3', name: 'طحينة', price: 0.250, borderColor: 'border-blue-500' },
    { id: 'sc-4', name: 'دقوس طماطم', price: 0.200, borderColor: 'border-blue-500' },
    { id: 'sc-5', name: 'معبوج', price: 0.250, borderColor: 'border-blue-500' },
  ],
  sweets: [
    { id: 'ds-1', name: 'عريكة ملكي', price: 1.800, borderColor: 'border-emerald-500' },
    { id: 'ds-2', name: 'كنافة جبن', price: 1.500, borderColor: 'border-emerald-500' },
    { id: 'ds-3', name: 'كنافة قشطة', price: 1.300, borderColor: 'border-emerald-500' },
    { id: 'ds-4', name: 'معصوب ملكي', price: 1.600, borderColor: 'border-emerald-500' },
  ],
  sacrifices: [
    { id: 'scf-1', name: 'نصف تيس مندي', price: 38.000, borderColor: 'border-indigo-600' },
    { id: 'scf-2', name: 'تيس كامل مندي', price: 75.000, borderColor: 'border-indigo-600' },
    { id: 'scf-3', name: 'نصف خروف مدفون', price: 42.000, borderColor: 'border-indigo-600' },
    { id: 'scf-4', name: 'خروف كامل مدفون', price: 80.000, borderColor: 'border-indigo-600' },
  ],
  drinks: [
    { id: 'dr-1', name: 'كيندا كولا', price: 0.300, borderColor: 'border-rose-500' },
    { id: 'dr-2', name: 'بيبسي', price: 0.300, borderColor: 'border-blue-500' },
    { id: 'dr-3', name: 'سفن اب', price: 0.300, borderColor: 'border-emerald-500' },
    { id: 'dr-4', name: 'ماء صحي', price: 0.150, borderColor: 'border-sky-500' },
    { id: 'dr-5', name: 'لبن عيران', price: 0.350, borderColor: 'border-emerald-500' },
  ],
  worker_press: [
    { id: 'wp-1', name: 'وجبة مضغوط عامل', price: 1.200, borderColor: 'border-rose-600' },
    { id: 'wp-2', name: 'مضغوط عائلي عمال', price: 2.400, borderColor: 'border-rose-600' },
  ],
  worker_mazbi: [
    { id: 'wm-1', name: 'وجبة مظبي عامل', price: 1.200, borderColor: 'border-purple-600' },
    { id: 'wm-2', name: 'مظبي مع روب عامل', price: 1.400, borderColor: 'border-purple-600' },
  ],
  worker_shwaya: [
    { id: 'ws-1', name: 'وجبة شواية عامل', price: 1.200, borderColor: 'border-fuchsia-600' },
    { id: 'ws-2', name: 'شواية عمال مضاعف', price: 2.200, borderColor: 'border-fuchsia-600' },
  ]
};

export interface RestaurantSection {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder?: number;
}

export const DEFAULT_SECTIONS: RestaurantSection[] = [
  { id: 'singles', name: 'الافراد', icon: 'Users', color: 'slate', description: 'صالة الأفراد والجلسات السريعة', sortOrder: 1 },
  { id: 'families', name: 'العوائل', icon: 'Heart', color: 'rose', description: 'صالة العائلات مع بارتشن الخصوصية', sortOrder: 2 },
  { id: 'rooms', name: 'الغرف', icon: 'Crown', color: 'amber', description: 'غرف وكبائن خاصة مغلقة ومكيفة', sortOrder: 3 },
];

export const DEFAULT_TABLES: RestaurantTable[] = [
  // 1. الافراد (Singles) matching Video Frame 00:25 - 00:28
  { id: 's-1', sectionId: 'singles', section: 'الافراد', name: 'جلسة 1', capacity: 4, shape: 'rectangle', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '31m 10s', elapsedSeconds: 1870, orderId: 'Order:68935 (12)', sortOrder: 1 },
  { id: 's-2', sectionId: 'singles', section: 'الافراد', name: 'جلسة 2', capacity: 4, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 2 },
  { id: 's-3', sectionId: 'singles', section: 'الافراد', name: 'جلسة 3', capacity: 4, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 3 },
  { id: 's-4', sectionId: 'singles', section: 'الافراد', name: 'جلسة 4', capacity: 4, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 4 },
  { id: 's-5', sectionId: 'singles', section: 'الافراد', name: 'جلسة 5', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 5 },
  { id: 's-t1', sectionId: 'singles', section: 'الافراد', name: 'طاولة 1', capacity: 4, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 6 },
  { id: 's-t2', sectionId: 'singles', section: 'الافراد', name: 'طاولة 2', capacity: 4, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 7 },
  { id: 's-6', sectionId: 'singles', section: 'الافراد', name: 'جلسة 6', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 8 },
  { id: 's-8', sectionId: 'singles', section: 'الافراد', name: 'جلسة 8', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 9 },
  { id: 's-9', sectionId: 'singles', section: 'الافراد', name: 'جلسة 9', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 10 },
  { id: 's-10', sectionId: 'singles', section: 'الافراد', name: 'جلسة 10', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 11 },
  { id: 's-11', sectionId: 'singles', section: 'الافراد', name: 'جلسة 11', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 12 },
  
  // 2. العوائل (Families) matching Video Frame 00:00 - 00:01
  { id: 'f-1', sectionId: 'families', section: 'العوائل', name: 'عوائل 1', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 1 },
  { id: 'f-2', sectionId: 'families', section: 'العوائل', name: 'عوائل 2', capacity: 6, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 2 },
  { id: 'f-3', sectionId: 'families', section: 'العوائل', name: 'عوائل 3', capacity: 6, shape: 'rectangle', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '14m 4s', elapsedSeconds: 844, orderId: 'ord-70285', sortOrder: 3 },
  { id: 'f-4', sectionId: 'families', section: 'العوائل', name: 'عوائل 4', capacity: 6, shape: 'rectangle', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '8m 20s', elapsedSeconds: 500, orderId: 'ord-70288', sortOrder: 4 },
  { id: 'f-5', sectionId: 'families', section: 'العوائل', name: 'عوائل 5', capacity: 8, shape: 'rectangle', status: 'available', isOccupied: false, sortOrder: 5 },
  { id: 'f-6', sectionId: 'families', section: 'العوائل', name: 'عوائل 6', capacity: 8, shape: 'rectangle', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '2m 13s', elapsedSeconds: 133, orderId: 'ord-70282', sortOrder: 6 },

  // 3. الغرف (Rooms) matching Video Frame 00:30 - 00:31
  { id: 'r-1', sectionId: 'rooms', section: 'الغرف', name: 'غرفة 1', capacity: 8, shape: 'round', status: 'available', isOccupied: false, sortOrder: 1 },
  { id: 'r-2', sectionId: 'rooms', section: 'الغرف', name: 'غرفة 2', capacity: 8, shape: 'round', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '10m 41s', elapsedSeconds: 641, sortOrder: 2 },
  { id: 'r-3', sectionId: 'rooms', section: 'الغرف', name: 'غرفة 3', capacity: 8, shape: 'round', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '22m 26s', elapsedSeconds: 1346, sortOrder: 3 },
  { id: 'r-4', sectionId: 'rooms', section: 'الغرف', name: 'غرفة 4', capacity: 8, shape: 'round', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '3m 53s', elapsedSeconds: 233, sortOrder: 4 },
  { id: 'r-5', sectionId: 'rooms', section: 'الغرف', name: 'غرفة 5', capacity: 8, shape: 'round', status: 'occupied', isOccupied: true, ticketCount: 1, elapsed: '5m 15s', elapsedSeconds: 315, sortOrder: 5 },
];

export const INITIAL_INVO_TABLES = {
  singles: DEFAULT_TABLES.filter(t => t.sectionId === 'singles'),
  families: DEFAULT_TABLES.filter(t => t.sectionId === 'families'),
  rooms: DEFAULT_TABLES.filter(t => t.sectionId === 'rooms'),
};

export const INITIAL_OPEN_ORDERS: InvoOrder[] = [
  // Dine-In Order matching Video Frame 00:00 - 00:10 (عوائل 4)
  {
    id: 'ord-70288',
    orderNumber: 'Order:70288',
    subNumber: '38',
    channel: 'dine_in',
    tableName: 'عوائل 4',
    customerName: 'عوائل 4',
    cashierName: 'ابو عايض',
    elapsedTime: '8m 20s (38)',
    total: 3.550,
    status: 'open',
    createdAt: Date.now() - 500 * 1000,
    items: [
      { id: 'itm-70288-1', name: 'مقلقل مع بخاري', qty: 1, price: 3.300 },
      { id: 'itm-70288-2', name: 'معبوج', qty: 1, price: 0.250 },
    ]
  },
  // Dine-In Order matching Video Frame 00:00 (عوائل 3)
  {
    id: 'ord-70285',
    orderNumber: 'Order:70285',
    subNumber: '35',
    channel: 'dine_in',
    tableName: 'عوائل 3',
    customerName: 'عوائل 3',
    cashierName: 'ابو عايض',
    elapsedTime: '14m 4s (35)',
    total: 2.800,
    status: 'open',
    createdAt: Date.now() - 844 * 1000,
    items: [
      { id: 'itm-70285-1', name: 'مظبي مع بخاري', qty: 1, price: 1.900 },
      { id: 'itm-70285-2', name: 'عيش زربيان', qty: 1, price: 0.800 },
      { id: 'itm-70285-3', name: 'ماء صحي', qty: 1, price: 0.100 },
    ]
  },
  // Dine-In Order (عوائل 6)
  {
    id: 'ord-70282',
    orderNumber: 'Order:70282',
    subNumber: '32',
    channel: 'dine_in',
    tableName: 'عوائل 6',
    customerName: 'عوائل 6',
    cashierName: 'ابو عايض',
    elapsedTime: '2m 13s (32)',
    total: 1.900,
    status: 'open',
    createdAt: Date.now() - 133 * 1000,
    items: [
      { id: 'itm-70282-1', name: 'مضغوط دجاج', qty: 1, price: 1.900 },
    ]
  },
  // 1. Order 69873 (33) - ابو عايض - 5.200 (Video Frame 00:04)
  {
    id: 'ord-69873',
    orderNumber: 'Order 69873',
    subNumber: '33',
    channel: 'takeaway',
    customerName: 'ابو عايض',
    cashierName: 'ابو عايض',
    elapsedTime: '58s (33)',
    total: 5.200,
    status: 'open',
    createdAt: Date.now() - 58 * 1000,
    items: [
      { id: 'i-1', name: 'مضغوط دجاج', qty: 2, price: 1.900 },
      { id: 'i-2', name: 'دجاج مظبي', qty: 1, price: 1.400 },
    ]
  },
  // 2. Order 69872 (32) - ايمن - 5.700 (Video Frame 00:04 & 00:06 & 00:18)
  {
    id: 'ord-69872',
    orderNumber: 'Order 69872',
    subNumber: '32',
    channel: 'takeaway',
    customerName: 'ايمن',
    cashierName: 'ايمن',
    elapsedTime: '1m 32s (32)',
    total: 5.700,
    status: 'open',
    createdAt: Date.now() - 92 * 1000,
    items: [
      { id: 'i-3', name: 'مضغوط دجاج', qty: 2, price: 1.900 },
      { id: 'i-4', name: 'شواية مع بشاور', qty: 1, price: 1.900, notes: 'احمد\nاترس العيش' },
    ]
  },
  // 3. Order 69870 (30) - الاحمدي - 1.300 (Video Frame 00:04)
  {
    id: 'ord-69870',
    orderNumber: 'Order 69870',
    subNumber: '30',
    channel: 'takeaway',
    customerName: 'الاحمدي',
    cashierName: 'الاحمدي',
    elapsedTime: '2m 50s (30)',
    total: 1.300,
    status: 'open',
    createdAt: Date.now() - 170 * 1000,
    items: [
      { id: 'i-5', name: 'ربع شواية مع بخاري', qty: 1, price: 1.200 },
      { id: 'i-6', name: 'ماء صحي', qty: 1, price: 0.100 },
    ]
  },
  // 4. Order 69864 (24) - ابو حسين - 7.200 (Video Frame 00:04)
  {
    id: 'ord-69864',
    orderNumber: 'Order 69864',
    subNumber: '24',
    channel: 'takeaway',
    customerName: 'ابو حسين',
    cashierName: 'ابو حسين',
    elapsedTime: '11m 51s (24)',
    total: 7.200,
    status: 'open',
    createdAt: Date.now() - 711 * 1000,
    items: [
      { id: 'i-7', name: 'مضغوط دجاج', qty: 3, price: 1.900 },
      { id: 'i-8', name: 'دجاج شواية', qty: 1, price: 1.500 },
    ]
  },
  // Extra delivery / pickup sample orders
  {
    id: 'ord-69860',
    orderNumber: 'Order 69860',
    subNumber: '20',
    channel: 'delivery',
    customerName: 'سعيد العامري',
    elapsedTime: '22m 40s (20)',
    total: 5.700,
    status: 'open',
    createdAt: Date.now() - 1360 * 1000,
    items: [
      { id: 'i-9', name: 'مضغوط دجاج', qty: 3, price: 1.900 },
    ]
  },
  {
    id: 'ord-69858',
    orderNumber: 'Order 69858',
    subNumber: '18',
    channel: 'pickup',
    customerName: 'عبدالله الحارثي',
    elapsedTime: '12m 30s (18)',
    total: 3.400,
    status: 'open',
    createdAt: Date.now() - 750 * 1000,
    items: [
      { id: 'i-10', name: 'ربع شواية مع بشاور', qty: 2, price: 1.200 },
    ]
  }
];

export const INITIAL_SETTLED_ORDERS: InvoOrder[] = [
  {
    id: 'settled-68952',
    orderNumber: 'Order 68952',
    subNumber: '29',
    channel: 'dine_in',
    tableName: 'جلسة 1',
    customerName: 'ابو حسين',
    elapsedTime: '2m 3s (29)',
    total: 3.800,
    status: 'paid',
    createdAt: Date.now() - 2 * 60 * 1000,
    items: [
      { id: 'st-1', name: 'مضغوط دجاج', qty: 2, price: 1.900 },
    ]
  },
  {
    id: 'settled-68951',
    orderNumber: 'Order 68951',
    subNumber: '28',
    channel: 'takeaway',
    customerName: 'الاحمدي',
    elapsedTime: '2m 37s (28)',
    total: 1.300,
    status: 'paid',
    createdAt: Date.now() - 3 * 60 * 1000,
    items: [
      { id: 'st-2', name: 'دجاج شواية', qty: 1, price: 1.300 },
    ]
  },
  {
    id: 'settled-68950',
    orderNumber: 'Order 68950',
    subNumber: '27',
    channel: 'dine_in',
    tableName: 'جلسة 13',
    customerName: 'محمد',
    elapsedTime: '3m 22s (27)',
    total: 1.100,
    status: 'paid',
    createdAt: Date.now() - 4 * 60 * 1000,
    items: [
      { id: 'st-3', name: 'شواية مع بخاري', qty: 1, price: 1.100 },
    ]
  },
  {
    id: 'settled-68949',
    orderNumber: 'Order 68949',
    subNumber: '26',
    channel: 'takeaway',
    customerName: 'ابو حسين',
    elapsedTime: '12m 6s (26)',
    total: 0.500,
    status: 'paid',
    createdAt: Date.now() - 12 * 60 * 1000,
    items: [
      { id: 'st-4', name: 'طحينة وزبادي', qty: 2, price: 0.250 },
    ]
  },
  {
    id: 'settled-68948',
    orderNumber: 'Order 68948',
    subNumber: '25',
    channel: 'takeaway',
    customerName: 'سامي',
    elapsedTime: '12m 20s (25)',
    total: 3.800,
    status: 'paid',
    createdAt: Date.now() - 13 * 60 * 1000,
    items: [
      { id: 'st-5', name: 'مضغوط دجاج', qty: 2, price: 1.900 },
    ]
  },
  {
    id: 'settled-68947',
    orderNumber: 'Order 68947',
    subNumber: '24',
    channel: 'dine_in',
    tableName: 'جلسة 4',
    customerName: 'ايمن',
    elapsedTime: '19m 6s (24)',
    total: 3.550,
    status: 'paid',
    createdAt: Date.now() - 19 * 60 * 1000,
    items: [
      { id: 'st-6', name: 'مظبي مع بخاري', qty: 1, price: 1.900 },
      { id: 'st-7', name: 'عريكة ملكي', qty: 1, price: 1.650 },
    ]
  },
  {
    id: 'settled-68946',
    orderNumber: 'Order 68946',
    subNumber: '23',
    channel: 'dine_in',
    tableName: 'جلسة 1',
    customerName: 'محمد',
    elapsedTime: '26m 32s (23)',
    total: 9.750,
    status: 'paid',
    createdAt: Date.now() - 27 * 60 * 1000,
    items: [
      { id: 'st-8', name: 'مضغوط دجاج', qty: 4, price: 1.900 },
      { id: 'st-9', name: 'عيش زربيان', qty: 2, price: 0.800 },
      { id: 'st-10', name: 'بيبسي', qty: 2, price: 0.275 },
    ]
  },
  {
    id: 'settled-68945',
    orderNumber: 'Order 68945',
    subNumber: '22',
    channel: 'takeaway',
    customerName: 'محمد',
    elapsedTime: '32m 3s (22)',
    total: 8.150,
    status: 'paid',
    createdAt: Date.now() - 32 * 60 * 1000,
    items: [
      { id: 'st-11', name: 'دجاج مظبي', qty: 4, price: 1.500 },
      { id: 'st-12', name: 'عيش بشاور', qty: 3, price: 0.650 },
      { id: 'st-13', name: 'طحينة', qty: 1, price: 0.200 },
    ]
  },
  {
    id: 'settled-68944',
    orderNumber: 'Order 68944',
    subNumber: '21',
    channel: 'dine_in',
    tableName: 'جلسة 1',
    customerName: 'ابو عايش',
    elapsedTime: '36m 16s (21)',
    total: 8.350,
    status: 'paid',
    createdAt: Date.now() - 36 * 60 * 1000,
    items: [
      { id: 'st-14', name: 'مضغوط دجاج', qty: 3, price: 1.900 },
      { id: 'st-15', name: 'كنافة جبن', qty: 1, price: 1.500 },
      { id: 'st-16', name: 'عيش حضرمي', qty: 1, price: 0.650 },
      { id: 'st-17', name: 'ماء', qty: 3, price: 0.200 },
    ]
  },
  {
    id: 'settled-68943',
    orderNumber: 'Order 68943',
    subNumber: '20',
    channel: 'takeaway',
    customerName: 'الاحمدي',
    elapsedTime: '38m 51s (20)',
    total: 3.800,
    status: 'paid',
    createdAt: Date.now() - 39 * 60 * 1000,
    items: [
      { id: 'st-18', name: 'مضغوط حاشي', qty: 1, price: 3.300 },
      { id: 'st-19', name: 'روب خيار', qty: 1, price: 0.250 },
      { id: 'st-20', name: 'سومطرا', qty: 1, price: 0.250 },
    ]
  },
  {
    id: 'settled-68942',
    orderNumber: 'Order 68942',
    subNumber: '19',
    channel: 'dine_in',
    tableName: 'جلسة 1',
    customerName: 'محمد',
    elapsedTime: '40m 17s (19)',
    total: 5.050,
    status: 'paid',
    createdAt: Date.now() - 40 * 60 * 1000,
    items: [
      { id: 'st-21', name: 'مظبي مع بشاور', qty: 2, price: 1.900 },
      { id: 'st-22', name: 'عريكة ملكي', qty: 1, price: 1.250 },
    ]
  },
  {
    id: 'settled-68941',
    orderNumber: 'Order 68941',
    subNumber: '18',
    channel: 'takeaway',
    customerName: 'ابو حسين',
    elapsedTime: '40m 27s (18)',
    total: 0.600,
    status: 'paid',
    createdAt: Date.now() - 41 * 60 * 1000,
    items: [
      { id: 'st-23', name: 'عيش بخاري', qty: 1, price: 0.600 },
    ]
  },
  {
    id: 'settled-68922',
    orderNumber: 'Order 68922',
    subNumber: '97',
    channel: 'takeaway',
    customerName: 'سامي',
    elapsedTime: '1h 45m 0s (97)',
    total: 1.900,
    status: 'paid',
    createdAt: Date.now() - 105 * 60 * 1000,
    items: [
      { id: 'st-24', name: 'مضغوط دجاج', qty: 1, price: 1.900 },
    ]
  },
  {
    id: 'settled-68921',
    orderNumber: 'Order 68921',
    subNumber: '96',
    channel: 'dine_in',
    tableName: 'عوائل 5',
    customerName: 'ابو عايش',
    elapsedTime: '1h 45m 15s (96)',
    total: 16.350,
    status: 'paid',
    createdAt: Date.now() - 105 * 60 * 1000,
    items: [
      { id: 'st-25', name: 'مضغوط دجاج', qty: 6, price: 1.900 },
      { id: 'st-26', name: 'لحم مضغوط', qty: 1, price: 4.500 },
      { id: 'st-27', name: 'كنافة جبن', qty: 1, price: 0.450 },
    ]
  },
  {
    id: 'settled-68920',
    orderNumber: 'Order 68920',
    subNumber: '95',
    channel: 'dine_in',
    tableName: 'عوائل 3',
    customerName: 'ابو عايش',
    elapsedTime: '1h 45m 55s (95)',
    total: 9.050,
    status: 'paid',
    createdAt: Date.now() - 106 * 60 * 1000,
    items: [
      { id: 'st-28', name: 'مضغوط دجاج', qty: 4, price: 1.900 },
      { id: 'st-29', name: 'عيش زربيان', qty: 1, price: 0.800 },
      { id: 'st-30', name: 'طحينة', qty: 2, price: 0.325 },
    ]
  },
  {
    id: 'settled-68919',
    orderNumber: 'Order 68919',
    subNumber: '94',
    channel: 'dine_in',
    tableName: 'عوائل 2',
    customerName: 'ابو عايش',
    elapsedTime: '1h 48m 2s (94)',
    total: 11.950,
    status: 'paid',
    createdAt: Date.now() - 108 * 60 * 1000,
    items: [
      { id: 'st-31', name: 'مضغوط دجاج', qty: 5, price: 1.900 },
      { id: 'st-32', name: 'عريكة ملكي', qty: 1, price: 1.800 },
      { id: 'st-33', name: 'بيبسي', qty: 2, price: 0.325 },
    ]
  },
  {
    id: 'settled-68918',
    orderNumber: 'Order 68918',
    subNumber: '93',
    channel: 'takeaway',
    customerName: 'سامي',
    elapsedTime: '1h 55m 37s (93)',
    total: 1.900,
    status: 'paid',
    createdAt: Date.now() - 115 * 60 * 1000,
    items: [
      { id: 'st-34', name: 'مضغوط دجاج', qty: 1, price: 1.900 },
    ]
  },
  {
    id: 'settled-68917',
    orderNumber: 'Order 68917',
    subNumber: '92',
    channel: 'takeaway',
    customerName: 'ايمن',
    elapsedTime: '1h 56m 17s (92)',
    total: 2.150,
    status: 'paid',
    createdAt: Date.now() - 116 * 60 * 1000,
    items: [
      { id: 'st-35', name: 'مظبي مع بخاري', qty: 1, price: 1.900 },
      { id: 'st-36', name: 'طحينة', qty: 1, price: 0.250 },
    ]
  },
];

export const INITIAL_DELETED_ORDERS: InvoOrder[] = [
  {
    id: 'del-70199',
    orderNumber: 'Order 70199',
    subNumber: '15',
    channel: 'dine_in',
    tableName: 'جلسة 4',
    customerName: 'زبون محلي',
    elapsedTime: '15m 20s',
    total: 3.800,
    status: 'open',
    originalStatus: 'open',
    isDeleted: true,
    deletedAt: Date.now() - 45 * 60 * 1000,
    deletedBy: 'ابو عايض (مدير)',
    deletedByRole: 'مدير فرع',
    deleteReason: 'تغيير الطلب ورغبة الزبون بالجلوس في العوائل',
    items: [
      { id: 'del-it-1', name: 'شواية مع بخاري', qty: 2, price: 1.900 },
    ]
  },
  {
    id: 'del-70195',
    orderNumber: 'Order 70195',
    subNumber: '11',
    channel: 'takeaway',
    customerName: 'طلب سفري - احمد',
    elapsedTime: '8m 10s',
    total: 4.750,
    status: 'open',
    originalStatus: 'open',
    isDeleted: true,
    deletedAt: Date.now() - 120 * 60 * 1000,
    deletedBy: 'ابو عايض (مدير)',
    deletedByRole: 'مدير فرع',
    deleteReason: 'إلغاء الطلب من قبل العميل قبل التجهيز',
    items: [
      { id: 'del-it-2', name: 'لحم مضغوط', qty: 1, price: 4.500 },
      { id: 'del-it-3', name: 'معبوج', qty: 1, price: 0.250 },
    ]
  }
];

