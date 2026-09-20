import type { City } from '@/types/city'

export function CityRanking({ city, rank, total }: { city: City; rank: number; total: number }) {
  return (
    <aside className="surface city-ranking">
      <span className="eyebrow">COHORT POSITION</span>
      <strong>#{rank}</strong>
      <p>of {total} peer cities</p>
      <div className="bar-track"><i style={{ width: `${city.index}%` }} /></div>
      <small>ART CITY INDEX / {city.index.toFixed(1)}</small>
    </aside>
  )
}
