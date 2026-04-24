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
import GoogleTasksWidget from './components/GoogleTasksWidget';
import './Productivity.css';

export default function Productivity() {
  const { googleAccessToken } = useAuthStore();
  
  const [events, setEvents] = useState([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [error, setError] = useState(null);

  const defaultLayout = [
    { id: 'tasks', fullWidth: true },
    { id: 'calendar', fullWidth: true },
    { id: 'notes', fullWidth: true }
  ];
  
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('lyfe_prod_layout_v2');
      const loaded = saved ? JSON.parse(saved) : defaultLayout;
      // Migration: Ensure 'tasks' exists in layout
      if (!loaded.find(w => w.id === 'tasks')) {
        return [{ id: 'tasks', fullWidth: true }, ...loaded];
      }
      return loaded;
    } catch(e) { return defaultLayout; }
  });

  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    const fetchLayout = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().productivityLayoutV2) {
          const cloudLayout = snap.data().productivityLayoutV2;
          localStorage.setItem('lyfe_prod_layout_v2', JSON.stringify(cloudLayout));
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
    localStorage.setItem('lyfe_prod_layout_v2', JSON.stringify(newLayout));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { productivityLayoutV2: newLayout }, { merge: true });
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

  useEffect(() => {
    if (googleAccessToken) {
      loadCalendar();
    }
  }, [googleAccessToken]);

  return (
    <div id="page-productivity" className="feature-page prod-page">
      <header className="feature-page__header">
        <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--warning)' }}>
          <CalendarCheck size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Productivity Hub</h1>
          <p className="feature-page__desc">Master your day with Native Tasks & Calendar</p>
        </div>
      </header>

      {/* Widgets are now dynamically rendered via layout map below */}

      {!googleAccessToken && (
        <div className="prod-page__alert glass-panel" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>Google Calendar is currently disconnected. Sign in to sync your schedule.</span>
        </div>
      )}

      {error && (
        <div className="prod-page__alert glass-panel" style={{ borderColor: 'var(--error)', color: 'var(--error)', marginBottom: '24px' }}>
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
              <section key={id} className="glass-panel" style={{ position: 'relative', height: 'auto', ...gridColumnStyle }}>
                <LayoutControls />
                <div style={{ padding: '24px' }}>
                  <GoogleTasksWidget />
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
