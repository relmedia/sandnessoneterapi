import { NextResponse, type NextRequest } from 'next/server'
import {
  createCourseRegistration,
  getCourseSessionAvailability,
} from '@/lib/course-registration-service'
import { isRegistrationOpen, validateCourseRegistrationPayload } from '@/lib/course-registration'
import { getCourse } from '@/lib/sanity'
import { getRequestIp, isTurnstileConfigured, verifyTurnstileToken } from '@/lib/turnstile'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const course = await getCourse(slug)

  if (!course) {
    return NextResponse.json({ error: 'Kurset ble ikke funnet.' }, { status: 404 })
  }

  const sessions = await getCourseSessionAvailability(course)

  return NextResponse.json({
    registrationOpen: isRegistrationOpen(course),
    price: course.price ?? null,
    sessions,
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON.' }, { status: 400 })
  }

  const validation = validateCourseRegistrationPayload(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  if (isTurnstileConfigured()) {
    const token = validation.value.turnstileToken
    if (!token) {
      return NextResponse.json({ error: 'Bekreft at du ikke er en robot.' }, { status: 400 })
    }

    const isHuman = await verifyTurnstileToken(token, getRequestIp(request))
    if (!isHuman) {
      return NextResponse.json({ error: 'Sikkerhetskontrollen feilet. Prøv igjen.' }, { status: 400 })
    }
  }

  const result = await createCourseRegistration({
    courseSlug: slug,
    payload: validation.value,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 })
  }

  if (result.status === 'waitlist') {
    return NextResponse.json({
      ok: true,
      status: 'waitlist',
      waitlistPosition: result.waitlistPosition,
      message: `Kurset er fullt. Du står som nr. ${result.waitlistPosition} på ventelisten.`,
    })
  }

  return NextResponse.json({
    ok: true,
    status: 'pending_payment',
    checkoutUrl: result.checkoutUrl,
  })
}
