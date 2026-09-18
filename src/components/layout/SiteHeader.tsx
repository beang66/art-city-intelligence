'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/overview', match: ['/overview', '/'] },
  { label: 'Cities', href: '/cities/seoul', match: ['/cities'] },
  { label: 'Compare', href: '/compare', match: ['/compare'] },
  { label: 'Methodology', href: '/methodology', match: ['/methodology'] },
  { label: 'Admin', href: '/admin/cities', match: ['/admin'] },
] as const

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="topbar">
      <Link className="brand" href="/overview" aria-label="Art City Intelligence 홈">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>ART CITY<br /><em>INTELLIGENCE</em></span>
      </Link>
      <nav className="category-tabs" aria-label="주요 페이지">
        {tabs.map((tab) => {
          const active = tab.match.some((prefix) => prefix === '/' ? pathname === '/' : pathname.startsWith(prefix))
          return (
            <Link className={`tab${active ? ' active' : ''}`} href={tab.href} aria-current={active ? 'page' : undefined} key={tab.href}>
              {tab.label}
            </Link>
          )
        })}
      </nav>
      <div className="top-actions">
        <button className="icon-button" type="button" aria-label="언어 변경">◎ KR</button>
        <Link className="accent-button header-action-link" href="/cities/seoul"><span className="dot" />NEW ANALYSIS</Link>
      </div>
    </header>
  )
}
