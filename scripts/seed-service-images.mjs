import { createClient } from 'next-sanity'
import { createReadStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

const serviceImages = [
  {
    slug: 'tankefeltterapi',
    file: 'tankefeltterapi.jpg',
    alt: 'Person i meditasjon ved solnedgang – ro og indre balanse',
  },
]

for (const entry of serviceImages) {
  const documentId = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]._id`,
    { slug: entry.slug }
  )

  if (!documentId) {
    console.warn(`Fant ingen behandling med slug «${entry.slug}» – hoppet over.`)
    continue
  }

  const filePath = join(__dirname, '../public/images', entry.file)
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename: entry.file,
  })

  await client
    .patch(documentId)
    .set({
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: entry.alt,
      },
    })
    .commit()

  console.log(`Lastet opp bilde for ${entry.slug}`)
}
