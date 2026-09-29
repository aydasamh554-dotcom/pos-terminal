import { MenuItem, RestaurantTable } from '../types';

export interface InvoOrder {
  id: string;
  orderNumber: string; // e.g. "Order 68943"
  subNumber: string; // e.g. "20"
  channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  tableName?: string;
  tableNotes?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryDriverId?: string;
  deliveryDriverName?: string;
  carDetails?: string; // For takeaway
  pickupTime?: string; // For Pick Up
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
  tenantId?: string;
  guestCount?: number;
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

export const DEFAULT_TABLES: RestaurantTable[] = [];

export const INITIAL_INVO_TABLES = {
  singles: [] as RestaurantTable[],
  families: [] as RestaurantTable[],
  rooms: [] as RestaurantTable[],
};

export const INITIAL_OPEN_ORDERS: InvoOrder[] = [];

export const INITIAL_SETTLED_ORDERS: InvoOrder[] = [];

export const INITIAL_DELETED_ORDERS: InvoOrder[] = [];

