import { client } from '@/lib/sanity'

export interface AvailabilityDayRecord {
  date: string
  isClosed?: boolean
  slots?: string[]
}

const availabilityDayQuery = `*[_type == "availabilityDay" && date == $date][0]{
  date,
  isClosed,
  slots
}`

const availabilityRangeQuery = `*[
  _type == "availabilityDay" &&
  date >= $from &&
  date <= $to &&
  !isClosed &&
  count(slots) > 0
] | order(date asc) {
  date,
  slots
}`

export async function getAvailabilityDay(date: string): Promise<AvailabilityDayRecord | null> {
  return client.fetch<AvailabilityDayRecord | null>(availabilityDayQuery, { date })
}

export async function getAvailabilityRange(
  from: string,
  to: string
): Promise<AvailabilityDayRecord[]> {
  return client.fetch<AvailabilityDayRecord[]>(availabilityRangeQuery, { from, to })
}

export function getAdminSlotsForDay(record: AvailabilityDayRecord | null): string[] {
  if (!record || record.isClosed) return []

  const slots = record.slots ?? []
  return [...new Set(slots.filter((slot) => typeof slot === 'string' && slot.length > 0))].sort()
}
