import { createClient } from 'next-sanity'
import { LexoRank } from 'lexorank'

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
  `*[_type == "course"] | order(startDate asc, title asc) { _id, title, orderRank }`,
)

if (courses.length === 0) {
  console.log('Ingen kurs funnet.')
  process.exit(0)
}

let rank = LexoRank.min()
const transaction = client.transaction()

for (const course of courses) {
  rank = rank.genNext().genNext()
  transaction.patch(course._id, { set: { orderRank: rank.toString() } })
  console.log(`Satt rekkefølge for: ${course.title}`)
}

await transaction.commit()
console.log(`Ferdig. Oppdaterte ${courses.length} kurs.`)
