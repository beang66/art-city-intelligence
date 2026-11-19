'use client'

import { FormEvent, useState } from 'react'
import { FORMAT_ORDER } from '@/features/opportunity/service'
import type { FormatKey } from '@/features/opportunity/service'

type Result = {
  city: string
  format: FormatKey
  days: number
  perDay: number
  perDayPerM2: number | null
  fit: number
  fitRank: number
  expectedPerDay: number | null
  peers: number
  ratio: number | null
}

const FORMAT_LABEL: Record<FormatKey, string> = { popup: '팝업', temporary: '비상설 전시', permanent: '상설 전시' }
const CSV_HEADER = 'brand,title,format,theme,city,venue,start,end,visitors,qualifier,admission,area_m2,evidence,source_title,source_url'

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// shortcut: nothing is stored server-side; records live in the CSV the user keeps. Add a table (and auth) once
// several people log cases (roadmap G1 → G2).
export function OutcomeRecorder({ cities, themes }: { cities: string[]; themes: { id: string; labelKo: string }[] }) {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; result?: Result; csv?: string; message?: string }>({ status: 'idle' })
  const [copied, setCopied] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const get = (key: string) => String(form.get(key) ?? '').trim()
    const area = get('areaM2')
    setState({ status: 'loading' })
    setCopied(false)
    try {
      const response = await fetch('/api/outcomes/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: get('city'), format: get('format'), start: get('start'), end: get('end'),
          visitors: Number(get('visitors')), areaM2: area ? Number(area) : null,
        }),
      })
      const body = (await response.json()) as { data?: Result; error?: string }
      if (!response.ok || !body.data) throw new Error(body.error ?? '계산하지 못했습니다.')
      const csv = [get('brand'), get('title'), get('format'), get('theme'), get('city'), get('venue'), get('start'), get('end'), get('visitors'),
        'exact', '', area, '', '', ''].map(csvCell).join(',')
      setState({ status: 'done', result: body.data, csv })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.' })
    }
  }

  const copy = async () => {
    if (!state.csv) return
    try {
      await navigator.clipboard.writeText(`${CSV_HEADER}\n${state.csv}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const r = state.result
  return (
    <form className="model-panel outcome-form" onSubmit={submit}>
      <h3>한 건 기록하고 기대와 비교하기</h3>
      <div className="model-fields">
        <label>브랜드<input name="brand" required maxLength={80} placeholder="예: 우리 브랜드" /></label>
        <label>전시·팝업 이름<input name="title" maxLength={120} /></label>
        <label>형식<select name="format" defaultValue="popup">{FORMAT_ORDER.map((key) => <option key={key} value={key}>{FORMAT_LABEL[key]}</option>)}</select></label>
        <label>주제<select name="theme" defaultValue={themes[0]?.id}>{themes.map((t) => <option key={t.id} value={t.id}>{t.labelKo}</option>)}</select></label>
        <label>도시<select name="city" defaultValue="Seoul">{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label>장소·동네<input name="venue" maxLength={120} placeholder="예: 성수" /></label>
        <label>시작일<input name="start" type="date" required /></label>
        <label>종료일<input name="end" type="date" required /></label>
        <label>총 방문객<input name="visitors" type="number" min={1} max={50000000} required /></label>
        <label>면적 (㎡, 선택)<input name="areaM2" type="number" min={1} max={100000} /></label>
        <button className="dark-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? '계산 중…' : '비교하기'}</button>
      </div>
      <div className="model-result" role="status" aria-live="polite">
        {state.status === 'done' && r && (
          <div className="outcome-result">
            <p>
              하루 <b>{r.perDay.toLocaleString()}명</b>{r.perDayPerM2 !== null && <> · ㎡당 하루 <b>{r.perDayPerM2}</b>명</>} · {r.days}일 ·
              {' '}{r.city} {FORMAT_LABEL[r.format]} 적합도 <b>{r.fit.toFixed(1)}</b> ({r.fitRank}위)
            </p>
            <p>
              {r.expectedPerDay !== null
                ? <>같은 형식 공개 사례 {r.peers}건 기준 기대 하루 <b>{r.expectedPerDay.toLocaleString()}명</b> → <b className={r.ratio !== null && r.ratio >= 1 ? 'up' : 'down'}>기대의 {r.ratio}배</b></>
                : <>같은 형식 공개 사례가 {r.peers}건뿐이라 기대치를 아직 만들지 않습니다.</>}
            </p>
            <button type="button" className="outline-button" onClick={copy}>{copied ? '복사했습니다' : '기록 양식 CSV 한 줄 복사'}</button>
          </div>
        )}
        {state.status === 'error' && <p>계산하지 못했습니다: {state.message}</p>}
      </div>
      <p className="model-note">
        입력값은 저장하지 않습니다. 복사한 줄을 <a href="/templates/exhibition_outcome_template.csv" download>기록 양식</a>에 붙여 쌓아 두세요.
        기대 대비는 &lsquo;전시 때문에 늘었다&rsquo;는 뜻이 아니며, 인과는 대조 도시를 둔 비교로만 말합니다.
      </p>
    </form>
  )
}
