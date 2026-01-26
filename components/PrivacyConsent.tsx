import React from 'react';
import { Theme } from '../types.ts';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import Logo from './Logo.tsx';

interface PrivacyConsentProps {
  theme: Theme;
  onAccept: () => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ theme, onAccept }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className={`w-full max-w-sm p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center max-h-[85vh] overflow-hidden relative ${
        isDark ? 'bg-[#0f172a] border border-slate-700 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="mb-4 flex flex-col items-center">
            <div className={`p-3 rounded-2xl mb-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <Logo theme={theme} className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-outfit font-black tracking-tight mb-1">Welcome!</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">Before you continue</p>
        </div>

        {/* Content Scroll Area */}
        <div className={`flex-1 overflow-y-auto w-full mb-6 px-3 py-2 rounded-xl text-left border ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Lock size={16} className="mt-1 text-emerald-500 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold mb-1">Your Data Stays With You</h4>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            We value your privacy. All your calculations and history are stored <strong>locally on your device</strong>. We do not transmit your personal data to our servers.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-1 text-amber-500 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold mb-1">Ads & Usage</h4>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            This app is free to use. To support development, we display ads via Google AdMob, which may collect anonymous device data to show relevant content.
                        </p>
                    </div>
                </div>

                <p className={`text-[10px] italic text-center mt-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    By continuing, you agree to our <a href="privacy.html" target="_blank" className="underline text-sky-500">Privacy Policy</a>.
                </p>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={onAccept}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
            <CheckCircle2 size={16} /> I Agree & Continue
        </button>

      </div>
    </div>
  );
};

export default PrivacyConsent;
