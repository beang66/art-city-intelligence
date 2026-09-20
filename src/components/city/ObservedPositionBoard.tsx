import type { City } from '@/types/city'
import { getObservation, type PillarRanks } from '@/features/evidence/observed'
import { findSource } from '@/features/evidence/sources'
import { pillarLabel } from '@/features/evidence/describe'

/** Rank 1 reads as a full bar, rank 100 as a stub. Lower rank = stronger. */
function strength(rank: number) {
  return Math.max(10, Math.min(100, 100 - (rank - 1) * 0.9))
}

/** Vertical position of a step, kept inside the plot so its label never clips. */
function stepTop(rank: number) {
  return 20 + (100 - strength(rank)) * 0.58
}

export function ObservedPositionBoard({ city }: { city: City }) {
  const observation = getObservation(city.slug)

  if (!observation?.world) {
    const source = observation?.regional ? findSource(observation.regional.sourceId) : undefined
    return (
      <div className="obs-board obs-board-partial">
        <div className="obs-partial">
          <p className="obs-eyebrow">{observation?.regional?.scope ?? 'REGION'}</p>
          <strong className="obs-figure">#{observation?.regional?.rank ?? '—'}</strong>
          <span className="obs-bar-solid" style={{ width: `${observation?.regional ? strength(observation.regional.rank) : 10}%` }} />
        </div>
        <p className="obs-note">{observation?.worldNote ?? '수집된 발행 순위가 없습니다.'}</p>
        {source ? <p className="obs-source">{source.author} {source.year} · {source.title}</p> : null}
      </div>
    )
  }

  const { rank, pillars, sourceId } = observation.world
  const source = findSource(sourceId)

  const entries = (Object.keys(pillars) as (keyof PillarRanks)[])
    .map((key) => ({ key, rank: pillars[key] }))
    .sort((a, b) => a.rank - b.rank)

  const best = entries[0]
  const worst = entries[entries.length - 1]
  const spread = worst.rank - best.rank

  return (
    <div className="obs-board">
      <section className="obs-contrast">
        <div className="obs-top">
          <p className="obs-eyebrow">가장 앞선 축 — {pillarLabel(best.key)}</p>
          <strong className="obs-figure">#{best.rank}</strong>
        </div>

        <span className="obs-bar-solid" style={{ width: `${strength(best.rank)}%` }} />
        <span className="obs-bar-hatch" style={{ width: `${strength(worst.rank)}%` }} />

        <div className="obs-bottom">
          <p className="obs-eyebrow">가장 뒤처진 축 — {pillarLabel(worst.key)}</p>
          <strong className="obs-figure">#{worst.rank}</strong>
        </div>

        <p className="obs-note">
          세 축의 격차는 {spread}단계입니다. 주황 막대가 가장 강한 축, 빗금 막대가 가장 약한 축의 상대적 위치입니다.
        </p>
      </section>

      <section className="obs-steps">
        <div className="obs-steps-grid">
          {entries.map((entry, index) => (
            <div className="obs-step" key={entry.key}>
              <span className="obs-step-rule" aria-hidden="true" />
              <span className="obs-step-index">{index + 1}</span>
              <div className="obs-step-group" style={{ top: `${stepTop(entry.rank)}%` }}>
                <span className="obs-step-bar" />
                <span className="obs-step-label">
                  {pillarLabel(entry.key)}
                  <em>#{entry.rank}</em>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="obs-steps-foot">
          <span>WORLD #{rank}</span>
          {observation.regional ? <span>{observation.regional.scope.toUpperCase()} #{observation.regional.rank}</span> : null}
        </div>
        {source ? <p className="obs-source">{source.author} {source.year} · 순위는 낮을수록 상위</p> : null}
      </section>
    </div>
  )
}
