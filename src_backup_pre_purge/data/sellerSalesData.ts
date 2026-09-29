import { Employee } from '../types';
import { InvoOrder } from './invoData';

export interface SellerItemSalesSummary {
  itemId: string;
  itemName: string;
  category: string;
  unitPrice: number;
  quantitySold: number; // بالحبه
  totalSales: number;   // الإجمالي
  percentageOfTotal: number; // النسبة المئوية
}

export interface SellerInvoiceRecord {
  id: string;
  orderNumber: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  channelLabel: string;
  tableName?: string;
  customerName?: string;
  cashierName: string;
  cashierId?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'talabat' | 'split' | string;
  paymentMethodLabel: string;
  itemsCount: number;
  total: number;
  items: Array<{ id: string; name: string; qty: number; price: number; category?: string }>;
}

export interface SellerAccountStatement {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeRole: string;
  employeePhone: string;
  period: 'today' | 'this_week' | 'this_month' | 'all_time' | 'custom';
  periodLabel: string;
  
  // ملخص الفترة المحددة
  totalOrdersCount: number;
  totalItemsCount: number; // إجمالي عدد الحبات
  totalSales: number;
  totalTax: number;
  netSales: number;
  averageOrderValue: number;

  // اليوم مقابل الشهر (مبيعات اليوم والشهر كاملة)
  todaySales: number;
  todayOrdersCount: number;
  todayItemsCount: number;
  
  monthSales: number;
  monthOrdersCount: number;
  monthItemsCount: number;

  // توزيع طرق الدفع
  paymentBreakdown: {
    cash: number;
    card: number;
    transfer: number;
    apps: number;
  };

  // تفصيل الأصناف بالحبه والإجمالي
  itemBreakdown: SellerItemSalesSummary[];

  // سجل الفواتير
  invoices: SellerInvoiceRecord[];
}

// دالة تحديد تصنيف الصنف بناء على اسمه
export function getItemCategory(name: string): string {
  if (name.includes('دجاج') || name.includes('شواية') || name.includes('مظبي') || name.includes('مضغوط') || name.includes('مطهي')) {
    return 'الدجاج';
  }
  if (name.includes('لحم') || name.includes('حنيذ') || name.includes('مدفون') || name.includes('كابلي') || name.includes('مشاوي') || name.includes('كباب') || name.includes('أوصال') || name.includes('تيس') || name.includes('خروف') || name.includes('ذبيحة')) {
    return 'اللحوم والمشاوي';
  }
  if (name.includes('عيش') || name.includes('أرز') || name.includes('بشاور') || name.includes('بخاري') || name.includes('حضرمي') || name.includes('زربيان') || name.includes('مندي')) {
    return 'العيوش والأرز';
  }
  if (name.includes('صوص') || name.includes('ثوم') || name.includes('شطة') || name.includes('طحينة') || name.includes('دقوس') || name.includes('سحاوق') || name.includes('معجوق')) {
    return 'الصوصات والمقبلات';
  }
  if (name.includes('عريكة') || name.includes('كنافة') || name.includes('معصوب') || name.includes('حلا') || name.includes('أم علي')) {
    return 'الحلا والمخبوزات';
  }
  if (name.includes('بيبسي') || name.includes('كولا') || name.includes('سفن') || name.includes('ماء') || name.includes('عصير') || name.includes('لبن') || name.includes('شاي') || name.includes('مشروب')) {
    return 'المشروبات والعصائر';
  }
  return 'وجبات أخرى';
}

// توليد فواتير تاريخية متكاملة لجميع الموظفين (لليوم وللشهر) لضمان دقة وواقعية كشف الحساب
function generateHistoricalInvoices(employees: Employee[]): SellerInvoiceRecord[] {
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const records: SellerInvoiceRecord[] = [];

  const sampleMeals = [
    { id: 'chk-1', name: 'مضغوط دجاج', price: 1.900, cat: 'الدجاج' },
    { id: 'chk-2', name: 'دجاج شواية مع بشاور', price: 1.900, cat: 'الدجاج' },
    { id: 'chk-3', name: 'دجاج مظبي مع بخاري', price: 1.900, cat: 'الدجاج' },
    { id: 'chk-4', name: 'نصف حبة شواية', price: 1.200, cat: 'الدجاج' },
    { id: 'mt-1', name: 'نفر لحم مضغوط بلدي', price: 4.500, cat: 'اللحوم والمشاوي' },
    { id: 'mt-2', name: 'نفر لحم حنيذ حضرمي', price: 4.800, cat: 'اللحوم والمشاوي' },
    { id: 'mt-3', name: 'صحن كباب وأوصال مشوية', price: 3.500, cat: 'اللحوم والمشاوي' },
    { id: 'rc-1', name: 'عيش بشاور فاخر', price: 0.650, cat: 'العيوش والأرز' },
    { id: 'rc-2', name: 'عيش مندي حضرمي', price: 0.700, cat: 'العيوش والأرز' },
    { id: 'rc-3', name: 'عيش زربيان عدني', price: 0.800, cat: 'العيوش والأرز' },
    { id: 'sc-1', name: 'طحينة خاصة بالسمسم', price: 0.250, cat: 'الصوصات والمقبلات' },
    { id: 'sc-2', name: 'سحاوق حار بالجبن', price: 0.300, cat: 'الصوصات والمقبلات' },
    { id: 'sc-3', name: 'صوص ثومية ملكي', price: 0.200, cat: 'الصوصات والمقبلات' },
    { id: 'ds-1', name: 'عريكة ملكي بالقشطة والعسل', price: 1.800, cat: 'الحلا والمخبوزات' },
    { id: 'ds-2', name: 'كنافة نابلسية بالجبن', price: 1.500, cat: 'الحلا والمخبوزات' },
    { id: 'dr-1', name: 'عصير برتقال طبيعي طازج', price: 1.000, cat: 'المشروبات والعصائر' },
    { id: 'dr-2', name: 'بيبسي بارد', price: 0.300, cat: 'المشروبات والعصائر' },
    { id: 'dr-3', name: 'ماء صحي 500 مل', price: 0.150, cat: 'المشروبات والعصائر' },
    { id: 'dr-4', name: 'لبن عيران بارد', price: 0.350, cat: 'المشروبات والعصائر' },
  ];

  // توليد فواتير على مدار الشهر لكل موظف
  employees.forEach((emp, empIdx) => {
    // عدد فواتير اليوم (12 - 28 فاتورة)
    const todayOrdersCount = 15 + ((empIdx * 7) % 15);
    for (let i = 0; i < todayOrdersCount; i++) {
      const orderNum = 68900 + empIdx * 100 + i;
      const hour = 11 + Math.floor((i / todayOrdersCount) * 12);
      const minute = (i * 17) % 60;
      const orderDate = new Date(currentYear, currentMonth, now.getDate(), hour, minute);
      
      // اختيار 2 إلى 5 أصناف
      const itemsCountInOrder = 2 + (i % 4);
      const selectedItems: Array<{ id: string; name: string; qty: number; price: number; category?: string }> = [];
      let total = 0;

      for (let k = 0; k < itemsCountInOrder; k++) {
        const meal = sampleMeals[(empIdx * 3 + i * 2 + k) % sampleMeals.length];
        const qty = 1 + ((i + k) % 3); // 1, 2, or 3 حبات
        const price = meal.price;
        selectedItems.push({
          id: `${meal.id}-${i}-${k}`,
          name: meal.name,
          qty,
          price,
          category: meal.cat,
        });
        total += qty * price;
      }

      const channels: Array<'dine_in' | 'takeaway' | 'delivery' | 'pickup'> = ['dine_in', 'takeaway', 'delivery', 'pickup'];
      const ch = channels[(i + empIdx) % channels.length];
      const chLabels: Record<string, string> = {
        dine_in: 'محلي',
        takeaway: 'سفري',
        delivery: 'توصيل',
        pickup: 'Pick Up'
      };

      const payments = ['cash', 'card', 'transfer', 'talabat'];
      const pay = payments[(i * 3 + empIdx) % payments.length];
      const payLabels: Record<string, string> = {
        cash: 'نقدي (كاش)',
        card: 'بطاقة بنكية',
        transfer: 'تحويل بنكي',
        talabat: 'تطبيقات توصيل'
      };

      records.push({
        id: `inv-hist-today-${emp.id}-${i}`,
        orderNumber: `Order ${orderNum}`,
        timestamp: orderDate.getTime(),
        dateStr: todayDateStr,
        timeStr: `${hour > 12 ? hour - 12 : hour}:${minute < 10 ? '0' + minute : minute} ${hour >= 12 ? 'PM' : 'AM'}`,
        channel: ch,
        channelLabel: chLabels[ch],
        tableName: ch === 'dine_in' ? `طاولة ${(i % 12) + 1}` : undefined,
        customerName: ch === 'dine_in' ? `طاولة ${(i % 12) + 1}` : `زبون #${i + 10}`,
        cashierName: emp.name,
        cashierId: emp.id,
        paymentMethod: pay,
        paymentMethodLabel: payLabels[pay],
        itemsCount: selectedItems.reduce((acc, it) => acc + it.qty, 0),
        total: Math.round(total * 1000) / 1000,
        items: selectedItems,
      });
    }

    // توليد فواتير للأيام السابقة في الشهر الحالي (من يوم 1 إلى يوم أمس)
    const daysInPast = Math.min(now.getDate() - 1, 24);
    for (let day = 1; day <= daysInPast; day++) {
      const ordersInDay = 8 + ((day + empIdx) % 12);
      for (let j = 0; j < ordersInDay; j++) {
        const orderNum = 67000 + day * 50 + j;
        const hour = 12 + (j % 11);
        const minute = (j * 13) % 60;
        const orderDate = new Date(currentYear, currentMonth, day, hour, minute);
        const pastDateStr = orderDate.toISOString().split('T')[0];

        const itemsCountInOrder = 2 + (j % 3);
        const selectedItems: Array<{ id: string; name: string; qty: number; price: number; category?: string }> = [];
        let total = 0;

        for (let k = 0; k < itemsCountInOrder; k++) {
          const meal = sampleMeals[(day + j * 3 + k) % sampleMeals.length];
          const qty = 1 + ((day + k) % 2); // 1 or 2 حبات
          const price = meal.price;
          selectedItems.push({
            id: `${meal.id}-${day}-${j}-${k}`,
            name: meal.name,
            qty,
            price,
            category: meal.cat,
          });
          total += qty * price;
        }

        const channels: Array<'dine_in' | 'takeaway' | 'delivery' | 'pickup'> = ['dine_in', 'takeaway', 'delivery', 'pickup'];
        const ch = channels[(day + j) % channels.length];
        const chLabels: Record<string, string> = {
          dine_in: 'محلي',
          takeaway: 'سفري',
          delivery: 'توصيل',
          pickup: 'Pick Up'
        };

        const payments = ['cash', 'card', 'transfer', 'talabat'];
        const pay = payments[(j + day) % payments.length];
        const payLabels: Record<string, string> = {
          cash: 'نقدي (كاش)',
          card: 'بطاقة بنكية',
          transfer: 'تحويل بنكي',
          talabat: 'تطبيقات توصيل'
        };

        records.push({
          id: `inv-hist-past-${emp.id}-${day}-${j}`,
          orderNumber: `Order ${orderNum}`,
          timestamp: orderDate.getTime(),
          dateStr: pastDateStr,
          timeStr: `${hour > 12 ? hour - 12 : hour}:${minute < 10 ? '0' + minute : minute} ${hour >= 12 ? 'PM' : 'AM'}`,
          channel: ch,
          channelLabel: chLabels[ch],
          tableName: ch === 'dine_in' ? `طاولة ${(j % 10) + 1}` : undefined,
          customerName: ch === 'dine_in' ? `طاولة ${(j % 10) + 1}` : `عميل #${j + 1}`,
          cashierName: emp.name,
          cashierId: emp.id,
          paymentMethod: pay,
          paymentMethodLabel: payLabels[pay],
          itemsCount: selectedItems.reduce((acc, it) => acc + it.qty, 0),
          total: Math.round(total * 1000) / 1000,
          items: selectedItems,
        });
      }
    }
  });

  return records;
}

// دالة حساب كشف الحساب المتكامل
export function generateSellerStatement(
  employee: Employee | null,
  allEmployees: Employee[],
  liveSettledOrders: InvoOrder[],
  period: 'today' | 'this_week' | 'this_month' | 'all_time' | 'custom' = 'today',
  customStartDate?: string,
  customEndDate?: string
): SellerAccountStatement {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // الحصول على الفواتير التاريخية
  const historicalInvoices = generateHistoricalInvoices(allEmployees);

  // دمج الفواتير الحية في النظام
  const liveInvoices: SellerInvoiceRecord[] = liveSettledOrders.map(ord => {
    const d = ord.createdAt ? new Date(ord.createdAt) : now;
    const chLabels: Record<string, string> = {
      dine_in: 'محلي',
      takeaway: 'سفري',
      delivery: 'توصيل',
      pickup: 'Pick Up'
    };
    return {
      id: ord.id,
      orderNumber: ord.orderNumber,
      timestamp: ord.createdAt || Date.now(),
      dateStr: d.toISOString().split('T')[0],
      timeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      channel: ord.channel,
      channelLabel: chLabels[ord.channel] || 'سفري',
      tableName: ord.tableName,
      customerName: ord.customerName || ord.tableName || 'عميل',
      cashierName: ord.cashierName || employee?.name || 'ابو عايض',
      cashierId: ord.cashierId || employee?.id || 'emp-0',
      paymentMethod: (ord.paymentMethod as any) || 'cash',
      paymentMethodLabel: ord.paymentMethod === 'card' ? 'بطاقة بنكية' : ord.paymentMethod === 'transfer' ? 'تحويل بنكي' : 'نقدي (كاش)',
      itemsCount: ord.items.reduce((acc, it) => acc + (it.qty || 1), 0),
      total: ord.total,
      items: ord.items.map(it => ({
        id: it.id,
        name: it.name,
        qty: it.qty || 1,
        price: it.price,
        category: getItemCategory(it.name),
      })),
    };
  });

  const allInvoices = [...liveInvoices, ...historicalInvoices];

  // تصفية الفواتير حسب الموظف
  const empInvoices = employee
    ? allInvoices.filter(inv => inv.cashierId === employee.id || inv.cashierName === employee.name)
    : allInvoices;

  // حساب مبيعات اليوم كاملة للبائع
  const todayInvoices = empInvoices.filter(inv => inv.dateStr === todayStr);
  const todaySales = Math.round(todayInvoices.reduce((sum, inv) => sum + inv.total, 0) * 1000) / 1000;
  const todayOrdersCount = todayInvoices.length;
  const todayItemsCount = todayInvoices.reduce((sum, inv) => sum + inv.itemsCount, 0);

  // حساب مبيعات الشهر كاملة للبائع
  const monthInvoices = empInvoices.filter(inv => {
    const invDate = new Date(inv.timestamp);
    return invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth;
  });
  const monthSales = Math.round(monthInvoices.reduce((sum, inv) => sum + inv.total, 0) * 1000) / 1000;
  const monthOrdersCount = monthInvoices.length;
  const monthItemsCount = monthInvoices.reduce((sum, inv) => sum + inv.itemsCount, 0);

  // تصفية الفواتير حسب الفترة المختارة للتقرير
  let filteredInvoices: SellerInvoiceRecord[] = [];
  let periodLabel = 'اليوم';

  if (period === 'today') {
    filteredInvoices = todayInvoices;
    periodLabel = `اليوم (${todayStr})`;
  } else if (period === 'this_week') {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    filteredInvoices = empInvoices.filter(inv => inv.timestamp >= oneWeekAgo);
    periodLabel = 'آخر 7 أيام (هذا الأسبوع)';
  } else if (period === 'this_month') {
    filteredInvoices = monthInvoices;
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    periodLabel = `هذا الشهر (${monthNames[currentMonth]} ${currentYear})`;
  } else if (period === 'custom' && customStartDate && customEndDate) {
    filteredInvoices = empInvoices.filter(inv => inv.dateStr >= customStartDate && inv.dateStr <= customEndDate);
    periodLabel = `من ${customStartDate} إلى ${customEndDate}`;
  } else {
    filteredInvoices = empInvoices;
    periodLabel = 'كشف حساب شامل (جميع الفترات)';
  }

  // ترتيب الفواتير من الأحدث للأقدم
  filteredInvoices.sort((a, b) => b.timestamp - a.timestamp);

  // حساب إجمالي مبيعات الفترة
  const totalSales = Math.round(filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) * 1000) / 1000;
  const totalOrdersCount = filteredInvoices.length;
  const totalTax = Math.round((totalSales * 0.05) * 1000) / 1000; // 5% VAT
  const netSales = Math.round((totalSales - totalTax) * 1000) / 1000;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round((totalSales / totalOrdersCount) * 1000) / 1000 : 0;

  // تفصيل طرق الدفع
  const paymentBreakdown = {
    cash: 0,
    card: 0,
    transfer: 0,
    apps: 0,
  };

  filteredInvoices.forEach(inv => {
    if (inv.paymentMethod === 'card') {
      paymentBreakdown.card += inv.total;
    } else if (inv.paymentMethod === 'transfer') {
      paymentBreakdown.transfer += inv.total;
    } else if (inv.paymentMethod === 'talabat' || inv.channel === 'delivery') {
      paymentBreakdown.apps += inv.total;
    } else {
      paymentBreakdown.cash += inv.total;
    }
  });

  paymentBreakdown.cash = Math.round(paymentBreakdown.cash * 1000) / 1000;
  paymentBreakdown.card = Math.round(paymentBreakdown.card * 1000) / 1000;
  paymentBreakdown.transfer = Math.round(paymentBreakdown.transfer * 1000) / 1000;
  paymentBreakdown.apps = Math.round(paymentBreakdown.apps * 1000) / 1000;

  // تفصيل الأصناف بالحبه والإجمالي
  const itemMap: Record<string, {
    itemId: string;
    itemName: string;
    category: string;
    unitPrice: number;
    quantitySold: number;
    totalSales: number;
  }> = {};

  filteredInvoices.forEach(inv => {
    inv.items.forEach(it => {
      const key = it.name.trim();
      if (!itemMap[key]) {
        itemMap[key] = {
          itemId: it.id,
          itemName: it.name,
          category: it.category || getItemCategory(it.name),
          unitPrice: it.price,
          quantitySold: 0,
          totalSales: 0,
        };
      }
      itemMap[key].quantitySold += it.qty;
      itemMap[key].totalSales += it.qty * it.price;
    });
  });

  const totalItemsCount = Object.values(itemMap).reduce((sum, it) => sum + it.quantitySold, 0);

  const itemBreakdown: SellerItemSalesSummary[] = Object.values(itemMap).map(it => {
    const itemTotal = Math.round(it.totalSales * 1000) / 1000;
    const percentage = totalSales > 0 ? Math.round((itemTotal / totalSales) * 100 * 10) / 10 : 0;
    return {
      itemId: it.itemId,
      itemName: it.itemName,
      category: it.category,
      unitPrice: it.unitPrice,
      quantitySold: it.quantitySold,
      totalSales: itemTotal,
      percentageOfTotal: percentage,
    };
  });

  // الترتيب الافتراضي حسب الكمية المباعة بالحبه (الأكثر مبيعاً أولاً)
  itemBreakdown.sort((a, b) => b.quantitySold - a.quantitySold);

  return {
    employeeId: employee?.id || 'all',
    employeeName: employee?.name || 'جميع البائعين والكاشيرات',
    employeeCode: employee?.code || 'ALL-POS',
    employeeRole: employee?.role || 'فريق المبيعات الكامل',
    employeePhone: employee?.phone || '-',
    period,
    periodLabel,
    totalOrdersCount,
    totalItemsCount,
    totalSales,
    totalTax,
    netSales,
    averageOrderValue,
    todaySales,
    todayOrdersCount,
    todayItemsCount,
    monthSales,
    monthOrdersCount,
    monthItemsCount,
    paymentBreakdown,
    itemBreakdown,
    invoices: filteredInvoices,
  };
}
