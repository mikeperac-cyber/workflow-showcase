import type { DragEvent } from 'react'
import { useEffect, useMemo } from 'react'
import type { NodeTypes } from '@xyflow/react'
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import type { Workflow, WorkflowNodeType, WorkflowNode } from '../../types/workflow'
import { useActiveWorkflow, useSelectedNodeId, useWorkflowStore } from '../../store/workflowStore'
import { useThemeStore } from '../../store/themeStore'
import { WorkflowNodeComponent } from '../canvas/WorkflowNode'
import { decorateEdge, defaultEdgeOptions } from '../canvas/shared'
import { BackIcon, PresentIcon, RedoIcon, TrashIcon, UndoIcon, PlusIcon } from '../common/Icon'
import { ExportMenu } from '../common/ExportMenu'
import { EdgeEditorPanel } from './EdgeEditorPanel'
import { NodeEditorPanel } from './NodeEditorPanel'
import { DND_MIME, NodePalette } from './NodePalette'
import { getAutoLayoutNodes } from '../../utils/autoLayout'

const nodeTypes: NodeTypes = { workflow: WorkflowNodeComponent }

/** Category selector pills shown in the toolbar. */
const CATEGORIES = [
  { label: 'AI', value: 'ai' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Business', value: 'business' },
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'ESL', value: 'esl' },
  { label: 'Custom', value: 'custom' },
] as const

function BuilderToolbar({ workflow }: { workflow: Workflow }) {
  const goLibrary = useWorkflowStore((s) => s.goLibrary)
  const openShowcase = useWorkflowStore((s) => s.openShowcase)
  const updateWorkflowMeta = useWorkflowStore((s) => s.updateWorkflowMeta)
  const selectedNodeId = useSelectedNodeId()
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange)
  const { getNodes, getEdges, fitView } = useReactFlow<WorkflowNode>()

  const handleAutoLayout = () => {
    const layoutedNodes = getAutoLayoutNodes(getNodes(), getEdges(), 'TB')
    onNodesChange(layoutedNodes.map((node) => ({ id: node.id, type: 'position', position: node.position })))
    window.requestAnimationFrame(() => fitView())
  }
  const selectedNodeCount = useWorkflowStore((s) => {
    const active = s.activeId ? s.workflows[s.activeId] : null
    return active?.nodes.filter((node) => node.selected).length ?? 0
  })
  const deleteSelectedNodes = useWorkflowStore((s) => s.deleteSelectedNodes)
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const canUndo = useWorkflowStore((s) => Boolean(s.activeId && s.history[s.activeId]?.past.length))
  const canRedo = useWorkflowStore((s) => Boolean(s.activeId && s.history[s.activeId]?.future.length))

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
          className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          aria-label="Workflow name"
        />
        <input
          value={workflow.description}
          onChange={(e) => updateWorkflowMeta(workflow.id, { description: e.target.value })}
          placeholder="Add a description…"
          className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          aria-label="Workflow description"
        />
        {/* Category selector */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500">Cat:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateWorkflowMeta(workflow.id, { category: cat.value })}
              className={[
                'rounded px-2 py-0.5 text-[10px] font-bold transition',
                workflow.category === cat.value
                  ? cat.value === 'ai'
                    ? 'bg-violet-600 text-white'
                    : cat.value === 'productivity'
                      ? 'bg-orange-600 text-white'
                    : cat.value === 'business'
                      ? 'bg-amber-600 text-white'
                    : cat.value === 'student'
                      ? 'bg-cyan-600 text-white'
                    : cat.value === 'teacher'
                      ? 'bg-pink-600 text-white'
                    : cat.value === 'ielts'
                      ? 'bg-blue-600 text-white'
                      : cat.value === 'esl'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleAutoLayout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          <PlusIcon /> Auto Layout
        </button>
        <button
          type="button"
           onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl/Cmd+Z)"
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl/Cmd+Shift+Z)"
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <RedoIcon />
        </button>
        {selectedNodeId && (
          <button
            type="button"
            onClick={deleteSelectedNodes}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-gray-800 dark:hover:bg-rose-950"
          >
            <TrashIcon /> Delete {selectedNodeCount > 1 ? `${selectedNodeCount} nodes` : 'node'}
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
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const hasSelectedEdge = useWorkflowStore((s) => {
    const wf = s.activeId ? s.workflows[s.activeId] : null
    return wf?.edges.some((e) => e.selected) ?? false
  })
  const { screenToFlowPosition } = useReactFlow()

  const edges = useMemo(() => workflow.edges.map(decorateEdge), [workflow.edges])

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redo, undo])

  return (
    <div className="flex h-full min-h-0">
      <NodePalette />
      <div className="relative min-w-0 flex-1">
        <ReactFlow
          nodes={workflow.nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={['Backspace', 'Delete']}
          selectionOnDrag
          selectionKeyCode={['Shift']}
          multiSelectionKeyCode={['Shift']}
          snapToGrid
          snapGrid={[16, 16]}
          onlyRenderVisibleElements
          panOnScroll
          zoomOnDoubleClick={false}
          colorMode={theme === 'contrast' ? 'dark' : theme}
          fitView
        >
          <Background gap={18} />
          <Controls position="bottom-left" />
        </ReactFlow>
        <BuilderToolbar workflow={workflow} />
      </div>
      {hasSelectedEdge ? <EdgeEditorPanel /> : <NodeEditorPanel />}
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
