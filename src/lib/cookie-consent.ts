export const COOKIE_CONSENT_STORAGE_KEY = 'sandnessoneterapi-cookie-consent'
export const COOKIE_CONSENT_VERSION = '1'
export const COOKIE_CONSENT_CHANGED_EVENT = 'sandnessoneterapi-cookie-consent-changed'

export type CookieConsentValue = 'accepted' | 'essential'

function choiceStorageKey(): string {
  return `${COOKIE_CONSENT_STORAGE_KEY}:choice`
}

export function hasCookieConsentChoice(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === COOKIE_CONSENT_VERSION
}

export function getCookieConsentChoice(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null
  if (!hasCookieConsentChoice()) return null

  const choice = localStorage.getItem(choiceStorageKey())
  if (choice === 'accepted' || choice === 'essential') return choice
  return null
}

export function allowsAnalytics(): boolean {
  return getCookieConsentChoice() === 'accepted'
}

export function saveCookieConsent(value: CookieConsentValue): void {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION)
  localStorage.setItem(choiceStorageKey(), value)
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }))
}
