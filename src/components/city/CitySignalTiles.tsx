'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import type { City } from '@/types/city'
import { getCityIndicators } from '@/features/comparison/service'
import { TREND_YEARS } from '@/features/city-intelligence/service'
import { SignatureWorkModal } from './SignatureWorkModal'

const TICKS = ['tl', 'tr', 'bl', 'br'] as const

function Ticks() {
  return <>{TICKS.map((corner) => <i className={`signal-tile-tick ${corner}`} key={corner} />)}</>
}

/** Sparkline in a 100x40 viewBox, padded so the stroke never clips at the edges. */
function buildSparkline(values: readonly number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((value, i) => {
      const x = 2 + (i / (values.length - 1)) * 96
      const y = 36 - ((value - min) / range) * 32
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

const RADAR_SIZE = 132
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = 44

/** Six axes, starting at the top and stepping 60° clockwise. */
function radarPoint(axis: number, ratio: number) {
  const angle = (Math.PI / 3) * axis - Math.PI / 2
  return {
    x: RADAR_CENTER + Math.cos(angle) * RADAR_RADIUS * ratio,
    y: RADAR_CENTER + Math.sin(angle) * RADAR_RADIUS * ratio,
  }
}

function hexagonPoints(ratio: number) {
  return Array.from({ length: 6 }, (_, axis) => {
    const { x, y } = radarPoint(axis, ratio)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

const AXIS_LABELS: Record<string, string> = {
  market: 'MKT',
  institution: 'INST',
  production: 'PROD',
  experiment: 'EXP',
  participation: 'PART',
  influence: 'INFL',
}

function InsightIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="8" y="14" width="5" height="18" fill="currentColor" opacity=".85" />
      <rect x="18" y="8" width="5" height="24" fill="currentColor" opacity=".6" />
      <rect x="28" y="18" width="5" height="14" fill="currentColor" opacity=".4" />
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <polyline points="4,14 12,22 18,10 24,26 30,16 36,20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IndexIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <polygon points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <polygon points="20,12 27,16 27,24 20,28 13,24 13,16" fill="currentColor" opacity=".45" />
    </svg>
  )
}

function SignatureIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="6" fill="currentColor" />
    </svg>
  )
}

function DefaultTile({ kicker, label, icon }: { kicker: string; label: string; icon: ReactNode }) {
  return (
    <>
      <span className="signal-tile-kicker">{kicker}</span>
      <div className="signal-tile-default">
        {icon}
        <b>{label}</b>
      </div>
    </>
  )
}

export function CitySignalTiles({ city }: { city: City | null }) {
  const [workOpen, setWorkOpen] = useState(false)

  if (!city) {
    return (
      <div className="signal-tile-grid">
        <article className="signal-tile"><Ticks /><DefaultTile kicker="01 / INSIGHT" label="도시를 선택하세요" icon={<InsightIcon />} /></article>
        <article className="signal-tile"><Ticks /><DefaultTile kicker="02 / TREND" label="도시를 선택하세요" icon={<TrendIcon />} /></article>
        <article className="signal-tile"><Ticks /><DefaultTile kicker="03 / 6-POINT INDEX" label="도시를 선택하세요" icon={<IndexIcon />} /></article>
        <article className="signal-tile"><Ticks /><DefaultTile kicker="04 / SIGNATURE WORK" label="도시를 선택하세요" icon={<SignatureIcon />} /></article>
      </div>
    )
  }

  const indicators = getCityIndicators(city.slug)
  const trendMin = Math.min(...city.trend)
  const trendMax = Math.max(...city.trend)
  const delta = city.trend[city.trend.length - 1] - city.trend[0]
  const work = city.signatureWork

  return (
    <div className="signal-tile-grid">
      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">01 / INSIGHT</span>
        <div className="signal-tile-body">
          <p className="insight-city">{city.nameKo} <span>{city.name}</span></p>
          <strong className="signal-tile-heading">{city.typeKo}</strong>
          <p className="signal-tile-copy">{city.insightKo}</p>
        </div>
      </article>

      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">02 / TREND</span>
        <div className="signal-tile-body trend-body">
          <div className="trend-axis-title">
            <span>ART CITY INDEX</span>
            <b className={delta >= 0 ? 'is-up' : 'is-down'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</b>
          </div>
          <div className="trend-plot">
            <div className="trend-y-axis" aria-hidden="true">
              <span>{trendMax.toFixed(1)}</span>
              <span>{trendMin.toFixed(1)}</span>
            </div>
            <svg className="trend-spark" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${city.name} 아트 시티 인덱스 추이 ${TREND_YEARS[0]}년부터 ${TREND_YEARS[TREND_YEARS.length - 1]}년까지`}>
              <polyline points={buildSparkline(city.trend)} />
            </svg>
          </div>
          <div className="trend-x-axis" aria-hidden="true">
            {TREND_YEARS.map((year) => <span key={year}>{`'${String(year).slice(2)}`}</span>)}
          </div>
          <p className="trend-axis-note">가로축 5년 단위 · 세로축 인덱스(0–100)</p>
        </div>
      </article>

      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">03 / 6-POINT INDEX</span>
        <div className="signal-tile-body signal-tile-radar">
          <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} role="img" aria-label={indicators.map((i) => `${i.label} ${i.score}`).join(', ')}>
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <polygon className="radar-grid" points={hexagonPoints(ratio)} key={ratio} />
            ))}
            {indicators.map((_, axis) => {
              const { x, y } = radarPoint(axis, 1)
              return <line className="radar-grid" x1={RADAR_CENTER} y1={RADAR_CENTER} x2={x} y2={y} key={axis} />
            })}
            <polygon
              className="radar-shape-fill"
              points={indicators.map((indicator, axis) => {
                const { x, y } = radarPoint(axis, Math.max(0, Math.min(1, indicator.score / 100)))
                return `${x.toFixed(1)},${y.toFixed(1)}`
              }).join(' ')}
            />
            {indicators.map((indicator, axis) => {
              const { x, y } = radarPoint(axis, 1.32)
              return (
                <text className="radar-axis-label" x={x} y={y} key={indicator.key} textAnchor="middle" dominantBaseline="middle">
                  {AXIS_LABELS[indicator.key] ?? indicator.label.slice(0, 4).toUpperCase()}
                </text>
              )
            })}
          </svg>
          <ul className="radar-legend">
            {indicators.map((indicator) => (
              <li key={indicator.key}><span>{AXIS_LABELS[indicator.key]}</span><b>{indicator.score.toFixed(1)}</b></li>
            ))}
          </ul>
        </div>
      </article>

      <article className="signal-tile signal-tile-work">
        <button type="button" className="work-open" onClick={() => setWorkOpen(true)} aria-haspopup="dialog" aria-label={`${work.title} 상세 보기`} />
        <Image className="work-image" src={work.image} alt={`${work.title} — ${work.artist}`} fill sizes="(max-width: 760px) 100vw, 25vw" />
        <div className="work-scrim" />
        <Ticks />
        <span className="signal-tile-kicker">04 / SIGNATURE WORK</span>
        <div className="signal-tile-body work-body">
          <strong className="signal-tile-heading">{work.title}</strong>
          <p className="work-original">{work.titleOriginal}, {work.year}</p>
          <p className="work-artist">{work.artist} <span>{work.artistOriginal}</span></p>
          <div className="work-price">
            <span>{work.priceUsd ?? work.collection}</span>
            <span>{work.priceKrw ?? work.collectionNote}</span>
          </div>
          <span className="work-more">자세히 보기 →</span>
        </div>
      </article>

      {workOpen ? <SignatureWorkModal city={city} onClose={() => setWorkOpen(false)} /> : null}
    </div>
  )
}
