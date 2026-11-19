import Link from 'next/link'
import type { CSSProperties } from 'react'
import { FORMAT_ORDER, getCityModel, modelSummary } from '@/features/opportunity/service'

const signed = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}`

export function CityModelBoard({ slug, cityNameKo }: { slug: string; cityNameKo: string }) {
  const model = getCityModel(slug)
  if (!model) {
    return (
      <div className="model-panel">
        <p>{cityNameKo}는 광역 인구 100만 명 미만이라 Resonance 세계 100위 표의 대상이 아니어서, 모델 점수가 없습니다.</p>
        <Link className="model-link" href="/opportunity">기회 도시 100곳 보기 →</Link>
      </div>
    )
  }

  const ahead = model.opportunity > 0
  return (
    <div className="model-board">
      <div className="insight-strip">
        <article className="insight-cell dark">
          <span className="mono">OPPORTUNITY SCORE</span>
          <strong>{signed(model.opportunity)}</strong>
          <p>기대보다 문화 매력이 {ahead ? '앞섭니다' : '뒤처집니다'} · 100개 도시 중 {model.opportunityRank}위</p>
        </article>
        <article className="insight-cell">
          <span className="mono">LOVABILITY · ACTUAL / EXPECTED</span>
          <strong>#{model.lovability} <small>/ #{Math.round(model.predictedLovability)}</small></strong>
          <p>정주 여건·경제 활력·인구·권역으로 예측한 순위와 비교</p>
        </article>
        <article className="insight-cell">
          <span className="mono">CITY TYPE · KMEANS</span>
          <strong className="model-type">{model.cluster}</strong>
          <p>세 축 순위와 인구로 묶은 100개 도시 유형</p>
        </article>
        <article className="insight-cell">
          <span className="mono">STRENGTHS</span>
          <strong className="model-type">{model.highlights[0].category}</strong>
          <p>#{model.highlights[0].rank} · 다음 {model.highlights[1].category} #{model.highlights[1].rank}</p>
        </article>
      </div>

      <div className="model-grid">
        <div className="model-panel">
          <h3>형식별 적합도</h3>
          {FORMAT_ORDER.map((key) => (
            <div className="model-fit" key={key}>
              <label>{modelSummary.formats[key].label}<b>{model.formats[key].fit.toFixed(1)} · {model.formats[key].rank}위</b></label>
              <i style={{ '--value': `${model.formats[key].fit}%` } as CSSProperties} />
            </div>
          ))}
          <p className="model-note">100개 도시 중 순위. 형식별 가중치는 성과 데이터가 쌓이기 전까지 설계 가정입니다.</p>
        </div>
        <div className="model-panel">
          <h3>소개 글이 비슷한 도시</h3>
          <ol className="model-similar">
            {model.similar.map((item) => (
              <li key={item.city}><span>{item.city}</span><b>{item.similarity.toFixed(2)}</b></li>
            ))}
          </ol>
          <p className="model-note">다국어 문장 임베딩(MiniLM-L12)의 코사인 유사도. 보고서 서술 주제가 함께 반영됩니다.</p>
        </div>
      </div>

      <p className="model-foot">
        {modelSummary.model} · {modelSummary.cityCount}개 도시 5겹 교차 검증 R² {modelSummary.r2.toFixed(2)} · Spearman {modelSummary.spearman.toFixed(2)} ·
        Resonance World&apos;s Best Cities 2026 <Link className="model-link" href="/opportunity">기회 도시 전체 보기 →</Link>
      </p>
    </div>
  )
}
