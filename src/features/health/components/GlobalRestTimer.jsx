import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import RestTimer from '../../workout/components/RestTimer'; // Reuse the logic-heavy timer component

/**
 * GlobalRestTimer - Floating overlay for recovery periods in Engine 2.0.
 */
const GlobalRestTimer = () => {
  const { activeTimer, clearRestTimer, preferences } = useWorkoutStore();

  return (
    <AnimatePresence>
      {activeTimer.id && (
        <motion.div
          className="global-rest-timer-v2"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
        >
          <div className="timer-v2-header">
            <Clock size={16} />
            <span>Resting...</span>
            <button className="timer-v2-close" onClick={clearRestTimer}>
              <X size={16} />
            </button>
          </div>
          
          <RestTimer 
            key={`${activeTimer.id}-${activeTimer.key}`}
            initialSeconds={activeTimer.duration || preferences.defaultRestTime} 
            onFinish={() => {
              // Stay visible for a moment then clear
              setTimeout(clearRestTimer, 3000);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalRestTimer;
