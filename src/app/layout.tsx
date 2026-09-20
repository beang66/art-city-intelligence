import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Art City Intelligence', template: '%s — Art City Intelligence' },
  description: '세계 도시의 예술 생태계를 비교하고 산업별 기회로 전환하는 근거 추적형 플랫폼',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f1f1ef' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko"><body><PageShell>{children}</PageShell></body></html>
}
