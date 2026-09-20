import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Methodology', description: 'Art City Intelligence의 데이터, 점수, 검증 방법을 설명합니다.' }

const steps = [
  ['01', 'Ingest', '기관, 시장, 전시, 참여 데이터를 출처 메타데이터와 함께 수집합니다.'],
  ['02', 'Normalize', '인구·공간·기간 차이를 보정해 도시 간 비교 가능한 단위로 변환합니다.'],
  ['03', 'Score', '6개 차원별 점수와 불확실성 구간을 산출하고 민감도를 확인합니다.'],
  ['04', 'Validate', 'Observed, Inferred, Proposed 상태를 분리하고 편집 검토를 기록합니다.'],
] as const

export default function MethodologyPage() {
  return (
    <>
      <section className="section page-hero compact-hero methodology-hero"><div><p className="eyebrow">METHODOLOGY / TRACEABLE BY DESIGN</p><h1>Every score<br />has a <span>source.</span></h1><p className="lede">순위보다 작동 원리를 읽기 위해 원천 데이터, 비교 기준, 불확실성, 해석 상태를 한 흐름으로 관리합니다.</p></div><div className="surface method-summary"><span className="eyebrow">MODEL CARD / V1.0</span><strong>6</strong><p>comparable dimensions</p><strong>142</strong><p>traceable sources</p><strong>3</strong><p>evidence states</p></div></section>
      <section className="section section-border"><div className="section-heading"><div><p className="eyebrow">01 / PIPELINE</p><h2>From raw evidence<br /><span>to a decision brief.</span></h2></div><p className="section-intro">각 단계는 독립적으로 재실행할 수 있으며, 지표 변경이 최종 제안에 미친 영향을 추적할 수 있습니다.</p></div><div className="workflow-grid">{steps.map(([index, title, copy]) => <article className="workflow-step" key={index}><span className="step-number">{index} / {title.toUpperCase()}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="section section-border"><div className="section-heading"><div><p className="eyebrow">02 / EVIDENCE STATES</p><h2>Facts and ideas<br /><span>stay separate.</span></h2></div></div><div className="insight-strip"><article className="insight-cell dark"><span className="mono">OBSERVED</span><strong>Evidence</strong><p>원천에서 직접 확인한 값과 사건</p></article><article className="insight-cell"><span className="mono">INFERRED</span><strong>Analysis</strong><p>비교와 모델에서 발견한 관계</p></article><article className="insight-cell"><span className="mono">PROPOSED</span><strong>Opportunity</strong><p>근거를 활용해 만든 실행 가설</p></article><article className="insight-cell"><span className="mono">QUALITY</span><strong>Confidence</strong><p>출처와 민감도에 기반한 신뢰 상태</p></article></div></section>
    </>
  )
}
