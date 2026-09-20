import { AdminSection } from '@/components/layout/AdminSection'

export default function AdminValidationPage() {
  return <AdminSection eyebrow="ADMIN / VALIDATION" title="Review queue" description="새 데이터와 모델 변경을 공개 전에 검토합니다."><div className="admin-row table-head"><span>ITEM</span><span>CITY</span><span>OWNER</span><span>STATE</span></div>{[['2026 fair sales range', 'Seoul', 'MARKET TEAM', 'REVIEW'], ['Participation series', 'Berlin', 'DATA TEAM', 'READY'], ['Institution opening', 'Amsterdam', 'EDITORIAL', 'REVIEW'], ['Weight sensitivity', 'London', 'MODEL TEAM', 'STABLE']].map((row) => <div className="admin-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><span className="status">{row[3]}</span></div>)}</AdminSection>
}
