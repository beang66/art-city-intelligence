import { AdminSection } from '@/components/layout/AdminSection'
import { cities } from '@/features/city-intelligence/service'

export default function AdminCitiesPage() {
  return <AdminSection eyebrow="ADMIN / CITIES" title="City registry" description="도시 기본 정보와 공개 상태를 관리하는 운영 화면입니다."><div className="admin-row table-head"><span>CITY</span><span>TYPE</span><span>INDEX</span><span>STATE</span></div>{cities.map((city) => <div className="admin-row" key={city.slug}><strong>{city.name}</strong><span>{city.type}</span><span>{city.index.toFixed(1)}</span><span className="status">PUBLISHED</span></div>)}</AdminSection>
}
