import type { NodeMetric, WorkflowNodeData } from '../../types/workflow'
import { useWorkflowStore } from '../../store/workflowStore'
import { NODE_TYPE_META, nodeColor } from '../canvas/shared'
import { ColorSwatches } from '../common/ColorSwatches'
import { PlusIcon, TrashIcon } from '../common/Icon'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900'

const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

/** Preset exam timers for quick insertion — saves teachers time when building IELTS workflows. */
const EXAM_TIMER_PRESETS = [
  { label: 'Time allowed', value: '40 min' },
  { label: 'Prep time', value: '1 min' },
  { label: 'Long turn', value: '2 min' },
  { label: 'Listening', value: '30 min' },
  { label: 'Reading', value: '60 min' },
]

/** Preset AI metrics for quick insertion in AI multi-agent workflows. */
export const AI_METRIC_PRESETS = [
  { label: 'temperature', value: '0.7' },
  { label: 'max_tokens', value: '2048' },
  { label: 'latency', value: '320ms' },
  { label: 'cost', value: '$0.002' },
  { label: 'token_count', value: '1.2k' },
  { label: 'accuracy', value: '98.5%' },
  { label: 'alignment', value: '0.94' },
]

const AI_MODEL_OPTIONS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'claude-3-5-haiku',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'deepseek-v3',
  'deepseek-r1',
  'llama-3.3-70b',
]

export function NodeEditorPanel() {
  const node = useWorkflowStore((s) => {
    const wf = s.activeId ? s.workflows[s.activeId] : null
    return wf?.nodes.find((n) => n.selected) ?? null
  })
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const updateWorkflowMeta = useWorkflowStore((s) => s.updateWorkflowMeta)
  const activeId = useWorkflowStore((s) => s.activeId)
  const activeWorkflow = useWorkflowStore((s) => (s.activeId ? s.workflows[s.activeId] : null))
  const deleteNode = useWorkflowStore((s) => s.deleteNode)

  if (!node) {
    return (
      <aside className="flex w-72 shrink-0 items-center justify-center border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          Select a node to edit its content, metrics, and playback duration.
        </p>
      </aside>
    )
  }

  const { data } = node
  const meta = NODE_TYPE_META[data.nodeType]
  const update = (patch: Partial<WorkflowNodeData>) => updateNodeData(node.id, patch)
  const metrics = data.metrics ?? []
  const isNote = data.nodeType === 'note'
  const isAgent = data.nodeType === 'agent'
  const isModel = data.nodeType === 'llm-model'
  const isTool = data.nodeType === 'tool'
  const isPrompt = data.nodeType === 'prompt'
  const isAINode = isAgent || isModel || isTool || isPrompt || activeWorkflow?.category === 'ai'

  const setMetric = (index: number, patch: Partial<NodeMetric>) => {
    update({ metrics: metrics.map((m, i) => (i === index ? { ...m, ...patch } : m)) })
  }

  const addPresetMetric = (preset: { label: string; value: string }) => {
    update({ metrics: [...metrics, { label: preset.label, value: preset.value }] })
  }

  // Extract detected template variables from prompt fields
  const detectedVariables = Array.from(
    new Set(
      `${data.systemPrompt ?? ''} ${data.userPrompt ?? ''}`
        .match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? [],
    ),
  )

  // Note nodes use a yellow background color by default
  const noteColor = data.color ?? '#fef08a'

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-white"
          style={{ backgroundColor: isNote ? '#eab308' : nodeColor(data) }}
        >
          {meta.label} NODE
        </span>
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          title="Delete node"
          className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Label */}
      <div>
        <label className={labelClass} htmlFor="ne-label">Label</label>
        <input
          id="ne-label"
          className={inputClass}
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>

      {/* Note: colour picker for sticky note background */}
      {isNote ? (
        <div>
          <span className={labelClass}>Note background colour</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'].map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => update({ color: c })}
                className="h-6 w-6 rounded border-2 transition"
                style={{
                  backgroundColor: c,
                  borderColor: noteColor === c ? '#1e3a8a' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Short description */}
      <div>
        <label className={labelClass} htmlFor="ne-desc">Short description</label>
        <input
          id="ne-desc"
          className={inputClass}
          value={data.description ?? ''}
          placeholder="Shown on the node card"
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      {/* ── Specialized AI Node Configurations ───────────────────────────── */}

      {/* AGENT Configuration */}
      {isAgent && (
        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900/50 dark:bg-violet-950/20">
          <h3 className="mb-2 text-xs font-semibold text-violet-900 dark:text-violet-300">
            🤖 Agent Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="ne-agent-model">Assigned Model</label>
              <div className="flex gap-1.5">
                <select
                  id="ne-agent-model"
                  className={`${inputClass} text-xs`}
                  value={AI_MODEL_OPTIONS.includes(data.model ?? '') ? (data.model ?? '') : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      update({ model: e.target.value })
                    }
                  }}
                >
                  <option value="">Select model...</option>
                  {AI_MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="custom">Custom model...</option>
                </select>
              </div>
              <input
                className={`${inputClass} mt-1.5 text-xs font-mono`}
                placeholder="Model name (e.g. gpt-4o)"
                value={data.model ?? ''}
                onChange={(e) => update({ model: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ne-agent-inst">System Instructions</label>
              <textarea
                id="ne-agent-inst"
                className={`${inputClass} min-h-20 resize-y text-xs font-mono`}
                placeholder="You are an expert AI reviewer that..."
                value={data.systemInstructions ?? ''}
                onChange={(e) => update({ systemInstructions: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* LLM MODEL Configuration */}
      {isModel && (
        <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <h3 className="mb-2 text-xs font-semibold text-cyan-900 dark:text-cyan-300">
            🧠 Model Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="ne-model-select">Model Identifier</label>
              <select
                id="ne-model-select"
                className={`${inputClass} text-xs mb-1.5`}
                value={AI_MODEL_OPTIONS.includes(data.model ?? '') ? (data.model ?? '') : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    update({ model: e.target.value })
                  }
                }}
              >
                <option value="">Select model...</option>
                {AI_MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="custom">Custom model...</option>
              </select>
              <input
                className={`${inputClass} text-xs font-mono`}
                placeholder="Model ID (e.g. gpt-4o, claude-3-5-sonnet)"
                value={data.model ?? ''}
                onChange={(e) => update({ model: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass} htmlFor="ne-model-temp">
                  Temperature: <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">{data.temperature ?? 0.7}</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="ne-model-temp"
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  className="w-full accent-cyan-600"
                  value={data.temperature ?? 0.7}
                  onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.05"
                  className={`${inputClass} w-20 text-xs`}
                  value={data.temperature ?? 0.7}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    update({ temperature: isNaN(v) ? 0.7 : v })
                  }}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="ne-model-tokens">Max Tokens</label>
              <input
                id="ne-model-tokens"
                type="number"
                min="1"
                step="256"
                className={`${inputClass} text-xs font-mono`}
                placeholder="2048"
                value={data.maxTokens ?? 2048}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  update({ maxTokens: isNaN(v) ? 2048 : v })
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TOOL Configuration */}
      {isTool && (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-900/50 dark:bg-orange-950/20">
          <h3 className="mb-2 text-xs font-semibold text-orange-900 dark:text-orange-300">
            🔧 Tool / API Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="ne-tool-endpoint">API Endpoint / Tool URI</label>
              <input
                id="ne-tool-endpoint"
                className={`${inputClass} text-xs font-mono`}
                placeholder="https://api.example.com/v1/search or tool://search"
                value={data.apiEndpoint ?? ''}
                onChange={(e) => update({ apiEndpoint: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ne-tool-method">HTTP Method / Protocol</label>
              <select
                id="ne-tool-method"
                className={`${inputClass} text-xs`}
                value={data.httpMethod ?? 'POST'}
                onChange={(e) => update({ httpMethod: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'RPC' })}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="RPC">RPC</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="ne-tool-sig">Function Signature / Schema</label>
              <textarea
                id="ne-tool-sig"
                className={`${inputClass} min-h-20 resize-y text-xs font-mono`}
                placeholder="search(query: string, top_k?: number): Promise<Result[]>"
                spellCheck={false}
                value={data.functionSignature ?? ''}
                onChange={(e) => update({ functionSignature: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* PROMPT Configuration */}
      {isPrompt && (
        <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3 dark:border-pink-900/50 dark:bg-pink-950/20">
          <h3 className="mb-2 text-xs font-semibold text-pink-900 dark:text-pink-300">
            💬 Prompt Template Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass} htmlFor="ne-prompt-sys">System Prompt</label>
              <textarea
                id="ne-prompt-sys"
                className={`${inputClass} min-h-16 resize-y text-xs font-mono`}
                placeholder="You are a helpful assistant..."
                value={data.systemPrompt ?? ''}
                onChange={(e) => update({ systemPrompt: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ne-prompt-usr">User Prompt Template</label>
              <textarea
                id="ne-prompt-usr"
                className={`${inputClass} min-h-20 resize-y text-xs font-mono`}
                placeholder="Summarize {{context}} for user query: {{query}}"
                value={data.userPrompt ?? ''}
                onChange={(e) => update({ userPrompt: e.target.value })}
              />
            </div>

            {/* Variable helpers */}
            <div>
              <span className="text-[11px] font-medium text-pink-900 dark:text-pink-300">Quick variables:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {['{{query}}', '{{context}}', '{{input}}', '{{history}}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      const current = data.userPrompt ?? ''
                      update({ userPrompt: current ? `${current} ${v}` : v })
                    }}
                    className="rounded border border-pink-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-pink-700 hover:bg-pink-100 dark:border-pink-800 dark:bg-gray-800 dark:text-pink-300"
                  >
                    + {v}
                  </button>
                ))}
              </div>
              {detectedVariables.length > 0 && (
                <div className="mt-2 text-[10px] text-pink-800 dark:text-pink-400">
                  Detected variables:{' '}
                  {detectedVariables.map((v) => (
                    <span key={v} className="mr-1 inline-block rounded bg-pink-100 px-1 py-0.2 font-mono font-medium dark:bg-pink-900/50">
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div>
        <label className={labelClass} htmlFor="ne-details">Details</label>
        <textarea
          id="ne-details"
          className={`${inputClass} min-h-24 resize-y`}
          value={data.details ?? ''}
          placeholder={isNote ? 'Exam tip, vocabulary note, or teacher reminder…' : 'Long-form text for the showcase panel'}
          onChange={(e) => update({ details: e.target.value })}
        />
      </div>

      {/* Code snippet — hidden for note nodes */}
      {!isNote && (
        <div>
          <label className={labelClass} htmlFor="ne-code">Code snippet</label>
          <textarea
            id="ne-code"
            className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
            value={data.codeSnippet ?? ''}
            spellCheck={false}
            onChange={(e) => update({ codeSnippet: e.target.value })}
          />
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className={labelClass} htmlFor="ne-image">Image URL</label>
        <input
          id="ne-image"
          className={inputClass}
          value={data.imageUrl ?? ''}
          placeholder="https://…"
          onChange={(e) => update({ imageUrl: e.target.value })}
        />
      </div>

      {/* Node color (only for non-note nodes) */}
      {!isNote && (
        <div>
          <span className={labelClass}>Node color</span>
          <ColorSwatches
            value={data.color}
            onChange={(color) => update({ color })}
            defaultLabel="Type default"
          />
        </div>
      )}

      {/* Playback dwell */}
      <div>
        <label className={labelClass} htmlFor="ne-duration">Playback dwell (ms)</label>
        <input
          id="ne-duration"
          type="number"
          min={200}
          step={100}
          className={inputClass}
          value={data.duration ?? 2000}
          onChange={(e) => {
            const value = Number.parseInt(e.target.value, 10)
            update({ duration: Number.isFinite(value) && value > 0 ? value : 2000 })
          }}
        />
      </div>

      {/* Metrics section */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={labelClass.replace('mb-1 ', '')}>Metrics</span>
          <button
            type="button"
            onClick={() => update({ metrics: [...metrics, { label: '', value: '' }] })}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800"
          >
            <PlusIcon width={12} height={12} /> Add
          </button>
        </div>

        {/* 🤖 AI Metric shortcuts */}
        {isAINode && (
          <div className="mb-2">
            <p className="mb-1 text-[10px] text-gray-400 dark:text-gray-500">⚡ AI quick-insert</p>
            <div className="flex flex-wrap gap-1">
              {AI_METRIC_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addPresetMetric(preset)}
                  title={`Add "${preset.label}: ${preset.value}"`}
                  className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900"
                >
                  {preset.label}: {preset.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ⏱ Exam Timer shortcuts */}
        <div className="mb-2">
          <p className="mb-1 text-[10px] text-gray-400 dark:text-gray-500">⏱ IELTS quick-insert</p>
          <div className="flex flex-wrap gap-1">
            {EXAM_TIMER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addPresetMetric(preset)}
                title={`Add "${preset.label}: ${preset.value}"`}
                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
              >
                {preset.value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {metrics.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No metrics yet.</p>
          )}
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                className={`${inputClass} w-1/2`}
                value={m.label}
                placeholder="Label"
                onChange={(e) => setMetric(i, { label: e.target.value })}
              />
              <input
                className={`${inputClass} w-1/2`}
                value={m.value}
                placeholder="Value"
                onChange={(e) => setMetric(i, { value: e.target.value })}
              />
              <button
                type="button"
                title="Remove metric"
                onClick={() => update({ metrics: metrics.filter((_, j) => j !== i) })}
                className="shrink-0 rounded-md p-1 text-gray-400 transition hover:text-rose-600"
              >
                <TrashIcon width={13} height={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow-level tags (shown at the bottom for quick access) */}
      {activeId && activeWorkflow && (
        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
          <label className={labelClass} htmlFor="wf-tags">Workflow tags</label>
          <input
            id="wf-tags"
            className={inputClass}
            value={activeWorkflow.tags?.join(', ') ?? ''}
            placeholder="ielts, writing, task 2"
            onChange={(e) => {
              const tags = e.target.value
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean)
              updateWorkflowMeta(activeId, { tags })
            }}
          />
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            Comma-separated. Used for library search & filtering.
          </p>
        </div>
      )}
    </aside>
  )
}
