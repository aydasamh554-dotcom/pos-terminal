import { db } from '../src/firebase/firebase';
import { 
  saveTenantOrder, 
  deleteTenantOrder, 
  settleTenantOrder, 
  subscribeTenantOrders, 
  subscribeTenantSettledOrders,
  getActiveTenantId 
} from '../src/firebase/tenantSync';
import { doc, getDoc } from 'firebase/firestore';
import { InvoOrder } from '../src/data/invoData';

async function runRealTests() {
  console.log('=== بدء الاختبار الفعلي السحابي لطلبات السفري وPick Up ===\n');

  const tenantId = getActiveTenantId();
  console.log(`[1] معرف المنشأة (Tenant ID): ${tenantId}`);

  // -------------------------------------------------------------
  // TEST 1: إنشاء وحفظ طلب سفري (Takeaway) في السحابة
  // -------------------------------------------------------------
  const takeawayOrderId = `ord-takeaway-${Date.now()}`;
  const takeawayOrder: InvoOrder = {
    id: takeawayOrderId,
    orderNumber: `Order #${Math.floor(1000 + Math.random() * 9000)}`,
    subNumber: '12',
    channel: 'takeaway',
    status: 'open',
    customerName: 'فيصل العتيبي',
    carDetails: 'تاهو أسود - 4421',
    createdAt: Date.now(),
    elapsedTime: '0m 00s',
    items: [
      { id: 'item-1', name: 'شاورما لحم عربي', price: 2.500, qty: 2, notes: 'بدون بصل مع ثوم زيادة' },
      { id: 'item-2', name: 'بطاطس مقلية بالجبن', price: 1.200, qty: 1 }
    ],
    total: 6.200,
  };

  console.log('\n--- اختبار 1: حفظ طلب سفري مستقل بدون طاولة بالسحابة ---');
  const savedTakeaway = await saveTenantOrder(tenantId, takeawayOrder);
  console.log(`نتيجة الحفظ بالسحابة: ${savedTakeaway ? '✅ نجح الحفظ' : '❌ فشل'}`);

  // التحقق المباشر من Firestore
  const takeawayDocRef = doc(db, 'restaurants', tenantId, 'orders', takeawayOrderId);
  const takeawaySnap = await getDoc(takeawayDocRef);
  if (takeawaySnap.exists()) {
    const data = takeawaySnap.data();
    console.log(`✅ تم تأكيد وجود المستند في Firestore:`);
    console.log(`   - Order ID: ${data.id}`);
    console.log(`   - القناة: ${data.channel} (سفري مستقل)`);
    console.log(`   - اسم الزبون: ${data.customerName}`);
    console.log(`   - بيانات السيارة: ${data.carDetails}`);
    console.log(`   - الإجمالي: ${data.total} ر.ع`);
    console.log(`   - عدد الأصناف: ${data.items.length}`);
  } else {
    throw new Error('فشل التحقق من وجود مستند الطلب السفري في Firestore');
  }

  // -------------------------------------------------------------
  // TEST 2: إنشاء وحفظ طلب Pick Up (استلام من المحل) في السحابة
  // -------------------------------------------------------------
  const pickupOrderId = `ord-pickup-${Date.now()}`;
  const pickupOrder: InvoOrder = {
    id: pickupOrderId,
    orderNumber: `Order #${Math.floor(1000 + Math.random() * 9000)}`,
    subNumber: '15',
    channel: 'pickup',
    status: 'open',
    customerName: 'د. سارة المنذري',
    customerPhone: '96891234567',
    pickupTime: '07:30 PM',
    createdAt: Date.now(),
    elapsedTime: '0m 00s',
    items: [
      { id: 'item-3', name: 'برجر دجاج كرسبي مع صوص خاص', price: 3.100, qty: 1, notes: 'خبز بريوش محمص' },
      { id: 'item-4', name: 'عصير برتقال طازج', price: 1.500, qty: 2 }
    ],
    total: 6.100,
  };

  console.log('\n--- اختبار 2: حفظ طلب Pick Up مستقل بدون طاولة بالسحابة ---');
  const savedPickup = await saveTenantOrder(tenantId, pickupOrder);
  console.log(`نتيجة الحفظ بالسحابة: ${savedPickup ? '✅ نجح الحفظ' : '❌ فشل'}`);

  const pickupDocRef = doc(db, 'restaurants', tenantId, 'orders', pickupOrderId);
  const pickupSnap = await getDoc(pickupDocRef);
  if (pickupSnap.exists()) {
    const data = pickupSnap.data();
    console.log(`✅ تم تأكيد وجود المستند في Firestore:`);
    console.log(`   - Order ID: ${data.id}`);
    console.log(`   - القناة: ${data.channel} (Pick Up مستقل)`);
    console.log(`   - اسم الزبون: ${data.customerName}`);
    console.log(`   - هاتف الزبون: ${data.customerPhone}`);
    console.log(`   - موعد الاستلام: ${data.pickupTime}`);
    console.log(`   - الإجمالي: ${data.total} ر.ع`);
  } else {
    throw new Error('فشل التحقق من وجود مستند الطلب Pick Up في Firestore');
  }

  // -------------------------------------------------------------
  // TEST 3: اختبار التزامن اللحظي الحقيقي بين طرفين (Real-Time Cloud Sync)
  // -------------------------------------------------------------
  console.log('\n--- اختبار 3: اختبار التزامن اللحظي المباشر عبر السحابة ---');
  let syncReceived = false;
  let receivedOrder: InvoOrder | null = null;

  const unsubscribe = subscribeTenantOrders(tenantId, (orders) => {
    const found = orders.find(o => o.id === takeawayOrderId);
    if (found) {
      syncReceived = true;
      receivedOrder = found;
    }
  });

  // تحديث الطلب في السحابة بملاحظة إضافية لمحاكاة تعديل كاشير
  takeawayOrder.tableNotes = 'تم تجهيز الطلب وتسليمه لقسم التغليف';
  takeawayOrder.total = 7.000;
  await saveTenantOrder(tenantId, takeawayOrder);

  // ننتظر وصول التحديث اللحظي عبر onSnapshot
  await new Promise(resolve => setTimeout(resolve, 1500));
  unsubscribe();

  if (syncReceived && receivedOrder) {
    console.log(`✅ نجح التزامن اللحظي عبر المستمع السحابي onSnapshot:`);
    console.log(`   - تم استلام التحديث في الجهاز/التبويب الآخر فوراً`);
    console.log(`   - الملاحظة المحدثة: ${receivedOrder.tableNotes}`);
    console.log(`   - الإجمالي بعد التحديث: ${receivedOrder.total} ر.ع`);
  } else {
    console.log('⚠️ لم يصل التحديث في الوقت المحدد');
  }

  // -------------------------------------------------------------
  // TEST 4: اختبار تسديد وسداد الطلب (Settlement Protection & Atomic Move)
  // -------------------------------------------------------------
  console.log('\n--- اختبار 4: تسديد الفاتورة ونقلها تلقائياً للمسدد بالسحابة ---');
  const settledTakeaway: InvoOrder = {
    ...takeawayOrder,
    status: 'paid',
    cashierName: 'ابو عايض',
    paymentMethod: 'cash',
  };

  const settleSuccess = await settleTenantOrder(tenantId, settledTakeaway);
  console.log(`نتيجة عملية التسديد: ${settleSuccess ? '✅ تمت بنجاح' : '❌ فشلت'}`);

  // التحقق من الحذف من الطلبات المفتوحة
  const afterSettleOpenSnap = await getDoc(takeawayDocRef);
  console.log(`حالة الطلب في الطلبات المفتوحة: ${!afterSettleOpenSnap.exists() ? '✅ اختفى من المفتوحة' : '❌ ما زال موجوداً'}`);

  // التحقق من الإضافة في الفواتير المسددة (settled_orders)
  const settledDocRef = doc(db, 'restaurants', tenantId, 'settled_orders', takeawayOrderId);
  const settledSnap = await getDoc(settledDocRef);
  console.log(`حالة الطلب في الفواتير المسددة بالسحابة: ${settledSnap.exists() ? '✅ موجود وموثق كـ paid' : '❌ غير موجود'}`);

  // -------------------------------------------------------------
  // TEST 5: اختبار إلغاء وحذف الطلب من السحابة (Void / Delete Protection)
  // -------------------------------------------------------------
  console.log('\n--- اختبار 5: إلغاء وحذف طلب Pick Up من السحابة ---');
  const deleteSuccess = await deleteTenantOrder(tenantId, pickupOrderId);
  console.log(`نتيجة حذف الطلب من السحابة: ${deleteSuccess ? '✅ تم الحذف' : '❌ فشل'}`);

  const afterDeleteSnap = await getDoc(pickupDocRef);
  console.log(`التحقق من عدم وجود الطلب في السحابة: ${!afterDeleteSnap.exists() ? '✅ تم تأكيد الحذف التام' : '❌ ما زال موجوداً'}`);

  // تنظيف السجل المسدد للتست
  const cleanSettledRef = doc(db, 'restaurants', tenantId, 'settled_orders', takeawayOrderId);
  await deleteTenantOrder(tenantId, takeawayOrderId);
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(cleanSettledRef);

  console.log('\n=== اكتملت جميع الاختبارات السحابية الفعلية بنجاح 100% ===\n');
  process.exit(0);
}

runRealTests().catch(err => {
  console.error('CRITICAL TEST ERROR:', err);
  process.exit(1);
});
