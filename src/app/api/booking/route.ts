import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getAdminSlotsForDay, getAvailabilityDay } from '@/lib/booking-availability'
import { sendBookingConfirmationEmails } from '@/lib/booking-email'
import { getAvailableSlotsForDate, validateBookingPayload } from '@/lib/booking'
import { isEmailConfigured, normalizeRecipientAddress } from '@/lib/email'
import { getRequestIp, isTurnstileConfigured, verifyTurnstileToken } from '@/lib/turnstile'
import { getEmailSiteUrl } from '@/lib/site-url'
import { getSiteSettings } from '@/lib/sanity'
import { client } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'

function getServiceLabel(service: string): string {
  if (service === 'soneterapi') return 'Soneterapi'
  if (service === 'oreakupunktur') return 'Øreakupunktur'
  return 'Tankefeltterapi'
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Ugyldig dato.' }, { status: 400 })
  }

  const parsedDate = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Ugyldig dato.' }, { status: 400 })
  }

  const availability = await getAvailabilityDay(date)
  const adminSlots = getAdminSlotsForDay(availability)

  const bookedTimes = await client.fetch<string[]>(
    `*[_type == "bookingRequest" && date == $date && status != "cancelled"].time`,
    { date }
  )

  const slots = getAvailableSlotsForDate(adminSlots, parsedDate, bookedTimes)

  return NextResponse.json({ date, slots })
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON.' }, { status: 400 })
  }

  const validation = validateBookingPayload(body)
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

  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return NextResponse.json(
      { error: 'Timebestilling er ikke aktivert ennå. Ring oss for å avtale time.' },
      { status: 503 }
    )
  }

  const { name, lastName, email, phone, service, date, time, message } = validation.value

  const availability = await getAvailabilityDay(date)
  const adminSlots = getAdminSlotsForDay(availability)

  if (adminSlots.length === 0) {
    return NextResponse.json({ error: 'Datoen er ikke tilgjengelig for booking.' }, { status: 409 })
  }

  const bookedTimes = await client.fetch<string[]>(
    `*[_type == "bookingRequest" && date == $date && status != "cancelled"].time`,
    { date }
  )

  const parsedDate = new Date(`${date}T12:00:00`)
  const available = getAvailableSlotsForDate(adminSlots, parsedDate, bookedTimes)

  if (!available.includes(time)) {
    return NextResponse.json({ error: 'Tidspunktet er ikke lenger tilgjengelig.' }, { status: 409 })
  }

  const serviceLabel = getServiceLabel(service)
  const cancelToken = randomUUID()

  await writeClient.create({
    _type: 'bookingRequest',
    name,
    lastName,
    email,
    phone: phone.replace(/\D/g, ''),
    service: serviceLabel,
    date,
    time,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    cancelToken,
  })

  const settings = await getSiteSettings()
  const adminEmail =
    normalizeRecipientAddress(process.env.BOOKING_ADMIN_EMAIL ?? '') ||
    (settings?.email ? normalizeRecipientAddress(settings.email) : null)
  const siteUrl = getEmailSiteUrl()
  const siteName = settings?.title ?? 'Sandnes Soneterapi'

  let emailsSent = false
  let customerEmailSent = false
  let adminEmailSent = false

  if (isEmailConfigured()) {
    const result = await sendBookingConfirmationEmails(
      {
        name,
        lastName,
        email,
        phone,
        serviceLabel,
        date,
        time,
        message,
        cancelToken,
      },
      {
        adminEmail,
        siteName,
        siteUrl,
      }
    )
    customerEmailSent = result.customerSent
    adminEmailSent = result.adminSent
    emailsSent = customerEmailSent

    if (!customerEmailSent) {
      console.error('[booking] Customer confirmation email failed to send.')
    }
    if (adminEmail && !adminEmailSent) {
      console.error('[booking] Admin notification email failed to send.')
    }
    if (!adminEmail) {
      console.warn('[booking] No admin email configured – admin notification skipped.')
    }
  } else {
    console.warn(
      '[booking] Email not configured. Set RESEND_API_KEY and BOOKING_ADMIN_EMAIL (or EMAIL_FROM) in environment variables.',
    )
  }

  return NextResponse.json({
    ok: true,
    message: emailsSent
      ? 'Timeforespørselen er sendt. Du får bekreftelse på e-post, og Terje tar kontakt for å bekrefte timen.'
      : 'Timeforespørselen er sendt. Terje tar kontakt for å bekrefte timen.',
    cancelToken,
    emailsSent,
    customerEmailSent,
    adminEmailSent,
  })
}
