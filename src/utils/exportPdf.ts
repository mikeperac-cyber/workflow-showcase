import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import type { WorkflowNode } from '../types/workflow'
import jsPDF from 'jspdf'

const IMAGE_WIDTH = 1280
const IMAGE_HEIGHT = 800

/**
 * Renders the React Flow viewport to a PDF.
 * Must be called while a canvas is mounted in the document.
 */
export async function exportFlowPdf(
  nodes: WorkflowNode[],
  workflowName: string,
  background: string,
): Promise<void> {
  const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewportEl || nodes.length === 0) return

  const bounds = getNodesBounds(nodes)
  const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0.15)
  const { toCanvas } = await import('html-to-image')

  const canvas = await toCanvas(viewportEl, {
    backgroundColor: background,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    style: {
      width: `${IMAGE_WIDTH}px`,
      height: `${IMAGE_HEIGHT}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [IMAGE_WIDTH, IMAGE_HEIGHT]
  })

  pdf.addImage(imgData, 'PNG', 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

  const safeName = workflowName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workflow'
  pdf.save(`${safeName}.pdf`)
}
