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
    if (!user) {
      set({ error: 'User not authenticated', loading: false });
      return;
    }

    // Try picking up cloud currency preference first
    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists() && settingsSnap.data().currency) {
        const cloudCurrency = settingsSnap.data().currency;
        localStorage.setItem('lyfecore_currency', cloudCurrency);
        set({ currency: cloudCurrency });
      }
    } catch(err) {
      console.warn('Could not fetch cloud currency pref', err);
    }

    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();

    set({ loading: true, error: null });

    const q = query(
      collection(db, 'finance_transactions'),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trxs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        set({ transactions: trxs, loading: false });
      },
      (error) => {
        console.error('[Finance] Error fetching transactions:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe: newUnsubscribe });
    return newUnsubscribe;
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
