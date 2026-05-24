import { NextResponse } from 'next/server'
import { canCancelBookingStatus, validateCancelLookup } from '@/lib/booking'
import { client } from '@/lib/sanity'

interface BookingRecord {
  _id: string
  service?: string
  date?: string
  time?: string
  status?: string
}

const bookingByLookupQuery = `*[_type == "bookingRequest" && email == $email && date == $date && phone == $phone][0]{
  _id, service, date, time, status
}`

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON.' }, { status: 400 })
  }

  const validation = validateCancelLookup(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { email, date, phone } = validation.value

  const booking = await client.fetch<BookingRecord | null>(bookingByLookupQuery, {
    email,
    date,
    phone: phone.replace(/\D/g, ''),
  })

  if (!booking) {
    return NextResponse.json({ error: 'Fant ingen time som matcher opplysningene.' }, { status: 404 })
  }

  return NextResponse.json({
    booking: {
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      canCancel: canCancelBookingStatus(booking.status),
    },
  })
}
