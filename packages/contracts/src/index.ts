export const WORKFLOW_SCHEMA_VERSION = 1 as const

export type WorkspaceRole = 'owner' | 'editor' | 'commenter' | 'viewer'

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Workspace {
  id: string
  name: string
  createdAt: string
}

export interface WorkflowSummary {
  id: string
  workspaceId: string
  name: string
  description: string
  schemaVersion: number
  revisionId: string
  updatedAt: string
}

export interface WorkflowRevision<TDocument = unknown> {
  id: string
  workflowId: string
  version: number
  document: TDocument
  createdAt: string
  createdBy: string
}

export interface WorkflowRun {
  id: string
  workflowId: string
  revisionId: string
  status: RunStatus
  createdAt: string
  updatedAt: string
}

export type ProviderEvent =
  | { type: 'step.started'; stepId: string; at: string }
  | { type: 'output.delta'; stepId: string; delta: string }
  | { type: 'usage.reported'; stepId: string; inputTokens: number; outputTokens: number; estimatedCostUsd?: number }
  | { type: 'step.completed'; stepId: string; at: string }
  | { type: 'step.failed'; stepId: string; message: string; retryable: boolean }
  | { type: 'run.completed'; runId: string; at: string }

export interface ProviderExecutionRequest {
  runId: string
  stepId: string
  model: string
  instructions?: string
  input: string
  maxOutputTokens?: number
  temperature?: number
}

export interface ProviderAdapter {
  readonly id: string
  execute(request: ProviderExecutionRequest, signal?: AbortSignal): AsyncIterable<ProviderEvent>
}

export interface CollaborationTicket {
  workflowId: string
  workspaceId: string
  subject: string
  role: WorkspaceRole
  expiresAt: string
}
