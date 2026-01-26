import React from 'react';

const AdPlaceholder: React.FC = () => {
  return (
    <div className="w-full h-14 bg-slate-800/40 rounded-2xl border border-slate-700/40 flex items-center justify-center overflow-hidden relative group">
      <div className="flex items-center gap-4 relative z-10">
        <div className="px-2 py-0.5 rounded bg-slate-700/80 text-[9px] font-black text-slate-400 uppercase tracking-tighter border border-slate-600">Ad</div>
        <div className="flex flex-col">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Sponsorship</p>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Premium Space Available</p>
        </div>
      </div>
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AdPlaceholder;
