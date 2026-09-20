export type DatabaseStatus = 'not-configured' | 'ready'

export const databaseConfig = {
  provider: 'postgresql',
  status: (process.env.DATABASE_URL ? 'ready' : 'not-configured') as DatabaseStatus,
}
