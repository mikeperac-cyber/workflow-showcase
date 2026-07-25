import type { Workflow, WorkflowNode } from '../../types/workflow'
import { NODE_TYPE_META } from '../canvas/shared'
import { PlayIcon } from '../common/Icon'

interface Props {
  workflow: Workflow
  node: WorkflowNode | null
  stepIndex: number
  stepCount: number
  onPlay: () => void
}

export function NodeDetailPanel({ workflow, node, stepIndex, stepCount, onPlay }: Props) {
  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center gap-4 border-l border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-bold">{workflow.name}</h2>
          {workflow.description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onPlay}
          disabled={stepCount === 0}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          <PlayIcon /> Start walkthrough
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {stepCount} {stepCount === 1 ? 'step' : 'steps'} in this workflow
        </p>
      </aside>
    )
  }

  const meta = NODE_TYPE_META[node.data.nodeType]
  const metrics = node.data.metrics?.filter((m) => m.label || m.value) ?? []

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-white ${meta.accent}`}>
          {meta.label}
        </span>
        <span className="text-xs font-medium tabular-nums text-gray-400 dark:text-gray-500">
          {stepIndex + 1} / {stepCount}
        </span>
      </div>

      <div>
        <h2 className="text-lg font-bold leading-tight">{node.data.label}</h2>
        {node.data.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{node.data.description}</p>
        )}
      </div>

      {node.data.details && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {node.data.details}
        </p>
      )}

      {node.data.imageUrl && (
        <img
          src={node.data.imageUrl}
          alt={node.data.label}
          className="w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
        />
      )}

      {node.data.codeSnippet && (
        <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs leading-relaxed text-gray-800 dark:bg-gray-950 dark:text-gray-200">
          <code>{node.data.codeSnippet}</code>
        </pre>
      )}

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">{m.label}</div>
              <div className="text-sm font-bold">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
