import React, { useEffect, useState } from 'react';
import { Theme } from '../types.ts';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, AdMobError } from '@capacitor-community/admob';
import { Download } from 'lucide-react';

interface AdMobBannerProps {
  theme: Theme;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const [isNative, setIsNative] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adStatus, setAdStatus] = useState<string>('Initializing...');

  useEffect(() => {
    // Check if we are running on Android/iOS
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);

    if (!isNativePlatform) {
      setAdStatus('Web Mode');
      return; 
    }

    const initAdMob = async () => {
      try {
         // 1. Initialize AdMob
         await AdMob.initialize({
           initializeForTesting: true, // Important: Always true for development
         });

         // 2. Show Banner
         // TEST ID (Safe for development): ca-app-pub-3940256099942544/6300978111
         await AdMob.showBanner({
           adId: 'ca-app-pub-3940256099942544/6300978111', 
           adSize: BannerAdSize.ADAPTIVE_BANNER,
           position: BannerAdPosition.BOTTOM_CENTER, 
           margin: 0, 
           isTesting: true
         });
         
         setAdStatus('Ad Loaded');

      } catch (e) {
        console.error('AdMob Error:', e);
        const err = e as AdMobError;
        setAdStatus(`Ad Error: ${err.message}`);
      }
    };

    // Slight delay to ensure app is fully mounted
    const timer = setTimeout(initAdMob, 2000);

    return () => {
      clearTimeout(timer);
      if (isNativePlatform) {
        AdMob.hideBanner().catch(err => console.log('Hide banner error', err));
      }
    };
  }, []);

  // Visual Placeholder for Web/Browser Mode
  if (!isNative) {
    return (
      <div className={`w-full py-6 flex flex-col items-center justify-center shrink-0 border-t relative z-50 ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center opacity-60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ad Space Preview</p>
          <div className="flex flex-col gap-1 items-center">
             <span className="text-[9px] font-bold text-slate-400">Ads only work in the APK app.</span>
             <span className="text-[9px] font-bold text-sky-500 flex items-center gap-1">
                <Download size={10} /> Check GitHub Actions to Download APK
             </span>
          </div>
        </div>
      </div>
    );
  }

  // On Mobile, this div pushes content up to make room for the sticky Ad banner
  return <div className="w-full h-[60px] shrink-0 bg-transparent" />;
};

export default AdMobBanner;
