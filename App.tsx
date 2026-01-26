import React, { useState, useEffect } from 'react';
import { Theme, CartItem, PurchaseOrder, getSafeId } from './types.ts';
import Header from './components/Header.tsx';
import Calculator from './components/Calculator.tsx';
import Cart from './components/Cart.tsx';
import History from './components/History.tsx';
import Insights from './components/Insights.tsx';
import About from './components/About.tsx';
import AdMobBanner from './components/AdMobBanner.tsx';
import PrivacyConsent from './components/PrivacyConsent.tsx';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('theme') as Theme) || 'light';
    } catch (e) { return 'light'; }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [history, setHistory] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('purchase_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [activeTab, setActiveTab] = useState<'calc' | 'history' | 'insights' | 'about'>('calc');

  // Privacy Policy Acceptance State
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(true);

  useEffect(() => {
    try {
        const accepted = localStorage.getItem('privacy_policy_accepted');
        if (accepted !== 'true') {
            setPrivacyAccepted(false);
        }
    } catch (e) {
        setPrivacyAccepted(false);
    }
  }, []);

  const handleAcceptPrivacy = () => {
      try {
          localStorage.setItem('privacy_policy_accepted', 'true');
          setPrivacyAccepted(true);
      } catch (e) {
          console.error("Storage failed", e);
          setPrivacyAccepted(true); // Allow usage even if storage fails
      }
  };

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme;
      document.body.style.backgroundColor = theme === 'dark' ? '#020617' : '#ffffff';
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('purchase_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = { ...item, id: getSafeId() };
    setCart(prev => [newItem, ...prev]);
  };
  
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  
  const checkout = () => {
    if (cart.length === 0) return;
    const newOrder: PurchaseOrder = {
      id: getSafeId(),
      timestamp: Date.now(),
      items: [...cart],
      totalPrice: cart.reduce((s, i) => s + i.price, 0),
    };
    setHistory(prev => [newOrder, ...prev]);
    setCart([]);
  };

  return (
    <>
      {/* Privacy Consent Modal - Shows only if not accepted */}
      {!privacyAccepted && (
        <PrivacyConsent theme={theme} onAccept={handleAcceptPrivacy} />
      )}

      <div className={`fixed inset-0 flex flex-col ${theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-[#ffffff] text-slate-900'}`}>
        <div className="max-w-md mx-auto w-full h-full flex flex-col pt-6 overflow-hidden relative shadow-2xl">
          <div className="px-5 shrink-0">
            <Header 
              theme={theme} 
              onToggleTheme={toggleTheme} 
              onNavigate={(tab) => setActiveTab(tab)} 
              currentTab={activeTab} 
            />
          </div>
          
          <main className="flex-grow flex flex-col overflow-hidden mt-4 relative">
            {activeTab === 'calc' && (
              <div className="flex flex-col h-full overflow-hidden px-5">
                <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 pb-4">
                  <Calculator 
                    theme={theme} 
                    onAddToCart={addToCart} 
                    history={history} 
                  />
                  <Cart 
                    theme={theme} 
                    items={cart} 
                    onRemove={removeFromCart} 
                    onCheckout={checkout} 
                  />
                </div>
              </div>
            )}
            
            <div className="flex-grow overflow-y-auto no-scrollbar px-5">
              {activeTab === 'history' && <History theme={theme} history={history} />}
              {activeTab === 'insights' && <Insights theme={theme} history={history} />}
              {activeTab === 'about' && <About theme={theme} />}
            </div>
          </main>

          {/* AdMob Banner Area - Fixed at Bottom */}
          <AdMobBanner theme={theme} />
        </div>
      </div>
    </>
  );
};

export default App;
