import React, { useMemo } from 'react';
import { Theme, PurchaseOrder } from '../types.ts';
import { TrendingUp, ShoppingBag, CreditCard, BarChart3, ArrowUpRight } from 'lucide-react';

interface InsightsProps {
  theme: Theme;
  history: PurchaseOrder[];
}

const Insights: React.FC<InsightsProps> = ({ theme, history }) => {
  const spendingData = useMemo(() => {
    if (history.length === 0) return null;

    let totalSpent = 0;
    let maxTrip = 0;
    const itemMap: Record<string, number> = {};

    history.forEach(order => {
      totalSpent += order.totalPrice;
      if (order.totalPrice > maxTrip) maxTrip = order.totalPrice;
      
      order.items.forEach(item => {
        const name = item.name.toLowerCase().trim();
        itemMap[name] = (itemMap[name] || 0) + item.price;
      });
    });

    const topItem = Object.entries(itemMap)
      .sort(([, a], [, b]) => b - a)[0];

    const avgSpent = totalSpent / history.length;

    return {
      totalSpent,
      avgSpent,
      maxTrip,
      topItemName: topItem ? topItem[0] : 'N/A',
      topItemValue: topItem ? topItem[1] : 0,
      count: history.length
    };
  }, [history]);

  if (!spendingData) {
    return (
      <div className="text-center py-12 px-6 space-y-4">
        <div className={`inline-flex p-5 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-sky-500' : 'bg-slate-100 text-sky-400'}`}>
          <BarChart3 size={48} />
        </div>
        <h3 className="text-lg font-outfit font-bold">Spending Analysis</h3>
        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
          Start adding items to your shopping bag. Once you checkout, we'll provide a detailed analysis of your spending habits here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-outfit font-bold text-xl flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={20} />
          Spending Report
        </h2>
        <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }`}>
          Offline Engine
        </div>
      </div>

      {/* Main Stats Card */}
      <div className={`p-5 rounded-3xl border relative overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-xl'
      }`}>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Expenses</p>
          <h3 className="text-4xl font-outfit font-black text-sky-500">₹{spendingData.totalSpent.toFixed(0)}</h3>
          <p className="text-[11px] font-bold mt-2 opacity-70">Calculated from {spendingData.count} shopping trips</p>
        </div>
        <BarChart3 className="absolute -right-4 -bottom-4 opacity-5 rotate-12" size={120} />
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <CreditCard size={14} />
            <span className="text-[10px] font-black uppercase">Avg. Trip</span>
          </div>
          <p className="text-xl font-bold">₹{spendingData.avgSpent.toFixed(0)}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <ArrowUpRight size={14} />
            <span className="text-[10px] font-black uppercase">Peak Buy</span>
          </div>
          <p className="text-xl font-bold">₹{spendingData.maxTrip.toFixed(0)}</p>
        </div>
      </div>

      {/* Top Item Insight */}
      <div className={`p-5 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
        <div className="bg-indigo-500 text-white p-3 rounded-xl shadow-lg">
          <ShoppingBag size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Top Spending Item</p>
          <p className="text-lg font-bold capitalize leading-tight">{spendingData.topItemName}</p>
          <p className="text-[11px] font-medium opacity-70">Accumulated: ₹{spendingData.topItemValue.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
