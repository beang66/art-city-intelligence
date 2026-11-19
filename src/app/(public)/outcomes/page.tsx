import type { Metadata } from 'next'
import { OutcomeRecorder } from '@/components/outcomes/OutcomeRecorder'
import { FORMAT_ORDER } from '@/features/opportunity/service'
import { outcomeSummary, reportedVisitors } from '@/features/outcomes/service'

export const metadata: Metadata = { title: 'Outcomes', description: '브랜드 전시·팝업의 공개 방문객 기록을 도시·형식별 기대치와 비교합니다.' }

const FORMAT_LABEL = { popup: '팝업', temporary: '비상설 전시', permanent: '상설 전시' } as const

const STAGES = [
  { step: '01', name: '기대', question: '이 도시·형식이면 얼마나 올까', measure: '형식별 적합도 → 기대 수준', data: '공개', status: '구현' },
  { step: '02', name: '방문', question: '기대보다 얼마나 왔나', measure: '하루 방문객 ÷ 기대치 (같은 형식 사례 기준)', data: '공개 보도 · 브랜드', status: '이 화면' },
  { step: '03', name: '인지', question: '그 도시에서 더 알려졌나', measure: '검색량·SNS 언급의 대조 도시 대비 변화, 방문자/비방문자 조사', data: '공개 + 조사', status: '설계' },
  { step: '04', name: '매출', question: '실제로 더 팔렸나', measure: '대조 지역 대비 매출 차이, 쿠폰·QR 전환', data: '브랜드 내부', status: '파일럿 필요' },
]

export default function OutcomesPage() {
  const s = outcomeSummary
  const rows = [...s.cases].sort((a, b) => a.format.localeCompare(b.format) || b.perDay - a.perDay)
  return (
    <>
      <section className="section page-hero compact-hero">
        <div>
          <p className="eyebrow">01 / OUTCOMES — 성과 기록</p>
          <h1>Did it beat<br /><span>the city&apos;s baseline?</span></h1>
          <p className="lede">
            방문객 수가 많은 건 대개 큰 도시라서입니다. 그래서 전시·팝업 성과를 하루 방문객으로 맞춘 뒤,
            같은 형식의 공개 사례와 도시 적합도로 만든 기대치와 비교합니다. 기록이 쌓이면 형식별 가중치를 실제 성과로 다시 학습합니다.
          </p>
        </div>
        <div className="insight-strip">
          <article className="insight-cell dark"><span className="mono">CASES</span><strong>{s.total}</strong><p>관람객 수가 공개된 브랜드 전시·팝업</p></article>
          {FORMAT_ORDER.map((key) => (
            <article className="insight-cell" key={key}><span className="mono">{key.toUpperCase()}</span><strong>{s.casesByFormat[key]}</strong><p>{FORMAT_LABEL[key]} 사례</p></article>
          ))}
        </div>
      </section>

      <section className="section section-border" id="measurement">
        <div className="section-heading">
          <div><p className="eyebrow">02 / MEASUREMENT</p><h2>Four steps from<br /><span>city to sales.</span></h2></div>
          <p className="section-intro">도시 지표는 성과를 직접 예측하지 않고 도시 → 동네 → 브랜드·실행을 거쳐 이어집니다. 공개 데이터로 가능한 단계와 브랜드 데이터가 필요한 단계를 나눴습니다.</p>
        </div>
        <ol className="outcome-stages">
          {STAGES.map((stage) => (
            <li key={stage.step} className={stage.status === '이 화면' ? 'current' : ''}>
              <span className="mono">{stage.step} · {stage.status}</span>
              <strong>{stage.name}</strong>
              <p>{stage.question}</p>
              <small>{stage.measure}</small>
              <small>데이터: {stage.data}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-border" id="cases">
        <div className="section-heading">
          <div><p className="eyebrow">03 / PUBLIC CASES</p><h2>Visitors per day,<br /><span>against the format.</span></h2></div>
          <p className="section-intro">
            기대 하루 방문객 = 같은 형식 다른 사례의 하루 방문객 중앙값 × (이 도시 적합도 ÷ 그 사례들의 적합도 중앙값). 자기 자신은 기준에서 뺍니다.
            비교할 사례가 {s.minPeers}건 미만이면 기대치를 만들지 않습니다.
          </p>
        </div>
        <div className="outcome-table-wrap">
          <table className="outcome-table">
            <thead>
              <tr><th>브랜드 · 전시</th><th>도시 · 장소</th><th>형식</th><th className="num">기간</th><th className="num">방문객</th><th className="num">하루</th><th className="num">적합도 순위</th><th className="num">기대 대비</th><th>근거</th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.brand}</b><small>{c.title}</small></td>
                  <td>{c.city}<small>{c.venue}</small></td>
                  <td>{FORMAT_LABEL[c.format]}<small>{c.admission === 'free' ? '무료' : c.admission === 'paid' ? '유료' : ''}</small></td>
                  <td className="num">{c.days}일<small>{c.start.slice(0, 7)}</small></td>
                  <td className="num">{reportedVisitors(c)}</td>
                  <td className="num"><b>{c.perDay.toLocaleString()}</b></td>
                  <td className="num">{c.fitRank}위</td>
                  <td className="num">{c.ratio !== null ? <b className={c.ratio >= 1 ? 'up' : 'down'}>{c.ratio}배</b> : <span className="muted">사례 부족</span>}</td>
                  <td><a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.evidence}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="model-note">
          {s.signalOnly ? `공개 사례 ${s.total}건 — 20건 미만이라 상관과 기대 대비는 신호로만 읽습니다. ` : ''}
          근거 A = 장소·브랜드 그룹 발표, B = 보도. 보도된 숫자를 그대로 옮겼고 감사된 수치가 아닙니다. 기준일 {s.updatedAt}.
        </p>
      </section>

      <section className="section section-border" id="record">
        <div className="section-heading">
          <div><p className="eyebrow">04 / RECORD</p><h2>Log one,<br /><span>see where it lands.</span></h2></div>
          <p className="section-intro">우리 브랜드의 전시·팝업 한 건을 넣으면 하루 방문객으로 바꿔 같은 형식 사례 기준 기대치와 비교합니다. 형식별 10건 이상 모이면 형식 가중치를 실제 성과로 다시 학습합니다.</p>
        </div>
        <OutcomeRecorder cities={s.cityOptions} />
      </section>
    </>
  )
}
