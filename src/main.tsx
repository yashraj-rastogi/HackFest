import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app/App';

// Register PWA service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('KiranaSaathi update available');
      },
      onOfflineReady() {
        console.log('KiranaSaathi ready to work offline');
      },
    });
  }).catch(() => {
    // PWA registration fallback
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
