'use client'

import { useRef, useState, useMemo } from 'react'
import { cities } from '@/features/city-intelligence/service'
import type { City } from '@/types/city'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { GlobeInteraction, type GlobeController } from './GlobeInteraction'
import { GlobeMarker } from './GlobeMarker'
import { GlobeTooltip } from './GlobeTooltip'

// Cities sorted alphabetically for the dropdown
const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name))

export function ArtGlobe({ onSelectionChange }: { onSelectionChange?: (city: City) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<GlobeController>(null)
  const [selectedCity, setSelectedCity] = useState<City>(cities[0])
  const [tooltip, setTooltip] = useState<{ city: City | null; x: number; y: number }>({ city: null, x: 0, y: 0 })
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectCity = (city: City) => {
    setSelectedCity(city)
    setTooltip((current) => ({ ...current, city: null }))
    interactionRef.current?.focusCity(city)
    setQuery('')
    setDropdownOpen(false)
    onSelectionChange?.(city)
  }

  const showTooltip = (city: City, marker: HTMLButtonElement) => {
    const stage = stageRef.current
    if (!stage) return
    const stageRect = stage.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    setTooltip({ city, x: markerRect.left - stageRect.left + 14, y: markerRect.top - stageRect.top - 12 })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q.length > 0
      ? sortedCities.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q),
        )
      : sortedCities
    return base
  }, [query])

  return (
    <div className="surface hero-panel globe-panel">
      <div className="panel-head"><span>PEER COHORT / CREATIVE GLOBAL CITIES</span><span>INTERACTIVE / {cities.length} CITIES</span></div>
      <div className="globe-stage" ref={stageRef} aria-label={`드래그하여 회전할 수 있는 ${cities.length}개 예술 도시 지구본`}>
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

        {/* City search dropdown */}
        <div className="globe-city-search" role="search" aria-label="도시 검색">
          <div className="globe-search-input-wrap">
            <svg className="globe-search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              id="globe-city-search-input"
              className="globe-search-input"
              type="search"
              autoComplete="off"
              placeholder="Search city…"
              value={query}
              aria-label="도시 이름 검색"
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 160)}
              onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true) }}
            />
            {selectedCity && (
              <span className="globe-search-badge">{selectedCity.code}</span>
            )}
          </div>
          {dropdownOpen && (
            <ul className="globe-search-dropdown" role="listbox" aria-label="도시 목록">
              {filtered.length === 0 ? (
                <li className="globe-search-empty">No cities found</li>
              ) : filtered.map((city) => (
                <li
                  key={city.slug}
                  role="option"
                  aria-selected={selectedCity.slug === city.slug}
                  className={`globe-search-option${selectedCity.slug === city.slug ? ' is-selected' : ''}`}
                  onMouseDown={() => selectCity(city)}
                >
                  <span className="globe-search-option-code">{city.code}</span>
                  <span className="globe-search-option-name">{city.name}</span>
                  <span className="globe-search-option-country">{city.country}</span>
                  <span className="globe-search-option-index">{city.index.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <GlobeInteraction ref={interactionRef} canvasRef={canvasRef} stageRef={stageRef} cities={cities} />
      </div>
      <div className="panel-foot mono"><span><i className="live-dot" />NETWORK / {cities.length} CITIES · 27 CONNECTIONS</span><span>COHORT / GLOBAL</span></div>
    </div>
  )
}
