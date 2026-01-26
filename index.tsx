import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('WeightPrice Pro: Initializing ESM Engine...');

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('WeightPrice Pro: App Mounted Successfully');
  } catch (error) {
    console.error('WeightPrice Pro: Mounting Error:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif; color: #ef4444;">
        <h2 style="font-weight: 900;">Mounting Failed</h2>
        <p style="font-size: 14px; opacity: 0.8;">Please refresh the page or check your connection.</p>
      </div>
    `;
  }
} else {
  console.error('WeightPrice Pro: Root element not found');
}
