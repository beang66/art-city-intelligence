'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { City } from '@/types/city'
import type { Indicator } from '@/types/indicator'

type CityComparison = { city: City; indicators: readonly Indicator[] }

export function ComparisonTable({ comparisons }: { comparisons: readonly CityComparison[] }) {
  const [mode, setMode] = useState<'scale' | 'density'>('scale')
  const scoreFor = (score: number) => mode === 'density' ? Math.round(score * 0.84 * 10) / 10 : score

  return (
    <>
      <div className="compare-controls">
        <div className="city-pills">{comparisons.map(({ city }, index) => <span className="city-pill" key={city.slug}>{index === 0 ? '●' : '○'} {city.name}</span>)}</div>
        <div className="segmented" aria-label="비교 단위">
          <button type="button" className={mode === 'scale' ? 'selected' : ''} onClick={() => setMode('scale')}>SCALE</button>
          <button type="button" className={mode === 'density' ? 'selected' : ''} onClick={() => setMode('density')}>DENSITY</button>
        </div>
      </div>
      <div className="surface comparison-table" role="table" aria-label="도시별 6개 차원 비교">
        <div className="dimension-row table-head" role="row"><span>DIMENSION</span>{comparisons.map(({ city }) => <span key={city.slug}>{city.code}</span>)}</div>
        {comparisons[0].indicators.map((indicator, indicatorIndex) => (
          <div className="dimension-row" role="row" key={indicator.key}>
            <span className="dimension-name"><strong>{indicator.label}</strong><small className="cell-note">{indicator.sourceCount} TRACEABLE SOURCES</small></span>
            {comparisons.map(({ city, indicators }, cityIndex) => {
              const current = indicators[indicatorIndex]
              const score = scoreFor(current.score)
              return (
                <div className={`bar-cell${cityIndex === 0 ? ' seoul' : ''}`} key={city.slug}>
                  <div className="bar-value"><span>{score.toFixed(1)}</span><span>±{current.uncertainty.toFixed(1)}</span></div>
                  <div className="bar-track"><i style={{ '--score': `${score}%` } as CSSProperties} /></div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
