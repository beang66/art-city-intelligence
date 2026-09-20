import type { City } from '@/types/city'
import { DataBadge } from '@/components/evidence/DataBadge'

export function CityRanking({ city, rank, total }: { city: City; rank: number; total: number }) {
  return (
    <aside className="surface city-ranking">
      <div className="city-ranking-head">
        <span className="eyebrow">COHORT POSITION</span>
        <DataBadge provenance="illustrative" />
      </div>
      <strong>#{rank}</strong>
      <p>of {total} demo cities</p>
      <div className="bar-track"><i style={{ width: `${city.index}%` }} /></div>
      <small>ART CITY INDEX / {city.index.toFixed(1)}</small>
    </aside>
  )
}
