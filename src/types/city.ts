import type { CulturalSignal } from './cultural'
import type { MarketSignal } from './market'

export type CitySignalScores = {
  market: number
  cultural: number
  opportunity: number
}

export type City = {
  slug: string
  code: string
  name: string
  country: string
  latitude: number
  longitude: number
  index: number
  type: string
  dna: string
  signalScores: CitySignalScores
  market: MarketSignal
  cultural: CulturalSignal
  industry: string[]
  opportunity: string
}
