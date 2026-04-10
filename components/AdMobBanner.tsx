import React, { useEffect, useState } from 'react';
import { Theme } from '../types.ts';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, AdMobError } from '@capacitor-community/admob';
import { WifiOff, Hammer, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config.ts';

const AdMobBanner: React.FC<{ theme: Theme }> = ({ theme }) => {
  const isDark = theme === 'dark';
  const [isNative, setIsNative] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adStatus, setAdStatus] = useState<string>('Initializing...');

  const { enableRealAds, realBannerId, testBannerId } = APP_CONFIG.ads;

  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);

    if (!isNativePlatform) return;

    const initAdMob = async () => {
      try {
         // Initialize
         await AdMob.initialize({
           initializeForTesting: !enableRealAds, 
         });

         // Determine which ID to use
         // If Real Ads enabled BUT ID is still default 'xxxx', fallback to Test ID to prevent crash/empty space
         const useRealId = enableRealAds && !realBannerId.includes('xxxx');
         const adUnitId = useRealId ? realBannerId : testBannerId;

         await AdMob.showBanner({
           adId: adUnitId,
           adSize: BannerAdSize.ADAPTIVE_BANNER,
           position: BannerAdPosition.BOTTOM_CENTER, 
           margin: 0, 
           isTesting: !useRealId
         });
         
         setAdStatus(useRealId ? 'Active (Real)' : 'Active (Test)');

      } catch (e) {
        console.error('AdMob Error:', e);
        const err = e as AdMobError;
        setAdStatus(`Error: ${err.message}`);
      }
    };

    const timer = setTimeout(initAdMob, 2000);

    return () => {
      clearTimeout(timer);
      if (isNativePlatform) {
        AdMob.hideBanner().catch(err => console.log('Hide banner error', err));
      }
    };
  }, [enableRealAds, realBannerId, testBannerId]);

  // If not on a phone (Web Browser view)
  if (!isNative) {
    return (
      <div className={`w-full py-4 flex flex-col items-center justify-center shrink-0 border-t relative z-50 ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center opacity-60 flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sponsored</p>
          <span className="text-[10px] font-bold text-sky-500 flex items-center gap-1 bg-sky-500/10 px-3 py-1 rounded-full">
             <Sparkles size={12} /> Make In India
          </span>
        </div>
      </div>
    );
  }

  // Visual Warning if user enabled Real Ads but forgot the ID
  if (enableRealAds && realBannerId.includes('xxxx')) {
      return (
          <div className="w-full h-[60px] bg-sky-600 flex items-center justify-center text-white text-[10px] font-bold gap-2 animate-pulse">
              <Hammer size={14} />
              SETUP REQUIRED
          </div>
      );
  }

  // Placeholder for when Ad is loading or failed (e.g. No Internet)
  // This sits behind the actual ad.
  return (
    <div className={`w-full h-[60px] shrink-0 flex items-center justify-center gap-2 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <WifiOff size={14} className="text-slate-400 opacity-50" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Ad Space</span>
    </div>
  );
};

export default AdMobBanner;
