export function normalizeScore(value: number, min: number, max: number) {
  if (max === min) return 0
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}
