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
  /** Custom accent color (hex). Falls back to the node type's default color. */
  color?: string
  /** Transient playback state injected by the showcase view (never persisted meaningfully). */
  playback?: PlaybackStatus
}

export type EdgeLineStyle = 'smooth' | 'bezier' | 'straight' | 'step'

export type EdgeArrow = 'closed' | 'open' | 'none'

/** Style options stored in edge.data and mapped to React Flow props at render time. */
export interface WorkflowEdgeData extends Record<string, unknown> {
  lineStyle?: EdgeLineStyle
  /** Arrow head at the target end. Defaults to 'closed'. */
  arrowEnd?: EdgeArrow
  /** Arrow head at the source end. Defaults to 'none'. */
  arrowStart?: EdgeArrow
  dashed?: boolean
  /** Custom stroke color (hex). Undefined = theme default. */
  color?: string
}

/** Patch accepted by the store's updateEdge action. */
export type EdgePatch = Partial<WorkflowEdgeData> & {
  label?: string
  animated?: boolean
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
