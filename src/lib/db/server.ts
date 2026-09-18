import 'server-only'
import { databaseConfig } from './client'

export function getDatabaseStatus() {
  return databaseConfig
}
