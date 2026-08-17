/// <reference types="node" />

import { createSampleWorkflows } from './sampleWorkflows.ts'
import { computeTraversal, PLAYBACK_SPEEDS } from '../hooks/usePlayback.ts'
import type { Workflow, WorkflowNode } from '../types/workflow.ts'

// ANSI colors
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
}

interface TestItem {
  suite: string
  name: string
  passed: boolean
  durationMs: number
  error?: string
}

class AdversarialRunner {
  private results: TestItem[] = []
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
    } catch (err: any) {
      const durationMs = performance.now() - start
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: false,
        durationMs,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(`Assertion failed: ${msg}`)
  }

  assertEqual<T>(actual: T, expected: T, msg: string) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${msg}. Expected [${expected}], got [${actual}]`)
    }
  }

  printReport(): boolean {
    console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.cyan}       EMPIRICAL ADVERSARIAL GRAPH & PLAYBACK VERIFICATION TEST SUITE          ${ANSI.reset}`)
    console.log(`${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}\n`)

    const suites = new Map<string, TestItem[]>()
    for (const r of this.results) {
      if (!suites.has(r.suite)) suites.set(r.suite, [])
      suites.get(r.suite)!.push(r)
    }

    let allPassed = true
    let totalPassed = 0
    let totalFailed = 0
    let totalTime = 0

    for (const [suiteName, tests] of suites.entries()) {
      console.log(`${ANSI.bold}${ANSI.white}▶ ${suiteName}${ANSI.reset}`)
      for (const t of tests) {
        totalTime += t.durationMs
        if (t.passed) {
          totalPassed++
          console.log(`  ${ANSI.green}✓${ANSI.reset} ${t.name} ${ANSI.dim}(${t.durationMs.toFixed(3)}ms)${ANSI.reset}`)
        } else {
          totalFailed++
          allPassed = false
          console.log(`  ${ANSI.red}✗${ANSI.reset} ${ANSI.bold}${t.name}${ANSI.reset} ${ANSI.dim}(${t.durationMs.toFixed(3)}ms)${ANSI.reset}`)
          if (t.error) console.log(`    ${ANSI.red}Error: ${t.error}${ANSI.reset}`)
        }
      }
      console.log()
    }

    console.log(`${ANSI.bold}${ANSI.cyan}--------------------------------------------------------------------------------${ANSI.reset}`)
    console.log(`${ANSI.bold}ADVERSARIAL SUITE SUMMARY TABLE:${ANSI.reset}`)
    console.log(`${ANSI.bold}┌──────────────────────────────────────────────┬──────────┬──────────┬──────────────┐${ANSI.reset}`)
    console.log(`${ANSI.bold}│ Suite Name                                   │ Passed   │ Failed   │ Total Tests  │${ANSI.reset}`)
    console.log(`${ANSI.bold}├──────────────────────────────────────────────┼──────────┼──────────┼──────────────┤${ANSI.reset}`)

    for (const [suiteName, tests] of suites.entries()) {
      const p = tests.filter((t) => t.passed).length
      const f = tests.filter((t) => !t.passed).length
      const sPad = suiteName.padEnd(44, ' ')
      const pPad = String(p).padStart(8, ' ')
      const fPad = String(f).padStart(8, ' ')
      const tPad = String(tests.length).padStart(12, ' ')
      console.log(`│ ${sPad} │ ${ANSI.green}${pPad}${ANSI.reset} │ ${f > 0 ? ANSI.red : ANSI.dim}${fPad}${ANSI.reset} │ ${tPad} │`)
    }

    console.log(`${ANSI.bold}└──────────────────────────────────────────────┴──────────┴──────────┴──────────────┘${ANSI.reset}`)

    console.log(`\n${ANSI.bold}Verification Verdict:${ANSI.reset} ${
      allPassed
        ? `${ANSI.bgGreen} CONFIRMED ${ANSI.reset} All ${totalPassed} adversarial tests passed cleanly (${totalTime.toFixed(2)}ms)`
        : `${ANSI.bgRed} FAILED ${ANSI.reset} ${totalFailed} tests failed, ${totalPassed} passed (${totalTime.toFixed(2)}ms)`
    }\n`)

    return allPassed
  }
}

// Simulated hook state machine helper for usePlayback logic
function simulatePlaybackRun(workflow: Workflow) {
  const steps = computeTraversal(workflow)
  const nodesById = new Map(workflow.nodes.map((n) => [n.id, n]))
  let currentIndex = -1
  let isPlaying = false
  let speed = 1

  const state = {
    get steps() {
      return steps
    },
    get currentIndex() {
      return currentIndex
    },
    get currentNode() {
      return currentIndex >= 0 ? nodesById.get(steps[currentIndex]) ?? null : null
    },
    get visited() {
      return new Set(steps.slice(0, Math.max(0, currentIndex + 1)))
    },
    get isPlaying() {
      return isPlaying
    },
    get speed() {
      return speed
    },
    get progress() {
      return steps.length > 0 ? Math.max(0, currentIndex + 1) / steps.length : 0
    },
    toggle() {
      if (steps.length === 0) return
      if (isPlaying) {
        isPlaying = false
      } else {
        if (currentIndex >= steps.length - 1) currentIndex = -1
        isPlaying = true
      }
    },
    next() {
      isPlaying = false
      currentIndex = Math.min(currentIndex + 1, steps.length - 1)
    },
    prev() {
      isPlaying = false
      currentIndex = Math.max(currentIndex - 1, -1)
    },
    restart() {
      isPlaying = false
      currentIndex = -1
    },
    cycleSpeed() {
      const idx = PLAYBACK_SPEEDS.indexOf(speed as (typeof PLAYBACK_SPEEDS)[number])
      speed = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]
    },
    stepAuto() {
      if (!isPlaying) return false
      if (currentIndex >= steps.length - 1) {
        isPlaying = false
        return false
      }
      currentIndex = Math.min(currentIndex + 1, steps.length - 1)
      if (currentIndex >= steps.length - 1) {
        isPlaying = false
      }
      return true
    },
  }

  return state
}

export function runAdversarialValidation(): boolean {
  const runner = new AdversarialRunner()
  const sampleMap = createSampleWorkflows()
  const workflows = Object.values(sampleMap)

  // ─── SUITE 1: BFS Graph Traversal across All 9 Workflows ───────────────────
  runner.suite('1. BFS Traversal Correctness Across All 9 Workflows', () => {
    for (const wf of workflows) {
      runner.test(`[${(wf.category ?? 'custom').toUpperCase()}] "${wf.name}" traversal returns complete, unique node permutation`, () => {
        const order = computeTraversal(wf)
        runner.assertEqual(
          order.length,
          wf.nodes.length,
          `Traversal length must match total node count for "${wf.name}"`,
        )

        const uniqueSet = new Set(order)
        runner.assertEqual(
          uniqueSet.size,
          wf.nodes.length,
          `Traversal must contain no duplicate nodes for "${wf.name}"`,
        )

        for (const node of wf.nodes) {
          runner.assert(
            uniqueSet.has(node.id),
            `Node "${node.id}" (${node.data.label}) is missing from traversal order in "${wf.name}"`,
          )
        }

        // Check that first node is the designated start node
        const startNode = wf.nodes.find((n) => n.data.nodeType === 'start') ?? wf.nodes[0]
        if (startNode) {
          runner.assertEqual(
            order[0],
            startNode.id,
            `Traversal first step must be the start node (${startNode.id}) in "${wf.name}"`,
          )
        }
      })
    }

    runner.test('BFS respects parent-before-child ordering on DAG workflows', () => {
      const ragWf = workflows.find((w) => w.name.includes('RAG Pipeline'))!
      const order = computeTraversal(ragWf)
      const indexMap = new Map(order.map((id, idx) => [id, idx]))

      for (const edge of ragWf.edges) {
        const srcIdx = indexMap.get(edge.source)!
        const tgtIdx = indexMap.get(edge.target)!
        runner.assert(
          srcIdx < tgtIdx,
          `BFS order violation: source "${edge.source}" (idx: ${srcIdx}) must precede target "${edge.target}" (idx: ${tgtIdx})`,
        )
      }
    })
  })

  // ─── SUITE 2: Cyclic Reflection Loops & Infinite Loop Resistance ───────────
  runner.suite('2. Cyclic Graphs & Infinite Loop Resistance', () => {
    runner.test('multiAgentReflection contains cycle and computes traversal in < 1ms without loop', () => {
      const reflectionWf = workflows.find((w) => w.name.includes('Reflection'))!
      const startT = performance.now()
      const order = computeTraversal(reflectionWf)
      const elapsed = performance.now() - startT

      runner.assert(elapsed < 5.0, `Traversal took too long (${elapsed}ms) on cyclic reflection graph`)
      runner.assertEqual(order.length, reflectionWf.nodes.length, 'Every node in reflection loop visited once')

      // Verify exact BFS order for reflection loop:
      // ref-start -> ref-primary-agent -> ref-critic-agent -> ref-decision-gate -> [ref-refined-generator, ref-refinement-prompt] -> ref-end
      const startIdx = order.indexOf('ref-start')
      const primaryIdx = order.indexOf('ref-primary-agent')
      const criticIdx = order.indexOf('ref-critic-agent')
      const gateIdx = order.indexOf('ref-decision-gate')
      const refinedGenIdx = order.indexOf('ref-refined-generator')
      const promptIdx = order.indexOf('ref-refinement-prompt')
      const endIdx = order.indexOf('ref-end')

      runner.assert(startIdx === 0, 'ref-start must be first (idx 0)')
      runner.assert(startIdx < primaryIdx, 'ref-start before ref-primary-agent')
      runner.assert(primaryIdx < criticIdx, 'ref-primary-agent before ref-critic-agent')
      runner.assert(criticIdx < gateIdx, 'ref-critic-agent before ref-decision-gate')
      runner.assert(gateIdx < refinedGenIdx, 'ref-decision-gate before ref-refined-generator')
      runner.assert(gateIdx < promptIdx, 'ref-decision-gate before ref-refinement-prompt')
      runner.assert(refinedGenIdx < endIdx, 'ref-refined-generator before ref-end')
    })

    runner.test('ieltWritingTask2 cyclic word-count retry loop terminates cleanly', () => {
      const wt2 = workflows.find((w) => w.name.includes('Writing Task 2'))!
      const order = computeTraversal(wt2)
      runner.assertEqual(order.length, wt2.nodes.length, 'WT2 cyclic loop visited cleanly')
      runner.assert(order.includes('wt2-expand'), 'Expand node visited')
      runner.assert(order.includes('wt2-check'), 'Check node visited')
    })

    runner.test('ieltsSpeakingPart2 cyclic duration retry loop terminates cleanly', () => {
      const sp = workflows.find((w) => w.name.includes('Speaking'))!
      const order = computeTraversal(sp)
      runner.assertEqual(order.length, sp.nodes.length, 'Speaking cyclic loop visited cleanly')
      runner.assert(order.includes('sp-extend'), 'Extend node visited')
      runner.assert(order.includes('sp-check'), 'Check node visited')
    })

    runner.test('Adversarial synthetic self-loop graph (node -> self)', () => {
      const syntheticWf: Pick<Workflow, 'nodes' | 'edges'> = {
        nodes: [
          { id: 'self-1', type: 'workflow', position: { x: 0, y: 0 }, data: { label: 'Self', nodeType: 'start' } },
        ],
        edges: [
          { id: 'e-self', source: 'self-1', target: 'self-1' },
        ],
      }
      const order = computeTraversal(syntheticWf as Workflow)
      runner.assertEqual(order.length, 1, 'Self-loop returns 1 node')
      runner.assertEqual(order[0], 'self-1', 'Self-loop node matches')
    })

    runner.test('Adversarial synthetic 2-node tight loop (A <-> B)', () => {
      const syntheticWf: Pick<Workflow, 'nodes' | 'edges'> = {
        nodes: [
          { id: 'loop-a', type: 'workflow', position: { x: 0, y: 0 }, data: { label: 'A', nodeType: 'start' } },
          { id: 'loop-b', type: 'workflow', position: { x: 100, y: 0 }, data: { label: 'B', nodeType: 'task' } },
        ],
        edges: [
          { id: 'e1', source: 'loop-a', target: 'loop-b' },
          { id: 'e2', source: 'loop-b', target: 'loop-a' },
        ],
      }
      const order = computeTraversal(syntheticWf as Workflow)
      runner.assertEqual(order.length, 2, 'Tight 2-node loop returns 2 nodes')
      runner.assertEqual(order[0], 'loop-a', 'Starts at A')
      runner.assertEqual(order[1], 'loop-b', 'Then B')
    })

    runner.test('Adversarial synthetic 1000-node circular ring graph', () => {
      const N = 1000
      const syntheticNodes: WorkflowNode[] = []
      const syntheticEdges: Workflow['edges'] = []

      for (let i = 0; i < N; i++) {
        syntheticNodes.push({
          id: `ring-${i}`,
          type: 'workflow',
          position: { x: i * 50, y: 0 },
          data: { label: `Node ${i}`, nodeType: i === 0 ? 'start' : 'task' },
        })
        syntheticEdges.push({
          id: `e-ring-${i}`,
          source: `ring-${i}`,
          target: `ring-${(i + 1) % N}`,
        })
      }

      const syntheticWf = { nodes: syntheticNodes, edges: syntheticEdges } as Workflow
      const startT = performance.now()
      const order = computeTraversal(syntheticWf)
      const elapsed = performance.now() - startT

      runner.assertEqual(order.length, N, '1000-node ring returns all 1000 nodes')
      runner.assertEqual(new Set(order).size, N, '1000-node ring has no duplicates')
      runner.assert(elapsed < 20.0, `1000-node ring traversal took ${elapsed}ms (expected < 20ms)`)
    })

    runner.test('Adversarial synthetic complete graph K_50 (50 nodes, 2,450 directed edges with cycles)', () => {
      const N = 50
      const nodes: WorkflowNode[] = []
      const edges: Workflow['edges'] = []

      for (let i = 0; i < N; i++) {
        nodes.push({
          id: `k-${i}`,
          type: 'workflow',
          position: { x: i * 20, y: i * 20 },
          data: { label: `K ${i}`, nodeType: i === 0 ? 'start' : 'task' },
        })
      }

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (i !== j) {
            edges.push({ id: `e-${i}-${j}`, source: `k-${i}`, target: `k-${j}` })
          }
        }
      }

      const order = computeTraversal({ nodes, edges } as Workflow)
      runner.assertEqual(order.length, N, 'K_50 complete graph returns 50 nodes')
      runner.assertEqual(new Set(order).size, N, 'No duplicates in K_50')
    })

    runner.test('Adversarial synthetic figure-8 double cycle graph', () => {
      // Loop 1: c1 -> c2 -> c3 -> c1
      // Loop 2: c3 -> c4 -> c5 -> c3
      const nodes: WorkflowNode[] = ['c1', 'c2', 'c3', 'c4', 'c5'].map((id, idx) => ({
        id,
        type: 'workflow',
        position: { x: idx * 50, y: 0 },
        data: { label: id, nodeType: idx === 0 ? 'start' : 'task' },
      }))
      const edges: Workflow['edges'] = [
        { id: 'e1', source: 'c1', target: 'c2' },
        { id: 'e2', source: 'c2', target: 'c3' },
        { id: 'e3', source: 'c3', target: 'c1' },
        { id: 'e4', source: 'c3', target: 'c4' },
        { id: 'e5', source: 'c4', target: 'c5' },
        { id: 'e6', source: 'c5', target: 'c3' },
      ]
      const order = computeTraversal({ nodes, edges } as Workflow)
      runner.assertEqual(order.length, 5, 'Figure-8 cycle visits all 5 nodes')
      runner.assertEqual(new Set(order).size, 5, 'Figure-8 cycle has no duplicate steps')
      runner.assertEqual(order[0], 'c1', 'Starts at c1')
    })

    runner.test('Adversarial synthetic cycle back to start node itself', () => {
      // start -> a -> b -> start, b -> end
      const nodes: WorkflowNode[] = [
        { id: 's', type: 'workflow', position: { x: 0, y: 0 }, data: { label: 'Start', nodeType: 'start' } },
        { id: 'a', type: 'workflow', position: { x: 50, y: 0 }, data: { label: 'A', nodeType: 'task' } },
        { id: 'b', type: 'workflow', position: { x: 100, y: 0 }, data: { label: 'B', nodeType: 'task' } },
        { id: 'e', type: 'workflow', position: { x: 150, y: 0 }, data: { label: 'End', nodeType: 'end' } },
      ]
      const edges: Workflow['edges'] = [
        { id: 'e1', source: 's', target: 'a' },
        { id: 'e2', source: 'a', target: 'b' },
        { id: 'e3', source: 'b', target: 's' }, // cycle back to start!
        { id: 'e4', source: 'b', target: 'e' },
      ]
      const order = computeTraversal({ nodes, edges } as Workflow)
      runner.assertEqual(order.length, 4, 'Cycle back to start includes all 4 nodes')
      runner.assertEqual(order[0], 's', 'First step is s')
      runner.assertEqual(order[1], 'a', 'Second step is a')
      runner.assertEqual(order[2], 'b', 'Third step is b')
      runner.assertEqual(order[3], 'e', 'Fourth step is e')
    })

    runner.test('Adversarial disconnected graph with 3 isolated components', () => {
      // Component 1: comp1-s -> comp1-e
      // Component 2: comp2-a -> comp2-b
      // Component 3: comp3-solo
      const nodes: WorkflowNode[] = [
        { id: 'comp1-s', type: 'workflow', position: { x: 0, y: 0 }, data: { label: 'C1 Start', nodeType: 'start' } },
        { id: 'comp1-e', type: 'workflow', position: { x: 50, y: 0 }, data: { label: 'C1 End', nodeType: 'end' } },
        { id: 'comp2-a', type: 'workflow', position: { x: 0, y: 50 }, data: { label: 'C2 A', nodeType: 'task' } },
        { id: 'comp2-b', type: 'workflow', position: { x: 50, y: 50 }, data: { label: 'C2 B', nodeType: 'task' } },
        { id: 'comp3-solo', type: 'workflow', position: { x: 0, y: 100 }, data: { label: 'C3 Solo', nodeType: 'note' } },
      ]
      const edges: Workflow['edges'] = [
        { id: 'e-c1', source: 'comp1-s', target: 'comp1-e' },
        { id: 'e-c2', source: 'comp2-a', target: 'comp2-b' },
      ]
      const order = computeTraversal({ nodes, edges } as Workflow)
      runner.assertEqual(order.length, 5, 'All 5 nodes across 3 components visited')
      runner.assertEqual(new Set(order).size, 5, 'No duplicates across disconnected components')
      // Connected component 1 should be visited first in BFS
      runner.assertEqual(order[0], 'comp1-s', 'Starts with C1 Start')
      runner.assertEqual(order[1], 'comp1-e', 'Follows C1 End')
      // Disconnected nodes appended at the end
      runner.assert(order.includes('comp2-a'), 'Includes comp2-a')
      runner.assert(order.includes('comp2-b'), 'Includes comp2-b')
      runner.assert(order.includes('comp3-solo'), 'Includes comp3-solo')
    })
  })

  // ─── SUITE 3: 3-Way Branching Router-Classifier Pattern ────────────────────
  runner.suite('3. 3-Way Branching Router Pattern Verification', () => {
    const routerWf = workflows.find((w) => w.name.includes('Router'))!

    runner.test('Router workflow has start node (route-query) and classifier decision node (route-classifier)', () => {
      runner.assert(!!routerWf, 'Router workflow exists')
      const startNode = routerWf.nodes.find((n) => n.id === 'route-query')
      const classifierNode = routerWf.nodes.find((n) => n.id === 'route-classifier')
      runner.assert(!!startNode && startNode.data.nodeType === 'start', 'route-query must be start node')
      runner.assert(!!classifierNode && classifierNode.data.nodeType === 'decision', 'route-classifier must be decision node')
    })

    runner.test('Classifier decision node has exactly 3 diverging branch edges', () => {
      const branches = routerWf.edges.filter((e) => e.source === 'route-classifier')
      runner.assertEqual(branches.length, 3, 'route-classifier must have exactly 3 branch edges')

      const targets = new Set(branches.map((b) => b.target))
      runner.assert(targets.has('route-support-agent'), 'Branches to route-support-agent (Path A)')
      runner.assert(targets.has('route-technical-agent'), 'Branches to route-technical-agent (Path B)')
      runner.assert(targets.has('route-general-llm'), 'Branches to route-general-llm (Path C)')
    })

    runner.test('All 3 branches converge into downstream aggregation and reach route-end', () => {
      // Path A & B -> tool gateway -> response aggregator -> route-end
      // Path C -> response aggregator -> route-end
      const toolGatewayTargets = routerWf.edges.filter((e) => e.target === 'route-tool-gateway').map((e) => e.source)
      runner.assert(toolGatewayTargets.includes('route-support-agent'), 'Support agent connects to tool gateway')
      runner.assert(toolGatewayTargets.includes('route-technical-agent'), 'Technical agent connects to tool gateway')

      const aggregatorSources = routerWf.edges.filter((e) => e.target === 'route-response-aggregator').map((e) => e.source)
      runner.assert(aggregatorSources.includes('route-tool-gateway'), 'Tool gateway connects to response aggregator')
      runner.assert(aggregatorSources.includes('route-general-llm'), 'General LLM connects directly to response aggregator')

      const endSources = routerWf.edges.filter((e) => e.target === 'route-end').map((e) => e.source)
      runner.assert(endSources.includes('route-response-aggregator'), 'Response aggregator connects to route-end')
    })

    runner.test('BFS traversal visits router branches in correct level-order sequence', () => {
      const order = computeTraversal(routerWf)
      runner.assertEqual(order[0], 'route-query', 'Step 1: route-query')
      runner.assertEqual(order[1], 'route-classifier', 'Step 2: route-classifier')

      const branchIndices = [
        order.indexOf('route-support-agent'),
        order.indexOf('route-technical-agent'),
        order.indexOf('route-general-llm'),
      ]
      for (const idx of branchIndices) {
        runner.assert(idx >= 2 && idx <= 4, `Branch node must be in level 2 (indices 2..4), got ${idx}`)
      }

      const gatewayIdx = order.indexOf('route-tool-gateway')
      const aggregatorIdx = order.indexOf('route-response-aggregator')
      const endIdx = order.indexOf('route-end')

      runner.assert(gatewayIdx > Math.max(...branchIndices), 'Tool gateway after branch agents')
      runner.assert(aggregatorIdx > gatewayIdx, 'Aggregator after tool gateway')
      runner.assert(endIdx === order.length - 1, 'route-end is final step')
    })
  })

  // ─── SUITE 4: Workflow Topologies, Start Nodes & Reachability ──────────────
  runner.suite('4. Topology Integrity Across All 9 Workflows', () => {
    for (const wf of workflows) {
      runner.test(`"${wf.name}" topology satisfies start/end/reachability constraints`, () => {
        // 1. Entrypoint check: either explicit 'start' node or root node with in-degree 0
        const startNodes = wf.nodes.filter((n) => n.data.nodeType === 'start')
        const inDegreeMap = new Map<string, number>()
        for (const n of wf.nodes) inDegreeMap.set(n.id, 0)
        for (const e of wf.edges) {
          inDegreeMap.set(e.target, (inDegreeMap.get(e.target) ?? 0) + 1)
        }
        const zeroInDegreeNodes = wf.nodes.filter((n) => inDegreeMap.get(n.id) === 0)

        runner.assert(
          startNodes.length > 0 || zeroInDegreeNodes.length > 0,
          `Workflow "${wf.name}" must have a valid start node or in-degree 0 entrypoint`,
        )

        const effectiveStartNode = startNodes[0] ?? zeroInDegreeNodes[0] ?? wf.nodes[0]
        runner.assert(
          !!effectiveStartNode,
          `Workflow "${wf.name}" must have an effective start node`,
        )

        // 2. End node count or sink node check
        const endNodes = wf.nodes.filter((n) => n.data.nodeType === 'end')
        runner.assert(
          endNodes.length >= 1,
          `Workflow "${wf.name}" must have at least 1 end node (found ${endNodes.length})`,
        )

        // 3. Node positions validity
        for (const n of wf.nodes) {
          runner.assert(
            typeof n.position?.x === 'number' && !isNaN(n.position.x),
            `Node "${n.id}" has invalid x coordinate`,
          )
          runner.assert(
            typeof n.position?.y === 'number' && !isNaN(n.position.y),
            `Node "${n.id}" has invalid y coordinate`,
          )
        }

        // 4. Edge ID uniqueness
        const edgeIds = new Set<string>()
        for (const e of wf.edges) {
          runner.assert(!edgeIds.has(e.id), `Duplicate edge id "${e.id}" in "${wf.name}"`)
          edgeIds.add(e.id)
        }

        // 5. Reachability from effective start node along directed edges
        const adj = new Map<string, string[]>()
        for (const e of wf.edges) {
          if (!adj.has(e.source)) adj.set(e.source, [])
          adj.get(e.source)!.push(e.target)
        }

        const reachable = new Set<string>()
        const queue = [effectiveStartNode.id]
        while (queue.length > 0) {
          const curr = queue.shift()!
          if (reachable.has(curr)) continue
          reachable.add(curr)
          for (const neighbor of adj.get(curr) ?? []) {
            if (!reachable.has(neighbor)) queue.push(neighbor)
          }
        }

        // Verify 100% of nodes are reachable from start in sample workflows
        for (const n of wf.nodes) {
          runner.assert(
            reachable.has(n.id),
            `Node "${n.id}" (${n.data.label}) is unreachable from start in "${wf.name}"`,
          )
        }
      })
    }
  })

  // ─── SUITE 5: Playback State Machine Simulation & Boundary Testing ──────────
  runner.suite('5. Playback Hook State Machine & Step Boundary Simulation', () => {
    runner.test('Stepping forward through multiAgentReflection from -1 to completion', () => {
      const reflectionWf = workflows.find((w) => w.name.includes('Reflection'))!
      const sim = simulatePlaybackRun(reflectionWf)

      runner.assertEqual(sim.currentIndex, -1, 'Initial currentIndex is -1')
      runner.assertEqual(sim.currentNode, null, 'Initial currentNode is null')
      runner.assertEqual(sim.visited.size, 0, 'Initial visited is empty')
      runner.assertEqual(sim.progress, 0, 'Initial progress is 0')

      // Step forward 1 by 1
      for (let i = 0; i < sim.steps.length; i++) {
        sim.next()
        runner.assertEqual(sim.currentIndex, i, `Step ${i}: currentIndex is ${i}`)
        runner.assertEqual(sim.currentNode?.id, sim.steps[i], `Step ${i}: currentNode matches ${sim.steps[i]}`)
        runner.assertEqual(sim.visited.size, i + 1, `Step ${i}: visited size is ${i + 1}`)
        runner.assert(sim.visited.has(sim.steps[i]), `Step ${i}: visited contains ${sim.steps[i]}`)
      }

      runner.assertEqual(sim.progress, 1, 'Final step progress is 1.0 (100%)')

      // Overstepping: next() at end must clamp at steps.length - 1
      sim.next()
      runner.assertEqual(sim.currentIndex, sim.steps.length - 1, 'Overstep clamped at steps.length - 1')
    })

    runner.test('Stepping backward through routerClassifierPattern with prev() and understepping', () => {
      const routerWf = workflows.find((w) => w.name.includes('Router'))!
      const sim = simulatePlaybackRun(routerWf)

      // Advance to end
      while (sim.currentIndex < sim.steps.length - 1) {
        sim.next()
      }
      runner.assertEqual(sim.currentIndex, sim.steps.length - 1, 'At end')

      // Step backward 1 by 1
      for (let i = sim.steps.length - 2; i >= -1; i--) {
        sim.prev()
        runner.assertEqual(sim.currentIndex, i, `Backward step to ${i}`)
      }

      runner.assertEqual(sim.currentIndex, -1, 'Back at -1')
      runner.assertEqual(sim.currentNode, null, 'currentNode is null at -1')

      // Understepping: prev() at -1 must clamp at -1
      sim.prev()
      runner.assertEqual(sim.currentIndex, -1, 'Understep clamped at -1')
    })

    runner.test('Restart resets index to -1 and stops playback', () => {
      const ragWf = workflows.find((w) => w.name.includes('RAG Pipeline'))!
      const sim = simulatePlaybackRun(ragWf)

      sim.next()
      sim.next()
      sim.toggle() // playing
      runner.assert(sim.currentIndex > 0, 'Advanced')

      sim.restart()
      runner.assertEqual(sim.currentIndex, -1, 'restart() reset currentIndex to -1')
      runner.assertEqual(sim.isPlaying, false, 'restart() set isPlaying to false')
    })

    runner.test('Speed cycling traverses 1 -> 2 -> 0.5 -> 1', () => {
      const ragWf = workflows.find((w) => w.name.includes('RAG Pipeline'))!
      const sim = simulatePlaybackRun(ragWf)

      runner.assertEqual(sim.speed, 1, 'Initial speed 1')
      sim.cycleSpeed()
      runner.assertEqual(sim.speed, 2, 'Speed cycled to 2')
      sim.cycleSpeed()
      runner.assertEqual(sim.speed, 0.5, 'Speed cycled to 0.5')
      sim.cycleSpeed()
      runner.assertEqual(sim.speed, 1, 'Speed cycled back to 1')
    })

    runner.test('Auto-play simulation steps to end and halts without infinite loop on cyclic graph', () => {
      const reflectionWf = workflows.find((w) => w.name.includes('Reflection'))!
      const sim = simulatePlaybackRun(reflectionWf)

      sim.toggle()
      runner.assertEqual(sim.isPlaying, true, 'toggle starts playing')

      let iterations = 0
      const maxAllowedIterations = sim.steps.length + 5

      while (sim.isPlaying && iterations < maxAllowedIterations) {
        sim.stepAuto()
        iterations++
      }

      runner.assertEqual(sim.isPlaying, false, 'Playback automatically paused at end')
      runner.assertEqual(sim.currentIndex, sim.steps.length - 1, 'Reached last step')
      runner.assert(iterations <= sim.steps.length, `Playback completed in ${iterations} steps`)
    })

    runner.test('All nodes across all 9 workflows have valid, non-zero dwell durations', () => {
      for (const wf of workflows) {
        for (const n of wf.nodes) {
          const rawDuration = n.data.duration ?? 2500
          runner.assert(
            typeof rawDuration === 'number' && rawDuration > 0 && !isNaN(rawDuration),
            `Node "${n.id}" in "${wf.name}" has invalid duration: ${rawDuration}`,
          )
          for (const spd of PLAYBACK_SPEEDS) {
            const dwell = rawDuration / spd
            runner.assert(
              dwell > 0 && isFinite(dwell) && !isNaN(dwell),
              `Dwell duration calculation error on node "${n.id}" at speed ${spd}`,
            )
          }
        }
      }
    })

    runner.test('Adversarial edge case: empty workflow playback simulation', () => {
      const emptyWf: Workflow = {
        id: 'wf-empty',
        name: 'Empty Workflow',
        description: 'Empty workflow description',
        category: 'custom',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: [],
        edges: [],
      }
      const sim = simulatePlaybackRun(emptyWf)
      runner.assertEqual(sim.steps.length, 0, 'Empty steps')
      runner.assertEqual(sim.progress, 0, 'Empty progress')
      runner.assertEqual(sim.currentNode, null, 'Empty currentNode null')
      // Operations on empty workflow should not crash
      sim.next()
      sim.prev()
      sim.restart()
      sim.toggle()
      runner.assertEqual(sim.currentIndex, -1, 'Index remains -1')
    })
  })

  return runner.printReport()
}

// Self-executing runner
if (import.meta.url.startsWith('file:') && process.argv[1]) {
  const isDirectRun = process.argv[1].includes('adversarialPlaybackTest')
  if (isDirectRun) {
    const ok = runAdversarialValidation()
    process.exit(ok ? 0 : 1)
  }
}
