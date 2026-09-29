import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { RestaurantSection, RestaurantTable, Employee } from '../types';
import { InvoOrder } from '../data/invoData';
import { DeliveryDriver } from '../data/restaurantSuiteData';

export interface RestaurantTenant {
  id: string;
  name: string;
  branch: string;
  taxNumber?: string;
  crNumber?: string;
  currency: string;
  taxRate: number;
  phone?: string;
  address?: string;
  ownerName?: string;
  ownerPinHashed?: string;
  activeChannels: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
    pickup: boolean;
  };
  layoutTemplate?: 'casual_dining' | 'fast_food_cafe' | 'lounge_cabins';
  createdAt: string;
}

// Current active tenant key in local persistence
const TENANT_KEY = 'invo_active_tenant_id';

export function getActiveTenantId(): string {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored) return stored;
  }
  // Default store identifier for this installation
  return 'rest_main_store';
}

export function setActiveTenantId(id: string) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(TENANT_KEY, id);
  }
}

// ==========================================
// TENANT PROFILE
// ==========================================

export async function saveTenantProfile(tenant: RestaurantTenant): Promise<boolean> {
  try {
    const tenantRef = doc(db, 'restaurants', tenant.id);
    await setDoc(tenantRef, {
      ...tenant,
      updatedAt: serverTimestamp()
    }, { merge: true });
    setActiveTenantId(tenant.id);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenant.id}`);
    return false;
  }
}

export async function getTenantProfile(tenantId: string): Promise<RestaurantTenant | null> {
  try {
    const tenantRef = doc(db, 'restaurants', tenantId);
    const snap = await getDoc(tenantRef);
    if (snap.exists()) {
      return snap.data() as RestaurantTenant;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}`);
    return null;
  }
}

// ==========================================
// SECTIONS REAL-TIME CLOUD SYNC
// ==========================================

export function subscribeTenantSections(
  tenantId: string,
  onSectionsChange: (sections: RestaurantSection[]) => void
) {
  try {
    const sectionsCol = collection(db, 'restaurants', tenantId, 'sections');
    return onSnapshot(sectionsCol, (snapshot) => {
      if (!snapshot.empty) {
        const sections: RestaurantSection[] = [];
        snapshot.forEach(docSnap => {
          sections.push({ ...docSnap.data(), id: docSnap.id } as RestaurantSection);
        });
        onSectionsChange(sections);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/sections`);
    });
  } catch (err) {
    console.warn('Sections subscription notice:', err);
    return () => {};
  }
}

export async function saveTenantSections(
  tenantId: string,
  sections: RestaurantSection[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    sections.forEach(sec => {
      const docRef = doc(db, 'restaurants', tenantId, 'sections', sec.id);
      batch.set(docRef, { ...sec, updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/sections`);
    return false;
  }
}

// ==========================================
// TABLES REAL-TIME CLOUD SYNC
// ==========================================

export function subscribeTenantTables(
  tenantId: string,
  onTablesChange: (tables: RestaurantTable[]) => void
) {
  try {
    const tablesCol = collection(db, 'restaurants', tenantId, 'tables');
    return onSnapshot(tablesCol, (snapshot) => {
      if (!snapshot.empty) {
        const tables: RestaurantTable[] = [];
        snapshot.forEach(docSnap => {
          tables.push({ ...docSnap.data(), id: docSnap.id } as RestaurantTable);
        });
        onTablesChange(tables);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/tables`);
    });
  } catch (err) {
    console.warn('Tables subscription notice:', err);
    return () => {};
  }
}

export async function saveTenantSingleTable(
  tenantId: string,
  table: RestaurantTable
): Promise<boolean> {
  try {
    const tableId = table.id || table.name.replace(/\s+/g, '_');
    const tableRef = doc(db, 'restaurants', tenantId, 'tables', tableId);
    await setDoc(tableRef, {
      ...table,
      id: tableId,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/tables/${table.id}`);
    return false;
  }
}

export async function saveTenantTables(
  tenantId: string,
  tables: RestaurantTable[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    tables.forEach(tbl => {
      const tableId = tbl.id || tbl.name.replace(/\s+/g, '_');
      const docRef = doc(db, 'restaurants', tenantId, 'tables', tableId);
      batch.set(docRef, { ...tbl, id: tableId, updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/tables`);
    return false;
  }
}

export async function deleteTenantTable(
  tenantId: string,
  tableId: string
): Promise<boolean> {
  try {
    const tableRef = doc(db, 'restaurants', tenantId, 'tables', tableId);
    await deleteDoc(tableRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `restaurants/${tenantId}/tables/${tableId}`);
    return false;
  }
}

// ==========================================
// ORDERS & SHIFTS (REAL-TIME CLOUD SYNC)
// ==========================================

export function subscribeTenantOrders(
  tenantId: string,
  onOrdersChange: (orders: InvoOrder[]) => void
) {
  try {
    const ordersCol = collection(db, 'restaurants', tenantId, 'orders');
    return onSnapshot(ordersCol, (snapshot) => {
      const orders: InvoOrder[] = [];
      snapshot.forEach(docSnap => {
        orders.push({ ...docSnap.data(), id: docSnap.id } as InvoOrder);
      });
      // Sort orders descending by createdAt timestamp
      orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onOrdersChange(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/orders`);
    });
  } catch (err) {
    console.warn('Orders subscription notice:', err);
    return () => {};
  }
}

export async function saveTenantOrder(
  tenantId: string,
  order: InvoOrder
): Promise<boolean> {
  try {
    const orderId = order.id || `ord-${Date.now()}`;
    const orderRef = doc(db, 'restaurants', tenantId, 'orders', orderId);
    await setDoc(orderRef, {
      ...order,
      id: orderId,
      tenantId,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/orders/${order.id}`);
    return false;
  }
}

export async function deleteTenantOrder(
  tenantId: string,
  orderId: string
): Promise<boolean> {
  try {
    const orderRef = doc(db, 'restaurants', tenantId, 'orders', orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `restaurants/${tenantId}/orders/${orderId}`);
    return false;
  }
}

export async function settleTenantOrder(
  tenantId: string,
  paidOrder: InvoOrder
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    // Remove from open orders
    const openOrderRef = doc(db, 'restaurants', tenantId, 'orders', paidOrder.id);
    batch.delete(openOrderRef);

    // Save to settled_orders
    const settledRef = doc(db, 'restaurants', tenantId, 'settled_orders', paidOrder.id);
    batch.set(settledRef, {
      ...paidOrder,
      status: 'paid',
      tenantId,
      settledAt: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/settled_orders/${paidOrder.id}`);
    return false;
  }
}

export function subscribeTenantSettledOrders(
  tenantId: string,
  onSettledChange: (orders: InvoOrder[]) => void
) {
  try {
    const settledCol = collection(db, 'restaurants', tenantId, 'settled_orders');
    return onSnapshot(settledCol, (snapshot) => {
      const settled: InvoOrder[] = [];
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
      const now = Date.now();

      snapshot.forEach(docSnap => {
        const ord = { ...docSnap.data(), id: docSnap.id } as InvoOrder;
        // Keep within 24 hours as per system specification
        if (!ord.createdAt || now - ord.createdAt <= TWENTY_FOUR_HOURS_MS) {
          settled.push(ord);
        }
      });
      settled.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onSettledChange(settled);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/settled_orders`);
    });
  } catch (err) {
    console.warn('Settled orders subscription notice:', err);
    return () => {};
  }
}

// ==========================================
// DELIVERY FLEET & DRIVERS CLOUD SYNC
// ==========================================

export function subscribeTenantDrivers(
  tenantId: string,
  onDriversChange: (drivers: DeliveryDriver[]) => void
) {
  try {
    const driversCol = collection(db, 'restaurants', tenantId, 'drivers');
    return onSnapshot(driversCol, (snapshot) => {
      if (!snapshot.empty) {
        const drivers: DeliveryDriver[] = [];
        snapshot.forEach(docSnap => {
          drivers.push({ ...docSnap.data(), id: docSnap.id } as DeliveryDriver);
        });
        onDriversChange(drivers);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/drivers`);
    });
  } catch (err) {
    console.warn('Drivers subscription notice:', err);
    return () => {};
  }
}

export async function saveTenantDrivers(
  tenantId: string,
  drivers: DeliveryDriver[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    drivers.forEach(drv => {
      const docRef = doc(db, 'restaurants', tenantId, 'drivers', drv.id);
      batch.set(docRef, { ...drv, updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/drivers`);
    return false;
  }
}

export async function saveTenantSingleDriver(
  tenantId: string,
  driver: DeliveryDriver
): Promise<boolean> {
  try {
    const docRef = doc(db, 'restaurants', tenantId, 'drivers', driver.id);
    await setDoc(docRef, {
      ...driver,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/drivers/${driver.id}`);
    return false;
  }
}

export async function assignDriverToTenantOrder(
  tenantId: string,
  orderId: string,
  driverId: string,
  driverName: string
): Promise<boolean> {
  try {
    const orderRef = doc(db, 'restaurants', tenantId, 'orders', orderId);
    await setDoc(orderRef, {
      deliveryDriverId: driverId,
      deliveryDriverName: driverName,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/orders/${orderId}/driver`);
    return false;
  }
}

export async function saveTenantShift(tenantId: string, shiftData: any) {
  try {
    const shiftRef = doc(db, 'restaurants', tenantId, 'shifts', String(shiftData.id || Date.now()));
    await setDoc(shiftRef, {
      ...shiftData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/shifts`);
    return false;
  }
}

// ==========================================
// EMPLOYEES & PIN AUTH REAL-TIME CLOUD SYNC
// ==========================================

export function subscribeTenantEmployees(
  tenantId: string,
  onEmployeesChange: (employees: Employee[]) => void
) {
  try {
    const empCol = collection(db, 'restaurants', tenantId, 'employees');
    return onSnapshot(empCol, (snapshot) => {
      if (!snapshot.empty) {
        const staff: Employee[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          staff.push({
            id: docSnap.id,
            name: data.name || '',
            code: data.code || '',
            role: data.role || 'كاشير رئيسي',
            phone: data.phone || '',
            pin: String(data.pin || '1234'),
            pinHash: data.pinHash || undefined,
            salt: data.salt || undefined,
            salary: typeof data.salary === 'number' ? data.salary : 4000,
            active: data.active !== false && data.status !== 'suspended',
            status: data.status || (data.active !== false ? 'active' : 'suspended'),
            joinDate: data.joinDate || '',
            permissions: data.permissions || undefined,
          } as Employee);
        });
        onEmployeesChange(staff);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${tenantId}/employees`);
    });
  } catch (err) {
    console.warn('Employees subscription notice:', err);
    return () => {};
  }
}

export async function saveTenantEmployees(
  tenantId: string,
  employees: Employee[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    employees.forEach(emp => {
      const docRef = doc(db, 'restaurants', tenantId, 'employees', emp.id);
      const cleanData: Record<string, any> = {
        id: emp.id,
        name: emp.name,
        code: emp.code,
        role: emp.role,
        phone: emp.phone,
        pin: String(emp.pin || '1234').trim(),
        salary: emp.salary ?? 4000,
        active: emp.active !== false && emp.status !== 'suspended',
        status: emp.status || (emp.active !== false ? 'active' : 'suspended'),
        joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
        updatedAt: serverTimestamp()
      };
      if (emp.pinHash) cleanData.pinHash = emp.pinHash;
      if (emp.salt) cleanData.salt = emp.salt;
      if (emp.permissions) cleanData.permissions = emp.permissions;
      batch.set(docRef, cleanData, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/employees`);
    return false;
  }
}

export async function saveTenantSingleEmployee(
  tenantId: string,
  employee: Employee
): Promise<boolean> {
  try {
    const docRef = doc(db, 'restaurants', tenantId, 'employees', employee.id);
    const cleanData: Record<string, any> = {
      id: employee.id,
      name: employee.name,
      code: employee.code,
      role: employee.role,
      phone: employee.phone,
      pin: String(employee.pin || '1234').trim(),
      salary: employee.salary ?? 4000,
      active: employee.active !== false && employee.status !== 'suspended',
      status: employee.status || (employee.active !== false ? 'active' : 'suspended'),
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    };
    if (employee.pinHash) cleanData.pinHash = employee.pinHash;
    if (employee.salt) cleanData.salt = employee.salt;
    if (employee.permissions) cleanData.permissions = employee.permissions;
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${tenantId}/employees/${employee.id}`);
    return false;
  }
}

