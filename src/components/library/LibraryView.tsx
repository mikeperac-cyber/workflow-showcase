import { memo, useEffect, useMemo, useState } from 'react'
import type { Workflow } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { CopyIcon, EditIcon, PlusIcon, PresentIcon, TrashIcon, SparklesIcon } from '../common/Icon'
import { AiGenerateModal } from './AiGenerateModal'
import { generateMockAiWorkflow } from '../../utils/mockAiGenerate'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Left-border accent color keyed to workflow category. */
function categoryBorderColor(category?: string): string {
  if (category === 'ai')    return '#8b5cf6'  // violet
  if (category === 'productivity') return '#f97316' // orange
  if (category === 'business') return '#f59e0b' // amber
  if (category === 'student') return '#06b6d4' // cyan
  if (category === 'teacher') return '#ec4899' // pink
  if (category === 'ielts') return '#3b82f6'  // blue
  if (category === 'esl')   return '#10b981'  // emerald
  return '#64748b'                            // slate (custom)
}

/** Category pill label and color classes. */
function CategoryPill({ category }: { category?: string }) {
  if (!category) return null
  const label = category === 'ai' ? 'AI' : category === 'productivity' ? 'Productivity' : category === 'business' ? 'Business' : category === 'student' ? 'Student' : category === 'teacher' ? 'Teacher' : category === 'ielts' ? 'IELTS' : category === 'esl' ? 'ESL' : 'Custom'
  const cls =
    category === 'ai'
      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
      : category === 'productivity'
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
        : category === 'business'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          : category === 'student'
            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
            : category === 'teacher'
              ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
              : category === 'ielts'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : category === 'esl'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${cls}`}>
      {label}
    </span>
  )
}

const WorkflowCard = memo(function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const openBuilder = useWorkflowStore((s) => s.openBuilder)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const duplicateWorkflow = useWorkflowStore((s) => s.duplicateWorkflow)
  const deleteWorkflow = useWorkflowStore((s) => s.deleteWorkflow)

  return (
    <div
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      style={{ borderLeftWidth: 4, borderLeftColor: categoryBorderColor(workflow.category) }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{workflow.name}</h3>
        <CategoryPill category={workflow.category} />
      </div>
      <p className="mt-1 line-clamp-2 min-h-5 text-sm text-gray-500 dark:text-gray-400">
        {workflow.description || 'No description'}
      </p>
      {workflow.tags && workflow.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        {workflow.nodes.length} {workflow.nodes.length === 1 ? 'node' : 'nodes'} · updated{' '}
        {formatDate(workflow.updatedAt)}
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => openShowcase(workflow.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <PresentIcon /> Present
        </button>
        <button
          type="button"
          onClick={() => openBuilder(workflow.id)}
          title="Edit in builder"
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => duplicateWorkflow(workflow.id)}
          title="Duplicate"
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete "${workflow.name}"? This cannot be undone.`)) {
              deleteWorkflow(workflow.id)
            }
          }}
          title="Delete"
          className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-rose-900"
        >
          <TrashIcon />
        </button>
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your workflows</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Build an IELTS or ESL workflow, then present it as an animated walkthrough.
          </p>
        </div>
        <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <SparklesIcon /> Generate with AI
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <PlusIcon /> New workflow
            </button>
        </div>
      </div>

            {/* Search + Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name, description, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 min-w-56 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />

        {/* Multi-Dimensional Filters */}
        <select
            value={activeComplexity}
            onChange={e => setActiveComplexity(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
            <option value="">Complexity: All</option>
            <option value="Starter">Starter</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
        </select>

        <select
            value={activeTrigger}
            onChange={e => setActiveTrigger(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
            <option value="">Trigger: All</option>
            {availableTriggers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
            value={activeTool}
            onChange={e => setActiveTool(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
            <option value="">Tool: All</option>
            {availableTools.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Category Pills */}
      <div className="mb-5 flex flex-wrap gap-1">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveCategory(f.value as typeof activeCategory)}
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                activeCategory === f.value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          {sorted.length === 0 ? (
            <>
              <p className="text-gray-500 dark:text-gray-400">No workflows yet.</p>
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
            <p className="text-gray-500 dark:text-gray-400">
              No workflows match your search.{' '}
              <button
                type="button"
                onClick={clearFilters}
                className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                Clear filters
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}
      {showAiModal && <AiGenerateModal onClose={() => setShowAiModal(false)} onGenerate={handleAiGenerate} />}
    </div>
  )
}
