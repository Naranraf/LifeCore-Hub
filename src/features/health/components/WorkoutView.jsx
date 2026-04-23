import React from 'react';
import { Dumbbell, Plus, Play, History } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * WorkoutView — The "Workout Studio" main interface.
 * Linked to TIER 1 infrastructure.
 */
const WorkoutView = () => {
  const activeWorkout = useAppStore((state) => state.activeWorkout);
  const startWorkout = useAppStore((state) => state.startWorkout);

  return (
    <div className="workout-view" style={{ padding: '20px', border: '2px solid var(--accent)', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '800' }}>
          <Dumbbell size={32} color="var(--accent)" />
          WORKOUT STUDIO <span style={{ fontSize: '12px', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>TIER 1 ACTIVE</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>High-performance training tracking.</p>
      </header>

      {!activeWorkout.isActive ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Dumbbell size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h2>Ready for your next session?</h2>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Your progress will be saved in the TIER 1 Infrastructure.</p>
          <Button variant="primary" size="large" onClick={() => startWorkout('Push Day')}>
            <Play size={18} /> START NEW WORKOUT
          </Button>
        </Card>
      ) : (
        <div className="workout-active">
          <Card style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3>{activeWorkout.title}</h3>
            <p>Session started: {new Date(activeWorkout.startTime).toLocaleTimeString()}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button variant="glass" size="small"><Plus size={14} /> Add Exercise</Button>
              <Button variant="primary" size="small">Finish Session</Button>
            </div>
          </Card>
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={18} /> Recent Sessions
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No recent sessions found in Firestore.</p>
      </div>
    </div>
  );
};

export default WorkoutView;
