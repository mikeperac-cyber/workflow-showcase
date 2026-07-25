import { useMemo } from 'react'
import type { Edge, NodeTypes } from '@xyflow/react'
import { Background, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react'
import type { Workflow } from '../../types/workflow'
import { useActiveWorkflow, useWorkflowStore } from '../../store/workflowStore'
import { useThemeStore } from '../../store/themeStore'
import { usePlayback } from '../../hooks/usePlayback'
import { WorkflowNodeComponent } from '../canvas/WorkflowNode'
import { defaultEdgeOptions } from '../canvas/shared'
import { BackIcon, EditIcon } from '../common/Icon'
import { ExportMenu } from '../common/ExportMenu'
import { NodeDetailPanel } from './NodeDetailPanel'
import { PlaybackControls } from './PlaybackControls'

const nodeTypes: NodeTypes = { workflow: WorkflowNodeComponent }

const TRAVERSED_STYLE = { stroke: '#10b981', strokeWidth: 2.5 }
const ENTERING_STYLE = { stroke: '#3b82f6', strokeWidth: 2.5 }

function ShowcaseCanvas({ workflow }: { workflow: Workflow }) {
  const theme = useThemeStore((s) => s.theme)
  const goLibrary = useWorkflowStore((s) => s.goLibrary)
  const openBuilder = useWorkflowStore((s) => s.openBuilder)
  const playback = usePlayback(workflow)

  // Inject transient playback state into nodes/edges (never written to the store).
  const nodes = useMemo(
    () =>
      workflow.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          playback:
            playback.currentIndex < 0
              ? ('upcoming' as const)
              : n.id === playback.currentNode?.id
                ? ('active' as const)
                : playback.visited.has(n.id)
                  ? ('done' as const)
                  : ('upcoming' as const),
        },
        draggable: false,
        connectable: false,
        selected: false,
      })),
    [workflow.nodes, playback.currentIndex, playback.currentNode, playback.visited],
  )

  const edges = useMemo<Edge[]>(
    () =>
      workflow.edges.map((e) => {
        const traversed = playback.visited.has(e.source) && playback.visited.has(e.target)
        const entering =
          !traversed &&
          playback.visited.has(e.source) &&
          e.target === playback.currentNode?.id
        return {
          ...e,
          animated: traversed || entering,
          style: traversed ? TRAVERSED_STYLE : entering ? ENTERING_STYLE : undefined,
        }
      }),
    [workflow.edges, playback.visited, playback.currentNode],
  )

  return (
    <div className="flex h-full min-h-0">
      <div className="relative min-w-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          defaultEdgeOptions={defaultEdgeOptions}
          colorMode={theme}
          fitView
        >
          <Background gap={18} />
          <Controls position="bottom-left" showInteractive={false} />
        </ReactFlow>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-2 p-3">
          <div className="pointer-events-auto flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={goLibrary}
              title="Back to library"
              className="rounded-lg border border-gray-300 bg-white p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <BackIcon />
            </button>
            <div className="rounded-lg border border-gray-200 bg-white/95 px-3 py-1.5 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
              <div className="text-sm font-semibold leading-tight">{workflow.name}</div>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <ExportMenu workflow={workflow} />
            <button
              type="button"
              onClick={() => openBuilder(workflow.id)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <EditIcon /> Edit
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <PlaybackControls playback={playback} />
        </div>
      </div>
      <NodeDetailPanel
        workflow={workflow}
        node={playback.currentNode}
        stepIndex={playback.currentIndex}
        stepCount={playback.steps.length}
        onPlay={playback.toggle}
      />
    </div>
  )
}

export function ShowcaseView() {
  const workflow = useActiveWorkflow()
  if (!workflow) return null
  return (
    <ReactFlowProvider>
      <ShowcaseCanvas workflow={workflow} />
    </ReactFlowProvider>
  )
}
