/**
 * main.jsx — Application Entry Point
 * 
 * Purpose: 
 * Initializes the React root and renders the App component.
 * Loads global styles (tokens and base layout) and registers the PWA service worker.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import './assets/styles/tokens.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
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
