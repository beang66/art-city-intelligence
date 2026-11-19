import type { Metadata } from 'next'
import { OpportunityExplorer } from '@/components/opportunity/OpportunityExplorer'
import { formatTop, modelSummary } from '@/features/opportunity/service'

export const metadata: Metadata = { title: 'Opportunity Cities', description: '팝업·비상설 전시·상설 전시 형식별로 기대보다 문화 매력이 앞선 도시를 찾습니다.' }

export default function OpportunityPage() {
  const s = modelSummary
  return (
    <>
      <section className="section page-hero compact-hero">
        <div>
          <p className="eyebrow">01 / OPPORTUNITY MODEL</p>
          <h1>Find the city<br /><span>ahead of its size.</span></h1>
          <p className="lede">
            정주 여건·경제 활력·인구로 기대되는 것보다 문화 매력이 앞선 도시를 찾고, 팝업·비상설 전시·상설 전시마다 맞는 도시를 정렬합니다.
            Resonance World&apos;s Best Cities 2026 상위 {s.cityCount}개 도시로 학습했습니다.
          </p>
        </div>
        <div className="insight-strip">
          <article className="insight-cell dark"><span className="mono">MODEL</span><strong>{s.model}</strong><p>{s.cv}</p></article>
          <article className="insight-cell"><span className="mono">R²</span><strong>{s.r2.toFixed(2)}</strong><p>교차 검증 설명력</p></article>
          <article className="insight-cell"><span className="mono">SPEARMAN</span><strong>{s.spearman.toFixed(2)}</strong><p>순위 일치</p></article>
          <article className="insight-cell"><span className="mono">MAE</span><strong>−{Math.round(s.maeReduction * 100)}%</strong><p>평균 예측 대비 오차</p></article>
        </div>
      </section>
      <section className="section section-border" id="formats">
        <div className="section-heading">
          <div><p className="eyebrow">02 / BY FORMAT</p><h2>Pop-up, exhibition<br /><span>or a permanent home.</span></h2></div>
          <p className="section-intro">같은 도시라도 형식에 따라 맞는 정도가 다릅니다. 막대는 0–100 적합도입니다.</p>
        </div>
        <OpportunityExplorer top={formatTop} summary={s} />
      </section>
    </>
  )
}
