import { cache } from 'react'
import { findCity } from '@/features/city-intelligence/service'

export const getCachedCity = cache(async (slug: string) => findCity(slug))
