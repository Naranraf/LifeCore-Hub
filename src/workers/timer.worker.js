/**
 * Timer Web Worker — Background Thread for Resilient Timing
 * 
 * WHY A WEB WORKER?
 * Browsers throttle setTimeout/setInterval on inactive tabs to ~1 tick/sec 
 * or less. Web Workers run on a separate thread and are NOT throttled.
 * 
 * APPROACH:
 * We DON'T count down. Instead, we store a targetEndTime (absolute timestamp).
 * Every tick, we compute: remaining = targetEndTime - Date.now()
 * This makes the timer immune to missed ticks or resume-from-sleep drift.
 * 
 * PROTOCOL (messages):
 * Main → Worker:
 *   { type: 'START', targetEndTime: number }
 *   { type: 'PAUSE' }
 *   { type: 'RESUME', targetEndTime: number }
 *   { type: 'STOP' }
 * 
 * Worker → Main:
 *   { type: 'TICK', remaining: number }     // ms remaining
 *   { type: 'COMPLETE' }                    // timer finished
 */

let intervalId = null;
const TICK_INTERVAL_MS = 250; // 4 ticks/sec for smooth UI updates

/**
 * Starts the internal tick loop.
 * @param {number} targetEndTime - Unix timestamp (ms) when timer should end.
 */
function startTicking(targetEndTime) {
  stopTicking(); // Clean up any previous interval

  intervalId = setInterval(() => {
    const remaining = targetEndTime - Date.now();

    if (remaining <= 0) {
      stopTicking();
      self.postMessage({ type: 'COMPLETE' });
    } else {
      self.postMessage({ type: 'TICK', remaining });
    }
  }, TICK_INTERVAL_MS);
}

/** Clears the tick interval. */
function stopTicking() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Listen for commands from the main thread
self.onmessage = function handleMessage(event) {
  const { type, targetEndTime } = event.data;

  switch (type) {
    case 'START':
    case 'RESUME':
      if (typeof targetEndTime === 'number' && targetEndTime > Date.now()) {
        startTicking(targetEndTime);
      }
      break;

    case 'PAUSE':
    case 'STOP':
      stopTicking();
      break;

    default:
      console.warn('[TimerWorker] Unknown message type:', type);
  }
};
