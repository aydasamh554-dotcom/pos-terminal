import React, { useState } from 'react';
import { 
  Award, 
  Tag, 
  Users, 
  Search, 
  Plus, 
  Check, 
  Star, 
  Gift, 
  Percent, 
  Phone, 
  Calendar,
  Sparkles,
  Crown,
  Copy
} from 'lucide-react';
import { CustomerProfile, PromoCoupon, INITIAL_CUSTOMERS, INITIAL_COUPONS } from '../data/restaurantSuiteData';
import { posAudio } from '../utils/audio';

interface LoyaltyAndCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export const LoyaltyAndCouponsModal: React.FC<LoyaltyAndCouponsModalProps> = ({
  isOpen,
  onClose,
  currency = 'ر.ع'
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'coupons'>('customers');
  
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('pos_customers_data');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [coupons, setCoupons] = useState<PromoCoupon[]>(() => {
    const saved = localStorage.getItem('pos_coupons_data');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCoupon, setCopiedCoupon] = useState<string>('');

  // Add customer modal state
  const [isAddingCust, setIsAddingCust] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustAddress, setNewCustAddress] = useState<string>('');

  // Add coupon modal state
  const [isAddingCoupon, setIsAddingCoupon] = useState<boolean>(false);
  const [newCouponCode, setNewCouponCode] = useState<string>('');
  const [newCouponValue, setNewCouponValue] = useState<string>('15');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponMin, setNewCouponMin] = useState<string>('10');

  if (!isOpen) return null;

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    posAudio.playSuccess();

    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'العنوان الرئيسي',
      totalOrders: 1,
      totalSpent: 0,
      loyaltyPoints: 10, // Welcome 10 points
      tier: 'silver',
      lastOrderDate: 'الآن (عميل جديد)'
    };

    setCustomers([newCust, ...customers]);
    setIsAddingCust(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    posAudio.playSuccess();

    const newCoupon: PromoCoupon = {
      id: `cp-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      value: parseFloat(newCouponValue) || 10,
      minOrderAmount: parseFloat(newCouponMin) || 0,
      expiryDate: '2026-12-31',
      usageCount: 0,
      maxUsage: 100,
      isActive: true,
      description: `خصم ${newCouponValue}${newCouponType === 'percentage' ? '%' : currency} على الطلبات`
    };

    setCoupons([newCoupon, ...coupons]);
    setIsAddingCoupon(false);
    setNewCouponCode('');
  };

  const handleCopyCoupon = (code: string) => {
    posAudio.playTap();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'بلاتيني', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60', icon: Crown };
      case 'gold':
        return { label: 'ذهبي', bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60', icon: Star };
      default:
        return { label: 'فضي', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: Award };
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const filteredCoupons = coupons.filter(cp => 
    cp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-5xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                برنامج ولاء العملاء والكوبونات (Loyalty & Rewards)
                <span className="text-[11px] bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-bold">
                  نقاط ومكافآت
                </span>
              </h2>
              <p className="text-slate-400 text-xs">سجل الزبائن، تجميع نقاط الولاء، وإدارة قسائم الخصم الترويجية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-[#0f172a] px-6 py-2 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                posAudio.playTap();
                setActiveTab('customers');
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>دليل العملاء ونقاط الولاء ({customers.length})</span>
            </button>

            <button
              onClick={() => {
                posAudio.playTap();
                setActiveTab('coupons');
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                activeTab === 'coupons'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>كوبونات ورموز الخصم ({coupons.length})</span>
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'customers' ? 'بحث باسم أو هاتف العميل...' : 'بحث بكود الكوبون...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0b1120]">
          {activeTab === 'customers' ? (
            /* Customers Section */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  يتم احتساب <b>نقطة واحدة</b> لكل 1 ريال يتم إنفاقه، ويمكن استبدال كل 50 نقطة بخصم 5 ريال.
                </p>
                <button
                  onClick={() => {
                    posAudio.playTap();
                    setIsAddingCust(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل عميل جديد</span>
                </button>
              </div>

              {/* Add Customer Form */}
              {isAddingCust && (
                <form onSubmit={handleAddCustomer} className="p-4 bg-[#1e293b] rounded-2xl border border-amber-500/60 space-y-3 animate-in zoom-in-95">
                  <h4 className="text-white font-bold text-xs">إضافة عميل جديد لبرنامج الولاء:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="اسم العميل"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="رقم الهاتف"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="العنوان (اختياري للتوصيل)"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">حفظ العميل</button>
                    <button type="button" onClick={() => setIsAddingCust(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">إلغاء</button>
                  </div>
                </form>
              )}

              {/* Customers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCustomers.map(cust => {
                  const tier = getTierBadge(cust.tier);
                  const TierIcon = tier.icon;

                  return (
                    <div 
                      key={cust.id}
                      className="p-4 bg-[#1e293b] rounded-2xl border border-slate-700/80 hover:border-slate-500 transition-all flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-black text-sm">{cust.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${tier.bg}`}>
                              <TierIcon className="w-3 h-3" />
                              {tier.label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span className="font-mono">{cust.phone}</span>
                            {cust.address && <span className="truncate max-w-[150px]">• {cust.address}</span>}
                          </p>
                        </div>

                        {/* Points badge */}
                        <div className="text-left bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">رصيد النقاط:</span>
                          <span className="text-amber-400 font-mono font-black text-base flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {cust.loyaltyPoints}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                        <span>إجمالي الطلبات: <b className="text-white">{cust.totalOrders}</b></span>
                        <span>إجمالي المشتريات: <b className="text-emerald-400 font-mono">{cust.totalSpent.toFixed(3)} {currency}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Coupons Section */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  يمكن إدخال هذه الأكواد أثناء الدفع في شاشة الدفع الرئيسية لتطبيق الخصم مباشرة.
                </p>
                <button
                  onClick={() => {
                    posAudio.playTap();
                    setIsAddingCoupon(true);
                  }}
                  className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء كوبون خصم</span>
                </button>
              </div>

              {/* Add Coupon Form */}
              {isAddingCoupon && (
                <form onSubmit={handleAddCoupon} className="p-4 bg-[#1e293b] rounded-2xl border border-pink-500/60 space-y-3 animate-in zoom-in-95">
                  <h4 className="text-white font-bold text-xs">إنشاء كود ترويجي جديد:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="رمز الكوبون (مثل: PROMO25)"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold"
                    />
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت ({currency})</option>
                    </select>
                    <input
                      type="number"
                      placeholder="قيمة الخصم"
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <input
                      type="number"
                      placeholder="الحد الأدنى للطلب"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-pink-600 text-white font-black text-xs rounded-xl">حفظ الكوبون</button>
                    <button type="button" onClick={() => setIsAddingCoupon(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">إلغاء</button>
                  </div>
                </form>
              )}

              {/* Coupons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCoupons.map(cp => (
                  <div 
                    key={cp.id}
                    className="p-4 bg-[#1e293b] rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 shadow-md hover:border-pink-500/60 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-pink-400 bg-pink-950/60 px-2.5 py-1 rounded-lg border border-pink-700/50">
                          {cp.code}
                        </span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          {cp.discountType === 'percentage' ? `${cp.value}% خصم` : `${cp.value} ${currency} خصم`}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs">{cp.description}</p>
                      <p className="text-slate-500 text-[10px]">الحد الأدنى: {cp.minOrderAmount} {currency} • الاستخدامات: {cp.usageCount}/{cp.maxUsage}</p>
                    </div>

                    <button
                      onClick={() => handleCopyCoupon(cp.code)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      {copiedCoupon === cp.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedCoupon === cp.code ? 'تم' : 'نسخ'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            بيانات العملاء والنقاط متزامنة سحابياً مع قاعدة البيانات
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
