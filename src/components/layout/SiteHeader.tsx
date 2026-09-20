'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FormEvent, PointerEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'

const tabs = [
  { label: 'Overview', href: '/overview', match: ['/overview', '/'] },
  { label: 'Cities', href: '/cities/seoul', match: ['/cities'] },
  { label: 'Compare', href: '/compare', match: ['/compare'] },
  { label: 'Methodology', href: '/methodology', match: ['/methodology'] },
  { label: 'Admin', href: '/admin/cities', match: ['/admin'] },
] as const

type FieldName = 'name' | 'phone' | 'email'
type SubmitState = 'idle' | 'sending' | 'success' | 'error'

const fieldLabels: Record<FieldName, string> = {
  name: '이름',
  phone: '연락처',
  email: '이메일',
}

export function SiteHeader() {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [invalidFields, setInvalidFields] = useState<FieldName[]>([])
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [tabCursor, setTabCursor] = useState({ x: 0, width: 0, index: 0 })

  const activeTabIndex = tabs.findIndex((tab) =>
    tab.match.some((prefix) => prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)),
  )

  const placeCursorOnTab = (tab: HTMLElement | null) => {
    if (!tab) return
    const index = Number(tab.dataset.index ?? 0)
    setTabCursor({ x: tab.offsetLeft, width: tab.offsetWidth, index })
  }

  useLayoutEffect(() => {
    const nav = tabsRef.current
    const activeTab = nav?.querySelector<HTMLElement>('.tab.active') ?? null
    placeCursorOnTab(activeTab)
  }, [activeTabIndex])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen)
    if (isOpen) requestAnimationFrame(() => dialogRef.current?.focus())
    return () => document.body.classList.remove('no-scroll')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  useEffect(() => {
    if (!isLanguageOpen) return
    const closeLanguageMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      if (event instanceof MouseEvent && languageRef.current?.contains(event.target as Node)) return
      setIsLanguageOpen(false)
    }
    document.addEventListener('mousedown', closeLanguageMenu)
    document.addEventListener('keydown', closeLanguageMenu)
    return () => {
      document.removeEventListener('mousedown', closeLanguageMenu)
      document.removeEventListener('keydown', closeLanguageMenu)
    }
  }, [isLanguageOpen])

  const moveTabCursor = (event: PointerEvent<HTMLElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>('.tab')
    placeCursorOnTab(target)
  }

  const restoreActiveTab = () => {
    const activeTab = tabsRef.current?.querySelector<HTMLElement>('.tab.active') ?? null
    placeCursorOnTab(activeTab)
  }

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const missing = (['name', 'phone', 'email'] as FieldName[]).filter((field) => !String(data.get(field) ?? '').trim())

    if (missing.length) {
      setInvalidFields(missing)
      setSubmitState('error')
      setSubmitMessage(`${missing.map((field) => fieldLabels[field]).join(', ')} 항목을 입력해 주세요.`)
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus()
      return
    }

    setInvalidFields([])
    setSubmitState('sending')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      })
      const result = (await response.json()) as { message?: string; fields?: FieldName[] }
      if (!response.ok) {
        setInvalidFields(result.fields ?? [])
        throw new Error(result.message ?? '메시지를 보내지 못했습니다.')
      }
      form.reset()
      setSubmitState('success')
      setSubmitMessage('메시지를 보냈습니다. 곧 연락드리겠습니다.')
    } catch (error) {
      setSubmitState('error')
      setSubmitMessage(error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/overview" aria-label="Art City Intelligence 홈">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>ART CITY<br /><em>INTELLIGENCE</em></span>
        </Link>
        <nav
          className="category-tabs"
          aria-label="주요 페이지"
          ref={tabsRef}
          onPointerMove={moveTabCursor}
          onPointerLeave={restoreActiveTab}
        >
          <span className="tab-cursor" style={{ transform: `translateX(${tabCursor.x}px)`, width: tabCursor.width }} aria-hidden="true" />
          {tabs.map((tab, index) => {
            const active = tab.match.some((prefix) => prefix === '/' ? pathname === '/' : pathname.startsWith(prefix))
            return (
              <Link className={`tab${active ? ' active' : ''}${tabCursor.index === index ? ' cursor-active' : ''}`} data-index={index} href={tab.href} aria-current={active ? 'page' : undefined} key={tab.href}>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="top-actions">
          <div className={`language-picker${isLanguageOpen ? ' is-open' : ''}`} ref={languageRef}>
            <button className="language-button" type="button" aria-label="언어 선택" aria-haspopup="menu" aria-expanded={isLanguageOpen} onClick={() => setIsLanguageOpen((open) => !open)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18" />
              </svg>
              <span className="language-chevron" aria-hidden="true" />
            </button>
            <div className="language-menu" role="menu" aria-label="언어 목록">
              <button type="button" role="menuitem" onClick={() => setIsLanguageOpen(false)}>EN</button>
              <button type="button" role="menuitem" className="selected" onClick={() => setIsLanguageOpen(false)}>KR</button>
            </div>
          </div>
          <button className="accent-button how-start-button" type="button" onClick={() => setIsOpen(true)}>
            <span>HOW TO START?</span>
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="contact-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}>
          <div className="contact-panel" role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} ref={dialogRef}>
            <button className="contact-close" type="button" onClick={() => setIsOpen(false)} aria-label="문의 창 닫기">×</button>
            <div className="contact-intro">
              <div>
                <p className="contact-kicker">ART CITY INTELLIGENCE · CONTACT</p>
                <h2 id="contact-title">어디서부터<br />시작할지 모르시겠나요?</h2>
                <p>새로운 분석을 어떻게 준비해야 할지 고민 중이신가요?</p>
                <p>필요한 데이터와 분석 과정, 다음 단계까지 함께 설계해 드립니다.</p>
              </div>
              <ol className="contact-steps">
                <li>아래 항목을 모두 작성해 주세요.</li>
                <li>확인 후 온라인 미팅 일정을 안내드립니다.</li>
                <li>목표와 질문을 듣고 적합한 분석 방향을 논의합니다.</li>
                <li>실제 사례를 바탕으로 전체 진행 과정을 설명드립니다.</li>
              </ol>
            </div>

            <form className="contact-form" onSubmit={submitContact} noValidate>
              <div className={`contact-field${invalidFields.includes('name') ? ' is-invalid' : ''}`}>
                <label htmlFor="contact-name">이름</label>
                <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="홍길동" aria-invalid={invalidFields.includes('name')} onChange={() => setInvalidFields((fields) => fields.filter((field) => field !== 'name'))} />
                <span>이름을 입력해 주세요.</span>
              </div>
              <div className={`contact-field${invalidFields.includes('phone') ? ' is-invalid' : ''}`}>
                <label htmlFor="contact-phone">연락처</label>
                <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="010-1234-5678" aria-invalid={invalidFields.includes('phone')} onChange={() => setInvalidFields((fields) => fields.filter((field) => field !== 'phone'))} />
                <span>연락처를 입력해 주세요.</span>
              </div>
              <div className={`contact-field${invalidFields.includes('email') ? ' is-invalid' : ''}`}>
                <label htmlFor="contact-email">이메일</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="name@domain.com" aria-invalid={invalidFields.includes('email')} onChange={() => setInvalidFields((fields) => fields.filter((field) => field !== 'email'))} />
                <span>올바른 이메일을 입력해 주세요.</span>
              </div>
              <input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="contact-form-footer">
                <p>전송 버튼을 누르면 문의 내용 처리 및 회신을 위한<br />개인정보 수집에 동의하게 됩니다.</p>
                <button className="contact-submit" type="submit" disabled={submitState === 'sending'}>
                  <span>{submitState === 'sending' ? '보내는 중...' : '메시지 보내기'}</span><i aria-hidden="true">→</i>
                </button>
              </div>
              <p className={`contact-feedback ${submitState}`} role="status" aria-live="polite">{submitMessage}</p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
