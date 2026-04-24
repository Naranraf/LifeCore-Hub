import React from 'react';
import { X, Sparkles, Droplets, Crosshair, Eye, EyeOff, Palette, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Card from './Card';
import Button from './Button';
import './VisualsWidget.css';

/**
 * VisualsWidget — Individual control for atmosphere and cursor.
 */
export default function VisualsWidget() {
  const isOpen = useAppStore((state) => state.ui.isVisualsOpen);
  const setIsOpen = useAppStore((state) => state.setVisualsOpen);
  const { enabled, mode, color } = useAppStore((state) => state.ui.cursor);
  const { showBackground, auroraMode } = useAppStore((state) => state.ui);
  
  const setCursorConfig = useAppStore((state) => state.setCursorConfig);
  const setBackgroundEnabled = useAppStore((state) => state.setBackgroundEnabled);
  const setAuroraMode = useAppStore((state) => state.setAuroraMode);

  const modes = [
    { id: 'target', icon: Crosshair, label: 'Target' },
    { id: 'splash', icon: Droplets, label: 'Splash' },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="visuals-widget__root"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '40px',
        zIndex: 1000,
        width: '320px'
      }}
    >
      <Card className="visuals-widget__panel">
        <div className="visuals-widget__header">
          <div className="visuals-widget__title">
            <Sparkles size={14} />
            <span>Atmospheric Engine</span>
          </div>
          <button className="visuals-widget__close" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="visuals-widget__content">
          {/* BACKGROUND SECTION */}
          <div className="visuals-section">
            <span className="visual-section-title">Animated Background</span>
            <div className="visual-row">
              <button 
                className={`visual-toggle ${showBackground ? 'active' : ''}`}
                onClick={() => setBackgroundEnabled(!showBackground)}
              >
                {showBackground ? <Monitor size={14} /> : <EyeOff size={14} />}
                {showBackground ? 'Aurora Active' : 'Aurora Disabled'}
              </button>
            </div>
            
            {showBackground && (
              <div className="visual-mode-grid two-col">
                <button 
                  className={`visual-mode-btn ${auroraMode === 'context' ? 'active' : ''}`}
                  onClick={() => setAuroraMode('context')}
                >
                  <Monitor size={14} />
                  <span>Context</span>
                </button>
                <button 
                  className={`visual-mode-btn ${auroraMode === 'rainbow' ? 'active' : ''}`}
                  onClick={() => setAuroraMode('rainbow')}
                >
                  <Palette size={14} />
                  <span>Rainbow</span>
                </button>
              </div>
            )}
          </div>

          {/* CURSOR SECTION */}
          <div className="visuals-section">
            <span className="visual-section-title">Tactical Cursor</span>
            <button 
              className={`visual-toggle ${enabled ? 'active' : ''}`}
              onClick={() => setCursorConfig({ enabled: !enabled })}
            >
              {enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              {enabled ? 'Cursor Engine Active' : 'Cursor Engine Disabled'}
            </button>

            {enabled && (
              <div className="visual-mode-grid two-col">
                {modes.map((m) => (
                  <button 
                    key={m.id}
                    className={`visual-mode-btn ${mode === m.id ? 'active' : ''}`}
                    onClick={() => setCursorConfig({ mode: m.id })}
                  >
                    <m.icon size={16} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
