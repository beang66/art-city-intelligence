import snapshot from '@/data/snapshot_v1.json'
import type { PillarRanks } from './observed'

type PillarKey = keyof PillarRanks
const pillars = snapshot.pillars as { key: PillarKey; labelKo: string; meaning: string }[]

const PILLAR_KO = Object.fromEntries(pillars.map((p) => [p.key, p.labelKo])) as Record<PillarKey, string>

export type RankReading = {
  headline: string
  detail: string
  best: { key: keyof PillarRanks; rank: number }
  worst: { key: keyof PillarRanks; rank: number }
  spread: number
}

/**
 * What the spread between a city's three published pillar ranks means.
 * Written by backend/app/services/observed.py from observed values only — no authored per-city claim.
 */
export function readRank(citySlug: string): RankReading | null {
  return (snapshot.readings as Record<string, RankReading | null>)[citySlug] ?? null
}

export function pillarLabel(key: keyof PillarRanks): string {
  return PILLAR_KO[key]
}
