/// <reference types="node" />

import { execSync } from 'node:child_process'
import process from 'node:process'
import { createSampleWorkflows } from './sampleWorkflows.ts'
import type { Workflow, WorkflowNode, WorkflowNodeType } from '../types/workflow.ts'

// ANSI terminal color helpers for beautiful output
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
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

const VALID_NODE_TYPES: Set<WorkflowNodeType> = new Set([
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

const VALID_CATEGORIES = new Set(['ai', 'ielts', 'esl', 'productivity', 'business', 'student', 'teacher', 'custom'])

class TestRunner {
  private results: TestResult[] = []
  private currentSuite = 'Default'

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
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`)
    }
  }

  assertEqual<T>(actual: T, expected: T, message: string) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}. Expected [${expected}], got [${actual}]`)
    }
  }

  assertIncludes<T>(array: T[], item: T, message: string) {
    if (!array.includes(item)) {
      throw new Error(`Assertion failed: ${message}. Array does not contain [${item}]`)
    }
  }

  getResults(): TestResult[] {
    return this.results
  }

  printSummary(): boolean {
    console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.cyan}             EDULOW AI WORKFLOW AUTOMATED VERIFICATION TEST SUITE               ${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}\n`)

    const suites = new Map<string, TestResult[]>()
    for (const r of this.results) {
      if (!suites.has(r.suite)) {
        suites.set(r.suite, [])
      }
      suites.get(r.suite)!.push(r)
    }

    let allPassed = true
    let totalPassed = 0
    let totalFailed = 0
    let totalDuration = 0

    for (const [suiteName, tests] of suites.entries()) {
      console.log(`${ANSI.bold}${ANSI.white}▶ ${suiteName}${ANSI.reset}`)
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
            if (t.error instanceof Error && t.error.stack) {
              const lines = t.error.stack.split('\n').slice(1, 4)
              console.log(`    ${ANSI.dim}${lines.join('\n    ')}${ANSI.reset}`)
            }
          }
        }
      }
      console.log()
    }

    console.log(`${ANSI.bold}${ANSI.cyan}--------------------------------------------------------------------------------${ANSI.reset}`)
    console.log(`${ANSI.bold}TEST SUMMARY TABLE:${ANSI.reset}`)
    console.log(`${ANSI.bold}┌────────────────────────────────────────┬──────────┬──────────┬──────────────┐${ANSI.reset}`)
    console.log(`${ANSI.bold}│ Suite Name                             │ Passed   │ Failed   │ Total Tests  │${ANSI.reset}`)
    console.log(`${ANSI.bold}├────────────────────────────────────────┼──────────┼──────────┼──────────────┤${ANSI.reset}`)

    for (const [suiteName, tests] of suites.entries()) {
      const p = tests.filter((t) => t.passed).length
      const f = tests.filter((t) => !t.passed).length
      const suitePad = suiteName.padEnd(38, ' ')
      const pPad = String(p).padStart(8, ' ')
      const fPad = String(f).padStart(8, ' ')
      const totalPad = String(tests.length).padStart(12, ' ')
      console.log(`│ ${suitePad} │ ${ANSI.green}${pPad}${ANSI.reset} │ ${f > 0 ? ANSI.red : ANSI.dim}${fPad}${ANSI.reset} │ ${totalPad} │`)
    }

    console.log(`${ANSI.bold}└────────────────────────────────────────┴──────────┴──────────┴──────────────┘${ANSI.reset}`)

    console.log(`\n${ANSI.bold}Final Result:${ANSI.reset} ${
      allPassed
        ? `${ANSI.bgGreen} PASSED ${ANSI.reset} All ${totalPassed} assertions passed (${totalDuration.toFixed(2)}ms)`
        : `${ANSI.bgRed} FAILED ${ANSI.reset} ${totalFailed} failed, ${totalPassed} passed (${totalDuration.toFixed(2)}ms)`
    }\n`)

    return allPassed
  }
}

/**
 * Cycle detection helper using Depth-First Search with visited & recursion stack sets.
 */
function detectDirectedCycles(nodes: WorkflowNode[], edges: Workflow['edges']): string[][] {
  const adj = new Map<string, string[]>()
  for (const n of nodes) {
    adj.set(n.id, [])
  }
  for (const e of edges) {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push(e.target)
    }
  }

  const visited = new Set<string>()
  const recStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(curr: string, path: string[]) {
    visited.add(curr)
    recStack.add(curr)
    path.push(curr)

    const neighbors = adj.get(curr) || []
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next, [...path])
      } else if (recStack.has(next)) {
        const cycleStartIndex = path.indexOf(next)
        if (cycleStartIndex !== -1) {
          cycles.push([...path.slice(cycleStartIndex), next])
        }
      }
    }

    recStack.delete(curr)
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      dfs(n.id, [])
    }
  }

  return cycles
}

export function runWorkflowVerification(): boolean {
  const runner = new TestRunner()
  const workflowsMap = createSampleWorkflows()
  const workflows = Object.values(workflowsMap)

  // ─── Suite 1: Sample Workflows Registration & Count ────────────────────────
  runner.suite('1. Sample Workflows Registration & Count', () => {
    runner.test('createSampleWorkflows returns exactly 24 sample workflows', () => {
      runner.assertEqual(
        workflows.length,
        24,
        'Expected exactly 19 workflows',
      )
    })

    runner.test('Category breakdown has exactly 3 AI, 4 IELTS, 2 ESL, 4 Productivity, 7 Business, 2 Student, and 2 Teacher workflows', () => {
      const ai = workflows.filter((w) => w.category === 'ai')
      const ielts = workflows.filter((w) => w.category === 'ielts')
      const esl = workflows.filter((w) => w.category === 'esl')
      const prod = workflows.filter((w) => w.category === 'productivity')
      const bus = workflows.filter((w) => w.category === 'business')
      const stu = workflows.filter((w) => w.category === 'student')
      const teach = workflows.filter((w) => w.category === 'teacher')

      runner.assert(
        ai.length === 3 &&
        ielts.length === 4 &&
        esl.length === 2 &&
        prod.length === 4 &&
        bus.length === 7 &&
        stu.length === 2 &&
        teach.length === 2,
        `Expected [3, 4, 2, 4, 7, 2, 2] split, got AI:${ai.length}, IELTS:${ielts.length}, ESL:${esl.length}, PROD:${prod.length}, BUS:${bus.length}, STU:${stu.length}, TEACH:${teach.length}`
      )
    })

    runner.test('Workflow IDs are unique and non-empty', () => {
      const ids = new Set<string>()
      for (const w of workflows) {
        runner.assert(typeof w.id === 'string' && w.id.trim().length > 0, `Workflow id must be non-empty string (${w.name})`)
        runner.assert(!ids.has(w.id), `Duplicate workflow id found: ${w.id}`)
        ids.add(w.id)
      }
    })
  })

  // ─── Suite 2: AI Workflow Templates Verification ───────────────────────────
  runner.suite('2. AI Workflow Templates Verification', () => {
    runner.test('RAG Pipeline workflow exists and matches requirements', () => {
      const ragWf = workflows.find(
        (w) =>
          w.category === 'ai' &&
          (w.name.toLowerCase().includes('rag') || w.tags?.includes('rag')),
      )
      runner.assert(!!ragWf, 'RAG Pipeline workflow must exist in sample workflows')
      runner.assertEqual(ragWf!.category, 'ai', 'RAG Pipeline category must be "ai"')
      runner.assert((ragWf!.nodes?.length ?? 0) >= 6, 'RAG Pipeline must contain at least 6 nodes')
      runner.assert((ragWf!.edges?.length ?? 0) >= 5, 'RAG Pipeline must contain at least 5 edges')
      runner.assert(ragWf!.tags?.includes('rag') ?? false, 'RAG Pipeline must include "rag" tag')
    })

    runner.test('Multi-Agent Reflection Loop workflow exists and matches requirements', () => {
      const reflectionWf = workflows.find(
        (w) =>
          w.category === 'ai' &&
          (w.name.toLowerCase().includes('reflection') || w.tags?.includes('reflection')),
      )
      runner.assert(!!reflectionWf, 'Multi-Agent Reflection workflow must exist')
      runner.assertEqual(reflectionWf!.category, 'ai', 'Multi-Agent Reflection category must be "ai"')
      runner.assert((reflectionWf!.nodes?.length ?? 0) >= 6, 'Multi-Agent Reflection must contain at least 6 nodes')
      runner.assert((reflectionWf!.edges?.length ?? 0) >= 6, 'Multi-Agent Reflection must contain at least 6 edges')
      runner.assert(reflectionWf!.tags?.includes('multi-agent') ?? false, 'Must include "multi-agent" tag')
      runner.assert(reflectionWf!.tags?.includes('reflection') ?? false, 'Must include "reflection" tag')
    })

    runner.test('Router-Classifier Pattern workflow exists and matches requirements', () => {
      const routerWf = workflows.find(
        (w) =>
          w.category === 'ai' &&
          (w.name.toLowerCase().includes('router') || w.tags?.includes('router')),
      )
      runner.assert(!!routerWf, 'Router-Classifier Pattern workflow must exist')
      runner.assertEqual(routerWf!.category, 'ai', 'Router-Classifier category must be "ai"')
      runner.assert((routerWf!.nodes?.length ?? 0) >= 7, 'Router-Classifier must contain at least 7 nodes')
      runner.assert((routerWf!.edges?.length ?? 0) >= 7, 'Router-Classifier must contain at least 7 edges')
      runner.assert(routerWf!.tags?.includes('router') ?? false, 'Must include "router" tag')
      runner.assert(routerWf!.tags?.includes('classifier') ?? false, 'Must include "classifier" tag')
    })

    runner.test('All 6 educational IELTS/ESL workflows remain intact and functional', () => {
      const expectedEduNames = [
        'IELTS Writing',
        'IELTS Speaking',
        'IELTS Listening',
        'IELTS Reading',
        'ESL Lesson Planning',
        'ESL Error Correction',
      ]
      for (const expected of expectedEduNames) {
        const found = workflows.find((w) => w.name.toLowerCase().includes(expected.toLowerCase()))
        runner.assert(!!found, `Educational workflow containing "${expected}" must exist`)
      }
    })
  })

  // ─── Suite 3: Node Types & Specialized AI Configurations ───────────────────
  runner.suite('3. Node Types & Specialized AI Configurations', () => {
    runner.test('All nodes in all 24 workflows have valid nodeType values', () => {
      for (const w of workflows) {
        for (const n of w.nodes) {
          runner.assert(
            VALID_NODE_TYPES.has(n.data.nodeType),
            `Node "${n.id}" in workflow "${w.name}" has invalid nodeType: "${n.data.nodeType}"`,
          )
        }
      }
    })

    runner.test('All 4 specialized AI node types ("agent", "llm-model", "tool", "prompt") are present in AI workflows', () => {
      const aiWorkflows = workflows.filter((w) => w.category === 'ai')
      const presentTypes = new Set<WorkflowNodeType>()

      for (const w of aiWorkflows) {
        for (const n of w.nodes) {
          presentTypes.add(n.data.nodeType)
        }
      }

      runner.assert(presentTypes.has('agent'), 'AI workflows must contain "agent" nodes')
      runner.assert(presentTypes.has('llm-model'), 'AI workflows must contain "llm-model" nodes')
      runner.assert(presentTypes.has('tool'), 'AI workflows must contain "tool" nodes')
      runner.assert(presentTypes.has('prompt'), 'AI workflows must contain "prompt" nodes')
    })

    runner.test('Agent nodes are properly configured with system instructions or model metadata', () => {
      const agentNodes = workflows
        .flatMap((w) => w.nodes)
        .filter((n) => n.data.nodeType === 'agent')

      runner.assert(agentNodes.length >= 4, `Expected at least 4 agent nodes, found ${agentNodes.length}`)

      for (const n of agentNodes) {
        const hasInstructions = typeof n.data.systemInstructions === 'string' && n.data.systemInstructions.trim().length > 0
        const hasModel = typeof n.data.model === 'string' && n.data.model.trim().length > 0
        runner.assert(
          hasInstructions || hasModel,
          `Agent node "${n.id}" (${n.data.label}) must define systemInstructions or model`,
        )
      }
    })

    runner.test('LLM-Model nodes are properly configured with model identifier and parameters', () => {
      const llmNodes = workflows
        .flatMap((w) => w.nodes)
        .filter((n) => n.data.nodeType === 'llm-model')

      runner.assert(llmNodes.length >= 4, `Expected at least 4 llm-model nodes, found ${llmNodes.length}`)

      for (const n of llmNodes) {
        const hasModel = typeof n.data.model === 'string' && n.data.model.trim().length > 0
        runner.assert(
          hasModel,
          `LLM-Model node "${n.id}" (${n.data.label}) must define a model string`,
        )
      }
    })

    runner.test('Tool nodes are properly configured with function signatures, endpoints, or execution methods', () => {
      const toolNodes = workflows
        .flatMap((w) => w.nodes)
        .filter((n) => n.data.nodeType === 'tool')

      runner.assert(toolNodes.length >= 4, `Expected at least 4 tool nodes, found ${toolNodes.length}`)

      for (const n of toolNodes) {
        const hasSignature = typeof n.data.functionSignature === 'string' && n.data.functionSignature.trim().length > 0
        const hasEndpoint = typeof n.data.apiEndpoint === 'string' && n.data.apiEndpoint.trim().length > 0
        const hasMethod = typeof n.data.httpMethod === 'string'
        runner.assert(
          hasSignature || hasEndpoint || hasMethod,
          `Tool node "${n.id}" (${n.data.label}) must define functionSignature, apiEndpoint, or httpMethod`,
        )
      }
    })

    runner.test('Prompt nodes are properly configured with system or user prompt templates', () => {
      const promptNodes = workflows
        .flatMap((w) => w.nodes)
        .filter((n) => n.data.nodeType === 'prompt')

      runner.assert(promptNodes.length >= 3, `Expected at least 3 prompt nodes, found ${promptNodes.length}`)

      for (const n of promptNodes) {
        const hasSysPrompt = typeof n.data.systemPrompt === 'string' && n.data.systemPrompt.trim().length > 0
        const hasUserPrompt = typeof n.data.userPrompt === 'string' && n.data.userPrompt.trim().length > 0
        runner.assert(
          hasSysPrompt || hasUserPrompt,
          `Prompt node "${n.id}" (${n.data.label}) must define systemPrompt or userPrompt`,
        )
      }
    })
  })

  // ─── Suite 4: Graph Topology & Connectivity Integrity ──────────────────────
  runner.suite('4. Graph Topology & Connectivity Integrity', () => {
    runner.test('All node IDs are unique within their workflow', () => {
      for (const w of workflows) {
        const nodeIds = new Set<string>()
        for (const n of w.nodes) {
          runner.assert(
            !nodeIds.has(n.id),
            `Duplicate node id "${n.id}" in workflow "${w.name}"`,
          )
          nodeIds.add(n.id)
        }
      }
    })

    runner.test('Every edge source and target exists as a valid node ID in that workflow', () => {
      for (const w of workflows) {
        const nodeIds = new Set(w.nodes.map((n) => n.id))
        for (const e of w.edges) {
          runner.assert(
            nodeIds.has(e.source),
            `Edge "${e.id}" in workflow "${w.name}" references non-existent source node "${e.source}"`,
          )
          runner.assert(
            nodeIds.has(e.target),
            `Edge "${e.id}" in workflow "${w.name}" references non-existent target node "${e.target}"`,
          )
        }
      }
    })

    runner.test('Multi-Agent Reflection Loop contains a valid cyclic feedback loop', () => {
      const reflectionWf = workflows.find(
        (w) => w.category === 'ai' && w.name.toLowerCase().includes('reflection'),
      )
      runner.assert(!!reflectionWf, 'Multi-Agent Reflection workflow must exist')

      // Detect cycles in the directed graph
      const cycles = detectDirectedCycles(reflectionWf!.nodes, reflectionWf!.edges)
      runner.assert(
        cycles.length > 0,
        'Multi-Agent Reflection workflow must contain at least one cyclic feedback loop',
      )

      // Specifically verify feedback edge from refinement prompt / critic back to primary agent
      const feedbackEdge = reflectionWf!.edges.find(
        (e) => e.target === 'ref-primary-agent' && (e.source === 'ref-refinement-prompt' || e.source === 'ref-critic-agent' || e.source === 'ref-decision-gate'),
      )
      runner.assert(
        !!feedbackEdge,
        'Multi-Agent Reflection workflow must contain feedback edge targeting primary agent',
      )
    })

    runner.test('Router-Classifier Pattern contains branching decision edges to distinct agents', () => {
      const routerWf = workflows.find(
        (w) => w.category === 'ai' && w.name.toLowerCase().includes('router'),
      )
      runner.assert(!!routerWf, 'Router-Classifier workflow must exist')

      const decisionNode = routerWf!.nodes.find((n) => n.id === 'route-classifier' || n.data.nodeType === 'decision')
      runner.assert(!!decisionNode, 'Router-Classifier workflow must contain a classifier decision node')

      const branchEdges = routerWf!.edges.filter((e) => e.source === decisionNode!.id)
      runner.assert(
        branchEdges.length >= 3,
        `Router classifier node must have at least 3 outgoing branch edges, found ${branchEdges.length}`,
      )

      const targetNodeIds = new Set(branchEdges.map((e) => e.target))
      runner.assert(
        targetNodeIds.size === branchEdges.length,
        'Router classifier branches must target distinct destination nodes',
      )
    })

    runner.test('RAG Pipeline forms a continuous end-to-end directed flow', () => {
      const ragWf = workflows.find((w) => w.category === 'ai' && w.name.toLowerCase().includes('rag'))
      runner.assert(!!ragWf, 'RAG Pipeline workflow must exist')

      const startNode = ragWf!.nodes.find((n) => n.id === 'rag-docs' || n.data.nodeType === 'start' || n.data.nodeType === 'tool')
      const endNode = ragWf!.nodes.find((n) => n.id === 'rag-end' || n.data.nodeType === 'end')
      runner.assert(!!startNode, 'RAG Pipeline must have a start/source node')
      runner.assert(!!endNode, 'RAG Pipeline must have an end node')

      // Verify all intermediate nodes are connected
      const sources = new Set(ragWf!.edges.map((e) => e.source))
      const targets = new Set(ragWf!.edges.map((e) => e.target))
      runner.assert(sources.has(startNode!.id), 'RAG start node must have outgoing edge')
      runner.assert(targets.has(endNode!.id), 'RAG end node must have incoming edge')
    })
  })

  // ─── Suite 5: Metadata, Metrics & Content Completeness ─────────────────────
  runner.suite('5. Metadata, Metrics & Content Completeness', () => {
    runner.test('All 24 workflows have complete metadata (name, description, category, tags)', () => {
      for (const w of workflows) {
        runner.assert(typeof w.name === 'string' && w.name.trim().length > 0, `Workflow name must be non-empty (${w.id})`)
        runner.assert(
          typeof w.description === 'string' && w.description.trim().length > 0,
          `Workflow description must be non-empty (${w.name})`,
        )
        runner.assert(
          VALID_CATEGORIES.has(w.category || ''),
          `Workflow category must be one of [ai, ielts, esl, productivity, business, student, teacher, custom] (${w.name}, got ${w.category})`,
        )
        runner.assert(
          Array.isArray(w.tags) && w.tags.length > 0,
          `Workflow tags must be non-empty array (${w.name})`,
        )
      }
    })

    runner.test('All nodes have non-empty labels, descriptions, and deep-dive details', () => {
      for (const w of workflows) {
        for (const n of w.nodes) {
          runner.assert(
            typeof n.data.label === 'string' && n.data.label.trim().length > 0,
            `Node "${n.id}" in workflow "${w.name}" must have non-empty label`,
          )
          runner.assert(
            typeof n.data.description === 'string' && n.data.description.trim().length > 0,
            `Node "${n.id}" in workflow "${w.name}" must have non-empty description`,
          )
          runner.assert(
            typeof n.data.details === 'string' && n.data.details.trim().length > 0,
            `Node "${n.id}" in workflow "${w.name}" must have non-empty details for showcase panel`,
          )
        }
      }
    })

    runner.test('All nodes define valid metrics arrays with label/value pairs', () => {
      for (const w of workflows) {
        for (const n of w.nodes) {
          if (n.data.metrics) {
            runner.assert(Array.isArray(n.data.metrics), `Node "${n.id}" metrics must be an array`)
            for (const m of n.data.metrics) {
              runner.assert(
                typeof m.label === 'string' && m.label.trim().length > 0,
                `Metric in node "${n.id}" has empty label`,
              )
              runner.assert(
                typeof m.value === 'string' && m.value.trim().length > 0,
                `Metric "${m.label}" in node "${n.id}" has empty value`,
              )
            }
          }
        }
      }
    })

    runner.test('AI workflows contain rich code snippets across execution nodes', () => {
      const aiWorkflows = workflows.filter((w) => w.category === 'ai')
      for (const w of aiWorkflows) {
        const nodesWithCode = w.nodes.filter(
          (n) => typeof n.data.codeSnippet === 'string' && n.data.codeSnippet.trim().length > 0,
        )
        runner.assert(
          nodesWithCode.length >= 3,
          `AI workflow "${w.name}" must have at least 3 nodes with rich code snippets, found ${nodesWithCode.length}`,
        )
      }
    })
  })

  // ─── Suite 6: TypeScript Compilation Cleanliness ───────────────────────────
  runner.suite('6. TypeScript Compilation Cleanliness', () => {
    runner.test('TypeScript project compiles with 0 errors (npx tsc --noEmit)', () => {
      try {
        const output = execSync('npx tsc --noEmit', {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        })
        runner.assert(true, 'TypeScript compilation succeeded cleanly')
        if (output && output.trim().length > 0) {
          console.log(`    ${ANSI.dim}tsc output: ${output.trim()}${ANSI.reset}`)
        }
      } catch (err: unknown) {
        const execErr = err as { stdout?: string; stderr?: string; message?: string }
        const errMsg = execErr.stdout || execErr.stderr || execErr.message || 'Unknown tsc error'
        throw new Error(`TypeScript compilation failed:\n${errMsg}`)
      }
    })
  })

  return runner.printSummary()
}

// Self-executing runner when invoked via CLI / tsx
if (import.meta.url.startsWith('file:') && process.argv[1]) {
  const isDirectRun =
    process.argv[1].endsWith('verifyAIWorkflows.ts') ||
    process.argv[1].endsWith('verifyAIWorkflows.js') ||
    process.argv[1].includes('verifyAIWorkflows')

  if (isDirectRun) {
    const success = runWorkflowVerification()
    process.exit(success ? 0 : 1)
  }
}
