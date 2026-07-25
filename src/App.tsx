import { useEffect } from 'react'
import { useWorkflowStore } from './store/workflowStore'
import { useApplyTheme } from './store/themeStore'
import { getSharedWorkflowFromLocation } from './utils/shareLink'
import { BuilderView } from './components/builder/BuilderView'
import { LibraryView } from './components/library/LibraryView'
import { ShowcaseView } from './components/showcase/ShowcaseView'
import { ThemeToggle } from './components/common/ThemeToggle'

function Header() {
  const view = useWorkflowStore((s) => s.view)
  const goLibrary = useWorkflowStore((s) => s.goLibrary)

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={goLibrary}
        className="flex items-center gap-2 text-sm font-bold tracking-tight transition hover:opacity-70"
      >
        <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
        Workflow Showcase
      </button>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {view === 'library' ? 'Library' : view === 'builder' ? 'Builder' : 'Showcase'}
      </span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}

export default function App() {
  useApplyTheme()
  const view = useWorkflowStore((s) => s.view)

  // Open shared workflows (#w=...) straight into showcase mode.
  // Handles both cold loads and hash changes while the app is already open.
  useEffect(() => {
    const importFromHash = () => {
      const shared = getSharedWorkflowFromLocation()
      if (!shared) return
      const { importWorkflow, openShowcase } = useWorkflowStore.getState()
      const id = importWorkflow(shared)
      openShowcase(id)
    }
    importFromHash()
    window.addEventListener('hashchange', importFromHash)
    return () => window.removeEventListener('hashchange', importFromHash)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1">
        {view === 'library' && <LibraryView />}
        {view === 'builder' && <BuilderView />}
        {view === 'showcase' && <ShowcaseView />}
      </main>
    </div>
  )
}
