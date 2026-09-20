import type { City } from '@/types/city'

export function GlobeTooltip({ city, x, y }: { city: City | null; x: number; y: number }) {
  return (
    <div className={`globe-tooltip${city ? ' is-visible' : ''}`} role="status" style={{ left: x, top: y }}>
      {city ? <><strong>{city.name}</strong><span>{city.type} · INDEX {city.index.toFixed(1)}</span></> : null}
    </div>
  )
}
