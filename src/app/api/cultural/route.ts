import { parseCitySlug } from '@/features/city-intelligence/schemas'
import { getCulturalSignal } from '@/features/cultural-intelligence/service'
import { fail, ok } from '@/lib/api/response'
import { getQueryValue } from '@/lib/validation/query'

export async function GET(request: Request) {
  const slug = parseCitySlug(getQueryValue(request, 'city'))
  if (!slug) return fail('A valid city query is required')
  const signal = getCulturalSignal(slug)
  return signal ? ok(signal) : fail('City not found', 404)
}
