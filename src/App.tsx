import React, { useState, useEffect } from 'react';
import { POSMainScreen } from './components/POSMainScreen';
import { PinPadModal } from './components/PinPadModal';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { OpenOrdersScreen } from './components/OpenOrdersScreen';
import { InvoOrderingScreen } from './components/InvoOrderingScreen';
import { SettledOrdersScreen } from './components/SettledOrdersScreen';
import { DeletedOrdersScreen } from './components/DeletedOrdersScreen';
import { MenuManagerModal, MenuItemsMap } from './components/MenuManagerModal';
import { AdminMenuModal, AdminSection } from './components/AdminMenuModal';
import { CashierOutModal, CashierOutData } from './components/CashierOutModal';
import { CashierShiftClosingReportModal } from './components/CashierShiftClosingReportModal';
import { CashierShiftHubModal } from './components/CashierShiftHubModal';
import { CashChangeModal, PaymentSummaryData } from './components/CashChangeModal';
import { SellerAccountStatementModal } from './components/SellerAccountStatementModal';
import { KitchenDisplaySystemModal } from './components/KitchenDisplaySystemModal';
import { ZatcaQRCodeModal } from './components/ZatcaQRCodeModal';
import { TableQRMenuModal } from './components/TableQRMenuModal';
import { DeliveryFleetModal } from './components/DeliveryFleetModal';
import { LoyaltyAndCouponsModal } from './components/LoyaltyAndCouponsModal';
import { MultiDeviceSyncModal } from './components/MultiDeviceSyncModal';
import { TableAndRoomManagerModal } from './components/TableAndRoomManagerModal';
import { ProfitLossModal } from './components/ProfitLossModal';
import { DeliveryAggregatorsModal } from './components/DeliveryAggregatorsModal';
import { RecipeManagerModal } from './components/RecipeManagerModal';
import { DigitalReceiptShareModal } from './components/DigitalReceiptShareModal';
import { OpenShiftDrawerModal } from './components/OpenShiftDrawerModal';
import { SalesAnalyticsDashboardModal } from './components/SalesAnalyticsDashboardModal';
import { IPConnectionModal } from './components/IPConnectionModal';
import { CashierShiftManagementModal } from './components/CashierShiftManagementModal';
import { SecurityManagementModal } from './components/SecurityManagementModal';
import { deductInventoryForOrder } from './data/recipeData';
import { 
  INITIAL_OPEN_ORDERS, 
  INITIAL_SETTLED_ORDERS, 
  INITIAL_DELETED_ORDERS,
  INVO_MENU_ITEMS,
  InvoOrder, 
  DEFAULT_SECTIONS, 
  DEFAULT_TABLES 
} from './data/invoData';
import { INITIAL_SETTINGS, INITIAL_CASHIER, EMPLOYEES_LIST, INITIAL_PURCHASES, INITIAL_INVENTORY, INITIAL_ADVANCES, INITIAL_PRINTER_CONFIG } from './data/mockData';
import { SecurityUser, SecurityRole, AuditLogEntry, SoftDeleteRecord } from './types/security';
import { 
  DEFAULT_SYSTEM_ROLES, 
  convertEmployeeToSecurityUser, 
  getAuditLogs, 
  getSoftDeletedRecords, 
  restoreSoftDeletedRecord, 
  permanentlyDeleteRecord,
  generateSalt,
  hashPinWithSalt,
  verifyPin
} from './utils/security';
import { 
  Employee, 
  POSSettings, 
  PrinterConfig, 
  RestaurantSection, 
  RestaurantTable,
  PurchaseInvoice,
  InventoryItem,
  EmployeeAdvance,
  OperatingExpense,
  ShiftRecord
} from './types';
import { DeliveryDriver, INITIAL_DRIVERS } from './data/restaurantSuiteData';
import { 
  getActiveTenantId, 
  subscribeTenantSections, 
  saveTenantSections, 
  subscribeTenantTables, 
  saveTenantTables, 
  saveTenantSingleTable,
  subscribeTenantOrders,
  saveTenantOrder,
  deleteTenantOrder,
  settleTenantOrder,
  subscribeTenantSettledOrders,
  subscribeTenantDrivers,
  saveTenantDrivers,
  assignDriverToTenantOrder,
  subscribeTenantEmployees,
  saveTenantEmployees,
  saveTenantSingleEmployee
} from './firebase/tenantSync';

export default function App() {
  // Navigation Screens matching the exact video flow
  const [currentView, setCurrentView] = useState<'main' | 'tables' | 'open_orders' | 'ordering' | 'settled_orders' | 'deleted_orders'>('main');
  const [selectedChannel, setSelectedChannel] = useState<'dine_in' | 'takeaway' | 'delivery' | 'pickup'>('dine_in');
  const [selectedTableName, setSelectedTableName] = useState<string>('المحلي');
  const [activeOrder, setActiveOrder] = useState<InvoOrder | null>(null);

  // Active Logged-in Employee (Defaulting to Abu Ayed as shown in video Frame 00:07)
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(EMPLOYEES_LIST[0]);

  // Open Orders State (Persisted in localStorage & Real-time Cloud Sync)
  const [orders, setOrders] = useState<InvoOrder[]>(() => {
    const saved = localStorage.getItem('invo_open_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_OPEN_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('invo_open_orders', JSON.stringify(orders));
  }, [orders]);

  // Delivery Fleet & Drivers State (Persisted in localStorage & Cloud Sync)
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(() => {
    const saved = localStorage.getItem('pos_drivers_data');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const handleUpdateDrivers = (newDrivers: DeliveryDriver[]) => {
    setDrivers(newDrivers);
    localStorage.setItem('pos_drivers_data', JSON.stringify(newDrivers));
    const tenantId = getActiveTenantId();
    saveTenantDrivers(tenantId, newDrivers);
  };

  // Menu Items Map State (Persisted in localStorage with real addition, editing & deletion of meals)
  const [menuItemsMap, setMenuItemsMap] = useState<MenuItemsMap>(() => {
    const saved = localStorage.getItem('invo_menu_items_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INVO_MENU_ITEMS;
  });

  const handleSaveMenuItemsMap = (newMap: MenuItemsMap) => {
    setMenuItemsMap(newMap);
    localStorage.setItem('invo_menu_items_map', JSON.stringify(newMap));
  };

  // Menu Manager Modal state
  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState<boolean>(false);

  // Deleted / Voided Orders State (Persisted Audit Trail with deletion reason, date, and deleting employee)
  const [deletedOrders, setDeletedOrders] = useState<InvoOrder[]>(() => {
    const saved = localStorage.getItem('invo_deleted_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DELETED_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('invo_deleted_orders', JSON.stringify(deletedOrders));
  }, [deletedOrders]);

  // Settled / Paid Orders State (Persisted and filtered to disappear after 24 hours)
  const [settledOrders, setSettledOrders] = useState<InvoOrder[]>(() => {
    const saved = localStorage.getItem('invo_settled_orders');
    if (saved) {
      try {
        const parsed: InvoOrder[] = JSON.parse(saved);
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();
        // Filter out invoices older than 24 hours
        return parsed.filter(o => !o.createdAt || now - o.createdAt <= TWENTY_FOUR_HOURS_MS);
      } catch (e) {
        return INITIAL_SETTLED_ORDERS;
      }
    }
    return INITIAL_SETTLED_ORDERS;
  });

  // Save to LocalStorage and clean up 24h expired invoices periodically
  useEffect(() => {
    localStorage.setItem('invo_settled_orders', JSON.stringify(settledOrders));
  }, [settledOrders]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
      const now = Date.now();
      setSettledOrders(prev => prev.filter(o => !o.createdAt || now - o.createdAt <= TWENTY_FOUR_HOURS_MS));
    }, 60 * 1000); // check every minute

    return () => clearInterval(checkInterval);
  }, []);

  // PIN Keypad Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinModalTitle, setPinModalTitle] = useState<string>('Enter Your Password');
  const [isPinManagerOnly, setIsPinManagerOnly] = useState<boolean>(false);
  const [pendingTarget, setPendingTarget] = useState<
    'dine_in' | 'takeaway' | 'delivery' | 'pickup' | 'settled_orders' | 'deleted_orders' | 'admin_settings' | 'shift_hub'
  >('dine_in');

  // Admin Modal & Printer Config
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(() => {
    const saved = localStorage.getItem('invo_printer_config');
    return saved ? { ...INITIAL_PRINTER_CONFIG, ...JSON.parse(saved) } : INITIAL_PRINTER_CONFIG;
  });
  const handleUpdatePrinterConfig = (config: Partial<PrinterConfig>) => {
    setPrinterConfig(prev => {
      const updated = { ...prev, ...config };
      localStorage.setItem('invo_printer_config', JSON.stringify(updated));
      return updated;
    });
  };

  const [posSettings, setPosSettings] = useState<POSSettings>(() => {
    const saved = localStorage.getItem('invo_pos_settings');
    return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
  });
  const handleUpdateSettings = (newSettings: Partial<POSSettings>) => {
    setPosSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('invo_pos_settings', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Real Persisted Employees, Purchases, Inventory, Advances
  const [employeesList, setEmployeesList] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('invo_employees_list');
    return saved ? JSON.parse(saved) : EMPLOYEES_LIST;
  });
  const handleUpdateEmployees = (newEmployees: Employee[]) => {
    // Ensure all employees have valid salt and pinHash synchronized with their PIN
    const validated = newEmployees.map(emp => {
      const plainPin = (emp.pin || '1234').trim();
      const salt = emp.salt || generateSalt(12);
      const pinHash = (emp.pinHash && emp.salt && verifyPin(plainPin, emp.pinHash, emp.salt))
        ? emp.pinHash
        : hashPinWithSalt(plainPin, salt);
      return { ...emp, pin: plainPin, salt, pinHash };
    });
    setEmployeesList(validated);
    localStorage.setItem('invo_employees_list', JSON.stringify(validated));
    const tenantId = getActiveTenantId();
    saveTenantEmployees(tenantId, validated);
    // Also keep current logged-in employee record in sync
    setCurrentEmployee(prev => {
      const fresh = validated.find(e => e.id === prev.id || e.code === prev.code);
      return fresh || prev;
    });
    // Also keep security users in sync with updated employee PINs
    const updatedSec = validated.map(emp => convertEmployeeToSecurityUser(emp));
    setSecurityUsers(updatedSec);
    localStorage.setItem('invo_security_users', JSON.stringify(updatedSec));
  };

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('invo_purchases_list');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });
  const handleUpdatePurchases = (newPurchases: PurchaseInvoice[]) => {
    setPurchases(newPurchases);
    localStorage.setItem('invo_purchases_list', JSON.stringify(newPurchases));
  };

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('invo_inventory_list');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    localStorage.setItem('invo_inventory_list', JSON.stringify(newInventory));
  };

  const [advances, setAdvances] = useState<EmployeeAdvance[]>(() => {
    const saved = localStorage.getItem('invo_advances_list');
    return saved ? JSON.parse(saved) : INITIAL_ADVANCES;
  });
  const handleUpdateAdvances = (newAdvances: EmployeeAdvance[]) => {
    setAdvances(newAdvances);
    localStorage.setItem('invo_advances_list', JSON.stringify(newAdvances));
  };

  // Cashier Out & Shift Closing Report Modals matching Video flow
  const [isCashierOutOpen, setIsCashierOutOpen] = useState<boolean>(false);
  const [isClosingReportOpen, setIsClosingReportOpen] = useState<boolean>(false);
  const [cashierOutData, setCashierOutData] = useState<CashierOutData | null>(null);
  
  // Cashier Shift Hub (خردة صباحية + تقفيلة ليلية مجمعة بقسم واحد)
  const [isShiftHubOpen, setIsShiftHubOpen] = useState<boolean>(false);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState<boolean>(false);
  
  // Shift Drawer State: Application runs freely without morning shift, but payment requires an open shift
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('invo_shift_open');
    return saved === 'true';
  });

  const [openingCash, setOpeningCash] = useState<number>(() => {
    const saved = localStorage.getItem('invo_opening_cash');
    return saved ? parseFloat(saved) || 0 : 0;
  });

  const handleUpdateOpeningCash = (amount: number) => {
    setOpeningCash(amount);
    localStorage.setItem('invo_opening_cash', amount.toString());
  };

  const handleOpenShift = (amount: number, cashierName: string, notes?: string) => {
    setIsShiftOpen(true);
    setOpeningCash(amount);
    localStorage.setItem('invo_shift_open', 'true');
    localStorage.setItem('invo_opening_cash', amount.toString());
    localStorage.setItem('invo_shift_opened_at', new Date().toISOString());
    localStorage.setItem('invo_shift_cashier', cashierName);
    if (notes) {
      localStorage.setItem('invo_shift_notes', notes);
    }
  };

  const handleCloseShift = () => {
    setIsShiftOpen(false);
    localStorage.setItem('invo_shift_open', 'false');
  };

  // Cash Change / Return Modal (shows the exact remaining change to return to customer)
  const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryData | null>(null);

  // Seller Account Statement Modal (كشف حساب ومبيعات البائعين)
  const [isSellerStatementOpen, setIsSellerStatementOpen] = useState<boolean>(false);

  // Restaurant Suite Modals (KDS, ZATCA, Table QR, Delivery Fleet, Loyalty, Cloud Sync)
  const [isKdsOpen, setIsKdsOpen] = useState<boolean>(false);
  const [isZatcaOpen, setIsZatcaOpen] = useState<boolean>(false);
  const [isTableQrOpen, setIsTableQrOpen] = useState<boolean>(false);
  const [isDeliveryFleetOpen, setIsDeliveryFleetOpen] = useState<boolean>(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState<boolean>(false);
  const [isProfitLossOpen, setIsProfitLossOpen] = useState<boolean>(false);
  const [isDeliveryAggregatorsOpen, setIsDeliveryAggregatorsOpen] = useState<boolean>(false);
  const [isRecipeManagerOpen, setIsRecipeManagerOpen] = useState<boolean>(false);
  const [isDigitalReceiptOpen, setIsDigitalReceiptOpen] = useState<boolean>(false);
  const [isSalesAnalyticsOpen, setIsSalesAnalyticsOpen] = useState<boolean>(false);
  const [adminInitialSection, setAdminInitialSection] = useState<AdminSection>('overview');
  const [isIPConnectionOpen, setIsIPConnectionOpen] = useState<boolean>(false);
  const [isShiftManagementOpen, setIsShiftManagementOpen] = useState<boolean>(false);
  
  // Enterprise RBAC & Security System State (Persisted)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [securityRoles, setSecurityRoles] = useState<SecurityRole[]>(() => {
    try {
      const saved = localStorage.getItem('invo_security_roles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SYSTEM_ROLES;
  });

  const handleUpdateSecurityRoles = (newRoles: SecurityRole[]) => {
    setSecurityRoles(newRoles);
    localStorage.setItem('invo_security_roles', JSON.stringify(newRoles));
  };

  const [securityUsers, setSecurityUsers] = useState<SecurityUser[]>(() => {
    try {
      const saved = localStorage.getItem('invo_security_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return EMPLOYEES_LIST.map((emp) => convertEmployeeToSecurityUser(emp));
  });

  const handleUpdateSecurityUsers = (newUsers: SecurityUser[]) => {
    setSecurityUsers(newUsers);
    localStorage.setItem('invo_security_users', JSON.stringify(newUsers));
  };

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return getAuditLogs();
  });

  const refreshAuditLogs = () => {
    setAuditLogs(getAuditLogs());
  };

  const [softDeletedRecords, setSoftDeletedRecords] = useState<SoftDeleteRecord[]>(() => {
    return getSoftDeletedRecords();
  });

  const refreshSoftDeleted = () => {
    setSoftDeletedRecords(getSoftDeletedRecords());
  };

  const handleRestoreSoftRecord = (recordId: string) => {
    restoreSoftDeletedRecord(recordId);
    refreshSoftDeleted();
    refreshAuditLogs();
  };

  const handlePermanentDeleteSoftRecord = (recordId: string) => {
    permanentlyDeleteRecord(recordId);
    refreshSoftDeleted();
    refreshAuditLogs();
  };

  // Operating Expenses for Real P&L (persisted)
  const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpense[]>(() => {
    try {
      const saved = localStorage.getItem('invo_operating_expenses');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'exp-1',
        title: 'رواتب موظفي الصالة والمطبخ (دفعة أسبوعية)',
        amount: 250.000,
        category: 'salaries',
        date: new Date().toISOString().split('T')[0],
        recordedBy: 'المدير العام',
        paymentMethod: 'transfer',
        notes: 'دفعة الرواتب الأسبوعية',
      },
      {
        id: 'exp-2',
        title: 'فاتورة الكهرباء والتكييف التجاري',
        amount: 45.500,
        category: 'utilities',
        date: new Date().toISOString().split('T')[0],
        recordedBy: 'المحاسب',
        paymentMethod: 'cash',
        notes: 'سداد نقدي',
      },
      {
        id: 'exp-3',
        title: 'شراء كراتين تغليف وسفري وملاعق',
        amount: 32.000,
        category: 'packaging',
        date: new Date().toISOString().split('T')[0],
        recordedBy: 'مسؤول المشتريات',
        paymentMethod: 'cash',
        notes: 'مستلزمات سفرية وتغليف',
      },
      {
        id: 'exp-4',
        title: 'إيجار المحل الشهري (قسط مجزأ)',
        amount: 150.000,
        category: 'rent',
        date: new Date().toISOString().split('T')[0],
        recordedBy: 'المالك',
        paymentMethod: 'transfer',
        notes: 'حوالة بنكية لحساب المالك',
      }
    ];
  });

  const handleUpdateExpenses = (newExpenses: OperatingExpense[]) => {
    setOperatingExpenses(newExpenses);
    localStorage.setItem('invo_operating_expenses', JSON.stringify(newExpenses));
  };

  // Dynamic Restaurant Sections / Halls State (persisted)
  const [sections, setSections] = useState<RestaurantSection[]>(() => {
    const saved = localStorage.getItem('invo_restaurant_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SECTIONS;
  });

  // Dynamic Restaurant Tables & Rooms State (persisted)
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem('invo_restaurant_tables');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TABLES;
  });

  const [selectedTableNotes, setSelectedTableNotes] = useState<string>('');

  // Real-time Cloud Synchronization for Sections, Tables, Orders, Settled & Fleet
  useEffect(() => {
    const tenantId = getActiveTenantId();

    // 1. Subscribe to live cloud sections
    const unsubSections = subscribeTenantSections(tenantId, (cloudSections) => {
      if (cloudSections && cloudSections.length > 0) {
        setSections(cloudSections);
        localStorage.setItem('invo_restaurant_sections', JSON.stringify(cloudSections));
      }
    });

    // 2. Subscribe to live cloud tables
    const unsubTables = subscribeTenantTables(tenantId, (cloudTables) => {
      if (cloudTables && cloudTables.length > 0) {
        setTables(cloudTables);
        localStorage.setItem('invo_restaurant_tables', JSON.stringify(cloudTables));
      }
    });

    // 3. Subscribe to live open orders across all channels (dine-in, takeaway, delivery, pickup)
    const unsubOrders = subscribeTenantOrders(tenantId, (cloudOrders) => {
      if (cloudOrders) {
        setOrders(cloudOrders);
        localStorage.setItem('invo_open_orders', JSON.stringify(cloudOrders));
      }
    });

    // 4. Subscribe to live settled orders
    const unsubSettled = subscribeTenantSettledOrders(tenantId, (cloudSettled) => {
      if (cloudSettled && cloudSettled.length > 0) {
        setSettledOrders(cloudSettled);
        localStorage.setItem('invo_settled_orders', JSON.stringify(cloudSettled));
      }
    });

    // 5. Subscribe to delivery fleet drivers
    const unsubDrivers = subscribeTenantDrivers(tenantId, (cloudDrivers) => {
      if (cloudDrivers && cloudDrivers.length > 0) {
        setDrivers(cloudDrivers);
        localStorage.setItem('pos_drivers_data', JSON.stringify(cloudDrivers));
      }
    });

    // 6. Subscribe to employees and real-time PIN authentication
    const unsubEmployees = subscribeTenantEmployees(tenantId, (cloudEmployees) => {
      if (cloudEmployees && cloudEmployees.length > 0) {
        const enriched = cloudEmployees.map(emp => {
          const plainPin = (emp.pin || '1234').trim();
          const salt = emp.salt || generateSalt(12);
          const pinHash = (emp.pinHash && emp.salt && verifyPin(plainPin, emp.pinHash, emp.salt))
            ? emp.pinHash
            : hashPinWithSalt(plainPin, salt);
          return { ...emp, pin: plainPin, salt, pinHash };
        });
        setEmployeesList(enriched);
        localStorage.setItem('invo_employees_list', JSON.stringify(enriched));
        setCurrentEmployee(prev => {
          const fresh = enriched.find(e => e.id === prev.id || e.code === prev.code);
          return fresh || prev;
        });
        const updatedSec = enriched.map(emp => convertEmployeeToSecurityUser(emp));
        setSecurityUsers(updatedSec);
        localStorage.setItem('invo_security_users', JSON.stringify(updatedSec));
      }
    });

    return () => {
      unsubSections();
      unsubTables();
      unsubOrders();
      unsubSettled();
      unsubDrivers();
      unsubEmployees();
    };
  }, []);

  // Sync sections and tables changes to localStorage & Firebase Cloud
  const handleUpdateSections = (newSections: RestaurantSection[]) => {
    setSections(newSections);
    localStorage.setItem('invo_restaurant_sections', JSON.stringify(newSections));
    const tenantId = getActiveTenantId();
    saveTenantSections(tenantId, newSections);
  };

  const handleUpdateTables = (newTables: RestaurantTable[]) => {
    setTables(newTables);
    localStorage.setItem('invo_restaurant_tables', JSON.stringify(newTables));
    const tenantId = getActiveTenantId();
    saveTenantTables(tenantId, newTables);
  };

  // Handle opening Cashier Out (counting denominations)
  const handleOpenCashierOut = () => {
    setIsCashierOutOpen(true);
  };

  // When denominations and other tenders are confirmed in Cashier Out
  const handleCashierOutConfirm = (data: CashierOutData) => {
    setCashierOutData(data);
    setIsCashierOutOpen(false);
    // Show full closing report and short/over AFTER counting money
    setIsClosingReportOpen(true);
  };

  // Close report
  const handleCloseReport = () => {
    setIsClosingReportOpen(false);
    setCurrentView('main');
  };

  // Handle clicking one of the 4 cards on the main screen
  const handleCardClick = (channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup') => {
    setPendingTarget(channel);
    setIsPinModalOpen(true);
  };

  // Handle opening settled orders with PIN
  const handleOpenSettledOrders = () => {
    setPendingTarget('settled_orders');
    setIsPinModalOpen(true);
  };

  // Handle opening deleted orders
  const handleOpenDeletedOrders = () => {
    setCurrentView('deleted_orders');
  };

  // When PIN is successfully verified
  const handlePinSuccess = (employee?: Employee) => {
    setIsPinModalOpen(false);
    if (employee) {
      setCurrentEmployee(employee);
    }

    if (pendingTarget === 'settled_orders') {
      setCurrentView('settled_orders');
      return;
    }

    if (pendingTarget === 'deleted_orders') {
      setCurrentView('deleted_orders');
      return;
    }

    setSelectedChannel(pendingTarget as any);

    if (pendingTarget === 'dine_in') {
      setCurrentView('tables');
    } else {
      // For takeaway, delivery, pickup: go directly to Open Orders list with that tab active
      setCurrentView('open_orders');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentEmployee(EMPLOYEES_LIST[0]);
    setIsPinModalOpen(true);
  };

  // From Table Selection Screen
  const handleSelectTable = (tableName: string, orderId?: string, tableNotes?: string) => {
    setSelectedTableName(tableName);
    const tbl = tables.find(t => t.name === tableName);
    const effectiveNotes = tableNotes !== undefined ? tableNotes : (tbl?.notes || '');
    setSelectedTableNotes(effectiveNotes);
    if (orderId) {
      const matched = orders.find(o => o.orderNumber.includes(orderId) || o.tableName === tableName);
      setActiveOrder(matched || null);
    } else {
      setActiveOrder(null);
    }
    setCurrentView('ordering');
  };

  // From Open Orders Screen -> Clicking an invoice opens its complete data
  const handleSelectOpenOrder = (ord: InvoOrder) => {
    setActiveOrder(ord);
    setSelectedChannel(ord.channel);
    setSelectedTableName(ord.tableName || (ord.channel === 'takeaway' ? 'سفري' : ord.channel === 'delivery' ? 'توصيل' : 'Pick Up'));
    setSelectedTableNotes(ord.tableNotes || '');
    setCurrentView('ordering');
  };

  // New order for takeaway / delivery / pickup
  const handleNewOrder = (ch: 'takeaway' | 'delivery' | 'pickup') => {
    setActiveOrder(null);
    setSelectedChannel(ch);
    setSelectedTableName(ch === 'takeaway' ? 'سفري' : ch === 'delivery' ? 'توصيل' : 'Pick Up');
    setSelectedTableNotes('');
    setCurrentView('ordering');
  };

  // Save Order
  const handleSaveOrder = (savedOrder: InvoOrder) => {
    // Strict Save Rule: Empty orders can NEVER be saved under any circumstances
    if (!savedOrder.items || savedOrder.items.length === 0) {
      console.warn('Strict Save Rule: Cannot save empty order');
      return;
    }

    // Sync table state & notes if it's a dine-in order
    if (savedOrder.tableName) {
      const tenantId = getActiveTenantId();
      setTables(prev => {
        const updated = prev.map(t => {
          if (t.name === savedOrder.tableName || (savedOrder.tableName && t.name.includes(savedOrder.tableName))) {
            const otherTableOrders = orders.filter(
              o => o.id !== savedOrder.id && 
                   o.channel === 'dine_in' && 
                   o.status === 'open' &&
                   o.items && o.items.length > 0 &&
                   (o.tableName === savedOrder.tableName || (savedOrder.tableName && o.tableName && savedOrder.tableName.includes(o.tableName)))
            );
            const totalTickets = otherTableOrders.length + 1;
            const occupiedTbl = {
              ...t,
              status: 'occupied' as const,
              isOccupied: true,
              orderId: savedOrder.orderNumber,
              ticketCount: totalTickets,
              notes: savedOrder.tableNotes !== undefined ? (savedOrder.tableNotes || undefined) : t.notes,
            };
            saveTenantSingleTable(tenantId, occupiedTbl);
            return occupiedTbl;
          }
          return t;
        });
        localStorage.setItem('invo_restaurant_tables', JSON.stringify(updated));
        return updated;
      });
    }

    setOrders(prev => {
      const existing = prev.findIndex(o => o.id === savedOrder.id);
      let updated: InvoOrder[];
      if (existing > -1) {
        updated = [...prev];
        updated[existing] = savedOrder;
      } else {
        updated = [savedOrder, ...prev];
      }
      localStorage.setItem('invo_open_orders', JSON.stringify(updated));
      return updated;
    });

    // Cloud Sync: Persist active open order to Firestore
    const tenantId = getActiveTenantId();
    saveTenantOrder(tenantId, savedOrder);

    if (selectedChannel === 'dine_in') {
      setCurrentView('tables');
    } else {
      setCurrentView('open_orders');
    }
  };

  // Pay Order -> Automatically moves to Settled Orders (disappears after 24h) & shows Change screen
  const handlePayOrder = (
    paidOrder: InvoOrder,
    paymentDetails?: {
      method: 'cash' | 'card' | 'transfer' | 'talabat';
      tendered: number;
      change: number;
      splitCount: number;
    }
  ) => {
    // Financial Safety Guard: Cannot settle invoices without opening shift
    if (!isShiftOpen) {
      setIsOpenShiftModalOpen(true);
      return;
    }

    const completedOrder: InvoOrder = {
      ...paidOrder,
      status: 'paid',
      createdAt: Date.now(),
      cashierName: currentEmployee?.name || 'ابو عايض',
      cashierId: currentEmployee?.id || 'emp-0',
      paymentMethod: paymentDetails?.method || 'cash',
      elapsedTime: '0m 01s',
      orderNumber: paidOrder.orderNumber.startsWith('Order') ? paidOrder.orderNumber : `Order ${Math.floor(68953 + Math.random() * 100)}`,
      customerName: paidOrder.customerName || (paidOrder.tableName ? paidOrder.tableName : 'زبون'),
    };

    setOrders(prev => {
      const updated = prev.filter(o => o.id !== paidOrder.id);
      localStorage.setItem('invo_open_orders', JSON.stringify(updated));
      return updated;
    });

    setSettledOrders(prev => {
      const updated = [completedOrder, ...prev];
      localStorage.setItem('invo_settled_orders', JSON.stringify(updated));
      return updated;
    });

    // Cloud Sync: Atomic batch moving order from open orders to settled orders
    const tenantId = getActiveTenantId();
    settleTenantOrder(tenantId, completedOrder);

    // Multi-Session aware Table Status update upon payment
    if (paidOrder.tableName) {
      const tenantId = getActiveTenantId();
      // Count remaining open orders for this table (excluding the one just paid)
      const remainingOrders = orders.filter(
        o => o.id !== paidOrder.id && o.channel === 'dine_in' && (o.tableName === paidOrder.tableName || (paidOrder.tableName && o.tableName && paidOrder.tableName.includes(o.tableName)))
      );

      setTables(prev => {
        const updated = prev.map(t => {
          if (t.name === paidOrder.tableName || (paidOrder.tableName && t.name.includes(paidOrder.tableName))) {
            const hasRemaining = remainingOrders.length > 0;
            const updatedTbl = hasRemaining ? {
              ...t,
              status: 'occupied' as const,
              isOccupied: true,
              orderId: remainingOrders[0].orderNumber,
              ticketCount: remainingOrders.length,
            } : {
              ...t,
              status: 'available' as const,
              isOccupied: false,
              orderId: undefined,
              ticketCount: 0,
              elapsed: undefined,
              elapsedSeconds: undefined,
            };
            saveTenantSingleTable(tenantId, updatedTbl);
            return updatedTbl;
          }
          return t;
        });
        localStorage.setItem('invo_restaurant_tables', JSON.stringify(updated));
        return updated;
      });
    }

    // Automatic Real-Time Inventory Deduction based on Recipe BOM & Ingredients
    if (paidOrder.items && paidOrder.items.length > 0) {
      try {
        const { updatedInventory } = deductInventoryForOrder(paidOrder.items, inventory);
        setInventory(updatedInventory);
        localStorage.setItem('invo_inventory_list', JSON.stringify(updatedInventory));
      } catch (err) {
        console.error('Error deducting inventory:', err);
      }
    }

    if (selectedChannel === 'dine_in') {
      setCurrentView('tables');
    } else {
      setCurrentView('open_orders');
    }

    // Show the Change Return Screen immediately
    if (paymentDetails) {
      setPaymentSummary({
        order: completedOrder,
        method: paymentDetails.method,
        total: completedOrder.total,
        tendered: paymentDetails.tendered,
        change: paymentDetails.change,
      });
      setIsChangeModalOpen(true);
    }
  };

  // Real Deletion of active / open order -> moves strictly to Deleted Orders Archive
  const handleDeleteOrder = (orderId: string, reason?: string, orderData?: InvoOrder) => {
    const targetOrder = orders.find(o => o.id === orderId) || orderData;
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      localStorage.setItem('invo_open_orders', JSON.stringify(updated));
      return updated;
    });

    // Cloud Sync: Delete from Firestore open orders
    const tenantId = getActiveTenantId();
    deleteTenantOrder(tenantId, orderId);

    // Multi-Session aware Table Status update upon voiding/deletion
    if (targetOrder?.tableName) {
      const remainingOrders = orders.filter(
        o => o.id !== targetOrder.id && o.channel === 'dine_in' && (o.tableName === targetOrder.tableName || (targetOrder.tableName && o.tableName && targetOrder.tableName.includes(o.tableName)))
      );

      setTables(prev => {
        const updated = prev.map(t => {
          if (t.name === targetOrder.tableName || (targetOrder.tableName && t.name.includes(targetOrder.tableName))) {
            const hasRemaining = remainingOrders.length > 0;
            const updatedTbl = hasRemaining ? {
              ...t,
              status: 'occupied' as const,
              isOccupied: true,
              orderId: remainingOrders[0].orderNumber,
              ticketCount: remainingOrders.length,
            } : {
              ...t,
              status: 'available' as const,
              isOccupied: false,
              orderId: undefined,
              ticketCount: 0,
            };
            saveTenantSingleTable(tenantId, updatedTbl);
            return updatedTbl;
          }
          return t;
        });
        localStorage.setItem('invo_restaurant_tables', JSON.stringify(updated));
        return updated;
      });
    }

    // Move to permanent deleted log
    if (targetOrder) {
      const deletedRecord: InvoOrder = {
        ...targetOrder,
        isDeleted: true,
        deletedAt: Date.now(),
        deletedBy: currentEmployee?.name || 'المدير',
        deletedByRole: currentEmployee?.role || 'مدير فرع',
        deleteReason: reason || 'إلغاء وحذف الفاتورة من شاشة الكاشير',
        originalStatus: targetOrder.status || 'open',
      };
      setDeletedOrders(prev => [deletedRecord, ...prev.filter(d => d.id !== targetOrder.id)]);
    }
  };

  // Real-time Driver Assignment for Delivery Orders
  const handleAssignDriver = (orderId: string, driverId: string, driverName: string) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, deliveryDriverId: driverId, deliveryDriverName: driverName } : o);
      localStorage.setItem('invo_open_orders', JSON.stringify(updated));
      return updated;
    });
    const tenantId = getActiveTenantId();
    assignDriverToTenantOrder(tenantId, orderId, driverId, driverName);
  };

  // Transfer a single session/order from Table A to Table B independently
  const handleTransferTableOrder = (
    orderId: string, 
    newTableName: string, 
    newChannel?: 'dine_in' | 'takeaway' | 'delivery' | 'pickup'
  ) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const oldTableName = targetOrder.tableName;
    const targetChannel = newChannel || targetOrder.channel;
    if (oldTableName === newTableName && targetOrder.channel === targetChannel) return;

    const tenantId = getActiveTenantId();

    // 1. Update order's table and channel in state
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          tableName: targetChannel === 'dine_in' ? newTableName : (targetChannel === 'takeaway' ? 'سفري' : targetChannel === 'delivery' ? 'توصيل' : 'Pick Up'),
          channel: targetChannel 
        };
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem('invo_open_orders', JSON.stringify(updatedOrders));

    // Save updated order to Firestore
    const updatedTarget = updatedOrders.find(o => o.id === orderId);
    if (updatedTarget) {
      saveTenantOrder(tenantId, updatedTarget);
    }

    // 2. Recalculate remaining sessions on source table and new sessions on destination table
    const oldTableRemaining = updatedOrders.filter(
      o => o.channel === 'dine_in' && (o.tableName === oldTableName || (oldTableName && o.tableName?.includes(oldTableName)))
    );
    const newTableOrders = updatedOrders.filter(
      o => o.channel === 'dine_in' && (o.tableName === newTableName || (newTableName && o.tableName?.includes(newTableName)))
    );

    setTables(prev => {
      const updated = prev.map(t => {
        // Source table
        if (t.name === oldTableName) {
          const hasRemaining = oldTableRemaining.length > 0;
          const oldTbl = hasRemaining ? {
            ...t,
            status: 'occupied' as const,
            isOccupied: true,
            orderId: oldTableRemaining[0].orderNumber,
            ticketCount: oldTableRemaining.length,
          } : {
            ...t,
            status: 'available' as const,
            isOccupied: false,
            orderId: undefined,
            ticketCount: 0,
            elapsed: undefined,
            elapsedSeconds: undefined,
          };
          saveTenantSingleTable(tenantId, oldTbl);
          return oldTbl;
        }

        // Destination table
        if (targetChannel === 'dine_in' && t.name === newTableName) {
          const newTbl = {
            ...t,
            status: 'occupied' as const,
            isOccupied: true,
            orderId: targetOrder.orderNumber,
            ticketCount: newTableOrders.length,
          };
          saveTenantSingleTable(tenantId, newTbl);
          return newTbl;
        }

        return t;
      });
      localStorage.setItem('invo_restaurant_tables', JSON.stringify(updated));
      return updated;
    });
  };

  // Void settled order -> moves strictly to Deleted Orders Archive
  const handleVoidSettledOrder = (orderId: string, reason?: string) => {
    const target = settledOrders.find(o => o.id === orderId);
    setSettledOrders(prev => prev.filter(o => o.id !== orderId));

    if (target) {
      const deletedRecord: InvoOrder = {
        ...target,
        isDeleted: true,
        deletedAt: Date.now(),
        deletedBy: currentEmployee?.name || 'المدير',
        deletedByRole: currentEmployee?.role || 'مدير فرع',
        deleteReason: reason || 'إلغاء واسترجاع فاتورة مسددة',
        originalStatus: 'paid',
      };
      setDeletedOrders(prev => [deletedRecord, ...prev.filter(d => d.id !== target.id)]);
    }
  };

  // Restore a deleted invoice back to active or settled state
  const handleRestoreDeletedOrder = (restoredOrder: InvoOrder) => {
    setDeletedOrders(prev => prev.filter(o => o.id !== restoredOrder.id));
    const activeAgain: InvoOrder = {
      ...restoredOrder,
      isDeleted: false,
    };

    if (restoredOrder.originalStatus === 'paid' || restoredOrder.status === 'paid') {
      setSettledOrders(prev => [activeAgain, ...prev]);
    } else {
      setOrders(prev => [activeAgain, ...prev]);
      if (restoredOrder.tableName) {
        setTables(prev => prev.map(t => {
          if (t.name === restoredOrder.tableName || (restoredOrder.tableName && t.name.includes(restoredOrder.tableName))) {
            return { ...t, status: 'occupied', isOccupied: true, ticketCount: 1, orderId: restoredOrder.orderNumber };
          }
          return t;
        }));
      }
    }
  };

  // Permanently delete a single invoice from archive
  const handlePermanentlyDeleteOrder = (orderId: string) => {
    setDeletedOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Clear all deleted archive
  const handleClearAllDeleted = () => {
    setDeletedOrders([]);
  };

  // Count active orders
  const dineInCount = orders.filter(o => o.channel === 'dine_in').length;
  const takeawayCount = orders.filter(o => o.channel === 'takeaway').length;
  const deliveryCount = orders.filter(o => o.channel === 'delivery').length;
  const pickupCount = orders.filter(o => o.channel === 'pickup').length;

  return (
    <div className="w-screen h-screen overflow-hidden font-cairo bg-white select-none">
      {/* 1. Main POS 4-Card Dashboard */}
      {currentView === 'main' && (
        <POSMainScreen
          onCardClick={handleCardClick}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenSettledOrders={handleOpenSettledOrders}
          onOpenDeletedOrders={handleOpenDeletedOrders}
          onOpenMenuManager={() => setIsMenuManagerOpen(true)}
          onOpenCashierOut={handleOpenCashierOut}
          onOpenCashierShiftHub={() => setIsShiftHubOpen(true)}
          onOpenSellerStatement={() => setIsSellerStatementOpen(true)}
          onOpenFloorManager={() => setIsFloorManagerOpen(true)}
          onOpenKDS={() => setIsKdsOpen(true)}
          onOpenZatca={() => setIsZatcaOpen(true)}
          onOpenTableQr={() => setIsTableQrOpen(true)}
          onOpenDeliveryFleet={() => setIsDeliveryFleetOpen(true)}
          onOpenLoyalty={() => setIsLoyaltyOpen(true)}
          onOpenCloudSync={() => setIsCloudSyncOpen(true)}
          onOpenProfitLoss={() => setIsProfitLossOpen(true)}
          onOpenDeliveryAggregators={() => setIsDeliveryAggregatorsOpen(true)}
          onOpenRecipeManager={() => setIsRecipeManagerOpen(true)}
          onOpenDigitalReceipt={() => setIsDigitalReceiptOpen(true)}
          onOpenSalesAnalytics={() => setIsSalesAnalyticsOpen(true)}
          onOpenIPConnection={() => setIsIPConnectionOpen(true)}
          onOpenCashierHistory={() => setIsShiftManagementOpen(true)}
          onOpenTerminalPrinters={() => {
            setAdminInitialSection('printers');
            setIsAdminOpen(true);
          }}
          isShiftOpen={isShiftOpen}
          openingCash={openingCash}
          onOpenShiftModal={() => setIsOpenShiftModalOpen(true)}
          printerConfig={printerConfig}
          onUpdatePrinterConfig={handleUpdatePrinterConfig}
          currentEmployeeName={currentEmployee?.name || 'ابو عايض'}
          onLogout={handleLogout}
          dineInCount={dineInCount}
          takeawayCount={takeawayCount}
          deliveryCount={deliveryCount}
          pickupCount={pickupCount}
          deletedOrdersCount={deletedOrders.length}
          employees={employeesList}
          adminPin={posSettings.adminPin}
          onOpenSecurityHub={() => setIsSecurityModalOpen(true)}
        />
      )}

      {/* 2. Tables Screen for Dine In */}
      {currentView === 'tables' && (
        <TableSelectionScreen
          orders={orders}
          sections={sections}
          tables={tables}
          onUpdateSections={handleUpdateSections}
          onUpdateTables={handleUpdateTables}
          onBack={() => setCurrentView('main')}
          onSelectTable={handleSelectTable}
          onPayOrder={handlePayOrder}
          onTransferOrder={handleTransferTableOrder}
          employeeName={currentEmployee?.name || 'ابو عايض'}
          currency={posSettings.currency || 'ر.ع'}
        />
      )}

      {/* 3. Open Orders Screen for Takeaway, Delivery, and Pick Up (2 Invoices per Row) */}
      {currentView === 'open_orders' && (
        <OpenOrdersScreen
          orders={orders}
          selectedChannel={selectedChannel === 'dine_in' ? 'takeaway' : selectedChannel}
          onBack={() => setCurrentView('main')}
          onNewOrder={handleNewOrder}
          onSelectOrder={handleSelectOpenOrder}
          onOrderPaid={(orderId, method) => {
            const ord = orders.find(o => o.id === orderId);
            if (ord) {
              handlePayOrder(ord, {
                method: method as any,
                tendered: ord.total,
                change: 0,
                splitCount: 1,
              });
            }
          }}
          onAssignDriver={handleAssignDriver}
          onDeleteOrder={handleDeleteOrder}
          drivers={drivers}
          employeeName={currentEmployee?.name || 'ابو عايض'}
          isShiftOpen={isShiftOpen}
          onOpenShift={handleOpenShift}
          currency={posSettings.currency || 'ر.ع'}
        />
      )}

      {/* 4. Menu & Ordering Screen with Invoice Bill */}
      {currentView === 'ordering' && (
        <InvoOrderingScreen
          order={activeOrder}
          channel={selectedChannel}
          tableName={selectedTableName}
          tableNotes={selectedTableNotes}
          onUpdateTableNotes={(notes) => {
            setSelectedTableNotes(notes);
            if (selectedTableName) {
              setTables(prev => {
                const updated = prev.map(t =>
                  t.name === selectedTableName ? { ...t, notes: notes || undefined } : t
                );
                localStorage.setItem('invo_restaurant_tables', JSON.stringify(updated));
                return updated;
              });
            }
          }}
          printerConfig={printerConfig}
          onUpdatePrinterConfig={handleUpdatePrinterConfig}
          menuItemsMap={menuItemsMap}
          onOpenMenuManager={() => setIsMenuManagerOpen(true)}
          onOpenDeliveryAggregators={() => setIsDeliveryAggregatorsOpen(true)}
          onOpenRecipeManager={() => setIsRecipeManagerOpen(true)}
          isShiftOpen={isShiftOpen}
          onOpenShift={handleOpenShift}
          openingCash={openingCash}
          onBack={() => {
            if (selectedChannel === 'dine_in') {
              setCurrentView('tables');
            } else {
              setCurrentView('open_orders');
            }
          }}
          onSaveOrder={handleSaveOrder}
          onPayOrder={handlePayOrder}
          onDeleteOrder={handleDeleteOrder}
          adminPin={posSettings.adminPin}
          currentEmployee={currentEmployee}
          employees={employeesList}
          securityUser={securityUsers.find(u => u.id === currentEmployee?.id) || convertEmployeeToSecurityUser(currentEmployee || employeesList[0])}
          roles={securityRoles}
          securityUsers={securityUsers}
          drivers={drivers}
          orders={orders}
          allTables={tables}
          sections={sections}
          onTransferOrder={handleTransferTableOrder}
        />
      )}

      {/* 5. Settled / Paid Invoices Screen (2 Invoices per Row + 24 Hour Expiration) matching Video 00:05-00:15 */}
      {currentView === 'settled_orders' && (
        <SettledOrdersScreen
          settledOrders={settledOrders}
          onBack={() => setCurrentView('main')}
          onVoidOrder={handleVoidSettledOrder}
          onOpenDeletedOrders={handleOpenDeletedOrders}
          currentEmployee={currentEmployee}
          employeeName={currentEmployee?.name || 'ابو عايض'}
          adminPin={posSettings.adminPin}
          employees={employeesList}
        />
      )}

      {/* 6. Real Deleted / Voided Invoices Archive Screen (سجل المحذوفات الحقيقي مع سبب الحذف والاسترجاع) */}
      {currentView === 'deleted_orders' && (
        <DeletedOrdersScreen
          deletedOrders={deletedOrders}
          onBack={() => setCurrentView('main')}
          onRestoreOrder={handleRestoreDeletedOrder}
          onPermanentlyDeleteOrder={handlePermanentlyDeleteOrder}
          onClearAllDeleted={handleClearAllDeleted}
          currentEmployee={currentEmployee}
          adminPin={posSettings.adminPin}
          employees={employeesList}
        />
      )}

      {/* Real Menu Items CRUD Modal (تعديل الوجبات والأسعار وإضافة وحذف الأصناف) */}
      <MenuManagerModal
        isOpen={isMenuManagerOpen}
        onClose={() => setIsMenuManagerOpen(false)}
        menuItemsMap={menuItemsMap}
        onSaveMenuItemsMap={handleSaveMenuItemsMap}
        currentEmployee={currentEmployee}
        adminPin={posSettings.adminPin}
        employees={employeesList}
      />

      {/* Security PIN Keypad Modal matching Video 00:01 - 00:02 */}
      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        allowedEmployees={employeesList}
        managerOnly={pendingTarget === 'settled_orders'}
        adminPin={posSettings.adminPin}
      />

      {/* Admin Menu Modal (from Power button) */}
      <AdminMenuModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setAdminInitialSection('overview');
        }}
        initialSection={adminInitialSection}
        settings={posSettings}
        onUpdateSettings={handleUpdateSettings}
        orders={[] as any}
        cashier={INITIAL_CASHIER}
        employees={employeesList}
        onUpdateEmployees={handleUpdateEmployees}
        purchases={purchases}
        onUpdatePurchases={handleUpdatePurchases}
        inventory={inventory}
        onUpdateInventory={handleUpdateInventory}
        advances={advances}
        onUpdateAdvances={handleUpdateAdvances}
        printerConfig={printerConfig}
        onUpdatePrinterConfig={(newConf) => setPrinterConfig(prev => ({ ...prev, ...newConf }))}
        onOpenShiftModal={() => {
          setIsAdminOpen(false);
          setIsShiftHubOpen(true);
        }}
        onOpenSecurityHub={() => {
          setIsAdminOpen(false);
          setIsSecurityModalOpen(true);
        }}
        settledOrders={settledOrders}
        menuItemsMap={menuItemsMap}
        onSaveMenuItemsMap={handleSaveMenuItemsMap}
        sections={sections}
        tables={tables}
        onSaveSections={handleUpdateSections}
        onSaveTables={handleUpdateTables}
        deletedOrders={deletedOrders}
        onRestoreDeletedOrder={handleRestoreDeletedOrder}
        onPermanentlyDeleteOrder={handlePermanentlyDeleteOrder}
        onClearAllDeleted={handleClearAllDeleted}
      />
      {/* Cashier Shift Hub Modal (قسم مدمج يضم فتح الخردة الصباحية والتقفيلة الليلية معاً) */}
      <CashierShiftHubModal
        isOpen={isShiftHubOpen}
        onClose={() => setIsShiftHubOpen(false)}
        employeeName={currentEmployee?.name || 'ابو عايض'}
        openingCash={openingCash}
        isShiftOpen={isShiftOpen}
        onSetShiftOpen={setIsShiftOpen}
        onUpdateOpeningCash={handleUpdateOpeningCash}
        settledOrders={settledOrders}
        employees={employeesList}
        onOpenSellerStatement={() => {
          setIsShiftHubOpen(false);
          setIsSellerStatementOpen(true);
        }}
        onOpenShiftManagement={() => {
          setIsShiftHubOpen(false);
          setIsShiftManagementOpen(true);
        }}
      />

      {/* Cashier Out (Counting Cash & Denominations) Modal matching Video 1 & 2 */}
      <CashierOutModal
        isOpen={isCashierOutOpen}
        onClose={() => setIsCashierOutOpen(false)}
        onConfirm={handleCashierOutConfirm}
      />

      {/* Cashier Shift Closing Report Modal (Revealed AFTER counting money with Short/Over) matching Video 2 & 3 */}
      <CashierShiftClosingReportModal
        isOpen={isClosingReportOpen}
        onClose={handleCloseReport}
        cashierName={currentEmployee?.name || 'ابو عايض'}
        cashierOutData={cashierOutData}
        openingCash={openingCash}
        settledOrders={settledOrders}
      />

      {/* Cash Change / Return Screen (شاشة المتبقي للعميل بعد تسديد الفاتورة كاش) */}
      <CashChangeModal
        isOpen={isChangeModalOpen}
        data={paymentSummary}
        onClose={() => {
          setIsChangeModalOpen(false);
          setPaymentSummary(null);
        }}
      />

      {/* Seller Account Statement Modal (كشف حساب ومبيعات البائعين بالحبّة والإجمالي) */}
      <SellerAccountStatementModal
        isOpen={isSellerStatementOpen}
        onClose={() => setIsSellerStatementOpen(false)}
        employees={employeesList}
        settledOrders={settledOrders}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 10. Kitchen Display System (KDS) */}
      <KitchenDisplaySystemModal
        isOpen={isKdsOpen}
        onClose={() => setIsKdsOpen(false)}
        liveOrders={orders}
      />

      {/* 11. ZATCA QR & Barcode */}
      <ZatcaQRCodeModal
        isOpen={isZatcaOpen}
        onClose={() => setIsZatcaOpen(false)}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 12. Table QR Self-Order Menu */}
      <TableQRMenuModal
        isOpen={isTableQrOpen}
        onClose={() => setIsTableQrOpen(false)}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 13. Delivery Fleet & Drivers */}
      <DeliveryFleetModal
        isOpen={isDeliveryFleetOpen}
        onClose={() => setIsDeliveryFleetOpen(false)}
        currency={posSettings.currency || 'ر.ع'}
        drivers={drivers}
        onUpdateDrivers={handleUpdateDrivers}
        orders={orders}
      />

      {/* 14. Loyalty Program & Coupons */}
      <LoyaltyAndCouponsModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 15. Cloud & Multi-Device Sync */}
      <MultiDeviceSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
      />

      {/* 16. Table, Room, Sections & QR Manager */}
      <TableAndRoomManagerModal
        isOpen={isFloorManagerOpen}
        onClose={() => setIsFloorManagerOpen(false)}
        sections={sections}
        tables={tables}
        onSaveSections={handleUpdateSections}
        onSaveTables={handleUpdateTables}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 17. Profit & Loss (P&L) Financial Dashboard */}
      <ProfitLossModal
        isOpen={isProfitLossOpen}
        onClose={() => setIsProfitLossOpen(false)}
        settledOrders={settledOrders}
        expenses={operatingExpenses}
        onUpdateExpenses={handleUpdateExpenses}
        settings={posSettings}
      />

      {/* 18. Delivery Aggregators Hub (Jahez, Hungerstation, Marsool) */}
      <DeliveryAggregatorsModal
        isOpen={isDeliveryAggregatorsOpen}
        onClose={() => setIsDeliveryAggregatorsOpen(false)}
        settings={posSettings}
      />

      {/* 19. Recipe & Food Cost BOM Manager */}
      <RecipeManagerModal
        isOpen={isRecipeManagerOpen}
        onClose={() => setIsRecipeManagerOpen(false)}
        inventory={inventory || []}
        settings={posSettings}
        onSaveRecipes={(recipes) => {
          localStorage.setItem('invo_meal_recipes', JSON.stringify(recipes));
        }}
      />

      {/* 20. Instant Digital Receipt & WhatsApp / SMS Share Modal */}
      {isDigitalReceiptOpen && (
        <DigitalReceiptShareModal
          isOpen={isDigitalReceiptOpen}
          onClose={() => setIsDigitalReceiptOpen(false)}
          data={{
            orderNumber: settledOrders[0]?.orderNumber ? settledOrders[0].orderNumber.replace(/\D/g, '') : '70288',
            restaurantName: posSettings.restaurantName || 'مطعم مذاق الشام والأصيل',
            restaurantPhone: posSettings.restaurantPhone || '+966 55 112 2334',
            customerPhone: settledOrders[0]?.customerPhone || '',
            customerName: settledOrders[0]?.customerName || 'عميل المحل',
            items: settledOrders[0]?.items?.map(it => ({
              name: it.name,
              qty: it.qty,
              price: it.price,
            })) || [
              { name: 'مقلقل مع بخاري', qty: 1, price: 3.300 },
              { name: 'معبوج حار', qty: 1, price: 0.250 },
            ],
            total: settledOrders[0]?.total || 3.550,
            taxAmount: (settledOrders[0]?.total || 3.550) * 0.05,
            taxNumber: posSettings.taxNumber || '310458921400003',
            paymentMethod: 'نقدي (Cash)',
            dateString: new Date().toLocaleString('ar-SA'),
            tableName: settledOrders[0]?.tableName,
            channelName: 'سفري / محلي',
          }}
        />
      )}

      {/* 21. Open Morning Shift Drawer Modal (متاح اختيارياً في أي وقت، ومطلوب إجبارياً قبل تسديد الفواتير) */}
      <OpenShiftDrawerModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        onConfirmOpenShift={handleOpenShift}
        currentEmployeeName={currentEmployee?.name || 'ابو عايض'}
        employees={employeesList}
        currency={posSettings.currency || 'ر.ع'}
        isTriggeredByPayment={false}
      />

      {/* 22. Recharts Sales Analytics & Employee Performance Dashboard */}
      <SalesAnalyticsDashboardModal
        isOpen={isSalesAnalyticsOpen}
        onClose={() => setIsSalesAnalyticsOpen(false)}
        orders={orders}
        settledOrders={settledOrders}
        employees={employeesList}
        currency={posSettings.currency || 'ر.ع'}
      />

      {/* 23. IP Connection Modal */}
      <IPConnectionModal
        isOpen={isIPConnectionOpen}
        onClose={() => setIsIPConnectionOpen(false)}
        currentIp={posSettings.ipAddress || '192.168.1.17'}
        onConnect={(newIp) => {
          setPosSettings(prev => ({ ...prev, ipAddress: newIp }));
          setIsIPConnectionOpen(false);
        }}
      />

      {/* 24. Cashier Shift Management & Full History Modal */}
      <CashierShiftManagementModal
        isOpen={isShiftManagementOpen}
        onClose={() => setIsShiftManagementOpen(false)}
        cashier={INITIAL_CASHIER}
        settings={posSettings}
        orders={settledOrders as any}
        onToggleSound={() => {}}
        onOpenIpModal={() => {
          setIsShiftManagementOpen(false);
          setIsIPConnectionOpen(true);
        }}
        onLockTerminal={() => {
          setIsShiftManagementOpen(false);
          handleLogout();
        }}
        onEndShift={(closedShift) => {
          setIsShiftOpen(false);
          localStorage.setItem('invo_shift_open', 'false');
          try {
            const existing: ShiftRecord[] = JSON.parse(localStorage.getItem('invo_historical_shifts') || '[]');
            const updated = [closedShift, ...existing.filter(s => s.id !== closedShift.id)];
            localStorage.setItem('invo_historical_shifts', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          setIsShiftManagementOpen(false);
        }}
      />

      {/* 25. Advanced Security & Granular Permissions Hub (V-NOX Security Hub) */}
      <SecurityManagementModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        securityUsers={securityUsers}
        onUpdateSecurityUsers={handleUpdateSecurityUsers}
        employees={employeesList}
        onUpdateEmployees={handleUpdateEmployees}
        roles={securityRoles}
        onUpdateRoles={handleUpdateSecurityRoles}
        auditLogs={auditLogs}
        softDeletedRecords={softDeletedRecords}
        onRestoreRecord={handleRestoreSoftRecord}
        onPermanentDeleteRecord={handlePermanentDeleteSoftRecord}
        currentEmployee={{
          id: currentEmployee?.id || 'emp-0',
          name: currentEmployee?.name || 'المدير العام',
        }}
        currency={posSettings.currency || 'ر.ع'}
      />
    </div>
  );
}
