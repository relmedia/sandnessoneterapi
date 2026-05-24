import 'server-only'

import { createClient } from 'next-sanity'
import { sanityConfig } from './env'

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!token) {
    return null
  }

  return createClient({
    ...sanityConfig,
    token,
    useCdn: false,
  })
}
