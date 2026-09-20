import type { Indicator, IndicatorKey } from '@/types/indicator'
import { findSource } from '@/features/evidence/sources'

/* ---------------- arc wheel ---------------- */

const W = 260
const H = 148
const CX = W / 2
const CY = 138
const R_IN = 62
const R_OUT = 112

function polar(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + Math.cos(a) * radius, y: CY + Math.sin(a) * radius }
}

/** Ring segment between two angles, drawn clockwise along the top half. */
function segmentPath(a1: number, a2: number) {
  const o1 = polar(a1, R_OUT)
  const o2 = polar(a2, R_OUT)
  const i2 = polar(a2, R_IN)
  const i1 = polar(a1, R_IN)
  return `M${o1.x.toFixed(1)},${o1.y.toFixed(1)} A${R_OUT},${R_OUT} 0 0 1 ${o2.x.toFixed(1)},${o2.y.toFixed(1)} L${i2.x.toFixed(1)},${i2.y.toFixed(1)} A${R_IN},${R_IN} 0 0 0 ${i1.x.toFixed(1)},${i1.y.toFixed(1)} Z`
}

function DimensionWheel({ indicators, leader }: { indicators: readonly Indicator[]; leader: Indicator }) {
  const span = 180 / indicators.length

  return (
    <svg className="wheel" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`가장 높은 차원 ${leader.labelKo}`}>
      <defs>
        <path id="wheel-arc" d={`M${CX - (R_OUT + 13)},${CY} A${R_OUT + 13},${R_OUT + 13} 0 0 1 ${CX + (R_OUT + 13)},${CY}`} fill="none" />
      </defs>

      <text className="wheel-caption">
        <textPath href="#wheel-arc" startOffset="50%" textAnchor="middle">SIX DIMENSIONS</textPath>
      </text>

      {indicators.map((indicator, i) => {
        const a1 = 180 + i * span
        const a2 = a1 + span
        const mid = a1 + span / 2
        const label = polar(mid, (R_IN + R_OUT) / 2)
        const isLeader = indicator.key === leader.key
        return (
          <g key={indicator.key}>
            <path className={`wheel-seg${isLeader ? ' is-leader' : ''}`} d={segmentPath(a1, a2)} />
            <text
              className={`wheel-label${isLeader ? ' is-leader' : ''}`}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${mid + 90} ${label.x} ${label.y})`}
            >
              {indicator.labelKo}
            </text>
          </g>
        )
      })}

      {(() => {
        const i = indicators.findIndex((item) => item.key === leader.key)
        const mid = 180 + i * span + span / 2
        const tip = polar(mid, R_IN - 2)
        const base = polar(mid, R_IN - 17)
        const left = polar(mid - 4.6, R_IN - 17)
        const right = polar(mid + 4.6, R_IN - 17)
        return <polygon className="wheel-pointer" points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y} ${base.x},${base.y}`} />
      })()}
    </svg>
  )
}

/* ---------------- board ---------------- */

const SUBINDEX_TIERS = [
  { name: 'Enabling Environment', weight: '20%', keys: ['influence'] as IndicatorKey[] },
  { name: 'Cultural Vibrancy', weight: '40%', keys: ['institution', 'participation'] as IndicatorKey[] },
  { name: 'Creative Economy', weight: '40%', keys: ['market', 'production', 'experiment'] as IndicatorKey[] },
]

/** Slider domain: deviation from the cohort median, in index points. */
const DEVIATION_RANGE = 12

export function CityDimensionBoard({
  indicators,
  medians,
  cityName,
}: {
  indicators: readonly Indicator[]
  medians: Record<IndicatorKey, number>
  cityName: string
}) {
  const byKey = new Map(indicators.map((indicator) => [indicator.key, indicator]))
  const leader = [...indicators].sort((a, b) => b.score - a.score)[0]

  const sourceNames = Array.from(
    new Set(indicators.map((indicator) => findSource(indicator.sourceId)).filter(Boolean).map((source) => `${source!.author.split(',')[0].split(' &')[0]} ${source!.year}`)),
  )

  return (
    <div className="dim-bento">
      <article className="bento bento-pyramid">
        <p className="bento-kicker">01 / 프레임 구조</p>
        <div className="pyramid">
          <div className="pyramid-shape" aria-hidden="true" />
          {SUBINDEX_TIERS.map((tier, index) => (
            <div className="pyramid-tier" key={tier.name} style={{ '--tier': index } as React.CSSProperties}>
              <span className="tier-label"><i />{tier.name}<b>{tier.weight}</b></span>
              <span className="tier-chips">
                {tier.keys.map((key) => <em key={key} style={{ borderColor: byKey.get(key)?.color }}>{byKey.get(key)?.labelKo}</em>)}
              </span>
            </div>
          ))}
        </div>
        <p className="bento-note">6개 차원은 EU 문화·창조도시 모니터의 세 서브인덱스 아래 배치됩니다. 괄호 안 수치는 원 지표 체계의 가중치입니다.</p>
      </article>

      <article className="bento bento-wheel">
        <p className="bento-kicker">02 / 가장 높은 차원</p>
        <DimensionWheel indicators={indicators} leader={leader} />
        <div className="wheel-readout">
          <strong>{leader.labelKo}</strong>
          <span>{leader.score.toFixed(1)}</span>
        </div>
        <p className="bento-note">{cityName}에서 값이 가장 높은 차원입니다. 흰 구간이 해당 차원, 주황 표식이 그 위치를 가리킵니다.</p>
      </article>

      <article className="bento bento-sliders">
        <p className="bento-kicker">03 / 중앙값 대비 위치</p>
        <div className="slider-list">
          {indicators.map((indicator) => {
            const gap = indicator.score - medians[indicator.key]
            const clamped = Math.max(-DEVIATION_RANGE, Math.min(DEVIATION_RANGE, gap))
            const pct = 50 + (clamped / DEVIATION_RANGE) * 50
            return (
              <div className="slider-row" key={indicator.key}>
                <span className="slider-left">{indicator.labelKo} <em>{indicator.label}</em></span>
                <span className="slider-track">
                  <i className="slider-center" aria-hidden="true" />
                  <b className="slider-dot" style={{ left: `${pct}%`, background: indicator.color }} />
                </span>
                <span className="slider-right">
                  <b>{indicator.score.toFixed(1)}</b>
                  <em className={gap >= 0 ? 'is-up' : 'is-down'}>{gap >= 0 ? '+' : ''}{gap.toFixed(1)}</em>
                </span>
              </div>
            )
          })}
        </div>
        <p className="bento-note">점선이 {indicators.length}개 차원 각각의 전체 도시 중앙값입니다. 점이 오른쪽에 있을수록 중앙값을 웃돕니다.</p>
      </article>

      <article className="bento bento-tags">
        <p className="bento-kicker">04 / 차원의 근거</p>
        <div className="tag-cluster">
          {sourceNames.map((name) => <span className="tag-pill" key={name}>{name}</span>)}
        </div>
        <p className="bento-note">각 차원의 정의는 위 문헌에서 가져왔습니다.</p>
      </article>
    </div>
  )
}
