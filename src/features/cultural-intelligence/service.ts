import { findCity } from '@/features/city-intelligence/service'

export function getCulturalSignal(citySlug: string) {
  return findCity(citySlug)?.cultural
}
