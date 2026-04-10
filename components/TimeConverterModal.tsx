import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../types.ts';
import { X, ArrowRightLeft, Clock } from 'lucide-react';

interface TimeConverterModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

const TimeConverterModal: React.FC<TimeConverterModalProps> = ({ theme, isOpen, onClose }) => {
  const [mode, setMode] = useState<'Z2I' | 'I2Z'>('Z2I');
  const [hh, setHh] = useState('');
  const [mm, setMm] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const hhRef = useRef<HTMLInputElement>(null);
  const mmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHh('');
      setMm('');
      setResult(null);
      setTimeout(() => hhRef.current?.focus(), 100);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (hh.length === 2 && mm.length === 2) {
      calculateResult(hh, mm, mode);
    } else {
      setResult(null);
    }
  }, [hh, mm, mode]);

  const calculateResult = (h: string, m: string, currentMode: 'Z2I' | 'I2Z') => {
    let hours = parseInt(h, 10);
    let minutes = parseInt(m, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      setResult('Invalid Time');
      return;
    }

    let totalMinutes = hours * 60 + minutes;

    if (currentMode === 'Z2I') {
      totalMinutes += 5 * 60 + 30; // Add 5:30
    } else {
      totalMinutes -= 5 * 60 + 30; // Subtract 5:30
    }

    // Handle day wrap around
    let dayOffset = '';
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
      dayOffset = ' (Prev Day)';
    } else if (totalMinutes >= 24 * 60) {
      totalMinutes -= 24 * 60;
      dayOffset = ' (Next Day)';
    }

    const resH = Math.floor(totalMinutes / 60);
    const resM = totalMinutes % 60;

    setResult(`${resH.toString().padStart(2, '0')}:${resM.toString().padStart(2, '0')}${dayOffset}`);
  };

  const handleHhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setHh(val);
    if (val.length === 2) {
      mmRef.current?.focus();
    }
  };

  const handleMmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setMm(val);
    if (val.length === 0 && e.nativeEvent && (e.nativeEvent as InputEvent).inputType === 'deleteContentBackward') {
        // If user presses backspace on empty MM, go back to HH
        hhRef.current?.focus();
    }
  };

  const handleMmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && mm === '') {
      hhRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'}`}>
        
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Clock size={20} />
          </div>
          <h2 className={`text-lg font-outfit font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Time Converter</h2>
        </div>

        {/* Mode Switcher */}
        <div className={`flex p-1 mb-8 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button
            onClick={() => setMode('Z2I')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'Z2I' 
                ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            ZULU <ArrowRightLeft size={12} /> IST
          </button>
          <button
            onClick={() => setMode('I2Z')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'I2Z' 
                ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
            }`}
          >
            IST <ArrowRightLeft size={12} /> ZULU
          </button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col items-center justify-center mb-8">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Enter {mode === 'Z2I' ? 'ZULU' : 'IST'} Time
          </p>
          
          <div className="flex items-center justify-center gap-3 text-4xl font-outfit font-black">
            <input 
              ref={hhRef}
              type="text" 
              inputMode="numeric"
              maxLength={2} 
              value={hh} 
              onChange={handleHhChange} 
              className={`w-20 h-20 text-center rounded-2xl border-2 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500 focus:bg-indigo-500/5' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-indigo-50'
              }`}
              placeholder="HH"
            />
            <span className={`pb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>:</span>
            <input 
              ref={mmRef}
              type="text" 
              inputMode="numeric"
              maxLength={2} 
              value={mm} 
              onChange={handleMmChange} 
              onKeyDown={handleMmKeyDown}
              className={`w-20 h-20 text-center rounded-2xl border-2 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500 focus:bg-indigo-500/5' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-indigo-50'
              }`}
              placeholder="MM"
            />
          </div>
        </div>

        {/* Result Area */}
        <div className={`p-5 rounded-2xl text-center transition-all ${
          result && result !== 'Invalid Time'
            ? (isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100')
            : (isDark ? 'bg-slate-800/50 border border-slate-800' : 'bg-slate-50 border border-slate-100')
        }`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {mode === 'Z2I' ? 'IST' : 'ZULU'} Result
          </p>
          <div className={`text-3xl font-outfit font-black ${
            result === 'Invalid Time' 
              ? 'text-rose-500 text-xl' 
              : result 
                ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                : (isDark ? 'text-slate-600' : 'text-slate-300')
          }`}>
            {result || '--:--'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimeConverterModal;
