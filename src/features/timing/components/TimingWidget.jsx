import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, SkipForward, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useAppStore } from '../../../store/useAppStore';
import useTimerStore, { PHASES } from '../hooks/useTimer';
import PomodoroTimer from './PomodoroTimer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TimingPortal from '../../../components/ui/TimingPortal';
import './TimingWidget.css';

/**
 * TimingWidget Component — Draggable Focus Hub via React Portal.
 * 
 * V3 ARCHITECTURE (TIER 1):
 * - Uses React Portal for top-level DOM mounting.
 * - Backed by a Web Worker for background persistence.
 * - Syncs with useAppStore for cross-module reactivity.
 */
export default function TimingWidget() {
  const isOpen = useAppStore((state) => state.ui.isTimingOpen);
  const setIsOpen = useAppStore((state) => state.toggleTiming);
  const [showSettings, setShowSettings] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // Persistence: Load initial position from LocalStorage
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('lyfecore-timing-pos');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 380, y: 80 };
  });

  const {
    phase, status, remaining, 
    initWorker, start, pause, reset, skip, settings, updateSettings
  } = useTimerStore();

  const [draftSettings, setDraftSettings] = useState(settings);

  // Initialize Web Worker on mount
  useEffect(() => {
    initWorker();
  }, [initWorker]);

  // Handle Window Resize: Keep widget inside viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const padding = 20;
        const maxX = window.innerWidth - 340; // panel width + padding
        const maxY = window.innerHeight - 300; // panel height + padding
        
        const newX = Math.max(padding, Math.min(prev.x, maxX));
        const newY = Math.max(padding, Math.min(prev.y, maxY));
        
        if (newX !== prev.x || newY !== prev.y) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save position when drag ends
  const handleDragEnd = (event, info) => {
    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
    setPosition(newPos);
    localStorage.setItem('lyfecore-timing-pos', JSON.stringify(newPos));
  };

  const getPhaseDurationMs = (p) => {
    switch (p) {
      case PHASES.FOCUS: return settings.focusDuration * 60 * 1000;
      case PHASES.SHORT_BREAK: return settings.shortBreakDuration * 60 * 1000;
      case PHASES.LONG_BREAK: return settings.longBreakDuration * 60 * 1000;
      default: return settings.focusDuration * 60 * 1000;
    }
  };

  const totalDuration = getPhaseDurationMs(phase);
  
  const getPhaseColor = () => {
    switch (phase) {
      case PHASES.FOCUS: return 'var(--accent)';
      case PHASES.SHORT_BREAK: return 'var(--success)';
      case PHASES.LONG_BREAK: return 'var(--accent-secondary)';
      default: return 'var(--accent)';
    }
  };

  const handleSaveSettings = () => {
    updateSettings(draftSettings);
    setShowSettings(false);
  };

  return (
    <TimingPortal>
      <div id="widget-timing-root">
        {/* Constraints boundary */}
        <div className="timing-widget__constraints" ref={constraintsRef} />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="container-timing-window"
              className="timing-widget__panel-motion tier1-marker"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={false}
              dragConstraints={constraintsRef}
              onDragEnd={handleDragEnd}
              style={{ x: position.x, y: position.y }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div style={{ background: 'var(--accent)', color: 'white', fontSize: '9px', fontWeight: '900', padding: '1px 8px', borderRadius: '8px 8px 0 0', display: 'inline-block', position: 'absolute', top: '-15px', left: '10px' }}>TIMING PORTAL (TIER 1)</div>
              <Card className="timing-widget__panel">
                {/* Drag Handle / Header */}
                <div 
                  className="timing-widget__header" 
                  onPointerDown={(e) => dragControls.start(e)}
                  style={{ cursor: 'grab' }}
                >
                  <div className="timing-widget__title">
                    <Timer size={16} style={{ color: getPhaseColor() }} />
                    <span>Timing Hub</span>
                  </div>
                  <div className="timing-widget__actions">
                    <Button 
                      variant="glass" 
                      size="small" 
                      onClick={() => setShowSettings(!showSettings)}
                      className={showSettings ? 'active' : ''}
                    >
                      <Settings size={14} />
                    </Button>
                    <Button variant="glass" size="small" onClick={() => setIsOpen(false)}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>

                <div className="timing-widget__content">
                  {!showSettings ? (
                    <>
                      <div className="timing-widget__timer-mini">
                        <PomodoroTimer 
                          phase={phase}
                          remaining={remaining}
                          totalDuration={totalDuration}
                          status={status}
                        />
                      </div>

                      <div className="timing-widget__controls">
                        <Button variant="glass" size="small" onClick={reset} title="Reset">
                          <RotateCcw size={16} />
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          size="large" 
                          onClick={status === 'running' ? pause : start}
                          style={{ background: getPhaseColor() }}
                          className="timing-widget__ctrl--main"
                        >
                          {status === 'running' ? <Pause size={20} /> : <Play size={20} />}
                        </Button>

                        <Button variant="glass" size="small" onClick={skip} title="Skip Phase">
                          <SkipForward size={16} />
                        </Button>
                      </div>

                      <div className="timing-widget__phase-label" style={{ color: getPhaseColor() }}>
                        {phase.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </>
                  ) : (
                    <div className="timing-widget__settings">
                      <div className="timing-widget__settings-grid">
                        <div className="timing-widget__field">
                          <label>Focus</label>
                          <input 
                            type="number" 
                            value={draftSettings.focusDuration}
                            onChange={(e) => setDraftSettings({...draftSettings, focusDuration: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="timing-widget__field">
                          <label>Short</label>
                          <input 
                            type="number" 
                            value={draftSettings.shortBreakDuration}
                            onChange={(e) => setDraftSettings({...draftSettings, shortBreakDuration: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="timing-widget__field">
                          <label>Long</label>
                          <input 
                            type="number" 
                            value={draftSettings.longBreakDuration}
                            onChange={(e) => setDraftSettings({...draftSettings, longBreakDuration: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <Button variant="primary" size="small" className="timing-widget__save-btn" onClick={handleSaveSettings}>
                        <Check size={14} /> Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TimingPortal>
  );
}
