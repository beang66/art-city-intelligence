import type { MarketSignal } from '@/types/market'

export function MarketSignalPanel({ signal }: { signal: MarketSignal }) {
  return (
    <article className="signal-card">
      <span>02 / MARKET SIGNAL</span>
      <dl>
        <div><dt>ARTISTS</dt><dd>{signal.artists.join(' · ')}</dd></div>
        <div><dt>PRICE RANGE</dt><dd>{signal.currency} {signal.priceRange} · {signal.status}</dd></div>
      </dl>
    </article>
  )
}
