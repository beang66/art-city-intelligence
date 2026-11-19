'use client'

import { FormEvent, useState } from 'react'
import type { CSSProperties } from 'react'
import { FORMAT_ORDER, WEIGHT_LABELS } from '@/features/opportunity/service'
import type { FormatKey, ModelSummary, RankedCity } from '@/features/opportunity/service'

type Props = { top: Record<FormatKey, RankedCity[]>; summary: ModelSummary }

export function OpportunityExplorer({ top, summary }: Props) {
  const [format, setFormat] = useState<FormatKey>('popup')
  const spec = summary.formats[format]

  return (
    <div className="model-board">
      <div className="model-tabs" role="tablist" aria-label="공간 형식">
        {FORMAT_ORDER.map((key) => (
          <button key={key} type="button" role="tab" aria-selected={key === format} className={key === format ? 'active' : ''} onClick={() => setFormat(key)}>
            {summary.formats[key].label}
          </button>
        ))}
      </div>
      <div className="model-grid">
        <div className="model-panel">
          <h3>적합도 상위 15개 도시</h3>
          <ol className="model-ranking">
            {top[format].map((city) => (
              <li key={city.city}>
                <span className="mono">{String(city.rank).padStart(2, '0')}</span>
                <span>{city.city}<small>{city.country} · 세계 #{city.worldRank}</small></span>
                <i style={{ '--value': `${city.fit}%` } as CSSProperties} />
                <b>{city.fit.toFixed(1)}</b>
              </li>
            ))}
          </ol>
        </div>
        <div className="model-panel">
          <h3>이 형식에서 보는 것</h3>
          <p>{spec.why}</p>
          <ul className="model-weights">
            {Object.entries(spec.weights).map(([key, weight]) => (
              <li key={key}><span>{WEIGHT_LABELS[key] ?? key}</span><b>{Math.round(weight * 100)}%</b></li>
            ))}
          </ul>
          <p className="model-note">가중치는 형식별 성과 데이터가 쌓이기 전까지 설계 가정입니다. Streamlit 탐색기에서 바꿔 볼 수 있습니다.</p>
        </div>
      </div>
      <WhatIf regions={summary.regions} />
    </div>
  )
}

function WhatIf({ regions }: { regions: string[] }) {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; value?: number; message?: string }>({ status: 'idle' })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setState({ status: 'loading' })
    try {
      const response = await fetch('/api/opportunity/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livability: Number(form.get('livability')),
          prosperity: Number(form.get('prosperity')),
          population: Number(form.get('population')) * 1_000_000,
          region: String(form.get('region')),
        }),
      })
      const result = (await response.json()) as { data?: { predictedLovability: number }; error?: string }
      if (!response.ok || !result.data) throw new Error(result.error ?? '예측하지 못했습니다.')
      setState({ status: 'done', value: result.data.predictedLovability })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.' })
    }
  }

  return (
    <form className="model-panel model-whatif" onSubmit={submit}>
      <h3>What-if — 이 조건이면 문화 매력은 몇 위로 기대되나</h3>
      <div className="model-fields">
        <label>정주 여건 순위<input name="livability" type="number" min={1} max={300} defaultValue={50} required /></label>
        <label>경제 활력 순위<input name="prosperity" type="number" min={1} max={300} defaultValue={50} required /></label>
        <label>광역 인구 (백만 명)<input name="population" type="number" min={0.1} max={60} step={0.1} defaultValue={5} required /></label>
        <label>권역<select name="region" defaultValue="Asia-Pacific">{regions.map((region) => <option key={region}>{region}</option>)}</select></label>
        <button className="dark-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? '계산 중…' : '예측하기'}</button>
      </div>
      <p className="model-result" role="status" aria-live="polite">
        {state.status === 'done' && <>기대 Lovability <b>#{Math.round(state.value ?? 0)}</b> — 실제 순위가 이보다 좋으면 기회 점수가 양수입니다.</>}
        {state.status === 'error' && <>예측 서버에 연결하지 못했습니다: {state.message}</>}
      </p>
    </form>
  )
}
