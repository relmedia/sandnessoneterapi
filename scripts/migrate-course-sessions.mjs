import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-02-01',
  useCdn: false,
})

const courses = await client.fetch(
  `*[_type == "course" && defined(startDate) && (!defined(sessions) || count(sessions) == 0)]{
    _id,
    title,
    startDate,
    endDate
  }`,
)

if (courses.length === 0) {
  console.log('Ingen kurs trenger migrering.')
  process.exit(0)
}

const transaction = client.transaction()

for (const course of courses) {
  transaction.patch(course._id, {
    set: {
      sessions: [
        {
          _type: 'courseSession',
          date: course.startDate,
          ...(course.endDate ? { endDate: course.endDate } : {}),
        },
      ],
    },
    unset: ['startDate', 'endDate'],
  })
  console.log(`Migrerte: ${course.title}`)
}

await transaction.commit()
console.log(`Ferdig. Migrerte ${courses.length} kurs.`)
