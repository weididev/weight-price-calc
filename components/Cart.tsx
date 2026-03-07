import React from 'react';
import { Theme, CartItem } from '../types.ts';
import { ShoppingBasket, X, CheckCircle2 } from 'lucide-react';

interface CartProps {
  theme: Theme;
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ theme, items, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) return (
    <div className={`mt-3 p-2.5 rounded-2xl border border-dashed flex items-center justify-center gap-2.5 ${theme === 'dark' ? 'border-slate-800 text-slate-700' : 'border-slate-200 text-slate-300'}`}>
       <ShoppingBasket size={14} />
       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bag is empty</span>
    </div>
  );

  return (
    <div className={`mt-3 p-2.5 rounded-[24px] border ${
      theme === 'dark' ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Non-scrolling Horizontal mini list */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2.5 mb-1.5">
        {items.map((item) => (
          <div key={item.id} className={`shrink-0 flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50'}`}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-500 truncate max-w-[80px]">{item.name}</span>
              <div className="flex items-baseline gap-1 text-[10px] font-bold text-sky-500">
                <span>₹{item.price.toFixed(0)}</span>
                <span className={`text-[9px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.weight}{item.unit}</span>
              </div>
            </div>
            <button onClick={() => onRemove(item.id)} className="p-1 text-slate-700 hover:text-rose-500 transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 px-1 pb-1">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Total Bag Value</span>
          <span className="text-lg font-black text-amber-500 leading-none">₹{total.toFixed(0)}</span>
        </div>
        <button onClick={onCheckout} className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={16} /> Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
