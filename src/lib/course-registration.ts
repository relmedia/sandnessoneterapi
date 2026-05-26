import type { Course, CourseSession } from '@/lib/types'

export const DEFAULT_SESSION_CAPACITY = 12

export const ACTIVE_REGISTRATION_STATUSES = ['confirmed', 'pending_payment'] as const

export type CourseRegistrationStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'waitlist'
  | 'cancelled'
  | 'refunded'

export interface CourseRegistrationPayload {
  sessionKey: string
  name: string
  lastName: string
  email: string
  phone: string
  message?: string
  website?: string
  turnstileToken?: string
}

export interface CourseSessionAvailability {
  sessionKey: string
  session: CourseSession
  label: string
  capacity: number
  confirmedCount: number
  pendingCount: number
  waitlistCount: number
  spotsLeft: number
  isFull: boolean
  isWaitlistOnly: boolean
}

export interface CourseRegistrationRecord {
  _id: string
  status: CourseRegistrationStatus
  sessionKey: string
  sessionDate: string
  sessionEndDate?: string
  sessionStartTime?: string
  sessionEndTime?: string
  courseTitle?: string
  name: string
  lastName: string
  email: string
  phone: string
  message?: string
  cancelToken?: string
  waitlistPosition?: number
  vippsPaymentReference?: string
  vippsPspReference?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s+()-]{8,16}$/

export function getSessionCapacity(session: CourseSession): number {
  if (typeof session.capacity === 'number' && session.capacity > 0) {
    return session.capacity
  }
  return DEFAULT_SESSION_CAPACITY
}

export function getSessionKey(session: CourseSession, index: number): string {
  return session._key ?? `${session.date}-${index}`
}

export function findCourseSession(
  course: Course,
  sessionKey: string
): { session: CourseSession; index: number } | null {
  const sessions = course.sessions ?? []
  for (let index = 0; index < sessions.length; index += 1) {
    const session = sessions[index]
    if (getSessionKey(session, index) === sessionKey) {
      return { session, index }
    }
  }
  return null
}

export function validateCourseRegistrationPayload(
  body: unknown
): { ok: true; value: CourseRegistrationPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Ugyldig forespørsel.' }
  }

  const input = body as Record<string, unknown>

  if (typeof input.website === 'string' && input.website.trim()) {
    return { ok: false, error: 'Kunne ikke sende skjemaet.' }
  }

  const sessionKey = typeof input.sessionKey === 'string' ? input.sessionKey.trim() : ''
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const lastName = typeof input.lastName === 'string' ? input.lastName.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : undefined
  const turnstileToken =
    typeof input.turnstileToken === 'string' ? input.turnstileToken.trim() : undefined

  if (!sessionKey) return { ok: false, error: 'Velg en kursdato.' }
  if (!name) return { ok: false, error: 'Fornavn er påkrevd.' }
  if (!lastName) return { ok: false, error: 'Etternavn er påkrevd.' }
  if (!email || !EMAIL_PATTERN.test(email)) return { ok: false, error: 'Ugyldig e-postadresse.' }
  if (!phone || !PHONE_PATTERN.test(phone)) return { ok: false, error: 'Ugyldig telefonnummer.' }

  return {
    ok: true,
    value: {
      sessionKey,
      name,
      lastName,
      email,
      phone,
      message: message || undefined,
      turnstileToken: turnstileToken || undefined,
    },
  }
}

export function buildSessionAvailability(
  course: Course,
  session: CourseSession,
  index: number,
  label: string,
  counts: { confirmed: number; pending: number; waitlist: number }
): CourseSessionAvailability {
  const capacity = getSessionCapacity(session)
  const occupied = counts.confirmed + counts.pending
  const spotsLeft = Math.max(capacity - occupied, 0)

  return {
    sessionKey: getSessionKey(session, index),
    session,
    label,
    capacity,
    confirmedCount: counts.confirmed,
    pendingCount: counts.pending,
    waitlistCount: counts.waitlist,
    spotsLeft,
    isFull: spotsLeft <= 0,
    isWaitlistOnly: spotsLeft <= 0,
  }
}

export function isRegistrationEnabled(course: Course): boolean {
  return course.registrationOpen !== false
}

export function isRegistrationOpen(course: Course): boolean {
  return (
    isRegistrationEnabled(course) &&
    typeof course.price === 'number' &&
    course.price > 0
  )
}

export function formatRegistrationStatus(status: CourseRegistrationStatus): string {
  switch (status) {
    case 'pending_payment':
      return 'Venter betaling'
    case 'confirmed':
      return 'Bekreftet'
    case 'waitlist':
      return 'Venteliste'
    case 'cancelled':
      return 'Avlyst'
    case 'refunded':
      return 'Refundert'
    default:
      return status
  }
}
