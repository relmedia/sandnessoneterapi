import { NextResponse, type NextRequest } from 'next/server'
import {
  promoteNextWaitlistEntry,
  refundCourseRegistrationPayment,
} from '@/lib/course-registration-service'
import { client } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'

interface RegistrationRecord {
  _id: string
  status?: string
  courseTitle?: string
  sessionDate?: string
  sessionEndDate?: string
  sessionStartTime?: string
  sessionEndTime?: string
  vippsPaymentReference?: string
  amountPaid?: number
}

const registrationByTokenQuery = `*[_type == "courseRegistration" && cancelToken == $cancelToken][0]{
  _id, status, courseTitle, sessionDate, sessionEndDate, sessionStartTime, sessionEndTime, vippsPaymentReference, amountPaid
}`

function canCancelStatus(status?: string): boolean {
  return status === 'confirmed' || status === 'waitlist' || status === 'pending_payment'
}

function registrationSummary(registration: RegistrationRecord) {
  return {
    courseTitle: registration.courseTitle,
    sessionDate: registration.sessionDate,
    status: registration.status,
    canCancel: canCancelStatus(registration.status),
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Mangler avbestillingskode.' }, { status: 400 })
  }

  const registration = await client.fetch<RegistrationRecord | null>(registrationByTokenQuery, {
    cancelToken: token,
  })

  if (!registration) {
    return NextResponse.json({ error: 'Fant ingen påmelding med denne koden.' }, { status: 404 })
  }

  return NextResponse.json({ registration: registrationSummary(registration) })
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON.' }, { status: 400 })
  }

  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return NextResponse.json(
      { error: 'Avbestilling er ikke tilgjengelig akkurat nå. Ring oss for hjelp.' },
      { status: 503 }
    )
  }

  const token =
    body && typeof body === 'object' && typeof (body as Record<string, unknown>).token === 'string'
      ? ((body as Record<string, unknown>).token as string).trim()
      : ''

  if (!token) {
    return NextResponse.json({ error: 'Avbestillingskode er påkrevd.' }, { status: 400 })
  }

  const registration = await client.fetch<RegistrationRecord | null>(registrationByTokenQuery, {
    cancelToken: token,
  })

  if (!registration) {
    return NextResponse.json({ error: 'Fant ingen påmelding med denne koden.' }, { status: 404 })
  }

  if (!canCancelStatus(registration.status)) {
    return NextResponse.json(
      {
        error:
          registration.status === 'cancelled' || registration.status === 'refunded'
            ? 'Påmeldingen er allerede avlyst.'
            : 'Påmeldingen kan ikke avbestilles.',
      },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const wasConfirmed = registration.status === 'confirmed'

  if (wasConfirmed) {
    try {
      await refundCourseRegistrationPayment({
        vippsPaymentReference: registration.vippsPaymentReference,
        amountPaid: registration.amountPaid,
      })
    } catch (error) {
      console.error('[course-registration/cancel] Vipps refund failed:', error)
    }
  }

  await writeClient
    .patch(registration._id)
    .set({
      status: wasConfirmed ? 'refunded' : 'cancelled',
      cancelledAt: now,
    })
    .commit()

  if (wasConfirmed) {
    await promoteNextWaitlistEntry(registration._id)
  }

  return NextResponse.json({
    ok: true,
    message: wasConfirmed
      ? 'Påmeldingen er avbestilt. Refusjon behandles via Vipps.'
      : 'Påmeldingen er avbestilt.',
    registration: registrationSummary({
      ...registration,
      status: wasConfirmed ? 'refunded' : 'cancelled',
    }),
  })
}
