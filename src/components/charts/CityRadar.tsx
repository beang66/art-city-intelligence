import type { Indicator, IndicatorKey } from '@/types/indicator'

const VIEW = 200
const CENTER = VIEW / 2
const R_PLOT = 58
const R_DIAMOND = 68
const R_LABEL = 82
const RINGS = [0.25, 0.5, 0.75, 1]

export const AXIS_LABELS: Record<string, string> = {
  market: 'MKT',
  institution: 'INST',
  production: 'PROD',
  experiment: 'EXP',
  participation: 'PART',
  influence: 'INFL',
}

/** Six axes, starting at the top and stepping 60° clockwise. */
function point(axis: number, radius: number) {
  const angle = (Math.PI / 3) * axis - Math.PI / 2
  return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius }
}

function polygon(values: readonly number[]) {
  return values
    .map((value, axis) => {
      const { x, y } = point(axis, R_PLOT * Math.max(0, Math.min(1, value / 100)))
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function diamond(axis: number, half = 3.4) {
  const { x, y } = point(axis, R_DIAMOND)
  return `${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`
}

export function CityRadar({
  indicators,
  medians,
  size = 200,
  id = 'radar',
  showLabels = true,
}: {
  indicators: readonly Indicator[]
  /** Draws the cohort median as a second, underlying shape. */
  medians?: Record<IndicatorKey, number>
  size?: number
  id?: string
  showLabels?: boolean
}) {
  const cityValues = indicators.map((indicator) => indicator.score)
  const medianValues = medians ? indicators.map((indicator) => medians[indicator.key]) : null
  const fillId = `radar-fill-${id}`

  return (
    <svg
      className="city-radar"
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={size}
      height={size}
      role="img"
      aria-label={indicators.map((i) => `${i.labelKo} ${i.score}`).join(', ')}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.46" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <circle className="radar-bound" cx={CENTER} cy={CENTER} r={R_DIAMOND - 9} />
      {RINGS.map((ratio) => (
        <circle className="radar-ring" cx={CENTER} cy={CENTER} r={R_PLOT * ratio} key={ratio} />
      ))}

      {indicators.map((_, axis) => {
        const { x, y } = point(axis, R_PLOT)
        return <line className="radar-spoke" x1={CENTER} y1={CENTER} x2={x} y2={y} key={axis} />
      })}

      <polygon className="radar-city-shape" points={polygon(cityValues)} fill={`url(#${fillId})`} />
      {cityValues.map((value, axis) => {
        const { x, y } = point(axis, R_PLOT * Math.max(0, Math.min(1, value / 100)))
        return <circle className="radar-city-dot" cx={x} cy={y} r="3.2" fill={indicators[axis].color} key={axis} />
      })}

      {medianValues ? <polygon className="radar-median-shape" points={polygon(medianValues)} /> : null}

      {indicators.map((_, axis) => (
        <polygon className="radar-diamond" points={diamond(axis)} key={axis} />
      ))}

      {showLabels
        ? indicators.map((indicator, axis) => {
            const { x, y } = point(axis, R_LABEL)
            return (
              <text className="radar-axis-label" x={x} y={y} key={indicator.key} textAnchor="middle" dominantBaseline="middle">
                {AXIS_LABELS[indicator.key] ?? indicator.label.slice(0, 4).toUpperCase()}
              </text>
            )
          })
        : null}
    </svg>
  )
}
