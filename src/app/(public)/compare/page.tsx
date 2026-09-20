import type { Metadata } from 'next'
import { ComparisonTable } from '@/components/charts/ComparisonTable'
import { ActionLink } from '@/components/ui/ActionLink'
import { getCityIndicators } from '@/features/comparison/service'
import { findCity } from '@/features/city-intelligence/service'

export const metadata: Metadata = { title: 'Compare Cities', description: '유사 도시군 안에서 6개 예술 차원과 근거를 비교합니다.' }

export default function ComparePage() {
  const comparisons = ['seoul', 'berlin', 'london'].map((slug) => {
    const city = findCity(slug)
    if (!city) throw new Error(`Missing comparison city: ${slug}`)
    return { city, indicators: getCityIndicators(slug) }
  })

  return (
    <>
      <section className="section page-hero compact-hero">
        <div>
          <p className="eyebrow">01 / CITY COMPARE</p>
          <h1>Compare how<br />cities <span>work.</span></h1>
          <p className="lede">도시의 크기가 아니라 예술이 생산되고 유통되고 참여되는 방식을 비교합니다. 서울과 유사한 조건의 도시에서 실제 차이를 확인하세요.</p>
          <div className="hero-actions"><a className="dark-button action-link" href="#dimensions">COMPARE 6 DIMENSIONS <span className="arrow">↘</span></a><ActionLink href="/cities/seoul" variant="outline">EDIT CITIES</ActionLink></div>
        </div>
        <div className="surface hero-panel">
          <div className="panel-head"><span>PEER POSITION / CREATIVE GLOBAL CITIES</span><span>8-CITY COHORT</span></div>
          <div className="comparison-orbit"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" /><div className="orbit-core"><strong>SEOUL</strong><small>SELECTED CITY</small></div><span className="orbit-city city-a">BERLIN<b>−4.2</b></span><span className="orbit-city city-b">LONDON<b>+2.8</b></span><span className="orbit-city city-c">COHORT MEDIAN<b>68.1</b></span><span className="orbit-city city-d">GLOBAL BEST<b>91.4</b></span></div>
          <div className="panel-foot mono"><span><i className="live-dot" />RANK RANGE 2–4</span><span>STABILITY / HIGH</span></div>
        </div>
      </section>
      <section className="section section-border" id="dimensions">
        <div className="section-heading"><div><p className="eyebrow">02 / SIX DIMENSIONS</p><h2>One city,<br /><span>six ways to read it.</span></h2></div><p className="section-intro">규모와 밀도를 전환해 대도시의 절대량과 실제 집중도를 분리해서 확인할 수 있습니다.</p></div>
        <ComparisonTable comparisons={comparisons} />
      </section>
      <section className="section section-border"><div className="section-heading"><div><p className="eyebrow">03 / WHAT MAKES THE DIFFERENCE</p><h2>Trace the gap<br /><span>to its source.</span></h2></div><ActionLink href="/methodology" variant="outline">VIEW METHODOLOGY</ActionLink></div><div className="card-grid"><article className="evidence-card"><span className="status">OBSERVED / STRONG</span><h3>Experimental formats</h3><p>서울은 미디어아트와 참여형 전시 비중에서 비교군 중앙값을 상회합니다.</p></article><article className="evidence-card"><span className="status">OBSERVED / GAP</span><h3>Resident participation</h3><p>기관 방문 규모는 크지만 주민 직접 제작 프로그램의 도달 범위는 베를린보다 낮습니다.</p></article><article className="evidence-card"><span className="status">INFERRED / STABLE</span><h3>Network bridge role</h3><p>서울은 아시아 기관과 글로벌 시장 사이를 연결하는 중개 중심성이 유지됩니다.</p></article></div></section>
    </>
  )
}
