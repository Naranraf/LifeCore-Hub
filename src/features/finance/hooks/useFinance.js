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
    savingGoal: 0,
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
  },

  getTelemetry: () => {
    const { transactions, goals } = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      if (t.type === 'income') {
        totalIncome += t.amount;
        if (isCurrentMonth) monthlyIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (isCurrentMonth) monthlyExpense += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const progress = goals.savingGoal > 0 ? (netBalance / goals.savingGoal) * 100 : 0;

    return {
      netBalance,
      monthlyCashflow: monthlyIncome - monthlyExpense,
      savingGoal: goals.savingGoal,
      progress: Math.min(Math.max(progress, 0), 100) // Clamp between 0-100
    };
  },

  getIntelligence: () => {
    const { transactions } = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Calculate Average Monthly Expenses (last 3 months or all if less)
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return { 
      runway: 0, 
      avgMonthlySpend: 0, 
      survivalRatio: 0, 
      lifestyleRatio: 0, 
      survivalSpend: 0, 
      lifestyleSpend: 0,
      monthlyIncome: 0
    };

    const monthGroups = {};
    expenses.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthGroups[key] = (monthGroups[key] || 0) + Number(t.amount);
    });

    const monthlyValues = Object.values(monthGroups);
    const avgMonthlySpend = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;

    // 2. Current Net Balance
    const netBalance = transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);

    // 3. Runway in Months
    const runway = avgMonthlySpend > 0 ? (netBalance / avgMonthlySpend).toFixed(1) : '∞';

    // 4. Survival vs Lifestyle (Current Month)
    let survivalSpend = 0;
    let lifestyleSpend = 0;
    let monthlyIncome = 0;

    const survivalCats = ['Housing & Utilities', 'Food & Survival', 'Debt & Obligations'];
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === 'income') {
          monthlyIncome += Number(t.amount);
        } else {
          if (survivalCats.includes(t.category)) {
            survivalSpend += Number(t.amount);
          } else {
            lifestyleSpend += Number(t.amount);
          }
        }
      }
    });

    const incomeBase = monthlyIncome || 1; // Prevent div by zero
    return {
      runway: Number(runway),
      avgMonthlySpend: Math.round(avgMonthlySpend),
      survivalRatio: Math.round((survivalSpend / incomeBase) * 100),
      lifestyleRatio: Math.round((lifestyleSpend / incomeBase) * 100),
      survivalSpend,
      lifestyleSpend,
      monthlyIncome
    };
  }
}));

export default useFinanceStore;
