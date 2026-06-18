'use client'

import dynamic from 'next/dynamic'

const CookieConsent = dynamic(
  () => import('@/components/CookieConsent').then((mod) => mod.CookieConsent),
  { ssr: false }
)

const ConsentAwareAnalytics = dynamic(
  () => import('@/components/ConsentAwareAnalytics').then((mod) => mod.ConsentAwareAnalytics),
  { ssr: false }
)

export function SiteClientExtras() {
  return (
    <>
      <CookieConsent />
      <ConsentAwareAnalytics />
    </>
  )
}
