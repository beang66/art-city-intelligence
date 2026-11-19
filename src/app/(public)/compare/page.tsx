import type { Metadata } from 'next'
import { CompareExplorer } from '@/components/charts/CompareExplorer'
import { SourceNote } from '@/components/evidence/DataBadge'
import { getCityIndicators, getCohortMedians } from '@/features/comparison/service'
import { cities } from '@/features/city-intelligence/service'
import { getObservation } from '@/features/evidence/observed'
import { themeSummary } from '@/features/themes/service'

export const metadata: Metadata = { title: 'Compare Cities', description: '18개 도시 중 원하는 도시를 골라 6개 예술 차원과 근거를 비교하고, 어울리는 브랜드 전시 주제를 봅니다.' }

export default function ComparePage() {
  const comparisons = cities.map((city) => ({ city, indicators: getCityIndicators(city.slug), observation: getObservation(city.slug) }))
  const observed = [...comparisons].sort((a, b) => (a.observation?.world?.rank ?? 999) - (b.observation?.world?.rank ?? 999))

  return (
    <>
      <section className="compare-hero">
        <p className="eyebrow">01 / CITY COMPARE</p>
        <h1>WE COMPARE.<br />WE TRACE.<br />WE EXPLAIN.</h1>
        <p className="compare-hero-lede">
          도시의 크기가 아니라 예술이 생산되고 유통되고 참여되는 방식을 비교합니다.
          {cities.length}개 도시 중 기준 도시와 비교 도시를 고르고, 여섯 개 차원을 하나씩 열어 값과 그 근거를 확인하세요.
          아래에는 기준 도시에 어울리는 브랜드 전시 주제를 근거와 함께 보여 줍니다.
        </p>
      </section>

      <section className="compare-body" id="explorer">
        <CompareExplorer comparisons={comparisons} medians={getCohortMedians()} themes={themeSummary.cities} />
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">02 / OBSERVED POSITION</p><h2>What the published<br /><span>data actually says.</span></h2></div>
          <p className="section-intro">{cities.length}개 도시 전체의 공개 순위입니다. 순위는 낮을수록 상위이고, 세계 100위 표 밖의 도시는 권역 순위만 있습니다.</p>
        </div>
        <div className="surface observed-table" role="table" aria-label="관측된 도시 순위">
          <div className="observed-row table-head" role="row">
            <span>CITY</span><span>WORLD RANK</span><span>LIVABILITY</span><span>LOVABILITY</span><span>PROSPERITY</span><span>REGION</span>
          </div>
          {observed.map(({ city, observation }) => (
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
