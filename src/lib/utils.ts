import type { CourseSession } from '@/lib/types'

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

type CourseWithLegacyDates = {
  sessions?: CourseSession[]
  startDate?: string
  endDate?: string
}

export function getCourseSessions(course: CourseWithLegacyDates): CourseSession[] {
  if (course.sessions?.length) return course.sessions
  if (course.startDate) {
    return [{ date: course.startDate, endDate: course.endDate }]
  }
  return []
}

function formatTimeRange(startTime?: string, endTime?: string): string | null {
  if (startTime && endTime) return `${startTime}–${endTime}`
  if (startTime) return `kl. ${startTime}`
  return null
}

export function formatCourseSession(session: CourseSession): string | null {
  const datePart = formatCourseDateRange(session.date, session.endDate)
  const timePart = formatTimeRange(session.startTime, session.endTime)

  if (datePart && timePart) return `${datePart}, ${timePart}`
  return datePart ?? timePart
}

export function formatCourseSessions(sessions: CourseSession[]): string[] {
  return sessions
    .map(formatCourseSession)
    .filter((value): value is string => Boolean(value))
}

export function formatCourseListingLabel(sessions: CourseSession[]): string | null {
  if (sessions.length === 0) return null

  const firstDate = formatCourseDateRange(sessions[0].date, sessions[0].endDate)
  if (!firstDate) return null

  if (sessions.length === 1) return firstDate

  return `${firstDate} (+${sessions.length - 1} til)`
}

export function formatCourseDateRange(startDate?: string, endDate?: string): string | null {
  if (!startDate) return null

  if (!endDate || endDate === startDate) {
    return formatDateNb(startDate, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

  if (startYear === endYear && startMonth === endMonth) {
    const monthYear = formatDateNb(startDate, { month: 'short', year: 'numeric' })
    return `${startDay}–${endDay}. ${monthYear}`
  }

  const start = formatDateNb(startDate, { day: 'numeric', month: 'short', year: 'numeric' })
  const end = formatDateNb(endDate, { day: 'numeric', month: 'short', year: 'numeric' })

  return `${start} – ${end}`
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
}
