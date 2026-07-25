import type { DefaultEdgeOptions } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'
import type { WorkflowNodeType } from '../../types/workflow'

export const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
}

export const NODE_TYPE_META: Record<WorkflowNodeType, { label: string; accent: string; ring: string }> = {
  start: {
    label: 'START',
    accent: 'bg-emerald-500',
    ring: 'border-emerald-500',
  },
  task: {
    label: 'STEP',
    accent: 'bg-blue-500',
    ring: 'border-blue-500',
  },
  decision: {
    label: 'IF',
    accent: 'bg-amber-500',
    ring: 'border-amber-500',
  },
  end: {
    label: 'END',
    accent: 'bg-rose-500',
    ring: 'border-rose-500',
  },
}
