import type { Edge, Node } from '@xyflow/react'

export type WorkflowNodeType = 'start' | 'task' | 'decision' | 'end'

export type PlaybackStatus = 'upcoming' | 'active' | 'done'

export interface NodeMetric {
  label: string
  value: string
}

export interface WorkflowNodeData extends Record<string, unknown> {
  nodeType: WorkflowNodeType
  label: string
  /** Short subtitle shown on the node card. */
  description?: string
  /** Long-form body shown in the showcase detail panel. */
  details?: string
  codeSnippet?: string
  imageUrl?: string
  metrics?: NodeMetric[]
  /** Playback dwell time on this node, in milliseconds. */
  duration?: number
  /** Transient playback state injected by the showcase view (never persisted meaningfully). */
  playback?: PlaybackStatus
}

export type WorkflowNode = Node<WorkflowNodeData, 'workflow'>

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: Edge[]
  createdAt: number
  updatedAt: number
}

export type View = 'library' | 'builder' | 'showcase'
