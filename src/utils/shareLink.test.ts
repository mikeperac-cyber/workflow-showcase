import { describe, expect, it } from 'vitest'
import { createSampleWorkflows } from './sampleWorkflows'
import { decodeWorkflow, encodeWorkflow } from './shareLink'

describe('workflow share links', () => {
  it('round-trips a complete seeded workflow', () => {
    const workflow = Object.values(createSampleWorkflows())[0]
    expect(workflow).toBeDefined()
    expect(decodeWorkflow(encodeWorkflow(workflow!))).toEqual(workflow)
  })

  it('rejects malformed payloads', () => {
    expect(decodeWorkflow('not-a-workflow')).toBeNull()
  })
})
