import type { SourceId } from './sources'
import snapshot from '@/data/snapshot_v1.json'

/**
 * Observed city data, transcribed from the Resonance Best Cities reports (backend/data/observations_v1.json).
 *
 * These are the only city-level numbers on this site that come from a published source.
 * Everything else (Art City Index, 6-dimension scores, trend series, signal scores) is
 * illustrative — see `provenance` in the UI.
 *
 * Resonance ranks a city on three pillars — Livability, Lovability, Prosperity — built
 * from 46 metrics across 30 categories, all weighted evenly, for metro areas above
 * 1,000,000 people. Lower is better: these are ranks, not scores.
 */

export type PillarRanks = {
  livability: number
  lovability: number
  prosperity: number
}

export type RegionalRank = {
  scope: string
  rank: number
  sourceId: SourceId
}

export type CityObservation = {
  /** Rank in the global Top 100, when the city appears in it. */
  world?: { rank: number; pillars: PillarRanks; sourceId: SourceId }
  regional?: RegionalRank
  /** Why the city is missing from the global table, when it is. */
  worldNote?: string
}

const observations = snapshot.observations as Record<string, CityObservation>

export function getObservation(slug: string): CityObservation | undefined {
  return observations[slug]
}

/** Cities carrying at least one observed rank. */
export const observedCityCount = Object.keys(observations).length

/** Cities with a rank in the global Top 100 table. */
export const worldRankedCityCount = Object.values(observations).filter((o) => o.world).length
