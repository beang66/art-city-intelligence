import { findCity } from '@/features/city-intelligence/service'

export function getMarketSignal(citySlug: string) {
  return findCity(citySlug)?.market
}
