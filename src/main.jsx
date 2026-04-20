import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './assets/styles/tokens.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  });
}
