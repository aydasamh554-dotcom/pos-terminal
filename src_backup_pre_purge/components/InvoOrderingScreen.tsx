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
  Bike
} from 'lucide-react';
import { INVO_CATEGORIES, INVO_MENU_ITEMS, InvoOrder, InvoOrderItem } from '../data/invoData';
import { Employee, PrinterConfig, SectionPrinter, DigitalReceiptData, InvoiceTargetPrinter } from '../types';
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
  openingCash = 10.000,
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

  // Save Order to Local Dine-in Table or Open Orders
  const handleSaveAndSend = () => {
    posAudio.playSuccess();
    const finalizedOrder: InvoOrder = {
      id: order?.id || `ord-${Date.now()}`,
      orderNumber: order?.orderNumber || `Order:70288`,
      subNumber: order?.subNumber || '38',
      channel,
      tableName: channel === 'dine_in' ? tableName : undefined,
      tableNotes: channel === 'dine_in' ? currentTableNotes : undefined,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      elapsedTime: order?.elapsedTime || '0m 01s',
      total,
      items,
      status: 'open',
      createdAt: order?.createdAt || Date.now(),
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
      id: order?.id || `ord-${Date.now()}`,
      orderNumber: order?.orderNumber || `Order:70288`,
      subNumber: order?.subNumber || '38',
      channel,
      tableName: channel === 'dine_in' ? tableName : undefined,
      tableNotes: channel === 'dine_in' ? currentTableNotes : undefined,
      customerName: customerName || (channel === 'dine_in' ? tableName : undefined),
      elapsedTime: '0m 01s',
      total,
      items,
      status: 'paid',
      createdAt: Date.now(),
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
          
          {/* Table Dine-in & Special Preferences Info Strip */}
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

            {/* 4 Bottom Action Buttons matching video: Cancel | Options | Print | Pay */}
            <div className="grid grid-cols-4 gap-1.5 text-xs font-black text-white">
              
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
                onClick={() => {
                  posAudio.playReceiptPrint();
                  const targetLabel = targetPrinter === 'cashier' 
                    ? 'طابعة الكاشير 🧾' 
                    : targetPrinter === 'kitchen' 
                    ? 'طابعة المطبخ 🍳' 
                    : 'طابعتي الكاشير والمطبخ ⚡';
                  setPrinterFeedbackMsg(`جاري إرسال أمر الطباعة إلى: ${targetLabel}`);
                  setTimeout(() => setPrinterFeedbackMsg(null), 2500);
                  window.print();
                }}
                className="py-2.5 bg-[#1e293b] hover:bg-slate-700 active:bg-slate-900 rounded-xl text-center active:scale-95 cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
              >
                <span>Print</span>
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
        guestCount={guestCount}
        onClose={() => setIsOptionsModalOpen(false)}
        onUpdateOptions={(opts) => {
          setChannel(opts.channel);
          setTableName(opts.tableName);
          setCustomerName(opts.customerName);
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
          data={{
            orderNumber: order?.orderNumber ? order.orderNumber.replace(/\D/g, '') : '70288',
            restaurantName: 'مطعم مذاق الشام والأصيل',
            restaurantPhone: '+966 55 112 2334',
            customerPhone: '',
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
            dateString: new Date().toLocaleString('ar-SA'),
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
    </div>
  );
};
