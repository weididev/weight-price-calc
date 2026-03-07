import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Theme, CartItem, PurchaseOrder, getSafeId } from '../types.ts';
import { Tag, PlusCircle, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';

interface CalculatorProps {
  theme: Theme;
  onAddToCart: (item: CartItem) => void;
  history: PurchaseOrder[];
}

const WEIGHT_PRESETS = [100, 250, 300, 500, 750, 1000];

const Calculator: React.FC<CalculatorProps> = ({ theme, onAddToCart, history }) => {
  const [itemName, setItemName] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [baseWeight, setBaseWeight] = useState<string>('1000');
  const [basePrice, setBasePrice] = useState<string>('');
  const [baseUnit, setBaseUnit] = useState<string>('g');

  const [calcWeight, setCalcWeight] = useState<string>('');
  const [calcPrice, setCalcPrice] = useState<string>('');
  const [calcUnit, setCalcUnit] = useState<string>('g');
  const [lastEdited, setLastEdited] = useState<'weight' | 'price' | null>(null);

  const suggestionRef = useRef<HTMLDivElement>(null);

  const historicalNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach(order => order.items.forEach(item => names.add(item.name.trim().toUpperCase())));
    return Array.from(names);
  }, [history]);

  const filteredSuggestions = useMemo(() => {
    const searchName = itemName.trim().toUpperCase();
    if (!searchName) return [];
    return historicalNames.filter(name => 
      name.includes(searchName) && name !== searchName
    );
  }, [itemName, historicalNames]);

  const currentRatePerGram = useMemo(() => {
    const bw = (baseUnit === 'kg') ? parseFloat(baseWeight) * 1000 : parseFloat(baseWeight);
    const bp = parseFloat(basePrice);
    return (bw > 0 && bp > 0) ? bp / bw : 0;
  }, [baseWeight, basePrice, baseUnit]);

  const priceAnalytics = useMemo(() => {
    const searchName = itemName.trim().toUpperCase();
    if (!searchName || !currentRatePerGram) return null;
    
    const itemHistory: number[] = [];
    history.forEach(order => {
      order.items.forEach(item => {
        if (item.name.trim().toUpperCase() === searchName) {
          const w = (item.unit === 'kg') ? parseFloat(item.weight) * 1000 : parseFloat(item.weight);
          if (w > 0) itemHistory.push(item.price / w);
        }
      });
    });

    if (itemHistory.length === 0) return null;

    const lastRate = itemHistory[0]; 
    const avgRate = itemHistory.reduce((a, b) => a + b, 0) / itemHistory.length;
    const diffPercent = ((currentRatePerGram - lastRate) / lastRate) * 100;

    return {
      type: diffPercent > 0.5 ? 'hike' : diffPercent < -0.5 ? 'drop' : 'stable',
      diff: diffPercent,
      current: currentRatePerGram * 1000,
      last: lastRate * 1000,
      avg: avgRate * 1000
    };
  }, [itemName, currentRatePerGram, history]);

  useEffect(() => {
    if (!currentRatePerGram) return;
    if (lastEdited === 'weight') {
      const cw = (calcUnit === 'kg') ? parseFloat(calcWeight) * 1000 : parseFloat(calcWeight);
      setCalcPrice(cw > 0 ? (cw * currentRatePerGram).toFixed(2) : '');
    } else if (lastEdited === 'price') {
      const cp = parseFloat(calcPrice);
      const resWeight = cp / currentRatePerGram;
      const displayWeight = (calcUnit === 'kg') ? resWeight / 1000 : resWeight;
      setCalcWeight(cp > 0 ? displayWeight.toFixed(2) : '');
    }
  }, [baseWeight, basePrice, baseUnit, calcWeight, calcPrice, calcUnit, lastEdited, currentRatePerGram]);

  const applyPreset = (section: 'base' | 'calc', val: number) => {
    const isBig = val >= 1000;
    const unit = isBig ? 'kg' : 'g';
    const displayVal = isBig ? (val / 1000).toString() : val.toString();
    if (section === 'base') {
      setBaseWeight(displayVal);
      setBaseUnit(unit);
    } else {
      setLastEdited('weight');
      setCalcWeight(displayVal);
      setCalcUnit(unit);
    }
  };

  const handleAddToCart = () => {
    if (!calcPrice || !calcWeight) return;
    onAddToCart({
      id: getSafeId(),
      name: itemName.trim() || 'ITEM',
      weight: calcWeight,
      unit: calcUnit,
      price: parseFloat(calcPrice),
      type: 'solid',
    });
    setBasePrice(''); setCalcWeight(''); setCalcPrice(''); setItemName(''); setLastEdited(null);
  };

  const toggleBaseUnit = () => setBaseUnit(prev => prev === 'g' ? 'kg' : 'g');
  const toggleCalcUnit = () => setCalcUnit(prev => prev === 'g' ? 'kg' : 'g');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = theme === 'dark';
  const inputClass = `w-full px-4 py-3 rounded-2xl text-[12px] font-black tracking-widest border outline-none transition-all ${isDark ? 'bg-[#030712] border-slate-800 text-sky-400 focus:border-sky-500 placeholder:text-slate-800' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-sky-500 placeholder:text-slate-300'}`;
  const labelClass = `text-[8px] font-black uppercase text-slate-500 mb-1 block tracking-[0.3em] px-1 opacity-70`;
  const presetBtnClass = `py-1.5 rounded-lg text-[9px] font-black border border-slate-800/20 text-slate-500 active:bg-sky-500 active:text-white transition-all`;

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <div className={`p-5 rounded-[2.5rem] border ${isDark ? 'bg-[#0a0f1e]/60 border-slate-800/30 backdrop-blur-xl' : 'bg-white border-slate-100 shadow-xl'}`}>
        
        {/* Product Selection */}
        <div className="mb-4 relative">
          <label className={labelClass}>PRODUCT NAME</label>
          <div className="relative group">
            <Tag size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500" />
            <input 
              type="text" 
              value={itemName} 
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {setItemName(e.target.value.toUpperCase()); setShowSuggestions(true);}} 
              placeholder="SEARCH PRODUCT..." 
              className={`${inputClass} pl-10`} 
            />
          </div>
          
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div ref={suggestionRef} className={`absolute z-[60] w-full mt-1 max-h-40 overflow-y-auto rounded-2xl border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {filteredSuggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => {setItemName(name); setShowSuggestions(false);}}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* PRICE ALERT */}
          {priceAnalytics && (
            <div className={`mt-3 rounded-2xl border overflow-hidden animate-in slide-in-from-top-1 ${
              priceAnalytics.type === 'hike' 
                ? (isDark ? 'bg-rose-950/20 border-rose-500/50' : 'bg-rose-50 border-rose-200') 
                : priceAnalytics.type === 'drop' 
                  ? (isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200') 
                  : (isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-100 border-slate-200')
            }`}>
              <div className="flex items-center justify-between px-4 py-3 relative">
                
                {/* Left: Current Price & Status */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`p-1.5 rounded-lg ${priceAnalytics.type === 'hike' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {priceAnalytics.type === 'hike' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{priceAnalytics.current.toFixed(0)}<span className="text-[10px] font-bold opacity-60">/kg</span>
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${priceAnalytics.type === 'hike' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {priceAnalytics.type === 'hike' ? 'Hike' : 'Drop'} {priceAnalytics.diff > 0 ? '+' : ''}{priceAnalytics.diff.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Right: Last Price Info */}
                <div className="flex flex-col items-end relative z-10 pl-4 border-l border-dashed border-slate-500/20">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Last Price</span>
                   <span className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{priceAnalytics.last.toFixed(0)}</span>
                </div>

                {/* Background Decor */}
                <div className={`absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-current opacity-5 pointer-events-none ${priceAnalytics.type === 'hike' ? 'text-rose-500' : 'text-emerald-500'}`}></div>
              </div>
            </div>
          )}
        </div>

        {/* Market Rate Matrix */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className={labelClass}>Market Qty</label>
            <div className="relative">
              <input type="number" value={baseWeight} onChange={(e) => setBaseWeight(e.target.value)} className={inputClass} />
              <button onClick={toggleBaseUnit} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/40">
                <span className="text-[8px] font-black text-sky-500 uppercase">{baseUnit}</span>
                <ChevronDown size={8} className="text-sky-500" />
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Market Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">₹</span>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={`${inputClass} pl-8`} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 mb-5">
          {WEIGHT_PRESETS.map(p => (
            <button key={p} onClick={() => applyPreset('base', p)} className={presetBtnClass}>
              {p === 1000 ? '1K' : p}
            </button>
          ))}
        </div>

        {/* User Order Matrix */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className={`${labelClass} text-sky-500/60`}>Your Weight</label>
            <div className="relative">
              <input type="number" value={calcWeight} onChange={(e) => {setCalcWeight(e.target.value); setLastEdited('weight');}} className={`${inputClass} !border-sky-500/20`} />
              <button onClick={toggleCalcUnit} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-sky-500 uppercase">{calcUnit}</button>
            </div>
          </div>
          <div>
            <label className={`${labelClass} text-amber-500/60`}>Your Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500">₹</span>
              <input type="number" value={calcPrice} onChange={(e) => {setCalcPrice(e.target.value); setLastEdited('price');}} className={`${inputClass} pl-8 !border-amber-500/20 text-amber-500`} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 mb-6">
          {WEIGHT_PRESETS.map(p => (
            <button key={p} onClick={() => applyPreset('calc', p)} className={presetBtnClass}>
              {p === 1000 ? '1K' : p}
            </button>
          ))}
        </div>

        <button 
          onClick={handleAddToCart} 
          disabled={!calcPrice} 
          className={`w-full py-4 rounded-full font-black text-white text-[10px] uppercase tracking-[0.5em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${!calcPrice ? 'bg-slate-800/40 text-slate-700' : 'bg-gradient-to-r from-sky-600 to-sky-500 shadow-xl shadow-sky-500/20'}`}
        >
          <PlusCircle size={16} /> Add to Bag
        </button>
      </div>
    </div>
  );
};

export default Calculator;
