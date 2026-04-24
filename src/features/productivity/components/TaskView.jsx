import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Archive, Flag } from 'lucide-react';
import useTaskStore from '../hooks/useTasks';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * TaskView — TIER 2 Productivity Module.
 * Features:
 * - Real-time CRUD.
 * - Quick status toggles.
 * - Batch archiving for completed tasks.
 */
const TaskView = () => {
  const { tasks, loading, initListener, addTask, updateTask, archiveCompleted, deleteTask, cleanup } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, [initListener, cleanup]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
      <div className="task-view">
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Task Manager</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Organize your edge-computed workflow.</p>
          </div>
          <Button variant="glass" size="small" onClick={archiveCompleted} disabled={completedTasks.length === 0}>
            <Archive size={14} /> Archive Completed
          </Button>
        </header>

        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <input 
            type="text" 
            placeholder="Type a mission and press Enter..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'var(--bg-deep)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-tactical)', 
              padding: '12px 16px', 
              color: 'var(--text-main)', 
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontWeight: '500'
            }}
          />
          <Button type="submit" variant="primary">
            <Plus size={18} /> Add Mission
          </Button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Pending Column */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending ({pendingTasks.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTasks.map(task => (
                <Card key={task.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => updateTask(task.id, { status: 'completed' })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  >
                    <Circle size={20} />
                  </button>
                  <span style={{ flex: 1, fontSize: '14px' }}>{task.title}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Flag size={14} color={task.priority === 'high' ? 'var(--error)' : 'var(--text-muted)'} />
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
              {pendingTasks.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  All clear! Add a task to start.
                </div>
              )}
            </div>
          </section>

          {/* Completed Column */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed ({completedTasks.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedTasks.map(task => (
                <Card key={task.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                  <button 
                    onClick={() => updateTask(task.id, { status: 'pending' })}
                    style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex' }}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <span style={{ flex: 1, fontSize: '14px', textDecoration: 'line-through' }}>{task.title}</span>
                  <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
};

export default TaskView;
