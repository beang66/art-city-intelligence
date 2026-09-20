import type { CulturalSignal } from '@/types/cultural'

export function CulturalSignalPanel({ signal }: { signal: CulturalSignal }) {
  return (
    <article className="signal-card">
      <span>03 / 문화 신호</span>
      <dl>
        <div><dt>주요 기관</dt><dd>{signal.institutions.join(' · ')}</dd></div>
        <div><dt>주요 행사</dt><dd>{signal.events.join(' · ')}</dd></div>
        <div><dt>키워드</dt><dd>{signal.keywordsKo.join(' · ')}</dd></div>
      </dl>
    </article>
  )
}
