'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { City } from '@/types/city'
import type { Indicator, IndicatorKey } from '@/types/indicator'
import { DIMENSIONS } from '@/features/comparison/service'
import { findSource } from '@/features/evidence/sources'
import type { CityObservation } from '@/features/evidence/observed'
import type { CityThemes } from '@/features/themes/service'
import { DataBadge } from '@/components/evidence/DataBadge'
import { withTopic } from '@/lib/korean'

type CityComparison = { city: City; indicators: readonly Indicator[]; observation?: CityObservation }

const MAX_PEERS = 3
const DEFAULT_PEERS = ['berlin', 'london']
const FORMAT_KO = { popup: '팝업', temporary: '비상설 전시', permanent: '상설 전시' } as const

/** What the city's own record says next to each dimension: the facts a score stands on. */
function evidence(key: IndicatorKey, { city, observation }: CityComparison): string {
  const c = city.cultural
  const world = observation?.world
  switch (key) {
    case 'market': return `작가 ${city.market.artists.join(', ')} · 가격대 ${city.market.priceRange} ${city.market.currency} (참고값)`
    case 'institution': return `기관 ${c.institutions.join(', ')}`
    case 'production': return `산업 ${city.industryKo.join('·')} · ${city.dnaKo}`
    case 'experiment': return `키워드 ${c.keywordsKo.join(' · ')}`
    case 'participation': return `행사 ${c.events.join(', ')}`
    case 'influence': return world ? `Resonance 세계 #${world.rank} · Lovability #${world.pillars.lovability}` : `행사 ${c.events.join(', ')} (세계 100위 표 밖)`
  }
}

export function CompareExplorer({
  comparisons,
  medians,
  themes,
}: {
  comparisons: readonly CityComparison[]
  medians: Record<IndicatorKey, number>
  themes: Record<string, CityThemes>
}) {
  const [active, setActive] = useState(0)
  const [focus, setFocus] = useState('seoul')
  const [peers, setPeers] = useState<string[]>(DEFAULT_PEERS)
  const bySlug = Object.fromEntries(comparisons.map((c) => [c.city.slug, c]))
  const cityCount = comparisons.length
  const dimension = DIMENSIONS[active]
  const source = findSource(dimension.sourceId)
  const median = medians[dimension.key]

  const chosen = [focus, ...peers.filter((slug) => slug !== focus)].map((slug) => bySlug[slug])
  const rows = chosen
    .map((item) => ({ ...item, indicator: item.indicators[active] }))
    .sort((a, b) => b.indicator.score - a.indicator.score)

  const subject = bySlug[focus]
  const subjectScore = subject.indicators[active].score
  const subjectPlace = rows.findIndex((row) => row.city.slug === focus) + 1
  const gap = Math.round((subjectScore - median) * 10) / 10
  const picks = themes[focus]

  const togglePeer = (slug: string) =>
    setPeers((current) => current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug].slice(-MAX_PEERS))

  return (
    <div className="explorer">
      <aside className="explorer-nav">
        <p className="explorer-nav-label">NAVIGATION</p>
        <ul>
          {DIMENSIONS.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={index === active ? 'is-active' : ''}
                onClick={() => setActive(index)}
                aria-current={index === active ? 'true' : undefined}
              >
                {index === active ? <i aria-hidden="true">•</i> : null}
                {item.labelKo} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="explorer-body">
        <div className="compare-picker">
          <label className="compare-picker-focus">
            <span className="mono">기준 도시</span>
            <select value={focus} onChange={(event) => setFocus(event.target.value)}>
              {comparisons.map(({ city }) => <option key={city.slug} value={city.slug}>{city.nameKo} {city.name}</option>)}
            </select>
          </label>
          <div className="compare-picker-peers" role="group" aria-label={`비교 도시 최대 ${MAX_PEERS}곳`}>
            <span className="mono">비교 도시 (최대 {MAX_PEERS})</span>
            <div>
              {comparisons.filter(({ city }) => city.slug !== focus).map(({ city }) => (
                <button
                  type="button"
                  key={city.slug}
                  className={peers.includes(city.slug) ? 'is-on' : ''}
                  aria-pressed={peers.includes(city.slug)}
                  onClick={() => togglePeer(city.slug)}
                >
                  {city.nameKo}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="explorer-head">
          <span className="explorer-index">{String(active + 1).padStart(2, '0')}</span>
          <h3>{dimension.labelKo} <em>{dimension.label}</em></h3>
        </div>

        <div className="explorer-cols">
          <div className="explorer-scope">
            <p className="explorer-scope-label">SCOPE OF WORK:</p>
            <ul>
              <li>{dimension.c3Subindex}</li>
              <li>{dimension.c3Dimension}</li>
              <li>가중치 {dimension.weight.toFixed(2)}</li>
              <li>{source ? `${source.author} ${source.year}` : '—'}</li>
            </ul>
          </div>

          <div className="explorer-text">
            <p className="explorer-question">{dimension.question}</p>
            <span className="explorer-rule" aria-hidden="true" />
            <p>{dimension.about}</p>
            <p>
              고른 {chosen.length}개 도시 가운데 {withTopic(subject.city.nameKo)} 이 차원에서 {subjectPlace}위입니다.
              점수는 {subjectScore.toFixed(1)}로 전체 {cityCount}개 도시 중앙값 {median.toFixed(1)}보다 {Math.abs(gap).toFixed(1)} {gap >= 0 ? '높습니다' : '낮습니다'}.
            </p>
          </div>
        </div>

        <div className="explorer-bars">
          <div className="explorer-bars-head"><DataBadge provenance="illustrative" sourceId={dimension.sourceId} /></div>
          {rows.map((row) => {
            const { city, indicator } = row
            return (
            <div className="explorer-bar" key={city.slug}>
              <span className="explorer-bar-name">{city.nameKo} <em>{city.name}</em></span>
              <span className="explorer-bar-track">
                <i style={{ '--score': `${indicator.score}%`, background: dimension.color } as CSSProperties} />
                <u style={{ '--median': `${median}%` } as CSSProperties} aria-hidden="true" />
              </span>
              <span className="explorer-bar-value">{indicator.score.toFixed(1)}<small>±{indicator.sensitivity.toFixed(1)}</small></span>
              <span className="explorer-bar-evidence">{evidence(dimension.key, row)}</span>
            </div>
            )
          })}
          <p className="explorer-bars-note">
            세로선은 전체 {cityCount}개 도시 중앙값 {median.toFixed(1)} · ±는 가중치를 10% 흔들었을 때의 폭 · 막대 아래 줄은 각 도시 기록(기관·행사·산업·관측 순위)
          </p>
        </div>

        {picks ? (
          <div className="theme-picks" aria-live="polite">
            <div className="theme-picks-head">
              <p className="eyebrow">RECOMMEND / {subject.city.name.toUpperCase()}</p>
              <h4>{withTopic(subject.city.nameKo)} 이런 브랜드 전시가 어울립니다</h4>
              <p>
                도시 기록(키워드·기관·행사·산업)과 주제 설명을 문장 임베딩으로 비교해, {cityCount}개 도시 가운데 이 도시가 상대적으로 더 가까운 주제를 골랐습니다.
                {picks.format ? ` 형식은 기회 모델에서 ${FORMAT_KO[picks.format.key]} 적합도가 100개 도시 중 ${picks.format.rank}위로 가장 높습니다.` : ' 이 도시는 세계 100위 표 밖이라 형식 적합도가 없습니다.'}
              </p>
            </div>
            <ol>
              {picks.themes.map((theme) => {
                const dim = DIMENSIONS.find((d) => d.key === theme.dimension)
                const clear = theme.z >= 0.5
                return (
                  <li key={theme.id} className={clear ? '' : 'is-weak'}>
                    <strong>{theme.labelKo}</strong>
                    <span className="theme-brands">브랜드 분야 · {theme.brandsKo.join(' · ')}</span>
                    <dl>
                      <div><dt>근거</dt><dd>{theme.matches.map((m) => `‘${m}’`).join(', ')}</dd></div>
                      <div><dt>도시 순위</dt><dd>{cityCount}개 도시 중 {theme.cityRank}위 (표준점수 {theme.z > 0 ? '+' : ''}{theme.z.toFixed(1)}){clear ? '' : ' · 뚜렷하지 않음'}</dd></div>
                      {dim ? (
                        <div>
                          <dt>볼 차원</dt>
                          <dd>
                            <button type="button" className="text-button" onClick={() => setActive(DIMENSIONS.indexOf(dim))}>{dim.labelKo} {dim.label}</button>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </li>
                )
              })}
            </ol>
            <p className="theme-picks-note">
              추천은 도시 기록 문장의 유사도만 씁니다. 6개 차원 점수는 예시값이라 추천 점수에 넣지 않았고, 공개 브랜드 전시 36건으로 확인했을 때 추천 순위가 높은 주제가 기대 대비 성과도 높지는 않았습니다(순위 상관 -0.22). 참고용으로 보세요.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
