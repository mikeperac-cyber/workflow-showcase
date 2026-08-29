import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { InMemoryPlatformRepository } from './repository.js'
import { PostgresPlatformRepository } from './repository.js'
import postgres from 'postgres'

const config = loadConfig()
const repository = config.databaseUrl
  ? new PostgresPlatformRepository(postgres(config.databaseUrl, { max: 10 }))
  : new InMemoryPlatformRepository()
const app = await createApp(config, repository)

try {
  await app.listen({ host: config.host, port: config.port })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
