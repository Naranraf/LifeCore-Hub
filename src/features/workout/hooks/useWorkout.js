import { create } from 'zustand';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useWorkoutStore — Dedicated Training & Performance Engine.
 */
const useWorkoutStore = create((set, get) => ({
  activeWorkout: {
    isActive: false,
    startTime: null,
    title: 'New Session',
    exercises: [] // { id, name, sets: [{ type, weight, reps, rpe, completed }] }
  },
  recentSessions: [],
  loading: false,
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
      collection(db, 'workout_sessions'),
      where('ownerId', '==', user.uid)
    );

    const newUnsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const sessions = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // Sort desc

        set({ recentSessions: sessions, loading: false });
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('[Workout] Listener detached (Auth Transition)');
        } else {
          console.error('[Workout] Error fetching sessions:', error);
          set({ loading: false });
        }
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  startWorkout: (title) => set({
    activeWorkout: {
      isActive: true,
      startTime: Date.now(),
      title: title || 'New Session',
      exercises: []
    }
  }),

  finishWorkout: async () => {
    const { user } = useAuthStore.getState();
    const { activeWorkout } = get();
    if (!user || !activeWorkout.isActive) return;

    try {
      set({ loading: true });
      const payload = {
        ...activeWorkout,
        ownerId: user.uid,
        endTime: Date.now(),
        durationMs: Date.now() - activeWorkout.startTime
      };
      await addDoc(collection(db, 'workout_sessions'), payload);
      set({
        activeWorkout: { isActive: false, startTime: null, title: 'New Session', exercises: [] },
        loading: false
      });
    } catch (err) {
      console.error('[Workout] Finish session error:', err);
      set({ loading: false });
    }
  },

  addExercise: (exerciseName) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: [
        ...state.activeWorkout.exercises,
        { id: crypto.randomUUID(), name: exerciseName, sets: [] }
      ]
    }
  })),

  addSet: (exerciseId) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: state.activeWorkout.exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: [...ex.sets, { type: 'normal', weight: 0, reps: 0, rpe: 0, completed: false }] }
          : ex
      )
    }
  })),

  updateSet: (exerciseId, setIndex, data) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: state.activeWorkout.exercises.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              sets: ex.sets.map((s, idx) => idx === setIndex ? { ...s, ...data } : s) 
            }
          : ex
      )
    }
  })),

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
  }
}));

export default useWorkoutStore;
