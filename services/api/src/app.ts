import fastifyAuth0Api from '@auth0/auth0-fastify-api'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { ApiConfig } from './config.js'
import type { PlatformRepository } from './repository.js'

interface Auth0Request {
  user?: { sub?: string }
}

function subjectFrom(request: FastifyRequest): string | null {
  return (request as FastifyRequest & Auth0Request).user?.sub ?? request.headers['x-local-user'] ?? null
}

export async function createApp(config: ApiConfig, repository: PlatformRepository) {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: config.allowedOrigins, credentials: true })
  await app.register(swagger, {
    openapi: { info: { title: 'EduFlow API', version: '0.1.0' } },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  if (config.auth0) {
    await app.register(fastifyAuth0Api, config.auth0)
  }

  const auth0Guard = config.auth0
    ? (app as typeof app & { requireAuth: () => (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> }).requireAuth()
    : undefined

  const requireIdentity = async (request: FastifyRequest, reply: FastifyReply) => {
    if (config.auth0) {
      await auth0Guard?.(request, reply)
      if (reply.sent) return
      const protectedRequest = request as FastifyRequest & { user?: { sub?: string } }
      if (!protectedRequest.user?.sub) {
        return reply.code(401).send({ error: 'UNAUTHENTICATED' })
      }
      return
    }
    if (config.allowLocalAuth && request.headers['x-local-user']) return
    return reply.code(503).send({ error: 'AUTH_NOT_CONFIGURED' })
  }

  app.get('/health', async () => ({ status: 'ok', service: 'eduflow-api' }))
  app.get('/openapi.json', async () => app.swagger())

  app.get('/v1/workspaces', { preHandler: requireIdentity }, async (request) => {
    const subject = subjectFrom(request)
    if (!subject) return []
    return repository.listWorkspaces(subject)
  })

  app.post('/v1/workspaces', { preHandler: requireIdentity }, async (request, reply) => {
    const subject = subjectFrom(request)
    if (!subject) return reply.code(401).send({ error: 'UNAUTHENTICATED' })
    const body = z.object({ name: z.string().trim().min(1).max(120) }).parse(request.body)
    return reply.code(201).send(await repository.createWorkspace(subject, body.name))
  })

  app.get('/v1/workspaces/:workspaceId/workflows', { preHandler: requireIdentity }, async (request, reply) => {
    const subject = subjectFrom(request)
    if (!subject) return reply.code(401).send({ error: 'UNAUTHENTICATED' })
    const { workspaceId } = z.object({ workspaceId: z.string().uuid() }).parse(request.params)
    try {
      return await repository.listWorkflows(subject, workspaceId)
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') return reply.code(403).send({ error: 'FORBIDDEN' })
      throw error
    }
  })

  app.post('/v1/workflows', { preHandler: requireIdentity }, async (request, reply) => {
    const subject = subjectFrom(request)
    if (!subject) return reply.code(401).send({ error: 'UNAUTHENTICATED' })
    const body = z.object({
      workspaceId: z.string().uuid(),
      name: z.string().trim().min(1).max(160),
      description: z.string().max(2000).default(''),
      document: z.unknown(),
    }).parse(request.body)
    try {
      return reply.code(201).send(await repository.createWorkflow(subject, body))
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') return reply.code(403).send({ error: 'FORBIDDEN' })
      throw error
    }
  })

  return app
}
