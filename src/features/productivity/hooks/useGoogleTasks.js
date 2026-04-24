import { create } from 'zustand';
import { fetchTaskLists, fetchTasks, addTask as addGoogleTask } from '../../../services/googleApi';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useGoogleTasks — Global state for Google Tasks integration.
 */
const useGoogleTasks = create((set, get) => ({
  taskLists: [],
  activeListId: null,
  tasks: [],
  loading: false,
  error: null,

  init: async () => {
    const token = useAuthStore.getState().googleAccessToken;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const lists = await fetchTaskLists(token);
      set({ taskLists: lists });
      
      if (lists.length > 0) {
        const defaultList = lists[0].id;
        set({ activeListId: defaultList });
        await get().loadTasks(defaultList);
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  loadTasks: async (listId) => {
    const token = useAuthStore.getState().googleAccessToken;
    if (!token || !listId) return;

    set({ loading: true, error: null, activeListId: listId });
    try {
      const tasks = await fetchTasks(token, listId);
      set({ tasks: tasks || [] });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (title) => {
    const token = useAuthStore.getState().googleAccessToken;
    const listId = get().activeListId;
    if (!token || !listId || !title.trim()) return;

    try {
      const newTask = await addGoogleTask(token, listId, title);
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  /**
   * Toggle task completion on Google.
   */
  toggleTask: async (taskId, completed) => {
    const token = useAuthStore.getState().googleAccessToken;
    const listId = get().activeListId;
    if (!token || !listId) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: completed ? 'completed' : 'needsAction' } : t)
    }));

    try {
      const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: completed ? 'completed' : 'needsAction' })
      });
      if (!res.ok) throw new Error("Failed to update Google Task");
    } catch (err) {
      // Rollback on error
      get().loadTasks(listId);
      set({ error: err.message });
    }
  },

  deleteTask: async (taskId) => {
    const token = useAuthStore.getState().googleAccessToken;
    const listId = get().activeListId;
    if (!token || !listId) return;

    set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));

    try {
      const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error("Failed to delete Google Task");
    } catch (err) {
      get().loadTasks(listId);
      set({ error: err.message });
    }
  }
}));

export default useGoogleTasks;
