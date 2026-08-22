import type { WorkflowNode, Workflow } from '../types/workflow'
import type { Edge } from '@xyflow/react'

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function generateMockAiWorkflow(prompt: string): Omit<Workflow, 'id'> {
  // A simple 3-node mock workflow regardless of the prompt.
  // In a real scenario, this would parse an LLM JSON response.
  const startId = generateId()
  const stepId = generateId()
  const endId = generateId()

  const nodes: WorkflowNode[] = [
      {
          id: startId,
          type: 'workflow',
          position: { x: 250, y: 100 },
          data: {
              label: 'Start Lesson',
              nodeType: 'start',
              description: `Generated from: ${prompt}`,
          }
      },
      {
          id: stepId,
          type: 'workflow',
          position: { x: 250, y: 250 },
          data: {
              label: 'Main Activity',
              nodeType: 'task',
              description: 'This is a mock generated step based on your input.',
              details: 'The AI analyzed your prompt and decided this should be the core activity of the workflow.'
          }
      },
      {
          id: endId,
          type: 'workflow',
          position: { x: 250, y: 400 },
          data: {
              label: 'Review & Close',
              nodeType: 'end',
              description: 'Wrap up the session.',
          }
      }
  ]

  const edges: Edge[] = [
      { id: `e-${startId}-${stepId}`, source: startId, target: stepId },
      { id: `e-${stepId}-${endId}`, source: stepId, target: endId }
  ]

  const now = Date.now()
  return {
      name: `AI Generated: ${prompt.substring(0, 20)}...`,
      description: `Automatically generated workflow based on: "${prompt}"`,
      category: 'ai',
      nodes,
      edges,
      tags: ['AI-Generated', 'Draft'],
      createdAt: now,
      updatedAt: now
  }
}
