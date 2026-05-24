import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getAvailableSlotsForDate, validateBookingPayload } from '@/lib/booking'
import { client } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Ugyldig dato.' }, { status: 400 })
  }

  const parsedDate = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Ugyldig dato.' }, { status: 400 })
  }

  const bookedTimes = await client.fetch<string[]>(
    `*[_type == "bookingRequest" && date == $date && status != "cancelled"].time`,
    { date }
  )

  const slots = getAvailableSlotsForDate(parsedDate, bookedTimes)

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

  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return NextResponse.json(
      { error: 'Timebestilling er ikke aktivert ennå. Ring oss for å avtale time.' },
      { status: 503 }
    )
  }

  const { name, email, phone, service, date, time, message } = validation.value

  const bookedTimes = await client.fetch<string[]>(
    `*[_type == "bookingRequest" && date == $date && status != "cancelled"].time`,
    { date }
  )

  const parsedDate = new Date(`${date}T12:00:00`)
  const available = getAvailableSlotsForDate(parsedDate, bookedTimes)

  if (!available.includes(time as (typeof available)[number])) {
    return NextResponse.json({ error: 'Tidspunktet er ikke lenger tilgjengelig.' }, { status: 409 })
  }

  const serviceLabel =
    service === 'soneterapi'
      ? 'Soneterapi'
      : service === 'oreakupunktur'
        ? 'Øreakupunktur'
        : 'Tankefeltterapi'

  const cancelToken = randomUUID()

  await writeClient.create({
    _type: 'bookingRequest',
    name,
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

  return NextResponse.json({
    ok: true,
    message: 'Timeforespørselen er sendt. Terje tar kontakt for å bekrefte timen.',
    cancelToken,
  })
}
