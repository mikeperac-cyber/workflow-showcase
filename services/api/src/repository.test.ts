import { describe, expect, it } from 'vitest'
import { InMemoryPlatformRepository } from './repository.js'

describe('InMemoryPlatformRepository', () => {
  it('enforces workspace roles while retaining immutable first revisions', async () => {
    const repository = new InMemoryPlatformRepository()
    const workspace = await repository.createWorkspace('auth0|owner', 'Team A')
    const created = await repository.createWorkflow('auth0|owner', {
      workspaceId: workspace.id,
      name: 'Review pipeline',
      description: 'A test workflow',
      document: { schemaVersion: 1, nodes: [], edges: [] },
    })

    expect((await repository.listWorkflows('auth0|owner', workspace.id)).map((workflow) => workflow.id)).toEqual([created.id])
    await expect(repository.listWorkflows('auth0|other', workspace.id)).rejects.toThrow('FORBIDDEN')
    await expect(repository.getRevision('auth0|owner', created.id)).resolves.toMatchObject({ version: 1, workflowId: created.id })
  })
})
