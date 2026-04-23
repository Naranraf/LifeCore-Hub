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

/**
 * useNutritionStore — Dedicated Nutrition & Macro Engine.
 */
const useNutritionStore = create((set, get) => ({
  logs: [],
  currentMacros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
  loading: true,
  error: null,
  unsubscribe: null,

  initListener: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true });

    const q = query(
      collection(db, 'health_logs'),
      where('ownerId', '==', user.uid)
    );

    const newUnsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const logsData = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        const today = new Date().toISOString().split('T')[0];
        const todayLogs = logsData.filter(l => l.date === today || l.createdAt?.startsWith(today));
        
        const newMacros = todayLogs.reduce((acc, log) => ({
          protein: parseFloat((acc.protein + (log.protein || 0)).toFixed(1)),
          carbs: parseFloat((acc.carbs + (log.carbs || 0)).toFixed(1)),
          fat: parseFloat((acc.fat + (log.fat || 0)).toFixed(1)),
          calories: acc.calories + (log.calories || 0),
        }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

        set({ logs: logsData, currentMacros: newMacros, loading: false });
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('[Nutrition] Listener detached (Auth Transition)');
        } else {
          console.error('[Nutrition] Error fetching logs:', error);
          set({ loading: false });
        }
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  addLog: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    try {
      set({ loading: true });
      const payload = {
        ...data,
        ownerId: user.uid,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'health_logs'), payload);
      set({ loading: false });
    } catch (err) {
      console.error('[Nutrition] Add log failed:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteLog: async (id) => {
    try {
      await deleteDoc(doc(db, 'health_logs', id));
    } catch (err) {
      console.error('[Nutrition] Delete failed:', err);
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ logs: [], unsubscribe: null });
  }
}));

export default useNutritionStore;
