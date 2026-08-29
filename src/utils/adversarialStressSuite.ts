/// <reference types="node" />

import process from 'node:process'
import LZStringPkg from 'lz-string'
import {
  createSampleWorkflows,
  ragPipeline,
  multiAgentReflection,
} from './sampleWorkflows'
import { AI_METRIC_PRESETS } from '../components/builder/aiMetricPresets'
import { NODE_TYPE_META, COLOR_PALETTE, nodeColor, decorateEdge } from '../components/canvas/shared'
import type { Workflow, WorkflowNode, WorkflowNodeType } from '../types/workflow'
import { useWorkflowStore } from '../store/workflowStore'

// Handle default/named export interoperability for lz-string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LZString: any = (LZStringPkg as any).default || LZStringPkg
const compressToEncodedURIComponent: (s: string) => string = LZString.compressToEncodedURIComponent
const decompressFromEncodedURIComponent: (s: string) => string = LZString.decompressFromEncodedURIComponent

const SHARE_URL_WARN_LENGTH = 8000
const WORKFLOW_NODE_TYPES = new Set([
  'start',
  'task',
  'decision',
  'end',
  'note',
  'agent',
  'llm-model',
  'tool',
  'prompt',
])
const EDGE_LINE_STYLES = new Set(['smooth', 'bezier', 'straight', 'step'])
const EDGE_ARROWS = new Set(['closed', 'open', 'none'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidWorkflow(value: unknown): value is Workflow {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.length === 0 ||
    typeof value.name !== 'string' ||
    typeof value.description !== 'string' ||
    !isFiniteNumber(value.createdAt) ||
    !isFiniteNumber(value.updatedAt) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges)
  ) {
    return false
  }

  const nodeIds = new Set<string>()
  for (const node of value.nodes) {
    if (!isRecord(node) || typeof node.id !== 'string' || node.id.length === 0 || nodeIds.has(node.id)) {
      return false
    }
    if (
      node.type !== 'workflow' ||
      !isRecord(node.position) ||
      !isFiniteNumber(node.position.x) ||
      !isFiniteNumber(node.position.y) ||
      !isRecord(node.data) ||
      typeof node.data.nodeType !== 'string' ||
      !WORKFLOW_NODE_TYPES.has(node.data.nodeType) ||
      typeof node.data.label !== 'string'
    ) {
      return false
    }

    const data = node.data
    if (
      (data.description !== undefined && typeof data.description !== 'string') ||
      (data.details !== undefined && typeof data.details !== 'string') ||
      (data.codeSnippet !== undefined && typeof data.codeSnippet !== 'string') ||
      (data.imageUrl !== undefined && typeof data.imageUrl !== 'string') ||
      (data.color !== undefined && typeof data.color !== 'string') ||
      (data.duration !== undefined && (!isFiniteNumber(data.duration) || data.duration <= 0)) ||
      (data.systemInstructions !== undefined && typeof data.systemInstructions !== 'string') ||
      (data.model !== undefined && typeof data.model !== 'string') ||
      (data.temperature !== undefined && !isFiniteNumber(data.temperature)) ||
      (data.maxTokens !== undefined && (!isFiniteNumber(data.maxTokens) || data.maxTokens <= 0)) ||
      (data.functionSignature !== undefined && typeof data.functionSignature !== 'string') ||
      (data.apiEndpoint !== undefined && typeof data.apiEndpoint !== 'string') ||
      (data.httpMethod !== undefined && typeof data.httpMethod !== 'string') ||
      (data.systemPrompt !== undefined && typeof data.systemPrompt !== 'string') ||
      (data.userPrompt !== undefined && typeof data.userPrompt !== 'string') ||
      (data.metrics !== undefined &&
        (!Array.isArray(data.metrics) ||
          data.metrics.some(
            (metric) =>
              !isRecord(metric) || typeof metric.label !== 'string' || typeof metric.value !== 'string',
          )))
    ) {
      return false
    }
    nodeIds.add(node.id)
  }

  const edgeIds = new Set<string>()
  for (const edge of value.edges) {
    if (
      !isRecord(edge) ||
      typeof edge.id !== 'string' ||
      edge.id.length === 0 ||
      edgeIds.has(edge.id) ||
      typeof edge.source !== 'string' ||
      typeof edge.target !== 'string' ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target) ||
      (edge.label !== undefined && typeof edge.label !== 'string') ||
      (edge.animated !== undefined && typeof edge.animated !== 'boolean')
    ) {
      return false
    }

    if (edge.data !== undefined) {
      if (!isRecord(edge.data)) return false
      const data = edge.data
      if (
        (data.lineStyle !== undefined &&
          (typeof data.lineStyle !== 'string' || !EDGE_LINE_STYLES.has(data.lineStyle))) ||
        (data.arrowEnd !== undefined &&
          (typeof data.arrowEnd !== 'string' || !EDGE_ARROWS.has(data.arrowEnd))) ||
        (data.arrowStart !== undefined &&
          (typeof data.arrowStart !== 'string' || !EDGE_ARROWS.has(data.arrowStart))) ||
        (data.dashed !== undefined && typeof data.dashed !== 'boolean') ||
        (data.color !== undefined && typeof data.color !== 'string')
      ) {
        return false
      }
    }
    edgeIds.add(edge.id)
  }

  return true
}

function probeEncode(wf: Workflow): string {
  return compressToEncodedURIComponent(JSON.stringify(wf))
}

function probeDecode(encoded: string): Workflow | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const value: unknown = JSON.parse(json)
    return isValidWorkflow(value) ? value : null
  } catch {
    return null
  }
}

// ANSI colors
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
}

interface TestResult {
  suite: string
  name: string
  passed: boolean
  durationMs: number
  error?: Error | string
}

class AdversarialHarness {
  private results: TestResult[] = []
  private currentSuite = 'Adversarial'

  suite(name: string, fn: () => void) {
    this.currentSuite = name
    fn()
  }

  test(name: string, fn: () => void) {
    const start = performance.now()
    try {
      fn()
      const durationMs = performance.now() - start
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: true,
        durationMs,
      })
    } catch (err) {
      const durationMs = performance.now() - start
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: false,
        durationMs,
        error: err instanceof Error ? err : String(err),
      })
    }
  }

  assert(condition: boolean, message: string) {
    if (!condition) throw new Error(`Assertion failed: ${message}`)
  }

  assertEqual<T>(actual: T, expected: T, message: string) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}. Expected [${expected}], got [${actual}]`)
    }
  }

  printReport(): boolean {
    console.log(`\n${ANSI.bold}${ANSI.magenta}================================================================================${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.magenta}          EDULOW ADVERSARIAL STRESS & EMPIRICAL CHALLENGE SUITE                 ${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.magenta}================================================================================${ANSI.reset}\n`)

    const suites = new Map<string, TestResult[]>()
    for (const r of this.results) {
      if (!suites.has(r.suite)) suites.set(r.suite, [])
      suites.get(r.suite)!.push(r)
    }

    let allPassed = true
    let totalPassed = 0
    let totalFailed = 0
    let totalDuration = 0

    for (const [suiteName, tests] of suites.entries()) {
      console.log(`${ANSI.bold}${ANSI.cyan}▶ ${suiteName}${ANSI.reset}`)
      for (const t of tests) {
        totalDuration += t.durationMs
        if (t.passed) {
          totalPassed++
          console.log(`  ${ANSI.green}✓${ANSI.reset} ${t.name} ${ANSI.dim}(${t.durationMs.toFixed(2)}ms)${ANSI.reset}`)
        } else {
          totalFailed++
          allPassed = false
          console.log(`  ${ANSI.red}✗${ANSI.reset} ${ANSI.bold}${t.name}${ANSI.reset} ${ANSI.dim}(${t.durationMs.toFixed(2)}ms)${ANSI.reset}`)
          if (t.error) {
            console.log(`    ${ANSI.red}Error: ${t.error instanceof Error ? t.error.message : t.error}${ANSI.reset}`)
          }
        }
      }
      console.log()
    }

    console.log(`${ANSI.bold}${ANSI.magenta}--------------------------------------------------------------------------------${ANSI.reset}`)
    console.log(`${ANSI.bold}STRESS TEST SUMMARY:${ANSI.reset}`)
    console.log(`Total tests: ${this.results.length} | Passed: ${totalPassed} | Failed: ${totalFailed} | Time: ${totalDuration.toFixed(2)}ms`)
    console.log(`Final Verdict: ${allPassed ? `${ANSI.bgGreen} CONFIRMED PASSED ${ANSI.reset}` : `${ANSI.bgRed} FAILED ${ANSI.reset}`}\n`)

    return allPassed
  }
}

export function runAdversarialStressSuite(): boolean {
  const h = new AdversarialHarness()
  const sampleMap = createSampleWorkflows()
  const samples = Object.values(sampleMap)

  // ═══════════════════════════════════════════════════════════════════════════
  // SUITE 1: URL Compression & Decompression Roundtrip Fidelity
  // ═══════════════════════════════════════════════════════════════════════════
  h.suite('1. URL Compression & Decompression Roundtrip Fidelity', () => {
    h.test('Roundtrip lossless encoding/decoding for all 9 sample workflows', () => {
      for (const wf of samples) {
        const encoded = probeEncode(wf)
        h.assert(typeof encoded === 'string' && encoded.length > 0, `Encoded string must be non-empty for ${wf.name}`)
        const decoded = probeDecode(encoded)
        h.assert(decoded !== null, `Decoded workflow must not be null for ${wf.name}`)
        h.assertEqual(decoded!.id, wf.id, `ID mismatch on ${wf.name}`)
        h.assertEqual(decoded!.name, wf.name, `Name mismatch on ${wf.name}`)
        h.assertEqual(decoded!.nodes.length, wf.nodes.length, `Node count mismatch on ${wf.name}`)
        h.assertEqual(decoded!.edges.length, wf.edges.length, `Edge count mismatch on ${wf.name}`)

        // Deep verify node data equivalence
        for (let i = 0; i < wf.nodes.length; i++) {
          const original = wf.nodes[i]
          const restored = decoded!.nodes[i]
          h.assertEqual(restored.id, original.id, `Node ID mismatch at index ${i}`)
          h.assertEqual(restored.data.nodeType, original.data.nodeType, `NodeType mismatch at index ${i}`)
          h.assertEqual(restored.data.label, original.data.label, `Label mismatch at index ${i}`)
          h.assertEqual(restored.data.model, original.data.model, `Model mismatch at index ${i}`)
          h.assertEqual(restored.data.temperature, original.data.temperature, `Temperature mismatch at index ${i}`)
          h.assertEqual(restored.data.maxTokens, original.data.maxTokens, `MaxTokens mismatch at index ${i}`)
          h.assertEqual(restored.data.systemInstructions, original.data.systemInstructions, `SystemInstructions mismatch at index ${i}`)
          h.assertEqual(restored.data.functionSignature, original.data.functionSignature, `FunctionSignature mismatch at index ${i}`)
          h.assertEqual(restored.data.apiEndpoint, original.data.apiEndpoint, `ApiEndpoint mismatch at index ${i}`)
          h.assertEqual(restored.data.httpMethod, original.data.httpMethod, `HttpMethod mismatch at index ${i}`)
          h.assertEqual(restored.data.systemPrompt, original.data.systemPrompt, `SystemPrompt mismatch at index ${i}`)
          h.assertEqual(restored.data.userPrompt, original.data.userPrompt, `UserPrompt mismatch at index ${i}`)
        }
      }
    })

    h.test('All sample workflows compress well below SHARE_URL_WARN_LENGTH (8000 chars)', () => {
      for (const wf of samples) {
        const encoded = probeEncode(wf)
        h.assert(
          encoded.length < SHARE_URL_WARN_LENGTH,
          `Workflow "${wf.name}" compressed length ${encoded.length} exceeds warning threshold ${SHARE_URL_WARN_LENGTH}`,
        )
      }
    })

    h.test('Specialized custom AI workflow with 100% field coverage roundtrips losslessly', () => {
      const fullAIWorkflow: Workflow = {
        id: 'full-ai-test-wf',
        name: 'Full AI Field Coverage Test',
        description: 'Testing every single optional AI field in schema',
        category: 'ai',
        tags: ['ai', 'test', 'stress', 'coverage'],
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
        nodes: [
          {
            id: 'n-agent-1',
            type: 'workflow',
            position: { x: 100, y: 100 },
            data: {
              nodeType: 'agent',
              label: 'Agent Node Full',
              description: 'Agent description',
              details: 'Agent long form details with\nmulti-line text & formatting',
              codeSnippet: 'const agent = new Agent({ role: "Lead" })',
              imageUrl: 'https://example.com/avatar.png',
              color: '#8b5cf6',
              duration: 3500,
              model: 'claude-3-5-sonnet',
              systemInstructions: 'You are an autonomous orchestrator agent.',
              metrics: [
                { label: 'alignment', value: '0.98' },
                { label: 'accuracy', value: '99.5%' },
                { label: 'latency', value: '320ms' },
                { label: 'cost', value: '$0.004' },
              ],
            },
          },
          {
            id: 'n-model-1',
            type: 'workflow',
            position: { x: 300, y: 100 },
            data: {
              nodeType: 'llm-model',
              label: 'LLM Model Node Full',
              model: 'gpt-4o',
              temperature: 0.15,
              maxTokens: 4096,
              metrics: [{ label: 'max_tokens', value: '4096' }],
            },
          },
          {
            id: 'n-tool-1',
            type: 'workflow',
            position: { x: 500, y: 100 },
            data: {
              nodeType: 'tool',
              label: 'Tool Node Full',
              apiEndpoint: 'https://api.gateway.internal/tools/v1',
              httpMethod: 'POST',
              functionSignature: 'searchDocs(q: string): Promise<Result[]>',
              metrics: [{ label: 'latency', value: '45ms' }],
            },
          },
          {
            id: 'n-prompt-1',
            type: 'workflow',
            position: { x: 700, y: 100 },
            data: {
              nodeType: 'prompt',
              label: 'Prompt Node Full',
              systemPrompt: 'System: You are an evaluator.',
              userPrompt: 'Context: {{context}}\nQuery: {{query}}\nHistory: {{history}}',
              metrics: [{ label: 'token_count', value: '1.5k' }],
            },
          },
        ],
        edges: [
          {
            id: 'e-1-2',
            source: 'n-agent-1',
            target: 'n-model-1',
            label: 'Invoke Model',
            animated: true,
            data: {
              lineStyle: 'bezier',
              arrowEnd: 'closed',
              arrowStart: 'open',
              dashed: true,
              color: '#8b5cf6',
            },
          },
          {
            id: 'e-2-3',
            source: 'n-model-1',
            target: 'n-tool-1',
            data: { lineStyle: 'straight', arrowEnd: 'open', dashed: false },
          },
          {
            id: 'e-3-4',
            source: 'n-tool-1',
            target: 'n-prompt-1',
            data: { lineStyle: 'step', arrowEnd: 'none' },
          },
        ],
      }

      const encoded = probeEncode(fullAIWorkflow)
      const decoded = probeDecode(encoded)
      h.assert(decoded !== null, 'Decoded full AI workflow must not be null')
      h.assertEqual(decoded!.nodes.length, 4, 'Must decode 4 nodes')
      h.assertEqual(decoded!.edges.length, 3, 'Must decode 3 edges')

      // Check specific AI fields
      const agent = decoded!.nodes.find((n) => n.id === 'n-agent-1')!
      h.assertEqual(agent.data.systemInstructions, 'You are an autonomous orchestrator agent.', 'systemInstructions preserved')
      h.assertEqual(agent.data.model, 'claude-3-5-sonnet', 'model preserved')

      const model = decoded!.nodes.find((n) => n.id === 'n-model-1')!
      h.assertEqual(model.data.temperature, 0.15, 'temperature preserved')
      h.assertEqual(model.data.maxTokens, 4096, 'maxTokens preserved')

      const tool = decoded!.nodes.find((n) => n.id === 'n-tool-1')!
      h.assertEqual(tool.data.functionSignature, 'searchDocs(q: string): Promise<Result[]>', 'functionSignature preserved')
      h.assertEqual(tool.data.apiEndpoint, 'https://api.gateway.internal/tools/v1', 'apiEndpoint preserved')
      h.assertEqual(tool.data.httpMethod, 'POST', 'httpMethod preserved')

      const prompt = decoded!.nodes.find((n) => n.id === 'n-prompt-1')!
      h.assertEqual(prompt.data.systemPrompt, 'System: You are an evaluator.', 'systemPrompt preserved')
      h.assertEqual(prompt.data.userPrompt, 'Context: {{context}}\nQuery: {{query}}\nHistory: {{history}}', 'userPrompt preserved')

      const edge1 = decoded!.edges.find((e) => e.id === 'e-1-2')!
      h.assertEqual(edge1.data?.lineStyle, 'bezier', 'lineStyle preserved')
      h.assertEqual(edge1.data?.arrowStart, 'open', 'arrowStart preserved')
      h.assertEqual(edge1.data?.dashed, true, 'dashed preserved')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SUITE 2: Malformed, Corrupted & Adversarial Payload Rejection
  // ═══════════════════════════════════════════════════════════════════════════
  h.suite('2. Malformed, Corrupted & Adversarial Payload Rejection', () => {
    h.test('Empty string, whitespace, and non-base64 strings return null safely without throwing', () => {
      h.assertEqual(probeDecode(''), null, 'Empty string returns null')
      h.assertEqual(probeDecode('   '), null, 'Whitespace returns null')
      h.assertEqual(probeDecode('undefined'), null, 'Literal "undefined" returns null')
      h.assertEqual(probeDecode('null'), null, 'Literal "null" returns null')
      h.assertEqual(probeDecode('{"foo": "bar"}'), null, 'Raw uncompressed JSON returns null')
      h.assertEqual(probeDecode('@@@$$$###%%%'), null, 'Garbage characters return null')
    })

    h.test('Truncated / damaged compressed payload returns null', () => {
      const valid = probeEncode(ragPipeline())
      const truncated = valid.slice(0, Math.floor(valid.length / 2))
      h.assertEqual(probeDecode(truncated), null, 'Truncated compressed string returns null')
    })

    h.test('Rejects invalid node types (e.g. "malicious-code", "admin", numbers)', () => {
      const invalidWf = {
        id: 'wf-bad-type',
        name: 'Bad NodeType',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          {
            id: 'n1',
            type: 'workflow',
            position: { x: 0, y: 0 },
            data: { nodeType: 'malicious-executor', label: 'Evil' },
          },
        ],
        edges: [],
      }
      const encoded = probeEncode(invalidWf as unknown as Workflow)
      h.assertEqual(probeDecode(encoded), null, 'Must reject invalid nodeType')
    })

    h.test('Rejects duplicate node IDs and duplicate edge IDs', () => {
      const dupNodesWf = {
        id: 'wf-dup-nodes',
        name: 'Duplicate Nodes',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          { id: 'node-x', type: 'workflow', position: { x: 0, y: 0 }, data: { nodeType: 'start', label: 'Start 1' } },
          { id: 'node-x', type: 'workflow', position: { x: 100, y: 100 }, data: { nodeType: 'end', label: 'Start 2' } },
        ],
        edges: [],
      }
      h.assertEqual(probeDecode(probeEncode(dupNodesWf as unknown as Workflow)), null, 'Must reject duplicate node IDs')

      const dupEdgesWf = {
        id: 'wf-dup-edges',
        name: 'Duplicate Edges',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          { id: 'n1', type: 'workflow', position: { x: 0, y: 0 }, data: { nodeType: 'start', label: 'Start' } },
          { id: 'n2', type: 'workflow', position: { x: 100, y: 100 }, data: { nodeType: 'end', label: 'End' } },
        ],
        edges: [
          { id: 'edge-1', source: 'n1', target: 'n2' },
          { id: 'edge-1', source: 'n1', target: 'n2' },
        ],
      }
      h.assertEqual(probeDecode(probeEncode(dupEdgesWf as unknown as Workflow)), null, 'Must reject duplicate edge IDs')
    })

    h.test('Rejects orphan edges (source/target pointing to nonexistent nodes)', () => {
      const orphanEdgeWf = {
        id: 'wf-orphan',
        name: 'Orphan Edge',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          { id: 'n1', type: 'workflow', position: { x: 0, y: 0 }, data: { nodeType: 'start', label: 'Start' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'nonexistent-target-99' },
        ],
      }
      h.assertEqual(probeDecode(probeEncode(orphanEdgeWf as unknown as Workflow)), null, 'Must reject orphan edge target')
    })

    h.test('Rejects invalid numbers (negative duration, negative maxTokens)', () => {
      const invalidDurationWf = {
        id: 'wf-invalid-num',
        name: 'Invalid Duration',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          { id: 'n1', type: 'workflow', position: { x: 0, y: 0 }, data: { nodeType: 'start', label: 'Start', duration: -500 } },
        ],
        edges: [],
      }
      h.assertEqual(probeDecode(probeEncode(invalidDurationWf as unknown as Workflow)), null, 'Must reject negative duration')

      const invalidTokensWf = {
        id: 'wf-invalid-tokens',
        name: 'Invalid Tokens',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          { id: 'n1', type: 'workflow', position: { x: 0, y: 0 }, data: { nodeType: 'llm-model', label: 'Model', maxTokens: -100 } },
        ],
        edges: [],
      }
      h.assertEqual(probeDecode(probeEncode(invalidTokensWf as unknown as Workflow)), null, 'Must reject negative maxTokens')
    })

    h.test('Rejects malformed metrics structure (non-string label/value)', () => {
      const badMetricsWf = {
        id: 'wf-bad-metric',
        name: 'Bad Metric',
        description: 'Test',
        createdAt: 1000,
        updatedAt: 1000,
        nodes: [
          {
            id: 'n1',
            type: 'workflow',
            position: { x: 0, y: 0 },
            data: {
              nodeType: 'agent',
              label: 'Agent',
              metrics: [{ label: '12345', value: true as unknown as string }],
            },
          },
        ],
        edges: [],
      }
      h.assertEqual(probeDecode(probeEncode(badMetricsWf as unknown as Workflow)), null, 'Must reject invalid metric types')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SUITE 3: AI Metric Presets & Scoring Robustness
  // ═══════════════════════════════════════════════════════════════════════════
  h.suite('3. AI Metric Presets & Showcase Scoring Robustness', () => {
    h.test('AI_METRIC_PRESETS contains all 7 mandated presets with non-empty values', () => {
      h.assert(Array.isArray(AI_METRIC_PRESETS), 'AI_METRIC_PRESETS must be an array')
      h.assertEqual(AI_METRIC_PRESETS.length, 7, 'Expected 7 presets')

      const expectedLabels = ['temperature', 'max_tokens', 'latency', 'cost', 'token_count', 'accuracy', 'alignment']
      for (const exp of expectedLabels) {
        const found = AI_METRIC_PRESETS.find((p) => p.label === exp)
        h.assert(!!found, `Preset "${exp}" must exist in AI_METRIC_PRESETS`)
        h.assert(typeof found!.value === 'string' && found!.value.length > 0, `Preset "${exp}" value must be non-empty`)
      }
    })

    h.test('Prompt template variable detection regex handles edge cases correctly', () => {
      const detectVars = (text: string) => Array.from(new Set(text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) ?? []))

      const standard = 'Hello {{name}}, summarize {{document_text}} for {{user123}}'
      h.assertEqual(detectVars(standard).length, 3, 'Standard vars extracted')

      const duplicates = '{{query}} and {{context}} with another {{query}}'
      h.assertEqual(detectVars(duplicates).length, 2, 'Duplicates deduplicated')

      const invalid = '{single_brace} and {{{triple}}} and {{}} and {{with space}}'
      const extractedInvalid = detectVars(invalid)
      h.assertEqual(extractedInvalid.includes('{{}}'), false, 'Empty braces ignored')
      h.assertEqual(extractedInvalid.includes('{{with space}}'), false, 'Space in braces ignored')
    })

    h.test('Node color helper correctly resolves custom overrides and type defaults', () => {
      const agentDefault: WorkflowNode['data'] = { nodeType: 'agent', label: 'Agent' }
      h.assertEqual(nodeColor(agentDefault), '#8b5cf6', 'Agent default hex is #8b5cf6')

      const modelDefault: WorkflowNode['data'] = { nodeType: 'llm-model', label: 'Model' }
      h.assertEqual(nodeColor(modelDefault), '#06b6d4', 'Model default hex is #06b6d4')

      const toolDefault: WorkflowNode['data'] = { nodeType: 'tool', label: 'Tool' }
      h.assertEqual(nodeColor(toolDefault), '#f97316', 'Tool default hex is #f97316')

      const promptDefault: WorkflowNode['data'] = { nodeType: 'prompt', label: 'Prompt' }
      h.assertEqual(nodeColor(promptDefault), '#ec4899', 'Prompt default hex is #ec4899')

      const customOverride: WorkflowNode['data'] = { nodeType: 'agent', label: 'Custom Agent', color: '#ff00ff' }
      h.assertEqual(nodeColor(customOverride), '#ff00ff', 'Custom color override takes precedence')
    })

    h.test('All 9 node types exist in NODE_TYPE_META with valid hex and accent classes', () => {
      const allTypes: WorkflowNodeType[] = [
        'start',
        'task',
        'decision',
        'end',
        'note',
        'agent',
        'llm-model',
        'tool',
        'prompt',
      ]
      for (const t of allTypes) {
        const meta = NODE_TYPE_META[t]
        h.assert(!!meta, `NODE_TYPE_META for "${t}" must exist`)
        h.assert(typeof meta.label === 'string' && meta.label.length > 0, `Meta label for "${t}" must exist`)
        h.assert(/^#[0-9a-fA-F]{6}$/.test(meta.hex), `Meta hex for "${t}" must be valid 6-char hex (got ${meta.hex})`)
        h.assert(meta.accent.startsWith('bg-'), `Meta accent for "${t}" must start with bg-`)
      }
    })

    h.test('COLOR_PALETTE contains at least 9 high-contrast swatches', () => {
      h.assert(COLOR_PALETTE.length >= 9, `COLOR_PALETTE must contain >= 9 colors, got ${COLOR_PALETTE.length}`)
      for (const c of COLOR_PALETTE) {
        h.assert(/^#[0-9a-fA-F]{6}$/.test(c.value), `Swatch hex "${c.value}" must be valid`)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SUITE 4: Edge Decoration, Cyclic Graphs & Traversal Safety
  // ═══════════════════════════════════════════════════════════════════════════
  h.suite('4. Edge Decoration, Cyclic Graphs & Traversal Safety', () => {
    h.test('decorateEdge maps style properties without mutating original edge', () => {
      const rawEdge = {
        id: 'e1',
        source: 'a',
        target: 'b',
        data: {
          lineStyle: 'bezier' as const,
          arrowStart: 'open' as const,
          arrowEnd: 'closed' as const,
          dashed: true,
          color: '#8b5cf6',
        },
      }

      const decorated = decorateEdge(rawEdge)
      h.assertEqual(decorated.type, 'default', 'bezier maps to default in reactflow')
      h.assertEqual(decorated.style?.stroke, '#8b5cf6', 'stroke color applied')
      h.assertEqual(decorated.style?.strokeDasharray, '7 5', 'dashed stroke applied')
      h.assert(decorated.markerStart !== undefined, 'markerStart generated')
      h.assert(decorated.markerEnd !== undefined, 'markerEnd generated')
    })

    h.test('Reflection loop cyclic graph handles 10,000 simulated iterations without stack overflow', () => {
      const reflection = multiAgentReflection()
      const startNode = reflection.nodes.find((n) => n.id === 'ref-start')!

      // Build adjacency map
      const adj = new Map<string, { target: string; label?: unknown }[]>()
      for (const n of reflection.nodes) adj.set(n.id, [])
      for (const e of reflection.edges) {
        adj.get(e.source)?.push({ target: e.target, label: e.label })
      }

      // Simulate traversal with loop budget
      let currentNodeId = startNode.id
      let iterationCount = 0
      let feedbackCount = 0
      const maxSimulatedSteps = 10000

      while (iterationCount < maxSimulatedSteps) {
        iterationCount++
        if (currentNodeId === 'ref-end') break

        const outgoing = adj.get(currentNodeId) || []
        if (outgoing.length === 0) break

        if (currentNodeId === 'ref-decision-gate') {
          // Simulate 2 critique loops, then exit
          if (feedbackCount < 2) {
            const retryEdge = outgoing.find((e) => e.target === 'ref-refinement-prompt')!
            currentNodeId = retryEdge.target
            feedbackCount++
          } else {
            const passEdge = outgoing.find((e) => e.target === 'ref-refined-generator')!
            currentNodeId = passEdge.target
          }
        } else {
          currentNodeId = outgoing[0].target
        }
      }

      h.assertEqual(currentNodeId, 'ref-end', 'Reached terminal node safely')
      h.assertEqual(feedbackCount, 2, 'Simulated exactly 2 feedback loops')
      h.assert(iterationCount < 50, `Completed in reasonable number of steps (${iterationCount})`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SUITE 5: Store CRUD & Node Palette Keyboard Mapping
  // ═══════════════════════════════════════════════════════════════════════════
  h.suite('5. Store CRUD & Node Palette Keyboard Mapping', () => {
    h.test('useWorkflowStore can create, update, duplicate, and delete workflows with AI nodes', () => {
      const store = useWorkflowStore.getState()

      // Create
      const newId = store.createWorkflow()
      h.assert(typeof newId === 'string' && newId.length > 0, 'New workflow created')

      // Set active
      store.openBuilder(newId)

      // Add AI nodes
      store.addNode('agent', { x: 50, y: 50 })
      store.addNode('llm-model', { x: 250, y: 50 })
      store.addNode('tool', { x: 450, y: 50 })
      store.addNode('prompt', { x: 650, y: 50 })

      let wf = useWorkflowStore.getState().workflows[newId]
      h.assertEqual(wf.nodes.length, 5, 'Start + 4 AI nodes = 5 nodes')

      const agentNode = wf.nodes.find((n) => n.data.nodeType === 'agent')!
      h.assert(!!agentNode, 'Agent node exists')

      // Update node data
      store.updateNodeData(agentNode.id, {
        model: 'deepseek-r1',
        systemInstructions: 'Deep reasoning agent',
      })

      wf = useWorkflowStore.getState().workflows[newId]
      const updatedAgent = wf.nodes.find((n) => n.id === agentNode.id)!
      h.assertEqual(updatedAgent.data.model, 'deepseek-r1', 'Agent model updated')
      h.assertEqual(updatedAgent.data.systemInstructions, 'Deep reasoning agent', 'Agent instructions updated')

      // Connect nodes
      const modelNode = wf.nodes.find((n) => n.data.nodeType === 'llm-model')!
      store.onConnect({ source: agentNode.id, target: modelNode.id, sourceHandle: null, targetHandle: null })

      wf = useWorkflowStore.getState().workflows[newId]
      h.assertEqual(wf.edges.length, 1, 'Edge connected')

      // Cascade delete node
      store.deleteNode(agentNode.id)
      wf = useWorkflowStore.getState().workflows[newId]
      h.assertEqual(wf.nodes.find((n) => n.id === agentNode.id), undefined, 'Agent node deleted')
      h.assertEqual(wf.edges.length, 0, 'Attached edge cascaded on node delete')

      // Duplicate workflow
      store.duplicateWorkflow(newId)
      const allWfs = useWorkflowStore.getState().workflows
      const copyWf = Object.values(allWfs).find((w) => w.name.includes('(copy)'))
      h.assert(!!copyWf, 'Duplicated workflow exists')

      // Clean up test workflows
      store.deleteWorkflow(newId)
      if (copyWf) store.deleteWorkflow(copyWf.id)
    })
  })

  return h.printReport()
}

// CLI execution
if (import.meta.url.startsWith('file:') && process.argv[1]) {
  const isDirectRun =
    process.argv[1].endsWith('adversarialStressSuite.ts') ||
    process.argv[1].endsWith('adversarialStressSuite.js') ||
    process.argv[1].includes('adversarialStressSuite')

  if (isDirectRun) {
    const passed = runAdversarialStressSuite()
    process.exit(passed ? 0 : 1)
  }
}
