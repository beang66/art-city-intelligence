import type { City } from '@/types/city'
import { CulturalSignalPanel } from '@/components/cultural/CulturalSignalPanel'
import { MarketSignalPanel } from '@/components/market/MarketSignalPanel'
import { CitySignalCard } from './CitySignalCard'

export function CitySummary({ city, onClose }: { city: City; onClose?: () => void }) {
  return (
    <>
      <div className="globe-city-head">
        <div><span className="status">{city.country.toUpperCase()}</span><h3>{city.name}</h3></div>
        <span className="globe-panel-state">DEMO DATA / INDICATIVE</span>
        {onClose ? <button type="button" className="globe-close" onClick={onClose} aria-label="도시 정보 닫기">×</button> : null}
      </div>
      <div className="signal-grid">
        <CitySignalCard index="01" title="CITY SIGNAL" entries={[
          { label: 'TYPE', value: city.type },
          { label: 'ART CITY INDEX', value: city.index.toFixed(1) },
          { label: 'CORE DNA', value: city.dna },
        ]} />
        <MarketSignalPanel signal={city.market} />
        <CulturalSignalPanel signal={city.cultural} />
        <CitySignalCard index="04" title="OPPORTUNITY SIGNAL" accent entries={[
          { label: 'INDUSTRY', value: city.industry.join(' · ') },
          { label: 'DIRECTION', value: city.opportunity },
        ]} />
      </div>
    </>
  )
}
