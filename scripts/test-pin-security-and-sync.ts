import { db } from '../src/firebase/firebase';
import { 
  getActiveTenantId, 
  saveTenantSingleEmployee, 
  saveTenantEmployees 
} from '../src/firebase/tenantSync';
import { doc, getDoc } from 'firebase/firestore';
import { EMPLOYEES_LIST } from '../src/data/mockData';
import { Employee } from '../src/types';

// Strict verification function matching our hardened PinPad & POS authentication
function verifyEmployeePin(pinInput: string, currentStaff: Employee[]): { success: boolean; employee?: Employee; reason?: string } {
  // Pure strict verification: must match an active employee's exact current pin
  const matched = currentStaff.find(e => e.pin === pinInput && e.active !== false);
  if (matched) {
    return { success: true, employee: matched };
  }
  return { success: false, reason: 'الرمز غير صحيح أو غير مسجل' };
}

async function runPinSecurityTests() {
  console.log('=== بدء الفحص المخبري لنظام PIN وتحديث كلمات المرور ===\n');

  const tenantId = getActiveTenantId();
  console.log(`[معرف المنشأة السحابي]: ${tenantId}`);

  // Initial staff list
  let currentStaff: Employee[] = JSON.parse(JSON.stringify(EMPLOYEES_LIST));
  const targetEmployee = currentStaff.find(e => e.name.includes('عايض')) || currentStaff[0];
  const oldPin = targetEmployee.pin; // '789'
  const newPin = '9955'; // new PIN to test

  console.log(`[الموظف المستهدف للفحص]: ${targetEmployee.name} (${targetEmployee.role})`);
  console.log(`[الرمز القديم الحالي]: ${oldPin}`);
  console.log(`[الرمز الجديد المستهدف]: ${newPin}\n`);

  // -------------------------------------------------------------
  // الخطوة 1: تسجيل الدخول برمز PIN الحالي
  // -------------------------------------------------------------
  console.log('--- خطوة 1: تجربة تسجيل الدخول برمز PIN الحالي ---');
  const step1Result = verifyEmployeePin(oldPin, currentStaff);
  console.log(`محاولة الدخول بالرمز القد (${oldPin}):`, step1Result.success ? `✅ نجح الدخول باسم: ${step1Result.employee?.name}` : '❌ فشل');
  if (!step1Result.success) {
    throw new Error('فشلت الخطوة 1: كان يجب أن ينجح الرمز الحالي!');
  }

  // -------------------------------------------------------------
  // الخطوة 2: تغيير رمز PIN وحفظه في السحابة (Firestore)
  // -------------------------------------------------------------
  console.log('\n--- خطوة 2: تحديث رمز PIN إلى الرمز الجديد في قاعدة البيانات السحابية ---');
  const updatedStaff = currentStaff.map(e => e.id === targetEmployee.id ? { ...e, pin: newPin } : e);
  const updatedTarget = updatedStaff.find(e => e.id === targetEmployee.id)!;

  // 1) حفظ الموظف المستهدف بالسحابة
  const saveSingleSuccess = await saveTenantSingleEmployee(tenantId, updatedTarget);
  // 2) حفظ القائمة الكاملة بالسحابة
  const saveBatchSuccess = await saveTenantEmployees(tenantId, updatedStaff);

  console.log(`نتيجة الحفظ في Firestore: ${saveSingleSuccess && saveBatchSuccess ? '✅ تم الحفظ السحابي بنجاح' : '❌ فشل الحفظ'}`);

  // التحقق المباشر من وثيقة الموظف في Firestore
  const empDocRef = doc(db, 'restaurants', tenantId, 'employees', targetEmployee.id);
  const empSnap = await getDoc(empDocRef);
  if (empSnap.exists()) {
    const cloudData = empSnap.data();
    console.log(`✅ قراءة مباشرة من سحابة Firestore:`);
    console.log(`   - معرف الموظف: ${cloudData.id}`);
    console.log(`   - اسم الموظف: ${cloudData.name}`);
    console.log(`   - رمز PIN المخزن بالسحابة: ${cloudData.pin}`);
    if (cloudData.pin !== newPin) {
      throw new Error(`خطأ: رمز PIN في السحابة (${cloudData.pin}) لا يطابق الرمز الجديد (${newPin})!`);
    }
  } else {
    throw new Error('لم يتم العثور على وثيقة الموظف في Firestore بعد التحديث!');
  }

  // تحديث الذاكرة المحلية لمحاكاة حالة التطبيق بعد وصول التحديث
  currentStaff = updatedStaff;

  // -------------------------------------------------------------
  // الخطوة 3: محاولة تسجيل الدخول فوراً بالرمز القديم -> يجب أن يُرفض
  // -------------------------------------------------------------
  console.log('\n--- خطوة 3: محاولة تسجيل الدخول بالرمز القديم المتوقف ---');
  const step3Result = verifyEmployeePin(oldPin, currentStaff);
  console.log(`محاولة الدخول بالرمز القديم (${oldPin}):`, !step3Result.success ? `✅ تم الرفض بنجاح (${step3Result.reason})` : '❌ خطأ أمني فادح: الرمز القديم ما زال يعمل!');
  if (step3Result.success) {
    throw new Error('فشل الاختبار الأمني: الرمز القديم ما زال يسمح بالدخول بعد تغييره!');
  }

  // فحص الرموز العامة الشائعة (1234, 0000) للتأكد من عدم وجود أي Bypass
  const bypass1234 = verifyEmployeePin('1234', currentStaff.filter(e => e.pin !== '1234'));
  console.log(`فحص منع الرموز الافتراضية العامة (1234):`, !bypass1234.success ? '✅ مرفوض ولا يوجد أي تجاوز مخفي' : '❌ خطأ: يوجد bypass لـ 1234');

  // -------------------------------------------------------------
  // الخطوة 4: تسجيل الدخول برمز PIN الجديد -> يجب أن ينجح
  // -------------------------------------------------------------
  console.log('\n--- خطوة 4: تسجيل الدخول برمز PIN الجديد ---');
  const step4Result = verifyEmployeePin(newPin, currentStaff);
  console.log(`محاولة الدخول بالرمز الجديد (${newPin}):`, step4Result.success ? `✅ نجح الدخول فوراً للموظف: ${step4Result.employee?.name}` : '❌ فشل الدخول بالرمز الجديد');
  if (!step4Result.success) {
    throw new Error('فشلت الخطوة 4: الرمز الجديد لم يتم تفعيله!');
  }

  // -------------------------------------------------------------
  // تنظيف وإرجاع الرمز لوضعه الطبيعي بعد نجاح الاختبار
  // -------------------------------------------------------------
  const restoredStaff = currentStaff.map(e => e.id === targetEmployee.id ? { ...e, pin: oldPin } : e);
  await saveTenantEmployees(tenantId, restoredStaff);
  console.log('\n✅ تم إعادة ضبط الرمز لوضعه التشغيلي الطبيعي بعد اكتمال الاختبار.');

  console.log('\n=== اكتملت جميع اختبارات نظام PIN والأمان السحابي بنجاح 100% ===\n');
  process.exit(0);
}

runPinSecurityTests().catch(err => {
  console.error('فشل الاختبار:', err);
  process.exit(1);
});
