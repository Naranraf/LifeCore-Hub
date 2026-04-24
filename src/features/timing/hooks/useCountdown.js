import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTimerWorker } from '../services/timerWorker';

/**
 * useCountdown — Dedicated state for countdown timers.
 * Allows setting custom initial durations.
 */
const useCountdown = create(
  persist(
    (set, get) => ({
      duration: 60000, // Default 1 minute
      remaining: 60000,
      status: 'idle',
      presets: [60000, 300000, 600000, 1500000], // Default presets: 1m, 5m, 10m, 25m

      setDuration: (ms) => {
        set({ duration: ms, remaining: ms, status: 'idle' });
      },

      addPreset: (ms) => {
        const { presets } = get();
        if (!presets.includes(ms)) {
          set({ presets: [...presets, ms].sort((a, b) => a - b) });
        }
      },

      removePreset: (ms) => {
        set({ presets: get().presets.filter(p => p !== ms) });
      },

      start: () => {
        const worker = getTimerWorker();
        const targetEndTime = Date.now() + get().remaining;
        set({ status: 'running' });
        worker.postMessage({ type: 'START', targetEndTime });
        
        worker.onmessage = (e) => {
          if (e.data.type === 'TICK') {
            set({ remaining: e.data.remaining });
          }
          if (e.data.type === 'COMPLETE') {
            set({ status: 'idle', remaining: 0 });
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(() => {});
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
        set({ status: 'idle', remaining: get().duration });
      }
    }),
    { name: 'lyfecore-countdown-state' }
  )
);

export default useCountdown;
