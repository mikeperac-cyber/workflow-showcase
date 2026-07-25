import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Workflow } from '../types/workflow'

const HASH_PREFIX = '#w='

export function encodeWorkflow(wf: Workflow): string {
  return compressToEncodedURIComponent(JSON.stringify(wf))
}

export function decodeWorkflow(encoded: string): Workflow | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const wf = JSON.parse(json) as Workflow
    if (!wf || typeof wf.id !== 'string' || !Array.isArray(wf.nodes) || !Array.isArray(wf.edges)) {
      return null
    }
    return wf
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
