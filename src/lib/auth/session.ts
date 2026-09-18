export type Session = { userId: string; role: 'admin' | 'editor' }

export async function getSession(): Promise<Session | null> {
  return null
}
