import type { SourceId } from '@/features/evidence/sources'

export type IndicatorKey =
  | 'market'
  | 'institution'
  | 'production'
  | 'experiment'
  | 'participation'
  | 'influence'

export type Indicator = {
  key: IndicatorKey
  label: string
  labelKo: string
  score: number
  /** Half-spread produced by perturbing this dimension's weight ±10%. */
  sensitivity: number
  c3Subindex: string
  c3Dimension: string
  sourceId: SourceId
  color: string
}
