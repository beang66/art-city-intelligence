import { AdminSection } from '@/components/layout/AdminSection'
import { citiesByName } from '@/features/city-intelligence/service'
import { getObservation } from '@/features/evidence/observed'

export default function AdminCitiesPage() {
  return (
    <AdminSection
      eyebrow="ADMIN / CITIES"
      title="City registry"
      description="도시별 관측 데이터 보유 상태입니다."
    >
      <div className="admin-row admin-row-cities table-head">
        <span>CITY</span><span>INDEX / ILLUSTRATIVE</span><span>OBSERVED RANK</span><span>REGION</span><span>STATE</span>
      </div>
      {citiesByName.map((city) => {
        const observation = getObservation(city.slug)
        const state = observation?.world ? 'WORLD + REGION' : observation?.regional ? 'REGION ONLY' : 'NO OBSERVATION'
        return (
          <div className="admin-row admin-row-cities" key={city.slug}>
            <strong>{city.name} <em>{city.nameKo}</em></strong>
            <span>{city.index.toFixed(1)}</span>
            <span>{observation?.world ? `#${observation.world.rank}` : '—'}</span>
            <span>{observation?.regional ? `${observation.regional.scope} #${observation.regional.rank}` : '—'}</span>
            <span className={`status${observation?.world ? '' : ' status-partial'}`}>{state}</span>
          </div>
        )
      })}
    </AdminSection>
  )
}
