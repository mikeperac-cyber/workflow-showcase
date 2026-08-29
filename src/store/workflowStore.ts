import type { Connection, EdgeChange, NodeChange, XYPosition } from '@xyflow/react'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  EdgePatch,
  View,
  Workflow,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
} from '../types/workflow'
import { uid } from '../utils/id'
import { createSampleWorkflows } from '../utils/sampleWorkflows'

const DEFAULT_NODE_LABELS: Record<WorkflowNodeType, string> = {
  start: 'Start',
  task: 'New Step',
  decision: 'Decision',
  end: 'End',
  note: '📝 Note',
  agent: 'AI Agent',
  'llm-model': 'LLM Model',
  tool: 'Tool / API',
  prompt: 'Prompt Template',
}

const HISTORY_LIMIT = 100

interface WorkflowHistory {
  past: Workflow[]
  future: Workflow[]
}

interface WorkflowStore {
  workflows: Record<string, Workflow>
  history: Record<string, WorkflowHistory>
  view: View
  activeId: string | null

  // navigation
  goLibrary: () => void
  openBuilder: (id: string) => void
  openShowcase: (id: string) => void

  // workflow CRUD
  createWorkflow: (initialWorkflow?: Partial<Workflow>) => string
  deleteWorkflow: (id: string) => void
  duplicateWorkflow: (id: string) => void
  updateWorkflowMeta: (id: string, patch: Partial<Pick<Workflow, 'name' | 'description' | 'tags' | 'category'>>) => void
  importWorkflow: (wf: Workflow) => string

  // canvas interactions (builder)
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (nodeType: WorkflowNodeType, position?: XYPosition) => void
  deleteNode: (nodeId: string) => void
  deleteSelectedNodes: () => void
  updateNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void
  updateEdge: (edgeId: string, patch: EdgePatch) => void
  deleteEdge: (edgeId: string) => void

  // editor history
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

function touch(wf: Workflow): Workflow {
  return { ...wf, updatedAt: Date.now() }
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => {
      /** Applies a mutation to the currently active workflow. */
      function mutateActive(mutate: (wf: Workflow) => Workflow) {
        const { activeId } = get()
        if (!activeId) return
        set((s) => {
          const wf = s.workflows[activeId]
          if (!wf) return s
          const next = touch(mutate(wf))
          const history = s.history[activeId] ?? { past: [], future: [] }
          return {
            workflows: { ...s.workflows, [activeId]: next },
            history: {
              ...s.history,
              [activeId]: {
                past: [...history.past, structuredClone(wf)].slice(-HISTORY_LIMIT),
                future: [],
              },
            },
          }
        })
      }

      return {
        workflows: createSampleWorkflows(),
        history: {},
        view: 'library',
        activeId: null,

        goLibrary: () => set({ view: 'library', activeId: null }),
        openBuilder: (id) => set({ view: 'builder', activeId: id }),
        openShowcase: (id) => set({ view: 'showcase', activeId: id }),

        createWorkflow: (initialWorkflow) => {
          const now = Date.now()
          const wf: Workflow = {
            id: uid(),
            name: initialWorkflow?.name || 'Untitled Workflow',
            description: initialWorkflow?.description || '',
            createdAt: now,
            updatedAt: now,
            category: initialWorkflow?.category || 'custom',
            tags: initialWorkflow?.tags || [],
            nodes: initialWorkflow?.nodes || [
              {
                id: uid(),
                type: 'workflow',
                position: { x: 0, y: 120 },
                data: { nodeType: 'start', label: 'Start', duration: 2000 },
              },
            ],
            edges: initialWorkflow?.edges || [],
          }
          set((s) => ({ workflows: { ...s.workflows, [wf.id]: wf } }))
          return wf.id
        },

        deleteWorkflow: (id) =>
          set((s) => {
            const workflows = { ...s.workflows }
            delete workflows[id]
            const wasActive = s.activeId === id
            return {
              workflows,
              activeId: wasActive ? null : s.activeId,
              view: wasActive ? 'library' : s.view,
            }
          }),

        duplicateWorkflow: (id) =>
          set((s) => {
            const source = s.workflows[id]
            if (!source) return s
            const now = Date.now()
            const copy: Workflow = {
              ...structuredClone(source),
              id: uid(),
              name: `${source.name} (copy)`,
              createdAt: now,
              updatedAt: now,
            }
            return { workflows: { ...s.workflows, [copy.id]: copy } }
          }),

        updateWorkflowMeta: (id, patch) =>
          set((s) => {
            const wf = s.workflows[id]
            if (!wf) return s
            const history = s.history[id] ?? { past: [], future: [] }
            return {
              workflows: { ...s.workflows, [id]: touch({ ...wf, ...patch }) },
              history: {
                ...s.history,
                [id]: {
                  past: [...history.past, structuredClone(wf)].slice(-HISTORY_LIMIT),
                  future: [],
                },
              },
            }
          }),

        importWorkflow: (wf) => {
          set((s) => ({ workflows: { ...s.workflows, [wf.id]: touch(wf) } }))
          return wf.id
        },

        onNodesChange: (changes) =>
          mutateActive((wf) => ({ ...wf, nodes: applyNodeChanges(changes, wf.nodes) })),

        onEdgesChange: (changes) =>
          mutateActive((wf) => ({ ...wf, edges: applyEdgeChanges(changes, wf.edges) })),

        onConnect: (connection) =>
          // Raw edge — visual props (type, markers, style) are applied at
          // render time by decorateEdge based on edge.data options.
          mutateActive((wf) => ({ ...wf, edges: addEdge(connection, wf.edges) })),

        addNode: (nodeType, position) => {
          // The new node becomes the selection (React Flow `selected` flags are
          // the single source of truth), so deselect all existing nodes.
          mutateActive((wf) => ({
            ...wf,
            nodes: [
              ...wf.nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
              {
                id: uid(),
                type: 'workflow' as const,
                position: position ?? { x: 80 + Math.random() * 240, y: 60 + Math.random() * 240 },
                selected: true,
                data: {
                  nodeType,
                  label: DEFAULT_NODE_LABELS[nodeType],
                  duration: 2000,
                } satisfies WorkflowNodeData,
              },
            ],
          }))
        },

        deleteNode: (nodeId) =>
          mutateActive((wf) => ({
            ...wf,
            nodes: wf.nodes.filter((n) => n.id !== nodeId),
            edges: wf.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          })),

        deleteSelectedNodes: () =>
          mutateActive((wf) => {
            const deleted = new Set(wf.nodes.filter((node) => node.selected).map((node) => node.id))
            if (deleted.size === 0) return wf
            return {
              ...wf,
              nodes: wf.nodes.filter((node) => !deleted.has(node.id)),
              edges: wf.edges.filter((edge) => !deleted.has(edge.source) && !deleted.has(edge.target)),
            }
          }),

        updateNodeData: (nodeId, patch) =>
          mutateActive((wf) => ({
            ...wf,
            nodes: wf.nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
            ),
          })),

        updateEdge: (edgeId, patch) => {
          const { label, animated, ...dataPatch } = patch
          mutateActive((wf) => ({
            ...wf,
            edges: wf.edges.map((e) =>
              e.id === edgeId
                ? {
                    ...e,
                    ...(label !== undefined ? { label } : {}),
                    ...(animated !== undefined ? { animated } : {}),
                    data: { ...(e.data ?? {}), ...dataPatch },
                  }
                : e,
            ),
          }))
        },

        deleteEdge: (edgeId) =>
          mutateActive((wf) => ({
            ...wf,
            edges: wf.edges.filter((e) => e.id !== edgeId),
          })),

        undo: () => {
          const { activeId } = get()
          if (!activeId) return
          set((s) => {
            const workflow = s.workflows[activeId]
            const history = s.history[activeId]
            if (!workflow || !history || history.past.length === 0) return s
            const previous = history.past[history.past.length - 1]
            if (!previous) return s
            return {
              workflows: { ...s.workflows, [activeId]: touch(structuredClone(previous)) },
              history: {
                ...s.history,
                [activeId]: {
                  past: history.past.slice(0, -1),
                  future: [structuredClone(workflow), ...history.future].slice(0, HISTORY_LIMIT),
                },
              },
            }
          })
        },

        redo: () => {
          const { activeId } = get()
          if (!activeId) return
          set((s) => {
            const workflow = s.workflows[activeId]
            const history = s.history[activeId]
            const next = history?.future[0]
            if (!workflow || !history || !next) return s
            return {
              workflows: { ...s.workflows, [activeId]: touch(structuredClone(next)) },
              history: {
                ...s.history,
                [activeId]: {
                  past: [...history.past, structuredClone(workflow)].slice(-HISTORY_LIMIT),
                  future: history.future.slice(1),
                },
              },
            }
          })
        },

        canUndo: () => {
          const { activeId, history } = get()
          return Boolean(activeId && history[activeId]?.past.length)
        },

        canRedo: () => {
          const { activeId, history } = get()
          return Boolean(activeId && history[activeId]?.future.length)
        },
      }
    },
    {
      name: 'wf-showcase-workflows',
      version: 2,
      partialize: (s) => ({ workflows: s.workflows }),
      migrate: (persistedState: any, version: number) => {
          if (version === 0 || version === 1) {
              // If migrating from old version, just clear it and load the new samples.
              // Alternatively, we can return the fresh samples.
              return { workflows: createSampleWorkflows() }
          }
          return persistedState
      }
    },
  ),
)

/** Returns the workflow currently open in builder/showcase, or null. */
export function useActiveWorkflow(): Workflow | null {
  return useWorkflowStore((s) => (s.activeId ? (s.workflows[s.activeId] ?? null) : null))
}

/** Returns the id of the selected node in the active workflow (React Flow selection). */
export function useSelectedNodeId(): string | null {
  return useWorkflowStore((s) => {
    const wf = s.activeId ? s.workflows[s.activeId] : null
    return wf?.nodes.find((n) => n.selected)?.id ?? null
  })
}
