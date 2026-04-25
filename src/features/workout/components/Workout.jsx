import React, { useEffect, useState } from 'react';
import { 
  Dumbbell, Plus, Play, History, Clock, Activity, Loader2, 
  Trash2, CheckCircle2, Circle, Layout, Library, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWorkoutStore from '../hooks/useWorkout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TemplateLibrary from './TemplateLibrary';
import TemplateEditor from './TemplateEditor';
import WorkoutAnalyst from './WorkoutAnalyst';
import './Workout.css';

import RestTimer from './RestTimer';

/**
 * Workout — Dedicated Training & Performance Module 2.0.
 */
const Workout = () => {
  const { 
    activeWorkout, recentSessions, loading, 
    initListener, startWorkout, finishWorkout, cancelWorkout,
    addExercise, removeExercise, addSet, updateSet, removeSet, cleanup,
    setRestTimer
  } = useWorkoutStore();

  const [exerciseInput, setExerciseInput] = useState('');
  const [view, setView] = useState('main'); // main, editor
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  const handleSetToggle = (exerciseId, setIndex, currentStatus, exercise) => {
    const newStatus = !currentStatus;
    updateSet(exerciseId, setIndex, { completed: newStatus });
    
    // Auto-trigger/reset rest timer if completed
    if (newStatus) {
      setRestTimer(exerciseId, exercise.restTimer || 90);
    }
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!exerciseInput.trim()) return;
    addExercise(exerciseInput.trim());
    setExerciseInput('');
  };

  const openEditor = (template = null) => {
    setEditingTemplate(template);
    setView('editor');
  };

  return (
    <div className="workout-container">
      <header className="workout-header">
        <div className="header-text">
          <h1 className="workout-title">
            <Dumbbell size={32} color="var(--accent)" />
            Workout Studio
          </h1>
          <p className="workout-subtitle">High-performance training tracking and analytics.</p>
        </div>
        
        {!(activeWorkout?.isActive) && view === 'main' && (
          <div className="header-actions">
            <Button variant="primary" onClick={() => startWorkout('Quick Session')}>
              <Play size={16} /> Quick Start
            </Button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {/* VIEW: TEMPLATE EDITOR */}
        {view === 'editor' ? (
          <motion.div
            key="editor-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <TemplateEditor 
              template={editingTemplate} 
              onCancel={() => setView('main')} 
            />
          </motion.div>
        ) : !(activeWorkout?.isActive) ? (
          /* VIEW: DASHBOARD (LIBRARY + HISTORY) */
          <motion.div
            key="main-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="workout-dashboard-grid">
              <WorkoutAnalyst />
              <TemplateLibrary onEdit={openEditor} />
              
              <section className="workout-history">
                <h3 className="section-title">
                  <History size={20} color="var(--accent)" /> Recent Activity
                </h3>
                <div className="workout-history-list">
                  {(recentSessions || []).map(session => (
                    <Card key={session.id} className="workout-history-card">
                      <div className="history-main">
                        <div className="history-info">
                          <span className="history-title">{session?.title || 'Unnamed Session'}</span>
                          <span className="history-meta">
                            {session?.startTime ? new Date(session.startTime).toLocaleDateString() : 'N/A'} · {session?.durationMs ? Math.floor(session.durationMs / 60000) : 0} min
                          </span>
                        </div>
                        <div className="history-stats">
                          <span className="stat-value">{session?.exercises?.length || 0}</span>
                          <span className="stat-label">Exercises</span>
                        </div>
                      </div>
                      {(session?.exercises?.length > 0) && (
                        <div className="history-preview">
                          {session.exercises.map(ex => ex.name).join(', ')}
                        </div>
                      )}
                    </Card>
                  ))}
                  {(!recentSessions || recentSessions.length === 0) && !loading && (
                    <div className="workout-history-empty">No recent training sessions found.</div>
                  )}
                  {loading && (
                    <div className="workout-history-loading">
                      <Loader2 className="spin" size={24} />
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          /* VIEW: ACTIVE SESSION */
          <motion.div
            key="active-workout"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="workout-active-view"
          >
            <Card className="workout-session-header">
              <div className="workout-header-main">
                <div>
                  <h3>{activeWorkout?.title}</h3>
                  <div className="workout-meta">
                    <span><Clock size={14} /> {activeWorkout?.startTime ? new Date(activeWorkout.startTime).toLocaleTimeString() : '--:--'}</span>
                    <span><Activity size={14} /> Tracking Progress</span>
                  </div>
                </div>
                <div className="session-actions">
                  <Button variant="glass" onClick={cancelWorkout} disabled={loading}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={finishWorkout} disabled={loading || !(activeWorkout?.exercises?.length > 0)}>
                    {loading ? <Loader2 className="spin" size={16} /> : 'Finish Workout'}
                  </Button>
                </div>
              </div>
              
              <form onSubmit={handleAddExercise} className="workout-add-exercise">
                <input 
                  type="text" 
                  placeholder="What's next? (e.g. Bench Press)" 
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                />
                <Button type="submit" variant="glass">
                  <Plus size={16} /> Add Exercise
                </Button>
              </form>
            </Card>

            <div className="workout-exercises-list">
              <AnimatePresence>
                {(activeWorkout?.exercises || []).map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="workout-exercise-card">
                      <div className="workout-exercise-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <h4>{exercise?.name}</h4>
                        </div>
                        <button className="workout-remove-btn" onClick={() => removeExercise(exercise.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="workout-sets-table">
                        <div className="workout-table-header">
                          <span className="col-set">Set</span>
                          <span className="col-weight">Weight (kg)</span>
                          <span className="col-reps">Reps</span>
                          <span className="col-reps">RPE</span>
                          <span className="col-status">Done</span>
                        </div>
                        
                        {(exercise?.sets || []).map((set, idx) => (
                          <div key={idx} className={`workout-set-row ${set?.completed ? 'completed' : ''}`}>
                            <span className="col-set">{idx + 1}</span>
                            <input 
                              type="number" 
                              className="col-weight"
                              value={set?.weight || ''}
                              onChange={(e) => updateSet(exercise.id, idx, { weight: parseFloat(e.target.value) })}
                              placeholder="0"
                            />
                            <input 
                              type="number" 
                              className="col-reps"
                              value={set?.reps || ''}
                              onChange={(e) => updateSet(exercise.id, idx, { reps: parseInt(e.target.value) })}
                              placeholder="0"
                            />
                            <select 
                              className="col-rpe"
                              value={set?.rpe || 0}
                              onChange={(e) => updateSet(exercise.id, idx, { rpe: parseInt(e.target.value) })}
                            >
                              {[0, 6, 7, 8, 9, 10].map(val => (
                                <option key={val} value={val}>{val === 0 ? '-' : val}</option>
                              ))}
                            </select>
                            <div className="col-status-group">
                              <button 
                                className="col-status"
                                onClick={() => handleSetToggle(exercise.id, idx, set?.completed, exercise)}
                                title={set?.completed ? 'Mark as active' : 'Mark as completed'}
                              >
                                {set?.completed ? <CheckCircle2 size={18} color="var(--accent-success)" /> : <Circle size={18} />}
                              </button>
                              <button 
                                className="col-delete-set"
                                onClick={() => removeSet(exercise.id, idx)}
                                title="Remove set"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="workout-exercise-footer">
                        <Button variant="glass" size="small" onClick={() => addSet(exercise.id)}>
                          <Plus size={14} /> Add Set
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workout;
