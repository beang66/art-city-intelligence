import { ActionLink } from '@/components/ui/ActionLink'

export default function NotFound() {
  return (
    <section className="section empty-state">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>City signal<br /><span>not found.</span></h1>
      <p className="lede">요청한 페이지나 도시 데이터를 찾을 수 없습니다.</p>
      <div className="hero-actions"><ActionLink href="/overview">RETURN TO OVERVIEW <span className="arrow">↗</span></ActionLink></div>
    </section>
  )
}
