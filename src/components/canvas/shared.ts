import type { DefaultEdgeOptions, Edge } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'
import type { EdgeArrow, WorkflowEdgeData, WorkflowNodeData, WorkflowNodeType } from '../../types/workflow'

export const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
}

export const NODE_TYPE_META: Record<WorkflowNodeType, { label: string; hex: string; accent: string }> = {
  start: { label: 'START', hex: '#10b981', accent: 'bg-emerald-500' },
  task: { label: 'STEP', hex: '#3b82f6', accent: 'bg-blue-500' },
  decision: { label: 'IF', hex: '#f59e0b', accent: 'bg-amber-500' },
  end: { label: 'END', hex: '#f43f5e', accent: 'bg-rose-500' },
}

/** Shared color palette for node accents and edge strokes. */
export const COLOR_PALETTE = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
]

/** Effective accent color of a node: custom override or its type default. */
export function nodeColor(data: WorkflowNodeData): string {
  return data.color ?? NODE_TYPE_META[data.nodeType].hex
}

function toMarker(kind: EdgeArrow | undefined, fallback: EdgeArrow, color?: string) {
  const k = kind ?? fallback
  if (k === 'none') return undefined
  return {
    type: k === 'open' ? MarkerType.Arrow : MarkerType.ArrowClosed,
    color,
    width: 22,
    height: 22,
  }
}

/**
 * Maps the style options stored in edge.data to concrete React Flow edge props.
 * Applied at render time so stored edges stay presentation-agnostic.
 */
export function decorateEdge(edge: Edge): Edge {
  const d = (edge.data ?? {}) as WorkflowEdgeData
  const lineStyle = d.lineStyle ?? 'smooth'
  const type =
    lineStyle === 'smooth' ? 'smoothstep' : lineStyle === 'bezier' ? 'default' : lineStyle

  return {
    ...edge,
    type,
    markerStart: toMarker(d.arrowStart, 'none', d.color),
    markerEnd: toMarker(d.arrowEnd, 'closed', d.color),
    style: {
      strokeWidth: 2,
      ...(d.color ? { stroke: d.color } : {}),
      ...(d.dashed ? { strokeDasharray: '7 5' } : {}),
    },
  }
}
