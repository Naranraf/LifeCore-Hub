import { create } from 'zustand';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

const useHealthStore = create((set, get) => ({
  logs: [],
  loading: true,
  error: null,
  unsubscribe: null,

  // Start listening to health logs for the currently authenticated user
  initListener: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated', loading: false });
      return;
    }

    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();

    set({ loading: true, error: null });

    const q = query(
      collection(db, 'health_logs'),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        set({ logs: logsData, loading: false });
      },
      (error) => {
        console.error('[Health] Error fetching logs:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe: newUnsubscribe });
    return newUnsubscribe;
  },

  addLog: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    try {
      set({ loading: true });
      const payload = {
        ...data,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'health_logs'), payload);
      set({ loading: false });
    } catch (err) {
      console.error('[Health] Add log failed:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteLog: async (id) => {
    try {
      set({ loading: true });
      await deleteDoc(doc(db, 'health_logs', id));
      set({ loading: false });
    } catch (err) {
      console.error('[Health] Delete failed:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ logs: [], unsubscribe: null });
  }
}));

export default useHealthStore;
