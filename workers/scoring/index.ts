export function weightedScore(values: readonly number[], weights: readonly number[]) {
  const weightTotal = weights.reduce((sum, value) => sum + value, 0)
  if (!weightTotal || values.length !== weights.length) return 0
  return values.reduce((sum, value, index) => sum + value * weights[index], 0) / weightTotal
}
