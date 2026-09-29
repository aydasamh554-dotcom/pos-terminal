import React from 'react';
import { CashierSession, POSSettings, ShiftRecord, CashMovement, Order } from '../types';
import { CashierShiftManagementModal } from './CashierShiftManagementModal';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: CashierSession;
  settings: POSSettings;
  orders: Order[];
  onToggleSound: () => void;
  onOpenIpModal: () => void;
  onLockTerminal: () => void;
  onEndShift: (closedShift: ShiftRecord) => void;
  onAddCashMovement?: (movement: CashMovement) => void;
}

export const CashierModal: React.FC<CashierModalProps> = (props) => {
  return <CashierShiftManagementModal {...props} />;
};
