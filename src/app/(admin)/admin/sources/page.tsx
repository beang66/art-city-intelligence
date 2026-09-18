import { AdminSection } from '@/components/layout/AdminSection'

export default function AdminSourcesPage() {
  return <AdminSection eyebrow="ADMIN / SOURCES" title="Source ledger" description="수집 출처, 관측 시점, 사용 지표를 추적합니다."><div className="admin-row table-head"><span>SOURCE</span><span>CATEGORY</span><span>UPDATED</span><span>QUALITY</span></div>{[['Institution annual reports', 'CULTURAL', '09.16', 'HIGH'], ['Fair transaction samples', 'MARKET', '09.14', 'MEDIUM'], ['Public participation data', 'ACCESS', '09.11', 'MEDIUM'], ['Exhibition programme archive', 'EXPERIMENT', '09.08', 'HIGH']].map((row) => <div className="admin-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><span className="status">{row[3]}</span></div>)}</AdminSection>
}
