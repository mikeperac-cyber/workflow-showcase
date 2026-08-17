import { useEffect, type DragEvent } from 'react'
import type { WorkflowNodeType } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { NODE_TYPE_META } from '../canvas/shared'

export const DND_MIME = 'application/wf-node'

const ITEMS: { type: WorkflowNodeType; label: string; key: string; shortcut: string }[] = [
  { type: 'start',     label: 'Start',     key: '1', shortcut: '1' },
  { type: 'task',      label: 'Step',      key: '2', shortcut: '2' },
  { type: 'decision',  label: 'Decision',  key: '3', shortcut: '3' },
  { type: 'end',       label: 'End',       key: '4', shortcut: '4' },
  { type: 'note',      label: 'Note',      key: '5', shortcut: '5' },
  { type: 'agent',     label: 'Agent',     key: '6', shortcut: '6' },
  { type: 'llm-model', label: 'LLM Model', key: '7', shortcut: '7' },
  { type: 'tool',      label: 'Tool',      key: '8', shortcut: '8' },
  { type: 'prompt',    label: 'Prompt',    key: '9', shortcut: '9' },
]

export function NodePalette() {
  const addNode = useWorkflowStore((s) => s.addNode)

  const onDragStart = (e: DragEvent, type: WorkflowNodeType) => {
    e.dataTransfer.setData(DND_MIME, type)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Keyboard shortcuts: press 1–9 to add the corresponding node type
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      const item = ITEMS.find((i) => i.shortcut === e.key)
      if (item) {
        e.preventDefault()
        addNode(item.type)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addNode])

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
          title={`Add ${item.label} node (shortcut: ${item.shortcut})`}
          className="flex cursor-grab items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium transition hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-gray-700"
        >
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                item.type === 'note' ? 'bg-yellow-400' : NODE_TYPE_META[item.type].accent
              }`}
            />
            {item.label}
          </span>
          <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {item.shortcut}
          </kbd>
        </button>
      ))}
      <p className="mt-2 text-xs leading-snug text-gray-400 dark:text-gray-500">
        Drag onto canvas, click, or press{' '}
        <kbd className="rounded border border-gray-300 bg-white px-1 font-mono dark:border-gray-600 dark:bg-gray-700">
          1
        </kbd>
        –
        <kbd className="rounded border border-gray-300 bg-white px-1 font-mono dark:border-gray-600 dark:bg-gray-700">
          9
        </kbd>
        . Connect via bottom handle.
      </p>
    </aside>
  )
}
