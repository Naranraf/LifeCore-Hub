import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useWorkoutStore — Dedicated Training & Performance Engine 2.0.
 */
const useWorkoutStore = create((set, get) => ({
  activeWorkout: {
    isActive: false,
    startTime: null,
    title: 'New Session',
    exercises: [] // { id, name, sets: [{ type, weight, reps, rpe, completed }] }
  },
  recentSessions: [],
  templates: [],
  loading: false,
  unsubscribe: null,
  templateUnsubscribe: null,
  activeTimer: {
    id: null,
    key: 0,
    duration: 90
  },

  setRestTimer: (exerciseId, duration) => set(state => ({
    activeTimer: {
      id: exerciseId,
      key: state.activeTimer.key + 1,
      duration: duration || 90
    }
  })),

  clearRestTimer: () => set({
    activeTimer: { id: null, key: 0, duration: 90 }
  }),

  initListener: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { unsubscribe, templateUnsubscribe } = get();
    
    // History Listener
    if (!unsubscribe) {
      const q = query(
        collection(db, 'workout_history'),
        where('ownerId', '==', user.uid)
      );

      const newUnsubscribe = onSnapshot(q, (snapshot) => {
        const sessions = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
        set({ recentSessions: sessions, loading: false });
      }, (error) => {
        console.error('[Workout] History listener error:', error);
        set({ loading: false });
      });
      set({ unsubscribe: newUnsubscribe });
    }

    // Templates Listener
    if (!templateUnsubscribe) {
      const tq = query(
        collection(db, 'workout_templates'),
        where('ownerId', '==', user.uid)
      );

      const newTUnsubscribe = onSnapshot(tq, (snapshot) => {
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ templates });
      }, (error) => {
        console.error('[Workout] Template listener error:', error);
      });
      set({ templateUnsubscribe: newTUnsubscribe });
    }
  },

  // --- Session Management ---
  startWorkout: (title) => set({
    activeWorkout: {
      isActive: true,
      startTime: Date.now(),
      title: title || 'New Session',
      exercises: []
    }
  }),

  loadSessionFromTemplate: (templateId) => {
    const { templates } = get();
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    set({
      activeWorkout: {
        isActive: true,
        startTime: Date.now(),
        title: template.name,
        templateId: template.id,
        exercises: (template.exercises || []).map(ex => ({
          id: Math.random().toString(36).substr(2, 9),
          name: ex.name,
          restTimer: ex.restTimer || 90,
          repsType: ex.repsType || 'fixed',
          targetRpe: ex.targetRpe || 8,
          sets: Array.from({ length: Math.min(ex.targetSets || 1, 50) }, () => ({
            type: 'normal', 
            weight: ex.targetWeight || 0, 
            reps: ex.repsType === 'range' ? ex.targetRepsMax || 12 : ex.targetReps || 12, 
            rpe: 0, 
            completed: false
          }))
        }))
      }
    });
  },

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
      await addDoc(collection(db, 'workout_history'), payload);
      set({
        activeWorkout: { isActive: false, startTime: null, title: 'New Session', exercises: [] },
        loading: false
      });
    } catch (err) {
      console.error('[Workout] Finish session error:', err);
      set({ loading: false });
    }
  },

  cancelWorkout: () => set({
    activeWorkout: { isActive: false, startTime: null, title: 'New Session', exercises: [] }
  }),

  // --- Template Management ---
  addTemplate: async (template) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await addDoc(collection(db, 'workout_templates'), {
        ...template,
        ownerId: user.uid,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error('[Workout] Add template error:', err);
    }
  },

  updateTemplate: async (id, data) => {
    try {
      const templateRef = doc(db, 'workout_templates', id);
      await updateDoc(templateRef, { ...data, updatedAt: Date.now() });
    } catch (err) {
      console.error('[Workout] Update template error:', err);
    }
  },

  deleteTemplate: async (id) => {
    try {
      await deleteDoc(doc(db, 'workout_templates', id));
    } catch (err) {
      console.error('[Workout] Delete template error:', err);
    }
  },

  // --- Active Exercise Actions ---
  addExercise: (exerciseName) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: [
        ...state.activeWorkout.exercises,
        { 
          id: Math.random().toString(36).substr(2, 9), 
          name: exerciseName, 
          restTimer: 90,
          sets: [{ type: 'normal', weight: 0, reps: 0, rpe: 0, completed: false }] 
        }
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
              sets: ex.sets.map((s, idx) => {
                if (idx !== setIndex) return s;
                // Safety: Convert NaN to 0 for numeric fields
                const sanitized = { ...data };
                if ('weight' in sanitized && isNaN(sanitized.weight)) sanitized.weight = 0;
                if ('reps' in sanitized && isNaN(sanitized.reps)) sanitized.reps = 0;
                return { ...s, ...sanitized };
              }) 
            }
          : ex
      )
    }
  })),

  removeExercise: (exerciseId) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: state.activeWorkout.exercises.filter(ex => ex.id !== exerciseId)
    }
  })),

  removeSet: (exerciseId, setIndex) => set((state) => ({
    activeWorkout: {
      ...state.activeWorkout,
      exercises: state.activeWorkout.exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
          : ex
      )
    }
  })),

  cleanup: () => {
    const { unsubscribe, templateUnsubscribe } = get();
    if (unsubscribe) unsubscribe();
    if (templateUnsubscribe) templateUnsubscribe();
    set({ unsubscribe: null, templateUnsubscribe: null });
  }
}));

export default useWorkoutStore;
