/**
 * googleApi.js 
 * Connects directly to Google REST APIs using the OAuth token captured
 * during Firebase Google Sign-In.
 */

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

export async function fetchCalendarEvents(accessToken) {
  if (!accessToken) throw new Error("No Google Access Token available");

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const timeMin = oneMonthAgo.toISOString();

  // Fetch from primary calendar
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?timeMin=${timeMin}&maxResults=20&singleEvents=true&orderBy=startTime`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`Calendar API Error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function fetchTaskLists(accessToken) {
  if (!accessToken) throw new Error("No Google Access Token available");

  const res = await fetch(`${TASKS_API}/users/@me/lists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`Tasks API Error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function fetchTasks(accessToken, taskListId) {
  if (!accessToken) throw new Error("No Google Access Token available");

  const res = await fetch(`${TASKS_API}/lists/${taskListId}/tasks?showCompleted=false`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    throw new Error(`Tasks API Error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function addTask(accessToken, taskListId, title) {
  if (!accessToken) throw new Error("No Google Access Token available");

  const res = await fetch(`${TASKS_API}/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }) // Basic task creation
  });

  if (!res.ok) {
    throw new Error(`Tasks API Error: ${res.statusText}`);
  }

  return await res.json();
}
