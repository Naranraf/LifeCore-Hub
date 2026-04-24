import React from 'react';
import { Check } from 'lucide-react';
import useWorkoutStore from '../hooks/useWorkoutStore';

/**
 * SetRow - Ultra-light component for individual set tracking.
 * Connects directly to atomic store actions.
 */
const SetRow = ({ exerciseId, set, index }) => {
  const { preferences, updateActiveSet, setRestTimer } = useWorkoutStore();

  const handleChange = (field, value) => {
    updateActiveSet(exerciseId, set.id, field, value);
  };

  const handleToggleComplete = () => {
    const newState = !set.completed;
    updateActiveSet(exerciseId, set.id, 'completed', newState);
    
    // Auto-start rest timer if enabled and marking as complete
    if (newState && preferences.autoStartRest) {
      setRestTimer(set.id, preferences.defaultRestTime);
    }
  };

  return (
    <div className={`workout-set-row-v2 ${set.completed ? 'completed' : ''}`}>
      <span className="set-number">#{index + 1}</span>
      
      <div className="set-input-group">
        <label>{preferences.weightUnit.toUpperCase()}</label>
        <input 
          type="number" 
          step="0.5"
          value={set.weight || ''} 
          onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
          placeholder="0"
          disabled={set.completed}
        />
      </div>

      <div className="set-input-group">
        <label>REPS</label>
        <input 
          type="number" 
          value={set.reps || ''} 
          onChange={(e) => handleChange('reps', parseInt(e.target.value) || 0)}
          placeholder="0"
          disabled={set.completed}
        />
      </div>

      <button 
        className={`set-complete-btn ${set.completed ? 'active' : ''}`}
        onClick={handleToggleComplete}
      >
        <Check size={16} />
      </button>
    </div>
  );
};

export default SetRow;
