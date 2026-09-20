import type { City } from '@/types/city'
import { CulturalSignalPanel } from '@/components/cultural/CulturalSignalPanel'
import { MarketSignalPanel } from '@/components/market/MarketSignalPanel'
import { CitySignalCard } from './CitySignalCard'

export function CitySummary({ city }: { city: City }) {
  return (
    <>
      <div className="globe-city-head">
        <div><span className="status">{city.country.toUpperCase()}</span><h3>{city.nameKo} <em>{city.name}</em></h3></div>
        <span className="globe-panel-state">ILLUSTRATIVE</span>
      </div>
      <p className="city-location">{city.location}</p>
      <div className="signal-grid">
        <CitySignalCard index="01" title="도시 신호" entries={[
          { label: '유형', value: city.typeKo },
          { label: '아트 시티 인덱스', value: city.index.toFixed(1) },
          { label: '핵심 DNA', value: city.dnaKo },
        ]} />
        <MarketSignalPanel signal={city.market} />
        <CulturalSignalPanel signal={city.cultural} />
        <CitySignalCard index="04" title="기회 신호" accent entries={[
          { label: '연결 산업', value: city.industryKo.join(' · ') },
          { label: '실행 방향', value: city.opportunityKo },
          { label: '제안 근거', value: city.opportunityWhy },
        ]} />
      </div>
    </>
  )
}
