import { findCity } from '@/features/city-intelligence/service'

export function getRecommendation(citySlug: string) {
  const city = findCity(citySlug)
  if (!city) return undefined
  return { industries: city.industry, direction: city.opportunity, evidenceState: 'proposed' as const }
}
