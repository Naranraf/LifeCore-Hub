import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  ListChecks,
  AlertCircle,
  Clock,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import useTaskStore from '../hooks/useTasks';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * SortableTaskItem — Individual task component with DnD capabilities.
 */
const SortableTaskItem = ({ task, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`task-item ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="task-item-inner" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-deep)' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', color: 'var(--text-muted)', opacity: 0.5 }}>
          <GripVertical size={16} />
        </div>

        <button 
          onClick={() => onToggle(task.id)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          <Circle size={20} />
        </button>
        
        <div style={{ flex: 1 }}>
          <p className="task-title" style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{task.title}</p>
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '10px', color: 'var(--warning)' }}>
              <Clock size={10} />
              <span className="stats-number">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {task.priority === 'high' && <AlertCircle size={14} style={{ color: 'var(--error)' }} />}
          <button 
            onClick={() => onDelete(task.id)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.3, cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
};

/**
 * NativeTasksWidget — Sovereign Task Management Engine.
 * Upgraded with dnd-kit for tactical reordering.
 */
const NativeTasksWidget = () => {
  const { 
    tasks, 
    loading, 
    initListener, 
    addTask, 
    updateTask, 
    deleteTask,
    cleanup 
  } = useTaskStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  useEffect(() => {
    // Sync local state with store for smooth DnD
    setLocalTasks(tasks.filter(t => t.status !== 'completed'));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localTasks.findIndex(t => t.id === active.id);
      const newIndex = localTasks.findIndex(t => t.id === over.id);
      const updated = arrayMove(localTasks, oldIndex, newIndex);
      setLocalTasks(updated);
      // Optional: Save new order to Firestore if implemented
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const pendingTasks = localTasks;
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div id="widget-tasks-dnd" className="native-tasks">
      <header className="prod-widget__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListChecks size={18} />
          <h3>Sovereign Tasks</h3>
        </div>
        <div className="stats-number" style={{ fontSize: '12px', opacity: 0.6 }}>
          {pendingTasks.length} Pending
        </div>
      </header>

      <div className="prod-widget__content">
        <form onSubmit={handleAddTask} className="prod-widget__form" style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Capture new mission..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="stats-number"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '14px' }}
          />
          <Button type="submit" variant="primary" disabled={!newTaskTitle.trim() || loading}>
            <Plus size={16} />
          </Button>
        </form>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={pendingTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="tasks-scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingTasks.length === 0 && !loading && (
                <div className="prod-widget__empty">
                  <CheckCircle2 size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                  <p>Operational clear. All missions completed.</p>
                </div>
              )}

              {pendingTasks.map(task => (
                <SortableTaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={(id) => updateTask(id, { status: 'completed' })}
                  onDelete={deleteTask}
                />
              ))}

              {completedTasks.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 0' }}
                  >
                    <ChevronRight size={14} style={{ transform: showCompleted ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    COMPLETED ({completedTasks.length})
                  </button>
                  
                  {showCompleted && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', opacity: 0.5 }}>
                      {completedTasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px' }}>
                          <CheckCircle2 size={18} style={{ color: 'var(--accent-success)' }} />
                          <span style={{ fontSize: '13px', textDecoration: 'line-through' }}>{task.title}</span>
                          <button 
                            onClick={() => deleteTask(task.id)} 
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default NativeTasksWidget;
