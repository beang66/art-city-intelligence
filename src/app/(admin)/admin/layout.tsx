import Link from 'next/link'
import type { ReactNode } from 'react'

const adminTabs = [
  ['/admin/cities', 'Cities'],
  ['/admin/indicators', 'Indicators'],
  ['/admin/sources', 'Sources'],
  ['/admin/validation', 'Validation'],
] as const

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-nav"><span className="eyebrow">DATA OPERATIONS</span>{adminTabs.map(([href, label]) => <Link href={href} key={href}>{label}<span>↗</span></Link>)}</aside>
      {children}
    </div>
  )
}
