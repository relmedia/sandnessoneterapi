'use client'

import { Analytics } from '@vercel/analytics/next'
import { useEffect, useState } from 'react'
import { allowsAnalytics, COOKIE_CONSENT_CHANGED_EVENT } from '@/lib/cookie-consent'

export function ConsentAwareAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    function sync() {
      setEnabled(allowsAnalytics())
    }

    sync()
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync)
  }, [])

  if (!enabled) return null

  return <Analytics />
}
