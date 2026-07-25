import type { Playback } from '../../hooks/usePlayback'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RestartIcon } from '../common/Icon'

const btnClass =
  'rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800'

export function PlaybackControls({ playback }: { playback: Playback }) {
  const { steps, currentIndex, isPlaying, speed, progress } = playback
  const atStart = currentIndex < 0
  const atEnd = currentIndex >= steps.length - 1

  return (
    <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
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
          disabled={steps.length === 0}
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
