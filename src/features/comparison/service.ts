import type { Indicator, IndicatorKey } from '@/types/indicator'
import type { SourceId } from '@/features/evidence/sources'
import { findCity, cities } from '@/features/city-intelligence/service'

/**
 * Six dimensions adapted from the EU Cultural and Creative Cities Monitor (JRC, 2023),
 * which organises a city's cultural performance under Cultural Vibrancy, Creative Economy
 * and Enabling Environment. Each dimension below states which C3 sub-dimension it mirrors
 * and which study grounds its definition.
 *
 * The scores themselves are ILLUSTRATIVE: they are derived from each city's demo index by
 * a fixed weight, not measured from the underlying indicators. The published data on this
 * site is the Resonance ranking in `features/evidence/observed`.
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

export const DIMENSIONS: readonly DimensionSpec[] = [
  { key: 'market', color: '#ff5438', label: 'Market', labelKo: '시장', c3Subindex: 'Creative Economy', c3Dimension: 'Creative & Knowledge-based Jobs', sourceId: 'beckert-rossel-2013', weight: 1, question: '이 도시의 작품은 어디서, 어떤 가격에 거래됩니까?', about: '갤러리·경매·페어가 만드는 거래의 두께를 봅니다. 가격은 작품의 내재 가치가 아니라 갤러리와 큐레이터, 비평가가 부여한 평판에서 형성되므로, 이 차원은 도시가 그 평판 체계를 얼마나 갖췄는지를 가리킵니다.' },
  { key: 'institution', color: '#ff8360', label: 'Institution', labelKo: '기관', c3Subindex: 'Cultural Vibrancy', c3Dimension: 'Cultural Venues & Facilities', sourceId: 'jrc-c3-2023', weight: 0.96, question: '이 도시의 기관은 무엇을 기준으로 삼고 있습니까?', about: '미술관·전시장·공연장 같은 문화 시설의 밀도를 봅니다. 기관은 무엇을 수집하고 전시할지 정하면서 그 도시의 기준선을 만들고, 그 기준이 시장과 제작 양쪽에 영향을 미칩니다.' },
  { key: 'production', color: '#ffab8c', label: 'Production', labelKo: '제작', c3Subindex: 'Creative Economy', c3Dimension: 'New Jobs in Creative Sectors', sourceId: 'becker-1982', weight: 0.91, question: '새로운 작업이 실제로 만들어질 기반이 있습니까?', about: '작업실·제작 인력·신생 창작 기업의 규모를 봅니다. 예술은 개인의 재능이 아니라 재료를 대고 설치하고 유통하는 협업 네트워크의 산물이므로, 이 기반이 얇으면 전시는 열려도 작업은 다른 도시에서 만들어집니다.' },
  { key: 'experiment', color: '#7d92ab', label: 'Experiment', labelKo: '실험', c3Subindex: 'Creative Economy', c3Dimension: 'Intellectual Property & Innovation', sourceId: 'jrc-c3-2023', weight: 1.04, question: '새로운 형식이 시도되고 받아들여집니까?', about: '지식재산과 연구개발 활동의 강도를 봅니다. 매체와 기술이 바뀔 때 그것을 작업에 끌어들일 수 있는 여력이 있는지, 실패한 시도를 감당할 제도가 있는지를 가늠하는 축입니다.' },
  { key: 'participation', color: '#5a7291', label: 'Participation', labelKo: '참여', c3Subindex: 'Cultural Vibrancy', c3Dimension: 'Cultural Participation & Attractiveness', sourceId: 'oecd-culture-local', weight: 0.82, question: '시민이 예술에 실제로 접근하고 있습니까?', about: '관람객 수와 문화 시설 만족도를 봅니다. 기관의 규모가 크다고 참여가 넓은 것은 아니어서, 이 차원은 도시가 예술을 소수의 자산으로 두는지 일상의 접점으로 두는지를 가릅니다.' },
  { key: 'influence', color: '#3f5570', label: 'Influence', labelKo: '영향력', c3Subindex: 'Enabling Environment', c3Dimension: 'Local & International Connections', sourceId: 'braden-teekens-2019', weight: 0.98, question: '이 도시는 다른 도시와 어떻게 연결되어 있습니까?', about: '항공·철도 접근성과 국제 연결의 폭을 봅니다. 작가의 지위는 홀로 오르지 않고 어떤 연결망에 속하느냐에 따라 함께 올라가므로, 연결의 구조가 곧 영향력의 구조가 됩니다.' },
]

/**
 * The C3 statistical audit finds weight perturbation to be the dominant source of
 * uncertainty in a composite index of this shape, so the band shown next to each score is
 * the spread produced by moving that dimension's weight ±10% — not a measurement error.
 */
const WEIGHT_PERTURBATION = 0.1

function scoreFor(index: number, weight: number) {
  return Math.min(99, Math.round(index * weight * 10) / 10)
}

export function getCityIndicators(citySlug: string): readonly Indicator[] {
  const city = findCity(citySlug)
  if (!city) return []

  return DIMENSIONS.map((dimension) => {
    const score = scoreFor(city.index, dimension.weight)
    const high = scoreFor(city.index, dimension.weight * (1 + WEIGHT_PERTURBATION))
    const low = scoreFor(city.index, dimension.weight * (1 - WEIGHT_PERTURBATION))
    return {
      key: dimension.key,
      label: dimension.label,
      labelKo: dimension.labelKo,
      score,
      sensitivity: Math.round(((high - low) / 2) * 10) / 10,
      c3Subindex: dimension.c3Subindex,
      c3Dimension: dimension.c3Dimension,
      sourceId: dimension.sourceId,
      color: dimension.color,
    }
  })
}

/** Median score per dimension across every city, for cohort comparison. */
export function getCohortMedians(): Record<IndicatorKey, number> {
  const result = {} as Record<IndicatorKey, number>
  for (const dimension of DIMENSIONS) {
    const values = cities.map((city) => scoreFor(city.index, dimension.weight)).sort((a, b) => a - b)
    const mid = Math.floor(values.length / 2)
    const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
    result[dimension.key] = Math.round(median * 10) / 10
  }
  return result
}

/** Median of the illustrative Art City Index across every city. */
export function getIndexMedian(): number {
  const values = cities.map((city) => city.index).sort((a, b) => a - b)
  const mid = Math.floor(values.length / 2)
  const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
  return Math.round(median * 10) / 10
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

const SIGNAL_LABELS: Record<SignalKey, { ko: string; en: string }> = {
  market: { ko: '시장', en: 'Market' },
  cultural: { ko: '문화', en: 'Culture' },
  opportunity: { ko: '기회', en: 'Opportunity' },
}

/** Score, rank and median for each of a city's three headline signals. */
export function getSignalStats(citySlug: string): readonly SignalStat[] {
  const city = findCity(citySlug)
  if (!city) return []

  return (Object.keys(SIGNAL_LABELS) as SignalKey[]).map((key) => {
    const score = city.signalScores[key]
    const all = cities.map((item) => item.signalScores[key])
    const sorted = [...all].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    const rank = [...all].sort((a, b) => b - a).indexOf(score) + 1
    return {
      key,
      labelKo: SIGNAL_LABELS[key].ko,
      label: SIGNAL_LABELS[key].en,
      score,
      rank,
      median: Math.round(median * 10) / 10,
      delta: Math.round((score - median) * 10) / 10,
    }
  })
}
