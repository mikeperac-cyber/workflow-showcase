export interface ApiConfig {
  host: string
  port: number
  allowedOrigins: string[]
  databaseUrl?: string
  auth0?: {
    domain: string
    audience: string
  }
  /** Explicitly development-only: provides an identity for local smoke tests. */
  allowLocalAuth: boolean
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const domain = optional(env.AUTH0_DOMAIN)
  const audience = optional(env.AUTH0_AUDIENCE)
  if (Boolean(domain) !== Boolean(audience)) {
    throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE must be configured together.')
  }

  const port = Number(env.PORT ?? 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.')

  return {
    host: env.HOST ?? '127.0.0.1',
    port,
    allowedOrigins: (env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean),
    databaseUrl: optional(env.DATABASE_URL),
    auth0: domain && audience ? { domain, audience } : undefined,
    allowLocalAuth: env.NODE_ENV !== 'production' && env.ALLOW_LOCAL_AUTH === 'true',
  }
}
