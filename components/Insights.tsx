import React, { useMemo, useState, useRef } from 'react';
import { Theme, PurchaseOrder, CartItem, getSafeId } from '../types.ts';
import { 
  TrendingUp, ShoppingBag, CreditCard, BarChart3, ArrowUpRight, 
  Download, Upload, AlertTriangle, Zap, Calendar, Package, ArrowDownRight, 
  PieChart, Activity, Clock, ShieldAlert, Target, Award, Sun
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';

interface InsightsProps {
  theme: Theme;
  history: PurchaseOrder[];
  onImportHistory?: (history: PurchaseOrder[]) => void;
}

// Helper to normalize weight to KG/L
const getNormalizedWeight = (weightStr: string, unit: string) => {
  const val = parseFloat(weightStr) || 0;
  if (unit === 'g' || unit === 'ml') return val / 1000;
  return val;
};

const Insights: React.FC<InsightsProps> = ({ theme, history, onImportHistory }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = useMemo(() => {
    if (history.length === 0) return null;

    let totalSpent = 0;
    let totalWeightKg = 0;
    const itemStats: Record<string, { totalSpent: number, totalWeight: number, pricesPerKg: number[], dates: number[], count: number }> = {};
    const monthlyData: Record<string, number> = {};
    const weeklyData: Record<string, number> = {};
    const dayOfWeekCount: Record<number, { count: number, spent: number }> = {0:{count:0,spent:0},1:{count:0,spent:0},2:{count:0,spent:0},3:{count:0,spent:0},4:{count:0,spent:0},5:{count:0,spent:0},6:{count:0,spent:0}};
    
    // For Frequently Bought Together
    const pairs: Record<string, number> = {};

    history.forEach(order => {
      totalSpent += order.totalPrice;
      
      const date = new Date(order.timestamp);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      const weekKey = `W${Math.ceil(date.getDate() / 7)} ${monthKey}`;
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.totalPrice;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + order.totalPrice;
      
      const day = date.getDay();
      dayOfWeekCount[day].count += 1;
      dayOfWeekCount[day].spent += order.totalPrice;

      // Pairs
      const itemNames = order.items.map(i => i.name.toLowerCase().trim()).sort();
      for (let i = 0; i < itemNames.length; i++) {
        for (let j = i + 1; j < itemNames.length; j++) {
          const pair = `${itemNames[i]} & ${itemNames[j]}`;
          pairs[pair] = (pairs[pair] || 0) + 1;
        }
      }

      order.items.forEach(item => {
        const name = item.name.toLowerCase().trim();
        const weightKg = getNormalizedWeight(item.weight, item.unit);
        const pricePerKg = weightKg > 0 ? item.price / weightKg : 0;
        
        totalWeightKg += weightKg;

        if (!itemStats[name]) {
          itemStats[name] = { totalSpent: 0, totalWeight: 0, pricesPerKg: [], dates: [], count: 0 };
        }
        itemStats[name].totalSpent += item.price;
        itemStats[name].totalWeight += weightKg;
        if (pricePerKg > 0) {
          itemStats[name].pricesPerKg.push(pricePerKg);
        }
        itemStats[name].dates.push(order.timestamp);
        itemStats[name].count += 1;
      });
    });

    // 1. Top Spending Items
    const topItems = Object.entries(itemStats)
      .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
      .slice(0, 3);

    // 2. Ghost Expenses (High count, low avg price)
    const ghostExpenses = Object.entries(itemStats)
      .filter(([, stats]) => stats.count >= 3 && (stats.totalSpent / stats.count) < 50)
      .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
      .slice(0, 2);

    // 3. Price Volatility (Max - Min price per kg)
    const volatility = Object.entries(itemStats)
      .filter(([, stats]) => stats.pricesPerKg.length >= 2)
      .map(([name, stats]) => {
        const max = Math.max(...stats.pricesPerKg);
        const min = Math.min(...stats.pricesPerKg);
        return { name, diff: max - min, max, min };
      })
      .sort((a, b) => b.diff - a.diff)[0];

    // 4. Best Day to Buy (Lowest avg spent per trip)
    const bestDayIdx = Object.entries(dayOfWeekCount)
      .filter(([, data]) => data.count > 0)
      .sort(([, a], [, b]) => (a.spent / a.count) - (b.spent / b.count))[0]?.[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDay = bestDayIdx ? days[parseInt(bestDayIdx)] : 'N/A';

    // 5. Frequently Bought Together
    const topPair = Object.entries(pairs).sort(([, a], [, b]) => b - a)[0];

    // 6. Did You Forget? (Bought regularly, but not recently)
    const now = Date.now();
    const forgotten = Object.entries(itemStats).find(([, stats]) => {
      if (stats.dates.length < 3) return false;
      const sortedDates = [...stats.dates].sort((a, b) => a - b);
      const avgGap = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (sortedDates.length - 1);
      const daysSinceLast = (now - sortedDates[sortedDates.length - 1]) / (1000 * 60 * 60 * 24);
      const avgGapDays = avgGap / (1000 * 60 * 60 * 24);
      return daysSinceLast > (avgGapDays * 1.5) && avgGapDays < 14; // Expected within 2 weeks but missed
    });

    // 7. Shopping Frequency
    const firstOrder = Math.min(...history.map(o => o.timestamp));
    const daysActive = Math.max(1, (now - firstOrder) / (1000 * 60 * 60 * 24));
    const freqDays = daysActive / history.length;

    // 8. Cheapest Buy of the Year
    let cheapestBuy = { name: '', price: Infinity, date: 0 };
    Object.entries(itemStats).forEach(([name, stats]) => {
      const minPrice = Math.min(...stats.pricesPerKg);
      if (minPrice > 0 && minPrice < cheapestBuy.price) {
        const idx = stats.pricesPerKg.indexOf(minPrice);
        cheapestBuy = { name, price: minPrice, date: stats.dates[idx] };
      }
    });

    // 9. Price Drop Alert (Latest price < 20% of avg)
    const priceDrops = Object.entries(itemStats).filter(([, stats]) => {
      if (stats.pricesPerKg.length < 2) return false;
      const latest = stats.pricesPerKg[stats.pricesPerKg.length - 1];
      const avg = stats.pricesPerKg.slice(0, -1).reduce((a, b) => a + b, 0) / (stats.pricesPerKg.length - 1);
      return latest < avg * 0.8; // 20% drop
    }).map(([name, stats]) => {
      const latest = stats.pricesPerKg[stats.pricesPerKg.length - 1];
      const avg = stats.pricesPerKg.slice(0, -1).reduce((a, b) => a + b, 0) / (stats.pricesPerKg.length - 1);
      return { name, dropPercent: Math.round((1 - latest/avg) * 100) };
    });

    // 10. Stop Buying Warning (Bought > 2 times in last 3 days)
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const overstocked = Object.entries(itemStats).find(([, stats]) => {
      const recentBuys = stats.dates.filter(d => d > threeDaysAgo).length;
      return recentBuys >= 2;
    });

    // 11. Smart Savings (If bought below historical avg)
    let totalSaved = 0;
    history.forEach(order => {
      order.items.forEach(item => {
        const name = item.name.toLowerCase().trim();
        const weightKg = getNormalizedWeight(item.weight, item.unit);
        const pricePerKg = weightKg > 0 ? item.price / weightKg : 0;
        const stats = itemStats[name];
        if (stats && stats.pricesPerKg.length > 1 && pricePerKg > 0) {
          const avg = stats.pricesPerKg.reduce((a, b) => a + b, 0) / stats.pricesPerKg.length;
          if (pricePerKg < avg) {
            totalSaved += (avg - pricePerKg) * weightKg;
          }
        }
      });
    });

    // 12. Auto-Categorization (Basic)
    let vegFruit = 0;
    let others = 0;
    const vegKeywords = ['onion', 'potato', 'tomato', 'apple', 'banana', 'carrot', 'mirchi', 'chilli', 'lemon', 'mango'];
    Object.entries(itemStats).forEach(([name, stats]) => {
      if (vegKeywords.some(k => name.includes(k))) vegFruit += stats.totalSpent;
      else others += stats.totalSpent;
    });

    // Chart Data
    const monthlyChartData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
    
    // Inflation (Compare first half of history avg vs second half avg)
    let inflationRate = 0;
    if (history.length >= 4) {
      const half = Math.floor(history.length / 2);
      const firstHalf = history.slice(history.length - half); // oldest
      const secondHalf = history.slice(0, half); // newest
      const avg1 = firstHalf.reduce((s, o) => s + o.totalPrice, 0) / half;
      const avg2 = secondHalf.reduce((s, o) => s + o.totalPrice, 0) / half;
      inflationRate = ((avg2 - avg1) / avg1) * 100;
    }

    return {
      totalSpent,
      totalWeightKg,
      topItems,
      ghostExpenses,
      volatility,
      bestDay,
      topPair,
      forgotten,
      freqDays,
      cheapestBuy,
      priceDrops,
      overstocked,
      totalSaved,
      monthlyChartData,
      inflationRate,
      categories: { vegFruit, others }
    };
  }, [history]);

  const exportToCSV = () => {
    if (!data) return;
    const headers = ['Order ID', 'Date', 'Item Name', 'Weight', 'Unit', 'Price (Rs)'];
    const rows = history.flatMap(order => 
      order.items.map(item => [
        order.id,
        new Date(order.timestamp).toLocaleDateString('en-IN'),
        item.name,
        item.weight,
        item.unit,
        item.price
      ])
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Shopping_History_${new Date().toLocaleDateString('en-IN')}.csv`;
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImportHistory) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Basic validation
        if (!headers.includes('Order ID') || !headers.includes('Item Name')) {
          alert('Invalid CSV format. Please use a valid export file.');
          return;
        }

        const ordersMap = new Map<string, PurchaseOrder>();

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 6) continue;

          const [orderId, dateStr, name, weight, unit, priceStr] = cols;
          const price = parseFloat(priceStr);
          
          // Parse date (DD/MM/YYYY or similar)
          // Fallback to current time if parsing fails, but try to keep order consistency
          let timestamp = Date.now();
          if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            const parsedDate = new Date(`${y}-${m}-${d}`);
            if (!isNaN(parsedDate.getTime())) timestamp = parsedDate.getTime();
          }

          if (!ordersMap.has(orderId)) {
            ordersMap.set(orderId, {
              id: orderId,
              timestamp,
              items: [],
              totalPrice: 0
            });
          }

          const order = ordersMap.get(orderId)!;
          order.items.push({
            id: getSafeId() + i, // Generate new ID for item to avoid collisions
            name,
            weight,
            unit,
            price,
            type: 'solid' // Default
          });
          order.totalPrice += price;
        }

        const newHistory = Array.from(ordersMap.values()).sort((a, b) => b.timestamp - a.timestamp);
        
        if (newHistory.length > 0) {
          if (confirm(`Found ${newHistory.length} orders. This will REPLACE your current history. Continue?`)) {
            onImportHistory(newHistory);
            alert('History imported successfully!');
          }
        } else {
          alert('No valid orders found in CSV.');
        }

      } catch (err) {
        console.error(err);
        alert('Failed to parse CSV file.');
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!data) {
    return (
      <div className="text-center py-12 px-6 space-y-4">
        <div className={`inline-flex p-5 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-sky-500' : 'bg-slate-100 text-sky-400'}`}>
          <BarChart3 size={48} />
        </div>
        <h3 className="text-lg font-outfit font-bold">Insights Engine</h3>
        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
          Add more items and complete checkouts. Our offline engine needs data to generate smart insights.
        </p>
        {/* Import Button for Empty State */}
        {onImportHistory && (
          <div className="pt-4">
             <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                 theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
               }`}
             >
               <Upload size={14} /> Import History CSV
             </button>
          </div>
        )}
      </div>
    );
  }

  const cardClass = `p-4 rounded-3xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`;
  const textMuted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-500">
      
      {/* Header & Export/Import */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-outfit font-bold text-xl flex items-center gap-2">
          <Zap className="text-amber-500" size={20} />
          Smart Insights
        </h2>
        <div className="flex gap-2">
          {onImportHistory && (
            <>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-colors ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload size={12} /> Import
              </button>
            </>
          )}
          <button onClick={exportToCSV} className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-colors ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex p-1 rounded-2xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
        {['overview', 'trends', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-xs font-bold capitalize rounded-xl transition-all ${
              activeTab === tab 
                ? (theme === 'dark' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-900 shadow-sm')
                : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          {/* Main Stats */}
          <div className={cardClass}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textMuted}`}>Total Spent</p>
                <h3 className="text-3xl font-outfit font-black text-sky-500">₹{data.totalSpent.toFixed(0)}</h3>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textMuted}`}>Total Weight</p>
                <h3 className="text-3xl font-outfit font-black text-emerald-500">{data.totalWeightKg.toFixed(1)}<span className="text-sm">kg</span></h3>
              </div>
            </div>
            {data.totalSaved > 0 && (
              <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <Award size={18} />
                <div>
                  <p className="text-[10px] font-black uppercase">Smart Savings</p>
                  <p className="text-sm font-bold">You saved ₹{data.totalSaved.toFixed(0)} by buying below average prices!</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Spending Items */}
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={16} className="text-indigo-500" />
              <h3 className="font-bold text-sm">Top Wallet Drainers</h3>
            </div>
            <div className="space-y-3">
              {data.topItems.map(([name, stats], idx) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black w-4 text-center ${idx === 0 ? 'text-amber-500' : textMuted}`}>#{idx + 1}</span>
                    <span className="text-sm font-bold capitalize">{name}</span>
                  </div>
                  <span className="text-sm font-black">₹{stats.totalSpent.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Habits */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <Clock size={16} className="text-amber-500 mb-2" />
              <p className={`text-[10px] font-black uppercase ${textMuted}`}>Shopping Freq</p>
              <p className="text-sm font-bold mt-1">Every {data.freqDays.toFixed(1)} days</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <Sun size={16} className="text-rose-500 mb-2" />
              <p className={`text-[10px] font-black uppercase ${textMuted}`}>Best Day to Buy</p>
              <p className="text-sm font-bold mt-1">{data.bestDay}</p>
            </div>
          </div>
        </div>
      )}

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          {/* Monthly Chart */}
          {data.monthlyChartData.length > 0 && (
            <div className={cardClass}>
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-sky-500" /> Monthly Expenses
              </h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyChartData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Inflation & Volatility */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <TrendingUp size={16} className={`${data.inflationRate > 0 ? 'text-rose-500' : 'text-emerald-500'} mb-2`} />
              <p className={`text-[10px] font-black uppercase ${textMuted}`}>Personal Inflation</p>
              <p className={`text-lg font-bold mt-1 ${data.inflationRate > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {data.inflationRate > 0 ? '+' : ''}{data.inflationRate.toFixed(1)}%
              </p>
            </div>
            {data.volatility && (
              <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <Activity size={16} className="text-amber-500 mb-2" />
                <p className={`text-[10px] font-black uppercase ${textMuted}`}>Most Volatile</p>
                <p className="text-sm font-bold mt-1 capitalize truncate">{data.volatility.name}</p>
                <p className={`text-[10px] ${textMuted}`}>Diff: ₹{data.volatility.diff.toFixed(0)}/kg</p>
              </div>
            )}
          </div>

          {/* Cheapest Buy */}
          {data.cheapestBuy.price !== Infinity && (
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase ${textMuted}`}>Cheapest Buy of the Year</p>
                  <p className="text-sm font-bold">
                    <span className="capitalize">{data.cheapestBuy.name}</span> at ₹{data.cheapestBuy.price.toFixed(0)}/kg
                  </p>
                  <p className={`text-[10px] ${textMuted}`}>{new Date(data.cheapestBuy.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          
          {/* Price Drops */}
          {data.priceDrops.length > 0 && (
            <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center gap-2 text-emerald-500 mb-3">
                <ArrowDownRight size={18} />
                <h3 className="font-bold text-sm">Massive Price Drops!</h3>
              </div>
              <div className="space-y-2">
                {data.priceDrops.map(drop => (
                  <div key={drop.name} className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{drop.name}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{drop.dropPercent}% Cheaper</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ghost Expenses */}
          {data.ghostExpenses.length > 0 && (
            <div className={cardClass}>
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <ShieldAlert size={16} />
                <h3 className="font-bold text-sm">Ghost Expenses</h3>
              </div>
              <p className={`text-xs mb-3 ${textMuted}`}>Small items that add up to a lot over time.</p>
              <div className="space-y-2">
                {data.ghostExpenses.map(([name, stats]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{name} ({stats.count} times)</span>
                    <span className="font-bold text-rose-500">₹{stats.totalSpent.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Did You Forget */}
          {data.forgotten && (
            <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-amber-900/20 border-amber-900/50' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-sm">Did You Forget?</h3>
              </div>
              <p className="text-sm">
                You usually buy <span className="font-bold capitalize">{data.forgotten[0]}</span> regularly, but it's been a while. Running low?
              </p>
            </div>
          )}

          {/* Stop Buying Warning */}
          {data.overstocked && (
            <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-rose-900/20 border-rose-900/50' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-sm">Overstock Warning</h3>
              </div>
              <p className="text-sm">
                You've bought <span className="font-bold capitalize">{data.overstocked[0]}</span> multiple times in the last 3 days. Do you really need more?
              </p>
            </div>
          )}

          {/* Frequently Bought Together */}
          {data.topPair && (
            <div className={cardClass}>
              <div className="flex items-center gap-2 text-indigo-500 mb-2">
                <Package size={16} />
                <h3 className="font-bold text-sm">Perfect Match</h3>
              </div>
              <p className="text-sm">
                You frequently buy <span className="font-bold capitalize">{data.topPair[0]}</span> together.
              </p>
            </div>
          )}

        </div>
      )}
      
    </div>
  );
};

export default Insights;
