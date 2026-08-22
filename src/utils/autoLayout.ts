import dagre from 'dagre'
import type { WorkflowNode } from '../types/workflow'
import type { Edge } from '@xyflow/react'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 250 // Average node width
const nodeHeight = 100 // Average node height

export function getAutoLayoutNodes(
  nodes: WorkflowNode[],
  edges: Edge[],
  direction = 'TB' // TB = Top to Bottom, LR = Left to Right
): WorkflowNode[] {
  dagreGraph.setGraph({ rankdir: direction, align: 'DL', nodesep: 50, ranksep: 100 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })
}
