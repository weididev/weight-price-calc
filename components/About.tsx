import React from 'react';
import { Theme } from '../types.ts';
import { Calendar, Heart, ShieldCheck, Download } from 'lucide-react';
import Logo from './Logo.tsx';

interface AboutProps { theme: Theme; }

const About: React.FC<AboutProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-700 pt-2">
      {/* Card 1: App Info */}
      <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col items-center justify-center text-center ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100 shadow-xl'
      }`}>
         {/* Top Gradient Bar */}
         <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-80"></div>
         
         <div className={`mb-3 p-3 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Logo theme={theme} className="w-10 h-10" />
         </div>
         
         <h2 className="text-xl font-outfit font-black tracking-tight mb-1">WeightPrice</h2>
         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Smart Calc v1.2</p>
      </div>

      {/* Card 2: National Pride */}
      <div className={`p-8 rounded-[2.5rem] border overflow-hidden relative flex flex-col items-center text-center ${
        isDark 
          ? 'bg-gradient-to-b from-[#1e1b4b] to-[#020617] border-slate-800' 
          : 'bg-gradient-to-b from-slate-50 to-white border-slate-100 shadow-xl'
      }`}>
        
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#fbbf24', fontFamily: 'serif' }}>सत्यमेव जयते</h3>
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-6 opacity-60">
          S A T Y A M E V &nbsp;&nbsp; J A Y A T E
        </p>
        
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6 opacity-50"></div>
        
        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-3">
          <span className="text-orange-500">MAKE IN </span>
          <span className={isDark ? 'text-white' : 'text-slate-800'}>I </span>
          <span className="text-emerald-500">N </span>
          <span className="text-orange-500">D </span>
          <span className={isDark ? 'text-white' : 'text-slate-800'}>I </span>
          <span className="text-emerald-500">A</span>
        </h4>
        
        <p className={`text-[12px] font-bold leading-relaxed max-w-[280px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Bharat ke liye, Bharat mein nirmit.<br/>
          A Premium Make In India shopping utility.
        </p>
        
        <div className="mt-8">
           <div className="px-5 py-2.5 rounded-full bg-[#064e3b]/40 border border-[#065f46] flex items-center gap-2 shadow-lg shadow-emerald-900/20">
              <Heart size={12} className="text-emerald-500 fill-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Vocal For Local</span>
           </div>
        </div>
      </div>

      {/* Privacy Policy Link - Relative path for compatibility */}
      <div className="flex justify-center">
        <a 
          href="privacy.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
            isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={12} />
          Privacy Policy
        </a>
      </div>

      {/* Footer Text */}
      <div className="text-center pt-2 pb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-[1px] w-6 bg-slate-700"></div>
          <h4 className="text-xl font-outfit font-black tracking-tighter text-slate-300 flex items-center gap-2">
            JAI HIND! <span className="text-lg">🇮🇳</span>
          </h4>
          <div className="h-[1px] w-6 bg-slate-700"></div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-600">V A N D E &nbsp; M A T A R A M</p>
      </div>

    </div>
  );
};

export default About;
