import { findCity } from '@/features/city-intelligence/service'

export function getRepresentativeArtists(citySlug: string): readonly string[] {
  return findCity(citySlug)?.market.artists ?? []
}
