import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, SkipForward, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useAppStore } from '../../../store/useAppStore';
import useTimerStore, { MODES } from '../hooks/useTimer';
import usePomodoro, { PHASES } from '../hooks/usePomodoro';
import useStopwatch from '../hooks/useStopwatch';
import useCountdown from '../hooks/useCountdown';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('lyfecore-timing-pos');
    const defaultPos = { x: window.innerWidth - 360, y: 100 };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Safety check: Is the parsed position sane?
        if (parsed.x < -100 || parsed.x > window.innerWidth || parsed.y < -100 || parsed.y > window.innerHeight) {
          setPosition(defaultPos);
        } else {
          setPosition(parsed);
        }
      } catch (e) {
        setPosition(defaultPos);
      }
    } else {
      setPosition(defaultPos);
    }
  }, []);

  const { mode, setMode } = useTimerStore();
  const pomo = usePomodoro();
  const stop = useStopwatch();
  const count = useCountdown();

  // Determine active logic
  const active = mode === MODES.POMODORO ? pomo : (mode === MODES.STOPWATCH ? stop : count);

  const [draftSettings, setDraftSettings] = useState(pomo.settings);
  const [countdownMinutes, setCountdownMinutes] = useState(Math.floor(count.duration / 60000));
  const [countdownSeconds, setCountdownSeconds] = useState(Math.floor((count.duration % 60000) / 1000));

  // Initialize active logic worker connection on mount/mode switch
  useEffect(() => {
    active.start(); // This sets up the listener without necessarily starting the tick
    active.pause(); // Ensure it doesn't auto-start
  }, [mode]);

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
      case PHASES.FOCUS: return pomo.settings.focusDuration * 60 * 1000;
      case PHASES.SHORT_BREAK: return pomo.settings.shortBreakDuration * 60 * 1000;
      case PHASES.LONG_BREAK: return pomo.settings.longBreakDuration * 60 * 1000;
      default: return pomo.settings.focusDuration * 60 * 1000;
    }
  };

  const totalDuration = mode === MODES.POMODORO ? getPhaseDurationMs(pomo.phase) : 0;
  
  const getPhaseColor = () => {
    if (mode !== MODES.POMODORO) return 'var(--primary)';
    switch (pomo.phase) {
      case PHASES.FOCUS: return 'var(--accent)';
      case PHASES.SHORT_BREAK: return 'var(--success)';
      case PHASES.LONG_BREAK: return 'var(--accent-secondary)';
      default: return 'var(--accent)';
    }
  };

  const formatStopwatch = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSaveSettings = () => {
    if (mode === MODES.POMODORO) {
      pomo.updateSettings(draftSettings);
    } else if (mode === MODES.TIMER) {
      const totalMs = (countdownMinutes * 60 + countdownSeconds) * 1000;
      count.setDuration(totalMs);
    }
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
                      <div className="timing-widget__mode-mini">
                        <button onClick={() => setMode(MODES.POMODORO)} className={mode === MODES.POMODORO ? 'active' : ''}>Pomo</button>
                        <button onClick={() => setMode(MODES.STOPWATCH)} className={mode === MODES.STOPWATCH ? 'active' : ''}>Stop</button>
                        <button onClick={() => setMode(MODES.TIMER)} className={mode === MODES.TIMER ? 'active' : ''}>Timer</button>
                      </div>

                      <div className="timing-widget__timer-mini">
                        {mode === MODES.POMODORO ? (
                          <PomodoroTimer 
                            phase={pomo.phase}
                            remaining={pomo.remaining}
                            totalDuration={pomo.settings[`${pomo.phase}Duration`] * 60 * 1000}
                            status={pomo.status}
                          />
                        ) : (
                          <div className="widget-generic-timer">
                            <span className="mono">
                              {mode === MODES.STOPWATCH ? formatStopwatch(stop.elapsed) : formatStopwatch(count.remaining)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="timing-widget__controls">
                        <Button variant="glass" size="small" onClick={active.reset} title="Reset">
                          <RotateCcw size={16} />
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          size="large" 
                          onClick={active.status === 'running' ? active.pause : active.start}
                          style={{ background: getPhaseColor(), color: '#FFFFFF' }}
                          className="timing-widget__ctrl--main"
                        >
                          {active.status === 'running' ? <Pause size={20} /> : <Play size={20} fill="#FFFFFF" />}
                        </Button>

                        {mode === MODES.POMODORO && (
                          <Button variant="glass" size="small" onClick={pomo.skip} title="Skip Phase">
                            <SkipForward size={16} />
                          </Button>
                        )}
                      </div>

                      <div className="timing-widget__phase-label" style={{ color: getPhaseColor() }}>
                        {mode === MODES.POMODORO ? pomo.phase.replace(/([A-Z])/g, ' $1').trim() : mode.toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="timing-widget__settings">
                      {mode === MODES.POMODORO ? (
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
                      ) : mode === MODES.TIMER ? (
                        <div className="timing-widget__field-group">
                          <div className="timing-widget__field">
                            <label>Min</label>
                            <input 
                              type="number" 
                              value={countdownMinutes}
                              onChange={(e) => setCountdownMinutes(parseInt(e.target.value) || 0)}
                              min="0"
                              max="1440"
                            />
                          </div>
                          <div className="timing-widget__field">
                            <label>Sec</label>
                            <input 
                              type="number" 
                              value={countdownSeconds}
                              onChange={(e) => setCountdownSeconds(parseInt(e.target.value) || 0)}
                              min="0"
                              max="59"
                            />
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stopwatch has no settings.</p>
                      )}
                      
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
