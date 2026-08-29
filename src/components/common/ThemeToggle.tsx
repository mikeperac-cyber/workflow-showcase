import { useThemeStore } from '../../store/themeStore'
import { MoonIcon, SunIcon } from './Icon'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const toggleContrast = useThemeStore((s) => s.toggleContrast)

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={theme === 'contrast'}
        title={theme === 'contrast' ? 'Leave high contrast mode' : 'Use high contrast mode'}
        className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        HC
      </button>
    </div>
  )
}
