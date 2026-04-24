import React from 'react';
import useWorkoutStore from '../hooks/useWorkoutStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Play, ClipboardList, Plus } from 'lucide-react';

/**
 * TemplateLibrary - List of saved training protocols.
 */
const TemplateLibrary = ({ onCreate }) => {
  const templates = useWorkoutStore((state) => state.templates);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  return (
    <div className="template-library-v2">
      <div className="library-header-v2">
        <h3 className="library-title">
          <ClipboardList size={20} /> Training Protocols
        </h3>
        <Button variant="glass" size="small" onClick={onCreate}>
          <Plus size={16} /> Create New
        </Button>
      </div>
      
      <div className="template-grid-v2">
        {templates.map((template) => (
          <Card key={template.id} className="template-item-v2">
            <div className="template-info-v2">
              <h4>{template.name}</h4>
              <p>{template.exercises.length} Exercises</p>
            </div>
            <Button variant="primary" onClick={() => startWorkout(template.id)}>
              <Play size={16} /> Start
            </Button>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="empty-library-v2">
            No protocols saved yet. Use the Builder to create your first one.
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;
