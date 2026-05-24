import { createClient, defineQuery } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { isSanityConfigured, sanityConfig } from './env'
import { REVALIDATE_SECONDS, SANITY_CACHE_TAG } from './revalidate'
import type {
  Article,
  ArticleListItem,
  BookListItem,
  Course,
  CourseListItem,
  Page,
  SanityImage,
  Service,
  ServiceListItem,
  SiteSettings,
} from './types'

export const client = createClient({
  ...sanityConfig,
  // Skip Sanity CDN so published edits appear as soon as Next.js revalidates.
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

async function safeFetch<T>(query: string, params: Record<string, string> = {}, fallback: T): Promise<T> {
  if (!isSanityConfigured()) return fallback

  try {
    return await client.fetch<T>(query, params, {
      ...(REVALIDATE_SECONDS === 0
        ? { cache: 'no-store' as const }
        : { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] } }),
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[sanity] Fetch failed:', error)
    }
    return fallback
  }
}

// ─── GROQ Queries ────────────────────────────────────────────────────────────

export const siteSettingsQuery = defineQuery(
  `*[_type == "siteSettings"][0]{
    _id, _type, title, tagline, heroHeading, heroBody,
    phone, email, address, nnh, facebookUrl, metaDescription
  }`
)

export const servicesQuery = defineQuery(
  `*[_type == "service"] | order(order asc) {
    _id, title, slug, shortDescription, image
  }`
)

export const serviceBySlugQuery = defineQuery(
  `*[_type == "service" && slug.current == $slug][0]{
    _id, _type, title, slug, shortDescription, body, image, order
  }`
)

export const coursesQuery = defineQuery(
  `*[_type == "course" && active == true] | order(startDate asc) {
    _id, title, slug, startDate, endDate, location, price, shortDescription
  }`
)

export const courseBySlugQuery = defineQuery(
  `*[_type == "course" && slug.current == $slug][0]`
)

export const booksQuery = defineQuery(
  `*[_type == "book"] | order(order asc) {
    _id, title, slug, coverImage, isbn, price, publishedDate, description, pages
  }`
)

export const articlesQuery = defineQuery(
  `*[_type == "article"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, excerpt, coverImage
  }`
)

export const articleBySlugQuery = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id, _type, title, slug, publishedAt, excerpt, coverImage, body
  }`
)

export const pageBySlugQuery = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id, _type, title, slug, body
  }`
)

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings | null>(siteSettingsQuery, {}, null)
}

export async function getServices(): Promise<ServiceListItem[]> {
  return safeFetch<ServiceListItem[]>(servicesQuery, {}, [])
}

export async function getService(slug: string): Promise<Service | null> {
  return safeFetch<Service | null>(serviceBySlugQuery, { slug }, null)
}

export async function getCourses(): Promise<CourseListItem[]> {
  return safeFetch<CourseListItem[]>(coursesQuery, {}, [])
}

export async function getCourse(slug: string): Promise<Course | null> {
  return safeFetch<Course | null>(courseBySlugQuery, { slug }, null)
}

export async function getBooks(): Promise<BookListItem[]> {
  return safeFetch<BookListItem[]>(booksQuery, {}, [])
}

export async function getArticles(): Promise<ArticleListItem[]> {
  return safeFetch<ArticleListItem[]>(articlesQuery, {}, [])
}

export async function getArticle(slug: string): Promise<Article | null> {
  return safeFetch<Article | null>(articleBySlugQuery, { slug }, null)
}

export async function getPage(slug: string): Promise<Page | null> {
  return safeFetch<Page | null>(pageBySlugQuery, { slug }, null)
}
