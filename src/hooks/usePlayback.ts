import { useEffect, useMemo, useState } from 'react'
import type { Workflow, WorkflowNode } from '../types/workflow'

export const PLAYBACK_SPEEDS = [0.5, 1, 2] as const

/**
 * BFS traversal from the `start` node along edges.
 * Disconnected nodes are appended at the end so every node gets showcased.
 */
export function computeTraversal(workflow: Workflow): string[] {
  const adjacency = new Map<string, string[]>()
  for (const e of workflow.edges) {
    adjacency.set(e.source, [...(adjacency.get(e.source) ?? []), e.target])
  }

  const startNode = workflow.nodes.find((n) => n.data.nodeType === 'start') ?? workflow.nodes[0]
  const order: string[] = []
  const seen = new Set<string>()

  if (startNode) {
    const queue = [startNode.id]
    while (queue.length > 0) {
      const id = queue.shift()!
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

export interface Playback {
  steps: string[]
  currentIndex: number
  currentNode: WorkflowNode | null
  visited: ReadonlySet<string>
  isPlaying: boolean
  speed: number
  progress: number
  toggle: () => void
  next: () => void
  prev: () => void
  restart: () => void
  cycleSpeed: () => void
}

export function usePlayback(workflow: Workflow): Playback {
  const steps = useMemo(() => computeTraversal(workflow), [workflow])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  // Reset playback whenever a different workflow is opened.
  useEffect(() => {
    setCurrentIndex(-1)
    setIsPlaying(false)
  }, [workflow.id])

  useEffect(() => {
    if (!isPlaying) return
    if (currentIndex >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    const nextId = steps[currentIndex + 1]
    const node = workflow.nodes.find((n) => n.id === nextId)
    const dwell = (node?.data.duration ?? 2000) / speed
    const timer = setTimeout(
      () => setCurrentIndex((i) => Math.min(i + 1, steps.length - 1)),
      dwell,
    )
    return () => clearTimeout(timer)
  }, [isPlaying, currentIndex, speed, steps, workflow.nodes])

  const visited = useMemo(
    () => new Set(steps.slice(0, Math.max(0, currentIndex + 1))),
    [steps, currentIndex],
  )

  const currentNodeId = currentIndex >= 0 ? steps[currentIndex] : null
  const currentNode = currentNodeId
    ? (workflow.nodes.find((n) => n.id === currentNodeId) ?? null)
    : null

  return {
    steps,
    currentIndex,
    currentNode,
    visited,
    isPlaying,
    speed,
    progress: steps.length > 0 ? Math.max(0, currentIndex + 1) / steps.length : 0,
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
  }
}
