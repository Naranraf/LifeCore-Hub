import React, { useEffect } from 'react';
import { Dumbbell, Plus, Play, History, Clock, Activity, Loader2 } from 'lucide-react';
import useWorkoutStore from '../hooks/useWorkout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import './Workout.css';

/**
 * Workout — Dedicated Training & Performance Module.
 */
const Workout = () => {
  const { 
    activeWorkout, recentSessions, loading, initListener, startWorkout, finishWorkout, addExercise, cleanup 
  } = useWorkoutStore();

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  return (
    <div className="workout-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Dumbbell size={32} color="var(--accent)" />
          Workout
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>High-performance training tracking and analytics.</p>
      </header>

      {!activeWorkout.isActive ? (
        <Card className="glass-panel" style={{ textAlign: 'center', padding: '64px 32px', border: '1px dashed var(--glass-border)' }}>
          <div style={{ background: 'var(--glass-glow)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Dumbbell size={40} color="var(--accent)" style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>Ready for your next session?</h2>
          <p style={{ marginBottom: '32px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px' }}>
            All your progress is synchronized with the LyfeCore Cloud for long-term performance analysis.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="primary" size="large" onClick={() => startWorkout('Push Session')}>
              <Play size={18} /> Start Session
            </Button>
            <Button variant="glass" size="large">
              <Plus size={18} /> Custom Routine
            </Button>
          </div>
        </Card>
      ) : (
        <div className="workout-active-view">
          <Card className="glass-panel" style={{ borderLeft: '4px solid var(--accent)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{activeWorkout.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(activeWorkout.startTime).toLocaleTimeString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> Active Session</span>
                </div>
              </div>
              <Button variant="primary" size="small" onClick={finishWorkout} disabled={loading}>
                {loading ? <Loader2 className="spin" size={14} /> : 'Finish Workout'}
              </Button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="glass" size="small" onClick={() => addExercise('Bench Press')}>
                <Plus size={14} /> Add Exercise
              </Button>
            </div>
          </Card>
        </div>
      )}

      <section style={{ marginTop: '48px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
          <History size={20} color="var(--accent)" /> Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentSessions.map(session => (
            <Card key={session.id} className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700' }}>{session.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(session.startTime).toLocaleDateString()} · {Math.floor(session.durationMs / 60000)} min
                </div>
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '13px' }}>
                {session.exercises?.length || 0} Exercises
              </div>
            </Card>
          ))}
          {recentSessions.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--glass-bg)', borderRadius: '24px' }}>
              No recent training sessions found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Workout;
