export const COOKIE_CONSENT_STORAGE_KEY = 'sandnessoneterapi-cookie-consent'
export const COOKIE_CONSENT_VERSION = '1'

export type CookieConsentValue = 'accepted' | 'essential'

export function hasCookieConsentChoice(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === COOKIE_CONSENT_VERSION
}

export function saveCookieConsent(value: CookieConsentValue): void {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION)
  localStorage.setItem(`${COOKIE_CONSENT_STORAGE_KEY}:choice`, value)
}
