import React, { useState } from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Plus, Trash2, Save, X } from 'lucide-react';

/**
 * TemplateBuilder - Form to define training protocols.
 */
const TemplateBuilder = ({ onComplete }) => {
  const saveTemplate = useWorkoutStore((state) => state.saveTemplate);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { 
        id: crypto.randomUUID(), 
        name: '', 
        sets: [{ id: crypto.randomUUID(), weight: 0, reps: 0, rpe: 0 }] 
      }
    ]);
  };

  const updateExerciseName = (id, newName) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name: newName } : ex));
  };

  const addSetToExercise = (exId) => {
    setExercises(exercises.map(ex => 
      ex.id === exId 
        ? { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), weight: 0, reps: 0, rpe: 0 }] }
        : ex
    ));
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    saveTemplate({ name, exercises });
    if (onComplete) onComplete();
  };

  return (
    <Card className="template-builder-v2">
      <div className="builder-header">
        <div className="builder-header-top">
          <h3>Create New Protocol</h3>
          <button className="btn-close-builder" onClick={onComplete} title="Cancel">
            <X size={20} />
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Routine Name (e.g. Hypertrophy A)" 
          className="builder-title-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="builder-exercises-list">
        {exercises.map((ex, idx) => (
          <div key={ex.id} className="builder-ex-card">
            <div className="ex-header">
              <input 
                type="text" 
                placeholder="Exercise Name" 
                value={ex.name}
                onChange={(e) => updateExerciseName(ex.id, e.target.value)}
              />
              <button onClick={() => removeExercise(ex.id)} className="btn-remove-ex">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="ex-sets-summary">
              <span>{ex.sets.length} Sets defined</span>
              <button onClick={() => addSetToExercise(ex.id)} className="btn-add-set-v2">
                <Plus size={14} /> Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="builder-actions">
        <Button variant="glass" onClick={addExercise}>
          <Plus size={16} /> Add Exercise
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!name || exercises.length === 0}>
          <Save size={16} /> Save Protocol
        </Button>
      </div>
    </Card>
  );
};

export default TemplateBuilder;
