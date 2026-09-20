'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { City } from '@/types/city'

export function SignatureWorkModal({ city, onClose }: { city: City; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const work = city.signatureWork

  useEffect(() => {
    closeRef.current?.focus()
    document.body.classList.add('no-scroll')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  return (
    <div className="work-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="work-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="work-modal-close" onClick={onClose} aria-label="닫기">×</button>

        <div className="work-modal-scroll">
          <div className="work-modal-top">
            <figure className="work-modal-figure">
              <Image src={work.image} alt={`${work.title} — ${work.artist}`} sizes="(max-width: 860px) 92vw, 46vw" placeholder="blur" />
            </figure>

            <div className="work-modal-detail">
              <p className="work-modal-kicker">{city.nameKo} {city.name} · SIGNATURE WORK</p>
              <h3 id="work-modal-title">{work.title}</h3>
              <p className="work-modal-original">{work.titleOriginal}, {work.year}</p>

              <p className="work-modal-note">{work.note}</p>

              <dl className="work-modal-facts">
                <div><dt>작가</dt><dd>{work.artist} <span>{work.artistOriginal}</span></dd></div>
                <div><dt>제작연도</dt><dd>{work.year}</dd></div>
                {work.priceUsd ? (
                  <>
                    <div><dt>낙찰가</dt><dd>{work.priceUsd}<span>{work.priceKrw}</span></dd></div>
                    <div><dt>경매</dt><dd>{work.auction}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>소장</dt><dd>{work.collection}<span>{work.collectionNote}</span></dd></div>
                    <div><dt>제작</dt><dd>{work.commission}</dd></div>
                  </>
                )}
              </dl>

              <p className="work-modal-state">DEMO DATA / INDICATIVE · {work.priceUsd ? '공인 경매 기준' : '미술관 소장 자료 기준'}</p>
            </div>
          </div>

          <div className="work-modal-essay">
            <section>
              <h4>작품의 의미</h4>
              <p>{work.meaning}</p>
            </section>
            <section>
              <h4>작가 의도</h4>
              <p>{work.intent}</p>
            </section>
            <section>
              <h4>도시와의 관계</h4>
              <p>{work.cityLink}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
