import React from 'react';
import { Music, Timer, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import useTimerStore from '../features/timing/hooks/useTimer';
import './FloatingToolbar.css';

/**
 * FloatingToolbar - Unified control for widgets
 */
const FloatingToolbar = () => {
  const isMusicOpen = useAppStore((state) => state.ui.isMusicOpen);
  const isTimingOpen = useAppStore((state) => state.ui.isTimingOpen);
  const isVisualsOpen = useAppStore((state) => state.ui.isVisualsOpen);
  const activeMusicId = useAppStore((state) => state.ui.activeMusicId);
  const toggleMusic = useAppStore((state) => state.toggleMusic);
  const toggleTiming = useAppStore((state) => state.toggleTiming);
  const toggleVisuals = useAppStore((state) => state.toggleVisuals);
  
  const { status } = useTimerStore();

  return (
    <div className="floating-toolbar">
      <button 
        className={`toolbar-btn ${isTimingOpen ? 'active' : ''} ${status === 'running' ? 'running' : ''}`}
        onClick={toggleTiming}
        title="Timing Engine"
      >
        <Timer size={12} />
      </button>

      <button 
        className={`toolbar-btn ${isMusicOpen || activeMusicId ? 'active' : ''}`}
        onClick={toggleMusic}
        title="Acoustic Focus (Music)"
      >
        <Music size={12} />
      </button>

      <button 
        className={`toolbar-btn ${isVisualsOpen ? 'active' : ''}`}
        onClick={toggleVisuals}
        title="Atmospheric Engine (Visuals)"
      >
        <Sparkles size={12} />
      </button>
    </div>
  );
};

export default FloatingToolbar;
