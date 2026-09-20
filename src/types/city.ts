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
  insightKo: string
  signalScores: CitySignalScores
  market: MarketSignal
  cultural: CulturalSignal
  industry: string[]
  opportunity: string
  trend: number[]
  signatureWork: SignatureWork
}
