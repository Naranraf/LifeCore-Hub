/**
 * Productivity Page — Stub for Productivity Hub module.
 * Will include task lists, calendar, and study/work notes.
 */
import React, { useState, useEffect } from 'react';
import { CalendarCheck, ListChecks, StickyNote, RefreshCw, AlertCircle, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../hooks/useAuth';
import { fetchCalendarEvents, fetchTaskLists, fetchTasks, addTask } from '../../services/googleApi';
import NotesWidget from './components/NotesWidget';
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
    <div className="feature-page prod-page">
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
        {/* Calendar Widget */}
        <section className="prod-widget glass-panel">
          <div className="prod-widget__header">
            <h3><CalendarCheck size={18} /> Google Calendar</h3>
            <button className="prod-widget__refresh" onClick={loadCalendar} disabled={loadingCal || !googleAccessToken}>
              <RefreshCw size={14} className={loadingCal ? 'spin' : ''} />
            </button>
          </div>
          <div className="prod-widget__content">
            {loadingCal ? (
              <p className="prod-widget__empty">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="prod-widget__empty">No upcoming events found.</p>
            ) : (
              <ul className="prod-widget__list">
                {events.map((ev) => (
                  <li key={ev.id} className="prod-widget__item">
                    <span className="prod-widget__item-title">{ev.summary}</span>
                    <span className="prod-widget__item-time">
                      {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleDateString() : 'All day'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Tasks Widget */}
        <section className="prod-widget glass-panel">
          <div className="prod-widget__header">
            <h3><ListChecks size={18} /> Google Tasks</h3>
            {taskLists.length > 0 && (
              <select 
                className="prod-widget__select" 
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

        {/* Local Notes (Keep Alternative) */}
        <section className="glass-panel" style={{ gridColumn: '1 / -1', height: 'auto', minHeight: '300px' }}>
          <NotesWidget />
        </section>
      </div>

    </div>
  );
}
