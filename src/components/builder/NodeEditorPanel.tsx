import type { NodeMetric, WorkflowNodeData } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { NODE_TYPE_META, nodeColor } from '../canvas/shared'
import { ColorSwatches } from '../common/ColorSwatches'
import { PlusIcon, TrashIcon } from '../common/Icon'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900'

const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

export function NodeEditorPanel() {
  const node = useWorkflowStore((s) => {
    const wf = s.activeId ? s.workflows[s.activeId] : null
    return wf?.nodes.find((n) => n.selected) ?? null
  })
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const deleteNode = useWorkflowStore((s) => s.deleteNode)

  if (!node) {
    return (
      <aside className="flex w-72 shrink-0 items-center justify-center border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          Select a node to edit its content, metrics, and playback duration.
        </p>
      </aside>
    )
  }

  const { data } = node
  const meta = NODE_TYPE_META[data.nodeType]
  const update = (patch: Partial<WorkflowNodeData>) => updateNodeData(node.id, patch)
  const metrics = data.metrics ?? []

  const setMetric = (index: number, patch: Partial<NodeMetric>) => {
    update({ metrics: metrics.map((m, i) => (i === index ? { ...m, ...patch } : m)) })
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-white"
          style={{ backgroundColor: nodeColor(data) }}
        >
          {meta.label} NODE
        </span>
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          title="Delete node"
          className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
        >
          <TrashIcon />
        </button>
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-label">Label</label>
        <input
          id="ne-label"
          className={inputClass}
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-desc">Short description</label>
        <input
          id="ne-desc"
          className={inputClass}
          value={data.description ?? ''}
          placeholder="Shown on the node card"
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-details">Details</label>
        <textarea
          id="ne-details"
          className={`${inputClass} min-h-24 resize-y`}
          value={data.details ?? ''}
          placeholder="Long-form text for the showcase panel"
          onChange={(e) => update({ details: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-code">Code snippet</label>
        <textarea
          id="ne-code"
          className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
          value={data.codeSnippet ?? ''}
          spellCheck={false}
          onChange={(e) => update({ codeSnippet: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-image">Image URL</label>
        <input
          id="ne-image"
          className={inputClass}
          value={data.imageUrl ?? ''}
          placeholder="https://…"
          onChange={(e) => update({ imageUrl: e.target.value })}
        />
      </div>

      <div>
        <span className={labelClass}>Node color</span>
        <ColorSwatches
          value={data.color}
          onChange={(color) => update({ color })}
          defaultLabel="Type default"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="ne-duration">Playback dwell (ms)</label>
        <input
          id="ne-duration"
          type="number"
          min={200}
          step={100}
          className={inputClass}
          value={data.duration ?? 2000}
          onChange={(e) => {
            const value = Number.parseInt(e.target.value, 10)
            update({ duration: Number.isFinite(value) && value > 0 ? value : 2000 })
          }}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={labelClass.replace('mb-1 ', '')}>Metrics</span>
          <button
            type="button"
            onClick={() => update({ metrics: [...metrics, { label: '', value: '' }] })}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800"
          >
            <PlusIcon width={12} height={12} /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {metrics.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No metrics yet.</p>
          )}
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                className={`${inputClass} w-1/2`}
                value={m.label}
                placeholder="Label"
                onChange={(e) => setMetric(i, { label: e.target.value })}
              />
              <input
                className={`${inputClass} w-1/2`}
                value={m.value}
                placeholder="Value"
                onChange={(e) => setMetric(i, { value: e.target.value })}
              />
              <button
                type="button"
                title="Remove metric"
                onClick={() => update({ metrics: metrics.filter((_, j) => j !== i) })}
                className="shrink-0 rounded-md p-1 text-gray-400 transition hover:text-rose-600"
              >
                <TrashIcon width={13} height={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
