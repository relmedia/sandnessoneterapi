import { defineQuery } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { isSanityConfigured } from './env'
import { client } from './sanity-client'
import { sanityFetch } from './sanity-live'
import { SANITY_CACHE_TAG } from './revalidate'
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

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

export type SanityQueryOptions = {
  stega?: boolean
  perspective?: 'published' | 'drafts'
}

async function safeFetch<T>(
  query: string,
  params: Record<string, string> = {},
  fallback: T,
  options?: SanityQueryOptions,
): Promise<T> {
  if (!isSanityConfigured()) return fallback

  try {
    const { data } = await sanityFetch({
      query,
      params,
      tags: [SANITY_CACHE_TAG],
      ...(options?.stega !== undefined && { stega: options.stega }),
      ...(options?.perspective !== undefined && { perspective: options.perspective }),
    })
    return (data ?? fallback) as T
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[sanity] Fetch failed:', error)
    }
    return fallback
  }
}

const publishedQuery = { perspective: 'published' as const, stega: false }

// ─── GROQ Queries ────────────────────────────────────────────────────────────

export const siteSettingsQuery = defineQuery(
  `*[_type == "siteSettings"][0]{
    _id, _type, title, tagline, heroHeading, heroBody,
    heroImage{
      ...,
      "dimensions": asset->metadata.dimensions
    },
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
    _id, title, slug, startDate, endDate, location, price, shortDescription, coverImage
  }`
)

export const courseBySlugQuery = defineQuery(
  `*[_type == "course" && slug.current == $slug && active == true][0]{
    _id, _type, title, slug, startDate, endDate, location, price, shortDescription, coverImage, body
  }`
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
  `*[_type == "page" && (slug.current == $slug || _id == $slug)][0]{
    _id, _type, title, slug, body,
    sidebarImages[]{
      ...,
      "dimensions": asset->metadata.dimensions
    },
    priceList[]{ label, price }
  }`
)

export async function getSiteSettings(options?: SanityQueryOptions): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings | null>(siteSettingsQuery, {}, null, options)
}

export async function getServices(options?: SanityQueryOptions): Promise<ServiceListItem[]> {
  return safeFetch<ServiceListItem[]>(servicesQuery, {}, [], options)
}

export async function getService(slug: string, options?: SanityQueryOptions): Promise<Service | null> {
  return safeFetch<Service | null>(serviceBySlugQuery, { slug }, null, options)
}

export async function getCourses(options?: SanityQueryOptions): Promise<CourseListItem[]> {
  return safeFetch<CourseListItem[]>(coursesQuery, {}, [], options)
}

export async function getCourse(slug: string, options?: SanityQueryOptions): Promise<Course | null> {
  return safeFetch<Course | null>(courseBySlugQuery, { slug }, null, options)
}

export async function getBooks(options?: SanityQueryOptions): Promise<BookListItem[]> {
  return safeFetch<BookListItem[]>(booksQuery, {}, [], options)
}

export async function getArticles(options?: SanityQueryOptions): Promise<ArticleListItem[]> {
  return safeFetch<ArticleListItem[]>(articlesQuery, {}, [], options)
}

export async function getArticle(slug: string, options?: SanityQueryOptions): Promise<Article | null> {
  return safeFetch<Article | null>(articleBySlugQuery, { slug }, null, options)
}

export async function getPage(slug: string, options?: SanityQueryOptions): Promise<Page | null> {
  return safeFetch<Page | null>(pageBySlugQuery, { slug }, null, options)
}

export { publishedQuery }
export { client } from './sanity-client'
