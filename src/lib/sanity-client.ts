import { createClient } from 'next-sanity'
import { sanityConfig } from './env'
import { getStudioUrl } from './site-url'

export const client = createClient({
  ...sanityConfig,
  useCdn: true,
  stega: {
    studioUrl: getStudioUrl(),
  },
})
