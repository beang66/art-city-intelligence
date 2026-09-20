import type { StaticImageData } from 'next/image'
import type { CulturalSignal } from './cultural'
import type { MarketSignal } from './market'

export type CitySignalScores = {
  market: number
  cultural: number
  opportunity: number
}

export type SignatureWork = {
  title: string
  titleOriginal: string
  artist: string
  artistOriginal: string
  year: number
  note: string
  /** Auction record, for works that have come to market. */
  priceUsd?: string
  priceKrw?: string
  auction?: string
  /** Museum holding, for works that never have. */
  collection?: string
  collectionNote?: string
  commission?: string
  meaning: string
  intent: string
  cityLink: string
  image: StaticImageData
}

export type City = {
  slug: string
  code: string
  name: string
  nameKo: string
  country: string
  latitude: number
  longitude: number
  index: number
  type: string
  typeKo: string
  dna: string
  dnaKo: string
  insightKo: string
  /** 위치와 도시 조건이 만드는 특징. */
  location: string
  /** 문화 유산 · 변화 수용성 · 미래 전망 */
  heritage: string
  adaptability: string
  outlook: string
  /** 추세가 이 모양인 이유. */
  trendNote: string
  signalScores: CitySignalScores
  market: MarketSignal
  cultural: CulturalSignal
  industry: string[]
  industryKo: string[]
  opportunity: string
  opportunityKo: string
  /** 이 방향을 제안하는 근거. */
  opportunityWhy: string
  trend: number[]
  signatureWork: SignatureWork
}
