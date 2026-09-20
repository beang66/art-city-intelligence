import type { Metadata } from 'next'
import { CompareExplorer } from '@/components/charts/CompareExplorer'
import { SourceNote } from '@/components/evidence/DataBadge'
import { getCityIndicators, getCohortMedians } from '@/features/comparison/service'
import { cities, findCity } from '@/features/city-intelligence/service'
import { getObservation } from '@/features/evidence/observed'

export const metadata: Metadata = { title: 'Compare Cities', description: '유사 도시군 안에서 6개 예술 차원과 근거를 비교합니다.' }

const COHORT = ['seoul', 'berlin', 'london'] as const

export default function ComparePage() {
  const comparisons = COHORT.map((slug) => {
    const city = findCity(slug)
    if (!city) throw new Error(`Missing comparison city: ${slug}`)
    return { city, indicators: getCityIndicators(slug), observation: getObservation(slug) }
  })

  const medians = getCohortMedians()

  return (
    <>
      <section className="compare-hero">
        <p className="eyebrow">01 / CITY COMPARE</p>
        <h1>WE COMPARE.<br />WE TRACE.<br />WE EXPLAIN.</h1>
        <p className="compare-hero-lede">
          도시의 크기가 아니라 예술이 생산되고 유통되고 참여되는 방식을 비교합니다.
          여섯 개 차원을 하나씩 열어 무엇을 재고 있는지, 그 값이 어디서 왔는지 확인하세요.
        </p>
      </section>

      <section className="compare-body" id="explorer">
        <CompareExplorer comparisons={comparisons} medians={medians} cityCount={cities.length} />
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">02 / OBSERVED POSITION</p><h2>What the published<br /><span>data actually says.</span></h2></div>
          <p className="section-intro">순위는 낮을수록 상위입니다.</p>
        </div>
        <div className="surface observed-table" role="table" aria-label="관측된 도시 순위">
          <div className="observed-row table-head" role="row">
            <span>CITY</span><span>WORLD RANK</span><span>LIVABILITY</span><span>LOVABILITY</span><span>PROSPERITY</span><span>REGION</span>
          </div>
          {comparisons.map(({ city, observation }) => (
            <div className="observed-row" role="row" key={city.slug}>
              <span className="observed-city"><strong>{city.name}</strong><small>{city.nameKo}</small></span>
              <span className="observed-rank">{observation?.world ? `#${observation.world.rank}` : '—'}</span>
              <span>{observation?.world ? `#${observation.world.pillars.livability}` : '—'}</span>
              <span>{observation?.world ? `#${observation.world.pillars.lovability}` : '—'}</span>
              <span>{observation?.world ? `#${observation.world.pillars.prosperity}` : '—'}</span>
              <span>{observation?.regional ? `${observation.regional.scope} #${observation.regional.rank}` : '—'}</span>
            </div>
          ))}
        </div>
        <SourceNote sourceId="resonance-world-2026" />
      </section>
    </>
  )
}
