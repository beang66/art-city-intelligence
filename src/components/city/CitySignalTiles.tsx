'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import type { City } from '@/types/city'
import { getCityIndicators } from '@/features/comparison/service'
import { AXIS_LABELS, CityRadar } from '@/components/charts/CityRadar'
import { CityTrend } from '@/components/charts/CityTrend'
import { SignatureWorkModal } from './SignatureWorkModal'
import { DataBadge } from '@/components/evidence/DataBadge'

const TICKS = ['tl', 'tr', 'bl', 'br'] as const

function Ticks() {
  return <>{TICKS.map((corner) => <i className={`signal-tile-tick ${corner}`} key={corner} />)}</>
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
  const work = city.signatureWork

  return (
    <div className="signal-tile-grid">
      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">01 / INSIGHT<DataBadge provenance="illustrative" /></span>
        <div className="signal-tile-body">
          <p className="insight-city">{city.nameKo} <span>{city.name}</span></p>
          <strong className="signal-tile-heading">{city.typeKo}</strong>
          <p className="signal-tile-copy">{city.insightKo}</p>
        </div>
      </article>

      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">02 / TREND<DataBadge provenance="illustrative" /></span>
        <div className="signal-tile-body"><CityTrend trend={city.trend} cityName={city.nameKo} /></div>
      </article>

      <article className="signal-tile">
        <Ticks />
        <span className="signal-tile-kicker">03 / 6-POINT INDEX<DataBadge provenance="illustrative" /></span>
        <div className="signal-tile-body signal-tile-radar">
          <CityRadar indicators={indicators} size={124} id={city.slug} showLabels={false} />
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
        <span className="signal-tile-kicker">04 / SIGNATURE WORK<DataBadge provenance="observed" /></span>
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
