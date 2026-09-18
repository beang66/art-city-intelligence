export function validateRange(value: number, min = 0, max = 100) {
  return Number.isFinite(value) && value >= min && value <= max
}
