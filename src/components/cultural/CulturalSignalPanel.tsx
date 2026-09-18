import type { CulturalSignal } from '@/types/cultural'

export function CulturalSignalPanel({ signal }: { signal: CulturalSignal }) {
  return (
    <article className="signal-card">
      <span>03 / CULTURAL SIGNAL</span>
      <dl>
        <div><dt>INSTITUTIONS</dt><dd>{signal.institutions.join(' · ')}</dd></div>
        <div><dt>EVENTS</dt><dd>{signal.events.join(' · ')}</dd></div>
        <div><dt>KEYWORDS</dt><dd>{signal.keywords.join(' · ')}</dd></div>
      </dl>
    </article>
  )
}
