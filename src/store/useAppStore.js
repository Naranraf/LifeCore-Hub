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

  // --- Actions ---
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
