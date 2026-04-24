import React, { useState } from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import TemplateLibrary from './TemplateLibrary';
import TemplateBuilder from './TemplateBuilder';
import ActiveWorkoutSession from './ActiveWorkoutSession';
import WorkoutHUD from './WorkoutHUD';
import GlobalRestTimer from './GlobalRestTimer';
import './Health.css';

/**
 * WorkoutStudioV2 - Main entry point for the Workout Engine 2.0.
 * Orchestrates navigation between protocols, builder, and active session.
 */
const WorkoutStudioV2 = () => {
  const { status, activeWorkout } = useWorkoutStore();
  const [view, setView] = useState('library'); // library | builder

  // Auto-switch to session view if a workout is active
  if (status === 'active' || status === 'paused') {
    return (
      <div className="workout-studio-v2">
        <ActiveWorkoutSession />
        <WorkoutHUD />
        <GlobalRestTimer />
      </div>
    );
  }

  return (
    <div className="workout-studio-v2">
      {view === 'library' ? (
        <TemplateLibrary onCreate={() => setView('builder')} />
      ) : (
        <TemplateBuilder onComplete={() => setView('library')} />
      )}
    </div>
  );
};

export default WorkoutStudioV2;
