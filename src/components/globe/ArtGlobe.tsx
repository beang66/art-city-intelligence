'use client'

import { useRef, useState } from 'react'
import { cities } from '@/features/city-intelligence/service'
import type { City } from '@/types/city'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { CitySummary } from '@/components/city/CitySummary'
import { GlobeInteraction, type GlobeController } from './GlobeInteraction'
import { GlobeMarker } from './GlobeMarker'
import { GlobeTooltip } from './GlobeTooltip'

export function ArtGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<GlobeController>(null)
  const [selectedCity, setSelectedCity] = useState<City>(cities[0])
  const [panelOpen, setPanelOpen] = useState(false)
  const [tooltip, setTooltip] = useState<{ city: City | null; x: number; y: number }>({ city: null, x: 0, y: 0 })

  const selectCity = (city: City) => {
    setSelectedCity(city)
    setPanelOpen(true)
    setTooltip((current) => ({ ...current, city: null }))
    interactionRef.current?.focusCity(city)
  }

  const showTooltip = (city: City, marker: HTMLButtonElement) => {
    const stage = stageRef.current
    if (!stage) return
    const stageRect = stage.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    setTooltip({ city, x: markerRect.left - stageRect.left + 14, y: markerRect.top - stageRect.top - 12 })
  }

  return (
    <div className="surface hero-panel globe-panel">
      <div className="panel-head"><span>PEER COHORT / CREATIVE GLOBAL CITIES</span><span>INTERACTIVE / 8 CITIES</span></div>
      <div className="globe-stage" ref={stageRef} aria-label="드래그하여 회전할 수 있는 8개 예술 도시 지구본">
        <canvas id="art-city-globe" ref={canvasRef} aria-hidden="true" />
        <div className="globe-marker-layer">
          {cities.map((city) => (
            <GlobeMarker
              city={city}
              selected={selectedCity.slug === city.slug}
              onSelect={() => selectCity(city)}
              onEnter={(marker) => showTooltip(city, marker)}
              onLeave={() => setTooltip((current) => ({ ...current, city: null }))}
              key={city.slug}
            />
          ))}
        </div>
        <GlobeTooltip {...tooltip} />
        <div className="globe-guide"><span>DRAG TO ROTATE</span><span>CLICK A CITY TO READ SIGNALS</span></div>
        <div className="globe-summary globe-summary-left" aria-label="선택 도시 요약">
          <span>SELECTED CITY</span><strong>{selectedCity.name}</strong>
          <dl><div><dt>ART CITY INDEX</dt><dd>{selectedCity.index.toFixed(1)}</dd></div><div><dt>PEER TYPE</dt><dd>{selectedCity.type}</dd></div><div><dt>MODEL STATE</dt><dd>STABLE</dd></div></dl>
        </div>
        <div className="globe-summary globe-summary-right" aria-label="선택 도시 신호 강도">
          <span>SIGNAL PROFILE</span>
          <ScoreBar label="MARKET" score={selectedCity.signalScores.market} />
          <ScoreBar label="CULTURE" score={selectedCity.signalScores.cultural} />
          <ScoreBar label="OPPORTUNITY" score={selectedCity.signalScores.opportunity} />
        </div>
        <div className="globe-city-rail" aria-label="도시 바로 선택">
          {cities.map((city) => <button type="button" className={selectedCity.slug === city.slug ? 'selected' : ''} onClick={() => selectCity(city)} aria-label={`${city.name} 선택`} key={city.slug}>{city.code}</button>)}
        </div>
        <aside className={`globe-city-panel${panelOpen ? ' is-open' : ''}`} aria-hidden={!panelOpen} aria-label="선택 도시 정보">
          <CitySummary city={selectedCity} onClose={() => setPanelOpen(false)} />
        </aside>
        <GlobeInteraction ref={interactionRef} canvasRef={canvasRef} stageRef={stageRef} cities={cities} />
      </div>
      <div className="panel-foot mono"><span><i className="live-dot" />POINT MAP / 2,515 NODES</span><span>COHORT / 8 CITIES</span></div>
    </div>
  )
}
