'use client'

import { useState } from 'react'
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

  return (
    <>
      <section className="section page-hero compact-hero overview-hero">
        <div>
          <p className="eyebrow">01 / ART ECOSYSTEM INTELLIGENCE · UPDATED 09.18</p>
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
          {workflow.map(([label, title, copy], index) => <article className={`workflow-step${index === 0 ? ' active' : ''}`} key={label}><span className="step-number">{label}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">03 / YOUR WORKSPACE</p><h2>Continue where<br /><span>you left off.</span></h2></div><ActionLink href="/cities/seoul" variant="outline">＋ NEW PROJECT</ActionLink></div>
        <div className="card-grid">
          <article className="project-card dark"><span className="status">IN PROGRESS / 72%</span><h3>Furniture cities<br />2027</h3><p>서울·밀라노·베를린의 생산 및 실험 차원을 비교하는 신규 쇼룸 프로젝트.</p><div className="card-bottom"><span>UPDATED 12 MIN AGO</span><ActionLink href="/compare" variant="outline">CONTINUE ↗</ActionLink></div></article>
          <article className="project-card"><span className="status">SAVED REPORT</span><h3>Seoul hospitality<br />experience</h3><p>참여와 지역 분포를 중심으로 호텔 문화 경험의 기회를 검토했습니다.</p><div className="card-bottom"><span>8 EVIDENCE ITEMS</span><ActionLink href="/cities/seoul" variant="outline">OPEN ↗</ActionLink></div></article>
          <article className="project-card"><span className="status">DATA UPDATE</span><h3>3 cities have<br />new evidence.</h3><p>리스본, 멜버른, 멕시코시티의 기관 및 참여 데이터가 갱신되었습니다.</p><div className="card-bottom"><span>QUALITY CHECKED</span><ActionLink href="/methodology" variant="outline">REVIEW ↗</ActionLink></div></article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">04 / TRUST BY DESIGN</p><h2>Every claim has<br /><span>a way back.</span></h2></div><p className="section-intro">AI가 만든 문장, 모델이 발견한 관계, 데이터에서 직접 관측한 사실을 구분해 보여줍니다.</p></div>
        <div className="insight-strip">
          <article className="insight-cell dark"><span className="mono">EVIDENCE STATE</span><strong>Observed</strong><p>원천 데이터에서 직접 확인된 사실</p></article>
          <article className="insight-cell"><span className="mono">ANALYSIS STATE</span><strong>Inferred</strong><p>비교·군집·민감도 분석에서 발견된 관계</p></article>
          <article className="insight-cell"><span className="mono">IDEATION STATE</span><strong>Proposed</strong><p>근거에 기반해 제안된 기획 가설</p></article>
          <article className="insight-cell"><span className="mono">QUALITY STATE</span><strong>Stable</strong><p>가중치와 방법 변화에도 유지되는 결과</p></article>
        </div>
      </section>

      <section className="cta-section"><h2>Start with<br />the right city.</h2><div><p>40개 후보 도시에서 데이터 품질과 조건이 맞는 도시를 찾고 첫 비교를 시작하세요.</p><ActionLink href="/cities/seoul">EXPLORE CITIES <span className="arrow">↗</span></ActionLink></div></section>
    </>
  )
}
