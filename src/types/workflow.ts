import type { Edge, Node } from '@xyflow/react'

export type WorkflowNodeType =
  | 'start'
  | 'task'
  | 'decision'
  | 'end'
  | 'note'
  | 'agent'
  | 'llm-model'
  | 'tool'
  | 'prompt'

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

  // ── Specialized AI Node Fields ──────────────────────────────────────
  /** Agent role or system prompt instructions (for 'agent') */
  systemInstructions?: string
  /** Model identifier, e.g. 'gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro' (for 'llm-model' & 'agent') */
  model?: string
  /** Sampling temperature 0.0 - 2.0 (for 'llm-model') */
  temperature?: number
  /** Maximum generation tokens (for 'llm-model') */
  maxTokens?: number
  /** Function or tool signature/interface (for 'tool') */
  functionSignature?: string
  /** Target API endpoint or tool service URL (for 'tool') */
  apiEndpoint?: string
  /** HTTP method or execution type (for 'tool') */
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'RPC'
  /** System message template (for 'prompt') */
  systemPrompt?: string
  /** User message template with variables (for 'prompt') */
  userPrompt?: string
  /** Pre-scripted mock logs to simulate live terminal output during showcase */
  mockLogs?: string[]
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
  /** Topic tags for filtering in the library, e.g. ['ielts', 'writing']. */
  tags?: string[]
  /** High-level category shown as a color accent on library cards. */
  category?: 'ai' | 'ielts' | 'esl' | 'productivity' | 'business' | 'student' | 'teacher' | 'custom'
  /** Tools/Stacks used in the workflow for multidimensional filtering */
  tools?: string[]
  /** Trigger type (e.g., 'Webhook', 'Schedule', 'Event') */
  trigger?: string
  /** Complexity tier of the workflow */
  complexity?: 'Starter' | 'Intermediate' | 'Advanced'
}

export type View = 'library' | 'builder' | 'showcase'
