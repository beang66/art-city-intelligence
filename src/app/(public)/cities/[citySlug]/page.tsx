import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CityRanking } from '@/components/city/CityRanking'
import { CityDashboard } from '@/components/city/CityDashboard'
import { ObservedPositionBoard } from '@/components/city/ObservedPositionBoard'
import { CityDimensionBoard } from '@/components/charts/CityDimensionBoard'
import { CityTrend } from '@/components/charts/CityTrend'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { cities, citiesByName, findCity, rankCities } from '@/features/city-intelligence/service'
import { getCityIndicators, getCohortMedians } from '@/features/comparison/service'
import { getObservation } from '@/features/evidence/observed'
import { readRank } from '@/features/evidence/describe'

type Props = { params: Promise<{ citySlug: string }> }

export function generateStaticParams() {
  return cities.map((city) => ({ citySlug: city.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params
  const city = findCity(citySlug)
  return city ? { title: city.name, description: `${city.name}의 시장·문화·기회 신호를 확인합니다.` } : { title: 'City not found' }
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params
  const city = findCity(citySlug)
  if (!city) notFound()

  const ranked = rankCities()
  const rank = ranked.findIndex((item) => item.slug === city.slug) + 1
  const indicators = getCityIndicators(city.slug)
  const medians = getCohortMedians()
  const observation = getObservation(city.slug)
  const reading = readRank(observation)

  return (
    <>
      <section className="section page-hero compact-hero city-hero">
        <div>
          <p className="eyebrow">CITY INTELLIGENCE / {city.country.toUpperCase()}</p>
          <h1>{city.name}<br /><span>signals.</span></h1>
          <p className="lede">{city.typeKo}. {city.dnaKo}를 중심으로 시장, 문화, 산업 기회의 연결 구조를 읽습니다.</p>
          <div className="hero-actions">
            <Link className="dark-button action-link" href="/compare">ADD TO COMPARE <span className="arrow">↗</span></Link>
            <Link className="outline-button action-link" href="/methodology">READ METHODOLOGY</Link>
          </div>
        </div>
        <CityRanking city={city} rank={rank} total={ranked.length} />
      </section>

      <section className="section section-border" id="opportunity">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / SIGNAL DASHBOARD</p>
            <h2>Four views,<br /><span>one city system.</span></h2>
            <span className="data-badge data-badge-illustrative"><i aria-hidden="true" />ILLUSTRATIVE</span>
          </div>
          <div className="city-score-stack">
            <ScoreBar label="MARKET" score={city.signalScores.market} />
            <ScoreBar label="CULTURE" score={city.signalScores.cultural} />
            <ScoreBar label="OPPORTUNITY" score={city.signalScores.opportunity} />
          </div>
        </div>
        <div className="surface city-detail-dashboard"><CityDashboard city={city} /></div>

        <div className="city-essay">
          <article>
            <h3>문화 유산</h3>
            <p>{city.heritage}</p>
          </article>
          <article>
            <h3>변화 수용성</h3>
            <p>{city.adaptability}</p>
          </article>
          <article>
            <h3>앞으로의 전망</h3>
            <p>{city.outlook}</p>
          </article>
        </div>
      </section>

      <section className="section section-border" id="observed">
        <div className="section-heading">
          <div><p className="eyebrow">02 / OBSERVED POSITION</p><h2>Published rankings<br /><span>for this city.</span></h2></div>
          {reading ? <p className="section-intro">{reading.headline}</p> : null}
        </div>
        <ObservedPositionBoard city={city} />
      </section>

      <section className="section section-border" id="art-dna">
        <div className="section-heading">
          <div><p className="eyebrow">03 / SIX DIMENSIONS</p><h2>Six axes,<br /><span>one shape.</span></h2></div>
          <span className="data-badge data-badge-illustrative"><i aria-hidden="true" />ILLUSTRATIVE</span>
        </div>
        <CityDimensionBoard indicators={indicators} medians={medians} cityName={city.nameKo} />
      </section>

      <section className="section section-border" id="trend">
        <div className="section-heading">
          <div><p className="eyebrow">04 / TREND</p><h2>What moved<br /><span>this line.</span></h2></div>
          <span className="data-badge data-badge-illustrative"><i aria-hidden="true" />ILLUSTRATIVE</span>
        </div>
        <div className="trend-layout">
          <div className="surface trend-figure"><CityTrend trend={city.trend} cityName={city.nameKo} tall /></div>
          <div className="trend-reading">
            <h3>추세 읽기</h3>
            <p>{city.trendNote}</p>
          </div>
        </div>
      </section>

      <section className="section section-border" id="cohort">
        <div className="section-heading"><div><p className="eyebrow">05 / PEER CITIES</p><h2>Move across<br /><span>the cohort.</span></h2></div></div>
        <div className="city-link-grid">
          {citiesByName.map((item) => (
            <Link className={`city-link${item.slug === city.slug ? ' active' : ''}`} href={`/cities/${item.slug}`} key={item.slug}>
              <span>{item.code}</span>
              <strong>{item.nameKo}</strong>
              <small>{item.typeKo}</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
