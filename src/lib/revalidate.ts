/** Cache tag for on-demand revalidation via /api/revalidate webhook */
export const SANITY_CACHE_TAG = 'sanity'

/** Used by Sanity fetch options — 0 in dev bypasses cache entirely */
export const REVALIDATE_SECONDS = process.env.NODE_ENV === 'development' ? 0 : 3600
