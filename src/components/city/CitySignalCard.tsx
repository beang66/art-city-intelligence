import type { ReactNode } from 'react'

export type SignalEntry = { label: string; value: ReactNode }

export function CitySignalCard({ index, title, entries, accent = false }: { index: string; title: string; entries: readonly SignalEntry[]; accent?: boolean }) {
  return (
    <article className={`signal-card${accent ? ' signal-card-accent' : ''}`}>
      <span>{index} / {title}</span>
      <dl>{entries.map((entry) => <div key={entry.label}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl>
    </article>
  )
}
