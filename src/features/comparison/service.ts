import type { Indicator, IndicatorKey } from '@/types/indicator'
import type { SourceId } from '@/features/evidence/sources'
import snapshot from '@/data/snapshot_v1.json'

/**
 * Six dimensions adapted from the EU Cultural and Creative Cities Monitor (JRC, 2023).
 * Definitions live in backend/data/dimensions_v1.json; every number here is computed by
 * backend/app/services/scoring.py and exported to src/data/snapshot_v1.json, the same code the API runs.
 *
 * The scores are ILLUSTRATIVE: city index × fixed weight, not measured from the underlying indicators.
 * The published data on this site is the Resonance ranking in `features/evidence/observed`.
 */

type DimensionSpec = {
  key: IndicatorKey
  label: string
  labelKo: string
  /** Parent sub-index in the C3 framework. */
  c3Subindex: string
  /** Matching C3 dimension. */
  c3Dimension: string
  /** Study that grounds why this dimension belongs in the model. */
  sourceId: SourceId
  weight: number
  /** Swatch used by the radar vertex and the stat underline. */
  color: string
  /** Reader-facing framing for this dimension. */
  question: string
  about: string
}

export const DIMENSIONS = snapshot.dimensions as readonly DimensionSpec[]

export function getCityIndicators(citySlug: string): readonly Indicator[] {
  return (snapshot.indicators as Record<string, Indicator[]>)[citySlug] ?? []
}

/** Median score per dimension across every city, for cohort comparison. */
export function getCohortMedians(): Record<IndicatorKey, number> {
  return snapshot.cohortMedians as Record<IndicatorKey, number>
}

export type SignalKey = 'market' | 'cultural' | 'opportunity'

export type SignalStat = {
  key: SignalKey
  labelKo: string
  label: string
  score: number
  /** 1-based rank across every city on this axis. */
  rank: number
  median: number
  delta: number
}

/** Score, rank and median for each of a city's three headline signals. */
export function getSignalStats(citySlug: string): readonly SignalStat[] {
  return (snapshot.signalStats as Record<string, SignalStat[]>)[citySlug] ?? []
}
