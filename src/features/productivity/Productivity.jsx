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
import { CalendarCheck, ListChecks, RefreshCw, AlertCircle, Plus, Check, ArrowUp, ArrowDown, Maximize2, Minimize2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import useAuthStore from '../../hooks/useAuth';
import NotesWidget from './components/NotesWidget';
import NativeCalendarWidget from './components/NativeCalendarWidget';
import NativeTasksWidget from './components/NativeTasksWidget';
import Card from '../../components/ui/Card';
import './Productivity.css';

export default function Productivity() {
  const { user } = useAuthStore();

  const defaultLayout = [
    { id: 'tasks', fullWidth: false },
    { id: 'calendar', fullWidth: false },
    { id: 'notes', fullWidth: false }
  ];
  
  /** Migration Helper: Ensures all mandatory widgets exist in the layout array. */
  const migrateLayout = (loaded) => {
    if (!Array.isArray(loaded)) return defaultLayout;
    const required = ['tasks', 'calendar', 'notes'];
    let updated = [...loaded];
    required.forEach(id => {
      if (!updated.find(w => w.id === id)) {
        updated.push({ id, fullWidth: false });
      }
    });
    return updated;
  };

  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('lyfe_prod_layout_v2');
      const loaded = saved ? JSON.parse(saved) : defaultLayout;
      return migrateLayout(loaded);
    } catch(e) { return defaultLayout; }
  });


  useEffect(() => {
    if (!user) return;
    const fetchLayout = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().productivityLayoutV2) {
          const cloudLayout = snap.data().productivityLayoutV2;
          const finalized = migrateLayout(cloudLayout);
          localStorage.setItem('lyfe_prod_layout_v2', JSON.stringify(finalized));
          setLayout(finalized);
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
              <Card key={id} className="prod-widget" style={{ position: 'relative', height: 'auto', minHeight: '350px', ...gridColumnStyle }}>
                <LayoutControls />
                <NativeCalendarWidget />
              </Card>
            );
          }

          if (id === 'tasks') {
            return (
              <Card key={id} style={{ position: 'relative', height: 'auto', ...gridColumnStyle }}>
                <LayoutControls />
                <div style={{ padding: '0px' }}>
                  <NativeTasksWidget />
                </div>
              </Card>
            );
          }

          if (id === 'notes') {
            return (
              <Card key={id} style={{ position: 'relative', height: 'auto', minHeight: '300px', ...gridColumnStyle }}>
                <LayoutControls />
                <NotesWidget />
              </Card>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
