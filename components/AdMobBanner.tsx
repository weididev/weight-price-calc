import React, { useEffect, useState } from 'react';
import { Theme } from '../types.ts';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, AdMobError } from '@capacitor-community/admob';

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
      setAdStatus('Web Mode (Ads Disabled)');
      return; 
    }

    const initAdMob = async () => {
      try {
         // 1. Initialize AdMob
         await AdMob.initialize({
           initializeForTesting: true,
         });

         // 2. Show Banner
         // Test ID: ca-app-pub-3940256099942544/6300978111
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
        setAdStatus(`Error: ${err.message}`);
      }
    };

    // Slight delay to ensure app is ready
    setTimeout(initAdMob, 1000);

    // Cleanup when component unmounts
    return () => {
      if (isNativePlatform) {
        AdMob.hideBanner().catch(err => console.log('Hide banner error', err));
      }
    };
  }, []);

  // Visual Placeholder for Web Mode (So you can see where the ad goes)
  if (!isNative) {
    return (
      <div className={`w-full h-[60px] flex items-center justify-center shrink-0 border-t relative z-50 ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center opacity-60">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ad Space (Mobile Only)</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Safety Check Active</p>
        </div>
      </div>
    );
  }

  // On Mobile, this div pushes content up, but the actual Ad is an overlay handled by the plugin
  return <div className="w-full h-[60px] shrink-0" />;
};

export default AdMobBanner;
