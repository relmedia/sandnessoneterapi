'use client'

import dynamic from 'next/dynamic'

const CookieConsent = dynamic(
  () => import('@/components/CookieConsent').then((mod) => mod.CookieConsent),
  { ssr: false }
)

const SanityLive = dynamic(
  () => import('@/lib/sanity-live').then((mod) => mod.SanityLive),
  { ssr: false }
)

interface SiteClientExtrasProps {
  showLive: boolean
}

export function SiteClientExtras({ showLive }: SiteClientExtrasProps) {
  return (
    <>
      <CookieConsent />
      {showLive && <SanityLive includeDrafts />}
    </>
  )
}
