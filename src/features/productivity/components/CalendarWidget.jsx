import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './CalendarWidget.css';

export default function CalendarWidget({ events, onRefresh, loading }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate grid cells
  let blanks = [];
  for (let i = 0; i < firstDay; i++) {
    blanks.push(<div key={`blank-${i}`} className="cal-cell cal-cell--empty"></div>);
  }

  let days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    // Find events for this specific day
    const dayEvents = events.filter(ev => {
      if (!ev.start) return false;
      const evDate = new Date(ev.start.dateTime || ev.start.date);
      return evDate.getUTCFullYear() === year && evDate.getUTCMonth() === month && evDate.getUTCDate() === d;
    });

    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    days.push(
      <div key={`day-${d}`} className={`cal-cell ${isToday ? 'cal-cell--today' : ''}`}>
        <span className="cal-day-num">{d}</span>
        <div className="cal-events">
          {dayEvents.map(e => (
            <div key={e.id} className="cal-event-badge" title={e.summary}>
              {e.summary}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalSlots = [...blanks, ...days];

  return (
    <div className="calendar-widget">
      <div className="cal-header">
        <div className="cal-title">
          <CalendarIcon size={18} />
          <h3>{monthName} {year}</h3>
        </div>
        <div className="cal-nav">
          <button onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
          <button onClick={handleNextMonth}><ChevronRight size={16} /></button>
          {onRefresh && (
             <button onClick={onRefresh} disabled={loading} className="cal-refresh" title="Force Sync">
               Sync
             </button>
          )}
        </div>
      </div>

      <div className="cal-grid">
        {weekDays.map(day => <div key={day} className="cal-weekday">{day}</div>)}
        {totalSlots}
      </div>
    </div>
  );
}
