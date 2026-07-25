import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { WorkflowNode } from '../../types/workflow'
import { NODE_TYPE_META } from './shared'

/**
 * Single custom node component for all workflow node types.
 * Visual differences (color, shape) are driven by data.nodeType,
 * and playback highlighting by the transient data.playback field.
 */
export function WorkflowNodeComponent({ data, selected }: NodeProps<WorkflowNode>) {
  const meta = NODE_TYPE_META[data.nodeType]
  const playback = data.playback ?? 'upcoming'
  const isPill = data.nodeType === 'start' || data.nodeType === 'end'

  const stateClasses =
    playback === 'active'
      ? 'ring-4 ring-offset-2 ring-blue-400 dark:ring-blue-500 dark:ring-offset-gray-950 scale-105 shadow-xl'
      : playback === 'done'
        ? 'opacity-100 shadow-md'
        : 'opacity-80'

  return (
    <div
      className={[
        'relative min-w-40 max-w-56 border-2 bg-white px-4 py-3 transition-all duration-300 dark:bg-gray-900',
        isPill ? 'rounded-full' : 'rounded-xl',
        meta.ring,
        selected ? 'shadow-lg ring-2 ring-blue-300 dark:ring-blue-700' : 'shadow-sm',
        stateClasses,
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <span
          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white ${meta.accent}`}
        >
          {meta.label}
        </span>
        {playback === 'done' && (
          <span className="text-xs font-bold text-emerald-500" aria-label="completed">
            ✓
          </span>
        )}
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
        {data.label}
      </div>
      {data.description && (
        <div className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
