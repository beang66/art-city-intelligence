import type { SourceId } from './sources'

/**
 * Observed city data, transcribed from the Resonance Best Cities reports in src/report.
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

const observations: Record<string, CityObservation> = {
  london: {
    world: { rank: 2, pillars: { livability: 2, lovability: 3, prosperity: 2 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Europe', rank: 2, sourceId: 'resonance-europe-2026' },
  },
  'new-york': {
    world: { rank: 3, pillars: { livability: 1, lovability: 1, prosperity: 4 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Americas', rank: 1, sourceId: 'resonance-americas-2026' },
  },
  paris: {
    world: { rank: 4, pillars: { livability: 4, lovability: 4, prosperity: 3 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Europe', rank: 3, sourceId: 'resonance-europe-2026' },
  },
  tokyo: {
    world: { rank: 5, pillars: { livability: 7, lovability: 6, prosperity: 10 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 2, sourceId: 'resonance-asiapacific-2025' },
  },
  singapore: {
    world: { rank: 7, pillars: { livability: 5, lovability: 5, prosperity: 34 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 1, sourceId: 'resonance-asiapacific-2025' },
  },
  dubai: {
    world: { rank: 9, pillars: { livability: 10, lovability: 10, prosperity: 7 }, sourceId: 'resonance-world-2026' },
  },
  berlin: {
    world: { rank: 10, pillars: { livability: 6, lovability: 7, prosperity: 23 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Europe', rank: 4, sourceId: 'resonance-europe-2026' },
  },
  barcelona: {
    world: { rank: 11, pillars: { livability: 8, lovability: 20, prosperity: 8 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Europe', rank: 6, sourceId: 'resonance-europe-2026' },
  },
  seoul: {
    world: { rank: 14, pillars: { livability: 11, lovability: 25, prosperity: 14 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 3, sourceId: 'resonance-asiapacific-2025' },
  },
  amsterdam: {
    world: { rank: 15, pillars: { livability: 34, lovability: 15, prosperity: 12 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Europe', rank: 8, sourceId: 'resonance-europe-2026' },
  },
  shanghai: {
    world: { rank: 16, pillars: { livability: 40, lovability: 17, prosperity: 9 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 8, sourceId: 'resonance-asiapacific-2025' },
  },
  'hong-kong': {
    world: { rank: 19, pillars: { livability: 29, lovability: 27, prosperity: 22 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 4, sourceId: 'resonance-asiapacific-2025' },
  },
  melbourne: {
    world: { rank: 21, pillars: { livability: 22, lovability: 42, prosperity: 21 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Asia-Pacific', rank: 9, sourceId: 'resonance-asiapacific-2025' },
  },
  'mexico-city': {
    world: { rank: 30, pillars: { livability: 90, lovability: 11, prosperity: 77 }, sourceId: 'resonance-world-2026' },
  },
  chicago: {
    world: { rank: 35, pillars: { livability: 49, lovability: 38, prosperity: 28 }, sourceId: 'resonance-world-2026' },
    regional: { scope: 'Americas', rank: 3, sourceId: 'resonance-americas-2026' },
  },
  beijing: {
    regional: { scope: 'Asia-Pacific', rank: 5, sourceId: 'resonance-asiapacific-2025' },
    worldNote: '글로벌 표에서 순위 행을 확인하지 못해 권역 순위만 표기합니다.',
  },
  basel: {
    regional: { scope: 'Europe', rank: 46, sourceId: 'resonance-europe-2026' },
    worldNote: '광역 인구 100만 명 미만으로 글로벌 100위 표 대상이 아닙니다.',
  },
  venice: {
    regional: { scope: 'Europe', rank: 48, sourceId: 'resonance-europe-2026' },
    worldNote: '광역 인구 100만 명 미만으로 글로벌 100위 표 대상이 아닙니다.',
  },
}

export function getObservation(slug: string): CityObservation | undefined {
  return observations[slug]
}

/** Cities carrying at least one observed rank. */
export const observedCityCount = Object.keys(observations).length

/** Cities with a rank in the global Top 100 table. */
export const worldRankedCityCount = Object.values(observations).filter((o) => o.world).length
