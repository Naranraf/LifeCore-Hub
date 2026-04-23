import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useTaskStore — Global State for Productivity Tasks.
 * Handles CRUD and real-time sync with Firestore.
 */
const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  unsubscribe: null,

  /** Initialize Firestore listener for the current user's tasks. */
  initListener: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    
    // Cleanup previous listener
    if (get().unsubscribe) get().unsubscribe();

    const q = query(
      collection(db, 'productivity_tasks'),
      where('ownerId', '==', user.uid),
      where('status', 'in', ['pending', 'completed']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ tasks, loading: false });
    }, (err) => {
      console.error('[Tasks] Sync Error:', err);
      set({ error: err.message, loading: false });
    });

    set({ unsubscribe });
  },

  /** Add a new task to Firestore. */
  addTask: async (title, priority = 'medium') => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await addDoc(collection(db, 'productivity_tasks'), {
        ownerId: user.uid,
        title,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Tasks] Add Error:', err);
    }
  },

  /** Update task status or details. */
  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'productivity_tasks', taskId);
      await updateDoc(taskRef, updates);
    } catch (err) {
      console.error('[Tasks] Update Error:', err);
    }
  },

  /** Archive all completed tasks. */
  archiveCompleted: async () => {
    const completed = get().tasks.filter(t => t.status === 'completed');
    try {
      const promises = completed.map(t => 
        updateDoc(doc(db, 'productivity_tasks', t.id), { status: 'archived' })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error('[Tasks] Archive Error:', err);
    }
  },

  /** Delete a task permanently. */
  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'productivity_tasks', taskId));
    } catch (err) {
      console.error('[Tasks] Delete Error:', err);
    }
  },

  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe();
      set({ unsubscribe: null });
    }
  }
}));

export default useTaskStore;
