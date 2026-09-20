import type { City } from '@/types/city'

export function GlobeMarker({ city, selected, onSelect, onEnter, onLeave }: { city: City; selected: boolean; onSelect: () => void; onEnter: (element: HTMLButtonElement) => void; onLeave: () => void }) {
  return (
    <button
      className={`globe-marker${selected ? ' selected' : ''}`}
      type="button"
      data-city={city.slug}
      data-city-marker
      aria-label={`${city.name} 정보 열기`}
      onClick={(event) => { event.stopPropagation(); onSelect() }}
      onPointerEnter={(event) => onEnter(event.currentTarget)}
      onPointerLeave={onLeave}
    >
      <i /><span>{city.code}<b>{city.index.toFixed(1)}</b></span>
    </button>
  )
}
