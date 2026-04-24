import React, { useEffect, useState } from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import Button from '../../../components/ui/Button';
import { CheckCircle2, Clock, Pause, Play } from 'lucide-react';

/**
 * WorkoutHUD - Global floating status bar for active sessions.
 */
const WorkoutHUD = () => {
  const { status, activeWorkout, finishWorkout } = useWorkoutStore();
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (status !== 'active' || !activeWorkout?.startedAt) return;

    const interval = setInterval(() => {
      const ms = Date.now() - activeWorkout.startedAt;
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, activeWorkout]);

  if (status === 'idle') return null;

  return (
    <div className={`workout-hud-v2 ${status}`}>
      <div className="hud-content-v2">
        <div className="hud-info">
          <Clock size={18} className="hud-icon" />
          <span className="hud-timer">{elapsed}</span>
          <span className="hud-session-name">{activeWorkout?.name}</span>
        </div>

        <div className="hud-actions">
          <Button variant="primary" className="btn-finish-v2" onClick={finishWorkout}>
            <CheckCircle2 size={18} /> Finish Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHUD;
