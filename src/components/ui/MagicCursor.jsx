import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import gsap from 'gsap';
import TargetCursor from './TargetCursor';

/**
 * MagicCursor 2.0 - Powered by GSAP
 * 
 * Uses GSAP's quickSetter for ultra-high performance movement 
 * and sub-pixel smoothing.
 */
const MagicCursor = () => {
  const { enabled, mode, color } = useAppStore((state) => state.ui.cursor);
  const [isPointer, setIsPointer] = useState(false);
  
  // Refs for GSAP targeting
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  // GSAP Setters
  useEffect(() => {
    if (!enabled || !cursorRef.current || mode === 'target') {
      if (enabled && mode === 'target') {
        document.body.style.cursor = 'none';
        const style = document.createElement('style');
        style.id = 'cursor-none-style';
        style.innerHTML = '* { cursor: none !important; }';
        document.head.appendChild(style);
        return () => {
          document.body.style.cursor = 'auto';
          const s = document.getElementById('cursor-none-style');
          if (s) s.remove();
        };
      }
      return;
    }

    // Fast setter for the main cursor (zero lag)
    const xSet = gsap.quickSetter(cursorRef.current, "x", "px");
    const ySet = gsap.quickSetter(cursorRef.current, "y", "px");

    const handleMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Main pointer is instant
      xSet(e.clientX);
      ySet(e.clientY);

      // Hover detection
      const clickable = e.target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .dashboard__card, .feature-card, .sidebar__item');
      setIsPointer(!!clickable);
    };

    window.addEventListener('mousemove', handleMove);

    // Hide/Show system cursor
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'cursor-none-style';
    style.innerHTML = '* { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.body.style.cursor = 'auto';
      const s = document.getElementById('cursor-none-style');
      if (s) s.remove();
    };
  }, [enabled, mode, color]);

  if (!enabled) return null;

  // Target mode uses its own specialized component
  if (mode === 'target') {
    return <TargetCursor targetSelector="button, a, .sidebar__item, .dashboard__card, .feature-card, input" />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {/* MAIN CORE POINTER (Visible even in Splash mode) */}
      <div 
        ref={cursorRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: 0, top: 0,
        }}
      >
        <div style={{
          width: isPointer ? 12 : 6, 
          height: isPointer ? 12 : 6,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${color}`,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s',
          mixBlendMode: 'difference'
        }} />
      </div>
    </div>
  );
};

export default MagicCursor;

