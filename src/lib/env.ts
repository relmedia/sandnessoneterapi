const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion: '2026-02-01' as const,
}

export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
}
