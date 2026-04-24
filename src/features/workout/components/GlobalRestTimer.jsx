import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWorkoutStore from '../hooks/useWorkout';
import RestTimer from './RestTimer';

export default function GlobalRestTimer() {
  const { activeTimer, clearRestTimer } = useWorkoutStore();

  return (
    <AnimatePresence>
      {activeTimer.id && (
        <motion.div
          className="global-rest-timer-overlay"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
        >
          <div className="timer-context">Resting...</div>
          <RestTimer 
            key={`${activeTimer.id}-${activeTimer.key}`}
            initialSeconds={activeTimer.duration} 
            onFinish={() => {
              // Sound is already handled in RestTimer
              // We keep it visible for a few seconds or clear it?
              // The user said "stay open until finish", so we can clear on finish or stay 0:00.
              // I'll clear it after 5 seconds of 0:00.
              setTimeout(clearRestTimer, 5000);
            }}
          />
          <button className="timer-close-btn" onClick={clearRestTimer}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
