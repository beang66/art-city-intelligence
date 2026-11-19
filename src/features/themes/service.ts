import snapshot from '@/data/snapshot_v1.json'
import type { IndicatorKey } from '@/types/indicator'
import type { FormatKey } from '@/features/opportunity/service'

/** Written by backend/app/services/recommend.py via export_snapshot.py; GET /api/opportunity/themes?city= serves the same. */
export type ThemePick = {
  id: string
  labelKo: string
  label: string
  brandsKo: string[]
  /** Standardised similarity across the 18 cities: 0 is the average city. */
  z: number
  cityRank: number
  dimension: IndicatorKey
  matches: string[]
}

export type CityThemes = {
  city: string
  themes: ThemePick[]
  format: { key: FormatKey; rank: number; fit: number } | null
}

export type ThemeSummary = { model: string; themeCount: number; cityCount: number; cities: Record<string, CityThemes> }

export const themeSummary = snapshot.themes as ThemeSummary
