import { ROICalculator } from './ROICalculator'
import { useState } from 'react'
import type { Workflow, WorkflowNode } from '../../types/workflow'
import { NODE_TYPE_META, nodeColor } from '../canvas/shared'
import {
  AgentIcon,
  CopyIcon,
  ModelIcon,
  PlayIcon,
  PromptIcon,
  ToolIcon,
} from '../common/Icon'

interface Props {
  workflow: Workflow
  node: WorkflowNode | null
  stepIndex: number
  stepCount: number
  onPlay: () => void
}

/**
 * Interactive copy-to-clipboard button with visual feedback.
 */
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      {copied ? (
        <>
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="text-emerald-600 dark:text-emerald-400"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon width={12} height={12} />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

interface ScoreDetails {
  percentage: number
  tier: 'emerald' | 'blue' | 'amber' | 'rose'
  bgGradient: string
  ratingLabel: string
}

/**
 * Parses metrics related to AI accuracy/alignment/evaluation or IELTS band scores.
 */
function parseScoreMetric(label: string, value: string): ScoreDetails | null {
  const l = label.toLowerCase().trim()
  const v = value.trim()

  const scoreKeywords = [
    'alignment',
    'accuracy',
    'quality',
    'confidence',
    'grounding',
    'precision',
    'recall',
    'f1',
    'eval',
    'pass rate',
    'score',
    'band',
    'target',
    'rate',
    'relevance',
  ]

  const hasScoreKeyword = scoreKeywords.some((k) => l.includes(k))
  const isPercentValue = /%/.test(v)
  const isBandValue = /\b(?:b|band)\s*[5-9]/i.test(v)

  if (!hasScoreKeyword && !isPercentValue && !isBandValue) {
    return null
  }

  let percentage = 0
  let explicitTier: 'emerald' | 'blue' | 'amber' | 'rose' | null = null
  let ratingLabel = ''

  // 1. Percentage check (e.g. "98.5%", "94%")
  const pctMatch = v.match(/(\d+(?:\.\d+)?)\s*%/)
  if (pctMatch) {
    percentage = Math.min(100, Math.max(0, parseFloat(pctMatch[1])))
  }
  // 2. Fraction check (e.g. "30/40", "38/40")
  else if (/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.test(v)) {
    const fracMatch = v.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
    if (fracMatch) {
      const num = parseFloat(fracMatch[1])
      const den = parseFloat(fracMatch[2])
      if (den > 0) {
        percentage = Math.min(100, Math.max(0, Math.round((num / den) * 100)))
      }
    }
  }
  // 3. IELTS band score (e.g. "B7.5", "Band 8.0", "B7 TA", "B7", "8.5", "Band 7")
  else if (l.includes('band') || /\b(?:b|band)\s*[5-9]/i.test(v)) {
    const bandMatch = v.match(/\b([5-9](?:\.[05])?)\b/)
    if (bandMatch) {
      const band = parseFloat(bandMatch[1])
      percentage = Math.min(100, Math.max(0, Math.round((band / 9) * 100)))
      if (band >= 8) {
        explicitTier = 'emerald'
        ratingLabel = `Band ${band} (Expert)`
      } else if (band >= 7) {
        explicitTier = 'blue'
        ratingLabel = `Band ${band} (Good)`
      } else if (band >= 6) {
        explicitTier = 'amber'
        ratingLabel = `Band ${band} (Competent)`
      } else {
        explicitTier = 'rose'
        ratingLabel = `Band ${band} (Modest)`
      }
    }
  }
  // 4. Decimal float (e.g. "0.94", "0.85")
  else if (/^0?\.\d+$/.test(v)) {
    const dec = parseFloat(v)
    if (!isNaN(dec)) {
      percentage = Math.min(100, Math.max(0, Math.round(dec * 100)))
    }
  }
  // 5. Raw number
  else {
    const numMatch = v.match(/^(\d+(?:\.\d+)?)$/)
    if (numMatch) {
      const num = parseFloat(numMatch[1])
      if (num <= 1.0) {
        percentage = Math.min(100, Math.max(0, Math.round(num * 100)))
      } else if (num <= 100) {
        percentage = Math.min(100, Math.max(0, Math.round(num)))
      }
    }
  }

  const tier: 'emerald' | 'blue' | 'amber' | 'rose' =
    explicitTier ??
    (percentage >= 90
      ? 'emerald'
      : percentage >= 75
        ? 'blue'
        : percentage >= 60
          ? 'amber'
          : 'rose')

  if (!ratingLabel) {
    if (percentage >= 90) ratingLabel = 'Excellent (≥90%)'
    else if (percentage >= 75) ratingLabel = 'Good (75–89%)'
    else if (percentage >= 60) ratingLabel = 'Moderate (60–74%)'
    else ratingLabel = 'Needs Improvement (<60%)'
  }

  const bgGradient =
    tier === 'emerald'
      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
      : tier === 'blue'
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
        : tier === 'amber'
          ? 'bg-gradient-to-br from-amber-500 to-orange-500'
          : 'bg-gradient-to-br from-rose-500 to-red-600'

  return {
    percentage,
    tier,
    bgGradient,
    ratingLabel,
  }
}

/**
 * Checks if a metric represents financial or token economics.
 */
function isFinancialMetric(label: string, value: string): boolean {
  const l = label.toLowerCase()
  const v = value.toLowerCase().trim()
  const keywords = ['cost', 'price', 'token_count', 'tokens', 'token', 'spend', 'budget', 'usd', 'pricing']
  return (
    keywords.some((k) => l.includes(k)) ||
    v.startsWith('$') ||
    v.endsWith('$') ||
    /\b\d+(\.\d+)?\s*(tokens|tok)\b/i.test(v)
  )
}

/**
 * Checks if a metric represents latency or execution timing.
 */
function isSpeedMetric(label: string, value: string): boolean {
  const l = label.toLowerCase()
  const v = value.toLowerCase().trim()
  const keywords = ['latency', 'duration', 'speed', 'ttft', 'dwell', 'elapsed']
  const isTimeKeyword = keywords.some((k) => l.includes(k))
  const isTimeValue = /\b\d+(\.\d+)?\s*(ms|s|sec|min)\b/i.test(v)
  return isTimeKeyword || isTimeValue
}

/**
 * Classifies latency duration into qualitative speed tier.
 */
function getSpeedCategory(value: string): string {
  const msMatch = value.match(/(\d+(?:\.\d+)?)\s*ms/i)
  if (msMatch) {
    const ms = parseFloat(msMatch[1])
    if (ms < 350) return '⚡ Fast (<350ms)'
    if (ms < 1000) return '⏱ Normal (<1s)'
    return '⏳ High latency (>1s)'
  }
  const sMatch = value.match(/(\d+(?:\.\d+)?)\s*s\b/i)
  if (sMatch) {
    const s = parseFloat(sMatch[1])
    if (s < 1.5) return '⚡ Fast (<1.5s)'
    if (s < 5) return '⏱ Normal (<5s)'
    return '⏳ High dwell'
  }
  const minMatch = value.match(/(\d+(?:\.\d+)?)\s*min/i)
  if (minMatch) {
    return '⏱ Timed stage'
  }
  return '⚡ Latency / Timing'
}

/**
 * Checks if a metric represents model hyperparameters or system configuration.
 */
function isHyperparamMetric(label: string): boolean {
  const l = label.toLowerCase()
  const keywords = [
    'temperature',
    'temp',
    'max_tokens',
    'max_token',
    'top_p',
    'top_k',
    'dimensions',
    'dim',
    'throughput',
    'model',
    'context_window',
  ]
  return keywords.some((k) => l === k || l.includes(k))
}

export function NodeDetailPanel({ workflow, node, stepIndex, stepCount, onPlay }: Props) {
  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center gap-4 border-l border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-xl font-bold">{workflow.name}</h2>
          {workflow.description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
          )}
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {workflow.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onPlay}
          disabled={stepCount === 0}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          <PlayIcon /> Start walkthrough
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {stepCount} {stepCount === 1 ? 'step' : 'steps'} in this workflow
        </p>
      </aside>
    )
  }

  const meta = NODE_TYPE_META[node.data.nodeType]
  const metrics = node.data.metrics?.filter((m) => m.label || m.value) ?? []

  const hasModelConfig =
    Boolean(node.data.model) ||
    node.data.temperature !== undefined ||
    node.data.maxTokens !== undefined

  const hasToolConfig =
    Boolean(node.data.functionSignature) ||
    Boolean(node.data.apiEndpoint)

  const systemText = node.data.systemInstructions ?? node.data.systemPrompt ?? ''
  const hasSystemPrompt = Boolean(systemText.trim())

  const userPromptText = node.data.userPrompt ?? ''
  const hasUserPrompt = Boolean(userPromptText.trim())
  const detectedUserVars = hasUserPrompt
    ? Array.from(new Set(userPromptText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? []))
    : []

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      {/* Top Bar: Node Type & Step Progress */}
      <div className="flex items-center justify-between">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider text-white"
          style={{ backgroundColor: nodeColor(node.data) }}
        >
          {meta.label}
        </span>
        <span className="text-xs font-medium tabular-nums text-gray-400 dark:text-gray-500">
          {stepIndex + 1} / {stepCount}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h2 className="text-lg font-bold leading-tight">{node.data.label}</h2>
        {node.data.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{node.data.description}</p>
        )}
      </div>

      {/* ── Model Configuration Card ────────────────────────────────────── */}
      {hasModelConfig && (
        <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/40 p-3.5 shadow-xs dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400">
              <ModelIcon width={14} height={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-200">
              Model Configuration
            </span>
          </div>

          {node.data.model && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-cyan-200/60 bg-white/80 px-2.5 py-1.5 dark:border-cyan-900/40 dark:bg-gray-900/80">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Model ID</span>
              <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                {node.data.model}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {node.data.temperature !== undefined && (
              <div className="rounded-lg border border-cyan-200/60 bg-white/80 p-2 dark:border-cyan-900/40 dark:bg-gray-900/80">
                <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                  Temperature
                </span>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-sm font-bold text-cyan-800 dark:text-cyan-200">
                    {node.data.temperature}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {node.data.temperature < 0.3
                      ? 'Deterministic'
                      : node.data.temperature > 0.8
                        ? 'Creative'
                        : 'Balanced'}
                  </span>
                </div>
              </div>
            )}
            {node.data.maxTokens !== undefined && (
              <div className="rounded-lg border border-cyan-200/60 bg-white/80 p-2 dark:border-cyan-900/40 dark:bg-gray-900/80">
                <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                  Max Tokens
                </span>
                <div className="mt-0.5 font-mono text-sm font-bold text-cyan-800 dark:text-cyan-200">
                  {node.data.maxTokens.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tool / API Definition Card ───────────────────────────────────── */}
      {hasToolConfig && (
        <div className="rounded-xl border border-orange-200/80 bg-orange-50/40 p-3.5 shadow-xs dark:border-orange-900/50 dark:bg-orange-950/20">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400">
                <ToolIcon width={14} height={14} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-200">
                Tool & API Interface
              </span>
            </div>
            {node.data.httpMethod && (
              <span className="rounded bg-orange-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                {node.data.httpMethod}
              </span>
            )}
          </div>

          {node.data.apiEndpoint && (
            <div className="mb-2 rounded-lg border border-orange-200/60 bg-white/80 p-2 dark:border-orange-900/40 dark:bg-gray-900/80">
              <div className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                Endpoint URI
              </div>
              <div className="mt-0.5 truncate font-mono text-xs text-orange-900 dark:text-orange-200">
                {node.data.apiEndpoint}
              </div>
            </div>
          )}

          {node.data.functionSignature && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                  Signature / Schema
                </span>
                <CopyButton text={node.data.functionSignature} />
              </div>
              <pre className="max-h-36 overflow-x-auto rounded-lg bg-gray-950 p-2.5 font-mono text-[11px] leading-relaxed text-orange-200">
                <code>{node.data.functionSignature}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── System Instructions / Prompt Card ────────────────────────────── */}
      {hasSystemPrompt && (
        <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-3.5 shadow-xs dark:border-violet-900/50 dark:bg-violet-950/20">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                <AgentIcon width={14} height={14} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-900 dark:text-violet-200">
                {node.data.systemInstructions ? 'System Instructions' : 'System Prompt'}
              </span>
            </div>
            <CopyButton text={systemText} />
          </div>
          <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-violet-200/60 bg-white/90 p-2.5 font-mono text-xs leading-relaxed text-violet-950 dark:border-violet-900/40 dark:bg-gray-950 dark:text-violet-200">
            {systemText}
          </pre>
        </div>
      )}

      {/* ── User Prompt Template Card ────────────────────────────────────── */}
      {hasUserPrompt && (
        <div className="rounded-xl border border-pink-200/80 bg-pink-50/40 p-3.5 shadow-xs dark:border-pink-900/50 dark:bg-pink-950/20">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400">
                <PromptIcon width={14} height={14} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-900 dark:text-pink-200">
                Prompt Template
              </span>
            </div>
            <CopyButton text={userPromptText} />
          </div>
          <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-pink-200/60 bg-white/90 p-2.5 font-mono text-xs leading-relaxed text-pink-950 dark:border-pink-900/40 dark:bg-gray-950 dark:text-pink-200">
            {userPromptText}
          </pre>
          {detectedUserVars.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-pink-900/70 dark:text-pink-300/70">
                Variables:
              </span>
              {detectedUserVars.map((v) => (
                <span
                  key={v}
                  className="rounded-md border border-pink-300/80 bg-pink-100/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-pink-800 dark:border-pink-800 dark:bg-pink-900/50 dark:text-pink-200"
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Long-Form Details Body */}
      {node.data.details && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {node.data.details}
        </p>
      )}

      {/* Image Preview */}
      {node.data.imageUrl && (
        <img
          src={node.data.imageUrl}
          alt={node.data.label}
          className="w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
        />
      )}

      {/* Code Snippet Box */}
      {node.data.codeSnippet && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Code Snippet
            </span>
            <CopyButton text={node.data.codeSnippet} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-gray-100">
            <code>{node.data.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* ── Metrics & Scores Section ─────────────────────────────────────── */}
      {metrics.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Metrics & Performance
          </div>
          <div className="grid grid-cols-2 gap-2">
            {metrics.map((m, i) => {
              const score = parseScoreMetric(m.label, m.value)

              // 1. AI Score & IELTS Band Visualizer
              if (score) {
                return (
                  <div
                    key={i}
                    className={`col-span-1 relative flex flex-col justify-between overflow-hidden rounded-xl p-3 shadow-xs ${score.bgGradient} text-white`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] font-bold uppercase tracking-wider opacity-90">
                        {m.label}
                      </span>
                      {score.percentage >= 90 && (
                        <span className="shrink-0 text-xs" title="High Performance">
                          ✨
                        </span>
                      )}
                    </div>
                    <div className="my-1 text-xl font-black leading-tight tracking-tight">
                      {m.value}
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 w-full">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/25">
                        <div
                          className="h-full rounded-full bg-white/90 transition-all duration-300"
                          style={{ width: `${score.percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[9px] font-medium opacity-85">
                        <span className="truncate">{score.ratingLabel}</span>
                        <span className="font-mono">{score.percentage}%</span>
                      </div>
                    </div>
                  </div>
                )
              }

              // 2. Cost & Financial Badges
              if (isFinancialMetric(m.label, m.value)) {
                return (
                  <div
                    key={i}
                    className="col-span-1 flex flex-col justify-between rounded-xl border border-emerald-300/70 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-2.5 shadow-xs dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/20"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <span>💰</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                    <div className="my-1 font-mono text-base font-extrabold tabular-nums tracking-tight text-emerald-950 dark:text-emerald-100">
                      {m.value}
                    </div>
                    <div className="text-[9px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                      Cost & Token Econ
                    </div>
                  </div>
                )
              }

              // 3. Latency & Speed Badges
              if (isSpeedMetric(m.label, m.value)) {
                return (
                  <div
                    key={i}
                    className="col-span-1 flex flex-col justify-between rounded-xl border border-violet-300/70 bg-gradient-to-br from-violet-50/90 to-purple-50/50 p-2.5 shadow-xs dark:border-violet-800/60 dark:from-violet-950/40 dark:to-purple-950/20"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                      <span>⚡</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                    <div className="my-1 font-mono text-base font-extrabold tabular-nums tracking-tight text-violet-950 dark:text-violet-100">
                      {m.value}
                    </div>
                    <div className="truncate text-[9px] font-medium text-violet-600/80 dark:text-violet-400/80">
                      {getSpeedCategory(m.value)}
                    </div>
                  </div>
                )
              }

              // 4. Model Hyperparameters & Configuration Badges
              if (isHyperparamMetric(m.label)) {
                return (
                  <div
                    key={i}
                    className="col-span-1 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/90 p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-800/60"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      <span>⚙️</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                    <div className="my-1 font-mono text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {m.value}
                    </div>
                    <div className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                      Model Param
                    </div>
                  </div>
                )
              }

              // 5. Standard Metric Card Fallback
              return (
                <div
                  key={i}
                  className="col-span-1 flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50/90 p-2.5 shadow-xs dark:border-gray-700 dark:bg-gray-800/80"
                >
                  <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {m.label}
                  </div>
                  <div className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {m.value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ROI Calculator ─────────────────────────────────────── */}
      {(!node || node.data.nodeType === 'end' || node.data.nodeType === 'start') && (
        <ROICalculator workflow={workflow} />
      )}
    </aside>
  )
}
