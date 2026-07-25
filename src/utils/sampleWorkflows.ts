import type { Edge } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'
import type { Workflow, WorkflowNode, WorkflowNodeType } from '../types/workflow'
import { uid } from './id'

const arrow = { type: MarkerType.ArrowClosed }

function node(
  id: string,
  nodeType: WorkflowNodeType,
  x: number,
  y: number,
  data: Partial<WorkflowNode['data']> & { label: string },
): WorkflowNode {
  return {
    id,
    type: 'workflow',
    position: { x, y },
    data: { nodeType, duration: 2000, ...data },
  }
}

function edge(id: string, source: string, target: string, label?: string): Edge {
  return {
    id,
    source,
    target,
    label,
    type: 'smoothstep',
    markerEnd: arrow,
  }
}

function orderFulfillment(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Order Fulfillment Pipeline',
    description: 'How an order moves from checkout to the customer\'s door.',
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('of-start', 'start', 0, 140, { label: 'Order Placed', description: 'Checkout webhook fires' }),
      node('of-receive', 'task', 240, 140, {
        label: 'Receive & Enrich',
        description: 'Normalize order payload',
        details:
          'The order webhook is validated, deduplicated, and enriched with customer and inventory data before entering the pipeline.',
        metrics: [
          { label: 'p99 latency', value: '120ms' },
          { label: 'duplicates', value: '< 0.1%' },
        ],
      }),
      node('of-validate', 'decision', 480, 140, {
        label: 'Payment OK?',
        description: 'Charge the customer',
        details: 'Payment is attempted with automatic retry on transient failures. Declines route to the cancellation path.',
        codeSnippet: `function validatePayment(order) {
  const res = payments.charge(order.total, order.cardToken)
  if (!res.ok) throw new PaymentDeclined(res.reason)
  return res.receiptId
}`,
      }),
      node('of-pack', 'task', 720, 40, {
        label: 'Pick & Pack',
        description: 'Warehouse fulfillment',
        details: 'Warehouse staff pick items by optimized route. Each item is scanned for accuracy before packing.',
        imageUrl: '',
        metrics: [{ label: 'pick accuracy', value: '99.8%' }],
      }),
      node('of-cancel', 'end', 720, 260, {
        label: 'Cancel & Refund',
        description: 'Notify customer, restock',
        details: 'On payment failure the order is cancelled, inventory is released, and the customer is notified.',
      }),
      node('of-ship', 'task', 960, 40, {
        label: 'Ship Order',
        description: 'Carrier handoff',
        details: 'Labels are purchased via rate-shopping across carriers. Tracking numbers are pushed to the customer.',
        metrics: [
          { label: 'on-time ship', value: '97.4%' },
          { label: 'avg cost', value: '$6.20' },
        ],
      }),
      node('of-end', 'end', 1200, 40, { label: 'Delivered', description: 'Tracking confirms delivery' }),
    ],
    edges: [
      edge('of-e1', 'of-start', 'of-receive'),
      edge('of-e2', 'of-receive', 'of-validate'),
      edge('of-e3', 'of-validate', 'of-pack', 'paid'),
      edge('of-e4', 'of-validate', 'of-cancel', 'declined'),
      edge('of-e5', 'of-pack', 'of-ship'),
      edge('of-e6', 'of-ship', 'of-end'),
    ],
  }
}

function cicdRelease(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'CI/CD Release Flow',
    description: 'From git push to production with automated quality gates.',
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('cicd-start', 'start', 0, 120, { label: 'git push', description: 'Merge to main' }),
      node('cicd-build', 'task', 240, 120, {
        label: 'Build',
        description: 'Compile & bundle',
        details: 'The app is compiled, bundled, and stamped with the commit SHA. Build artifacts are cached by content hash.',
        codeSnippet: `npm ci
npm run build
docker build -t app:$GIT_SHA .`,
        metrics: [{ label: 'build time', value: '3m 12s' }],
      }),
      node('cicd-test', 'decision', 480, 120, {
        label: 'Tests pass?',
        description: 'Unit + e2e suites',
        details: 'Unit, integration, and end-to-end suites run in parallel. Any failure blocks the release and notifies the team.',
        metrics: [
          { label: 'coverage', value: '86%' },
          { label: 'flake rate', value: '0.4%' },
        ],
      }),
      node('cicd-fail', 'end', 720, 260, {
        label: 'Notify & Block',
        description: 'Slack alert, release halted',
        details: 'Failed runs post a summary with logs to the team channel. The release is blocked until main is green.',
      }),
      node('cicd-staging', 'task', 720, 40, {
        label: 'Deploy Staging',
        description: 'Auto-deploy + smoke tests',
        details: 'Green builds deploy to staging automatically. Synthetic smoke tests run against the live environment.',
      }),
      node('cicd-prod', 'task', 960, 40, {
        label: 'Promote to Prod',
        description: 'Manual approval gate',
        details: 'A release manager approves promotion. Production deploys are progressive: 10% → 50% → 100% with auto-rollback.',
        metrics: [{ label: 'deploy freq', value: '12/day' }],
      }),
      node('cicd-end', 'end', 1200, 40, { label: 'Live', description: 'Release complete' }),
    ],
    edges: [
      edge('cicd-e1', 'cicd-start', 'cicd-build'),
      edge('cicd-e2', 'cicd-build', 'cicd-test'),
      edge('cicd-e3', 'cicd-test', 'cicd-staging', 'green'),
      edge('cicd-e4', 'cicd-test', 'cicd-fail', 'failed'),
      edge('cicd-e5', 'cicd-staging', 'cicd-prod'),
      edge('cicd-e6', 'cicd-prod', 'cicd-end'),
    ],
  }
}

export function createSampleWorkflows(): Record<string, Workflow> {
  const samples = [orderFulfillment(), cicdRelease()]
  return Object.fromEntries(samples.map((wf) => [wf.id, wf]))
}
