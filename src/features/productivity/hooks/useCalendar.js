import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useCalendarStore — Native Calendar State.
 * Handles CRUD and real-time sync with Firestore.
 */
const useCalendarStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  unsubscribe: null,

  /** Initialize Firestore listener for the current user's events. */
  initListener: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Cleanup previous listener
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true, error: null });
    
    const q = query(
      collection(db, 'productivity_events'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      
      set({ events, loading: false });
    }, (err) => {
      console.error('[Calendar] Sync Error:', err);
      set({ error: err.message, loading: false });
    });

    set({ unsubscribe });
  },

  /** Add a new event to Firestore. */
  addEvent: async (eventData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await addDoc(collection(db, 'productivity_events'), {
        ...eventData,
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Calendar] Add Error:', err);
    }
  },

  /** Update event details. */
  updateEvent: async (eventId, updates) => {
    try {
      const eventRef = doc(db, 'productivity_events', eventId);
      await updateDoc(eventRef, updates);
    } catch (err) {
      console.error('[Calendar] Update Error:', err);
    }
  },

  /** Delete an event. */
  deleteEvent: async (eventId) => {
    try {
      await deleteDoc(doc(db, 'productivity_events', eventId));
    } catch (err) {
      console.error('[Calendar] Delete Error:', err);
    }
  },

  cleanup: () => {
    if (get().unsubscribe) {
      get().unsubscribe();
      set({ unsubscribe: null });
    }
  }
}));

export default useCalendarStore;
