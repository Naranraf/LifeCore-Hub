import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  ListChecks,
  ChevronDown
} from 'lucide-react';
import useGoogleTasks from '../hooks/useGoogleTasks';
import useAuthStore from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * GoogleTasksWidget — Professional Google Tasks integration.
 * Mirroring the functionality and aesthetics of the official app.
 */
const GoogleTasksWidget = () => {
  const { googleAccessToken } = useAuthStore();
  const { 
    taskLists, 
    activeListId, 
    tasks, 
    loading, 
    error, 
    init, 
    loadTasks, 
    addTask, 
    toggleTask, 
    deleteTask 
  } = useGoogleTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showLists, setShowLists] = useState(false);

  useEffect(() => {
    if (googleAccessToken) {
      init();
    }
  }, [googleAccessToken]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const activeList = taskLists.find(l => l.id === activeListId);

  if (!googleAccessToken) {
    return (
      <div className="tasks-placeholder" style={{ textAlign: 'center', padding: '40px' }}>
        <ListChecks size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
        <h3>Google Tasks Disconnected</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in with Google to sync your missions.</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'needsAction');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="google-tasks">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button 
            className="tasks-list-selector"
            onClick={() => setShowLists(!showLists)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-main)', 
              fontSize: '20px', 
              fontWeight: '800',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            {activeList?.title || 'Loading Tasks...'}
            <ChevronDown size={18} />
          </button>
          
          {showLists && (
            <div className="glass-panel" style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              zIndex: 100, 
              width: '240px', 
              marginTop: '8px',
              padding: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {taskLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => {
                    loadTasks(list.id);
                    setShowLists(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    background: activeListId === list.id ? 'var(--bg-deep)' : 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeListId === list.id ? 'var(--accent)' : 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {list.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => loadTasks(activeListId)} 
            disabled={loading}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <a 
            href="https://tasks.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </header>

      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input 
          type="text" 
          placeholder="Add a new mission..." 
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
        <Button type="submit" variant="primary" disabled={!newTaskTitle.trim() || loading}>
          <Plus size={18} />
        </Button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {/* Pending Tasks */}
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Mission Queue ({pendingTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingTasks.map(task => (
              <Card key={task.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button 
                  onClick={() => toggleTask(task.id, true)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <Circle size={22} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>{task.title}</p>
                  {task.due && <span style={{ fontSize: '11px', color: 'var(--warning)' }}>Due: {new Date(task.due).toLocaleDateString()}</span>}
                </div>
                <button 
                  onClick={() => deleteTask(task.id)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.3, cursor: 'pointer' }}
                  className="task-delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
            {pendingTasks.length === 0 && !loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '20px' }}>
                Operations complete. Area secure.
              </div>
            )}
          </div>
        </section>

        {/* Completed Tasks */}
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Completed ({completedTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.6 }}>
            {completedTasks.map(task => (
              <Card key={task.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button 
                  onClick={() => toggleTask(task.id, false)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex' }}
                >
                  <CheckCircle2 size={22} />
                </button>
                <span style={{ flex: 1, fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '16px' }}>Error: {error}</p>
      )}
    </div>
  );
};

export default GoogleTasksWidget;
