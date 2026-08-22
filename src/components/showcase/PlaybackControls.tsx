import type { Playback } from '../../hooks/usePlayback'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RestartIcon } from '../common/Icon'
import { useActiveWorkflow } from '../../store/workflowStore'

const btnClass =
  'rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800'

export function PlaybackControls({ playback }: { playback: Playback }) {
  const { steps, currentIndex, isPlaying, speed, progress, ttsEnabled, toggleTTS, currentNode, jumpToNode } = playback
  const atStart = currentIndex < 0
  const atEnd = currentIndex >= steps.length - 1
  const workflow = useActiveWorkflow()

  // Get outgoing edges for decision nodes
  const outgoingEdges = currentNode?.data.nodeType === 'decision' && workflow
    ? workflow.edges.filter(e => e.source === currentNode.id)
    : []

  const getTargetNodeName = (targetId: string) => {
      if (!workflow) return targetId
      const node = workflow.nodes.find(n => n.id === targetId)
      return node?.data.label || targetId
  }

  return (
    <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">

      {/* Interactive Decision Prompt */}
      {currentNode?.data.nodeType === 'decision' && outgoingEdges.length > 0 && (
          <div className="mb-2 p-2 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">Decision Required:</p>
              <div className="flex flex-wrap gap-2">
                  {outgoingEdges.map(edge => (
                      <button
                          key={edge.id}
                          onClick={() => jumpToNode(edge.target)}
                          className="px-3 py-1.5 text-xs font-medium bg-white text-orange-700 border border-orange-300 rounded hover:bg-orange-100 transition dark:bg-gray-800 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-gray-700"
                      >
                          {edge.label || `Go to ${getTargetNodeName(edge.target)}`}
                      </button>
                  ))}
              </div>
          </div>
      )}

      <div className="flex items-center gap-1">
        <button type="button" onClick={playback.restart} disabled={steps.length === 0} title="Restart" className={btnClass}>
          <RestartIcon />
        </button>
        <button type="button" onClick={playback.prev} disabled={atStart} title="Previous step" className={btnClass}>
          <PrevIcon />
        </button>
        <button
          type="button"
          onClick={playback.toggle}
          disabled={steps.length === 0 || currentNode?.data.nodeType === 'decision'}
          title={isPlaying ? 'Pause' : 'Play'}
          className="rounded-full bg-blue-600 p-2.5 text-white transition hover:bg-blue-700 disabled:opacity-30"
        >
          {isPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
        </button>
        <button type="button" onClick={playback.next} disabled={atEnd} title="Next step" className={btnClass}>
          <NextIcon />
        </button>
        <button
          type="button"
          onClick={playback.cycleSpeed}
          title="Playback speed"
          className="ml-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {speed}×
        </button>
        <button
          type="button"
          onClick={toggleTTS}
          title={ttsEnabled ? 'Disable TTS' : 'Enable TTS'}
          className={`ml-1 rounded-lg border px-2 py-1 text-xs font-semibold transition ${
              ttsEnabled
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          TTS {ttsEnabled ? 'ON' : 'OFF'}
        </button>
        <span className="ml-auto text-xs font-medium tabular-nums text-gray-400 dark:text-gray-500">
          {steps.length === 0
            ? 'No steps'
            : atStart
              ? `Ready — ${steps.length} steps`
              : `Step ${currentIndex + 1} of ${steps.length}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
