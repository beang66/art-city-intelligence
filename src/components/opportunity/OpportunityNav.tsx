import Link from 'next/link'

// Opportunity(실행 전 기대)와 Outcomes(실행 후 성과)는 한 흐름이라 헤더 탭 하나 아래에 둡니다.
const LINKS = [
  { href: '/opportunity', label: '기회 찾기', sub: 'BEFORE' },
  { href: '/outcomes', label: '성과 기록', sub: 'AFTER' },
] as const

export function OpportunityNav({ current }: { current: (typeof LINKS)[number]['href'] }) {
  return (
    <nav className="segmented sub-nav" aria-label="기회와 성과">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={link.href === current ? 'selected' : undefined} aria-current={link.href === current ? 'page' : undefined}>
          <span className="mono">{link.sub}</span> {link.label}
        </Link>
      ))}
    </nav>
  )
}
