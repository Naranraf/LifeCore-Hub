/**
 * useTimer — Zustand store for the Timing Engine.
 * 
 * ARCHITECTURE:
 * - Timer state lives in Zustand (global, reactive).
 * - Actual ticking happens in a Web Worker (background thread).
 * - Timer persistence: state is saved to localStorage on every
 *   significant event so it survives page refreshes.
 * - targetEndTime (absolute Unix timestamp) is the source of truth,
 *   NOT a decrementing counter. This eliminates drift.
 *
 * POMODORO CYCLE:
 * focus → shortBreak → focus → shortBreak → ... → longBreak (after N cycles)
 */
import { create } from 'zustand';

const STORAGE_KEY = 'lyfecore_timer_state';

/** Default Pomodoro settings (in minutes). */
const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
};

/** Timer phases. */
const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

/** Convert minutes to milliseconds. */
function minToMs(min) {
  return min * 60 * 1000;
}

/**
 * Get the duration (ms) for a given phase.
 */
function getPhaseDuration(phase, settings) {
  switch (phase) {
    case PHASES.FOCUS:
      return minToMs(settings.focusDuration);
    case PHASES.SHORT_BREAK:
      return minToMs(settings.shortBreakDuration);
    case PHASES.LONG_BREAK:
      return minToMs(settings.longBreakDuration);
    default:
      return minToMs(settings.focusDuration);
  }
}

/**
 * Determine next phase in the Pomodoro cycle.
 */
function getNextPhase(currentPhase, completedCycles, settings) {
  if (currentPhase === PHASES.FOCUS) {
    const newCycles = completedCycles + 1;
    if (newCycles >= settings.cyclesBeforeLongBreak) {
      return { phase: PHASES.LONG_BREAK, cycles: 0 };
    }
    return { phase: PHASES.SHORT_BREAK, cycles: newCycles };
  }
  // After any break, go back to focus
  return { phase: PHASES.FOCUS, cycles: completedCycles };
}

/** Persist state to localStorage. */
function saveState(state) {
  try {
    const serializable = {
      phase: state.phase,
      status: state.status,
      remaining: state.remaining,
      targetEndTime: state.targetEndTime,
      completedCycles: state.completedCycles,
      totalFocusMs: state.totalFocusMs,
      settings: state.settings,
      sessionCount: state.sessionCount,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Silently fail — localStorage might be full or disabled
  }
}

/** Load persisted state from localStorage. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Request notification permission (non-blocking). */
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/** Send a browser notification. */
function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
    });
  }
}

let worker = null;

/** Initialize or get the Web Worker singleton. */
function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL('../../../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );
  }
  return worker;
}

const useTimerStore = create((set, get) => {
  // Try to restore persisted state
  const persisted = loadState();
  const initialSettings = persisted?.settings || DEFAULT_SETTINGS;
  const initialPhase = persisted?.phase || PHASES.FOCUS;
  const initialDuration = getPhaseDuration(initialPhase, initialSettings);

  return {
    // State
    phase: initialPhase,
    status: 'idle', // idle | running | paused
    remaining: persisted?.remaining || initialDuration,
    targetEndTime: null,
    completedCycles: persisted?.completedCycles || 0,
    totalFocusMs: persisted?.totalFocusMs || 0,
    settings: initialSettings,
    sessionCount: persisted?.sessionCount || 0,

    /**
     * Initialize the worker message handler.
     * Call ONCE from the Timing component on mount.
     */
    initWorker: () => {
      requestNotificationPermission();
      const w = getWorker();

      w.onmessage = (event) => {
        const { type, remaining } = event.data;
        const state = get();

        if (type === 'TICK') {
          set({ remaining });
        }

        if (type === 'COMPLETE') {
          const focusAdded = state.phase === PHASES.FOCUS
            ? getPhaseDuration(PHASES.FOCUS, state.settings)
            : 0;

          const { phase: nextPhase, cycles: nextCycles } = getNextPhase(
            state.phase,
            state.completedCycles,
            state.settings
          );

          const nextDuration = getPhaseDuration(nextPhase, state.settings);
          const phaseLabel =
            nextPhase === PHASES.FOCUS ? '🎯 Focus Time' :
            nextPhase === PHASES.SHORT_BREAK ? '☕ Short Break' :
            '🌴 Long Break';

          sendNotification(
            'LyfeCore Timer',
            `${state.phase === PHASES.FOCUS ? 'Focus session complete!' : 'Break is over!'} Next: ${phaseLabel}`
          );

          // Play audio cue
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {
            // Audio playback might be blocked
          }

          set({
            phase: nextPhase,
            status: 'idle',
            remaining: nextDuration,
            targetEndTime: null,
            completedCycles: nextCycles,
            totalFocusMs: state.totalFocusMs + focusAdded,
            sessionCount: state.phase === PHASES.FOCUS
              ? state.sessionCount + 1
              : state.sessionCount,
          });

          saveState(get());
        }
      };

      // If page was refreshed while running, check if timer should still be active
      if (persisted?.status === 'running' && persisted?.targetEndTime) {
        if (persisted.targetEndTime > Date.now()) {
          set({
            status: 'running',
            targetEndTime: persisted.targetEndTime,
          });
          w.postMessage({
            type: 'START',
            targetEndTime: persisted.targetEndTime,
          });
        } else {
          // Timer expired while page was closed
          set({ status: 'idle', remaining: 0 });
        }
      }
    },

    /** Start or resume the timer. */
    start: () => {
      requestNotificationPermission(); // Triggered by user gesture
      const state = get();
      const w = getWorker();
      const targetEndTime = Date.now() + state.remaining;

      set({ status: 'running', targetEndTime });
      w.postMessage({ type: 'START', targetEndTime });
      saveState(get());
    },

    /** Pause the timer, preserving remaining time. */
    pause: () => {
      const w = getWorker();
      w.postMessage({ type: 'PAUSE' });
      set({ status: 'paused', targetEndTime: null });
      saveState(get());
    },

    /** Reset the current phase to its full duration. */
    reset: () => {
      const state = get();
      const w = getWorker();
      w.postMessage({ type: 'STOP' });

      const duration = getPhaseDuration(state.phase, state.settings);
      set({
        status: 'idle',
        remaining: duration,
        targetEndTime: null,
      });
      saveState(get());
    },

    /** Skip to the next phase. */
    skip: () => {
      const state = get();
      const w = getWorker();
      w.postMessage({ type: 'STOP' });

      const { phase: nextPhase, cycles: nextCycles } = getNextPhase(
        state.phase,
        state.completedCycles,
        state.settings
      );
      const nextDuration = getPhaseDuration(nextPhase, state.settings);

      set({
        phase: nextPhase,
        status: 'idle',
        remaining: nextDuration,
        targetEndTime: null,
        completedCycles: nextCycles,
      });
      saveState(get());
    },

    /** Update settings and reset timer. */
    updateSettings: (newSettings) => {
      const merged = { ...get().settings, ...newSettings };
      const duration = getPhaseDuration(get().phase, merged);
      const w = getWorker();
      w.postMessage({ type: 'STOP' });

      set({
        settings: merged,
        status: 'idle',
        remaining: duration,
        targetEndTime: null,
      });
      saveState(get());
    },
  };
});

export { PHASES, DEFAULT_SETTINGS };
export default useTimerStore;
