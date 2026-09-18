import { listCities, findCity } from '@/features/city-intelligence/service'
import { parseCitySlug } from '@/features/city-intelligence/schemas'
import { fail, ok } from '@/lib/api/response'
import { getQueryValue } from '@/lib/validation/query'

export async function GET(request: Request) {
  const rawSlug = getQueryValue(request, 'slug')
  if (!rawSlug) return ok(listCities())
  const slug = parseCitySlug(rawSlug)
  if (!slug) return fail('Invalid city slug')
  const city = findCity(slug)
  return city ? ok(city) : fail('City not found', 404)
}
