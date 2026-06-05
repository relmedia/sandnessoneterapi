'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  saveCookieConsent,
} from '@/lib/cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    setVisible(stored !== COOKIE_CONSENT_VERSION)
  }, [])

  function acceptAll() {
    saveCookieConsent('accepted')
    setVisible(false)
  }

  function acceptEssential() {
    saveCookieConsent('essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone/10 bg-stone/95 p-4 shadow-lg backdrop-blur-sm sm:p-6"
    >
      <div className="container-wide section-padding mx-auto flex max-w-5xl flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="min-w-0 flex-1">
          <p
            id="cookie-consent-title"
            className="mb-1 font-sans text-sm font-medium tracking-wide text-cream sm:mb-2"
          >
            Informasjonskapsler
          </p>
          <p
            id="cookie-consent-description"
            className="font-sans text-xs font-light leading-relaxed text-cream/75 sm:text-sm"
          >
            Vi bruker nødvendige informasjonskapsler for at nettsiden skal fungere, for eksempel ved
            timebestilling og betaling. Valgfrie tjenester som sikkerhetskontroll (Turnstile) kan
            sette egne cookies. Les mer i{' '}
            <Link href="/personvern" className="text-cream underline underline-offset-2">
              personvernerklæringen
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-2">
          <button
            type="button"
            onClick={acceptEssential}
            className="rounded-full border border-cream/25 px-3 py-2 font-sans text-xs font-light whitespace-nowrap text-cream/90 transition-colors hover:border-cream/50 hover:text-cream sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Kun nødvendige
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-cream px-3 py-2 font-sans text-xs font-light whitespace-nowrap text-stone transition-colors hover:bg-warm-light sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Godta alle
          </button>
        </div>
      </div>
    </div>
  )
}
