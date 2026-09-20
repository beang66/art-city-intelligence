import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CityRanking } from '@/components/city/CityRanking'
import { CitySummary } from '@/components/city/CitySummary'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { cities, findCity, rankCities } from '@/features/city-intelligence/service'

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

  return (
    <>
      <section className="section page-hero compact-hero city-hero">
        <div><p className="eyebrow">CITY INTELLIGENCE / {city.country.toUpperCase()}</p><h1>{city.name}<br /><span>signals.</span></h1><p className="lede">{city.type}. {city.dna}를 중심으로 시장, 문화, 산업 기회의 연결 구조를 읽습니다.</p><div className="hero-actions"><Link className="dark-button action-link" href="/compare">ADD TO COMPARE <span className="arrow">↗</span></Link><Link className="outline-button action-link" href="/methodology">READ METHODOLOGY</Link></div></div>
        <CityRanking city={city} rank={rank} total={ranked.length} />
      </section>
      <section className="section section-border">
        <div className="section-heading"><div><p className="eyebrow">01 / SIGNAL DASHBOARD</p><h2>Four views,<br /><span>one city system.</span></h2></div><div className="city-score-stack"><ScoreBar label="MARKET" score={city.signalScores.market} /><ScoreBar label="CULTURE" score={city.signalScores.cultural} /><ScoreBar label="OPPORTUNITY" score={city.signalScores.opportunity} /></div></div>
        <div className="surface city-detail-dashboard"><CitySummary city={city} /></div>
      </section>
      <section className="section section-border"><div className="section-heading"><div><p className="eyebrow">02 / PEER CITIES</p><h2>Move across<br /><span>the cohort.</span></h2></div></div><div className="city-link-grid">{cities.map((item) => <Link className={`city-link${item.slug === city.slug ? ' active' : ''}`} href={`/cities/${item.slug}`} key={item.slug}><span>{item.code}</span><strong>{item.name}</strong><small>{item.type}</small></Link>)}</div></section>
    </>
  )
}
