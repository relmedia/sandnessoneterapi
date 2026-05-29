/** 30-min slots from 07:00 to 22:00 for course session times in Studio. */
export function buildTimeOptions(): Array<{ title: string; value: string }> {
  const options: Array<{ title: string; value: string }> = [
    { title: 'Ikke satt', value: '' },
  ]

  for (let hour = 7; hour <= 22; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute === 30) continue

      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push({ title: value, value })
    }
  }

  return options
}

export const courseTimeOptions = buildTimeOptions()
