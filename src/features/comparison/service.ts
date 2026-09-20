import type { Indicator } from '@/types/indicator'
import { findCity } from '@/features/city-intelligence/service'

const weights = [1, 0.96, 0.91, 1.04, 0.82, 0.98] as const
const keys = ['market', 'institution', 'production', 'experiment', 'participation', 'influence'] as const

export function getCityIndicators(citySlug: string): readonly Indicator[] {
  const city = findCity(citySlug)
  if (!city) return []

  return keys.map((key, index) => ({
    key,
    label: key[0].toUpperCase() + key.slice(1),
    score: Math.min(99, Math.round(city.index * weights[index] * 10) / 10),
    uncertainty: 2.4 + index * 0.7,
    sourceCount: 12 + index * 5,
  }))
}
