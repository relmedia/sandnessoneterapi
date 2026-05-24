import { NextResponse, type NextRequest } from 'next/server'
import {
  canCancelBookingStatus,
  isValidCancelToken,
  validateCancelLookup,
} from '@/lib/booking'
import { client } from '@/lib/sanity'
import { getSanityWriteClient } from '@/lib/sanity-write'

interface BookingRecord {
  _id: string
  service?: string
  date?: string
  time?: string
  status?: string
}

const bookingByTokenQuery = `*[_type == "bookingRequest" && cancelToken == $cancelToken][0]{
  _id, service, date, time, status
}`

const bookingByLookupQuery = `*[_type == "bookingRequest" && email == $email && date == $date && phone == $phone][0]{
  _id, service, date, time, status
}`

function bookingSummary(booking: BookingRecord) {
  return {
    service: booking.service,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    canCancel: canCancelBookingStatus(booking.status),
  }
}

async function findBooking(token?: string | null, lookup?: { email: string; date: string; phone: string }) {
  if (token) {
    if (!isValidCancelToken(token)) return null
    return client.fetch<BookingRecord | null>(bookingByTokenQuery, { cancelToken: token })
  }

  if (lookup) {
    return client.fetch<BookingRecord | null>(bookingByLookupQuery, {
      email: lookup.email,
      date: lookup.date,
      phone: lookup.phone.replace(/\D/g, ''),
    })
  }

  return null
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Mangler avbestillingskode.' }, { status: 400 })
  }

  const booking = await findBooking(token)
  if (!booking) {
    return NextResponse.json({ error: 'Fant ingen time med denne koden.' }, { status: 404 })
  }

  return NextResponse.json({ booking: bookingSummary(booking) })
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

  const payload = body as Record<string, unknown>
  let booking: BookingRecord | null = null

  if (typeof payload.token === 'string' && payload.token.trim()) {
    booking = await findBooking(payload.token.trim())
  } else {
    const validation = validateCancelLookup(body)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    booking = await findBooking(null, validation.value)
  }

  if (!booking) {
    return NextResponse.json({ error: 'Fant ingen time som matcher opplysningene.' }, { status: 404 })
  }

  if (!canCancelBookingStatus(booking.status)) {
    return NextResponse.json(
      { error: booking.status === 'cancelled' ? 'Timen er allerede avbestilt.' : 'Timen kan ikke avbestilles.' },
      { status: 409 }
    )
  }

  await writeClient
    .patch(booking._id)
    .set({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
    .commit()

  return NextResponse.json({
    ok: true,
    message: 'Timen er avbestilt.',
    booking: bookingSummary({ ...booking, status: 'cancelled' }),
  })
}
