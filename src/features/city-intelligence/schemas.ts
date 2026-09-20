const CITY_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parseCitySlug(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const slug = value.trim().toLowerCase()
  return CITY_SLUG.test(slug) ? slug : null
}
