import React from 'react';
import { Dumbbell, Clock, Zap } from 'lucide-react';
import useWorkoutStore from '../health/hooks/useWorkoutStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

/**
 * WorkoutPreferences — Training environment configuration.
 */
const WorkoutPreferences = () => {
  const preferences = useWorkoutStore((state) => state.preferences);
  const updatePreference = useWorkoutStore((state) => state.updatePreference);

  return (
    <Card className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title">
          <Dumbbell size={20} />
          <span>Training Preferences</span>
        </div>
      </div>
      
      <div className="settings-section__content">
        <p className="settings-description">
          Customize your Workout Studio experience to match your training methodology.
        </p>

        {/* Weight Unit */}
        <div className="settings-row">
          <div className="settings-row__info">
            <span className="settings-row__label">Weight Unit</span>
            <span className="settings-row__desc">Standardized unit for all lift tracking.</span>
          </div>
          <div className="unit-toggle">
            <button 
              className={`unit-btn ${preferences.weightUnit === 'lbs' ? 'active' : ''}`}
              onClick={() => updatePreference('weightUnit', 'lbs')}
            >
              LBS
            </button>
            <button 
              className={`unit-btn ${preferences.weightUnit === 'kg' ? 'active' : ''}`}
              onClick={() => updatePreference('weightUnit', 'kg')}
            >
              KG
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        {/* Rest Timer */}
        <div className="settings-row">
          <div className="settings-row__info">
            <span className="settings-row__label">Default Rest Duration</span>
            <span className="settings-row__desc">Set the baseline recovery time between sets (seconds).</span>
          </div>
          <div className="rest-input-group">
            <Clock size={16} className="input-icon" />
            <input 
              type="number" 
              className="modal-input"
              value={preferences.defaultRestTime}
              onChange={(e) => updatePreference('defaultRestTime', parseInt(e.target.value) || 0)}
              style={{ width: '100px', textAlign: 'center' }}
            />
          </div>
        </div>

        <div className="settings-divider" />

        {/* Auto Rest */}
        <div className="settings-row">
          <div className="settings-row__info">
            <span className="settings-row__label">Auto-Start Rest Timer</span>
            <span className="settings-row__desc">Automatically trigger the timer when a set is marked complete.</span>
          </div>
          <button 
            className={`toggle-switch ${preferences.autoStartRest ? 'active' : ''}`}
            onClick={() => updatePreference('autoStartRest', !preferences.autoStartRest)}
          >
            <div className="toggle-handle">
              {preferences.autoStartRest && <Zap size={10} />}
            </div>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutPreferences;
