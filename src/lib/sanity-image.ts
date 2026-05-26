import imageUrlBuilder from '@sanity/image-url'
import { client } from './sanity-client'
import type { SanityImage } from './types'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

export function getSanityImageAspectStyle(image?: SanityImage): { aspectRatio: string } {
  const width = image?.dimensions?.width ?? 1
  const height = image?.dimensions?.height ?? 1
  return { aspectRatio: `${width} / ${height}` }
}
