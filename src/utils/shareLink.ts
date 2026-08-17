import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Workflow } from '../types/workflow'

const HASH_PREFIX = '#w='
const WORKFLOW_NODE_TYPES = new Set([
  'start',
  'task',
  'decision',
  'end',
  'note',
  'agent',
  'llm-model',
  'tool',
  'prompt',
])
const EDGE_LINE_STYLES = new Set(['smooth', 'bezier', 'straight', 'step'])
const EDGE_ARROWS = new Set(['closed', 'open', 'none'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidWorkflow(value: unknown): value is Workflow {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.length === 0 ||
    typeof value.name !== 'string' ||
    typeof value.description !== 'string' ||
    !isFiniteNumber(value.createdAt) ||
    !isFiniteNumber(value.updatedAt) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges)
  ) {
    return false
  }

  const nodeIds = new Set<string>()
  for (const node of value.nodes) {
    if (!isRecord(node) || typeof node.id !== 'string' || node.id.length === 0 || nodeIds.has(node.id)) {
      return false
    }
    if (
      node.type !== 'workflow' ||
      !isRecord(node.position) ||
      !isFiniteNumber(node.position.x) ||
      !isFiniteNumber(node.position.y) ||
      !isRecord(node.data) ||
      typeof node.data.nodeType !== 'string' ||
      !WORKFLOW_NODE_TYPES.has(node.data.nodeType) ||
      typeof node.data.label !== 'string'
    ) {
      return false
    }

    const data = node.data
    if (
      (data.description !== undefined && typeof data.description !== 'string') ||
      (data.details !== undefined && typeof data.details !== 'string') ||
      (data.codeSnippet !== undefined && typeof data.codeSnippet !== 'string') ||
      (data.imageUrl !== undefined && typeof data.imageUrl !== 'string') ||
      (data.color !== undefined && typeof data.color !== 'string') ||
      (data.duration !== undefined && (!isFiniteNumber(data.duration) || data.duration <= 0)) ||
      (data.systemInstructions !== undefined && typeof data.systemInstructions !== 'string') ||
      (data.model !== undefined && typeof data.model !== 'string') ||
      (data.temperature !== undefined && !isFiniteNumber(data.temperature)) ||
      (data.maxTokens !== undefined && (!isFiniteNumber(data.maxTokens) || data.maxTokens <= 0)) ||
      (data.functionSignature !== undefined && typeof data.functionSignature !== 'string') ||
      (data.apiEndpoint !== undefined && typeof data.apiEndpoint !== 'string') ||
      (data.httpMethod !== undefined && typeof data.httpMethod !== 'string') ||
      (data.systemPrompt !== undefined && typeof data.systemPrompt !== 'string') ||
      (data.userPrompt !== undefined && typeof data.userPrompt !== 'string') ||
      (data.metrics !== undefined &&
        (!Array.isArray(data.metrics) ||
          data.metrics.some(
            (metric) =>
              !isRecord(metric) || typeof metric.label !== 'string' || typeof metric.value !== 'string',
          )))
    ) {
      return false
    }
    nodeIds.add(node.id)
  }

  const edgeIds = new Set<string>()
  for (const edge of value.edges) {
    if (
      !isRecord(edge) ||
      typeof edge.id !== 'string' ||
      edge.id.length === 0 ||
      edgeIds.has(edge.id) ||
      typeof edge.source !== 'string' ||
      typeof edge.target !== 'string' ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target) ||
      (edge.label !== undefined && typeof edge.label !== 'string') ||
      (edge.animated !== undefined && typeof edge.animated !== 'boolean')
    ) {
      return false
    }

    if (edge.data !== undefined) {
      if (!isRecord(edge.data)) return false
      const data = edge.data
      if (
        (data.lineStyle !== undefined &&
          (typeof data.lineStyle !== 'string' || !EDGE_LINE_STYLES.has(data.lineStyle))) ||
        (data.arrowEnd !== undefined &&
          (typeof data.arrowEnd !== 'string' || !EDGE_ARROWS.has(data.arrowEnd))) ||
        (data.arrowStart !== undefined &&
          (typeof data.arrowStart !== 'string' || !EDGE_ARROWS.has(data.arrowStart))) ||
        (data.dashed !== undefined && typeof data.dashed !== 'boolean') ||
        (data.color !== undefined && typeof data.color !== 'string')
      ) {
        return false
      }
    }
    edgeIds.add(edge.id)
  }

  return true
}

export function encodeWorkflow(wf: Workflow): string {
  return compressToEncodedURIComponent(JSON.stringify(wf))
}

export function decodeWorkflow(encoded: string): Workflow | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const value: unknown = JSON.parse(json)
    return isValidWorkflow(value) ? value : null
  } catch {
    return null
  }
}

export function buildShareUrl(wf: Workflow): string {
  return `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${encodeWorkflow(wf)}`
}

/** Reads and validates a shared workflow from the current URL hash, if present. */
export function getSharedWorkflowFromLocation(): Workflow | null {
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) return null
  return decodeWorkflow(hash.slice(HASH_PREFIX.length))
}

/** Share URLs above this length are likely to break in chat apps / browsers. */
export const SHARE_URL_WARN_LENGTH = 8000
