/**
 * PomodoroTimer Component — Visual countdown visualization.
 * 
 * Purpose: Provides a high-fidelity SVG progress ring and digital clock.
 * Responsibilities:
 * - Calculate SVG dash offset based on time remaining.
 * - Render phase-specific metadata (label, emoji, theme color).
 * - Display ambient glow effects synced with the current state.
 */
import React, { useMemo } from 'react';
import './PomodoroTimer.css';

const CIRCLE_RADIUS = 120;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * Format ms to MM:SS display string.
 */
function formatTime(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Get visual config for each phase.
 */
function getPhaseConfig(phase) {
  switch (phase) {
    case 'focus':
      return { label: 'Focus', color: 'var(--accent)', emoji: '🎯' };
    case 'shortBreak':
      return { label: 'Short Break', color: 'var(--success)', emoji: '☕' };
    case 'longBreak':
      return { label: 'Long Break', color: 'var(--accent-secondary)', emoji: '🌴' };
    default:
      return { label: 'Focus', color: 'var(--accent)', emoji: '🎯' };
  }
}

export default function PomodoroTimer({
  phase,
  remaining,
  totalDuration,
  status,
  className = '',
}) {
  const config = getPhaseConfig(phase);
  const timeDisplay = formatTime(remaining);

  const progress = useMemo(() => {
    if (totalDuration <= 0) return 0;
    return Math.max(0, Math.min(1, remaining / totalDuration));
  }, [remaining, totalDuration]);

  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <div className={`pomodoro-timer ${className}`}>
      <svg
        className="pomodoro-timer__svg"
        viewBox="0 0 280 280"
      >
        {/* Background ring */}
        <circle
          className="pomodoro-timer__bg-ring"
          cx="140"
          cy="140"
          r={CIRCLE_RADIUS}
          fill="none"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          className="pomodoro-timer__progress-ring"
          cx="140"
          cy="140"
          r={CIRCLE_RADIUS}
          fill="none"
          strokeWidth="6"
          stroke={config.color}
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 140 140)"
          style={{
            transition: status === 'running' ? 'stroke-dashoffset 0.3s linear' : 'none',
            filter: `drop-shadow(0 0 8px ${config.color}60)`,
          }}
        />
      </svg>

      <div className="pomodoro-timer__content">
        <span className="pomodoro-timer__emoji">{config.emoji}</span>
        <span className="pomodoro-timer__time">{timeDisplay}</span>
        <span
          className="pomodoro-timer__label"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Ambient glow */}
      <div
        className="pomodoro-timer__glow"
        style={{ background: config.color }}
      />
    </div>
  );
}
