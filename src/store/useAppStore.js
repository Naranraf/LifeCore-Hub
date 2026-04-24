import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useAppStore - Central State Manager for SaaS Architecture
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
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
        isVisualsOpen: false,
        activeMusicId: null,
        showBackground: true,
        auroraMode: 'context', // context, rainbow
        cursor: {
          enabled: true,
          mode: 'target', // splash, target
          color: '#F97316'
        },
        accentColor: '#F97316'
      },

      setTheme: (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme);
        set((state) => ({
          ui: { ...state.ui, theme: newTheme }
        }));
      },

      setAccentColor: (color) => set((state) => ({
        ui: { ...state.ui, accentColor: color }
      })),

      setCursorConfig: (config) => set((state) => ({
        ui: { ...state.ui, cursor: { ...state.ui.cursor, ...config } }
      })),

      setBackgroundEnabled: (enabled) => set((state) => ({
        ui: { ...state.ui, showBackground: enabled }
      })),

      setAuroraMode: (mode) => set((state) => ({
        ui: { ...state.ui, auroraMode: mode }
      })),

      toggleVisuals: () => set((state) => ({
        ui: { ...state.ui, isVisualsOpen: !state.ui.isVisualsOpen }
      })),

      setVisualsOpen: (isOpen) => set((state) => ({
        ui: { ...state.ui, isVisualsOpen: isOpen }
      })),

      // --- Productivity/Timer State ---
      activeTimer: {
        isActive: false,
        remainingSeconds: 1500,
        currentPhase: 'focus' // focus, shortBreak, longBreak
      },

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
      })),

      hardResetApp: () => {
        localStorage.clear();
        window.location.reload();
      }
    }),
    {
      name: 'lyfecore-app-storage',
      partialize: (state) => ({ ui: { ...state.ui } }), // Only persist UI prefs
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.ui.theme);
        }
      }
    }
  )
)
