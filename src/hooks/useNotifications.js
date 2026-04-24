import { useEffect, useRef } from 'react';
import useTaskStore from '../features/productivity/hooks/useTasks';
import useCalendarStore from '../features/productivity/hooks/useCalendar';

/**
 * useNotifications — Global Watchdog for Tasks and Calendar events.
 * 
 * Features:
 * - Requests browser notification permission.
 * - Monitors tasks with due dates.
 * - Monitors upcoming calendar events.
 * - Triggers native browser notifications.
 */
export default function useNotifications() {
  const { tasks } = useTaskStore();
  const { events } = useCalendarStore();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      // Check Tasks
      tasks.forEach(task => {
        if (task.status === 'completed' || notifiedRef.current.has(task.id)) return;
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (dueDate > now && dueDate <= tenMinutesFromNow) {
            triggerNotification(`Task Reminder: ${task.title}`, {
              body: `Due soon: ${dueDate.toLocaleTimeString()}`,
              icon: '/logo192.png'
            });
            notifiedRef.current.add(task.id);
          }
        }
      });

      // Check Calendar Events
      events.forEach(event => {
        if (notifiedRef.current.has(event.id)) return;
        const startTime = new Date(event.start);
        if (startTime > now && startTime <= tenMinutesFromNow) {
          triggerNotification(`Upcoming Event: ${event.title}`, {
            body: `Starting at ${startTime.toLocaleTimeString()}`,
            icon: '/logo192.png'
          });
          notifiedRef.current.add(event.id);
        }
      });
    };

    const triggerNotification = (title, options) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
      }
    };

    const interval = setInterval(checkSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, events]);

  return null;
}
