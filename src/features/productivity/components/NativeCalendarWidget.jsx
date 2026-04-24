import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  X,
  Clock
} from 'lucide-react';
import useCalendarStore from '../hooks/useCalendar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import './CalendarWidget.css';

/**
 * NativeCalendarWidget — Professional Tactical Orchestrator.
 * Powered by FullCalendar for enterprise-grade scheduling.
 */
export default function NativeCalendarWidget() {
  const { events, loading, initListener, addEvent, updateEvent, deleteEvent, cleanup } = useCalendarStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('12:00');

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowAddModal(true);
  };

  const handleEventClick = (arg) => {
    if (window.confirm(`Delete event: ${arg.event.title}?`)) {
      deleteEvent(arg.event.id);
    }
  };

  const handleEventDrop = async (arg) => {
    await updateEvent(arg.event.id, {
      start: arg.event.startStr,
      end: arg.event.endStr || null
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !selectedDate) return;

    const start = new Date(selectedDate);
    const [hours, minutes] = eventTime.split(':');
    start.setHours(hours, minutes);

    await addEvent({
      title: eventTitle,
      start: start.toISOString(),
      allDay: false
    });

    setShowAddModal(false);
    setEventTitle('');
  };

  // Format events for FullCalendar
  const calendarEvents = events.map(ev => ({
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay,
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    textColor: '#fff'
  }));

  return (
    <div id="widget-calendar-full" className="calendar-widget-v2">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        height="auto"
        themeSystem="standard"
      />

      {showAddModal && (
        <div className="cal-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Card style={{ width: '100%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="stats-number" style={{ fontSize: '14px', margin: 0 }}>NEW DEPLOYMENT</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>DATE: <span className="stats-number">{selectedDate}</span></div>
              <input 
                type="text" 
                placeholder="Mission Title" 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                autoFocus
                className="cal-input"
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              />
              <input 
                type="time" 
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="cal-input"
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              />
              <Button type="submit" variant="primary" fullWidth>Confirm Schedule</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
