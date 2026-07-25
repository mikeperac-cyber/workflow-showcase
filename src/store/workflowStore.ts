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
}

interface WorkflowStore {
  workflows: Record<string, Workflow>
  view: View
  activeId: string | null

  // navigation
  goLibrary: () => void
  openBuilder: (id: string) => void
  openShowcase: (id: string) => void

  // workflow CRUD
  createWorkflow: () => string
  deleteWorkflow: (id: string) => void
  duplicateWorkflow: (id: string) => void
  updateWorkflowMeta: (id: string, patch: Partial<Pick<Workflow, 'name' | 'description'>>) => void
  importWorkflow: (wf: Workflow) => string

  // canvas interactions (builder)
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (nodeType: WorkflowNodeType, position?: XYPosition) => void
  deleteNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void
  updateEdge: (edgeId: string, patch: EdgePatch) => void
  deleteEdge: (edgeId: string) => void
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
          return { workflows: { ...s.workflows, [activeId]: touch(mutate(wf)) } }
        })
      }

      return {
        workflows: createSampleWorkflows(),
        view: 'library',
        activeId: null,

        goLibrary: () => set({ view: 'library', activeId: null }),
        openBuilder: (id) => set({ view: 'builder', activeId: id }),
        openShowcase: (id) => set({ view: 'showcase', activeId: id }),

        createWorkflow: () => {
          const now = Date.now()
          const wf: Workflow = {
            id: uid(),
            name: 'Untitled Workflow',
            description: '',
            createdAt: now,
            updatedAt: now,
            nodes: [
              {
                id: uid(),
                type: 'workflow',
                position: { x: 0, y: 120 },
                data: { nodeType: 'start', label: 'Start', duration: 2000 },
              },
            ],
            edges: [],
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
            return { workflows: { ...s.workflows, [id]: touch({ ...wf, ...patch }) } }
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
      }
    },
    {
      name: 'wf-showcase-workflows',
      partialize: (s) => ({ workflows: s.workflows }),
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
