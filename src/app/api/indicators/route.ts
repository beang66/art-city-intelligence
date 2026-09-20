import { getCityIndicators } from '@/features/comparison/service'
import { parseCitySlug } from '@/features/city-intelligence/schemas'
import { fail, ok } from '@/lib/api/response'
import { getQueryValue } from '@/lib/validation/query'

export async function GET(request: Request) {
  const slug = parseCitySlug(getQueryValue(request, 'city'))
  if (!slug) return fail('A valid city query is required')
  const indicators = getCityIndicators(slug)
  return indicators.length ? ok(indicators) : fail('City not found', 404)
}
