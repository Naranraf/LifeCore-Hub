import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTimerWorker } from '../services/timerWorker';
import { useAppStore } from '../../../store/useAppStore';

export const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
};

/**
 * usePomodoro — Dedicated state for the Pomodoro Technique.
 */
const usePomodoro = create(
  persist(
    (set, get) => ({
      phase: PHASES.FOCUS,
      status: 'idle',
      remaining: DEFAULT_SETTINGS.focusDuration * 60 * 1000,
      completedCycles: 0,
      settings: DEFAULT_SETTINGS,

      start: () => {
        const worker = getTimerWorker();
        const targetEndTime = Date.now() + get().remaining;
        set({ status: 'running' });
        worker.postMessage({ type: 'START', targetEndTime });
        
        // Setup listener
        worker.onmessage = (e) => {
          if (e.data.type === 'TICK') {
            set({ remaining: e.data.remaining });
            useAppStore.getState().syncTimerState({ 
              remainingSeconds: Math.ceil(e.data.remaining / 1000),
              isActive: true,
              currentPhase: get().phase
            });
          }
          if (e.data.type === 'COMPLETE') {
            get().handleComplete();
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
        set({ 
          status: 'idle', 
          remaining: get().settings.focusDuration * 60 * 1000,
          phase: PHASES.FOCUS 
        });
      },

      skip: () => {
        get().handleComplete(true);
      },

      handleComplete: (isSkip = false) => {
        const { phase, completedCycles, settings } = get();
        let nextPhase = PHASES.FOCUS;
        let nextCycles = completedCycles;

        if (phase === PHASES.FOCUS) {
          nextCycles++;
          nextPhase = nextCycles >= settings.cyclesBeforeLongBreak ? PHASES.LONG_BREAK : PHASES.SHORT_BREAK;
          if (nextPhase === PHASES.LONG_BREAK) nextCycles = 0;
        }

        const nextDuration = settings[`${nextPhase}Duration`] * 60 * 1000;
        
        set({
          phase: nextPhase,
          completedCycles: nextCycles,
          remaining: nextDuration,
          status: 'idle'
        });

        if (!isSkip) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.4;
          audio.play().catch(() => {});
        }
      },

      updateSettings: (newSettings) => {
        const merged = { ...get().settings, ...newSettings };
        set({ settings: merged });
        if (get().status === 'idle') {
          set({ remaining: merged[`${get().phase}Duration`] * 60 * 1000 });
        }
      }
    }),
    { name: 'lyfecore-pomodoro-state' }
  )
);

export default usePomodoro;
