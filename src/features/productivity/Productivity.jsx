/**
 * Productivity Page — Centralized Hub for Schedule and Tasks.
 * 
 * Purpose: Integrates Google Calendar, Google Tasks, and local notes into a single dashboard.
 * Features:
 * - Dynamic widget layout (Calendar, Tasks, Notes) with reordering and resizing.
 * - Real-time sync with Google API (Calendar and Tasks).
 * - Cloud-persisted layout preferences via Firebase.
 */
import React, { useState, useEffect } from 'react';
import { CalendarCheck, ListChecks, StickyNote, RefreshCw, AlertCircle, Plus, Check, ArrowUp, ArrowDown, Maximize2, Minimize2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import useAuthStore from '../../hooks/useAuth';
import { fetchCalendarEvents, fetchTaskLists, fetchTasks, addTask } from '../../services/googleApi';
import NotesWidget from './components/NotesWidget';
import CalendarWidget from './components/CalendarWidget';
import './Productivity.css';

export default function Productivity() {
  const { googleAccessToken } = useAuthStore();
  
  const [events, setEvents] = useState([]);
  const [taskLists, setTaskLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [tasks, setTasks] = useState([]);
  
  const [loadingCal, setLoadingCal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const defaultLayout = [
    { id: 'calendar', fullWidth: true },
    { id: 'tasks', fullWidth: false },
    { id: 'notes', fullWidth: true }
  ];
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('lyfe_prod_layout');
      return saved ? JSON.parse(saved) : defaultLayout;
    } catch(e) { return defaultLayout; }
  });

  const { user } = useAuthStore(); // Add user from authStore locally

  // Fetch Layout from cloud on mount
  useEffect(() => {
    if (!user) return;
    const fetchLayout = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().productivityLayout) {
          const cloudLayout = snap.data().productivityLayout;
          localStorage.setItem('lyfe_prod_layout', JSON.stringify(cloudLayout));
          setLayout(cloudLayout);
        }
      } catch (err) {
        console.warn('Could not fetch cloud layout:', err);
      }
    };
    fetchLayout();
  }, [user]);

  const saveLayout = async (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('lyfe_prod_layout', JSON.stringify(newLayout));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { productivityLayout: newLayout }, { merge: true });
      } catch(err) {
        console.error('Failed to sync layout', err);
      }
    }
  };

  const moveWidget = (id, direction) => {
    const idx = layout.findIndex(w => w.id === id);
    if (idx < 0) return;
    const newLayout = [...layout];
    if (direction === 'up' && idx > 0) {
      [newLayout[idx - 1], newLayout[idx]] = [newLayout[idx], newLayout[idx - 1]];
      saveLayout(newLayout);
    } else if (direction === 'down' && idx < layout.length - 1) {
      [newLayout[idx + 1], newLayout[idx]] = [newLayout[idx], newLayout[idx + 1]];
      saveLayout(newLayout);
    }
  };

  const toggleSize = (id) => {
    const newLayout = layout.map(w => w.id === id ? { ...w, fullWidth: !w.fullWidth } : w);
    saveLayout(newLayout);
  };

  // Fetch Calendar
  const loadCalendar = async () => {
    if (!googleAccessToken) return;
    setLoadingCal(true);
    try {
      const items = await fetchCalendarEvents(googleAccessToken);
      setEvents(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCal(false);
    }
  };

  // Fetch Task Lists & Tasks
  const loadTaskLists = async () => {
    if (!googleAccessToken) return;
    setLoadingTasks(true);
    try {
      const lists = await fetchTaskLists(googleAccessToken);
      setTaskLists(lists);
      if (lists.length > 0) {
        setSelectedList(lists[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadTasks = async (listId) => {
    if (!googleAccessToken || !listId) return;
    setLoadingTasks(true);
    try {
      const t = await fetchTasks(googleAccessToken, listId);
      setTasks(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      loadCalendar();
      loadTaskLists();
    }
  }, [googleAccessToken]);

  useEffect(() => {
    if (selectedList) {
      loadTasks(selectedList);
    }
  }, [selectedList]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedList) return;
    
    try {
      await addTask(googleAccessToken, selectedList, newTaskTitle);
      setNewTaskTitle('');
      loadTasks(selectedList); // Reload list
    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <div id="page-productivity" className="feature-page prod-page">
      <header className="feature-page__header">
        <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--warning)' }}>
          <CalendarCheck size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Productivity Hub</h1>
          <p className="feature-page__desc">Google Calendar, Tasks & LyfeCore Notes</p>
        </div>
      </header>

      {!googleAccessToken && (
        <div className="prod-page__alert glass-panel" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
          <AlertCircle size={20} />
          <span>You need to (re)sign-in with Google to grant access to Calendar and Tasks.</span>
        </div>
      )}

      {error && (
        <div className="prod-page__alert glass-panel" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="prod-page__grid">
        {layout.map((widgetConfig) => {
          const { id, fullWidth } = widgetConfig;
          const gridColumnStyle = fullWidth ? { gridColumn: '1 / -1' } : { gridColumn: 'auto' };

          const LayoutControls = () => (
            <div className="prod-widget__controls" style={{ display: 'flex', gap: '4px', position: 'absolute', top: '-10px', right: '10px', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', zIndex: 10 }}>
              <button title="Move Up" onClick={() => moveWidget(id, 'up')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ArrowUp size={14} /></button>
              <button title="Move Down" onClick={() => moveWidget(id, 'down')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ArrowDown size={14} /></button>
              <button title="Toggle Full Width" onClick={() => toggleSize(id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }}>
                {fullWidth ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          );

          if (id === 'calendar') {
            return (
              <section key={id} className="prod-widget glass-panel" style={{ position: 'relative', height: 'auto', minHeight: '350px', ...gridColumnStyle }}>
                <LayoutControls />
                <CalendarWidget events={events} onRefresh={loadCalendar} loading={loadingCal} />
              </section>
            );
          }

          if (id === 'tasks') {
            return (
              <section key={id} className="prod-widget glass-panel" style={{ position: 'relative', ...gridColumnStyle }}>
                <LayoutControls />
                <div className="prod-widget__header">
                  <h3><ListChecks size={18} /> Google Tasks</h3>
                  {taskLists.length > 0 && (
                    <select 
                      className="lyfe-select" 
                      value={selectedList} 
                      onChange={e => setSelectedList(e.target.value)}
                    >
                      {taskLists.map(list => (
                        <option key={list.id} value={list.id}>{list.title}</option>
                      ))}
                    </select>
                  )}
                  <button className="prod-widget__refresh" onClick={() => loadTasks(selectedList)} disabled={loadingTasks || !googleAccessToken}>
                    <RefreshCw size={14} className={loadingTasks ? 'spin' : ''} />
                  </button>
                </div>
                <div className="prod-widget__content">
                  {googleAccessToken && (
                   <form className="prod-widget__form" onSubmit={handleAddTask}>
                     <input 
                       type="text" 
                       placeholder="New task..." 
                       value={newTaskTitle}
                       onChange={e => setNewTaskTitle(e.target.value)}
                     />
                     <button type="submit" disabled={!newTaskTitle.trim()}><Plus size={16} /></button>
                   </form>
                  )}

                  {loadingTasks ? (
                    <p className="prod-widget__empty">Loading tasks...</p>
                  ) : tasks.length === 0 ? (
                    <p className="prod-widget__empty">All done! No pending tasks.</p>
                  ) : (
                    <ul className="prod-widget__list">
                      {tasks.map((task) => (
                        <li key={task.id} className="prod-widget__item prod-widget__item--task">
                         <div className="prod-widget__task-check"></div>
                         <span className="prod-widget__item-title">{task.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          }

          if (id === 'notes') {
            return (
              <section key={id} className="glass-panel" style={{ position: 'relative', height: 'auto', minHeight: '300px', ...gridColumnStyle }}>
                <LayoutControls />
                <NotesWidget />
              </section>
            );
          }
          return null;
        })}
      </div>

    </div>
  );
}
