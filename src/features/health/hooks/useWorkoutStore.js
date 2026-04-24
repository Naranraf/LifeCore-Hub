import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workout Engine 2.0 Store
 * Isolated state management for the high-performance training module.
 * Uses atomic mutations for nested state integrity.
 */
const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      templates: [],
      activeWorkout: null,
      history: [],
      status: 'idle', // 'idle' | 'active' | 'paused'

      // --- PASO 2: Mutadores Atómicos ---

      /**
       * Saves a new workout template or updates an existing one.
       * @param {Object} templateObj - The template structure.
       */
      saveTemplate: (templateObj) => {
        set((state) => {
          const id = templateObj.id || crypto.randomUUID();
          const existingIndex = state.templates.findIndex(t => t.id === id);
          
          const newTemplates = [...state.templates];
          if (existingIndex >= 0) {
            newTemplates[existingIndex] = { ...templateObj, id };
          } else {
            newTemplates.push({ ...templateObj, id });
          }
          
          return { templates: newTemplates };
        });
      },

      /**
       * Starts a workout session from a template.
       * Deep copies the template to avoid side effects.
       * @param {string} templateId 
       */
      startWorkout: (templateId) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === templateId);
        if (!template) return;

        // Create a deep copy for the active session
        const session = JSON.parse(JSON.stringify(template));
        session.startedAt = Date.now();

        set({
          activeWorkout: session,
          status: 'active'
        });
      },

      /**
       * Inmutable update of a specific set within the active session.
       * @param {string} exerciseId 
       * @param {string} setId 
       * @param {string} field - weight, reps, or rpe
       * @param {any} value 
       */
      updateActiveSet: (exerciseId, setId, field, value) => {
        set((state) => {
          if (!state.activeWorkout) return state;

          const updatedExercises = state.activeWorkout.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;

            const updatedSets = ex.sets.map((s) => {
              if (s.id !== setId) return s;
              return { ...s, [field]: value };
            });

            return { ...ex, sets: updatedSets };
          });

          return {
            activeWorkout: { ...state.activeWorkout, exercises: updatedExercises }
          };
        });
      },

      /**
       * Finalizes the active session, moves it to history, and resets state.
       */
      finishWorkout: () => {
        set((state) => {
          if (!state.activeWorkout) return state;

          const sessionResult = {
            ...state.activeWorkout,
            id: crypto.randomUUID(), // Unique ID for history entry
            finishedAt: Date.now(),
            durationMs: Date.now() - state.activeWorkout.startedAt
          };

          return {
            history: [sessionResult, ...state.history],
            activeWorkout: null,
            status: 'idle'
          };
        });
      },

      /**
       * Resets the entire workout state (emergency or debug use).
       */
      resetWorkoutState: () => set({
        activeWorkout: null,
        status: 'idle',
        templates: [],
        history: []
      })
    }),
    {
      name: 'lyfecore-workout-v2-storage'
    }
  )
);

export default useWorkoutStore;
