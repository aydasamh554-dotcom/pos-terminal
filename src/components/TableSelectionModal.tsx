import React, { useState } from 'react';
import { RestaurantTable } from '../types';
import { posAudio } from '../utils/audio';
import { Users, X, Check, UtensilsCrossed, Clock, Search, ArrowRight, Home } from 'lucide-react';

interface TableSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  selectedTableId?: string;
  onSelectTable: (table: RestaurantTable, guestCount: number) => void;
}

export const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTableId,
  onSelectTable,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections = ['all', ...Array.from(new Set(tables.map((t) => t.section)))];

  const filteredTables = tables.filter((t) => {
    const matchesSection = selectedSection === 'all' || t.section === selectedSection;
    const matchesSearch =
      t.name.includes(searchQuery) ||
      t.number.toString().includes(searchQuery) ||
      t.section.includes(searchQuery);
    return matchesSection && matchesSearch;
  });

  const getStatusBadge = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-bold">متاحة</span>;
      case 'occupied':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-bold">مشغولة</span>;
      case 'reserved':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-full font-bold">محجوزة</span>;
      case 'billing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full font-bold">طلب حساب</span>;
    }
  };

  const handleTableClick = (table: RestaurantTable) => {
    posAudio.playTap();
    onSelectTable(table, guestCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { posAudio.playTap(); onClose(); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors shadow-xs"
            >
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>العودة للرئيسية</span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">طاولات الصالة (Dine-In)</h2>
              <p className="text-xs text-slate-500 font-semibold">حدد الطاولة المناسبة وعدد الضيوف لفتح الطلب</p>
            </div>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-2 rounded-xl bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Guest Count Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          {/* Section tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => { posAudio.playTap(); setSelectedSection(sec); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedSection === sec
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec === 'all' ? 'جميع الصالات' : sec}
              </button>
            ))}
          </div>

          {/* Guest Count selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-600 flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              عدد الضيوف:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { posAudio.playTap(); setGuestCount(num); }}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                    guestCount === num
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1 bg-slate-50/50 custom-scrollbar">
          {filteredTables.map((table) => {
            const isSelected = selectedTableId === table.id;
            const isOccupied = table.status === 'occupied';

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative p-4 rounded-2xl border transition-all text-right flex flex-col justify-between min-h-[120px] group cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                    : isOccupied
                    ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {table.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{table.section}</p>
                  </div>
                  {getStatusBadge(table.status)}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    يتسع لـ {table.capacity}
                  </span>

                  {isOccupied && table.currentTotal && (
                    <span className="text-amber-700 font-bold font-mono-num">
                      {table.currentTotal} ر.ع
                    </span>
                  )}

                  {!isOccupied && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" />
                      جاهزة
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              متاحة ({tables.filter(t => t.status === 'available').length})
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              مشغولة ({tables.filter(t => t.status === 'occupied').length})
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              محجوزة ({tables.filter(t => t.status === 'reserved').length})
            </span>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-colors cursor-pointer"
          >
            إلغاء وعودة
          </button>
        </div>
      </div>
    </div>
  );
};
