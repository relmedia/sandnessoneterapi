export const CANONICAL_SITE_URL = 'https://sandnessoneterapi.no'

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

/** Production domain for links in transactional emails (always sandnessoneterapi.no). */
export function getEmailSiteUrl(): string {
  return CANONICAL_SITE_URL
}

export function getStudioUrl(): string {
  return `${getSiteUrl()}/studio`
}
