import type { MarketSignal } from '@/types/market'

export function MarketSignalPanel({ signal }: { signal: MarketSignal }) {
  return (
    <article className="signal-card">
      <span>02 / 시장 신호</span>
      <dl>
        <div><dt>주요 작가</dt><dd>{signal.artists.join(' · ')}</dd></div>
        <div><dt>거래 가격대</dt><dd>{signal.currency} {signal.priceRange}</dd></div>
      </dl>
    </article>
  )
}
