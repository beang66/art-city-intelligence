import { TREND_YEARS } from '@/features/city-intelligence/service'

/** Sparkline in a 100x40 viewBox, padded so the stroke never clips at the edges. */
function buildSparkline(values: readonly number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((value, i) => {
      const x = 2 + (i / (values.length - 1)) * 96
      const y = 36 - ((value - min) / range) * 32
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export function CityTrend({ trend, cityName, tall = false }: { trend: readonly number[]; cityName: string; tall?: boolean }) {
  const min = Math.min(...trend)
  const max = Math.max(...trend)
  const delta = trend[trend.length - 1] - trend[0]

  return (
    <div className="trend-body">
      <div className="trend-axis-title">
        <span>ART CITY INDEX</span>
        <b className={delta >= 0 ? 'is-up' : 'is-down'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</b>
      </div>
      <div className="trend-plot">
        <div className="trend-y-axis" aria-hidden="true">
          <span>{max.toFixed(1)}</span>
          <span>{min.toFixed(1)}</span>
        </div>
        <svg
          className={`trend-spark${tall ? ' is-tall' : ''}`}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${cityName} 지수 추이 ${TREND_YEARS[0]}년부터 ${TREND_YEARS[TREND_YEARS.length - 1]}년까지`}
        >
          <polyline points={buildSparkline(trend)} />
        </svg>
      </div>
      <div className="trend-x-axis" aria-hidden="true">
        {TREND_YEARS.map((year) => <span key={year}>{`'${String(year).slice(2)}`}</span>)}
      </div>
      <p className="trend-axis-note">가로축 5년 단위 · 세로축 인덱스(0–100)</p>
    </div>
  )
}
