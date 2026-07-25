import type { DragEvent } from 'react'
import type { NodeTypes } from '@xyflow/react'
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import type { Workflow, WorkflowNodeType } from '../../types/workflow'
import { useActiveWorkflow, useSelectedNodeId, useWorkflowStore } from '../../store/workflowStore'
import { useThemeStore } from '../../store/themeStore'
import { WorkflowNodeComponent } from '../canvas/WorkflowNode'
import { defaultEdgeOptions } from '../canvas/shared'
import { BackIcon, PresentIcon, TrashIcon } from '../common/Icon'
import { ExportMenu } from '../common/ExportMenu'
import { NodeEditorPanel } from './NodeEditorPanel'
import { DND_MIME, NodePalette } from './NodePalette'

const nodeTypes: NodeTypes = { workflow: WorkflowNodeComponent }

function BuilderToolbar({ workflow }: { workflow: Workflow }) {
  const goLibrary = useWorkflowStore((s) => s.goLibrary)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const updateWorkflowMeta = useWorkflowStore((s) => s.updateWorkflowMeta)
  const selectedNodeId = useSelectedNodeId()
  const deleteNode = useWorkflowStore((s) => s.deleteNode)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-2 p-3">
      <div className="pointer-events-auto flex flex-1 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goLibrary}
          title="Back to library"
          className="rounded-lg border border-gray-300 bg-white p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <BackIcon />
        </button>
        <input
          value={workflow.name}
          onChange={(e) => updateWorkflowMeta(workflow.id, { name: e.target.value })}
          className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
          aria-label="Workflow name"
        />
        <input
          value={workflow.description}
          onChange={(e) => updateWorkflowMeta(workflow.id, { description: e.target.value })}
          placeholder="Add a description…"
          className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
          aria-label="Workflow description"
        />
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {selectedNodeId && (
          <button
            type="button"
            onClick={() => deleteNode(selectedNodeId)}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-gray-800 dark:hover:bg-rose-950"
          >
            <TrashIcon /> Delete node
          </button>
        )}
        <ExportMenu workflow={workflow} />
        <button
          type="button"
          onClick={() => openShowcase(workflow.id)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <PresentIcon /> Present
        </button>
      </div>
    </div>
  )
}

function BuilderCanvas({ workflow }: { workflow: Workflow }) {
  const theme = useThemeStore((s) => s.theme)
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange)
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange)
  const onConnect = useWorkflowStore((s) => s.onConnect)
  const addNode = useWorkflowStore((s) => s.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData(DND_MIME) as WorkflowNodeType | ''
    if (!type) return
    addNode(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }))
  }

  return (
    <div className="flex h-full min-h-0">
      <NodePalette />
      <div className="relative min-w-0 flex-1">
        <ReactFlow
          nodes={workflow.nodes}
          edges={workflow.edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={['Backspace', 'Delete']}
          colorMode={theme}
          fitView
        >
          <Background gap={18} />
          <Controls position="bottom-left" />
        </ReactFlow>
        <BuilderToolbar workflow={workflow} />
      </div>
      <NodeEditorPanel />
    </div>
  )
}

export function BuilderView() {
  const workflow = useActiveWorkflow()
  if (!workflow) return null
  return (
    <ReactFlowProvider>
      <BuilderCanvas workflow={workflow} />
    </ReactFlowProvider>
  )
}
