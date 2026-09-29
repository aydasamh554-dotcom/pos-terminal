import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Settings,
  User, 
  Layers, 
  Search,
  ChefHat,
  QrCode,
  Smartphone,
  Bike,
  Award,
  Cloud,
  FileSpreadsheet,
  Trash2,
  UtensilsCrossed,
  Receipt,
  TrendingUp,
  MessageCircle,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { Employee } from '../types';
import { posAudio } from '../utils/audio';
import { TerminalMenuModal } from './TerminalMenuModal';

interface POSMainScreenProps {
  onCardClick: (channel: 'dine_in' | 'takeaway' | 'delivery' | 'pickup') => void;
  onOpenAdmin: () => void;
  onOpenSettledOrders?: () => void;
  onOpenDeletedOrders?: () => void;
  onOpenMenuManager?: () => void;
  onOpenCashierOut?: () => void;
  onOpenCashierShiftHub?: () => void;
  onOpenSellerStatement?: () => void;
  onOpenFloorManager?: () => void;
  onOpenKDS?: () => void;
  onOpenZatca?: () => void;
  onOpenTableQr?: () => void;
  onOpenDeliveryFleet?: () => void;
  onOpenLoyalty?: () => void;
  onOpenCloudSync?: () => void;
  onOpenProfitLoss?: () => void;
  onOpenDeliveryAggregators?: () => void;
  onOpenRecipeManager?: () => void;
  onOpenDigitalReceipt?: () => void;
  onOpenSalesAnalytics?: () => void;
  onOpenIPConnection?: () => void;
  onOpenCashierHistory?: () => void;
  onOpenTerminalPrinters?: () => void;
  isShiftOpen?: boolean;
  openingCash?: number;
  onOpenShiftModal?: () => void;
  printerConfig?: any;
  onUpdatePrinterConfig?: (config: any) => void;
  currentEmployeeName?: string;
  onLogout?: () => void;
  dineInCount?: number;
  takeawayCount?: number;
  pickupCount?: number;
  deliveryCount?: number;
  deletedOrdersCount?: number;
  employees?: Employee[];
  adminPin?: string;
  onOpenSecurityHub?: () => void;
}

export const POSMainScreen: React.FC<POSMainScreenProps> = ({
  onCardClick,
  onOpenAdmin,
  onOpenSettledOrders,
  onOpenDeletedOrders,
  onOpenMenuManager,
  onOpenCashierOut,
  onOpenCashierShiftHub,
  onOpenSellerStatement,
  onOpenFloorManager,
  onOpenKDS,
  onOpenZatca,
  onOpenTableQr,
  onOpenDeliveryFleet,
  onOpenLoyalty,
  onOpenCloudSync,
  onOpenProfitLoss,
  onOpenDeliveryAggregators,
  onOpenRecipeManager,
  onOpenDigitalReceipt,
  onOpenSalesAnalytics,
  onOpenIPConnection,
  onOpenCashierHistory,
  onOpenTerminalPrinters,
  isShiftOpen = false,
  openingCash = 0,
  onOpenShiftModal,
  printerConfig,
  onUpdatePrinterConfig,
  currentEmployeeName = 'ابو عايض',
  onLogout,
  dineInCount = 0,
  takeawayCount = 0,
  pickupCount = 0,
  deliveryCount = 0,
  deletedOrdersCount = 0,
  employees = [],
  adminPin = '1234',
  onOpenSecurityHub,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('11:50 PM');
  const [currentDate, setCurrentDate] = useState<string>('Saturday Aug 22');
  const [isTerminalMenuOpen, setIsTerminalMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-[#1e40af] via-[#1d4ed8] to-[#172554] flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden text-white" dir="rtl">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"></div>

      {/* Top Header Bar matching video Frame 00:00 & 00:41 */}
      <header className="relative z-10 w-full flex items-center justify-between px-2">
        {/* Settings and Shift Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              posAudio.playTap();
              setIsTerminalMenuOpen(true);
            }}
            title="الإعدادات وقائمة النظام"
            className="h-11 sm:h-12 px-3.5 sm:px-5 rounded-2xl bg-[#0f172a]/95 hover:bg-[#0f172a] border border-slate-700/80 text-white flex items-center gap-2.5 shadow-xl active:scale-95 transition-all cursor-pointer group"
          >
            <Settings className="w-5 h-5 text-blue-400 group-hover:rotate-45 transition-transform" />
            <span className="text-xs sm:text-sm font-black font-cairo text-white">
              الإعدادات
            </span>
          </button>

          {/* Clean Shift / Register Button */}
          <button
            onClick={() => {
              posAudio.playTap();
              if (onOpenShiftModal) onOpenShiftModal();
              else if (onOpenCashierShiftHub) onOpenCashierShiftHub();
            }}
            className={`h-11 sm:h-12 px-3 sm:px-4 rounded-2xl border text-xs font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer ${
              isShiftOpen
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30'
            }`}
            title={isShiftOpen ? 'الصندوق مفتوح' : 'فتح الصندوق والوردية'}
          >
            <span className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{isShiftOpen ? 'الصندوق مفتوح' : 'فتح الصندوق ⚡'}</span>
          </button>
        </div>

        {/* Center: Live Clock and Date matching Video 00:00 */}
        <div className="flex items-center gap-2 text-white font-sans">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
            {currentTime}
          </span>
          <span className="text-sm sm:text-base font-semibold text-blue-100">
            {currentDate}
          </span>
        </div>

        {/* Right Side: User Profile / Staff */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              posAudio.playTap();
              setIsTerminalMenuOpen(true);
            }}
            className="h-11 sm:h-12 px-3 rounded-2xl bg-[#1e293b]/90 hover:bg-[#1e293b] text-white flex items-center gap-2 shadow-xl border border-slate-700/80 cursor-pointer active:scale-95 transition-transform"
            title="الإعدادات وقائمة المستخدم والكاشير"
          >
            <User className="w-5 h-5 text-blue-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200 hidden sm:inline">
              {currentEmployeeName}
            </span>
          </button>
        </div>
      </header>

      {/* 4 Main POS Cards Grid matching video Frame 00:00 & 00:41 */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-auto px-2">
        <div className="w-full max-w-lg grid grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: المحلي (Top Left) */}
          <button
            onClick={() => {
              posAudio.playCardSelect();
              onCardClick('dine_in');
            }}
            className="group relative bg-white hover:bg-slate-50 active:scale-[0.98] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col items-center justify-between min-h-[175px] sm:min-h-[195px] cursor-pointer transition-all duration-200"
          >
            {/* Cutlery & Plate with Red Notification Badge "9" */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-auto">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#1e5eb8] group-hover:scale-105 transition-transform"
              >
                <circle cx="50" cy="50" r="38" stroke="#1e5eb8" strokeWidth="6" fill="#f8fafc" />
                <circle cx="50" cy="50" r="24" fill="#1e5eb8" />
                <path
                  d="M20 28V46C20 50 23 54 27 55V72M27 28V55M34 28V46C34 50 31 54 27 55"
                  stroke="#1e5eb8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M74 28C74 38 72 48 70 54H67V72"
                  stroke="#1e5eb8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Red Badge "9" matching video Frame 00:00 */}
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#e53935] text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white font-mono">
                {dineInCount || 9}
              </div>
            </div>

            {/* Bottom Dark Tab */}
            <div className="w-full py-2 bg-[#1e293b] text-white font-black text-sm sm:text-base rounded-xl text-center shadow-sm">
              المحلي
            </div>
          </button>

          {/* Card 2: توصيل (Top Right) */}
          <button
            onClick={() => {
              posAudio.playCardSelect();
              onCardClick('delivery');
            }}
            className="group relative bg-white hover:bg-slate-50 active:scale-[0.98] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col items-center justify-between min-h-[175px] sm:min-h-[195px] cursor-pointer transition-all duration-200"
          >
            {/* Scooter / Delivery Rider Icon */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-auto">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#1e5eb8] group-hover:scale-105 transition-transform"
              >
                <circle cx="68" cy="26" r="8" fill="#1e5eb8" />
                <rect x="70" y="36" width="16" height="20" rx="3" fill="#1e5eb8" />
                <path
                  d="M66 38L52 50L44 46"
                  stroke="#1e5eb8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M58 54L52 68L42 68"
                  stroke="#1e5eb8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M44 46L36 68H24"
                  stroke="#1e5eb8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="28" cy="74" r="10" stroke="#1e5eb8" strokeWidth="6" fill="#f8fafc" />
                <circle cx="74" cy="74" r="10" stroke="#1e5eb8" strokeWidth="6" fill="#f8fafc" />
                <path
                  d="M28 74H74"
                  stroke="#1e5eb8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Bottom Dark Tab */}
            <div className="w-full py-2 bg-[#1e293b] text-white font-black text-sm sm:text-base rounded-xl text-center shadow-sm">
              توصيل
            </div>
          </button>

          {/* Card 3: Pick Up (Bottom Left) */}
          <button
            onClick={() => {
              posAudio.playCardSelect();
              onCardClick('pickup');
            }}
            className="group relative bg-white hover:bg-slate-50 active:scale-[0.98] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col items-center justify-between min-h-[175px] sm:min-h-[195px] cursor-pointer transition-all duration-200"
          >
            {/* Shopping Bag Icon with Red Badge "1" */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-auto">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#1e5eb8] group-hover:scale-105 transition-transform"
              >
                <path
                  d="M38 40V26C38 19.3726 43.3726 14 50 14C56.6274 14 62 19.3726 62 26V40"
                  stroke="#1e5eb8"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <rect x="20" y="34" width="60" height="54" rx="14" fill="#1e5eb8" />
                <circle cx="40" cy="56" r="3.5" fill="white" />
                <circle cx="60" cy="56" r="3.5" fill="white" />
                <path
                  d="M42 68C46 72 54 72 58 68"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              {/* Red Badge "1" matching video Frame 00:00 */}
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#e53935] text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white font-mono">
                {pickupCount || 1}
              </div>
            </div>

            {/* Bottom Dark Tab */}
            <div className="w-full py-2 bg-[#1e293b] text-white font-black text-sm sm:text-base rounded-xl text-center shadow-sm">
              Pick Up
            </div>
          </button>

          {/* Card 4: سفري (Bottom Right) */}
          <button
            onClick={() => {
              posAudio.playCardSelect();
              onCardClick('takeaway');
            }}
            className="group relative bg-white hover:bg-slate-50 active:scale-[0.98] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col items-center justify-between min-h-[175px] sm:min-h-[195px] cursor-pointer transition-all duration-200"
          >
            {/* Car Icon with Red Badge "4" */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-auto">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#1e5eb8] group-hover:scale-105 transition-transform"
              >
                <path
                  d="M20 54L28 34C29 31 33 29 37 29H63C67 29 71 31 72 34L80 54H86C89 54 91 56 91 59V68C91 70 89 72 87 72H84C84 78 79 83 73 83C67 83 62 78 62 72H38C38 78 33 83 27 83C21 83 16 78 16 72H13C10 72 9 70 9 68V59C9 56 11 54 14 54H20Z"
                  fill="#1e5eb8"
                />
                <circle cx="27" cy="72" r="5.5" fill="white" />
                <circle cx="73" cy="72" r="5.5" fill="white" />
                <rect x="30" y="36" width="16" height="13" rx="2" fill="white" />
                <rect x="54" y="36" width="16" height="13" rx="2" fill="white" />
                <circle cx="20" cy="58" r="3.5" fill="#facc15" />
                <circle cx="80" cy="58" r="3.5" fill="#facc15" />
              </svg>

              {/* Red Badge "4" matching video Frame 00:00 */}
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#e53935] text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white font-mono">
                {takeawayCount || 4}
              </div>
            </div>

            {/* Bottom Dark Tab */}
            <div className="w-full py-2 bg-[#1e293b] text-white font-black text-sm sm:text-base rounded-xl text-center shadow-sm">
              سفري
            </div>
          </button>

        </div>
      </main>

      {/* Terminal Settings / Cashier Menu Modal matching Video Frame 00:08 */}
      <TerminalMenuModal
        isOpen={isTerminalMenuOpen}
        onClose={() => setIsTerminalMenuOpen(false)}
        isShiftOpen={isShiftOpen}
        openingCash={openingCash}
        onOpenShiftModal={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenShiftModal) onOpenShiftModal();
        }}
        onOpenCashierShiftHub={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenCashierShiftHub) onOpenCashierShiftHub();
        }}
        printerConfig={printerConfig}
        onUpdatePrinterConfig={onUpdatePrinterConfig}
        onOpenDigitalReceipt={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenDigitalReceipt) onOpenDigitalReceipt();
        }}
        onOpenTerminalSettings={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenTerminalPrinters) {
            onOpenTerminalPrinters();
          } else {
            onOpenAdmin();
          }
        }}
        onChangeConnection={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenIPConnection) {
            onOpenIPConnection();
          } else {
            onOpenAdmin();
          }
        }}
        onCashierIn={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenCashierShiftHub) {
            onOpenCashierShiftHub();
          } else {
            onOpenAdmin();
          }
        }}
        onCashierOut={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenCashierShiftHub) {
            onOpenCashierShiftHub();
          } else if (onOpenCashierOut) {
            onOpenCashierOut();
          } else {
            onOpenAdmin();
          }
        }}
        onDailySalesReport={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenSellerStatement) {
            onOpenSellerStatement();
          } else {
            onOpenAdmin();
          }
        }}
        onCashierHistory={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenCashierHistory) {
            onOpenCashierHistory();
          } else if (onOpenSellerStatement) {
            onOpenSellerStatement();
          } else {
            onOpenAdmin();
          }
        }}
        onOpenSellerStatement={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenSellerStatement) {
            onOpenSellerStatement();
          } else {
            onOpenAdmin();
          }
        }}
        onOpenDeletedOrders={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenDeletedOrders) onOpenDeletedOrders();
        }}
        onOpenSettledOrders={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenSettledOrders) onOpenSettledOrders();
        }}
        onOpenMenuManager={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenMenuManager) onOpenMenuManager();
        }}
        onOpenFloorManager={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenFloorManager) onOpenFloorManager();
        }}
        onOpenKDS={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenKDS) onOpenKDS();
        }}
        onOpenZatca={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenZatca) onOpenZatca();
        }}
        onOpenTableQr={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenTableQr) onOpenTableQr();
        }}
        onOpenDeliveryFleet={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenDeliveryFleet) onOpenDeliveryFleet();
        }}
        onOpenLoyalty={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenLoyalty) onOpenLoyalty();
        }}
        onOpenCloudSync={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenCloudSync) onOpenCloudSync();
        }}
        onOpenProfitLoss={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenProfitLoss) onOpenProfitLoss();
        }}
        onOpenDeliveryAggregators={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenDeliveryAggregators) onOpenDeliveryAggregators();
        }}
        onOpenRecipeManager={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenRecipeManager) onOpenRecipeManager();
        }}
        onOpenSalesAnalytics={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenSalesAnalytics) onOpenSalesAnalytics();
        }}
        onLogout={() => {
          setIsTerminalMenuOpen(false);
          if (onLogout) onLogout();
        }}
        onOpenSecurityHub={() => {
          setIsTerminalMenuOpen(false);
          if (onOpenSecurityHub) onOpenSecurityHub();
        }}
        onOpenAdmin={() => {
          setIsTerminalMenuOpen(false);
          onOpenAdmin();
        }}
        employees={employees}
        adminPin={adminPin}
      />
    </div>
  );
};
