import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useNotesStore — Advanced Notes Engine with Autosave.
 * Handles CRUD and Debounced Cloud Synchronization.
 */
const useNotesStore = create((set, get) => ({
  notes: [],
  loading: false,
  saving: false,
  unsubscribe: null,
  debounceTimer: null,

  /** Initialize Firestore listener */
  initListener: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Cleanup previous listener
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true });

    const q = query(
      collection(db, 'users', user.uid, 'notes')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          // Sort by Pinned status first, then by date
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      set({ notes, loading: false });
    }, (err) => {
      if (err.code === 'permission-denied') {
        console.warn('[Notes] Listener detached (Auth Transition)');
      } else {
        console.error('[Notes] Sync Error:', err);
        set({ loading: false });
      }
    });

    set({ unsubscribe });
  },

  /** Create a blank note */
  createNote: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const newNote = {
        title: '',
        content: '',
        color: 'var(--glass-border)',
        tags: [],
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      return docRef.id;
    } catch (err) {
      console.error('[Notes] Create Error:', err);
    }
  },

  /** 
   * Debounced Update — The core of TIER 3 UX.
   * Only writes to Firestore after the user stops typing.
   */
  updateNoteDebounced: (noteId, updates) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // 1. Update local state immediately for snappy UI
    set(state => ({
      notes: state.notes.map(n => n.id === noteId ? { ...n, ...updates, saving: true } : n),
      saving: true
    }));

    // 2. Clear existing timer
    if (get().debounceTimer) clearTimeout(get().debounceTimer);

    // 3. Set new timer for cloud sync (1.5s)
    const timer = setTimeout(async () => {
      try {
        const noteRef = doc(db, 'users', user.uid, 'notes', noteId);
        await updateDoc(noteRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        set({ saving: false });
        console.log(`[Notes] Autosaved note ${noteId}`);
      } catch (err) {
        console.error('[Notes] Autosave Error:', err);
        set({ saving: false });
      }
    }, 1500);

    set({ debounceTimer: timer });
  },

  /** Delete note */
  deleteNote: async (noteId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
    } catch (err) {
      console.error('[Notes] Delete Error:', err);
    }
  },

  cleanup: () => {
    if (get().unsubscribe) get().unsubscribe();
    if (get().debounceTimer) clearTimeout(get().debounceTimer);
  }
}));

export default useNotesStore;
