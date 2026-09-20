import { AdminSection } from '@/components/layout/AdminSection'
import { sources } from '@/features/evidence/sources'

const KIND_LABEL = { index: '지수', framework: '방법론', research: '연구', policy: '정책' } as const

export default function AdminValidationPage() {
  return (
    <AdminSection
      eyebrow="ADMIN / VALIDATION"
      title="Source register"
      description="모델이 인용하는 문헌과 각 문헌이 담당하는 역할입니다."
    >
      <div className="admin-row admin-row-sources table-head">
        <span>SOURCE</span><span>KIND</span><span>YEAR</span><span>ROLE</span>
      </div>
      {sources.map((source) => (
        <div className="admin-row admin-row-sources" key={source.id}>
          <strong>{source.title}<em>{source.author}</em></strong>
          <span>{KIND_LABEL[source.kind]}</span>
          <span>{source.year}</span>
          <span className="source-role">{source.use}</span>
        </div>
      ))}
    </AdminSection>
  )
}
