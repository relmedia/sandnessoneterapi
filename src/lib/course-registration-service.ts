import 'server-only'

import { randomUUID } from 'node:crypto'
import {
  buildSessionAvailability,
  findCourseSession,
  getSessionCapacity,
  getSessionKey,
  isRegistrationOpen,
  type CourseRegistrationPayload,
  type CourseRegistrationRecord,
  type CourseSessionAvailability,
} from '@/lib/course-registration'
import {
  buildSessionLabelFromParts,
  isCourseEmailConfigured,
  sendCourseRegistrationEmails,
  sendCourseReminderEmail,
} from '@/lib/course-registration-email'
import { getEmailSiteUrl } from '@/lib/site-url'
import {
  captureVippsPayment,
  createVippsPayment,
  createVippsPaymentReference,
  getSiteBaseUrl,
  getVippsPayment,
  isVippsConfigured,
  refundVippsPayment,
} from '@/lib/vipps'
import { client, getCourse } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'
import { formatCourseSession } from '@/lib/utils'
import type { Course } from '@/lib/types'

interface SessionCounts {
  confirmed: number
  pending: number
  waitlist: number
}

interface RegistrationCountRow {
  sessionKey: string
  status: string
}

const ACTIVE_REGISTRATION_STATUSES = ['confirmed', 'pending_payment'] as const

export async function getCourseSessionAvailability(
  course: Course
): Promise<CourseSessionAvailability[]> {
  const sessions = course.sessions ?? []
  if (sessions.length === 0) return []

  const rows = await client.fetch<RegistrationCountRow[]>(
    `*[_type == "courseRegistration" && course._ref == $courseId && status in ["confirmed", "pending_payment", "waitlist"]]{
      sessionKey,
      status
    }`,
    { courseId: course._id }
  )

  const countsBySession = new Map<string, SessionCounts>()

  for (const row of rows) {
    const current = countsBySession.get(row.sessionKey) ?? {
      confirmed: 0,
      pending: 0,
      waitlist: 0,
    }

    if (row.status === 'confirmed') current.confirmed += 1
    if (row.status === 'pending_payment') current.pending += 1
    if (row.status === 'waitlist') current.waitlist += 1

    countsBySession.set(row.sessionKey, current)
  }

  return sessions
    .map((session, index) => {
      const sessionKey = getSessionKey(session, index)
      const label = formatCourseSession(session) ?? sessionKey
      const counts = countsBySession.get(sessionKey) ?? {
        confirmed: 0,
        pending: 0,
        waitlist: 0,
      }

      return buildSessionAvailability(course, session, index, label, counts)
    })
    .filter((item) => Boolean(item.label))
}

export async function createCourseRegistration(input: {
  courseSlug: string
  payload: CourseRegistrationPayload
}): Promise<
  | { ok: true; checkoutUrl: string; status: 'pending_payment' }
  | { ok: true; status: 'waitlist'; waitlistPosition: number }
  | { ok: false; error: string; status?: number }
> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return {
      ok: false,
      status: 503,
      error: 'Påmelding er ikke aktivert ennå. Ring oss for å melde deg på.',
    }
  }

  if (!isVippsConfigured()) {
    return {
      ok: false,
      status: 503,
      error: 'Vipps-betaling er ikke satt opp ennå. Ring oss for å melde deg på.',
    }
  }

  const course = await getCourse(input.courseSlug)
  if (!course) {
    return { ok: false, status: 404, error: 'Kurset ble ikke funnet.' }
  }

  if (!isRegistrationOpen(course)) {
    return { ok: false, status: 409, error: 'Påmelding er stengt for dette kurset.' }
  }

  const match = findCourseSession(course, input.payload.sessionKey)
  if (!match) {
    return { ok: false, status: 400, error: 'Ugyldig kursdato.' }
  }

  const availability = await getCourseSessionAvailability(course)
  const sessionAvailability = availability.find(
    (item) => item.sessionKey === input.payload.sessionKey
  )

  if (!sessionAvailability) {
    return { ok: false, status: 400, error: 'Ugyldig kursdato.' }
  }

  const { session } = match
  const cancelToken = randomUUID()
  const now = new Date().toISOString()
  const sessionLabel =
    formatCourseSession(session) ??
    buildSessionLabelFromParts({
      sessionDate: session.date,
      sessionEndDate: session.endDate,
      sessionStartTime: session.startTime,
      sessionEndTime: session.endTime,
    })

  if (sessionAvailability.isFull) {
    const waitlistPosition = sessionAvailability.waitlistCount + 1

    await writeClient.create({
      _type: 'courseRegistration',
      course: { _type: 'reference', _ref: course._id },
      courseTitle: course.title,
      sessionKey: input.payload.sessionKey,
      sessionDate: session.date,
      sessionEndDate: session.endDate,
      sessionStartTime: session.startTime,
      sessionEndTime: session.endTime,
      name: input.payload.name,
      lastName: input.payload.lastName,
      email: input.payload.email,
      phone: input.payload.phone.replace(/\D/g, ''),
      message: input.payload.message,
      status: 'waitlist',
      waitlistPosition,
      cancelToken,
      createdAt: now,
    })

    await sendCourseRegistrationEmails(
      {
        name: input.payload.name,
        lastName: input.payload.lastName,
        email: input.payload.email,
        phone: input.payload.phone,
        courseTitle: course.title,
        sessionLabel,
        status: 'waitlist',
        waitlistPosition,
        message: input.payload.message,
      },
      {
        siteName: 'Sandnes Soneterapi',
        siteUrl: getEmailSiteUrl(),
      }
    )

    return { ok: true, status: 'waitlist', waitlistPosition }
  }

  const registration = await writeClient.create({
    _type: 'courseRegistration',
    course: { _type: 'reference', _ref: course._id },
    courseTitle: course.title,
    sessionKey: input.payload.sessionKey,
    sessionDate: session.date,
    sessionEndDate: session.endDate,
    sessionStartTime: session.startTime,
    sessionEndTime: session.endTime,
    name: input.payload.name,
    lastName: input.payload.lastName,
    email: input.payload.email,
    phone: input.payload.phone.replace(/\D/g, ''),
    message: input.payload.message,
    status: 'pending_payment',
    cancelToken,
    createdAt: now,
  })

  const paymentReference = createVippsPaymentReference(registration._id)
  const price = course.price ?? 0
  const amountOre = Math.round(price * 100)
  const siteUrl = getSiteBaseUrl()
  const returnUrl = `${siteUrl}/kurs/${input.courseSlug}/pamelding/bekreftet?reference=${encodeURIComponent(paymentReference)}`

  const payment = await createVippsPayment({
    reference: paymentReference,
    amountOre,
    phoneNumber: input.payload.phone,
    paymentDescription: `${course.title} – ${sessionLabel}`,
    returnUrl,
  })

  await writeClient
    .patch(registration._id)
    .set({
      vippsPaymentReference: payment.reference,
      vippsPspReference: payment.pspReference,
    })
    .commit()

  return { ok: true, status: 'pending_payment', checkoutUrl: payment.redirectUrl }
}

async function getRegistrationByPaymentReference(
  reference: string
): Promise<(CourseRegistrationRecord & { _id: string; courseSlug?: string }) | null> {
  return client.fetch(
    `*[_type == "courseRegistration" && vippsPaymentReference == $reference][0]{
      _id,
      status,
      sessionKey,
      sessionDate,
      sessionEndDate,
      sessionStartTime,
      sessionEndTime,
      courseTitle,
      name,
      lastName,
      email,
      phone,
      message,
      cancelToken,
      vippsPaymentReference,
      amountPaid,
      "courseSlug": course->slug.current
    }`,
    { reference }
  )
}

export async function confirmRegistrationPayment(reference: string): Promise<boolean> {
  const writeClient = getSanityWriteClient()
  if (!writeClient || !isVippsConfigured()) return false

  const registration = await getRegistrationByPaymentReference(reference)
  if (!registration || registration.status === 'confirmed') {
    return registration?.status === 'confirmed'
  }

  if (registration.status !== 'pending_payment') return false

  const payment = await getVippsPayment(reference)
  if (payment.state !== 'AUTHORIZED') {
    if (payment.state === 'EXPIRED' || payment.state === 'ABORTED') {
      await cancelPendingRegistration(registration._id)
    }
    return false
  }

  const amountOre = payment.amount?.value
  if (!amountOre) return false

  await captureVippsPayment(reference, amountOre)
  await markRegistrationConfirmed(registration, amountOre / 100, payment.pspReference)
  return true
}

async function markRegistrationConfirmed(
  registration: CourseRegistrationRecord & { _id: string },
  amountPaid: number,
  pspReference?: string
): Promise<void> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) return

  const now = new Date().toISOString()
  const sessionLabel = buildSessionLabelFromParts({
    sessionDate: registration.sessionDate,
    sessionEndDate: registration.sessionEndDate,
    sessionStartTime: registration.sessionStartTime,
    sessionEndTime: registration.sessionEndTime,
  })

  await writeClient
    .patch(registration._id)
    .set({
      status: 'confirmed',
      paidAt: now,
      confirmedAt: now,
      amountPaid,
      vippsPspReference: pspReference,
    })
    .commit()

  await sendCourseRegistrationEmails(
    {
      name: registration.name,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      courseTitle: registration.courseTitle ?? 'Kurs',
      sessionLabel,
      amountPaid,
      status: 'confirmed',
      cancelToken: registration.cancelToken,
      message: registration.message,
    },
    {
      siteName: 'Sandnes Soneterapi',
      siteUrl: getEmailSiteUrl(),
    }
  )
}

async function cancelPendingRegistration(registrationId: string): Promise<void> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) return

  const registration = await client.fetch<{ _id: string; status: string } | null>(
    `*[_type == "courseRegistration" && _id == $id][0]{ _id, status }`,
    { id: registrationId }
  )

  if (!registration || registration.status !== 'pending_payment') return

  await writeClient
    .patch(registrationId)
    .set({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
    .commit()

  await promoteNextWaitlistEntry(registrationId)
}

export async function handleCourseRegistrationVippsWebhook(event: {
  reference: string
  name: string
  success?: boolean
}): Promise<void> {
  if (event.name === 'AUTHORIZED' && event.success !== false) {
    await confirmRegistrationPayment(event.reference)
    return
  }

  if (event.name === 'EXPIRED' || event.name === 'ABORTED') {
    const registration = await getRegistrationByPaymentReference(event.reference)
    if (registration) {
      await cancelPendingRegistration(registration._id)
    }
  }
}

export async function promoteNextWaitlistEntry(freedRegistrationId?: string): Promise<void> {
  const writeClient = getSanityWriteClient()
  if (!writeClient || !isVippsConfigured()) return

  let courseId: string | null = null
  let sessionKey: string | null = null

  if (freedRegistrationId) {
    const freed = await client.fetch<{ courseId: string; sessionKey: string } | null>(
      `*[_type == "courseRegistration" && _id == $id][0]{
        "courseId": course._ref,
        sessionKey
      }`,
      { id: freedRegistrationId }
    )
    courseId = freed?.courseId ?? null
    sessionKey = freed?.sessionKey ?? null
  }

  if (!courseId || !sessionKey) return

  const course = await client.fetch<Course | null>(
    `*[_type == "course" && _id == $courseId][0]{
      _id, title, slug, price, registrationOpen,
      sessions[]{ _key, date, endDate, startTime, endTime, capacity }
    }`,
    { courseId }
  )

  if (!course || !isRegistrationOpen(course)) return

  const availability = await getCourseSessionAvailability(course)
  const sessionAvailability = availability.find((item) => item.sessionKey === sessionKey)
  if (!sessionAvailability || sessionAvailability.spotsLeft <= 0) return

  const nextWaitlist = await client.fetch<
    (CourseRegistrationRecord & { _id: string }) | null
  >(
    `*[_type == "courseRegistration" && course._ref == $courseId && sessionKey == $sessionKey && status == "waitlist"] | order(waitlistPosition asc, createdAt asc)[0]{
      _id,
      status,
      sessionKey,
      sessionDate,
      sessionEndDate,
      sessionStartTime,
      sessionEndTime,
      courseTitle,
      name,
      lastName,
      email,
      phone,
      message,
      cancelToken
    }`,
    { courseId, sessionKey }
  )

  if (!nextWaitlist) return

  const sessionLabel = buildSessionLabelFromParts({
    sessionDate: nextWaitlist.sessionDate,
    sessionEndDate: nextWaitlist.sessionEndDate,
    sessionStartTime: nextWaitlist.sessionStartTime,
    sessionEndTime: nextWaitlist.sessionEndTime,
  })

  const paymentReference = createVippsPaymentReference(nextWaitlist._id)
  const price = course.price ?? 0
  const amountOre = Math.round(price * 100)
  const siteUrl = getSiteBaseUrl()
  const returnUrl = `${siteUrl}/kurs/${course.slug.current}/pamelding/bekreftet?reference=${encodeURIComponent(paymentReference)}`

  await writeClient
    .patch(nextWaitlist._id)
    .set({
      status: 'pending_payment',
      waitlistPosition: null,
      vippsPaymentReference: paymentReference,
    })
    .commit()

  const payment = await createVippsPayment({
    reference: paymentReference,
    amountOre,
    phoneNumber: nextWaitlist.phone,
    paymentDescription: `${course.title} – ${sessionLabel}`,
    returnUrl,
  })

  await writeClient
    .patch(nextWaitlist._id)
    .set({ vippsPspReference: payment.pspReference })
    .commit()

  await sendCourseRegistrationEmails(
    {
      name: nextWaitlist.name,
      lastName: nextWaitlist.lastName,
      email: nextWaitlist.email,
      phone: nextWaitlist.phone,
      courseTitle: nextWaitlist.courseTitle ?? course.title,
      sessionLabel,
      status: 'pending_payment',
      checkoutUrl: payment.redirectUrl,
      message: nextWaitlist.message,
    },
    {
      siteName: 'Sandnes Soneterapi',
      siteUrl: getEmailSiteUrl(),
    }
  )
}

export async function refundCourseRegistrationPayment(input: {
  vippsPaymentReference?: string
  amountPaid?: number
}): Promise<void> {
  if (!input.vippsPaymentReference || !input.amountPaid) return
  await refundVippsPayment(input.vippsPaymentReference, Math.round(input.amountPaid * 100))
}

export async function sendDueCourseReminders(now = new Date()): Promise<number> {
  const writeClient = getSanityWriteClient()
  if (!writeClient || !isCourseEmailConfigured()) return 0

  let sentCount = 0

  sentCount += await sendRemindersForOffset(now, 7, 'reminderSent7dAt')
  sentCount += await sendRemindersForOffset(now, 1, 'reminderSent1dAt')

  return sentCount
}

async function sendRemindersForOffset(
  now: Date,
  daysUntil: 7 | 1,
  field: 'reminderSent7dAt' | 'reminderSent1dAt'
): Promise<number> {
  const writeClient = getSanityWriteClient()
  if (!writeClient) return 0

  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  target.setDate(target.getDate() + daysUntil)
  const targetIso = target.toISOString().slice(0, 10)

  const registrations = await client.fetch<
    Array<CourseRegistrationRecord & { _id: string }>
  >(
    `*[
      _type == "courseRegistration" &&
      status == "confirmed" &&
      sessionDate == $targetDate &&
      !defined(${field})
    ]{
      _id,
      name,
      lastName,
      email,
      phone,
      courseTitle,
      sessionDate,
      sessionEndDate,
      sessionStartTime,
      sessionEndTime
    }`,
    { targetDate: targetIso }
  )

  let sentCount = 0

  for (const registration of registrations) {
    const sessionLabel = buildSessionLabelFromParts({
      sessionDate: registration.sessionDate,
      sessionEndDate: registration.sessionEndDate,
      sessionStartTime: registration.sessionStartTime,
      sessionEndTime: registration.sessionEndTime,
    })

    const sent = await sendCourseReminderEmail(
      {
        name: registration.name,
        lastName: registration.lastName,
        email: registration.email,
        phone: registration.phone,
        courseTitle: registration.courseTitle ?? 'Kurs',
        sessionLabel,
        status: 'confirmed',
      },
      {
        siteName: 'Sandnes Soneterapi',
        siteUrl: getEmailSiteUrl(),
      },
      daysUntil
    )

    if (sent) {
      await writeClient.patch(registration._id).set({ [field]: new Date().toISOString() }).commit()
      sentCount += 1
    }
  }

  return sentCount
}

export { ACTIVE_REGISTRATION_STATUSES, getSessionCapacity }
