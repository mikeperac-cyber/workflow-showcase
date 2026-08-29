import { randomUUID } from 'node:crypto'
import type { Workspace, WorkflowRevision, WorkflowSummary, WorkspaceRole } from '@eduflow/contracts'
import postgres from 'postgres'

export interface PlatformRepository {
  listWorkspaces(subject: string): Promise<Array<Workspace & { role: WorkspaceRole }>>
  createWorkspace(subject: string, name: string): Promise<Workspace>
  listWorkflows(subject: string, workspaceId: string): Promise<WorkflowSummary[]>
  createWorkflow(subject: string, input: { workspaceId: string; name: string; description: string; document: unknown }): Promise<WorkflowSummary>
  getRevision(subject: string, workflowId: string): Promise<WorkflowRevision | null>
}

interface StoredWorkspace extends Workspace {
  memberships: Map<string, WorkspaceRole>
}

interface StoredWorkflow extends WorkflowSummary {
  revisions: WorkflowRevision[]
}

/** Test and local-development repository. Production wiring replaces this with PostgreSQL. */
export class InMemoryPlatformRepository implements PlatformRepository {
  private readonly workspaces = new Map<string, StoredWorkspace>()
  private readonly workflows = new Map<string, StoredWorkflow>()

  async listWorkspaces(subject: string): Promise<Array<Workspace & { role: WorkspaceRole }>> {
    return [...this.workspaces.values()]
      .filter((workspace) => workspace.memberships.has(subject))
      .map(({ memberships, ...workspace }) => ({ ...workspace, role: memberships.get(subject)! }))
  }

  async createWorkspace(subject: string, name: string): Promise<Workspace> {
    const workspace: StoredWorkspace = {
      id: randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      memberships: new Map([[subject, 'owner']]),
    }
    this.workspaces.set(workspace.id, workspace)
    const { memberships: _memberships, ...publicWorkspace } = workspace
    return publicWorkspace
  }

  async listWorkflows(subject: string, workspaceId: string): Promise<WorkflowSummary[]> {
    this.requireWorkspaceRole(subject, workspaceId, ['owner', 'editor', 'commenter', 'viewer'])
    return [...this.workflows.values()]
      .filter((workflow) => workflow.workspaceId === workspaceId)
      .map(({ revisions: _revisions, ...summary }) => summary)
  }

  async createWorkflow(subject: string, input: { workspaceId: string; name: string; description: string; document: unknown }): Promise<WorkflowSummary> {
    this.requireWorkspaceRole(subject, input.workspaceId, ['owner', 'editor'])
    const workflowId = randomUUID()
    const revisionId = randomUUID()
    const now = new Date().toISOString()
    const revision: WorkflowRevision = { id: revisionId, workflowId, version: 1, document: input.document, createdAt: now, createdBy: subject }
    const workflow: StoredWorkflow = {
      id: workflowId,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      schemaVersion: 1,
      revisionId,
      updatedAt: now,
      revisions: [revision],
    }
    this.workflows.set(workflowId, workflow)
    const { revisions: _revisions, ...summary } = workflow
    return summary
  }

  async getRevision(subject: string, workflowId: string): Promise<WorkflowRevision | null> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return null
    this.requireWorkspaceRole(subject, workflow.workspaceId, ['owner', 'editor', 'commenter', 'viewer'])
    return workflow.revisions.at(-1) ?? null
  }

  private requireWorkspaceRole(subject: string, workspaceId: string, allowed: WorkspaceRole[]): void {
    const role = this.workspaces.get(workspaceId)?.memberships.get(subject)
    if (!role || !allowed.includes(role)) throw new Error('FORBIDDEN')
  }
}

/** PostgreSQL repository used by deployed API tasks. Run migrations before enabling DATABASE_URL. */
export class PostgresPlatformRepository implements PlatformRepository {
  constructor(private readonly sql: postgres.Sql) {}

  async listWorkspaces(subject: string): Promise<Array<Workspace & { role: WorkspaceRole }>> {
    const userId = await this.getUserId(subject)
    if (!userId) return []
    return this.sql<Array<Workspace & { role: WorkspaceRole }>>`
      select w.id, w.name, w.created_at as "createdAt", m.role
      from workspace w join workspace_membership m on m.workspace_id = w.id
      where m.user_id = ${userId}
      order by w.created_at asc
    `
  }

  async createWorkspace(subject: string, name: string): Promise<Workspace> {
    return this.sql.begin(async (tx) => {
      const userId = await this.ensureUser(tx, subject)
      const [workspace] = await tx<Workspace[]>`
        insert into workspace (id, name) values (gen_random_uuid(), ${name})
        returning id, name, created_at as "createdAt"
      `
      if (!workspace) throw new Error('WORKSPACE_CREATE_FAILED')
      await tx`
        insert into workspace_membership (workspace_id, user_id, role)
        values (${workspace.id}, ${userId}, 'owner')
      `
      return workspace
    })
  }

  async listWorkflows(subject: string, workspaceId: string): Promise<WorkflowSummary[]> {
    const userId = await this.requireMembership(subject, workspaceId, ['owner', 'editor', 'commenter', 'viewer'])
    if (!userId) throw new Error('FORBIDDEN')
    return this.sql<WorkflowSummary[]>`
      select id, workspace_id as "workspaceId", name, description, schema_version as "schemaVersion",
             head_revision_id as "revisionId", updated_at as "updatedAt"
      from workflow where workspace_id = ${workspaceId} order by updated_at desc
    `
  }

  async createWorkflow(subject: string, input: { workspaceId: string; name: string; description: string; document: unknown }): Promise<WorkflowSummary> {
    return this.sql.begin(async (tx) => {
      const userId = await this.requireMembership(subject, input.workspaceId, ['owner', 'editor'], tx)
      if (!userId) throw new Error('FORBIDDEN')
      const [workflow] = await tx<Array<{ id: string }>>`
        insert into workflow (id, workspace_id, name, description, schema_version)
        values (gen_random_uuid(), ${input.workspaceId}, ${input.name}, ${input.description}, 1)
        returning id
      `
      if (!workflow) throw new Error('WORKFLOW_CREATE_FAILED')
      const [revision] = await tx<Array<{ id: string; createdAt: string }>>`
        insert into workflow_revision (id, workflow_id, version, document, created_by)
        values (gen_random_uuid(), ${workflow.id}, 1, ${tx.json(input.document as postgres.JSONValue)}, ${userId})
        returning id, created_at as "createdAt"
      `
      if (!revision) throw new Error('REVISION_CREATE_FAILED')
      const [summary] = await tx<WorkflowSummary[]>`
        update workflow set head_revision_id = ${revision.id}, updated_at = now() where id = ${workflow.id}
        returning id, workspace_id as "workspaceId", name, description, schema_version as "schemaVersion",
                  head_revision_id as "revisionId", updated_at as "updatedAt"
      `
      if (!summary) throw new Error('WORKFLOW_UPDATE_FAILED')
      return summary
    })
  }

  async getRevision(subject: string, workflowId: string): Promise<WorkflowRevision | null> {
    const [row] = await this.sql<Array<WorkflowRevision & { workspaceId: string }>>`
      select r.id, r.workflow_id as "workflowId", r.version, r.document, r.created_at as "createdAt",
             u.auth0_subject as "createdBy", w.workspace_id as "workspaceId"
      from workflow_revision r
      join workflow w on w.id = r.workflow_id
      join app_user u on u.id = r.created_by
      where r.workflow_id = ${workflowId} and r.id = w.head_revision_id
    `
    if (!row) return null
    const userId = await this.requireMembership(subject, row.workspaceId, ['owner', 'editor', 'commenter', 'viewer'])
    if (!userId) throw new Error('FORBIDDEN')
    const { workspaceId: _workspaceId, ...revision } = row
    return revision
  }

  private async getUserId(subject: string): Promise<string | null> {
    const [user] = await this.sql<Array<{ id: string }>>`select id from app_user where auth0_subject = ${subject}`
    return user?.id ?? null
  }

  private async ensureUser(tx: postgres.TransactionSql, subject: string): Promise<string> {
    const [user] = await tx<Array<{ id: string }>>`
      insert into app_user (id, auth0_subject) values (gen_random_uuid(), ${subject})
      on conflict (auth0_subject) do update set auth0_subject = excluded.auth0_subject
      returning id
    `
    if (!user) throw new Error('USER_CREATE_FAILED')
    return user.id
  }

  private async requireMembership(
    subject: string,
    workspaceId: string,
    roles: WorkspaceRole[],
    tx: postgres.TransactionSql | postgres.Sql = this.sql,
  ): Promise<string | null> {
    const [membership] = await tx<Array<{ userId: string; role: WorkspaceRole }>>`
      select m.user_id as "userId", m.role
      from workspace_membership m join app_user u on u.id = m.user_id
      where m.workspace_id = ${workspaceId} and u.auth0_subject = ${subject}
    `
    return membership && roles.includes(membership.role) ? membership.userId : null
  }
}
