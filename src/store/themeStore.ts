import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'contrast'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  toggleContrast: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleContrast: () => set((s) => ({ theme: s.theme === 'contrast' ? 'dark' : 'contrast' })),
    }),
    { name: 'wf-showcase-theme' },
  ),
)

/** Keeps the `dark` class on <html> in sync with the stored theme. Call once in App. */
export function useApplyTheme(): Theme {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('contrast', theme === 'contrast')
  }, [theme])
  return theme
}
