import { lazy, Suspense, useEffect, useRef } from 'react'
import { useWorkflowStore } from './store/workflowStore'
import { useApplyTheme } from './store/themeStore'
import { getSharedWorkflowFromLocation } from './utils/shareLink'
import { ThemeToggle } from './components/common/ThemeToggle'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthControl } from './auth/AuthProvider'

const BuilderView = lazy(async () => ({ default: (await import('./components/builder/BuilderView')).BuilderView }))
const LibraryView = lazy(async () => ({ default: (await import('./components/library/LibraryView')).LibraryView }))
const ShowcaseView = lazy(async () => ({ default: (await import('./components/showcase/ShowcaseView')).ShowcaseView }))

function Header() {
  const view = useWorkflowStore((s) => s.view)
  const goLibrary = useWorkflowStore((s) => s.goLibrary)

  const viewLabel =
    view === 'library' ? 'Library' : view === 'builder' ? 'Builder' : 'Showcase'

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={goLibrary}
        className="flex items-center gap-2 text-sm font-bold tracking-tight transition hover:opacity-70"
      >
        {/* Stacked book / graduation icon composed from simple shapes */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600"
          aria-hidden="true"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span>
          Edu<span className="text-blue-600">Flow</span>
        </span>
      </button>
      <span className="text-xs text-gray-400 dark:text-gray-500">{viewLabel}</span>
      {view === 'library' && (
        <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:inline">
          · IELTS &amp; ESL Workflow Builder
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <AuthControl />
        <ThemeToggle />
      </div>
    </header>
  )
}

export default function App() {
  useApplyTheme()
  const view = useWorkflowStore((s) => s.view)
  const importedHash = useRef<string | null>(null)

  // Open shared workflows (#w=...) straight into showcase mode.
  // Handles both cold loads and hash changes while the app is already open.
  useEffect(() => {
    const importFromHash = () => {
      const hash = window.location.hash
      if (hash === importedHash.current) return
      importedHash.current = hash
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
        <ErrorBoundary name={view}>
          <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading {view}…</div>}>
            {view === 'library' && <LibraryView />}
            {view === 'builder' && <BuilderView />}
            {view === 'showcase' && <ShowcaseView />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
