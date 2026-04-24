/**
 * useTimer — Mode Orchestrator for the Timing Engine.
 * 
 * This store now acts as a high-level switch between specialized timer hooks:
 * - Pomodoro (Cycles, Phases)
 * - Stopwatch (Elapsed time, Laps)
 * - Countdown (Custom duration timers)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MODES = {
  POMODORO: 'pomodoro',
  STOPWATCH: 'stopwatch',
  TIMER: 'timer',
};

const useTimerStore = create(
  persist(
    (set) => ({
      mode: MODES.POMODORO,
      setMode: (mode) => set({ mode }),
    }),
    { name: 'lyfecore-timer-master' }
  )
);

export default useTimerStore;
