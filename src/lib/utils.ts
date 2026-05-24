const DEFAULT_PHONE = '45036557'

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 8) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
  }
  return phone
}

export function formatPhoneTel(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function getPhoneDisplay(phone?: string): string {
  return formatPhoneDisplay(phone ?? DEFAULT_PHONE)
}

export function getPhoneTel(phone?: string): string {
  return formatPhoneTel(phone ?? DEFAULT_PHONE)
}

export function formatDateNb(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateString).toLocaleDateString('nb-NO', options)
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
