import { useState, useEffect } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'guide' | 'shortcuts' | 'showcase' | 'presets'

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guide')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <h2 id="help-modal-title" className="text-lg font-bold">
                EduFlow User Guide &amp; Shortcuts
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Master visual workflow building, classroom presentation, and shortcuts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 dark:border-gray-800 dark:bg-gray-950">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Quick Start Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'shortcuts'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Builder Keyboard Shortcuts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'showcase'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Presentation &amp; Showcase
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            IELTS / ESL / AI Features
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50">
                <h3 className="font-bold text-blue-900 dark:text-blue-300">Welcome to EduFlow!</h3>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  EduFlow is a visual workflow builder and interactive presentation tool designed for educators, instructors, and engineers to map out processes and present them step-by-step.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs dark:bg-blue-900">1</span>
                    1. Create &amp; Build
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Use drag &amp; drop or hotkeys (1-9) to place Start, Step, Decision, End, Note, Agent, LLM Model, Tool, or Prompt nodes. Connect handles to form directed execution paths.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs dark:bg-emerald-900">2</span>
                    2. Present &amp; Teach
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click <strong>Present</strong> to launch animated walkthrough mode. Navigate with spacebar or arrow keys. Nodes highlight step-by-step with band score badges and deep-dive panels.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs dark:bg-purple-900">3</span>
                    3. Share &amp; Export
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Share your workflow instantly via URL hash compression without server overhead, or export high-resolution PNG / PDF blueprints for handouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use these hotkeys in the Builder canvas for fast workflow creation and editing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Add Start / Task / Decision Node</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">1</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">2</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">3</kbd>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Add End / Note Node</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">4</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">5</kbd>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Add Agent / LLM / Tool / Prompt Node</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">6</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">7</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">8</kbd>
                    <kbd className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">9</kbd>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Undo / Redo Action</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Ctrl/Cmd+Z</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Ctrl/Cmd+Shift+Z</kbd>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Delete Selected Node(s)</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Backspace</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Delete</kbd>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-lg border border-gray-200 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <span>Multi-Select &amp; Box Select</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Shift + Drag</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'showcase' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                In Showcase (Presentation) mode, you can deliver interactive animated walkthroughs:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Play / Pause Auto Advance</span>
                    <p className="text-gray-500 dark:text-gray-400">Automatically steps through node sequence according to node duration.</p>
                  </div>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Space</kbd>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Step Forward / Next Node</span>
                    <p className="text-gray-500 dark:text-gray-400">Advance to the next node in execution order.</p>
                  </div>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">→</kbd>
                    <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">↓</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Step Backward / Previous Node</span>
                    <p className="text-gray-500 dark:text-gray-400">Go back to the previous node step.</p>
                  </div>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">←</kbd>
                    <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">↑</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Exit Presentation</span>
                    <p className="text-gray-500 dark:text-gray-400">Return to builder mode or library.</p>
                  </div>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600">Esc</kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">⏱ IELTS &amp; ESL Quick-Insert Presets</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  In the Node Editor panel, click the quick-insert buttons to automatically populate standard IELTS exam durations (e.g., 40 min Task 2 essay, 20 min Task 1, 1 min preparation time) or ESL lesson stage times.
                </p>
              </div>

              <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/30">
                <h4 className="font-bold text-violet-900 dark:text-violet-300 mb-1">✨ Band Score Chips &amp; Metrics</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Nodes with metric keys like "band", "score", or "target" automatically render as color-coded badges in showcase mode (e.g. Band 5 = red, Band 6 = amber, Band 7 = green, Band 8/9 = blue).
                </p>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">🤖 AI Agent &amp; LLM Node Types</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure Agent instructions, LLM parameters (model name, temperature), Tool signatures, and System Prompt templates. Perfect for modern AI workflows, multi-agent reflection loops, and RAG pipelines.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 px-6 py-3 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
