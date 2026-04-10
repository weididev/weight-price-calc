import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, MoreVertical, Calculator as CalcIcon, History as HistIcon, Sparkles, Info, Share2, Clock, Milk } from 'lucide-react';
import { Theme } from '../types.ts';
import Logo from './Logo.tsx';
import { Share } from '@capacitor/share';
import TimeConverterModal from './TimeConverterModal.tsx';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (tab: 'calc' | 'history' | 'insights' | 'about') => void;
  currentTab: string;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onNavigate, currentTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTimeConverterOpen, setIsTimeConverterOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (tab: 'calc' | 'history' | 'insights' | 'about') => {
    onNavigate(tab);
    setIsMenuOpen(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Weight Price Calculator',
        text: 'Bhai, ye App try kar! Market mein Weight aur Price check karne ke liye best hai. (APK file ke liye mujhe message kar dena).',
        dialogTitle: 'Share with Friends',
      });
    } catch (error) {
      console.log('Share failed', error);
    }
  };

  return (
    <header className="flex items-center justify-between relative shrink-0">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('calc')}>
        <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
          <Logo theme={theme} className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-lg font-outfit font-bold tracking-tight leading-none">WeightPrice</h1>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-sky-500' : 'text-sky-600'}`}>Smart Calc</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Share Button (New Position) */}
        <button
          onClick={handleShare}
          className={`p-2 rounded-lg theme-transition ${
            theme === 'dark' ? 'text-emerald-400 hover:bg-slate-800' : 'text-emerald-600 hover:bg-slate-100'
          }`}
        >
          <Share2 size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg theme-transition ${
            theme === 'dark' ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg theme-transition ${
              theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div className={`absolute top-full right-0 mt-1 w-48 z-50 rounded-xl border shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <button onClick={() => handleNav('calc')} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${currentTab === 'calc' ? 'text-sky-500' : ''} hover:bg-sky-500/10`}>
                <CalcIcon size={14} /> Calculator
              </button>
              <button onClick={() => handleNav('dairy')} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${currentTab === 'dairy' ? 'text-blue-500' : ''} hover:bg-blue-500/10`}>
                <Milk size={14} /> Dairy Manager
              </button>
              <button onClick={() => handleNav('history')} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${currentTab === 'history' ? 'text-amber-500' : ''} hover:bg-amber-500/10`}>
                <HistIcon size={14} /> History
              </button>
              <button onClick={() => handleNav('insights')} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${currentTab === 'insights' ? 'text-purple-500' : ''} hover:bg-purple-500/10`}>
                <Sparkles size={14} /> Insights
              </button>
              <div className={`h-[1px] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <button 
                onClick={() => { setIsTimeConverterOpen(true); setIsMenuOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-indigo-500/10 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}
              >
                <Clock size={14} /> Time Converter
              </button>
              <div className={`h-[1px] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <button onClick={() => handleNav('about')} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold ${currentTab === 'about' ? 'text-rose-500' : ''} hover:bg-rose-500/10`}>
                <Info size={14} /> About & Version
              </button>
            </div>
          )}
        </div>
      </div>

      <TimeConverterModal 
        theme={theme} 
        isOpen={isTimeConverterOpen} 
        onClose={() => setIsTimeConverterOpen(false)} 
      />
    </header>
  );
};

export default Header;
