import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Dumbbell } from 'lucide-react';
import useWorkoutStore from '../hooks/useWorkout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * TemplateEditor - Form to create or edit workout templates.
 */
const TemplateEditor = ({ template, onCancel }) => {
  const { addTemplate, updateTemplate } = useWorkoutStore();
  const [name, setName] = useState(template?.name || '');
  const [exercises, setExercises] = useState(template?.exercises || []);
  const [newExName, setNewExName] = useState('');

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    setExercises([...exercises, { 
      name: newExName.trim(), 
      targetSets: 3, 
      targetReps: 12, 
      targetWeight: 0 
    }]);
    setNewExName('');
  };

  const handleRemoveExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx, field, value) => {
    const newExs = [...exercises];
    newExs[idx] = { ...newExs[idx], [field]: value };
    setExercises(newExs);
  };

  const handleSave = async () => {
    if (!name.trim() || exercises.length === 0) return;
    
    const data = { name: name.trim(), exercises };
    if (template?.id) {
      await updateTemplate(template.id, data);
    } else {
      await addTemplate(data);
    }
    onCancel();
  };

  return (
    <Card className="template-editor glass-panel">
      <div className="editor-header">
        <div className="title-group">
          <Dumbbell size={24} color="var(--accent)" />
          <h3>{template ? 'Edit Routine' : 'Create Routine'}</h3>
        </div>
        <Button variant="glass" size="small" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="editor-body">
        <div className="input-group">
          <label>Routine Name</label>
          <input 
            type="text" 
            placeholder="e.g. Saturday Push" 
            className="routine-name-input"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <div className="editor-exercises">
          <label className="section-label">Exercises & Goals</label>
          <div className="editor-exercises-list">
            {exercises.map((ex, idx) => (
              <div key={idx} className="editor-ex-card">
                <div className="ex-card-header">
                  <input 
                    type="text" 
                    className="ex-name-input"
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                  />
                  <button className="btn-remove-ex" onClick={() => handleRemoveExercise(idx)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="ex-card-goals">
                  <div className="goal-input">
                    <label>Sets</label>
                    <input 
                      type="number" 
                      value={ex.targetSets} 
                      onChange={(e) => updateExercise(idx, 'targetSets', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="goal-input">
                    <label>Reps Type</label>
                    <select 
                      value={ex.repsType || 'fixed'} 
                      onChange={(e) => updateExercise(idx, 'repsType', e.target.value)}
                      className="reps-type-select"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="range">Range</option>
                    </select>
                  </div>

                  <div className="goal-input">
                    <label>Reps</label>
                    {ex.repsType === 'range' ? (
                      <div className="range-input-group">
                        <input 
                          type="number" 
                          placeholder="Min"
                          value={ex.targetRepsMin || 8} 
                          onChange={(e) => updateExercise(idx, 'targetRepsMin', parseInt(e.target.value) || 0)}
                        />
                        <span>-</span>
                        <input 
                          type="number" 
                          placeholder="Max"
                          value={ex.targetRepsMax || 12} 
                          onChange={(e) => updateExercise(idx, 'targetRepsMax', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ) : (
                      <input 
                        type="number" 
                        value={ex.targetReps} 
                        onChange={(e) => updateExercise(idx, 'targetReps', parseInt(e.target.value) || 0)}
                      />
                    )}
                  </div>

                  <div className="goal-input">
                    <label>Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={ex.targetWeight} 
                      onChange={(e) => updateExercise(idx, 'targetWeight', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="goal-input">
                    <label>Target RPE</label>
                    <input 
                      type="number" 
                      min="1" max="10" step="0.5"
                      value={ex.targetRpe || 8} 
                      onChange={(e) => updateExercise(idx, 'targetRpe', parseFloat(e.target.value) || 8)}
                    />
                  </div>

                  <div className="goal-input">
                    <label>Rest (sec)</label>
                    <input 
                      type="number" 
                      step="15"
                      value={ex.restTimer || 90} 
                      onChange={(e) => updateExercise(idx, 'restTimer', parseInt(e.target.value) || 60)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddExercise} className="add-ex-form">
            <input 
              type="text" 
              placeholder="Add next exercise..." 
              value={newExName} 
              onChange={(e) => setNewExName(e.target.value)} 
            />
            <Button type="submit" variant="glass">
              <Plus size={16} /> Add
            </Button>
          </form>
        </div>
      </div>

      <div className="editor-footer">
        <Button variant="primary" size="large" onClick={handleSave} disabled={!name || exercises.length === 0}>
          <Save size={18} /> Save Template
        </Button>
      </div>
    </Card>
  );
};

export default TemplateEditor;
