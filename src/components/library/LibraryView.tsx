import type { Workflow } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { CopyIcon, EditIcon, PlusIcon, PresentIcon, TrashIcon } from '../common/Icon'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const openBuilder = useWorkflowStore((s) => s.openBuilder)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const duplicateWorkflow = useWorkflowStore((s) => s.duplicateWorkflow)
  const deleteWorkflow = useWorkflowStore((s) => s.deleteWorkflow)

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <h3 className="font-semibold leading-snug">{workflow.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-5 text-sm text-gray-500 dark:text-gray-400">
        {workflow.description || 'No description'}
      </p>
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
}

export function LibraryView() {
  const workflows = useWorkflowStore((s) => s.workflows)
  const createWorkflow = useWorkflowStore((s) => s.createWorkflow)
  const openBuilder = useWorkflowStore((s) => s.openBuilder)

  const sorted = Object.values(workflows).sort((a, b) => b.updatedAt - a.updatedAt)

  const handleCreate = () => {
    const id = createWorkflow()
    openBuilder(id)
  }

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your workflows</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Build a workflow, then present it as an animated walkthrough.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <PlusIcon /> New workflow
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No workflows yet.</p>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <PlusIcon /> Create your first workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}
    </div>
  )
}
