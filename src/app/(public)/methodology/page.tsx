import type { Metadata } from 'next'
import { DIMENSIONS } from '@/features/comparison/service'
import { sources, sourceCount } from '@/features/evidence/sources'

export const metadata: Metadata = { title: 'Methodology', description: 'Art City Intelligence의 데이터, 점수, 검증 방법을 설명합니다.' }

const steps = [
  ['01', 'Ingest', '문헌과 공개 지수에서 도시 단위 관측값을 출처와 함께 수집합니다.'],
  ['02', 'Normalize', '권역·인구 기준이 다른 지수를 같은 비교 단위로 정렬합니다.'],
  ['03', 'Score', '6개 차원 값을 산출하고 가중치를 흔들어 민감도를 확인합니다.'],
  ['04', 'Separate', '관측값과 예시값을 분리해 표시합니다.'],
] as const

const KIND_LABEL = {
  index: '지수',
  framework: '방법론',
  research: '연구',
  policy: '정책',
} as const

export default function MethodologyPage() {
  return (
    <>
      <section className="section page-hero compact-hero methodology-hero">
        <div>
          <p className="eyebrow">METHODOLOGY / TRACEABLE BY DESIGN</p>
          <h1>Every score<br />has a <span>source.</span></h1>
          <p className="lede">도시의 예술 생태계를 6개 차원으로 읽고, 각 차원이 어떤 국제 지표 체계와 연구에 기대고 있는지 밝힙니다.</p>
        </div>
        <div className="surface method-summary">
          <span className="eyebrow">MODEL CARD / V2.0</span>
          <strong>{DIMENSIONS.length}</strong><p>comparable dimensions</p>
          <strong>{sourceCount}</strong><p>cited sources</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">01 / TWO KINDS OF NUMBER</p><h2>Observed and<br /><span>illustrative.</span></h2></div>
        </div>
        <div className="provenance-split">
          <article className="provenance-card is-observed">
            <span className="data-badge data-badge-observed"><i aria-hidden="true" />OBSERVED</span>
            <h3>발행된 순위</h3>
            <dl>
              <div><dt>단위</dt><dd>순위 (낮을수록 상위)</dd></div>
              <div><dt>대상</dt><dd>광역 인구 100만 명 이상 도시</dd></div>
              <div><dt>구성</dt><dd>30개 카테고리 46개 지표, 균등 가중</dd></div>
              <div><dt>축</dt><dd>Livability · Lovability · Prosperity</dd></div>
            </dl>
          </article>
          <article className="provenance-card is-illustrative">
            <span className="data-badge data-badge-illustrative"><i aria-hidden="true" />ILLUSTRATIVE</span>
            <h3>예시 값</h3>
            <ul className="illustrative-list">
              <li>Art City Index</li>
              <li>6개 차원 점수</li>
              <li>Trend 시계열</li>
              <li>Signal 점수</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">02 / DIMENSION MAP</p><h2>Where the six<br /><span>dimensions come from.</span></h2></div>
        </div>
        <div className="surface dimension-map" role="table" aria-label="차원과 근거 매핑">
          <div className="dimension-map-row table-head" role="row"><span>DIMENSION</span><span>C3 SUBINDEX</span><span>C3 DIMENSION</span><span>근거 문헌</span></div>
          {DIMENSIONS.map((dimension) => {
            const source = sources.find((item) => item.id === dimension.sourceId)
            return (
              <div className="dimension-map-row" role="row" key={dimension.key}>
                <span><strong>{dimension.labelKo}</strong> <em>{dimension.label}</em></span>
                <span>{dimension.c3Subindex}</span>
                <span>{dimension.c3Dimension}</span>
                <span className="map-source">{source ? `${source.author} (${source.year})` : '—'}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">03 / PIPELINE</p><h2>From raw evidence<br /><span>to a decision brief.</span></h2></div>
        </div>
        <div className="workflow-grid">{steps.map(([index, title, copy]) => <article className="workflow-step" key={index}><span className="step-number">{index} / {title.toUpperCase()}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">04 / KNOWN LIMITS</p><h2>What this model<br /><span>cannot tell you.</span></h2></div>
        </div>
        <div className="insight-strip">
          <article className="insight-cell dark"><span className="mono">WEIGHTING</span><strong>가중치</strong><p>가중치를 어떻게 정하느냐가 순위를 가장 크게 흔듭니다. 화면의 ± 값이 그 변동 폭입니다.</p></article>
          <article className="insight-cell"><span className="mono">CORRELATION</span><strong>상관</strong><p>문화 활력은 창조경제·기반환경과 상관이 낮아, 하나의 축으로 합산하는 데 한계가 있습니다.</p></article>
          <article className="insight-cell"><span className="mono">COVERAGE</span><strong>포괄</strong><p>글로벌 순위표는 광역 인구 100만 명 이상만 다룹니다. 바젤과 베네치아는 권역 순위로만 관측됩니다.</p></article>
          <article className="insight-cell"><span className="mono">COMPARABILITY</span><strong>시계열</strong><p>기준 연도마다 산출 방식이 바뀌어, 연도 간 순위를 직접 비교할 수 없습니다.</p></article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">05 / SOURCES</p><h2>Every document<br /><span>behind the model.</span></h2></div>
          <p className="section-intro">적용 문헌 {sourceCount}건</p>
        </div>
        <ol className="source-list-full">
          {sources.map((source) => (
            <li key={source.id}>
              <div className="source-head">
                <span className={`source-kind kind-${source.kind}`}>{KIND_LABEL[source.kind]}</span>
                <strong>{source.title}</strong>
              </div>
              <p className="source-meta">{source.author} · {source.publisher} · {source.year}</p>
              <p className="source-use">{source.use}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
