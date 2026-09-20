/** True when a Korean syllable ends in a final consonant (받침). */
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().slice(-1)
  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return false
  return (code - 0xac00) % 28 !== 0
}

/** Appends the correct topic particle: 은 after a final consonant, 는 otherwise. */
export function withTopic(word: string): string {
  return `${word}${hasFinalConsonant(word) ? '은' : '는'}`
}

/** Appends the correct subject particle: 이 after a final consonant, 가 otherwise. */
export function withSubject(word: string): string {
  return `${word}${hasFinalConsonant(word) ? '이' : '가'}`
}
