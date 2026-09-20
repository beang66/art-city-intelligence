import Image from 'next/image'
import type { City } from '@/types/city'
import { getSignalStats } from '@/features/comparison/service'

function InstitutionIcon() {
  return (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <path d="M4 36h40" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 36V18M16 36V18M24 36V18M32 36V18M40 36V18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 18h38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 4 44 15H4L24 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function EventIcon() {
  return (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <rect x="6" y="9" width="36" height="27" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 17h36" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15 4v8M33 4v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14 24h6M14 30h6M28 24h6M28 30h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function OpportunityIcon() {
  return (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <circle cx="24" cy="20" r="15" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="24" cy="20" r="2" fill="currentColor" />
      <path d="M36 8 44 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function CityDashboard({ city }: { city: City }) {
  const signals = getSignalStats(city.slug)
  const work = city.signatureWork

  return (
    <div className="city-board">
      <div className="city-board-main">
        <h3 className="city-board-title">{city.nameKo}<em>{city.name}</em></h3>

        <p className="city-board-copy">{city.location}</p>
        <p className="city-board-copy">{city.insightKo}</p>

        <div className="city-board-table" role="table" aria-label="도시 신호 요약">
          {signals.map((signal) => (
            <div className="city-board-row" role="row" key={signal.key}>
              <span className="row-label">{signal.labelKo} <em>{signal.label}</em></span>
              <span className="row-value">{signal.score}</span>
              <span className="row-sub">{signal.rank}위</span>
              <span className="row-price">중앙값 {signal.median} <em className={signal.delta >= 0 ? 'is-up' : 'is-down'}>{signal.delta >= 0 ? '+' : ''}{signal.delta}</em></span>
            </div>
          ))}
        </div>
      </div>

      <div className="city-board-side">
        <div className="city-board-figure">
          <p className="figure-note">
            대표 작품 — {work.artist}<br />
            {work.title}, {work.year}
            <i className="figure-dot" aria-hidden="true" />
          </p>
          <div className="figure-image">
            <Image src={work.image} alt={`${work.title} — ${work.artist}`} sizes="(max-width: 1000px) 90vw, 40vw" />
          </div>
        </div>

        <div className="city-board-features">
          <article>
            <span className="feature-icon"><InstitutionIcon /></span>
            <h4>주요 기관 {city.cultural.institutions.length}곳이 도시의 기준선을 만듭니다</h4>
            <p>{city.cultural.institutions.join(' · ')}</p>
          </article>
          <article>
            <span className="feature-icon">
              <EventIcon />
              <b className="feature-badge">{city.cultural.events.length}</b>
            </span>
            <h4>정기 국제 행사가 도시의 일정을 규정합니다</h4>
            <p>{city.cultural.events.join(' · ')}</p>
          </article>
          <article>
            <span className="feature-icon"><OpportunityIcon /></span>
            <h4>{city.opportunityKo}</h4>
            <p>{city.industryKo.join(' · ')} 산업과 연결됩니다</p>
          </article>
        </div>
      </div>
    </div>
  )
}
