import React, { useState, useMemo, useEffect } from 'react';
import { Theme, DairyRecord, DairySeller, DairyPayment, getSafeId } from '../types.ts';
import { 
  Milk, Droplets, Calendar, Plus, Trash2, ChevronLeft, ChevronRight, 
  Download, TrendingUp, Save, Settings, Edit2, User, Check, X, Store,
  CreditCard, History as HistIcon, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface DairyProps {
  theme: Theme;
  records: DairyRecord[];
  sellers: DairySeller[];
  payments: DairyPayment[];
  onUpdate: (records: DairyRecord[]) => void;
  onUpdateSellers: (sellers: DairySeller[]) => void;
  onUpdatePayments: (payments: DairyPayment[]) => void;
}

const Dairy: React.FC<DairyProps> = ({ 
  theme, records, sellers, payments = [], 
  onUpdate, onUpdateSellers, onUpdatePayments 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'billing' | 'settings'>('records');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  // Form State for Entry
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [milkQty, setMilkQty] = useState('250');
  const [milkPrice, setMilkPrice] = useState('60');
  const [waterQty, setWaterQty] = useState('0');
  const [waterPrice, setWaterPrice] = useState('20');
  const [selectedMilkSellerId, setSelectedMilkSellerId] = useState('');
  const [selectedWaterSellerId, setSelectedWaterSellerId] = useState('');
  const [notes, setNotes] = useState('');

  // Form State for Seller
  const [isAddingSeller, setIsAddingSeller] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [sellerType, setSellerType] = useState<'milk' | 'water' | 'both'>('both');
  const [sellerMilkPrice, setSellerMilkPrice] = useState('60');
  const [sellerWaterPrice, setSellerWaterPrice] = useState('20');

  // Billing State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentSellerId, setPaymentSellerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  const isDark = theme === 'dark';

  // Presets for Quantity
  const qtyPresets = [
    { label: '100ml', value: 100 },
    { label: '250ml', value: 250 },
    { label: '500ml', value: 500 },
    { label: '750ml', value: 750 },
    { label: '1L', value: 1000 }
  ];

  useEffect(() => {
    if (!isAdding) return;
    const defaultMilkSeller = sellers.find(s => s.isDefault && (!s.sellerType || s.sellerType === 'milk' || s.sellerType === 'both')) || sellers.find(s => !s.sellerType || s.sellerType === 'milk' || s.sellerType === 'both');
    if (defaultMilkSeller) {
      setSelectedMilkSellerId(defaultMilkSeller.id);
      setMilkPrice(defaultMilkSeller.milkPrice.toString());
    }
    const defaultWaterSeller = sellers.find(s => s.isDefault && (!s.sellerType || s.sellerType === 'water' || s.sellerType === 'both')) || sellers.find(s => !s.sellerType || s.sellerType === 'water' || s.sellerType === 'both');
    if (defaultWaterSeller) {
      setSelectedWaterSellerId(defaultWaterSeller.id);
      setWaterPrice(defaultWaterSeller.waterPrice.toString());
    }
  }, [sellers, isAdding]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [records, currentMonth]);

  const stats = useMemo(() => {
    let totalMilk = 0;
    let totalWater = 0;
    let totalCost = 0;
    filteredRecords.forEach(r => {
      totalMilk += r.milkQty;
      totalWater += r.waterQty;
      totalCost += (r.milkQty * r.milkPrice) + (r.waterQty * r.waterPrice);
    });
    return { totalMilk, totalWater, totalCost };
  }, [filteredRecords]);

  const handleAddOrUpdateRecord = () => {
    const recordData: DairyRecord = {
      id: editingRecordId || getSafeId(),
      date,
      milkQty: (parseFloat(milkQty) || 0) / 1000,
      milkPrice: parseFloat(milkPrice) || 0,
      waterQty: parseInt(waterQty) || 0,
      waterPrice: parseFloat(waterPrice) || 0,
      milkSellerId: selectedMilkSellerId,
      waterSellerId: selectedWaterSellerId,
      sellerId: selectedMilkSellerId || selectedWaterSellerId, // legacy fallback
      notes: notes.trim()
    };

    if (editingRecordId) {
      onUpdate(records.map(r => r.id === editingRecordId ? recordData : r));
    } else {
      onUpdate([...records, recordData]);
    }
    resetEntryForm();
  };

  const resetEntryForm = () => {
    setIsAdding(false);
    setEditingRecordId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setMilkQty('250');
    setWaterQty('0');
    setNotes('');
    const defaultMilkSeller = sellers.find(s => s.isDefault && (!s.sellerType || s.sellerType === 'milk' || s.sellerType === 'both')) || sellers.find(s => !s.sellerType || s.sellerType === 'milk' || s.sellerType === 'both');
    if (defaultMilkSeller) {
      setSelectedMilkSellerId(defaultMilkSeller.id);
      setMilkPrice(defaultMilkSeller.milkPrice.toString());
    } else {
      setSelectedMilkSellerId('');
    }
    const defaultWaterSeller = sellers.find(s => s.isDefault && (!s.sellerType || s.sellerType === 'water' || s.sellerType === 'both')) || sellers.find(s => !s.sellerType || s.sellerType === 'water' || s.sellerType === 'both');
    if (defaultWaterSeller) {
      setSelectedWaterSellerId(defaultWaterSeller.id);
      setWaterPrice(defaultWaterSeller.waterPrice.toString());
    } else {
      setSelectedWaterSellerId('');
    }
  };

  const startEditRecord = (record: DairyRecord) => {
    setEditingRecordId(record.id);
    setDate(record.date);
    setMilkQty((record.milkQty * 1000).toString());
    setMilkPrice(record.milkPrice.toString());
    setWaterQty(record.waterQty.toString());
    setWaterPrice(record.waterPrice.toString());
    setSelectedMilkSellerId(record.milkSellerId || record.sellerId || '');
    setSelectedWaterSellerId(record.waterSellerId || record.sellerId || '');
    setNotes(record.notes || '');
    setIsAdding(true);
  };

  const handleAddOrUpdateSeller = () => {
    const sellerData: DairySeller = {
      id: editingSellerId || getSafeId(),
      name: sellerName,
      milkPrice: parseFloat(sellerMilkPrice) || 0,
      waterPrice: parseFloat(sellerWaterPrice) || 0,
      isDefault: sellers.length === 0 || (editingSellerId ? sellers.find(s => s.id === editingSellerId)?.isDefault : false) || false,
      sellerType
    };

    if (editingSellerId) {
      onUpdateSellers(sellers.map(s => s.id === editingSellerId ? sellerData : s));
    } else {
      onUpdateSellers([...sellers, sellerData]);
    }
    resetSellerForm();
  };

  const resetSellerForm = () => {
    setIsAddingSeller(false);
    setEditingSellerId(null);
    setSellerName('');
    setSellerType('both');
    setSellerMilkPrice('60');
    setSellerWaterPrice('20');
  };

  const startEditSeller = (seller: DairySeller) => {
    setEditingSellerId(seller.id);
    setSellerName(seller.name);
    setSellerType(seller.sellerType || 'both');
    setSellerMilkPrice(seller.milkPrice.toString());
    setSellerWaterPrice(seller.waterPrice.toString());
    setIsAddingSeller(true);
  };

  const setDefaultSeller = (id: string) => {
    onUpdateSellers(sellers.map(s => ({ ...s, isDefault: s.id === id })));
  };

  const deleteSeller = (id: string) => {
    // Removed confirm() as it fails in iframes
    onUpdateSellers(sellers.filter(s => s.id !== id));
  };

  const deleteRecord = (id: string) => {
    // Removed confirm() as it fails in iframes
    onUpdate(records.filter(r => r.id !== id));
  };

  const handleAddPayment = () => {
    if (!paymentSellerId || !paymentAmount) return;

    const newPayment: DairyPayment = {
      id: getSafeId(),
      sellerId: paymentSellerId,
      amount: parseFloat(paymentAmount) || 0,
      date: paymentDate,
      timestamp: new Date(paymentDate).getTime(),
      notes: paymentNotes
    };

    onUpdatePayments([...payments, newPayment]);
    setIsAddingPayment(false);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const deletePayment = (id: string) => {
    onUpdatePayments(payments.filter(p => p.id !== id));
  };

  const sellerBillingData = useMemo(() => {
    return sellers.map(seller => {
      const sellerRecords = records.filter(r => 
        r.milkSellerId === seller.id || 
        r.waterSellerId === seller.id || 
        (!r.milkSellerId && !r.waterSellerId && r.sellerId === seller.id)
      );
      const sellerPayments = payments.filter(p => p.sellerId === seller.id);

      const totalSpent = sellerRecords.reduce((sum, r) => {
        let cost = 0;
        if (r.milkSellerId === seller.id || (!r.milkSellerId && r.sellerId === seller.id)) {
          cost += (r.milkQty * r.milkPrice);
        }
        if (r.waterSellerId === seller.id || (!r.waterSellerId && r.sellerId === seller.id)) {
          cost += (r.waterQty * r.waterPrice);
        }
        return sum + cost;
      }, 0);

      const totalPaid = sellerPayments.reduce((sum, p) => sum + p.amount, 0);
      const pending = totalSpent - totalPaid;

      return {
        ...seller,
        totalSpent,
        totalPaid,
        pending,
        lastPayment: sellerPayments.sort((a, b) => b.timestamp - a.timestamp)[0]
      };
    });
  }, [sellers, records, payments]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + offset);
    setCurrentMonth(next);
  };

  const handleMilkSellerSelect = (id: string) => {
    setSelectedMilkSellerId(id);
    const seller = sellers.find(s => s.id === id);
    if (seller) setMilkPrice(seller.milkPrice.toString());
  };

  const handleWaterSellerSelect = (id: string) => {
    setSelectedWaterSellerId(id);
    const seller = sellers.find(s => s.id === id);
    if (seller) setWaterPrice(seller.waterPrice.toString());
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Milk size={20} />
          </div>
          <h2 className="font-outfit font-bold text-xl">Dairy Manager</h2>
        </div>
        <div className={`flex p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button 
            onClick={() => setActiveSubTab('records')}
            className={`p-2 rounded-lg transition-all ${activeSubTab === 'records' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500'}`}
          >
            <Calendar size={16} />
          </button>
          <button 
            onClick={() => setActiveSubTab('billing')}
            className={`p-2 rounded-lg transition-all ${activeSubTab === 'billing' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500'}`}
          >
            <CreditCard size={16} />
          </button>
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={`p-2 rounded-lg transition-all ${activeSubTab === 'settings' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500'}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {activeSubTab === 'records' ? (
        <>
          {/* Month Picker & Stats */}
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black uppercase tracking-wider px-2">
                {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-500">Monthly Bill</p>
              <h3 className="text-xl font-outfit font-black text-emerald-500">₹{stats.totalCost.toFixed(0)}</h3>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Daily Entry
          </button>

          {/* Add/Edit Entry Form */}
          {isAdding && (
            <div className={`p-5 rounded-3xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">{editingRecordId ? 'Edit Entry' : 'New Delivery Entry'}</h3>
                <button onClick={resetEntryForm} className="text-slate-400 hover:text-rose-500"><X size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Milk Section */}
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-blue-500"><Milk size={14} /> Milk Details</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Milk Seller</label>
                      <select 
                        value={selectedMilkSellerId}
                        onChange={(e) => handleMilkSellerSelect(e.target.value)}
                        className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      >
                        <option value="">Manual Entry</option>
                        {sellers.filter(s => !s.sellerType || s.sellerType === 'milk' || s.sellerType === 'both').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Qty (ml)</label>
                        <input 
                          type="number" 
                          step="1"
                          value={milkQty} 
                          onChange={(e) => setMilkQty(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price/L</label>
                        <input 
                          type="number" 
                          value={milkPrice} 
                          onChange={(e) => setMilkPrice(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>

                    {/* Quantity Presets */}
                    <div className="flex flex-wrap gap-2">
                      {qtyPresets.map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => setMilkQty(preset.value.toString())}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
                            milkQty === preset.value.toString()
                              ? 'bg-blue-600 text-white'
                              : (isDark ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-white text-slate-500 border border-slate-200')
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Water Section */}
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-sky-500"><Droplets size={14} /> Water Details</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Water Seller</label>
                      <select 
                        value={selectedWaterSellerId}
                        onChange={(e) => handleWaterSellerSelect(e.target.value)}
                        className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      >
                        <option value="">Manual Entry</option>
                        {sellers.filter(s => !s.sellerType || s.sellerType === 'water' || s.sellerType === 'both').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Jars</label>
                        <input 
                          type="number" 
                          step="1"
                          value={waterQty} 
                          onChange={(e) => setWaterQty(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price/Jar</label>
                        <input 
                          type="number" 
                          value={waterPrice} 
                          onChange={(e) => setWaterPrice(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs font-bold outline-none border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Remarks / Notes (Optional)</label>
                  <input 
                    type="text" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra milk for guests"
                    className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>

                <button 
                  onClick={handleAddOrUpdateRecord}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Save size={18} /> {editingRecordId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </div>
          )}

          {/* Records List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Daily Records</h3>
            {filteredRecords.length === 0 ? (
              <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${isDark ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold">No records for this month</p>
              </div>
            ) : (
              filteredRecords.map(record => {
                const milkSeller = sellers.find(s => s.id === (record.milkSellerId || record.sellerId));
                const waterSeller = sellers.find(s => s.id === (record.waterSellerId || record.sellerId));
                return (
                  <div 
                    key={record.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${isDark ? 'bg-slate-800/20 border-slate-800 hover:bg-slate-800/40' : 'bg-white border-slate-100 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        {new Date(record.date).getDate()}
                      </div>
                      <div>
                        <div className="flex flex-col gap-1">
                          {record.milkQty > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
                                <Milk size={12} /> {record.milkQty}L
                              </span>
                              {milkSeller && <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-black uppercase">{milkSeller.name}</span>}
                            </div>
                          )}
                          {record.waterQty > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-xs font-bold text-sky-500">
                                <Droplets size={12} /> {record.waterQty} Jars
                              </span>
                              {waterSeller && <span className="text-[8px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-black uppercase">{waterSeller.name}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] font-bold text-slate-500">
                            Total: ₹{(record.milkQty * record.milkPrice + record.waterQty * record.waterPrice).toFixed(0)}
                          </p>
                        </div>
                        {record.notes && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">"{record.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => startEditRecord(record)}
                        className="p-2 text-slate-400 hover:text-blue-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteRecord(record.id)}
                        className="p-2 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : activeSubTab === 'billing' ? (
        /* BILLING TAB */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Dues</p>
              <h4 className="text-xl font-outfit font-black text-rose-500">
                ₹{sellerBillingData.reduce((sum, s) => sum + Math.max(0, s.pending), 0).toFixed(0)}
              </h4>
            </div>
            <div className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Paid</p>
              <h4 className="text-xl font-outfit font-black text-emerald-500">
                ₹{sellerBillingData.reduce((sum, s) => sum + s.totalPaid, 0).toFixed(0)}
              </h4>
            </div>
          </div>

          {isAddingPayment && (
            <div className={`p-5 rounded-3xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-emerald-600">Record Payment</h3>
                <button onClick={() => setIsAddingPayment(false)} className="text-slate-400 hover:text-rose-500"><X size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seller</label>
                  <select 
                    value={paymentSellerId}
                    onChange={(e) => setPaymentSellerId(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <option value="">Select Seller</option>
                    {sellers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</label>
                    <input 
                      type="date" 
                      value={paymentDate} 
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Check size={18} /> Confirm Payment
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Seller Balances</h3>
            {sellerBillingData.map(seller => (
              <div 
                key={seller.id}
                className={`p-5 rounded-3xl border transition-all ${isDark ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{seller.name}</h4>
                      <p className="text-[10px] text-slate-500">Total Spent: ₹{seller.totalSpent.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-500">Pending</p>
                    <p className={`text-lg font-outfit font-black ${seller.pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ₹{seller.pending.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setPaymentSellerId(seller.id);
                      setPaymentAmount(Math.max(0, seller.pending).toString());
                      setIsAddingPayment(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                  >
                    Pay Now
                  </button>
                  <button 
                    className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    View History
                  </button>
                </div>

                {seller.lastPayment && (
                  <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Last Payment:</span>
                    <span className="font-bold text-emerald-500">₹{seller.lastPayment.amount} on {new Date(seller.lastPayment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recent Payments History */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Recent Payments</h3>
            {payments.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500 italic">No payments recorded yet</p>
            ) : (
              payments.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 5).map(payment => {
                const seller = sellers.find(s => s.id === payment.sellerId);
                return (
                  <div key={payment.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Check size={12} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{seller?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-500">{new Date(payment.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-500">₹{payment.amount}</p>
                      <button onClick={() => deletePayment(payment.id)} className="text-[10px] text-rose-500 hover:underline">Delete</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* SETTINGS TAB */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Seller Profiles</h3>
            <button 
              onClick={() => setIsAddingSeller(true)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-md"
            >
              <Plus size={12} /> Add Seller
            </button>
          </div>

          {isAddingSeller && (
            <div className={`p-5 rounded-3xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">{editingSellerId ? 'Edit Seller' : 'New Seller Profile'}</h3>
                <button onClick={resetSellerForm} className="text-slate-400 hover:text-rose-500"><X size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seller Name</label>
                  <input 
                    type="text" 
                    value={sellerName} 
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="e.g. Ramu Kaka"
                    className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seller Type</label>
                  <select 
                    value={sellerType}
                    onChange={(e) => setSellerType(e.target.value as any)}
                    className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="both">Sells Both (Milk & Water)</option>
                    <option value="milk">Milk Seller Only</option>
                    <option value="water">Water Seller Only</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(sellerType === 'milk' || sellerType === 'both') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Default Milk Price</label>
                      <input 
                        type="number" 
                        value={sellerMilkPrice} 
                        onChange={(e) => setSellerMilkPrice(e.target.value)}
                        className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  )}
                  {(sellerType === 'water' || sellerType === 'both') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Default Water Price (Per Jar)</label>
                      <input 
                        type="number" 
                        value={sellerWaterPrice} 
                        onChange={(e) => setSellerWaterPrice(e.target.value)}
                        className={`w-full p-3 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAddOrUpdateSeller}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Save size={18} /> {editingSellerId ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {sellers.length === 0 ? (
              <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${isDark ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                <Store size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold">No seller profiles yet</p>
              </div>
            ) : (
              sellers.map(seller => (
                <div 
                  key={seller.id}
                  className={`p-5 rounded-3xl border transition-all ${isDark ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{seller.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {seller.isDefault && (
                            <span className="text-[8px] font-black uppercase text-emerald-500 flex items-center gap-0.5">
                              <Check size={8} /> Default
                            </span>
                          )}
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            seller.sellerType === 'milk' ? 'bg-blue-500/10 text-blue-500' :
                            seller.sellerType === 'water' ? 'bg-sky-500/10 text-sky-500' :
                            'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {seller.sellerType === 'milk' ? 'Milk Only' : seller.sellerType === 'water' ? 'Water Only' : 'Milk & Water'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!seller.isDefault && (
                        <button 
                          onClick={() => setDefaultSeller(seller.id)}
                          className={`p-2 rounded-lg text-[10px] font-black uppercase ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        onClick={() => startEditSeller(seller)}
                        className="p-2 text-slate-400 hover:text-blue-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteSeller(seller.id)}
                        className="p-2 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                    {(seller.sellerType === 'milk' || seller.sellerType === 'both' || !seller.sellerType) && (
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500">Milk Price</p>
                        <p className="text-sm font-black">₹{seller.milkPrice}/L</p>
                      </div>
                    )}
                    {(seller.sellerType === 'water' || seller.sellerType === 'both' || !seller.sellerType) && (
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500">Water Price</p>
                        <p className="text-sm font-black">₹{seller.waterPrice}/Jar</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dairy;
