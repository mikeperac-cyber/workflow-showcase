import type { DragEvent } from 'react'
import type { WorkflowNodeType } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { NODE_TYPE_META } from '../canvas/shared'

export const DND_MIME = 'application/wf-node'

const ITEMS: { type: WorkflowNodeType; label: string }[] = [
  { type: 'start', label: 'Start' },
  { type: 'task', label: 'Step' },
  { type: 'decision', label: 'Decision' },
  { type: 'end', label: 'End' },
]

export function NodePalette() {
  const addNode = useWorkflowStore((s) => s.addNode)

  const onDragStart = (e: DragEvent, type: WorkflowNodeType) => {
    e.dataTransfer.setData(DND_MIME, type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="flex w-44 shrink-0 flex-col gap-2 border-r border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Add nodes
      </h2>
      {ITEMS.map((item) => (
        <button
          key={item.type}
          type="button"
          draggable
          onDragStart={(e) => onDragStart(e, item.type)}
          onClick={() => addNode(item.type)}
          className="flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium transition hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-gray-700"
        >
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${NODE_TYPE_META[item.type].accent}`} />
          {item.label}
        </button>
      ))}
      <p className="mt-2 text-xs leading-snug text-gray-400 dark:text-gray-500">
        Drag onto the canvas or click to add. Drag from a node's bottom handle to connect.
      </p>
    </aside>
  )
}
