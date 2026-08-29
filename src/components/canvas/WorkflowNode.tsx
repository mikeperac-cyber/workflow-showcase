import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { WorkflowNode } from '../../types/workflow'
import { AgentIcon, ModelIcon, PromptIcon, SparklesIcon, ToolIcon } from '../common/Icon'
import { NODE_TYPE_META, nodeColor } from './shared'

/**
 * Single custom node component for all workflow node types.
 * Shape is driven by data.nodeType, accent color by data.color
 * (falling back to the type default), playback highlight by data.playback.
 *
 * The 'note' type renders as a yellow sticky-note card without connection handles
 * (decorative by default), perfect for teacher annotations and IELTS tips.
 */
export const WorkflowNodeComponent = memo(function WorkflowNodeComponent({ data, selected }: NodeProps<WorkflowNode>) {
  const meta = NODE_TYPE_META[data.nodeType]
  const color = nodeColor(data)
  const playback = data.playback ?? 'upcoming'
  const isPill = data.nodeType === 'start' || data.nodeType === 'end'
  const isNote = data.nodeType === 'note'

  const stateClasses =
    playback === 'active'
      ? 'ring-4 ring-offset-2 ring-blue-400 dark:ring-blue-500 dark:ring-offset-gray-950 scale-105 shadow-xl'
      : playback === 'done'
        ? 'opacity-100 shadow-md'
        : 'opacity-80'

  const renderTypeIcon = () => {
    switch (data.nodeType) {
      case 'agent':
        return <AgentIcon className="h-3 w-3" />
      case 'llm-model':
        return <ModelIcon className="h-3 w-3" />
      case 'tool':
        return <ToolIcon className="h-3 w-3" />
      case 'prompt':
        return <PromptIcon className="h-3 w-3" />
      default:
        return null
    }
  }

  // ── Sticky-note rendering ──────────────────────────────────────────────────
  if (isNote) {
    return (
      <div
        className={[
          'relative min-w-40 max-w-64 border-0 px-4 py-3 transition-all duration-300',
          'rounded-sm shadow-md',
          selected ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : '',
          stateClasses,
        ].join(' ')}
        style={{
          backgroundColor: data.color ?? '#fef08a',
          // slight fold effect via box-shadow
          boxShadow: '2px 4px 8px rgba(0,0,0,0.18), -1px -1px 0 rgba(0,0,0,0.06)',
        }}
      >
        <Handle type="target" position={Position.Top} id="top-target" style={{ opacity: 0.4 }} />
        <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0.4 }} />
        <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0.4 }} />
        <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ opacity: 0.4 }} />
        {/* Pin / tape element */}
        <div
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-yellow-500 bg-yellow-300"
          aria-hidden="true"
        />
        <div className="mt-1 text-sm font-semibold leading-tight text-yellow-950">
          {data.label}
        </div>
        {data.description && (
          <div className="mt-0.5 text-xs leading-snug text-yellow-800">
            {data.description}
          </div>
        )}
        <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0.4 }} />
        <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0.4 }} />
        <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0.4 }} />
        <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ opacity: 0.4 }} />
      </div>
    )
  }

  // ── Standard & AI node rendering ───────────────────────────────────────────
  return (
    <div
      className={[
        'relative min-w-44 max-w-60 border-2 bg-white px-4 py-3 transition-all duration-300 dark:bg-gray-900',
        isPill ? 'rounded-full px-5' : 'rounded-xl',
        selected ? 'shadow-lg ring-2 ring-blue-300 dark:ring-blue-700' : 'shadow-sm',
        stateClasses,
      ].join(' ')}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
      <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
      <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white"
            style={{ backgroundColor: color }}
          >
            {renderTypeIcon()}
            <span>{meta.label}</span>
          </span>
          {data.nodeType === 'llm-model' && data.model && (
            <span className="truncate max-w-28 rounded bg-cyan-100 px-1.5 py-0.5 text-[9px] font-mono font-medium text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
              {data.model}
            </span>
          )}
        </div>
        {playback === 'done' && (
          <span className="text-xs font-bold text-emerald-500" aria-label="completed">
            ✓
          </span>
        )}
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
        {data.label}
      </div>
      {data.description && (
        <div className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
          {data.description}
        </div>
      )}

      {/* AI node specific preview tags */}
      {data.nodeType === 'agent' && data.model && (
        <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          <SparklesIcon className="h-2.5 w-2.5" />
          <span className="truncate max-w-36">{data.model}</span>
        </div>
      )}
      {data.nodeType === 'tool' && (data.functionSignature || data.apiEndpoint) && (
        <div className="mt-1.5 truncate rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[10px] text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
          {data.functionSignature || data.apiEndpoint}
        </div>
      )}
      {data.nodeType === 'prompt' && data.userPrompt && (
        <div className="mt-1.5 truncate rounded bg-pink-50 px-1.5 py-0.5 font-mono text-[10px] text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
          {data.userPrompt}
        </div>
      )}
      <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3 !bg-blue-500" />
    </div>
  )
})
