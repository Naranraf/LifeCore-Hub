import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTimerWorker } from '../services/timerWorker';

/**
 * useStopwatch — Dedicated state for precise time measurement.
 */
const useStopwatch = create(
  persist(
    (set, get) => ({
      elapsed: 0,
      status: 'idle',
      laps: [],

      start: () => {
        const worker = getTimerWorker();
        const startTime = Date.now() - get().elapsed;
        set({ status: 'running' });
        worker.postMessage({ type: 'STOPWATCH_START', startTime });
        
        worker.onmessage = (e) => {
          if (e.data.type === 'TICK_STOPWATCH') {
            set({ elapsed: e.data.elapsed });
          }
        };
      },

      pause: () => {
        const worker = getTimerWorker();
        worker.postMessage({ type: 'PAUSE' });
        set({ status: 'paused' });
      },

      reset: () => {
        const worker = getTimerWorker();
        worker.postMessage({ type: 'STOP' });
        set({ status: 'idle', elapsed: 0, laps: [] });
      },

      addLap: () => {
        const { elapsed, laps } = get();
        set({ laps: [elapsed, ...laps] });
      }
    }),
    { name: 'lyfecore-stopwatch-state' }
  )
);

export default useStopwatch;
