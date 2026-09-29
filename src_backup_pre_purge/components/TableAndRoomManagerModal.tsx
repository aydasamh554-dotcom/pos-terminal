import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  QrCode, 
  Users, 
  LayoutGrid, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Printer, 
  Sparkles, 
  Crown, 
  Heart, 
  Sun, 
  Coffee, 
  Utensils, 
  Check, 
  AlertCircle,
  Eye,
  Smartphone,
  DoorOpen,
  Square,
  Circle,
  RectangleHorizontal
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import { RestaurantSection, RestaurantTable, TableShape } from '../types';
import { TableInstantQRModal } from './TableInstantQRModal';

interface TableAndRoomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: RestaurantSection[];
  tables: RestaurantTable[];
  onSaveSections: (newSections: RestaurantSection[]) => void;
  onSaveTables: (newTables: RestaurantTable[]) => void;
  currency?: string;
}

export const TableAndRoomManagerModal: React.FC<TableAndRoomManagerModalProps> = ({
  isOpen,
  onClose,
  sections,
  tables,
  onSaveSections,
  onSaveTables,
  currency = 'ر.ع'
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sections' | 'bulk_qr'>('tables');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>(sections[0]?.id || 'singles');
  
  // Quick Table QR Preview Modal
  const [qrPreviewTable, setQrPreviewTable] = useState<RestaurantTable | null>(null);

  // New/Edit Section State
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<{
    name: string;
    icon: string;
    color: string;
    description: string;
  }>({
    name: '',
    icon: 'LayoutGrid',
    color: 'slate',
    description: ''
  });

  // New/Edit Table State
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [tableForm, setTableForm] = useState<{
    name: string;
    sectionId: string;
    shape: TableShape;
    capacity: number;
    isVip: boolean;
    notes: string;
  }>({
    name: '',
    sectionId: sections[0]?.id || 'singles',
    shape: 'rectangle',
    capacity: 4,
    isVip: false,
    notes: ''
  });

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Section CRUD Handlers
  // -------------------------------------------------------------
  const handleStartAddSection = () => {
    posAudio.playTap();
    setSectionForm({
      name: '',
      icon: 'LayoutGrid',
      color: 'slate',
      description: ''
    });
    setEditingSectionId(null);
    setIsAddingSection(true);
  };

  const handleStartEditSection = (sec: RestaurantSection) => {
    posAudio.playTap();
    setSectionForm({
      name: sec.name,
      icon: sec.icon || 'LayoutGrid',
      color: sec.color || 'slate',
      description: sec.description || ''
    });
    setEditingSectionId(sec.id);
    setIsAddingSection(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) return;
    posAudio.playCash();

    if (editingSectionId) {
      // Update existing
      const updated = sections.map(s => {
        if (s.id === editingSectionId) {
          return {
            ...s,
            name: sectionForm.name.trim(),
            icon: sectionForm.icon,
            color: sectionForm.color,
            description: sectionForm.description.trim()
          };
        }
        return s;
      });
      onSaveSections(updated);
    } else {
      // Create new section
      const newSecId = `sec-${Date.now()}`;
      const newSec: RestaurantSection = {
        id: newSecId,
        name: sectionForm.name.trim(),
        icon: sectionForm.icon,
        color: sectionForm.color,
        description: sectionForm.description.trim(),
        sortOrder: sections.length + 1
      };
      const updated = [...sections, newSec];
      onSaveSections(updated);
      setSelectedSectionFilter(newSecId);
    }

    setIsAddingSection(false);
    setEditingSectionId(null);
  };

  const handleDeleteSection = (secId: string, secName: string) => {
    posAudio.playTrash();
    if (window.confirm(`هل أنت متأكد من حذف قسم "${secName}" وجميع الطاولات التابعة له؟`)) {
      const updatedSections = sections.filter(s => s.id !== secId);
      const updatedTables = tables.filter(t => t.sectionId !== secId && t.section !== secId && t.section !== secName);
      onSaveSections(updatedSections);
      onSaveTables(updatedTables);
      if (selectedSectionFilter === secId && updatedSections.length > 0) {
        setSelectedSectionFilter(updatedSections[0].id);
      }
    }
  };

  // -------------------------------------------------------------
  // Table CRUD Handlers
  // -------------------------------------------------------------
  const handleStartAddTable = () => {
    posAudio.playTap();
    const currentSec = sections.find(s => s.id === selectedSectionFilter);
    const countInSec = tables.filter(t => t.sectionId === selectedSectionFilter).length;
    
    setTableForm({
      name: `${currentSec?.name.includes('غرف') ? 'غرفة' : currentSec?.name.includes('مجلس') ? 'مجلس' : 'طاولة'} ${countInSec + 1}`,
      sectionId: selectedSectionFilter,
      shape: currentSec?.id === 'rooms' ? 'round' : currentSec?.id === 'majlis' ? 'majlis' : 'rectangle',
      capacity: currentSec?.id === 'rooms' ? 8 : 4,
      isVip: currentSec?.id === 'rooms' || false,
      notes: ''
    });
    setEditingTableId(null);
    setIsAddingTable(true);
  };

  const handleStartEditTable = (tbl: RestaurantTable) => {
    posAudio.playTap();
    setTableForm({
      name: tbl.name,
      sectionId: tbl.sectionId || selectedSectionFilter,
      shape: tbl.shape || 'rectangle',
      capacity: tbl.capacity || 4,
      isVip: tbl.isVip || false,
      notes: tbl.notes || ''
    });
    setEditingTableId(tbl.id);
    setIsAddingTable(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.name.trim()) return;
    posAudio.playCash();

    const targetSec = sections.find(s => s.id === tableForm.sectionId);
    const secName = targetSec?.name || 'الصالة';

    if (editingTableId) {
      // Update existing table
      const updated = tables.map(t => {
        if (t.id === editingTableId) {
          return {
            ...t,
            name: tableForm.name.trim(),
            sectionId: tableForm.sectionId,
            section: secName,
            shape: tableForm.shape,
            capacity: Number(tableForm.capacity),
            isVip: tableForm.isVip,
            notes: tableForm.notes.trim()
          };
        }
        return t;
      });
      onSaveTables(updated);
    } else {
      // Create new table
      const newTblId = `tbl-${Date.now()}`;
      const newTable: RestaurantTable = {
        id: newTblId,
        name: tableForm.name.trim(),
        sectionId: tableForm.sectionId,
        section: secName,
        shape: tableForm.shape,
        capacity: Number(tableForm.capacity),
        status: 'available',
        isOccupied: false,
        isVip: tableForm.isVip,
        notes: tableForm.notes.trim(),
        sortOrder: tables.length + 1
      };
      const updated = [...tables, newTable];
      onSaveTables(updated);
    }

    setIsAddingTable(false);
    setEditingTableId(null);
  };

  const handleDeleteTable = (tblId: string, tblName: string) => {
    posAudio.playTrash();
    if (window.confirm(`هل أنت متأكد من حذف "${tblName}"؟`)) {
      const updated = tables.filter(t => t.id !== tblId);
      onSaveTables(updated);
    }
  };

  const handleMoveTableOrder = (tblId: string, direction: 'up' | 'down') => {
    posAudio.playTap();
    const currentSecTables = tables.filter(t => (t.sectionId || selectedSectionFilter) === selectedSectionFilter);
    const index = currentSecTables.findIndex(t => t.id === tblId);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const prevTable = currentSecTables[index - 1];
      const currentTable = currentSecTables[index];
      // swap in full array
      const fullCopy = [...tables];
      const idxA = fullCopy.findIndex(t => t.id === currentTable.id);
      const idxB = fullCopy.findIndex(t => t.id === prevTable.id);
      [fullCopy[idxA], fullCopy[idxB]] = [fullCopy[idxB], fullCopy[idxA]];
      onSaveTables(fullCopy);
    } else if (direction === 'down' && index < currentSecTables.length - 1) {
      const nextTable = currentSecTables[index + 1];
      const currentTable = currentSecTables[index];
      const fullCopy = [...tables];
      const idxA = fullCopy.findIndex(t => t.id === currentTable.id);
      const idxB = fullCopy.findIndex(t => t.id === nextTable.id);
      [fullCopy[idxA], fullCopy[idxB]] = [fullCopy[idxB], fullCopy[idxA]];
      onSaveTables(fullCopy);
    }
  };

  // Filtered tables
  const displayedTables = tables.filter(
    t => t.sectionId === selectedSectionFilter || t.section === selectedSectionFilter
  );

  const activeSectionObj = sections.find(s => s.id === selectedSectionFilter);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-5xl bg-[#0f172a] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                <span>إدارة الصالات والغرف والطاولات ورموز الـ QR</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  تخصيص كامل
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                إضافة وحذف وتعديل الصالات والغرف، تغيير أشكال الطاولات ومواقعها، وتوليد باركود الطلب الذكي
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                posAudio.playTap();
                setActiveTab('tables');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'tables'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>إدارة الطاولات والغرف ({tables.length})</span>
            </button>

            <button
              onClick={() => {
                posAudio.playTap();
                setActiveTab('sections');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>إدارة الصالات والأقسام ({sections.length})</span>
            </button>

            <button
              onClick={() => {
                posAudio.playTap();
                setActiveTab('bulk_qr');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'bulk_qr'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>طباعة باركودات جميع الطاولات</span>
            </button>
          </div>

          {activeTab === 'tables' && (
            <button
              onClick={handleStartAddTable}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طاولة / غرفة جديدة</span>
            </button>
          )}

          {activeTab === 'sections' && (
            <button
              onClick={handleStartAddSection}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صالة / قسم جديد</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">

          {/* ========================================================= */}
          {/* TAB 1: TABLES AND ROOMS MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'tables' && (
            <div className="space-y-5">
              
              {/* Section Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-slate-400 font-bold ml-1 shrink-0">اختر الصالة:</span>
                {sections.map(sec => {
                  const count = tables.filter(t => t.sectionId === sec.id || t.section === sec.id).length;
                  const isSelected = selectedSectionFilter === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        posAudio.playTap();
                        setSelectedSectionFilter(sec.id);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#1e293b] text-white border border-indigo-500 shadow-md ring-1 ring-indigo-400/40'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{sec.name}</span>
                      <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add / Edit Table Inline Card */}
              {isAddingTable && (
                <form 
                  onSubmit={handleSaveTable}
                  className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border-2 border-indigo-500/50 shadow-xl animate-in zoom-in-95 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{editingTableId ? 'تعديل بيانات وشكل الطاولة / الغرفة' : 'إضافة طاولة أو كبينة جديدة'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingTable(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطاولة / الغرفة *</label>
                      <input
                        type="text"
                        required
                        value={tableForm.name}
                        onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                        placeholder="مثال: طاولة 5 أو كبينة VIP 2"
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الصالة / القسم التابع له</label>
                      <select
                        value={tableForm.sectionId}
                        onChange={(e) => setTableForm({ ...tableForm, sectionId: e.target.value })}
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        {sections.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">شكل الطاولة / نوع الجلسة</label>
                      <select
                        value={tableForm.shape}
                        onChange={(e) => setTableForm({ ...tableForm, shape: e.target.value as TableShape })}
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="rectangle">▭ مستطيلة (كراسي علوية وسفلية)</option>
                        <option value="round">⭕ دائرية (كراسي محيطية)</option>
                        <option value="square">🔲 مربعة (مدمجة)</option>
                        <option value="booth">🚪 كبينة / غرفة مغلقة VIP</option>
                        <option value="majlis">🛋️ جلسة أرضية عربية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعة (عدد الكراسي / الأشخاص)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={tableForm.capacity}
                        onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ملاحظات وتفضيلات خاصة بالطاولة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={tableForm.notes}
                        onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                        placeholder="مثال: طاولة قريبة من النافذة، توفير كراسي أطفال، جلسة هادئة..."
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={tableForm.isVip}
                        onChange={(e) => setTableForm({ ...tableForm, isVip: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0"
                      />
                      <span>طاولة مميزة / خدمة VIP خاصة</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTable(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingTableId ? 'حفظ التعديلات' : 'إضافة الطاولة الآن'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Tables Grid Display with Shapes & Built-in Instant QR Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {displayedTables.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-sm font-bold">لا توجد طاولات أو غرف في هذا القسم حتى الآن.</p>
                    <button
                      onClick={handleStartAddTable}
                      className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة أول طاولة في {activeSectionObj?.name || 'هذا القسم'}</span>
                    </button>
                  </div>
                ) : (
                  displayedTables.map((tbl, idx) => (
                    <div
                      key={tbl.id}
                      className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/60 shadow-lg flex flex-col justify-between transition-all group"
                    >
                      {/* Top Row: Name, VIP Badge, Shape Tag */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-white font-black text-sm">{tbl.name}</h4>
                            {tbl.isVip && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            السعة: <span className="text-indigo-300 font-bold">{tbl.capacity} أشخاص</span> • {
                              tbl.shape === 'round' ? '⭕ دائرية' :
                              tbl.shape === 'booth' ? '🚪 كبينة مغلقة' :
                              tbl.shape === 'majlis' ? '🛋️ مجلس أرضي' :
                              tbl.shape === 'square' ? '🔲 مربعة' : '▭ مستطيلة'
                            }
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          tbl.isOccupied
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {tbl.isOccupied ? 'مشغولة' : 'شاغرة'}
                        </span>
                      </div>

                      {/* Visual Mini Table Preview */}
                      <div className="my-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-center">
                        {tbl.shape === 'round' ? (
                          <div className="w-14 h-14 rounded-full bg-indigo-900/60 border-2 border-indigo-500/80 flex items-center justify-center text-white text-[11px] font-black shadow">
                            {tbl.capacity}P
                          </div>
                        ) : tbl.shape === 'square' ? (
                          <div className="w-12 h-12 rounded-lg bg-indigo-900/60 border-2 border-indigo-500/80 flex items-center justify-center text-white text-[11px] font-black shadow">
                            {tbl.capacity}P
                          </div>
                        ) : tbl.shape === 'booth' ? (
                          <div className="w-20 h-12 rounded-xl bg-amber-950/60 border-2 border-amber-500/80 flex items-center justify-center text-amber-200 text-[10px] font-black shadow">
                            كبينة {tbl.capacity}
                          </div>
                        ) : tbl.shape === 'majlis' ? (
                          <div className="w-20 h-12 rounded-lg bg-teal-950/60 border-2 border-teal-500/80 flex items-center justify-center text-teal-200 text-[10px] font-black shadow">
                            مجلس {tbl.capacity}
                          </div>
                        ) : (
                          <div className="w-20 h-11 rounded-lg bg-indigo-900/60 border-2 border-indigo-500/80 flex items-center justify-center text-white text-[11px] font-black shadow">
                            {tbl.capacity} كراسي
                          </div>
                        )}
                      </div>

                      {/* Display notes if present */}
                      {tbl.notes && (
                        <div className="mb-2 text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg flex items-center gap-1.5 truncate">
                          <span>📝</span>
                          <span className="truncate">{tbl.notes}</span>
                        </div>
                      )}

                      {/* Instant QR Quick Launch Button & CRUD Controls */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                        
                        {/* Instant Customer QR launcher for this exact table */}
                        <button
                          onClick={() => {
                            posAudio.playTap();
                            setQrPreviewTable(tbl);
                          }}
                          className="h-8 px-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[11px] rounded-lg shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>كود الـ QR وطلب الجوال</span>
                        </button>

                        {/* Order Reordering & Edit/Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            title="تحريك لأعلى"
                            disabled={idx === 0}
                            onClick={() => handleMoveTableOrder(tbl.id, 'up')}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            title="تحريك لأسفل"
                            disabled={idx === displayedTables.length - 1}
                            onClick={() => handleMoveTableOrder(tbl.id, 'down')}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            title="تعديل الطاولة"
                            onClick={() => handleStartEditTable(tbl)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            title="حذف الطاولة"
                            onClick={() => handleDeleteTable(tbl.id, tbl.name)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SECTIONS AND HALLS MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'sections' && (
            <div className="space-y-5">
              {/* Add / Edit Section Form */}
              {isAddingSection && (
                <form 
                  onSubmit={handleSaveSection}
                  className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border-2 border-indigo-500/50 shadow-xl animate-in zoom-in-95 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>{editingSectionId ? 'تعديل بيانات الصالة / القسم' : 'إضافة صالة جديدة للمطعم'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم الصالة / القسم *</label>
                      <input
                        type="text"
                        required
                        value={sectionForm.name}
                        onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                        placeholder="مثال: صالة الـ VIP أو التراس الخارجي"
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الأيقونة المعبرة</label>
                      <select
                        value={sectionForm.icon}
                        onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Users">👥 الأفراد (Users)</option>
                        <option value="Heart">❤️ العائلات (Heart)</option>
                        <option value="Crown">👑 الغرف والـ VIP (Crown)</option>
                        <option value="Sun">☀️ الجلسات الخارجية والتراس (Sun)</option>
                        <option value="Sparkles">✨ المجالس التراثية (Sparkles)</option>
                        <option value="Coffee">☕ المقهى والكافيه (Coffee)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">وصف الصالة (اختياري)</label>
                      <input
                        type="text"
                        value={sectionForm.description}
                        onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                        placeholder="مثال: جلسات هادئة مكيفة مع خصوصية"
                        className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSectionId ? 'حفظ التعديلات' : 'إنشاء القسم الجديد'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sections List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((sec, idx) => {
                  const count = tables.filter(t => t.sectionId === sec.id || t.section === sec.id).length;
                  return (
                    <div 
                      key={sec.id}
                      className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                              {sec.icon === 'Crown' ? <Crown className="w-4 h-4 text-amber-400" /> :
                               sec.icon === 'Heart' ? <Heart className="w-4 h-4 text-rose-400" /> :
                               sec.icon === 'Sun' ? <Sun className="w-4 h-4 text-emerald-400" /> :
                               sec.icon === 'Sparkles' ? <Sparkles className="w-4 h-4 text-teal-400" /> :
                               <Users className="w-4 h-4 text-slate-300" />}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-white">{sec.name}</h4>
                              <p className="text-[11px] text-slate-400">{count} طاولات / غرف</p>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                        </div>

                        {sec.description && (
                          <p className="text-xs text-slate-400 mt-2 bg-slate-950/40 p-2 rounded-xl">
                            {sec.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            posAudio.playTap();
                            setSelectedSectionFilter(sec.id);
                            setActiveTab('tables');
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض طاولات القسم</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditSection(sec)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="تعديل اسم وبيانات القسم"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id, sec.name)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="حذف القسم"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: BULK QR PRINT SHEET */}
          {/* ========================================================= */}
          {activeTab === 'bulk_qr' && (
            <div className="space-y-5">
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-sm">طباعة بطاقات الباركود المجمعة لجميع الطاولات</h3>
                  <p className="text-xs text-slate-400 mt-0.5">جاهزة للطباعة والقص ووضعها داخل حوامل الأكريليك على الطاولات والغرف</p>
                </div>
                <button
                  onClick={() => {
                    posAudio.playCash();
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة ورقة الباركودات بالكامل</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tables.map(tbl => {
                  const secObj = sections.find(s => s.id === tbl.sectionId);
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://restaurant.menu.app/order?table=${encodeURIComponent(tbl.name)}&id=${tbl.id}`)}`;
                  return (
                    <div 
                      key={tbl.id}
                      className="bg-white rounded-2xl p-3 border-2 border-slate-300 shadow flex flex-col items-center text-center text-slate-900"
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {secObj?.name || tbl.section}
                      </div>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">{tbl.name}</h4>
                      
                      <div className="my-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <img 
                          src={qrUrl} 
                          alt={tbl.name} 
                          className="w-28 h-28 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <span className="text-[9px] font-mono text-slate-600">امسح للطلب من الجوال</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            إجمالي الصالات: <strong className="text-white">{sections.length}</strong> • إجمالي الطاولات: <strong className="text-white">{tables.length}</strong>
          </span>
          <button
            onClick={() => {
              posAudio.playTap();
              onClose();
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            تم والإغلاق
          </button>
        </div>
      </div>

      {/* Individual Instant QR Preview Modal */}
      {qrPreviewTable && (
        <TableInstantQRModal
          isOpen={true}
          onClose={() => setQrPreviewTable(null)}
          table={qrPreviewTable}
          sectionName={sections.find(s => s.id === qrPreviewTable.sectionId)?.name || qrPreviewTable.section}
          currency={currency}
        />
      )}
    </div>
  );
};
