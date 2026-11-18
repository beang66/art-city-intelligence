'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { City } from '@/types/city'
import { ArtGlobe } from '@/components/globe/ArtGlobe'
import { ActionLink } from '@/components/ui/ActionLink'
import { CitySignalTiles } from '@/components/city/CitySignalTiles'
import { cities } from '@/features/city-intelligence/service'
import { sourceCount } from '@/features/evidence/sources'
import { observedCityCount } from '@/features/evidence/observed'

const workflow = [
  ['01 / EXPLORE', 'Find the right city cohort.', '외부 조건과 데이터 품질을 기준으로 비교 가능한 후보 도시를 찾습니다.'],
  ['02 / COMPARE', 'See how cities differ.', '규모·밀도와 6개 차원을 나누어 차이를 만든 지표를 확인합니다.'],
  ['03 / ART DNA', "Read the city's distinct pattern.", '확실한 강점과 가능성 있는 강점을 근거와 함께 해석합니다.'],
  ['04 / OPPORTUNITY', 'Turn insight into a brief.', '산업별 제품·공간·브랜드 방향과 실행 위험을 함께 검토합니다.'],
] as const

export function OverviewContent() {
  const [focusedCity, setFocusedCity] = useState<City | null>(null)
  const citySlug = focusedCity?.slug ?? 'seoul'
  const workflowHrefs = [
    `/cities/${citySlug}#cohort`,
    '/compare#explorer',
    `/cities/${citySlug}#art-dna`,
    `/cities/${citySlug}#opportunity`,
  ] as const

  return (
    <>
      <section className="section page-hero compact-hero overview-hero">
        <div>
          <p className="eyebrow">01 / ART ECOSYSTEM INTELLIGENCE</p>
          <h1>Read how<br />art <span>works.</span></h1>
          <p className="lede">세계 도시의 예술 생태계를 유사한 조건 안에서 비교하고, 도시의 예술 DNA를 제품·공간·브랜드 기회로 전환합니다.</p>
          <div className="hero-actions">
            <ActionLink href="/cities/seoul">START CITY ANALYSIS <span className="arrow">↘</span></ActionLink>
            <ActionLink href="/compare" variant="outline">VIEW SAMPLE COMPARE</ActionLink>
          </div>
          <div className="hero-proof" aria-label="플랫폼 현황">
            <div className="proof-item"><strong>{cities.length}</strong><small>CITIES IN SET</small></div>
            <div className="proof-item"><strong>{observedCityCount}</strong><small>WITH OBSERVED RANK</small></div>
            <div className="proof-item"><strong>{sourceCount}</strong><small>CITED SOURCES</small></div>
          </div>
        </div>
        <ArtGlobe onSelectionChange={setFocusedCity} />
      </section>

      <section className="signal-tile-section">
        <CitySignalTiles city={focusedCity} />
      </section>

      <section className="section" id="workflow">
        <div className="section-heading">
          <div><p className="eyebrow">02 / FROM CITY TO DECISION</p><h2>A traceable path<br /><span>to opportunity.</span></h2></div>
          <p className="section-intro">하나의 종합 순위 대신 도시의 작동 방식을 비교합니다. 모든 해석과 제안은 원천 데이터, 방법론, 불확실성으로 되돌아갈 수 있습니다.</p>
        </div>
        <div className="workflow-grid">
          {workflow.map(([label, title, copy], index) => (
            <Link className={`workflow-step${index === 0 ? ' active' : ''}`} href={workflowHrefs[index]} key={label}>
              <span className="step-number">{label}</span><h3>{title}</h3><p>{copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">03 / TRUST BY DESIGN</p><h2>Every claim has<br /><span>a way back.</span></h2></div><p className="section-intro">발행된 관측값, 비교로 읽은 관계, 기획 가설을 구분해 보여줍니다.</p></div>
        <div className="insight-strip">
          <article className="insight-cell dark"><span className="mono">EVIDENCE STATE</span><strong>Observed</strong><p>원천 데이터에서 직접 확인된 사실</p></article>
          <article className="insight-cell"><span className="mono">ANALYSIS STATE</span><strong>Inferred</strong><p>중앙값 비교·민감도 분석으로 읽은 관계</p></article>
          <article className="insight-cell"><span className="mono">IDEATION STATE</span><strong>Proposed</strong><p>근거에 기반해 제안된 기획 가설</p></article>
          <article className="insight-cell"><span className="mono">QUALITY STATE</span><strong>Stable</strong><p>가중치와 방법 변화에도 유지되는 결과</p></article>
        </div>
      </section>

      <section className="cta-section"><h2>Start with<br />the right city.</h2><div><p>{cities.length}개 도시에서 조건이 맞는 도시를 찾고 첫 비교를 시작하세요.</p><ActionLink href="/cities/seoul">EXPLORE CITIES <span className="arrow">↗</span></ActionLink></div></section>
    </>
  )
}
