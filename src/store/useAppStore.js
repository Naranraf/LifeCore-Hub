import { create } from 'zustand'

/**
 * useAppStore - Central State Manager for SaaS Architecture
 * 
 * Purpose: Decouples business logic and UI state from individual components.
 * Structure: Optimized for multi-tenant scalability and neutral state management.
 */
export const useAppStore = create((set) => ({
  // --- User Session & Auth ---
  session: {
    user: null,
    loading: true,
    quota: {
      used: 0,
      limit: 15
    }
  },

  // --- UI State ---
  ui: {
    sidebarCollapsed: false,
    activeModals: [],
    theme: 'dark',
    isMusicOpen: false,
    isTimingOpen: false,
    activeMusicId: null
  },

  // --- Productivity/Timer State ---
  activeTimer: {
    isActive: false,
    remainingSeconds: 1500,
    currentPhase: 'focus' // focus, shortBreak, longBreak
  },

  // --- Health & Workout State ---
  activeWorkout: {
    isActive: false,
    startTime: null,
    title: 'New Session',
    exercises: [] // Array of { id, name, sets: [{ type, weight, reps, rpe, completed }] }
  },

  nutrition: {
    currentMacros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    dailyLogs: []
  },

  // --- Actions ---
  addNutritionLog: (log) => set((state) => {
    const newMacros = {
      protein: parseFloat((state.nutrition.currentMacros.protein + log.protein).toFixed(1)),
      carbs: parseFloat((state.nutrition.currentMacros.carbs + log.carbs).toFixed(1)),
      fat: parseFloat((state.nutrition.currentMacros.fat + log.fat).toFixed(1)),
      calories: state.nutrition.currentMacros.calories + log.calories,
    };
    return {
      nutrition: {
        currentMacros: newMacros,
        dailyLogs: [log, ...state.nutrition.dailyLogs]
      }
    };
  }),

  clearNutrition: () => set((state) => ({
    nutrition: {
      currentMacros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
      dailyLogs: []
    }
  })),

  setSession: (userData) => set((state) => ({ 
    session: { ...state.session, ...userData } 
  })),
  
  toggleSidebar: () => set((state) => ({ 
    ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } 
  })),

  toggleMusic: () => set((state) => ({
    ui: { ...state.ui, isMusicOpen: !state.ui.isMusicOpen }
  })),

  toggleTiming: () => set((state) => ({
    ui: { ...state.ui, isTimingOpen: !state.ui.isTimingOpen }
  })),

  setActiveMusicId: (id) => set((state) => ({
    ui: { ...state.ui, activeMusicId: id }
  })),

  // --- Workout Actions ---
  startWorkout: (title) => set((state) => ({
    activeWorkout: {
      isActive: true,
      startTime: Date.now(),
      title: title || 'New Session',
      exercises: []
    }
  })),

  finishWorkout: () => set((state) => ({
    activeWorkout: { isActive: false, startTime: null, title: 'New Session', exercises: [] }
  })),

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
  
  syncTimerState: (timerData) => set((state) => ({
    activeTimer: { ...state.activeTimer, ...timerData }
  })),

  setTimerActive: (active) => set((state) => ({ 
    activeTimer: { ...state.activeTimer, isActive: active } 
  })),
  
  updateTimerSeconds: (seconds) => set((state) => ({ 
    activeTimer: { ...state.activeTimer, remainingSeconds: seconds } 
  })),

  updateQuota: (usedCount) => set((state) => ({
    session: { 
      ...state.session, 
      quota: { ...state.session.quota, used: usedCount } 
    }
  }))
}))
