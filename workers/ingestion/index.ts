export type IngestionJob = { sourceUrl: string; citySlug: string }
export async function ingest(job: IngestionJob) { return { ...job, state: 'queued' as const } }
