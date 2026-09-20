'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section empty-state">
      <p className="eyebrow">SYSTEM / ERROR</p>
      <h1>We lost the<br /><span>signal.</span></h1>
      <p className="lede">화면을 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.</p>
      <div className="hero-actions"><button className="dark-button" type="button" onClick={reset}>TRY AGAIN <span className="arrow">↗</span></button></div>
    </section>
  )
}
