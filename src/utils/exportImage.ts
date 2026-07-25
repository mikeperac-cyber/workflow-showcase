import { toPng, toSvg } from 'html-to-image'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { WorkflowNode } from '../types/workflow'

const IMAGE_WIDTH = 1280
const IMAGE_HEIGHT = 800

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.download = filename
  a.href = dataUrl
  a.click()
}

/**
 * Renders the React Flow viewport to a PNG or SVG sized to fit all nodes.
 * Must be called while a canvas is mounted in the document.
 */
export async function exportFlowImage(
  kind: 'png' | 'svg',
  nodes: WorkflowNode[],
  workflowName: string,
  background: string,
): Promise<void> {
  const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewportEl || nodes.length === 0) return

  const bounds = getNodesBounds(nodes)
  const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0.15)
  const render = kind === 'png' ? toPng : toSvg

  const dataUrl = await render(viewportEl, {
    backgroundColor: background,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    style: {
      width: `${IMAGE_WIDTH}px`,
      height: `${IMAGE_HEIGHT}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  })

  const safeName = workflowName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workflow'
  download(dataUrl, `${safeName}.${kind}`)
}
