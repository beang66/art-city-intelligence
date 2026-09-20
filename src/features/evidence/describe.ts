import { withSubject } from '@/lib/korean'
import type { CityObservation, PillarRanks } from './observed'

const PILLAR_KO: Record<keyof PillarRanks, string> = {
  livability: '정주 여건',
  lovability: '도시 선호도',
  prosperity: '경제 활력',
}

export const PILLAR_MEANING: Record<keyof PillarRanks, string> = {
  livability: '자연·건조 환경, 공원, 치안, 교통 등 사는 조건',
  lovability: '식음, 야간 활동, 문화 시설 등 머무르고 싶게 만드는 매력',
  prosperity: '고용, 기업 본사, 소득 등 경제적 기회',
}

export type RankReading = {
  headline: string
  detail: string
  best: { key: keyof PillarRanks; rank: number }
  worst: { key: keyof PillarRanks; rank: number }
  spread: number
}

/**
 * Reads the three published pillar ranks and states what their spread means.
 * Derived entirely from observed values — no authored per-city claim.
 */
export function readRank(observation: CityObservation | undefined): RankReading | null {
  if (!observation?.world) return null

  const { rank, pillars } = observation.world
  const entries = (Object.keys(pillars) as (keyof PillarRanks)[]).map((key) => ({ key, rank: pillars[key] }))
  const sorted = [...entries].sort((a, b) => a.rank - b.rank)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const spread = worst.rank - best.rank

  const headline = `글로벌 ${rank}위. 세 축 가운데 ${withSubject(PILLAR_KO[best.key])} ${best.rank}위로 가장 앞서고, ${withSubject(PILLAR_KO[worst.key])} ${worst.rank}위로 가장 뒤처집니다.`

  const detail =
    spread >= 20
      ? `축 사이 격차가 ${spread}단계로 크게 벌어져 있습니다. 종합 순위만 보면 놓치게 되는 불균형으로, ${withSubject(PILLAR_KO[worst.key])} 이 도시의 실질적 약점입니다.`
      : spread >= 10
        ? `축 사이 격차는 ${spread}단계입니다. 한쪽으로 치우쳐 있지만 종합 순위를 크게 흔들 정도는 아닙니다.`
        : `축 사이 격차가 ${spread}단계에 그쳐 세 방향이 고르게 발달한 편입니다.`

  return { headline, detail, best, worst, spread }
}

export function pillarLabel(key: keyof PillarRanks): string {
  return PILLAR_KO[key]
}
