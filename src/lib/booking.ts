export const BOOKING_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
] as const

export type BookingTimeSlot = (typeof BOOKING_TIME_SLOTS)[number]

export const BOOKING_SERVICES = [
  { value: 'soneterapi', label: 'Soneterapi' },
  { value: 'oreakupunktur', label: 'Øreakupunktur' },
  { value: 'tankefeltterapi', label: 'Tankefeltterapi' },
] as const

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const PHONE_PATTERN = /^[\d\s+()-]{8,16}$/

export interface BookingPayload {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  message?: string
  website?: string
}

export function formatDateIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export function isBookableDate(date: Date, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 60)

  return candidate >= today && candidate <= maxDate && isWeekday(candidate)
}

export function getAvailableSlotsForDate(date: Date, bookedTimes: string[], now = new Date()): BookingTimeSlot[] {
  if (!isBookableDate(date, now)) return []

  const isToday = formatDateIso(date) === formatDateIso(now)
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  return BOOKING_TIME_SLOTS.filter((slot) => {
    if (bookedTimes.includes(slot)) return false
    if (!isToday) return true

    const [hour, minute] = slot.split(':').map(Number)
    return hour > currentHour || (hour === currentHour && minute > currentMinute)
  })
}

export function validateBookingPayload(data: unknown): { ok: true; value: BookingPayload } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Ugyldig forespørsel.' }
  }

  const payload = data as Record<string, unknown>

  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return { ok: false, error: 'Forespørselen ble avvist.' }
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''
  const service = typeof payload.service === 'string' ? payload.service.trim() : ''
  const date = typeof payload.date === 'string' ? payload.date.trim() : ''
  const time = typeof payload.time === 'string' ? payload.time.trim() : ''
  const message = typeof payload.message === 'string' ? payload.message.trim() : ''

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: 'Oppgi et gyldig navn.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Oppgi en gyldig e-postadresse.' }
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, error: 'Oppgi et gyldig telefonnummer.' }
  }

  if (!BOOKING_SERVICES.some((item) => item.value === service)) {
    return { ok: false, error: 'Velg en behandling.' }
  }

  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
    return { ok: false, error: 'Velg gyldig dato og klokkeslett.' }
  }

  if (!BOOKING_TIME_SLOTS.includes(time as BookingTimeSlot)) {
    return { ok: false, error: 'Ugyldig klokkeslett.' }
  }

  const parsedDate = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime()) || !isBookableDate(parsedDate)) {
    return { ok: false, error: 'Datoen er ikke tilgjengelig for booking.' }
  }

  if (message.length > 1000) {
    return { ok: false, error: 'Meldingen er for lang.' }
  }

  return {
    ok: true,
    value: { name, email, phone, service, date, time, message: message || undefined },
  }
}

const CANCEL_TOKEN_PATTERN = /^[a-f0-9-]{36}$/i

export interface CancelLookupPayload {
  email: string
  date: string
  phone: string
}

export function isValidCancelToken(token: string): boolean {
  return CANCEL_TOKEN_PATTERN.test(token)
}

export function validateCancelLookup(
  data: unknown
): { ok: true; value: CancelLookupPayload } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Ugyldig forespørsel.' }
  }

  const payload = data as Record<string, unknown>

  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return { ok: false, error: 'Forespørselen ble avvist.' }
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const date = typeof payload.date === 'string' ? payload.date.trim() : ''
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Oppgi en gyldig e-postadresse.' }
  }

  if (!DATE_PATTERN.test(date)) {
    return { ok: false, error: 'Oppgi en gyldig dato.' }
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, error: 'Oppgi et gyldig telefonnummer.' }
  }

  return { ok: true, value: { email, date, phone } }
}

export function canCancelBookingStatus(status: string | undefined): boolean {
  return status === 'pending' || status === 'confirmed'
}
