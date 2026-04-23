import React from 'react';
import { Music, Timer } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import useTimerStore from '../features/timing/hooks/useTimer';
import './FloatingToolbar.css';

/**
 * FloatingToolbar - Unified control for widgets
 * 
 * Grouping Music and Timing controls in a compact 50% smaller container.
 */
const FloatingToolbar = () => {
  const isMusicOpen = useAppStore((state) => state.ui.isMusicOpen);
  const isTimingOpen = useAppStore((state) => state.ui.isTimingOpen);
  const activeMusicId = useAppStore((state) => state.ui.activeMusicId);
  const toggleMusic = useAppStore((state) => state.toggleMusic);
  const toggleTiming = useAppStore((state) => state.toggleTiming);
  
  const { status } = useTimerStore();

  return (
    <div className="floating-toolbar">
      <button 
        className={`toolbar-btn ${isTimingOpen ? 'active' : ''} ${status === 'running' ? 'running' : ''}`}
        onClick={toggleTiming}
        title="Timing Hub"
      >
        <Timer size={12} />
      </button>

      <button 
        className={`toolbar-btn ${isMusicOpen || activeMusicId ? 'active' : ''}`}
        onClick={toggleMusic}
        title="Music Player"
      >
        <Music size={12} />
      </button>
    </div>
  );
};

export default FloatingToolbar;
