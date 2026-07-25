import type { EdgeArrow, EdgeLineStyle, WorkflowEdgeData } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { ColorSwatches } from '../common/ColorSwatches'
import { TrashIcon } from '../common/Icon'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900'

const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

function segmentedClass(active: boolean): string {
  return [
    'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition',
    active
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  ].join(' ')
}

function OptionGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={segmentedClass(value === o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-md px-1 py-1 text-sm"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

const LINE_STYLE_OPTIONS: { value: EdgeLineStyle; label: string }[] = [
  { value: 'smooth', label: 'Smooth' },
  { value: 'bezier', label: 'Bezier' },
  { value: 'straight', label: 'Straight' },
  { value: 'step', label: 'Step' },
]

const ARROW_OPTIONS: { value: EdgeArrow; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

export function EdgeEditorPanel() {
  const edge = useWorkflowStore((s) => {
    const wf = s.activeId ? s.workflows[s.activeId] : null
    return wf?.edges.find((e) => e.selected) ?? null
  })
  const updateEdge = useWorkflowStore((s) => s.updateEdge)
  const deleteEdge = useWorkflowStore((s) => s.deleteEdge)

  if (!edge) return null

  const d = (edge.data ?? {}) as WorkflowEdgeData
  const update = (patch: Parameters<typeof updateEdge>[1]) => updateEdge(edge.id, patch)

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="rounded bg-gray-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">
          EDGE
        </span>
        <button
          type="button"
          onClick={() => deleteEdge(edge.id)}
          title="Delete edge"
          className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
        >
          <TrashIcon />
        </button>
      </div>

      <div>
        <label className={labelClass} htmlFor="ee-label">Label</label>
        <input
          id="ee-label"
          className={inputClass}
          value={typeof edge.label === 'string' ? edge.label : ''}
          placeholder="e.g. approved"
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>

      <div>
        <span className={labelClass}>Line style</span>
        <OptionGroup
          options={LINE_STYLE_OPTIONS}
          value={d.lineStyle ?? 'smooth'}
          onChange={(lineStyle) => update({ lineStyle })}
        />
      </div>

      <div>
        <span className={labelClass}>Arrow head (end)</span>
        <OptionGroup
          options={ARROW_OPTIONS}
          value={d.arrowEnd ?? 'closed'}
          onChange={(arrowEnd) => update({ arrowEnd })}
        />
      </div>

      <div>
        <span className={labelClass}>Arrow head (start)</span>
        <OptionGroup
          options={ARROW_OPTIONS}
          value={d.arrowStart ?? 'none'}
          onChange={(arrowStart) => update({ arrowStart })}
        />
      </div>

      <div>
        <Toggle
          label="Animated"
          checked={edge.animated ?? false}
          onChange={(animated) => update({ animated })}
        />
        <Toggle
          label="Dashed"
          checked={d.dashed ?? false}
          onChange={(dashed) => update({ dashed })}
        />
      </div>

      <div>
        <span className={labelClass}>Color</span>
        <ColorSwatches
          value={d.color}
          onChange={(color) => update({ color })}
          defaultLabel="Auto"
        />
      </div>

      <p className="mt-auto text-xs leading-snug text-gray-400 dark:text-gray-500">
        Tip: click empty canvas to return to node editing.
      </p>
    </aside>
  )
}
