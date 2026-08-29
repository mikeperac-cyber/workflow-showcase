import { useEffect, useMemo, useState } from 'react'
import type { Workflow, WorkflowNode } from '../types/workflow'
import { playTTS, stopTTS } from '../utils/tts'

export const PLAYBACK_SPEEDS = [0.5, 1, 2] as const

/**
 * BFS traversal from the `start` node along edges.
 * Disconnected nodes are appended at the end so every node gets showcased.
 */
function computeTraversalParts(workflow: Pick<Workflow, 'nodes' | 'edges'>): string[] {
  const adjacency = new Map<string, string[]>()
  for (const e of workflow.edges) {
    const targets = adjacency.get(e.source)
    if (targets) {
      targets.push(e.target)
    } else {
      adjacency.set(e.source, [e.target])
    }
  }

  const startNode = workflow.nodes.find((n) => n.data.nodeType === 'start') ?? workflow.nodes[0]
  const order: string[] = []
  const seen = new Set<string>()

  if (startNode) {
    const queue = [startNode.id]
    let queueIndex = 0
    while (queueIndex < queue.length) {
      const id = queue[queueIndex++]
      if (seen.has(id)) continue
      seen.add(id)
      order.push(id)
      for (const target of adjacency.get(id) ?? []) {
        if (!seen.has(target)) queue.push(target)
      }
    }
  }

  for (const n of workflow.nodes) {
    if (!seen.has(n.id)) {
      seen.add(n.id)
      order.push(n.id)
    }
  }
  return order
}

export function computeTraversal(workflow: Workflow): string[] {
  return computeTraversalParts(workflow)
}

export interface Playback {
  steps: string[]
  currentIndex: number
  currentNode: WorkflowNode | null
  visited: ReadonlySet<string>
  isPlaying: boolean
  speed: number
  progress: number
  ttsEnabled: boolean
  toggleTTS: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  restart: () => void
  cycleSpeed: () => void
  jumpToNode: (nodeId: string) => void
}

export function usePlayback(workflow: Workflow): Playback {
  const steps = useMemo(
    () => computeTraversalParts({ nodes: workflow.nodes, edges: workflow.edges }),
    [workflow.nodes, workflow.edges],
  )
  const nodesById = useMemo(
    () => new Map(workflow.nodes.map((node) => [node.id, node] as const)),
    [workflow.nodes],
  )
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset playback whenever a different workflow is opened.
  useEffect(() => {
    setCurrentIndex(-1)
    setIsPlaying(false)
    stopTTS()
  }, [workflow.id])

  useEffect(() => {
    if (currentIndex < steps.length) return
    setCurrentIndex(Math.max(-1, steps.length - 1))
    setIsPlaying(false)
  }, [currentIndex, steps.length])

  // Handle TTS
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < steps.length && ttsEnabled) {
      const nodeId = steps[currentIndex]
      const node = nodesById.get(nodeId)
      if (node?.data.description || node?.data.label) {
        playTTS(node.data.description || node.data.label)
      }
    } else {
        stopTTS()
    }
  }, [currentIndex, steps, nodesById, ttsEnabled])


  useEffect(() => {
    const completed = steps.length > 0 ? Math.max(0, currentIndex + 1) / steps.length : 0
    if (!isPlaying) {
      setProgress(completed)
      return
    }
    if (currentIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    const currentId = currentIndex >= 0 ? steps[currentIndex] : null
    const currentNode = currentId ? nodesById.get(currentId) : null

    // Pause at decision nodes
    if (currentNode?.data.nodeType === 'decision') {
        setIsPlaying(false)
        return
    }

    const nextId = steps[currentIndex + 1]
    const node = nodesById.get(nextId)
    const dwell = (node?.data.duration ?? 2000) / speed
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const elapsed = now - startedAt
      setProgress(Math.min(1, completed + Math.min(1, elapsed / dwell) / steps.length))
      if (elapsed >= dwell) {
        setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, currentIndex, speed, steps, nodesById])

  const visited = useMemo(
    () => new Set(steps.slice(0, Math.max(0, currentIndex + 1))),
    [steps, currentIndex],
  )

  const currentNodeId = currentIndex >= 0 ? steps[currentIndex] : null
  const currentNode = currentNodeId
    ? (nodesById.get(currentNodeId) ?? null)
    : null

  return {
    steps,
    currentIndex,
    currentNode,
    visited,
    isPlaying,
    speed,
    ttsEnabled,
    progress,
    toggleTTS: () => setTtsEnabled((previous) => !previous),
    toggle: () => {
      if (steps.length === 0) return
      if (isPlaying) {
        setIsPlaying(false)
      } else {
        if (currentIndex >= steps.length - 1) setCurrentIndex(-1)
        setIsPlaying(true)
      }
    },
    next: () => {
      setIsPlaying(false)
      setCurrentIndex((i) => Math.min(i + 1, steps.length - 1))
    },
    prev: () => {
      setIsPlaying(false)
      setCurrentIndex((i) => Math.max(i - 1, -1))
    },
    restart: () => {
      setIsPlaying(false)
      setCurrentIndex(-1)
    },
    cycleSpeed: () =>
      setSpeed((s) => {
        const idx = PLAYBACK_SPEEDS.indexOf(s as (typeof PLAYBACK_SPEEDS)[number])
        return PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]
      }),
    jumpToNode: (nodeId: string) => {
        const index = steps.indexOf(nodeId)
        if (index !== -1) {
            setIsPlaying(false)
            setCurrentIndex(index)
        }
    }
  }
}
