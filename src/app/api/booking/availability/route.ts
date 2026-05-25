import { NextResponse, type NextRequest } from 'next/server'
import { getDefaultAvailabilityRange, parseDateParam } from '@/lib/booking'
import { getAvailabilityRange } from '@/lib/booking-availability'

export async function GET(request: NextRequest) {
  const fromParam = request.nextUrl.searchParams.get('from')
  const toParam = request.nextUrl.searchParams.get('to')
  const defaults = getDefaultAvailabilityRange()

  const from = parseDateParam(fromParam) ?? defaults.from
  const to = parseDateParam(toParam) ?? defaults.to

  if (from > to) {
    return NextResponse.json({ error: 'Ugyldig datoperiode.' }, { status: 400 })
  }

  const days = await getAvailabilityRange(from, to)

  return NextResponse.json({
    from,
    to,
    dates: days.map((day) => day.date),
    days,
  })
}
