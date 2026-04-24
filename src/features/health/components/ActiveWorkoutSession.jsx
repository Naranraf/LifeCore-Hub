import React from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import Card from '../../../components/ui/Card';
import SetRow from './SetRow';

/**
 * ActiveWorkoutSession - Main orchestration of an ongoing training session.
 */
const ActiveWorkoutSession = () => {
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);

  if (!activeWorkout) return null;

  return (
    <div className="active-workout-container">
      <header className="active-session-header">
        <h2>{activeWorkout.name}</h2>
        <span className="session-tag">Live Session</span>
      </header>

      <div className="exercises-stack">
        {activeWorkout.exercises.map((exercise) => (
          <Card key={exercise.id} className="exercise-card-v2">
            <h4 className="exercise-name-v2">{exercise.name}</h4>
            
            <div className="sets-grid-v2">
              <div className="sets-header">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>RPE</span>
              </div>
              
              {exercise.sets.map((set, idx) => (
                <SetRow 
                  key={set.id} 
                  exerciseId={exercise.id} 
                  set={set} 
                  index={idx} 
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveWorkoutSession;
