import { AdminSection } from '@/components/layout/AdminSection'

const indicators = ['Market', 'Institution', 'Production', 'Experiment', 'Participation', 'Influence']

export default function AdminIndicatorsPage() {
  return <AdminSection eyebrow="ADMIN / INDICATORS" title="Indicator model" description="차원별 정의, 가중치, 갱신 주기를 관리합니다."><div className="admin-row table-head"><span>INDICATOR</span><span>WEIGHT</span><span>REFRESH</span><span>STATE</span></div>{indicators.map((name, index) => <div className="admin-row" key={name}><strong>{name}</strong><span>{[18, 17, 16, 18, 14, 17][index]}%</span><span>QUARTERLY</span><span className="status">STABLE</span></div>)}</AdminSection>
}
