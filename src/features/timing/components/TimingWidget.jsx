/**
 * TimingWidget Component — Draggable Focus Hub Pop-up
 * 
 * Purpose: A self-contained, draggable "window" interface for focus management.
 * Features:
 * - Free movement via Framer Motion's drag handles.
 * - Integrated duration settings (no page navigation required).
 * - Real-time synchronization with background Web Worker.
 * - Premium "Window" aesthetics with glassmorphism.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, SkipForward, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useAppStore } from '../../../store/useAppStore';
import useTimerStore, { PHASES } from '../hooks/useTimer';
import PomodoroTimer from './PomodoroTimer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import './TimingWidget.css';

export default function TimingWidget() {
  const isOpen = useAppStore((state) => state.ui.isTimingOpen);
  const setIsOpen = useAppStore((state) => state.toggleTiming);
  const [showSettings, setShowSettings] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // Persistence: Load initial position from LocalStorage
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('lyfecore-timing-pos');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
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
    <div id="widget-timing-root">
      {/* Constraints boundary (invisible, covers screen when dragging) */}
      <div className="timing-widget__constraints" ref={constraintsRef} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="container-timing-window"
            className="timing-widget__panel-motion"
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
                <button 
                  className={`timing-widget__action-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
                <button className="timing-widget__action-btn" onClick={() => setIsOpen(false)}>
                  <X size={14} />
                </button>
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
                    <button className="timing-widget__ctrl" onClick={reset} title="Reset">
                      <RotateCcw size={16} />
                    </button>
                    
                    <button 
                      className="timing-widget__ctrl timing-widget__ctrl--main" 
                      onClick={status === 'running' ? pause : start}
                      style={{ background: getPhaseColor() }}
                    >
                      {status === 'running' ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button className="timing-widget__ctrl" onClick={skip} title="Skip Phase">
                      <SkipForward size={16} />
                    </button>
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
  );
}
