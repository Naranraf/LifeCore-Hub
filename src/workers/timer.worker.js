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
let mode = 'timer'; // timer | stopwatch
const TICK_INTERVAL_MS = 250; 

function startTicking(targetEndTime, startTime) {
  stopTicking();
  
  intervalId = setInterval(() => {
    if (mode === 'timer') {
      const remaining = targetEndTime - Date.now();
      if (remaining <= 0) {
        stopTicking();
        self.postMessage({ type: 'COMPLETE' });
      } else {
        self.postMessage({ type: 'TICK', remaining });
      }
    } else {
      const elapsed = Date.now() - startTime;
      self.postMessage({ type: 'TICK_STOPWATCH', elapsed });
    }
  }, TICK_INTERVAL_MS);
}

function stopTicking() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = function handleMessage(event) {
  const { type, targetEndTime, startTime } = event.data;

  switch (type) {
    case 'START':
      mode = 'timer';
      if (typeof targetEndTime === 'number') {
        startTicking(targetEndTime);
      }
      break;
    case 'STOPWATCH_START':
      mode = 'stopwatch';
      if (typeof startTime === 'number') {
        startTicking(null, startTime);
      }
      break;
    case 'PAUSE':
    case 'STOP':
      stopTicking();
      break;
  }
};
