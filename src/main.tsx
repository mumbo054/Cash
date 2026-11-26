import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import App from './App';
import './index.css';
import { initWebVitalsMonitoring, runAfterPageLoad } from './lib/vitals';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

initWebVitalsMonitoring();

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  runAfterPageLoad(() => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failure should remain non-blocking
    });
  });
}
