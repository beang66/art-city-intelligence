import type { CSSProperties } from 'react'

export function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="globe-mini-bar">
      <label>{label} <b>{score}</b></label>
      <i style={{ '--value': `${score}%` } as CSSProperties} />
    </div>
  )
}
