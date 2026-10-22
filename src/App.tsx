import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useWorkflowStore, useActiveWorkflow } from './store/workflowStore'
import { useApplyTheme } from './store/themeStore'
import { getSharedWorkflowFromLocation } from './utils/shareLink'
import { ThemeToggle } from './components/common/ThemeToggle'
import { HelpModal } from './components/common/HelpModal'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthControl } from './auth/AuthProvider'
import { EditIcon, PresentIcon } from './components/common/Icon'

const BuilderView = lazy(async () => ({ default: (await import('./components/builder/BuilderView')).BuilderView }))
const LibraryView = lazy(async () => ({ default: (await import('./components/library/LibraryView')).LibraryView }))
const ShowcaseView = lazy(async () => ({ default: (await import('./components/showcase/ShowcaseView')).ShowcaseView }))

function Header({ onOpenHelp }: { onOpenHelp: () => void }) {
  const view = useWorkflowStore((s) => s.view)
  const activeId = useWorkflowStore((s) => s.activeId)
  const goLibrary = useWorkflowStore((s) => s.goLibrary)
  const openBuilder = useWorkflowStore((s) => s.openBuilder)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const activeWorkflow = useActiveWorkflow()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Left section: Logo & Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-semibold overflow-hidden">
        <button
          type="button"
          onClick={goLibrary}
          title="Go to Library"
          className="flex items-center gap-2 font-bold tracking-tight transition hover:opacity-80"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 dark:text-blue-500"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="text-gray-900 dark:text-white">
            Edu<span className="text-blue-600 dark:text-blue-500">Flow</span>
          </span>
        </button>

        <span className="text-gray-300 dark:text-gray-700">/</span>

        {view === 'library' || !activeWorkflow ? (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Library</span>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={goLibrary}
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
              Library
            </button>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[180px] sm:max-w-[280px]">
              {activeWorkflow.name}
            </span>
          </div>
        )}
      </div>

      {/* Middle section: Mode Navigation Tabs (when workflow is active) */}
      {activeId && activeWorkflow && view !== 'library' && (
        <div className="hidden sm:flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => openBuilder(activeId)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              view === 'builder'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <EditIcon width={13} height={13} />
            Builder
          </button>
          <button
            type="button"
            onClick={() => openShowcase(activeId)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              view === 'showcase'
                ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <PresentIcon width={13} height={13} />
            Present
          </button>
        </div>
      )}

      {/* Right section: Help, Auth, Theme */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenHelp}
          title="Shortcuts & User Guide"
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
          </svg>
          <span className="hidden md:inline">Guide &amp; Shortcuts</span>
        </button>

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
  const [isHelpOpen, setIsHelpOpen] = useState(false)

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
      <Header onOpenHelp={() => setIsHelpOpen(true)} />
      <main className="min-h-0 flex-1">
        <ErrorBoundary name={view}>
          <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading {view}…</div>}>
            {view === 'library' && <LibraryView />}
            {view === 'builder' && <BuilderView />}
            {view === 'showcase' && <ShowcaseView />}
          </Suspense>
        </ErrorBoundary>
      </main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
