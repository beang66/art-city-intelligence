import Link from 'next/link'
import type { Route } from 'next'
import type { ReactNode } from 'react'

export function ActionLink<T extends string>({ href, children, variant = 'dark' }: { href: Route<T>; children: ReactNode; variant?: 'dark' | 'outline' }) {
  return <Link className={variant === 'dark' ? 'dark-button action-link' : 'outline-button action-link'} href={href}>{children}</Link>
}
