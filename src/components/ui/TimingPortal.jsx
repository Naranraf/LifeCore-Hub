import React from 'react';
import { createPortal } from 'react-dom';

/**
 * TimingPortal — React Portal wrapper for floating UI elements.
 * 
 * Ensures the timing widget is mounted outside the main App hierarchy
 * to prevent z-index issues and isolate it visually.
 */
const TimingPortal = ({ children }) => {
  const portalRoot = document.getElementById('portal-root');
  
  if (!portalRoot) {
    console.warn('[Portal] Root element #portal-root not found.');
    return children;
  }

  return createPortal(children, portalRoot);
};

export default TimingPortal;
