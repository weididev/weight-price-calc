import React, { useState } from 'react';
import { Theme, PurchaseOrder } from '../types.ts';
import { History as HistoryIcon, Calendar, ArrowRight, Package, Search } from 'lucide-react';

interface HistoryProps {
  theme: Theme;
  history: PurchaseOrder[];
}

const History: React.FC<HistoryProps> = ({ theme, history }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className={`inline-flex p-4 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-700' : 'bg-slate-100 text-slate-300'}`}>
          <HistoryIcon size={48} />
        </div>
        <div>
          <h3 className="text-lg font-outfit font-bold">No History Yet</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Your completed orders will appear here.</p>
        </div>
      </div>
    );
  }

  const filteredItems = searchTerm.trim() 
    ? history.flatMap((order, orderIndex) => 
        order.items
          .filter(item => item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
          .map(item => ({ 
            ...item, 
            orderDate: order.timestamp, 
            orderSerial: history.length - orderIndex 
          }))
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
            <HistoryIcon size={18} />
          </div>
          <h2 className="font-outfit font-bold text-lg">Purchase History</h2>
        </div>
      </div>

      <div className={`relative flex items-center px-4 py-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
        <Search size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
        <input 
          type="text"
          placeholder="Search items"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none w-full ml-3 text-sm font-medium placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-4 pb-20">
        {searchTerm ? (
          filteredItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider px-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Found {filteredItems.length} items
              </h3>
              {filteredItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="font-bold text-amber-500">₹{item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Package size={12} />
                      <span>{item.weight}{item.unit}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Calendar size={12} />
                      <span>{formatDate(item.orderDate)}</span>
                    </div>
                  </div>
                  <div className={`mt-2 pt-2 border-t text-[10px] ${theme === 'dark' ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                    Order #{item.orderSerial}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No items found matching "{searchTerm}"</p>
            </div>
          )
        ) : (
          history.map((order, index) => (
            <div 
              key={order.id}
              className={`p-5 rounded-3xl theme-transition border ${
                theme === 'dark' 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Calendar size={12} />
                  {formatDate(order.timestamp)}
                </div>
                <span className="text-emerald-500 font-outfit font-black text-lg">₹{order.totalPrice.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between text-xs p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <Package size={10} className="text-slate-400" />
                      <span className="font-medium">{item.name}</span>
                      <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
                      <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>{item.weight}{item.unit}</span>
                    </div>
                    <span className="font-bold text-amber-500">₹{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className={`mt-3 pt-3 border-t text-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                 <p className="text-[10px] text-slate-500 font-bold tracking-wider">ORDER #{history.length - index}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
