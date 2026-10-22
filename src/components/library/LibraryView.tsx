import { useState, useMemo, useEffect, memo } from 'react'
import type { Workflow } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { PlusIcon, SparklesIcon, TrashIcon, EditIcon, PresentIcon } from '../common/Icon'
import { AiGenerateModal } from './AiGenerateModal'
import { generateMockAiWorkflow } from '../../utils/mockAiGenerate'

/** Category badge style map */
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  ai: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-l-violet-500' },
  productivity: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-l-orange-500' },
  business: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-l-amber-500' },
  student: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-l-cyan-500' },
  teacher: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-l-pink-500' },
  ielts: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-l-blue-500' },
  esl: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-l-emerald-500' },
  custom: { bg: 'bg-gray-50 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-300', border: 'border-l-gray-400' },
}

const WorkflowCard = memo(function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const openBuilder = useWorkflowStore((s) => s.openBuilder)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const deleteWorkflow = useWorkflowStore((s) => s.deleteWorkflow)
  const duplicateWorkflow = useWorkflowStore((s) => s.duplicateWorkflow)

  const catStyle = CATEGORY_STYLES[workflow.category || 'custom'] || CATEGORY_STYLES.custom
  const dateStr = new Date(workflow.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-gray-200 border-l-4 ${catStyle.border} bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {workflow.name}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text}`}
        >
          {workflow.category || 'custom'}
        </span>
      </div>

      <p className="mb-4 flex-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {workflow.description || 'No description provided.'}
      </p>

      {/* Metadata Badges (Complexity, Trigger, Node count) */}
      <div className="mb-4 flex flex-wrap gap-1.5 text-[10px]">
        {workflow.complexity && (
          <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {workflow.complexity}
          </span>
        )}
        {workflow.trigger && (
          <span className="rounded bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            ⚡ {workflow.trigger}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {workflow.nodes.length} nodes
        </span>
      </div>

      {/* Tags */}
      {workflow.tags && workflow.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Updated {dateStr}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openShowcase(workflow.id)}
            title="Present"
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            <PresentIcon width={13} height={13} /> Present
          </button>
          <button
            type="button"
            onClick={() => openBuilder(workflow.id)}
            title="Edit"
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <EditIcon width={13} height={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => duplicateWorkflow(workflow.id)}
            title="Duplicate"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${workflow.name}"? This action cannot be undone.`)) {
                deleteWorkflow(workflow.id)
              }
            }}
            title="Delete"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
          >
            <TrashIcon width={14} height={14} />
          </button>
        </div>
      </div>
    </div>
  )
})

const CATEGORY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'AI', value: 'ai' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Business', value: 'business' },
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'ESL', value: 'esl' },
  { label: 'Custom', value: 'custom' },
] as const

export function LibraryView() {
  const workflows = useWorkflowStore((s) => s.workflows)
  const createWorkflow = useWorkflowStore((s) => s.createWorkflow)
  const openBuilder = useWorkflowStore((s) => s.openBuilder)

  const [isGuideBannerOpen, setIsGuideBannerOpen] = useState(true)

  // Initialize state from URL if present
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('q') || '')
  const [activeCategory, setActiveCategory] = useState<'' | 'ai' | 'ielts' | 'esl' | 'productivity' | 'business' | 'student' | 'teacher' | 'custom'>(() => {
    const c = new URLSearchParams(window.location.search).get('category')
    return (c as any) || ''
  })
  const [activeComplexity, setActiveComplexity] = useState(() => new URLSearchParams(window.location.search).get('complexity') || '')
  const [activeTrigger, setActiveTrigger] = useState(() => new URLSearchParams(window.location.search).get('trigger') || '')
  const [activeTool, setActiveTool] = useState(() => new URLSearchParams(window.location.search).get('tool') || '')

  const [showAiModal, setShowAiModal] = useState(false)

  // Sync state to URL
  useEffect(() => {
    const url = new URL(window.location.href)
    if (search) url.searchParams.set('q', search); else url.searchParams.delete('q')
    if (activeCategory) url.searchParams.set('category', activeCategory); else url.searchParams.delete('category')
    if (activeComplexity) url.searchParams.set('complexity', activeComplexity); else url.searchParams.delete('complexity')
    if (activeTrigger) url.searchParams.set('trigger', activeTrigger); else url.searchParams.delete('trigger')
    if (activeTool) url.searchParams.set('tool', activeTool); else url.searchParams.delete('tool')

    window.history.replaceState({}, '', url.toString())
  }, [search, activeCategory, activeComplexity, activeTrigger, activeTool])

  const sorted = useMemo(
    () => Object.values(workflows).sort((a, b) => b.updatedAt - a.updatedAt),
    [workflows],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return sorted.filter((wf) => {
      const matchesSearch =
        !q ||
        wf.name.toLowerCase().includes(q) ||
        wf.description.toLowerCase().includes(q) ||
        wf.tags?.some((t) => t.toLowerCase().includes(q))
      const matchesCategory = !activeCategory || wf.category === activeCategory || (!wf.category && activeCategory === 'custom')
      const matchesComplexity = !activeComplexity || (wf.complexity && wf.complexity.toLowerCase() === activeComplexity.toLowerCase())
      const matchesTrigger = !activeTrigger || (wf.trigger && wf.trigger.toLowerCase() === activeTrigger.toLowerCase())
      const matchesTool = !activeTool || (wf.tools && wf.tools.some(t => t.toLowerCase() === activeTool.toLowerCase()))

      return matchesSearch && matchesCategory && matchesComplexity && matchesTrigger && matchesTool
    })
  }, [sorted, search, activeCategory, activeComplexity, activeTrigger, activeTool])

  // Extract unique tools and triggers for dropdowns
  const availableTools = useMemo(() => {
    const tools = new Set<string>()
    sorted.forEach(w => w.tools?.forEach(t => tools.add(t)))
    return Array.from(tools).sort()
  }, [sorted])

  const availableTriggers = useMemo(() => {
    const triggers = new Set<string>()
    sorted.forEach(w => { if (w.trigger) triggers.add(w.trigger) })
    return Array.from(triggers).sort()
  }, [sorted])

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('')
    setActiveComplexity('')
    setActiveTrigger('')
    setActiveTool('')
  }

  const handleCreate = () => {
    const id = createWorkflow()
    openBuilder(id)
  }

  const handleAiGenerate = (prompt: string) => {
    const draft = generateMockAiWorkflow(prompt)
    const id = createWorkflow(draft)
    openBuilder(id)
  }

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Workflow Library</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Build and present visual walkthroughs for IELTS exam strategies, ESL lessons, and AI workflows.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700"
          >
            <SparklesIcon /> Generate with AI
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            <PlusIcon /> New workflow
          </button>
        </div>
      </div>

      {/* Quick Start Instructional Banner */}
      {isGuideBannerOpen && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white p-5 shadow-xs dark:border-blue-900/60 dark:from-blue-950/40 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                💡
              </span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                How EduFlow Works — Quick Start Instructions
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideBannerOpen(false)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Dismiss instruction banner"
            >
              ✕ Hide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            <div className="rounded-xl border border-blue-100 bg-white/80 p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-800/80">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">1. Pick or Generate a Template</span>
              Explore standard IELTS / ESL / AI templates below, or click <strong>Generate with AI</strong> to generate a custom workflow from a prompt.
            </div>

            <div className="rounded-xl border border-blue-100 bg-white/80 p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-800/80">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">2. Build &amp; Connect (Keys 1–9)</span>
              Drag nodes onto the canvas or press keys <strong>1–9</strong>. Connect handles to form execution paths, and set timing or IELTS band metrics in the editor.
            </div>

            <div className="rounded-xl border border-blue-100 bg-white/80 p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-800/80">
              <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">3. Present &amp; Share</span>
              Click <strong>Present</strong> to launch animated step-by-step mode with band score badges. Share instantly via URL hash or export high-res PNG / PDF blueprints.
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search workflows by name, description, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 min-w-64 flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />

        {/* Multi-Dimensional Filters */}
        <select
          value={activeComplexity}
          onChange={(e) => setActiveComplexity(e.target.value)}
          className="h-9 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Complexity: All</option>
          <option value="Starter">Starter</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={activeTrigger}
          onChange={(e) => setActiveTrigger(e.target.value)}
          className="h-9 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Trigger: All</option>
          {availableTriggers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={activeTool}
          onChange={(e) => setActiveTool(e.target.value)}
          className="h-9 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Tool: All</option>
          {availableTools.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveCategory(f.value as typeof activeCategory)}
            className={[
              'rounded-full px-3.5 py-1 text-xs font-semibold transition',
              activeCategory === f.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          {sorted.length === 0 ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">No workflows in your library yet.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <PlusIcon /> Create your first workflow
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No workflows match your search filters.{' '}
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                Clear all filters
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}
      {showAiModal && <AiGenerateModal onClose={() => setShowAiModal(false)} onGenerate={handleAiGenerate} />}
    </div>
  )
}
