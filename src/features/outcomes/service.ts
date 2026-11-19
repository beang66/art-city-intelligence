import snapshot from '@/data/snapshot_v1.json'
import type { FormatKey } from '@/features/opportunity/service'

/**
 * Exhibition outcomes (roadmap G1, measurement stage 2): public cases exported by backend/scripts/export_snapshot.py.
 * The record form calls FastAPI /api/outcomes/evaluate at runtime.
 */
export type OutcomeCase = {
  id: string
  brand: string
  title: string
  format: FormatKey
  theme: string
  kind?: 'brand' | 'fair'
  note?: string
  city: string
  venue: string
  start: string
  end: string
  visitors: number
  qualifier: 'exact' | 'about' | 'over'
  admission: 'paid' | 'free' | null
  evidence: 'A' | 'B' | 'C'
  sourceTitle: string
  sourceUrl: string
  days: number
  perDay: number
  fit: number
  fitRank: number
  expectedPerDay: number | null
  peers: number
  ratio: number | null
}

export type OutcomeSummary = {
  updatedAt: string
  note: string
  total: number
  signalOnly: boolean
  minPeers: number
  casesByFormat: Record<FormatKey, number>
  fairCount: number
  cases: OutcomeCase[]
  cityOptions: string[]
  themeOptions: { id: string; labelKo: string }[]
}

export const outcomeSummary = (snapshot as unknown as { outcomes: OutcomeSummary }).outcomes

/** "약 200,000" / "700,000+" — keeps the source's own hedge visible. */
export function reportedVisitors(c: Pick<OutcomeCase, 'visitors' | 'qualifier'>): string {
  const n = c.visitors.toLocaleString()
  return c.qualifier === 'about' ? `약 ${n}` : c.qualifier === 'over' ? `${n}+` : n
}
