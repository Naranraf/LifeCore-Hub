/**
 * Timing Page — Primary interface for the Pomodoro Timing Engine.
 * 
 * Purpose: Manages focus sessions and breaks to optimize productivity.
 * Features:
 * - Real-time synchronization with a background Web Worker.
 * - Circular progress visualization and phase-aware theme colors.
 * - Persisted session statistics (completed cycles, total focus time).
 * - Modal-based configuration for custom session durations.
 */
import React, { useEffect, useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  X,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useTimerStore, { PHASES, MODES, DEFAULT_SETTINGS } from './hooks/useTimer';
import PomodoroTimer from './components/PomodoroTimer';
import './Timing.css';

/**
 * Computes total duration (ms) for current phase.
 */
function getPhaseDurationMs(phase, settings) {
  switch (phase) {
    case PHASES.FOCUS: return settings.focusDuration * 60 * 1000;
    case PHASES.SHORT_BREAK: return settings.shortBreakDuration * 60 * 1000;
    case PHASES.LONG_BREAK: return settings.longBreakDuration * 60 * 1000;
    default: return settings.focusDuration * 60 * 1000;
  }
}

/**
 * Format milliseconds to MM:SS.CC (Stopwatch)
 */
function formatStopwatch(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

/**
 * Format milliseconds to MM:SS (Simple Timer)
 */
function formatSimple(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Timing() {
  const {
    mode, phase, status, remaining, stopwatchElapsed,
    completedCycles, totalFocusMs, settings, sessionCount,
    initWorker, start, pause, reset, skip, updateSettings, setMode,
  } = useTimerStore();

  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState(settings);

  // Initialize Web Worker on mount
  useEffect(() => {
    initWorker();
  }, [initWorker]);

  // Sync draft settings when settings change
  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const totalDuration = getPhaseDurationMs(phase, settings);
  const totalFocusMin = Math.floor(totalFocusMs / 60000);

  return (
    <div id="page-timing" className="feature-page timing-page">
      <header className="feature-page__header">
        <div
          className="feature-page__icon"
          style={{ background: 'var(--glass-border)', color: 'var(--accent-secondary)' }}
        >
          <Timer size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Timing Engine</h1>
          <p className="feature-page__desc">
            Multi-mode precision timing with background persistence.
          </p>
        </div>
        
        <div className="timing-mode-switcher">
          <button 
            className={`mode-btn ${mode === MODES.POMODORO ? 'active' : ''}`}
            onClick={() => setMode(MODES.POMODORO)}
          >Pomodoro</button>
          <button 
            className={`mode-btn ${mode === MODES.STOPWATCH ? 'active' : ''}`}
            onClick={() => setMode(MODES.STOPWATCH)}
          >Stopwatch</button>
          <button 
            className={`mode-btn ${mode === MODES.TIMER ? 'active' : ''}`}
            onClick={() => setMode(MODES.TIMER)}
          >Timer</button>
        </div>

        <button
          className="timing-page__settings-btn"
          onClick={() => setShowSettings(true)}
          title="Timer Settings"
          id="btn-timer-settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Timer Area */}
      <div className="timing-page__main glass-panel">
        <div className="timing-page__timer-area">
          {mode === MODES.POMODORO ? (
            <PomodoroTimer
              phase={phase}
              remaining={remaining}
              totalDuration={totalDuration}
              status={status}
            />
          ) : (
            <div className="generic-timer-display">
              <div className="timer-val mono">
                {mode === MODES.STOPWATCH ? formatStopwatch(stopwatchElapsed) : formatSimple(remaining)}
              </div>
              <div className="timer-mode-label">{mode.toUpperCase()}</div>
            </div>
          )}

          {/* Controls */}
          <div className="timing-page__controls">
            <motion.button
              className="timing-page__control-btn timing-page__control-btn--secondary"
              onClick={reset}
              title="Reset"
              id="btn-timer-reset"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <RotateCcw size={20} />
            </motion.button>

            <motion.button
              className="timing-page__control-btn timing-page__control-btn--primary"
              onClick={status === 'running' ? pause : start}
              id="btn-timer-toggle"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{ color: '#FFFFFF' }} // Ensure visibility
            >
              {status === 'running' ? <Pause size={28} /> : <Play size={28} fill="#FFFFFF" />}
            </motion.button>

            {mode === MODES.POMODORO && (
              <motion.button
                className="timing-page__control-btn timing-page__control-btn--secondary"
                onClick={skip}
                title="Skip to next phase"
                id="btn-timer-skip"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <SkipForward size={20} />
              </motion.button>
            )}
          </div>

          {/* Phase Indicators (Only for Pomodoro) */}
          {mode === MODES.POMODORO && (
            <div className="timing-page__phases">
              {[PHASES.FOCUS, PHASES.SHORT_BREAK, PHASES.LONG_BREAK].map((p) => (
                <button
                  key={p}
                  className={`timing-page__phase-pill ${phase === p ? 'timing-page__phase-pill--active' : ''}`}
                  onClick={() => {
                    if (status !== 'running') {
                      useTimerStore.setState({
                        phase: p,
                        remaining: getPhaseDurationMs(p, settings),
                        status: 'idle',
                      });
                    }
                  }}
                >
                  {p === PHASES.FOCUS && '🎯 Focus'}
                  {p === PHASES.SHORT_BREAK && '☕ Short'}
                  {p === PHASES.LONG_BREAK && '🌴 Long'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="timing-page__stats">
        <StatMini icon={Zap} label="Sessions" value={sessionCount} color="var(--warning)" />
        <StatMini icon={Clock} label="Focus Time" value={`${totalFocusMin}m`} color="var(--accent)" />
        <StatMini icon={Target} label="Cycle" value={`${completedCycles}/${settings.cyclesBeforeLongBreak}`} color="var(--accent-secondary)" />
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            draft={draftSettings}
            onChange={setDraftSettings}
            onSave={() => {
              updateSettings(draftSettings);
              setShowSettings(false);
            }}
            onClose={() => {
              setDraftSettings(settings);
              setShowSettings(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mini stat card for session metrics. */
function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="timing-page__stat glass-panel">
      <div className="timing-page__stat-icon" style={{ color, background: `${color}15` }}>
        <Icon size={18} />
      </div>
      <div>
        <span className="timing-page__stat-value">{value}</span>
        <span className="timing-page__stat-label">{label}</span>
      </div>
    </div>
  );
}

/** Settings modal overlay. */
function SettingsModal({ draft, onChange, onSave, onClose }) {
  /** Update a single field in draft settings. */
  function handleField(field, rawValue) {
    const num = parseInt(rawValue, 10);
    if (!isNaN(num) && num > 0 && num <= 120) {
      onChange({ ...draft, [field]: num });
    }
  }

  return (
    <motion.div
      className="timing-modal__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="timing-modal glass-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="timing-modal__header">
          <h2>Timer Settings</h2>
          <button onClick={onClose} className="timing-modal__close" id="btn-close-settings">
            <X size={20} />
          </button>
        </div>

        <div className="timing-modal__fields">
          <SettingField
            label="Focus Duration"
            value={draft.focusDuration}
            onChange={(v) => handleField('focusDuration', v)}
            unit="min"
          />
          <SettingField
            label="Short Break"
            value={draft.shortBreakDuration}
            onChange={(v) => handleField('shortBreakDuration', v)}
            unit="min"
          />
          <SettingField
            label="Long Break"
            value={draft.longBreakDuration}
            onChange={(v) => handleField('longBreakDuration', v)}
            unit="min"
          />
          <SettingField
            label="Cycles before Long Break"
            value={draft.cyclesBeforeLongBreak}
            onChange={(v) => handleField('cyclesBeforeLongBreak', v)}
            unit="cycles"
          />
        </div>

        <button className="timing-modal__save" onClick={onSave} id="btn-save-settings">
          Save Settings
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Single setting input row. */
function SettingField({ label, value, onChange, unit }) {
  return (
    <div className="timing-modal__field">
      <label className="timing-modal__label">{label}</label>
      <div className="timing-modal__input-group">
        <input
          type="number"
          className="timing-modal__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={1}
          max={120}
        />
        <span className="timing-modal__unit">{unit}</span>
      </div>
    </div>
  );
}
