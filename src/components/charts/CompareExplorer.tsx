'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { City } from '@/types/city'
import type { Indicator, IndicatorKey } from '@/types/indicator'
import { DIMENSIONS } from '@/features/comparison/service'
import { findSource } from '@/features/evidence/sources'
import { withTopic } from '@/lib/korean'

type CityComparison = { city: City; indicators: readonly Indicator[] }

export function CompareExplorer({
  comparisons,
  medians,
  cityCount,
}: {
  comparisons: readonly CityComparison[]
  medians: Record<IndicatorKey, number>
  cityCount: number
}) {
  const [active, setActive] = useState(0)
  const dimension = DIMENSIONS[active]
  const source = findSource(dimension.sourceId)
  const median = medians[dimension.key]

  const rows = comparisons
    .map(({ city, indicators }) => ({ city, indicator: indicators[active] }))
    .sort((a, b) => b.indicator.score - a.indicator.score)

  const subject = comparisons[0]
  const subjectScore = subject.indicators[active].score
  const subjectPlace = rows.findIndex((row) => row.city.slug === subject.city.slug) + 1
  const gap = Math.round((subjectScore - median) * 10) / 10

  return (
    <div className="explorer">
      <aside className="explorer-nav">
        <p className="explorer-nav-label">NAVIGATION</p>
        <ul>
          {DIMENSIONS.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={index === active ? 'is-active' : ''}
                onClick={() => setActive(index)}
                aria-current={index === active ? 'true' : undefined}
              >
                {index === active ? <i aria-hidden="true">•</i> : null}
                {item.labelKo} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="explorer-body">
        <div className="explorer-head">
          <span className="explorer-index">{String(active + 1).padStart(2, '0')}</span>
          <h3>{dimension.labelKo} <em>{dimension.label}</em></h3>
        </div>

        <div className="explorer-cols">
          <div className="explorer-scope">
            <p className="explorer-scope-label">SCOPE OF WORK:</p>
            <ul>
              <li>{dimension.c3Subindex}</li>
              <li>{dimension.c3Dimension}</li>
              <li>가중치 {dimension.weight.toFixed(2)}</li>
              <li>{source ? `${source.author} ${source.year}` : '—'}</li>
            </ul>
          </div>

          <div className="explorer-text">
            <p className="explorer-question">{dimension.question}</p>
            <span className="explorer-rule" aria-hidden="true" />
            <p>{dimension.about}</p>
            <p>
              비교군 {comparisons.length}개 도시 가운데 {withTopic(subject.city.nameKo)} 이 차원에서 {subjectPlace}위입니다.
              점수는 {subjectScore.toFixed(1)}로 전체 {cityCount}개 도시 중앙값 {median.toFixed(1)}보다 {Math.abs(gap).toFixed(1)} {gap >= 0 ? '높습니다' : '낮습니다'}.
            </p>
          </div>
        </div>

        <div className="explorer-bars">
          {rows.map(({ city, indicator }) => (
            <div className="explorer-bar" key={city.slug}>
              <span className="explorer-bar-name">{city.nameKo} <em>{city.name}</em></span>
              <span className="explorer-bar-track">
                <i style={{ '--score': `${indicator.score}%`, background: dimension.color } as CSSProperties} />
                <u style={{ '--median': `${median}%` } as CSSProperties} aria-hidden="true" />
              </span>
              <span className="explorer-bar-value">{indicator.score.toFixed(1)}</span>
            </div>
          ))}
          <p className="explorer-bars-note">세로선은 전체 {cityCount}개 도시 중앙값 {median.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}
