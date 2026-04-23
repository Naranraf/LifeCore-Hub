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
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

const useFinanceStore = create((set, get) => ({
  transactions: [],
  goals: {
    savingGoal: 10000,
    currentProgress: 0
  },
  currency: localStorage.getItem('lyfecore_currency') || 'USD',
  loading: true,
  error: null,
  unsubscribe: null,

  setCurrency: async (newCurrency) => {
    localStorage.setItem('lyfecore_currency', newCurrency);
    set({ currency: newCurrency });
    
    // Cloud sync logic
    const { user } = useAuthStore.getState();
    if (user) {
      try {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await setDoc(settingsRef, { currency: newCurrency }, { merge: true });
      } catch (err) {
        console.error('Failed to sync currency to cloud', err);
      }
    }
  },

  // Start listening to transactions for the currently authenticated user
  initListener: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // Cloud sync logic (currency and goals)
    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.currency) {
          localStorage.setItem('lyfecore_currency', data.currency);
          set({ currency: data.currency });
        }
        if (data.savingGoal) {
          set(state => ({ goals: { ...state.goals, savingGoal: data.savingGoal } }));
        }
      }
    } catch (err) {
      console.warn('[Finance] Cloud prefs sync skipped:', err.message);
    }

    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true, error: null });

    const q = query(
      collection(db, 'finance_transactions'),
      where('ownerId', '==', user.uid)
    );

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trxs = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc

        set({ transactions: trxs, loading: false });
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('[Finance] Listener detached (Auth Transition)');
        } else {
          console.error('[Finance] Error fetching transactions:', error);
          set({ error: error.message, loading: false });
        }
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  addTransaction: async (data) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    try {
      set({ loading: true });
      const payload = {
        ...data,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'finance_transactions'), payload);
      // Let the snapshot listener update the local state
      set({ loading: false });
    } catch (err) {
      console.error('[Finance] Add failed:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const trxRef = doc(db, 'finance_transactions', id);
      await setDoc(trxRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('[Finance] Update failed:', err);
    }
  },

  setGoal: async (amount) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      set(state => ({ goals: { ...state.goals, savingGoal: amount } }));
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, { savingGoal: amount }, { merge: true });
    } catch (err) {
      console.error('[Finance] Set Goal failed:', err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      set({ loading: true });
      await deleteDoc(doc(db, 'finance_transactions', id));
      set({ loading: false });
    } catch (err) {
      console.error('[Finance] Delete failed:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ transactions: [], unsubscribe: null });
  }
}));

export default useFinanceStore;
