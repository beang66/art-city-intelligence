import type { Provenance } from '@/types/provenance'
import type { SourceId } from '@/features/evidence/sources'
import { findSource } from '@/features/evidence/sources'

const LABEL: Record<Provenance, string> = {
  observed: 'OBSERVED',
  illustrative: 'ILLUSTRATIVE',
}

/** Marks whether a number came from a published source or was generated for the demo. */
export function DataBadge({ provenance, sourceId }: { provenance: Provenance; sourceId?: SourceId }) {
  const source = sourceId ? findSource(sourceId) : undefined
  return (
    <span className={`data-badge data-badge-${provenance}`}>
      <i aria-hidden="true" />
      {LABEL[provenance]}
      {source ? <em>{source.author} {source.year}</em> : null}
    </span>
  )
}

/** Inline citation line for a block of numbers. */
export function SourceNote({ sourceId, prefix = 'SOURCE' }: { sourceId: SourceId; prefix?: string }) {
  const source = findSource(sourceId)
  if (!source) return null
  return (
    <p className="source-note">
      {prefix} / {source.author} ({source.year}). <span>{source.title}</span>. {source.publisher}
    </p>
  )
}
