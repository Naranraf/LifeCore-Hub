import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CosmicCursor - A premium, performance-optimized custom cursor 
 * that leaves a trail of "cosmic dust" particles.
 */
const CosmicCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [particles, setParticles] = useState([]);
  const [isPointer, setIsPointer] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const { clientX: x, clientY: y } = e;
    setMousePos({ x, y });

    // Detect if hovering over interactive element
    const target = e.target;
    const clickable = target.closest('button, a, input, select, textarea, [role="button"], .glass-panel, .dashboard__card');
    setIsPointer(!!clickable);

    // Create "Cosmic Dust" particle
    if (Math.random() > 0.3) { // Performance optimization: don't spawn on every move
      const id = Math.random();
      const newParticle = {
        id,
        x,
        y,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
        tx: (Math.random() - 0.5) * 50,
        ty: (Math.random() - 0.5) * 50,
      };

      setParticles((prev) => [...prev.slice(-12), newParticle]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {/* Particles Layer */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.6, scale: 1, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: 0, 
              x: p.x + p.tx, 
              y: p.y + p.ty 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '50%',
              filter: 'blur(1px)',
              boxShadow: `0 0 8px ${p.color}`,
              left: -p.size / 2,
              top: -p.size / 2,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Magnetic Cursor */}
      <motion.div
        animate={{ 
          x: mousePos.x, 
          y: mousePos.y,
          scale: isPointer ? 1.5 : 1,
          backgroundColor: isPointer ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
          borderColor: isPointer ? 'var(--accent)' : 'rgba(139, 92, 246, 0.6)'
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.5 }}
        style={{
          position: 'absolute',
          width: 24,
          height: 24,
          border: '2px solid',
          borderRadius: '50%',
          left: -12,
          top: -12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Inner core dot */}
        <div style={{
          width: 4,
          height: 4,
          backgroundColor: 'var(--accent)',
          borderRadius: '50%',
        }} />
      </motion.div>
    </div>
  );
};

export default CosmicCursor;
