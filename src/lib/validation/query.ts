export function getQueryValue(request: Request, key: string): string | null {
  return new URL(request.url).searchParams.get(key)
}
