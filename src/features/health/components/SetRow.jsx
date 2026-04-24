import React from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';

/**
 * SetRow - Ultra-light component for individual set tracking.
 * Connects directly to atomic store actions.
 */
const SetRow = ({ exerciseId, set, index }) => {
  const updateActiveSet = useWorkoutStore((state) => state.updateActiveSet);

  const handleChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    updateActiveSet(exerciseId, set.id, field, numericValue);
  };

  return (
    <div className="workout-set-row-v2">
      <span className="set-number">#{index + 1}</span>
      
      <div className="set-input-group">
        <label>KG</label>
        <input 
          type="number" 
          step="0.5"
          value={set.weight || ''} 
          onChange={(e) => handleChange('weight', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="set-input-group">
        <label>REPS</label>
        <input 
          type="number" 
          value={set.reps || ''} 
          onChange={(e) => handleChange('reps', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="set-input-group">
        <label>RPE</label>
        <input 
          type="number" 
          max="10"
          min="0"
          value={set.rpe || ''} 
          onChange={(e) => handleChange('rpe', e.target.value)}
          placeholder="-"
        />
      </div>
    </div>
  );
};

export default SetRow;
