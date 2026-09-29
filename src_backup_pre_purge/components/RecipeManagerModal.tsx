import React, { useState } from 'react';
import { 
  X, 
  ChefHat, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  Search, 
  DollarSign, 
  Percent, 
  Layers 
} from 'lucide-react';
import { MealRecipe, RecipeIngredient, InventoryItem, POSSettings } from '../types';
import { DEFAULT_MEAL_RECIPES } from '../data/recipeData';
import { posAudio } from '../utils/audio';

interface RecipeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  settings: POSSettings;
  onSaveRecipes?: (recipes: Record<string, MealRecipe>) => void;
}

export const RecipeManagerModal: React.FC<RecipeManagerModalProps> = ({
  isOpen,
  onClose,
  inventory = [],
  settings,
  onSaveRecipes,
}) => {
  const [recipes, setRecipes] = useState<Record<string, MealRecipe>>(() => {
    const saved = localStorage.getItem('invo_meal_recipes');
    return saved ? JSON.parse(saved) : DEFAULT_MEAL_RECIPES;
  });

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    Object.keys(DEFAULT_MEAL_RECIPES)[0] || 'chk-1'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected recipe state for editing
  const activeRecipe = recipes[selectedRecipeId];

  // Add Ingredient form
  const [selectedInvItem, setSelectedInvItem] = useState<string>(inventory?.[0]?.id || '');
  const [ingredientQty, setIngredientQty] = useState<string>('0.25');

  if (!isOpen) return null;

  const handleSelectRecipe = (id: string) => {
    posAudio.playTap();
    setSelectedRecipeId(id);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipe) return;

    const inv = inventory.find(i => i.id === selectedInvItem);
    if (!inv) return;

    const qty = parseFloat(ingredientQty);
    if (isNaN(qty) || qty <= 0) {
      alert('يرجى إدخال كمية صحيحة');
      return;
    }

    const newIng: RecipeIngredient = {
      inventoryItemId: inv.id,
      name: inv.name,
      quantity: qty,
      unit: inv.unit,
      unitCost: inv.unitCost,
    };

    const updatedIngredients = [...activeRecipe.ingredients, newIng];
    const newTotalCost = updatedIngredients.reduce((s, it) => s + it.quantity * it.unitCost, 0);

    const updatedRecipe: MealRecipe = {
      ...activeRecipe,
      ingredients: updatedIngredients,
      totalFoodCost: Math.round(newTotalCost * 1000) / 1000,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const updatedAll = { ...recipes, [activeRecipe.mealId]: updatedRecipe };
    setRecipes(updatedAll);
    localStorage.setItem('invo_meal_recipes', JSON.stringify(updatedAll));
    if (onSaveRecipes) onSaveRecipes(updatedAll);
    posAudio.playSuccess();
  };

  const handleRemoveIngredient = (index: number) => {
    if (!activeRecipe) return;
    const updatedIngredients = activeRecipe.ingredients.filter((_, idx) => idx !== index);
    const newTotalCost = updatedIngredients.reduce((s, it) => s + it.quantity * it.unitCost, 0);

    const updatedRecipe: MealRecipe = {
      ...activeRecipe,
      ingredients: updatedIngredients,
      totalFoodCost: Math.round(newTotalCost * 1000) / 1000,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const updatedAll = { ...recipes, [activeRecipe.mealId]: updatedRecipe };
    setRecipes(updatedAll);
    localStorage.setItem('invo_meal_recipes', JSON.stringify(updatedAll));
    if (onSaveRecipes) onSaveRecipes(updatedAll);
    posAudio.playTap();
  };

  const filteredRecipeList = (Object.values(recipes) as MealRecipe[]).filter(r => 
    r.mealName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">إدارة الوصفات وتكاليف الوجبات (Recipe & Food Cost BOM)</h2>
              <p className="text-xs text-slate-400">
                ربط كل وجبة بمقاديرها من المواد الأولية لحساب التكلفة وخصم المخزون آلياً مع كل عملية بيع
              </p>
            </div>
          </div>

          <button
            onClick={() => { posAudio.playTap(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar of meals + Detail of selected recipe */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Meals Sidebar */}
          <div className="w-72 bg-slate-950/60 border-l border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن وجبة..."
                  className="bg-transparent text-white outline-none w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredRecipeList.map(rec => {
                const isSelected = rec.mealId === selectedRecipeId;
                return (
                  <button
                    key={rec.mealId}
                    onClick={() => handleSelectRecipe(rec.mealId)}
                    className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                        : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{rec.mealName}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{rec.ingredients.length} مكونات مسجلة</div>
                    </div>
                    <span className="font-mono-num text-[11px]">
                      {rec.totalFoodCost.toFixed(3)} {settings.currency}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipe Details Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {activeRecipe ? (
              <>
                {/* Recipe Summary Bar */}
                <div className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold block mb-1">بطاقة معيار المقادير للوجبة:</span>
                    <h3 className="text-xl font-black text-white">{activeRecipe.mealName}</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">إجمالي تكلفة المكونات (Food Cost):</span>
                      <strong className="text-lg font-black font-mono-num text-amber-400">
                        {activeRecipe.totalFoodCost.toFixed(3)} {settings.currency}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Add Ingredient Form */}
                <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>إضافة مادة أولية من المستودع إلى هذه الوصفة</span>
                  </h4>

                  <form onSubmit={handleAddIngredient} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">المادة الخام</label>
                      <select
                        value={selectedInvItem}
                        onChange={(e) => setSelectedInvItem(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none"
                      >
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unit} - تكلفة: {inv.unitCost} {settings.currency})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">الكمية لكل وجبة واحدة</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={ingredientQty}
                        onChange={(e) => setIngredientQty(e.target.value)}
                        placeholder="0.25"
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none font-mono-num"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إدراج في الوصفة</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Ingredients Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>المكونات المعيارية المعتمدة ({activeRecipe.ingredients.length} مقادير):</span>
                  </h4>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-3xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800/90 text-slate-300 uppercase">
                        <tr>
                          <th className="p-3.5">اسم المادة الخام</th>
                          <th className="p-3.5">الكمية المستهلكة</th>
                          <th className="p-3.5">تكلفة وحدة المادة</th>
                          <th className="p-3.5">تكلفة المكون في الوجبة</th>
                          <th className="p-3.5 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeRecipe.ingredients.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 font-bold text-white">{ing.name}</td>
                            <td className="p-3.5 font-mono-num font-bold text-indigo-300">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="p-3.5 font-mono-num text-slate-400">
                              {ing.unitCost} {settings.currency} / {ing.unit}
                            </td>
                            <td className="p-3.5 font-mono-num font-bold text-amber-400">
                              {(ing.quantity * ing.unitCost).toFixed(3)} {settings.currency}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleRemoveIngredient(idx)}
                                className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="إزالة المكون"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-2xl text-xs text-blue-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    عند بيع هذه الوجبة في شاشة الكاشير، سيقوم النظام تلقائياً بخصم هذه المقادير من رصيد المستودع وتحديث تكلفة البضاعة المباعة COGS.
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">اختر وجبة من القائمة الجانبية لتعديل وصفتها</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
