import React from 'react';
import { Play, Edit2, Trash2, Plus, Dumbbell } from 'lucide-react';
import useWorkoutStore from '../hooks/useWorkout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * TemplateLibrary - Gallery of saved workout routines.
 */
const TemplateLibrary = ({ onEdit }) => {
  const { templates, deleteTemplate, loadSessionFromTemplate } = useWorkoutStore();

  return (
    <div className="template-library">
      <div className="library-header">
        <h4><Dumbbell size={18} /> Routine Library</h4>
        <Button variant="glass" size="small" onClick={() => onEdit(null)}>
          <Plus size={14} /> New Template
        </Button>
      </div>

      <div className="template-grid">
        {(templates || []).map((template) => {
          const totalSets = (template?.exercises || []).reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
          
          return (
            <Card key={template?.id} className="template-card">
              <div className="template-info">
                <span className="template-name">{template?.name || 'Unnamed Template'}</span>
                <div className="template-meta">
                  <span>{(template?.exercises || []).length} Exercises</span>
                  <span>{totalSets} Total Sets</span>
                </div>
              </div>

              <div className="template-preview-list">
                {(template?.exercises || []).slice(0, 4).map((ex, idx) => (
                  <div key={idx} className="preview-item">
                    <Dumbbell size={10} style={{ color: 'var(--primary)' }} />
                    {ex.name}
                    <span>{ex.sets?.length || 0} sets</span>
                  </div>
                ))}
                {(template?.exercises || []).length > 4 && (
                  <div className="preview-item" style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                    + {(template?.exercises || []).length - 4} more exercises...
                  </div>
                )}
              </div>

              <div className="template-actions">
                <Button 
                  variant="primary" 
                  size="small" 
                  onClick={() => loadSessionFromTemplate(template?.id)}
                  style={{ flex: 1 }}
                >
                  <Play size={14} /> Start Training
                </Button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="glass" 
                    size="small" 
                    onClick={() => onEdit(template)}
                    title="Edit Template"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button 
                    variant="glass" 
                    size="small" 
                    onClick={() => deleteTemplate(template?.id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {(!templates || templates.length === 0) && (
          <div className="library-empty">
            No routines saved yet. Create your first template to optimize your workflow.
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;
