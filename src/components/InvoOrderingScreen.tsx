import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Utensils, 
  X, 
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Sparkles,
  Plus,
  Printer,
  Sliders,
  DollarSign,
  Flame,
  Coffee,
  Croissant,
  Receipt,
  Layers,
  ShieldAlert,
  Trash2,
  Edit3,
  MessageCircle,
  ChefHat,
  Bike,
  Car,
  Navigation,
  Phone,
  ArrowRightLeft,
  Check,
  Share2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { INVO_CATEGORIES, INVO_MENU_ITEMS, InvoOrder, InvoOrderItem } from '../data/invoData';
import { DeliveryDriver } from '../data/restaurantSuiteData';
import { Employee, PrinterConfig, SectionPrinter, DigitalReceiptData, InvoiceTargetPrinter, RestaurantTable, RestaurantSection } from '../types';
import { EMPLOYEES_LIST } from '../data/mockData';
import { MenuItemsMap, MenuItemData } from './MenuManagerModal';
import { InvoPaymentModal } from './InvoPaymentModal';
import { ItemNoteModal } from './ItemNoteModal';
import { ItemKeypadModal } from './ItemKeypadModal';
import { ItemDiscountModal } from './ItemDiscountModal';
import { ItemModifiersModal } from './ItemModifiersModal';
import { OrderOptionsModal } from './OrderOptionsModal';
import { ItemPrinterSelectModal } from './ItemPrinterSelectModal';
import { PinPadModal } from './PinPadModal';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { DigitalReceiptShareModal } from './DigitalReceiptShareModal';
import { OpenShiftDrawerModal } from './OpenShiftDrawerModal';
import { posAudio } from '../utils/audio';
import { SecurityUser, SecurityRole } from '../types/security';
import { can, softDeleteRecord, DEFAULT_SYSTEM_ROLES, convertEmployeeToSecurityUser } from '../utils/security';

interface InvoOrderingScreenProps {
  order?: InvoOrder | null;
  channel?: 'dine_in' | 'takeaway' | 'delivery' | 'pickup';
  tableName?: string;
  tableNotes?: string;
  onUpdateTableNotes?: (notes: string) => void;
  printerConfig?: PrinterConfig;
  onUpdatePrinterConfig?: (config: Partial<PrinterConfig>) => void;
  menuItemsMap?: MenuItemsMap;
  onOpenMenuManager?: () => void;
  onOpenDeliveryAggregators?: () => void;
  onOpenRecipeManager?: () => void;
  isShiftOpen?: boolean;
  onOpenShift?: (amount: number, cashierName: string, notes?: string) => void;
  openingCash?: number;
  onBack: () => void;
  onSaveOrder: (order: InvoOrder) => void;
  onPayOrder: (
    order: InvoOrder,
    paymentDetails?: {
      method: 'cash' | 'card' | 'transfer' | 'talabat';
      tendered: number;
      change: number;
      splitCount: number;
    }
  ) => void;
  onDeleteOrder?: (orderId: string, reason?: string, orderData?: InvoOrder) => void;
  adminPin?: string;
  currentEmployee?: Employee;
  employees?: Employee[];
  securityUser?: SecurityUser;
  roles?: SecurityRole[];
  securityUsers?: SecurityUser[];
  drivers?: DeliveryDriver[];
  orders?: InvoOrder[];
  allTables?: RestaurantTable[];
  sections?: RestaurantSection[];
  onTransferOrder?: (orderId: string, newTableName: string, newChannel?: 'dine_in' | 'takeaway' | 'delivery' | 'pickup') => void;
}

export const InvoOrderingScreen: React.FC<InvoOrderingScreenProps> = ({
  order,
  channel: initialChannel = 'takeaway',
  tableName: initialTableName = 'سفري',
  tableNotes = '',
  onUpdateTableNotes,
  printerConfig,
  onUpdatePrinterConfig,
  menuItemsMap,
  onOpenMenuManager,
  onOpenDeliveryAggregators,
  onOpenRecipeManager,
  isShiftOpen = false,
  onOpenShift,
  openingCash = 0,
  onBack,
  onSaveOrder,
  onPayOrder,
  onDeleteOrder,
  adminPin = '1234',
  currentEmployee,
  employees = EMPLOYEES_LIST,
  securityUser,
  roles,
  securityUsers,
  drivers = [],
  orders = [],
  allTables = [],
  sections = [],
  onTransferOrder,
}) => {
  // If an existing order is provided (e.g. from table selection), we can start in 'menu' or 'cart'
  const [viewMode, setViewMode] = useState<'menu' | 'cart'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('chicken');
  const [channel, setChannel] = useState<'dine_in' | 'takeaway' | 'delivery' | 'pickup'>(
    order?.channel || initialChannel
  );
  const [tableName, setTableName] = useState<string>(
    order?.tableName || initialTableName
  );
  const [currentTableNotes, setCurrentTableNotes] = useState<string>(
    tableNotes || order?.tableNotes || ''
  );

  // Target Invoice Printer State (Cashier | Kitchen | Both)
  const [targetPrinter, setTargetPrinter] = useState<InvoiceTargetPrinter>(
    () => printerConfig?.activeInvoicePrinter || 'both'
  );
  const [printerFeedbackMsg, setPrinterFeedbackMsg] = useState<string | null>(null);

  const handleSelectTargetPrinter = (target: InvoiceTargetPrinter) => {
    posAudio.playTap();
    setTargetPrinter(target);
    const targetLabel = target === 'cashier' 
      ? 'طابعة الكاشير والفواتير 🧾' 
      : target === 'kitchen' 
      ? 'طابعة المطبخ والطلبات 🍳' 
      : 'كلاهما (الكاشير + المطبخ) ⚡';
    setPrinterFeedbackMsg(`تم توجيه الفاتورة إلى: ${targetLabel}`);
    setTimeout(() => setPrinterFeedbackMsg(null), 2500);
    if (onUpdatePrinterConfig) {
      onUpdatePrinterConfig({ activeInvoicePrinter: target });
    }
  };

  useEffect(() => {
    if (tableNotes !== undefined && tableNotes !== '') {
      setCurrentTableNotes(tableNotes);
    } else if (order?.tableNotes) {
      setCurrentTableNotes(order.tableNotes);
    }
  }, [tableNotes, order]);
  const [customerName, setCustomerName] = useState<string>(
    order?.customerName || ''
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    order?.customerPhone || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    order?.deliveryAddress || ''
  );
  const [deliveryDriverId, setDeliveryDriverId] = useState<string>(
    order?.deliveryDriverId || ''
  );
  const [deliveryDriverName, setDeliveryDriverName] = useState<string>(
    order?.deliveryDriverName || ''
  );
  const [carDetails, setCarDetails] = useState<string>(
    order?.carDetails || ''
  );
  const [pickupTime, setPickupTime] = useState<string>(
    order?.pickupTime || ''
  );
  const [items, setItems] = useState<InvoOrderItem[]>(
    order?.items !== undefined ? order.items : []
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    order?.items && order.items.length > 0 ? 0 : null
  );
  const [showChannelDropdown, setShowChannelDropdown] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [showGuestPicker, setShowGuestPicker] = useState<boolean>(false);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [isKeypadModalOpen, setIsKeypadModalOpen] = useState<boolean>(false);
  const [keypadMode, setKeypadMode] = useState<'price' | 'qty'>('qty');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [isModifiersModalOpen, setIsModifiersModalOpen] = useState<boolean>(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isPrinterSelectModalOpen, setIsPrinterSelectModalOpen] = useState<boolean>(false);
  const [isShareReceiptOpen, setIsShareReceiptOpen] = useState<boolean>(false);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState<boolean>(false);

  // Multi-Session Orders on Current Table in Dine-In mode
  const tableOrders = useMemo(() => {
    if (!orders || orders.length === 0 || channel !== 'dine_in') return [];
    return orders.filter(
      (o) => o.channel === 'dine_in' && (o.tableName === tableName || (o.tableName && tableName.includes(o.tableName)))
    );
  }, [orders, channel, tableName]);

  const [currentOrderId, setCurrentOrderId] = useState<string>(() => {
    if (order?.id) return order.id;
    if (tableOrders.length > 0) return tableOrders[0].id;
    return `ord-${Date.now()}`;
  });

  const [activeOrderNumber, setActiveOrderNumber] = useState<string>(() => {
    if (order?.orderNumber) return order.orderNumber;
    if (tableOrders.length > 0) return tableOrders[0].orderNumber;
    return `Order ${Math.floor(68000 + Math.random() * 2000)}`;
  });

  const [activeSubNumber, setActiveSubNumber] = useState<string>(() => {
    if (order?.subNumber) return order.subNumber;
    if (tableOrders.length > 0) return tableOrders[0].subNumber || '01';
    return '01';
  });

  const [activeCreatedAt, setActiveCreatedAt] = useState<number>(() => {
    if (order?.createdAt) return order.createdAt;
    if (tableOrders.length > 0) return tableOrders[0].createdAt || Date.now();
    return Date.now();
  });

  // Keep state in sync if table or initial order changes
  useEffect(() => {
    if (order) {
      setCurrentOrderId(order.id);
      setActiveOrderNumber(order.orderNumber);
      setActiveSubNumber(order.subNumber || '01');
      setActiveCreatedAt(order.createdAt || Date.now());
      setItems(order.items ? [...order.items] : []);
      setCustomerName(order.customerName || '');
      setCustomerPhone(order.customerPhone || '');
    } else if (tableOrders.length > 0 && !tableOrders.some(o => o.id === currentOrderId)) {
      const first = tableOrders[0];
      setCurrentOrderId(first.id);
      setActiveOrderNumber(first.orderNumber);
      setActiveSubNumber(first.subNumber || '01');
      setActiveCreatedAt(first.createdAt || Date.now());
      setItems(first.items ? [...first.items] : []);
      setCustomerName(first.customerName || '');
      setCustomerPhone(first.customerPhone || '');
    }
  }, [order, tableName]);

  // Digital Receipt Share Modal state
  const [digitalReceiptPayload, setDigitalReceiptPayload] = useState<DigitalReceiptData | null>(null);

  // Transfer Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferSectionId, setTransferSectionId] = useState<string>('all');
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  // Multi-print choice modal state
  const [isMultiPrintModalOpen, setIsMultiPrintModalOpen] = useState<boolean>(false);

  // Available Section Printers from config
  const sectionPrinters: SectionPrinter[] = printerConfig?.sectionPrinters || [
    {
      id: 'prn-kitchen',
      name: 'طابعة المطبخ الرئيسي',
      section: 'kitchen',
      ipAddress: '192.168.1.202',
      port: 9100,
      connectionType: 'network',
      paperWidth: '80mm',
      autoPrintOnPayment: true,
      enabled: true,
      copies: 1,
    },
    {
      id: 'prn-bar',
      name: 'طابعة البار والمشروبات',
      section: 'bar',
      ipAddress: '192.168.1.203',
      port: 9100,
      connectionType: 'network',
      paperWidth: '80mm',
      autoPrintOnPayment: true,
      enabled: true,
      copies: 1,
    },
    {
      id: 'prn-bakery',
      name: 'طابعة المخبز والأفران',
      section: 'bakery',
      ipAddress: '192.168.1.204',
      port: 9100,
      connectionType: 'network',
      paperWidth: '80mm',
      autoPrintOnPayment: true,
      enabled: true,
      copies: 1,
    },
    {
      id: 'prn-cashier',
      name: 'طابعة الكاشير والفواتير',
      section: 'cashier',
      ipAddress: '192.168.1.201',
      port: 9100,
      connectionType: 'network',
      paperWidth: '80mm',
      autoPrintOnPayment: true,
      enabled: true,
      copies: 1,
    },
  ];

  // Security & RBAC Configuration
  const activeSecUser: SecurityUser = useMemo(() => {
    if (securityUser) return securityUser;
    return convertEmployeeToSecurityUser(currentEmployee || employees[0]);
  }, [securityUser, currentEmployee, employees]);

  const activeRoles: SecurityRole[] = useMemo(() => {
    return roles && roles.length > 0 ? roles : DEFAULT_SYSTEM_ROLES;
  }, [roles]);

  const [managerApprovalConfig, setManagerApprovalConfig] = useState<{
    isOpen: boolean;
    actionTitle: string;
    actionKey?: string;
    resourceDescription?: string;
    reasonPrompt?: string;
    isReasonMandatory?: boolean;
    onApproveCallback: (manager: { id: string; name: string }, reason: string) => void;
  }>({
    isOpen: false,
    actionTitle: '',
    onApproveCallback: () => {},
  });

  // Manager & Permission status check:
  const isManager = Boolean(
    currentEmployee && (
      currentEmployee.role?.includes('مدير') ||
      currentEmployee.role?.includes('مشرف') ||
      currentEmployee.code === 'POS-101'
    )
  );

  // User has explicit deletion permission or is Manager/Admin
  const canDeleteOrders = Boolean(
    isManager || currentEmployee?.permissions?.canDeleteOrders
  );

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState<boolean>(false);

  // Helper to get printer info
  const getPrinterInfo = (printerId?: string) => {
    if (!printerId) return null;
    return sectionPrinters.find(p => p.id === printerId);
  };

  const handleSelectPrinterForItem = (printerId: string) => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    const updated = [...items];
    updated[selectedItemIndex].targetPrinterId = printerId;
    setItems(updated);
  };

  // Separate Swipe Gestures for Middle & Bottom Area (Meals Grid & Cart)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleProductsTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleProductsTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger horizontal swipe to cart/menu if horizontal movement is dominant
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (viewMode === 'menu') {
        posAudio.playCardSelect();
        setViewMode('cart');
      } else {
        posAudio.playCardSelect();
        setViewMode('menu');
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => {
      const itemDisc = curr.discountPercent || 0;
      const effectivePrice = curr.price * (1 - itemDisc / 100);
      return acc + effectivePrice * curr.qty;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const orderDiscountAmount = (subtotal * orderDiscountPercent) / 100;
  const total = Math.max(0, subtotal - orderDiscountAmount);
  const totalItemCount = items.reduce((acc, curr) => acc + curr.qty, 0);

  const handleAddItem = (product: { name: string; price: number }) => {
    posAudio.playAddItem();
    const existingIndex = items.findIndex(i => i.name === product.name && !i.notes && !i.isHeld);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].qty += 1;
      setItems(updated);
      setSelectedItemIndex(existingIndex);
    } else {
      // Determine default department printer based on category
      let defaultPrinterId = 'prn-kitchen';
      if (activeCategory === 'drinks' || activeCategory === 'juices') {
        defaultPrinterId = 'prn-bar';
      } else if (activeCategory === 'sweets' || activeCategory === 'bakery') {
        defaultPrinterId = 'prn-bakery';
      }

      const newItem: InvoOrderItem = {
        id: `itm-${Date.now()}-${Math.random()}`,
        name: product.name,
        qty: 1,
        price: product.price,
        categoryId: activeCategory,
        targetPrinterId: defaultPrinterId,
      };
      setItems([...items, newItem]);
      setSelectedItemIndex(items.length);
    }
  };

  // Sidebar Actions
  const handleIncreaseQty = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) {
      if (items.length > 0) setSelectedItemIndex(0);
      return;
    }
    posAudio.playTap();
    const updated = [...items];
    updated[selectedItemIndex].qty += 1;
    setItems(updated);
  };

  const handleDecreaseQty = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    const updated = [...items];
    if (updated[selectedItemIndex].qty > 1) {
      updated[selectedItemIndex].qty -= 1;
      setItems(updated);
    } else {
      // Decreasing to 0 means deleting the item
      handleDeleteItem(selectedItemIndex);
    }
  };

  const handleOpenAdjPrice = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    setKeypadMode('price');
    setIsKeypadModalOpen(true);
  };

  const handleOpenAdjQty = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    setKeypadMode('qty');
    setIsKeypadModalOpen(true);
  };

  const handleConfirmKeypad = (val: number) => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    const targetItem = items[selectedItemIndex];

    if (keypadMode === 'price') {
      const check = can(activeSecUser, activeRoles, 'sales.edit_price');
      if (check.allowed) {
        const updated = [...items];
        updated[selectedItemIndex].price = Math.max(0, val);
        setItems(updated);
      } else {
        setManagerApprovalConfig({
          isOpen: true,
          actionTitle: 'تعديل سعر الصنف يدوياً',
          actionKey: 'sales.edit_price',
          resourceDescription: `${targetItem.name} (السعر الجديد: ${val.toFixed(3)})`,
          reasonPrompt: check.reason || 'تعديل السعر المعتمد للصنف يحتاج إلى موافقة المدير.',
          isReasonMandatory: true,
          onApproveCallback: (_mgr, _rsn) => {
            const updated = [...items];
            updated[selectedItemIndex].price = Math.max(0, val);
            setItems(updated);
          },
        });
      }
    } else {
      if (val <= 0) {
        // Changing QTY to 0 deletes item
        handleDeleteItem(selectedItemIndex);
      } else {
        const updated = [...items];
        updated[selectedItemIndex].qty = Math.floor(val);
        setItems(updated);
      }
    }
  };

  const handleOpenDiscount = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    setIsDiscountModalOpen(true);
  };

  const handleApplyItemDiscount = (percent: number) => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    const updated = [...items];
    updated[selectedItemIndex].discountPercent = percent;
    setItems(updated);
  };

  const handleReOrder = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playAddItem();
    const cur = items[selectedItemIndex];
    const duplicated: InvoOrderItem = {
      ...cur,
      id: `itm-${Date.now()}-${Math.random()}`,
    };
    setItems(prev => [...prev, duplicated]);
    setSelectedItemIndex(items.length);
  };

  // Open Note Modal for Selected Meal
  const handleOpenNoteModal = () => {
    if (items.length === 0) return;
    const targetIdx = selectedItemIndex !== null ? selectedItemIndex : 0;
    setSelectedItemIndex(targetIdx);
    posAudio.playTap();
    setIsNoteModalOpen(true);
  };

  const handleSaveItemNote = (note: string) => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    const updated = [...items];
    updated[selectedItemIndex].notes = note;
    setItems(updated);
  };

  // Toggle Hold
  const handleToggleHold = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    const updated = [...items];
    updated[selectedItemIndex].isHeld = !updated[selectedItemIndex].isHeld;
    setItems(updated);
  };

  // Extra Modifiers
  const handleOpenModifiers = () => {
    if (selectedItemIndex === null || !items[selectedItemIndex]) return;
    posAudio.playTap();
    setIsModifiersModalOpen(true);
  };

  const handleAddModifierItem = (mod: { name: string; price: number }) => {
    const newItem: InvoOrderItem = {
      id: `mod-${Date.now()}-${Math.random()}`,
      name: mod.name,
      qty: 1,
      price: mod.price,
    };
    setItems(prev => [...prev, newItem]);
  };

  // --- Deletion Logic with Smart RBAC Security & Soft Delete ---
  // Delete individual meal
  const handleDeleteItem = (index: number) => {
    const itemToDelete = items[index];
    if (!itemToDelete) return;

    const check = can(activeSecUser, activeRoles, 'sales.delete_item');
    if (check.allowed) {
      // Authorized Employee / Manager: Instant deletion
      posAudio.playTrash();
      const updated = items.filter((_, idx) => idx !== index);
      setItems(updated);
      setSelectedItemIndex(updated.length > 0 ? Math.min(index, updated.length - 1) : null);
    } else {
      // Unauthorized Cashier: Blocked unless temporary manager approval is granted
      posAudio.playTap();
      setManagerApprovalConfig({
        isOpen: true,
        actionTitle: 'حذف صنف من الفاتورة',
        actionKey: 'sales.delete_item',
        resourceDescription: itemToDelete.name,
        reasonPrompt: check.reason || 'حذف الصنف من الفاتورة يحتاج إلى موافقة المشرف أو المدير.',
        isReasonMandatory: true,
        onApproveCallback: (_manager, _reason) => {
          posAudio.playTrash();
          const updated = items.filter((_, idx) => idx !== index);
          setItems(updated);
          setSelectedItemIndex(updated.length > 0 ? Math.min(index, updated.length - 1) : null);
        },
      });
    }
  };

  // Delete entire invoice / bill
  const handleDeleteEntireInvoice = () => {
    posAudio.playTap();
    if (items.length === 0) {
      if (order && onDeleteOrder) {
        onDeleteOrder(order.id);
      }
      onBack();
      return;
    }

    const check = can(activeSecUser, activeRoles, 'sales.cancel_invoice');
    if (check.allowed) {
      // Authorized Employee / Manager: Instant confirmation modal
      setIsConfirmDeleteModalOpen(true);
    } else {
      // Unauthorized Cashier: Requires Manager Approval
      setManagerApprovalConfig({
        isOpen: true,
        actionTitle: 'إلغاء وحذف الفاتورة بالكامل',
        actionKey: 'sales.cancel_invoice',
        resourceDescription: `فاتورة ${order?.orderNumber || 'الطلب الحالي'} (${items.length} أصناف)`,
        reasonPrompt: check.reason || 'إلغاء الفاتورة بالكامل يحتاج إلى موافقة المشرف أو المدير.',
        isReasonMandatory: true,
        onApproveCallback: (manager, reason) => {
          handleExecuteDeleteInvoice(reason, manager.name);
        },
      });
    }
  };

  const handleConfirmManagerDeleteInvoice = () => {
    handleExecuteDeleteInvoice('حذف بطلب المستخدم', currentEmployee?.name || 'المدير');
  };

  const handleExecuteDeleteInvoice = (reason: string, approvedByName?: string) => {
    setIsConfirmDeleteModalOpen(false);
    posAudio.playTrash();
    const currentOrderData: InvoOrder = {
      id: order?.id || `ord-${Date.now()}`,
      orderNumber: order?.orderNumber || `Order ${Math.floor(68000 + Math.random() * 2000)}`,
      subNumber: order?.subNumber || '01',
      channel,
      tableName: channel === 'dine_in' ? tableName : undefined,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      elapsedTime: order?.elapsedTime || '0m 01s',
      total,
      items,
      status: 'open',
      createdAt: order?.createdAt || Date.now(),
    };

    // Soft Delete to Recycle Bin with Audit
    softDeleteRecord(
      'invoice',
      `فاتورة ${currentOrderData.orderNumber}`,
      currentOrderData.id,
      currentOrderData,
      { id: activeSecUser.id, name: activeSecUser.name },
      reason
    );

    if (onDeleteOrder) {
      onDeleteOrder(currentOrderData.id, reason, currentOrderData);
    }
    setItems([]);
    setSelectedItemIndex(null);
    onBack();
  };

  const displayInvoices = useMemo(() => {
    if (tableOrders.length > 0) {
      if (!tableOrders.some(o => o.id === currentOrderId)) {
        return [
          ...tableOrders,
          {
            id: currentOrderId,
            orderNumber: activeOrderNumber,
            subNumber: activeSubNumber,
            channel: 'dine_in' as const,
            tableName,
            total,
            items,
            status: 'open' as const,
            createdAt: activeCreatedAt,
          }
        ];
      }
      return tableOrders;
    }
    return [
      {
        id: currentOrderId,
        orderNumber: activeOrderNumber,
        subNumber: activeSubNumber,
        channel: 'dine_in' as const,
        tableName,
        total,
        items,
        status: 'open' as const,
        createdAt: activeCreatedAt,
      }
    ];
  }, [tableOrders, currentOrderId, activeOrderNumber, activeSubNumber, total, items, activeCreatedAt, tableName]);

  const handleSwitchTab = (targetOrderId: string) => {
    if (targetOrderId === currentOrderId) return;
    posAudio.playTap();

    // 1. Auto-save current working items into the current order
    const currentFinalized: InvoOrder = {
      id: currentOrderId,
      orderNumber: activeOrderNumber,
      subNumber: activeSubNumber,
      channel,
      tableName: channel === 'dine_in' ? tableName : undefined,
      tableNotes: currentTableNotes,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      customerPhone,
      deliveryAddress: channel === 'delivery' ? deliveryAddress : undefined,
      deliveryDriverId: channel === 'delivery' ? deliveryDriverId : undefined,
      deliveryDriverName: channel === 'delivery' ? deliveryDriverName : undefined,
      carDetails: channel === 'takeaway' ? carDetails : undefined,
      pickupTime: channel === 'pickup' ? pickupTime : undefined,
      elapsedTime: '0m 01s',
      total,
      items,
      status: 'open',
      createdAt: activeCreatedAt,
      guestCount,
    };
    onSaveOrder(currentFinalized);

    // 2. Load target order
    const target = tableOrders.find(o => o.id === targetOrderId);
    if (target) {
      setCurrentOrderId(target.id);
      setActiveOrderNumber(target.orderNumber);
      setActiveSubNumber(target.subNumber || '01');
      setActiveCreatedAt(target.createdAt || Date.now());
      setItems(target.items ? [...target.items] : []);
      setSelectedItemIndex(target.items && target.items.length > 0 ? 0 : null);
      setCustomerName(target.customerName || '');
      setCustomerPhone(target.customerPhone || '');
      setOrderDiscountPercent(0);
    }
  };

  const handleAddNewInvoiceTab = () => {
    posAudio.playSuccess();
    // 1. Auto-save current order if it has items
    if (items.length > 0) {
      const currentFinalized: InvoOrder = {
        id: currentOrderId,
        orderNumber: activeOrderNumber,
        subNumber: activeSubNumber,
        channel,
        tableName: channel === 'dine_in' ? tableName : undefined,
        tableNotes: currentTableNotes,
        customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
        customerPhone,
        elapsedTime: '0m 01s',
        total,
        items,
        status: 'open',
        createdAt: activeCreatedAt,
        guestCount,
      };
      onSaveOrder(currentFinalized);
    }

    // 2. Generate new invoice
    const nextIndex = (tableOrders.length || 1) + 1;
    const newId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newOrdNum = `Order ${Math.floor(68000 + Math.random() * 2000)}`;
    const newSub = `${nextIndex}`.padStart(2, '0');

    const newOrder: InvoOrder = {
      id: newId,
      orderNumber: newOrdNum,
      subNumber: newSub,
      channel: 'dine_in',
      tableName: tableName,
      tableNotes: currentTableNotes,
      customerName: `${tableName} - فاتورة ${nextIndex}`,
      customerPhone: '',
      elapsedTime: '0m 01s',
      total: 0,
      items: [],
      status: 'open',
      createdAt: Date.now(),
      guestCount: 1,
    };
    onSaveOrder(newOrder);

    // 3. Switch to it
    setCurrentOrderId(newId);
    setActiveOrderNumber(newOrdNum);
    setActiveSubNumber(newSub);
    setActiveCreatedAt(newOrder.createdAt);
    setItems([]);
    setSelectedItemIndex(null);
    setCustomerName(`${tableName} - فاتورة ${nextIndex}`);
    setCustomerPhone('');
  };

  const handleOpenWhatsAppReceipt = () => {
    posAudio.playTap();
    const data: DigitalReceiptData = {
      orderNumber: activeOrderNumber.replace(/\D/g, '') || '68921',
      restaurantName: 'مطعم مذاق الشام والأصيل',
      restaurantPhone: '+966 55 112 2334',
      customerPhone: customerPhone || '',
      customerName: customerName || (channel === 'dine_in' ? tableName : 'عميل المحل'),
      items: items.map(it => ({
        name: it.name,
        qty: it.qty,
        price: it.price,
      })),
      total,
      taxAmount: total * 0.05,
      taxNumber: '310458921400003',
      paymentMethod: 'فاتورة قيد الحساب / سداد',
      dateString: new Date(activeCreatedAt).toLocaleString('ar-SA'),
      tableName: channel === 'dine_in' ? tableName : undefined,
      channelName: channel === 'dine_in' ? `محلي (${tableName})` : channel === 'takeaway' ? 'سفري' : 'توصيل',
    };
    setDigitalReceiptPayload(data);
    setIsShareReceiptOpen(true);
  };

  const handleExecuteTransfer = (targetTable: string, targetChannel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup' = 'dine_in') => {
    if (onTransferOrder) {
      posAudio.playSuccess();
      onTransferOrder(currentOrderId, targetTable, targetChannel);
      setTransferFeedback(`تم نقل الفاتورة (${activeOrderNumber}) بنجاح إلى: ${targetTable}`);
      setTimeout(() => {
        setTransferFeedback(null);
        setIsTransferModalOpen(false);
        if (targetChannel === 'dine_in') {
          setTableName(targetTable);
        } else {
          setChannel(targetChannel);
          setTableName(targetTable);
        }
      }, 900);
    }
  };

  const handlePrintInvoiceAction = () => {
    posAudio.playReceiptPrint();
    if (channel === 'dine_in' && tableOrders.length > 1) {
      setIsMultiPrintModalOpen(true);
    } else {
      window.print();
    }
  };

  // Save Order to Local Dine-in Table or Open Orders
  const handleSaveAndSend = () => {
    posAudio.playSuccess();
    const finalizedOrder: InvoOrder = {
      id: currentOrderId,
      orderNumber: activeOrderNumber,
      subNumber: activeSubNumber,
      channel,
      tableName: channel === 'dine_in' ? tableName : (channel === 'takeaway' ? 'سفري' : channel === 'delivery' ? 'توصيل' : 'Pick Up'),
      tableNotes: channel === 'dine_in' ? currentTableNotes : undefined,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      customerPhone,
      deliveryAddress: channel === 'delivery' ? deliveryAddress : undefined,
      deliveryDriverId: channel === 'delivery' ? deliveryDriverId : undefined,
      deliveryDriverName: channel === 'delivery' ? deliveryDriverName : undefined,
      carDetails: channel === 'takeaway' ? carDetails : undefined,
      pickupTime: channel === 'pickup' ? pickupTime : undefined,
      elapsedTime: '0m 01s',
      total,
      items,
      status: 'open',
      createdAt: activeCreatedAt,
      guestCount,
    };
    onSaveOrder(finalizedOrder);
  };

  // Settle & Pay on the spot: Must check if shift drawer is open first!
  const handlePay = () => {
    posAudio.playTap();
    if (!isShiftOpen) {
      setIsOpenShiftModalOpen(true);
      return;
    }
    setIsPaymentOpen(true);
  };

  const handleConfirmOpenShiftFromModal = (amount: number, cashierName: string, notes?: string) => {
    if (onOpenShift) {
      onOpenShift(amount, cashierName, notes);
    }
    setIsOpenShiftModalOpen(false);
    // Seamlessly proceed to payment as requested by the user
    setIsPaymentOpen(true);
  };

  const handleConfirmModalPayment = (paymentDetails: {
    method: 'cash' | 'card' | 'transfer' | 'talabat';
    tendered: number;
    change: number;
    splitCount: number;
  }) => {
    setIsPaymentOpen(false);
    const finalizedOrder: InvoOrder = {
      id: currentOrderId,
      orderNumber: activeOrderNumber,
      subNumber: activeSubNumber,
      channel,
      tableName: channel === 'dine_in' ? tableName : (channel === 'takeaway' ? 'سفري' : channel === 'delivery' ? 'توصيل' : 'Pick Up'),
      tableNotes: channel === 'dine_in' ? currentTableNotes : undefined,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      customerPhone,
      deliveryAddress: channel === 'delivery' ? deliveryAddress : undefined,
      deliveryDriverId: channel === 'delivery' ? deliveryDriverId : undefined,
      deliveryDriverName: channel === 'delivery' ? deliveryDriverName : undefined,
      carDetails: channel === 'takeaway' ? carDetails : undefined,
      pickupTime: channel === 'pickup' ? pickupTime : undefined,
      elapsedTime: '0m 01s',
      total,
      items,
      status: 'paid',
      createdAt: Date.now(),
      guestCount,
    };
    onPayOrder(finalizedOrder, paymentDetails);
  };

  const selectedItem = selectedItemIndex !== null ? items[selectedItemIndex] : null;

  return (
    <div 
      className="h-screen w-screen max-w-lg mx-auto bg-slate-900 flex flex-col justify-between select-none text-slate-800 overflow-hidden shadow-2xl relative"
      dir="ltr"
    >
      {/* Top Header Bar matching Screenshot & Video Frame 00:02 */}
      <header className="w-full flex items-center justify-between px-2.5 py-2 bg-[#0f172a] text-white border-b border-slate-800 shrink-0 z-30">
        
        {/* Left Side: Red X Button to Exit */}
        <button
          onClick={() => {
            posAudio.playTap();
            onBack();
          }}
          className="w-10 h-10 bg-[#e53935] hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl flex items-center justify-center font-bold cursor-pointer active:scale-95 shadow-md border border-rose-400"
          title="الرجوع"
        >
          <X className="w-6 h-6 stroke-[3.5]" />
        </button>

        {/* Center/Right Controls matching video & screenshot */}
        <div className="flex items-center gap-2">
          {/* Channel Icon Button with Dropdown (Utensils) */}
          <div className="relative">
            <button
              onClick={() => {
                posAudio.playTap();
                setShowChannelDropdown(!showChannelDropdown);
              }}
              className="w-10 h-10 bg-[#2563eb] hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl flex items-center justify-center border border-blue-400/50 shadow active:scale-95 transition-all cursor-pointer"
            >
              <Utensils className="w-5 h-5" />
            </button>

            {/* Vertical Channel Dropdown */}
            {showChannelDropdown && (
              <div className="absolute top-12 left-0 z-50 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 w-36 animate-in fade-in" dir="rtl">
                {[
                  { id: 'dine_in', label: 'المحلي' },
                  { id: 'takeaway', label: 'سفري' },
                  { id: 'delivery', label: 'توصيل' },
                  { id: 'pickup', label: 'Pick Up' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      posAudio.playTap();
                      setChannel(ch.id as any);
                      setShowChannelDropdown(false);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg text-right transition-colors ${
                      channel === ch.id ? 'bg-blue-600 text-white font-black' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QTY Button */}
          <button 
            onClick={() => {
              handleOpenAdjQty();
            }}
            className="px-3.5 h-10 bg-[#1e293b] hover:bg-[#334155] active:bg-[#0f172a] text-white rounded-xl text-xs font-black border border-slate-700 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
          >
            QTY
          </button>

          {/* Dinner / Cart Count Badge Button - Toggles Menu / Cart (matching Video 00:02) */}
          <button
            onClick={() => {
              posAudio.playCardSelect();
              setViewMode(prev => (prev === 'menu' ? 'cart' : 'menu'));
            }}
            className={`flex items-center gap-1.5 px-3.5 h-10 rounded-xl font-black text-xs sm:text-sm border transition-all cursor-pointer shadow-md ${
              viewMode === 'cart'
                ? 'bg-[#059669] text-white border-emerald-400 ring-2 ring-emerald-400'
                : 'bg-[#059669] hover:bg-[#047857] text-white border-emerald-600'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-emerald-800 text-white font-mono text-xs flex items-center justify-center font-black">
              {totalItemCount}
            </div>
            <span>Dinner</span>
            <ShoppingCart className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* MULTI-INVOICE TABS BAR FOR DINE-IN (شريط تبويبات الفواتير المتعددة على نفس الطاولة) */}
      {channel === 'dine_in' && (
        <div className="w-full bg-[#0b1329] border-b border-slate-800 px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto shrink-0 select-none custom-scrollbar z-20" dir="rtl">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {displayInvoices.map((inv, idx) => {
              const isActive = inv.id === currentOrderId;
              const invTotal = isActive ? total : (inv.total || 0);
              return (
                <button
                  key={inv.id}
                  onClick={() => handleSwitchTab(inv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'
                  }`}
                  title={`الانتقال إلى فاتورة ${idx + 1}`}
                >
                  <span>فاتورة {idx + 1}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {invTotal.toFixed(3)}
                  </span>
                </button>
              );
            })}

            {/* Button to add a new independent session/invoice on this table */}
            <button
              onClick={handleAddNewInvoiceTab}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 border border-emerald-400 shadow-xs"
              title="فتح فاتورة جديدة مستقلة على نفس الطاولة"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ فاتورة جديدة</span>
            </button>
          </div>

          {/* Quick Direct Actions for this specific active invoice: Transfer & WhatsApp */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="نقل هذه الفاتورة إلى طاولة أو قسم أو قناة أخرى"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>نقل</span>
            </button>

            <button
              onClick={handleOpenWhatsAppReceipt}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="إرسال الفاتورة عبر واتساب للزبون"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>واتساب</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback for Target Printer Selection */}
      {printerFeedbackMsg && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white py-1 px-3 text-center text-xs font-bold animate-in fade-in flex items-center justify-center gap-2 shadow-md z-40 shrink-0">
          <Printer className="w-3.5 h-3.5" />
          <span>{printerFeedbackMsg}</span>
        </div>
      )}

      {/* VIEW 1: MENU SCREEN (اختيار الأصناف والوجبات) */}
      {viewMode === 'menu' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 animate-in fade-in duration-150" dir="rtl">
          
          {/* Channel Info Strip: Dine-In, Delivery, Takeaway, Pick Up */}
          {channel === 'dine_in' && (
            <div className="w-full bg-[#1e293b] px-3 py-1.5 border-b border-slate-700/80 flex items-center justify-between text-xs text-white shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-slate-300">الطاولة:</span>
                <span className="font-black text-amber-300">{tableName}</span>
                {currentTableNotes ? (
                  <span className="text-[11px] bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold truncate max-w-[200px] sm:max-w-xs flex items-center gap-1">
                    <span>📝</span>
                    <span className="truncate">{currentTableNotes}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">لا توجد ملاحظات خاصة</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const newNotes = prompt('ملاحظات وتفضيلات خاصة للعملاء (طاولة قريبة من النافذة، كراسي أطفال...):', currentTableNotes);
                  if (newNotes !== null) {
                    setCurrentTableNotes(newNotes.trim());
                    if (onUpdateTableNotes) onUpdateTableNotes(newNotes.trim());
                  }
                }}
                className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer shrink-0"
              >
                {currentTableNotes ? 'تعديل الملاحظة' : '+ إضافة تفضيلات العميل'}
              </button>
            </div>
          )}

          {channel === 'delivery' && (
            <div className="w-full bg-blue-950/80 px-3 py-1.5 border-b border-blue-800/80 flex items-center justify-between text-xs text-white shrink-0">
              <div className="flex items-center gap-2 truncate text-[11px]">
                <span className="px-2 py-0.5 bg-blue-600 rounded-md font-bold text-white flex items-center gap-1">
                  <Bike className="w-3 h-3" />
                  <span>توصيل</span>
                </span>
                <span className="font-bold text-blue-200 truncate">
                  {customerName || 'عميل بدون اسم'} {customerPhone ? `(${customerPhone})` : ''}
                </span>
                {deliveryDriverName ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold truncate">
                    🛵 {deliveryDriverName}
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                    ⚠️ لم يسند سائق
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  posAudio.playTap();
                  setIsOptionsModalOpen(true);
                }}
                className="text-blue-300 hover:text-white text-[11px] font-bold underline cursor-pointer shrink-0"
              >
                تعديل بيانات التوصيل والسائق
              </button>
            </div>
          )}

          {channel === 'takeaway' && (
            <div className="w-full bg-amber-950/70 px-3 py-1.5 border-b border-amber-800/80 flex items-center justify-between text-xs text-white shrink-0">
              <div className="flex items-center gap-2 truncate text-[11px]">
                <span className="px-2 py-0.5 bg-amber-600 rounded-md font-bold text-white flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  <span>سفري</span>
                </span>
                <span className="font-bold text-amber-200 truncate">
                  {customerName ? customerName : 'طلب سفري خارجي'}
                  {carDetails ? ` - 🚗 ${carDetails}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  posAudio.playTap();
                  setIsOptionsModalOpen(true);
                }}
                className="text-amber-300 hover:text-white text-[11px] font-bold underline cursor-pointer shrink-0"
              >
                {carDetails ? 'تعديل السيارة/العميل' : '+ إضافة رقم السيارة/العميل'}
              </button>
            </div>
          )}

          {channel === 'pickup' && (
            <div className="w-full bg-purple-950/70 px-3 py-1.5 border-b border-purple-800/80 flex items-center justify-between text-xs text-white shrink-0">
              <div className="flex items-center gap-2 truncate text-[11px]">
                <span className="px-2 py-0.5 bg-purple-600 rounded-md font-bold text-white">
                  Pick Up
                </span>
                <span className="font-bold text-purple-200 truncate">
                  {customerName ? customerName : 'استلام من المحل'}
                  {pickupTime ? ` - ⏰ موعد: ${pickupTime}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  posAudio.playTap();
                  setIsOptionsModalOpen(true);
                }}
                className="text-purple-300 hover:text-white text-[11px] font-bold underline cursor-pointer shrink-0"
              >
                {pickupTime ? 'تعديل موعد الاستلام' : '+ تحديد موعد الاستلام'}
              </button>
            </div>
          )}

          {/* TOP CATEGORIES SLIDER matching Video Frame 00:02 */}
          <div className="w-full bg-[#111827] p-2 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0 touch-pan-x flex items-center justify-between gap-2">
            <div className="grid grid-rows-2 grid-flow-col gap-1.5 auto-cols-[minmax(120px,1fr)] flex-1 overflow-x-auto no-scrollbar">
              {INVO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    posAudio.playTap();
                    setActiveCategory(cat.id);
                  }}
                  className={`h-11 px-3 rounded-xl text-white font-black text-xs flex items-center justify-center text-center transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? cat.activeColor + ' ring-2 ring-white font-black scale-[0.98]'
                      : cat.color
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* MEALS GRID */}
          <div 
            className="flex-1 bg-white p-2.5 overflow-y-auto"
            onTouchStart={handleProductsTouchStart}
            onTouchEnd={handleProductsTouchEnd}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {(((menuItemsMap && menuItemsMap[activeCategory]) || INVO_MENU_ITEMS[activeCategory]) || []).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddItem(product)}
                  className={`bg-white hover:bg-slate-50 rounded-xl p-2.5 border-2 ${product.borderColor} shadow-sm flex flex-col items-center justify-between min-h-[82px] active:scale-95 transition-transform cursor-pointer text-center group`}
                >
                  <span className="font-black text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-blue-900 font-cairo">
                    {product.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                    OMR {product.price.toFixed(3)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Bottom Bar to switch to Invoice / Ticket */}
          <div className="bg-slate-900 border-t border-slate-800 p-2 flex items-center justify-between px-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">الإجمالي:</span>
              <span className="font-mono text-base font-black text-emerald-400">
                OMR {total.toFixed(3)}
              </span>
            </div>
            <button
              onClick={() => {
                posAudio.playCardSelect();
                setViewMode('cart');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>عرض الفاتورة ({totalItemCount})</span>
              <Receipt className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: CART / INVOICE SCREEN (مطابقة تماماً لفيديو 00:03 - 00:10) */}
      {viewMode === 'cart' && (
        <div 
          className="flex-1 flex flex-col justify-between bg-white overflow-hidden animate-in fade-in duration-150"
        >
          {/* Sub-Header matching video Frame 00:03: Left: Seat/Guest box [1][+], Right: المحلي & Table: عوائل 4 */}
          <div className="w-full px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0 relative">
            
            {/* Left: Seat / Guest Count Box [ 1 ] and [ + ] button matching video */}
            <div className="flex items-center gap-1.5">
              <div 
                className="w-9 h-9 bg-white border border-slate-300 text-slate-900 rounded-lg flex items-center justify-center font-mono font-black text-base shadow-xs"
              >
                {guestCount}
              </div>

              <button
                onClick={() => {
                  posAudio.playTap();
                  setGuestCount(prev => prev + 1);
                }}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 rounded-lg flex items-center justify-center font-black text-xl active:scale-95 cursor-pointer shadow-xs border border-slate-300"
                title="إضافة مقعد / شخص"
              >
                +
              </button>
            </div>

            {/* Right: Channel & Table Name matching video Frame 00:03 */}
            <div className="text-right flex flex-col items-end">
              <div className="font-black text-slate-900 text-sm font-cairo">
                {channel === 'dine_in' ? 'المحلي' : channel === 'takeaway' ? 'سفري' : channel === 'delivery' ? 'توصيل' : 'Pick Up'}
              </div>
              <div className="font-bold text-xs text-slate-700 font-cairo">
                Table: <span className="text-blue-700 font-black">{tableName}</span>
              </div>
            </div>
          </div>

          {/* Sub-Header Line: Order Number matching video Frame 00:03 */}
          <div className="w-full px-3 py-1 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-700 shrink-0">
            <span>
              {order?.orderNumber || 'Order:70288'} ({order?.subNumber || '38'})
            </span>
            <span className="text-slate-400 text-[11px]">
              {channel === 'dine_in' ? 'Dine In Ticket' : 'Takeaway Ticket'}
            </span>
          </div>

          {/* Table Notes / Customer Preferences Banner */}
          {channel === 'dine_in' && currentTableNotes && (
            <div className="w-full px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-amber-700 font-black">📝 تفضيلات وملاحظات الطاولة:</span>
                <span className="truncate text-slate-800">{currentTableNotes}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newNotes = prompt('تعديل ملاحظات وتفضيلات الطاولة:', currentTableNotes);
                  if (newNotes !== null) {
                    setCurrentTableNotes(newNotes.trim());
                    if (onUpdateTableNotes) onUpdateTableNotes(newNotes.trim());
                  }
                }}
                className="text-amber-800 hover:text-amber-950 font-black text-[11px] underline shrink-0 cursor-pointer"
              >
                تعديل
              </button>
            </div>
          )}

          {/* Main Middle Layout: Items List (Left/Center) + Right Sidebar Buttons (matching video Frame 00:04 - 00:07) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* ITEMS LIST (Left/Center area matching video Frame 00:03 - 00:07) */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 bg-white">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 text-center p-4">
                  <ShoppingCart className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-bold">الفاتورة فارغة</p>
                  <button
                    onClick={() => setViewMode('menu')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                  >
                    إضافة أصناف للطلب
                  </button>
                </div>
              ) : (
                items.map((item, idx) => {
                  const isSelected = selectedItemIndex === idx;
                  const itemDisc = item.discountPercent || 0;
                  const itemTotal = (item.price * (1 - itemDisc / 100) * item.qty).toFixed(3);

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => {
                        posAudio.playTap();
                        setSelectedItemIndex(idx);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Left: Qty and Item Name matching video Frame 00:03 */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-blue-700 w-4 text-center">
                          {item.qty}
                        </span>
                        <span className="font-black text-sm text-blue-900 font-cairo">
                          {item.name}
                        </span>
                      </div>

                      {/* Right: Price and [X] Button (when selected or on hover) matching video Frame 00:05 */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-blue-700">
                          {itemTotal}
                        </span>

                        {/* [X] Delete Button with Smart Manager Permission */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(idx);
                          }}
                          className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-slate-700 hover:bg-rose-600 text-white' 
                              : 'bg-slate-200 hover:bg-rose-500 text-slate-700 hover:text-white'
                          }`}
                          title={isManager ? "حذف الصنف مباشرة (صلاحية المدير متاحة)" : "حذف الصنف (يتطلب إذن المدير)"}
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT SIDEBAR: Action Buttons matching Video Frame 00:04 - 00:07 */}
            <div className="w-28 sm:w-32 bg-[#f8fafc] border-l border-slate-300 p-1.5 flex flex-col gap-1.5 overflow-y-auto shrink-0 custom-scrollbar">
              
              {/* 1. Adj Price */}
              <button
                onClick={handleOpenAdjPrice}
                className="w-full py-2 px-1 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-900 rounded-lg text-xs font-black border border-slate-300 shadow-2xs active:scale-95 cursor-pointer transition-all text-center"
              >
                Adj Price
              </button>

              {/* 2. Discount Item */}
              <button
                onClick={handleOpenDiscount}
                className={`w-full py-2 px-1 rounded-lg text-xs font-black border shadow-2xs active:scale-95 cursor-pointer transition-all text-center ${
                  selectedItem?.discountPercent
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                Discount Item
              </button>

              {/* 3. Re Order */}
              <button
                onClick={handleReOrder}
                className="w-full py-2 px-1 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-900 rounded-lg text-xs font-black border border-slate-300 shadow-2xs active:scale-95 cursor-pointer transition-all text-center"
              >
                Re Order
              </button>

              {/* 4. Item Note */}
              <button
                onClick={handleOpenNoteModal}
                className={`w-full py-2 px-1 rounded-lg text-xs font-black border shadow-2xs active:scale-95 cursor-pointer transition-all text-center flex items-center justify-center gap-1 ${
                  selectedItem?.notes
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white hover:bg-blue-50 text-blue-900 border-slate-300'
                }`}
                title="إضافة ملاحظة للوجبة"
              >
                <FileText className="w-3 h-3" />
                <span>Item Note</span>
              </button>

              {/* 5. Item Printer */}
              <button
                onClick={() => {
                  if (items.length === 0) return;
                  const targetIdx = selectedItemIndex !== null ? selectedItemIndex : 0;
                  setSelectedItemIndex(targetIdx);
                  posAudio.playTap();
                  setIsPrinterSelectModalOpen(true);
                }}
                className="w-full py-2 px-1 rounded-lg text-xs font-black border shadow-2xs active:scale-95 cursor-pointer transition-all text-center flex items-center justify-center gap-1 bg-white hover:bg-purple-50 text-purple-900 border-slate-300"
                title="تحديد طابعة الصنف"
              >
                <Printer className="w-3 h-3 text-purple-600" />
                <span>Item Printer</span>
              </button>

              {/* 6. Hold Until Fire */}
              <button
                onClick={handleToggleHold}
                className={`w-full py-2 px-1 rounded-lg text-xs font-black border shadow-2xs active:scale-95 cursor-pointer transition-all text-center ${
                  selectedItem?.isHeld
                    ? 'bg-rose-600 text-white border-rose-700 ring-1 ring-rose-400'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                Hold
              </button>

              {/* 7. Extra Modifiers */}
              <button
                onClick={handleOpenModifiers}
                className="w-full py-2 px-1 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-900 rounded-lg text-xs font-black border border-slate-300 shadow-2xs active:scale-95 cursor-pointer transition-all text-center"
              >
                Modifiers
              </button>
            </div>
          </div>

          {/* Bottom Invoice Footer Controls matching Video Frame 00:03 - 00:10 */}
          <div className="w-full bg-white border-t border-slate-300 p-2.5 space-y-2 shrink-0 shadow-lg">
            
            {/* Total Row with Dedicated Delete Whole Invoice Action */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-emerald-600">
                  Total
                </span>
                
                {/* Clear / Delete Whole Invoice Quick Button */}
                {items.length > 0 && (
                  <button
                    onClick={handleDeleteEntireInvoice}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer active:scale-95 transition-all"
                    title={isManager ? "حذف الفاتورة بالكامل (صلاحية المدير)" : "حذف الفاتورة بالكامل (يتطلب إذن المدير)"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الفاتورة بالكامل</span>
                  </button>
                )}
              </div>

              <div className="font-mono text-base font-black text-emerald-600">
                OMR {total.toFixed(3)}
              </div>
            </div>

            {/* Target Printer Choice Bar (الكاشير | المطبخ | كلاهما) */}
            <div className="w-full bg-slate-100 rounded-xl p-1.5 border border-slate-200 flex items-center justify-between gap-1 text-xs font-bold" dir="rtl">
              <div className="flex items-center gap-1.5 text-slate-700 px-1 font-black shrink-0">
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">إرسال الفاتورة إلى:</span>
                <span className="sm:hidden">الطابعة:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectTargetPrinter('cashier')}
                  className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                    targetPrinter === 'cashier'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  <span>الكاشير</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTargetPrinter('kitchen')}
                  className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                    targetPrinter === 'kitchen'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>المطبخ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTargetPrinter('both')}
                  className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                    targetPrinter === 'both'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Printer className="w-3 h-3" />
                  <span>كلاهما ⚡</span>
                </button>
              </div>
            </div>

            {/* Save & Send Button matching Video Frame 00:03 */}
            <button
              onClick={handleSaveAndSend}
              className="w-full py-3 bg-[#1e293b] hover:bg-[#0f172a] active:bg-black text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <span>Save & Send</span>
            </button>

            {/* 5 Bottom Action Buttons: Cancel | Options | Print | WhatsApp | Pay */}
            <div className="grid grid-cols-5 gap-1.5 text-xs font-black text-white">
              
              {/* Cancel / Delete Button */}
              <button
                onClick={handleDeleteEntireInvoice}
                className="py-2.5 bg-[#1e293b] hover:bg-rose-600 active:bg-rose-700 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
                title={isManager ? "إلغاء وحذف الفاتورة" : "إلغاء وحذف الفاتورة (بإذن المدير فقط)"}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Cancel</span>
              </button>

              {/* Options Button */}
              <button
                onClick={() => {
                  posAudio.playTap();
                  setIsOptionsModalOpen(true);
                }}
                className="py-2.5 bg-[#1e293b] hover:bg-slate-700 active:bg-slate-900 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
              >
                <span>Options</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrintInvoiceAction}
                className="py-2.5 bg-[#1e293b] hover:bg-slate-700 active:bg-slate-900 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
                title="طباعة الفاتورة"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Print</span>
              </button>

              {/* WhatsApp Button (مشاركة رقمية عبر واتساب) */}
              <button
                onClick={handleOpenWhatsAppReceipt}
                className="py-2.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1 text-white font-black"
                title="إرسال الفاتورة عبر واتساب"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>واتساب</span>
              </button>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="py-2.5 bg-[#1e293b] hover:bg-emerald-600 active:bg-emerald-700 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
              >
                <span>Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal when Manager deletes the entire invoice */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in" dir="rtl">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تأكيد حذف الفاتورة بالكامل</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                أنت مسجل بصلاحية <span className="font-bold text-blue-700">{currentEmployee?.name} ({currentEmployee?.role})</span>. هل ترغب بإلغاء وحذف الفاتورة بالكامل؟
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleConfirmManagerDeleteInvoice}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all"
              >
                نعم، حذف الفاتورة
              </button>
              <button
                onClick={() => setIsConfirmDeleteModalOpen(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Item Note Modal */}
      <ItemNoteModal
        isOpen={isNoteModalOpen}
        itemName={selectedItem?.name || ''}
        currentNote={selectedItem?.notes || ''}
        onClose={() => setIsNoteModalOpen(false)}
        onSaveNote={handleSaveItemNote}
      />

      {/* 2. Item Keypad Modal (for Adj Price / Adj Qty) */}
      <ItemKeypadModal
        isOpen={isKeypadModalOpen}
        title={keypadMode === 'price' ? 'تعديل السعر' : 'تعديل الكمية'}
        subtitle={selectedItem?.name}
        initialValue={keypadMode === 'price' ? (selectedItem?.price || 0) : (selectedItem?.qty || 1)}
        mode={keypadMode}
        onClose={() => setIsKeypadModalOpen(false)}
        onConfirm={handleConfirmKeypad}
      />

      {/* 3. Item Discount Modal */}
      <ItemDiscountModal
        isOpen={isDiscountModalOpen}
        itemName={selectedItem?.name || ''}
        itemPrice={selectedItem?.price || 0}
        userMaxDiscount={activeSecUser.maxDiscountPercent}
        onRequestApproval={(requestedPct) => {
          setManagerApprovalConfig({
            isOpen: true,
            actionTitle: `تطبيق خصم استثنائي (${requestedPct}%)`,
            actionKey: 'sales.apply_discount',
            resourceDescription: `${selectedItem?.name} (الخصم المطلوب: ${requestedPct}%)`,
            reasonPrompt: `الموظف (${activeSecUser.name}) حدّه المسموح للخصم هو ${activeSecUser.maxDiscountPercent}%. تطبيق خصم ${requestedPct}% يحتاج إلى موافقة المدير.`,
            isReasonMandatory: true,
            onApproveCallback: () => {
              handleApplyItemDiscount(requestedPct);
            },
          });
        }}
        onClose={() => setIsDiscountModalOpen(false)}
        onApplyDiscount={handleApplyItemDiscount}
      />

      {/* 4. Extra Modifiers Modal */}
      <ItemModifiersModal
        isOpen={isModifiersModalOpen}
        itemName={selectedItem?.name || ''}
        onClose={() => setIsModifiersModalOpen(false)}
        onAddModifierItem={handleAddModifierItem}
      />

      {/* 5. Order Options Modal */}
      <OrderOptionsModal
        isOpen={isOptionsModalOpen}
        currentChannel={channel}
        currentTable={tableName}
        currentCustomerName={customerName}
        currentCustomerPhone={customerPhone}
        currentDeliveryAddress={deliveryAddress}
        currentDeliveryDriverId={deliveryDriverId}
        currentDeliveryDriverName={deliveryDriverName}
        currentCarDetails={carDetails}
        currentPickupTime={pickupTime}
        guestCount={guestCount}
        availableDrivers={drivers}
        onClose={() => setIsOptionsModalOpen(false)}
        onUpdateOptions={(opts) => {
          setChannel(opts.channel);
          setTableName(opts.tableName);
          setCustomerName(opts.customerName);
          setCustomerPhone(opts.customerPhone);
          setDeliveryAddress(opts.deliveryAddress);
          setDeliveryDriverId(opts.deliveryDriverId || '');
          setDeliveryDriverName(opts.deliveryDriverName || '');
          setCarDetails(opts.carDetails || '');
          setPickupTime(opts.pickupTime || '');
          setGuestCount(opts.guestCount);
        }}
      />

      {/* 6. Invo Payment Modal */}
      <InvoPaymentModal
        isOpen={isPaymentOpen}
        order={order || null}
        total={total}
        guestCount={guestCount}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmModalPayment}
      />

      {/* 7. Item Printer Selection Modal (اختيار أي طابعة أو جهاز لكل وجبة) */}
      <ItemPrinterSelectModal
        isOpen={isPrinterSelectModalOpen}
        onClose={() => setIsPrinterSelectModalOpen(false)}
        itemName={selectedItem?.name || ''}
        currentPrinterId={selectedItem?.targetPrinterId}
        printers={sectionPrinters}
        onSelectPrinter={handleSelectPrinterForItem}
      />

      {/* 8. Manager Security Approval Modal (V-NOX RBAC Engine) */}
      <ManagerApprovalModal
        isOpen={managerApprovalConfig.isOpen}
        onClose={() => setManagerApprovalConfig(prev => ({ ...prev, isOpen: false }))}
        onApproved={(mgr, rsn) => {
          managerApprovalConfig.onApproveCallback(mgr, rsn);
        }}
        actionTitle={managerApprovalConfig.actionTitle}
        actionKey={managerApprovalConfig.actionKey}
        resourceDescription={managerApprovalConfig.resourceDescription}
        currentEmployee={{
          id: activeSecUser.id,
          name: activeSecUser.name,
          role: activeSecUser.roleName,
        }}
        isReasonMandatory={managerApprovalConfig.isReasonMandatory ?? true}
        reasonPrompt={managerApprovalConfig.reasonPrompt}
      />

      {/* 9. WhatsApp / SMS Digital Receipt Modal */}
      {isShareReceiptOpen && (
        <DigitalReceiptShareModal
          isOpen={isShareReceiptOpen}
          onClose={() => setIsShareReceiptOpen(false)}
          data={digitalReceiptPayload || {
            orderNumber: activeOrderNumber ? activeOrderNumber.replace(/\D/g, '') : '70288',
            restaurantName: 'مطعم مذاق الشام والأصيل',
            restaurantPhone: '+966 55 112 2334',
            customerPhone: customerPhone || '',
            customerName: customerName || tableName || 'عميل المحل',
            items: items.map(it => ({
              name: it.name,
              qty: it.qty,
              price: it.price,
            })),
            total: total,
            taxAmount: total * 0.05,
            taxNumber: '310458921400003',
            paymentMethod: 'تحت الحساب / جاري الإعداد',
            dateString: new Date(activeCreatedAt).toLocaleString('ar-SA'),
            tableName: tableName,
            channelName: channel === 'dine_in' ? 'محلي' : channel === 'takeaway' ? 'سفري' : channel === 'delivery' ? 'توصيل' : 'Pick Up',
          }}
        />
      )}

      {/* 10. Open Morning Shift Drawer Modal (مطلوب قبل تسديد أي فاتورة) */}
      <OpenShiftDrawerModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        onConfirmOpenShift={handleConfirmOpenShiftFromModal}
        currentEmployeeName={currentEmployee?.name || 'ابو عايض'}
        employees={employees}
        isTriggeredByPayment={true}
      />

      {/* 11. Enhanced Transfer Invoice Modal (نقل الفاتورة إلى طاولة أو قسم أو قناة أخرى) */}
      {isTransferModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in"
          onClick={() => setIsTransferModalOpen(false)}
          dir="rtl"
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-cairo">
                    نقل الفاتورة ({activeOrderNumber})
                  </h3>
                  <p className="text-xs text-slate-400">
                    الموقع الحالي: {channel === 'dine_in' ? `طاولة ${tableName}` : channel} | الإجمالي: {total.toFixed(3)} ر.ع
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transfer Feedback Toast */}
            {transferFeedback && (
              <div className="bg-emerald-600 text-white p-2.5 text-center text-xs font-bold animate-in fade-in flex items-center justify-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{transferFeedback}</span>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* 1. Quick Transfer to Other Channels */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  تحويل لنوع طلب آخر:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExecuteTransfer('سفري', 'takeaway')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Utensils className="w-4 h-4 text-blue-400" />
                    <span>تحويل إلى سفري (Takeaway)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteTransfer('توصيل', 'delivery')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <span>تحويل إلى توصيل (Delivery)</span>
                  </button>
                </div>
              </div>

              {/* 2. Transfer to Another Table / Section */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  أو اختر طاولة / غرفة جديدة لنقل هذه الفاتورة:
                </span>

                {/* Section filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => setTransferSectionId('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                      transferSectionId === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    كل الأقسام
                  </button>
                  {sections.map(sec => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setTransferSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                        transferSectionId === sec.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sec.name}
                    </button>
                  ))}
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-56 overflow-y-auto custom-scrollbar">
                  {allTables
                    .filter(t => transferSectionId === 'all' || t.sectionId === transferSectionId || t.section === transferSectionId)
                    .map(tbl => {
                      const isCurrent = tbl.name === tableName;
                      const tblOrdersCount = orders.filter(o => o.channel === 'dine_in' && (o.tableName === tbl.name || (o.tableName && tbl.name.includes(o.tableName)))).length;
                      const isOccupied = tblOrdersCount > 0;

                      return (
                        <button
                          key={tbl.id}
                          disabled={isCurrent}
                          type="button"
                          onClick={() => handleExecuteTransfer(tbl.name, 'dine_in')}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer active:scale-95 ${
                            isCurrent
                              ? 'bg-slate-800/40 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
                              : isOccupied
                              ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800 text-rose-200'
                              : 'bg-slate-800 hover:bg-blue-900/40 border-slate-700 hover:border-blue-500 text-white'
                          }`}
                        >
                          <span className="text-xs font-black truncate w-full">{tbl.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isCurrent
                              ? 'bg-slate-700 text-slate-300'
                              : isOccupied
                              ? 'bg-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/30 text-emerald-300'
                          }`}>
                            {isCurrent ? 'الحالية' : isOccupied ? `${tblOrdersCount} فواتير` : 'خالية'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Multiple Invoices Printing Modal for same table */}
      {isMultiPrintModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in"
          onClick={() => setIsMultiPrintModalOpen(false)}
          dir="rtl"
        >
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black text-white font-cairo">
                  خيارات طباعة فواتير ({tableName})
                </h3>
              </div>
              <button 
                onClick={() => setIsMultiPrintModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              يوجد على هذه الطاولة <strong className="text-amber-300">{tableOrders.length} فواتير مستقلة</strong>. اختر كيف ترغب بطباعتها:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMultiPrintModalOpen(false);
                  window.print();
                }}
                className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
              >
                <div className="text-right">
                  <div className="font-black">طباعة هذه الفاتورة الحالية فقط</div>
                  <div className="text-[11px] text-blue-200">({activeOrderNumber}) - {total.toFixed(3)} ر.ع</div>
                </div>
                <Receipt className="w-5 h-5 text-blue-200" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMultiPrintModalOpen(false);
                  posAudio.playReceiptPrint();
                  setPrinterFeedbackMsg(`جاري إرسال جميع فواتير الطاولة (${tableOrders.length} فواتير منفصلة) إلى الطابعة...`);
                  setTimeout(() => setPrinterFeedbackMsg(null), 3000);
                  window.print();
                }}
                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
              >
                <div className="text-right">
                  <div className="font-black text-emerald-400">طباعة جميع فواتير الطاولة منفصلة</div>
                  <div className="text-[11px] text-slate-400">كل فاتورة تُطبع في إيصال مستقل دون دمج</div>
                </div>
                <Layers className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
