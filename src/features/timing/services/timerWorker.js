/**
 * timerWorker.js — Singleton manager for the Timer Web Worker.
 * Ensures only one worker is created and shared across the application.
 */

let worker = null;

export const getTimerWorker = () => {
  if (!worker && typeof window !== 'undefined') {
    worker = new Worker(
      new URL('../../../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );
  }
  return worker;
};

export const stopAllTicking = () => {
  if (worker) {
    worker.postMessage({ type: 'STOP' });
  }
};
