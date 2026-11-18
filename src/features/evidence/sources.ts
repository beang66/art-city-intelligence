/**
 * Bibliographic registry for the city-index methodology and observed rankings.
 *
 * 도시 비교 지표는 `observed`(보고서의 관측 순위)와 `illustrative`(UI 시연용 합성 지표)를 구분한다.
 * 작품 제작 연도 등 그 밖의 서술형 숫자까지 모두 이 레지스트리로 검증한다는 뜻은 아니다.
 * 화면에서는 관측 순위와 시연용 점수를 같은 검증 수준으로 제시하지 않아야 한다.
 */

import snapshot from '@/data/snapshot_v1.json'

export type SourceId =
  | 'resonance-world-2026'
  | 'resonance-europe-2026'
  | 'resonance-asiapacific-2025'
  | 'resonance-americas-2026'
  | 'jrc-c3-2023'
  | 'jrc-c3-2017'
  | 'oecd-jrc-2008'
  | 'beckert-rossel-2013'
  | 'braden-teekens-2019'
  | 'becker-1982'
  | 'unctad-2024'
  | 'unesco-2019'
  | 'oecd-culture-local'

export type SourceKind = 'index' | 'framework' | 'research' | 'policy'

export type Source = {
  id: SourceId
  title: string
  author: string
  publisher: string
  year: number
  kind: SourceKind
  /** What this site actually uses it for. */
  use: string
  /** Filename under src/report. */
  file: string
}

/** Registry rows live in backend/data/sources_v1.json. */
export const sources = snapshot.sources as readonly Source[]

export function findSource(id: SourceId): Source | undefined {
  return sources.find((source) => source.id === id)
}

export function citation(id: SourceId): string {
  const source = findSource(id)
  if (!source) return ''
  return `${source.author} (${source.year}), ${source.title}, ${source.publisher}`
}

export const sourceCount = sources.length
