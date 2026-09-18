import type { ReactNode } from 'react'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="site-shell"><SiteHeader /><main>{children}</main><SiteFooter /></div>
}
