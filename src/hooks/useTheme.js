/**
 * useTheme Hook — Global Theme state manager.
 * 
 * Uses Zustand with persist middleware to save theming in localStorage.
 * Updates the documentElement [data-theme] attribute on change.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // default theme
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
      },
      toggleTheme: () => set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),
    }),
    {
      name: 'lyfecore-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);

// Fallback init for client hydration without triggering a React update cycle repeatedly
if (typeof document !== 'undefined') {
  const currentTheme = JSON.parse(localStorage.getItem('lyfecore-theme'))?.state?.theme || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

export default useThemeStore;
