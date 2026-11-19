import snapshot from '@/data/snapshot_v1.json'

/**
 * Model outputs exported by backend/scripts/export_snapshot.py from the Colab-trained model
 * (ml/models, ml/data). The what-if form calls FastAPI /api/opportunity/predict at runtime.
 */
export type FormatKey = 'popup' | 'temporary' | 'permanent'

export const FORMAT_ORDER: readonly FormatKey[] = ['popup', 'temporary', 'permanent']

export type FormatSpec = { label: string; why: string; weights: Record<string, number> }

export type RankedCity = { rank: number; city: string; country: string; region: string; fit: number; worldRank: number }

export type CityModel = {
  worldRank: number
  lovability: number
  predictedLovability: number
  opportunity: number
  opportunityRank: number
  cluster: string
  highlights: { category: string; rank: number }[]
  formats: Record<FormatKey, { fit: number; rank: number }>
  similar: { city: string; similarity: number }[]
}

export type ModelSummary = {
  model: string
  trainedAt: string
  cv: string
  cityCount: number
  r2: number
  spearman: number
  mae: number
  maeReduction: number
  scores: { model: string; MAE_log: number; R2: number; Spearman: number }[]
  formats: Record<FormatKey, FormatSpec>
  regions: string[]
}

const data = snapshot.opportunity as unknown as {
  summary: ModelSummary
  top: Record<FormatKey, RankedCity[]>
  cities: Record<string, CityModel | null>
}

export const modelSummary: ModelSummary = data.summary
export const formatTop: Record<FormatKey, RankedCity[]> = data.top

export function getCityModel(slug: string): CityModel | null {
  return data.cities[slug] ?? null
}

export const WEIGHT_LABELS: Record<string, string> = {
  opportunity: '기회 점수', lovability: '문화 매력', livability: '정주 여건', prosperity: '경제 활력',
  population: '인구 규모', buzz: '화제성 강점', culture: '문화 관객 강점', base: '생활·구매력 강점',
}
