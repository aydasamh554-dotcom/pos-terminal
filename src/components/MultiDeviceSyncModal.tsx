import React, { useState } from 'react';
import { 
  Cloud, 
  Wifi, 
  Smartphone, 
  Monitor, 
  Tv, 
  Tablet, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  HardDrive, 
  Database,
  ArrowRightLeft,
  Server
} from 'lucide-react';
import { ConnectedDevice, INITIAL_CONNECTED_DEVICES } from '../data/restaurantSuiteData';
import { posAudio } from '../utils/audio';

interface MultiDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiDeviceSyncModal: React.FC<MultiDeviceSyncModalProps> = ({
  isOpen,
  onClose
}) => {
  const [devices, setDevices] = useState<ConnectedDevice[]>(INITIAL_CONNECTED_DEVICES);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('مكتملة ومستقرة');
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTriggerSync = () => {
    posAudio.playTap();
    setIsSyncing(true);
    setSyncStatus('جاري مزامنة الطاولات والطلبات والمخزون مع السحابة...');

    setTimeout(() => {
      posAudio.playSuccess();
      setIsSyncing(false);
      setSyncStatus('تمت المزامنة بنجاح (100% متطابق)');
      setDevices(prev => prev.map(d => ({ ...d, lastPing: 'الآن (متصل)', status: 'online' })));
    }, 1800);
  };

  const handleCreateBackup = () => {
    posAudio.playSuccess();
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'pos': return Monitor;
      case 'kds': return Tv;
      case 'waiter_tablet': return Tablet;
      case 'customer_display': return Monitor;
      default: return Cloud;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-4xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                الربط السحابي ومزامنة الأجهزة (Multi-Device & Cloud Sync)
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  Real-Time Mesh
                </span>
              </h2>
              <p className="text-slate-400 text-xs">مزامنة تابلت الويتر، شاشة المطبخ، والكاشير السحابي فائق السرعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Sync Controls Banner */}
        <div className="bg-[#0f172a] p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-white text-xs font-bold flex items-center gap-2">
                <span>حالة الاتصال السحابي:</span>
                <span className="text-emerald-400 font-mono font-black">{syncStatus}</span>
              </p>
              <p className="text-slate-400 text-[11px]">زمن الاستجابة (Latency): 18ms • بروتوكول WebSocket مشفر SSL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isSyncing}
              onClick={handleTriggerSync}
              className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة فورية الآن'}</span>
            </button>

            <button
              onClick={handleCreateBackup}
              className="h-10 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>نسخ احتياطي سحابي</span>
            </button>
          </div>
        </div>

        {backupSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تم حفظ نسخة احتياطية كاملة لجميع الفواتير والمخزون والإعدادات على السحابة بنجاح!</span>
          </div>
        )}

        {/* Connected Nodes List */}
        <div className="p-6 overflow-y-auto space-y-3 bg-[#0b1120] flex-1">
          <h3 className="text-slate-300 font-black text-xs flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>عقد وأجهزة الشبكة المحلية المتصلة بنظام المطعم ({devices.length} أجهزة):</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {devices.map(dev => {
              const DevIcon = getDeviceIcon(dev.type);

              return (
                <div
                  key={dev.id}
                  className="p-4 bg-[#1e293b] rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow">
                      <DevIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs">{dev.name}</h4>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                        IP: {dev.ipAddress} • {dev.lastPing}
                      </p>
                    </div>
                  </div>

                  <div className="text-left flex flex-col items-end">
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      متصل
                    </span>
                    {dev.batteryLevel !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono mt-1">
                        بطارية: {dev.batteryLevel}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            نظام حماية البيانات المشفر End-to-End Encryption
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
