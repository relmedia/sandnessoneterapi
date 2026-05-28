import type { PortableTextBlock } from '@portabletext/types'

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  dimensions?: {
    width?: number
    height?: number
  }
  /** From GROQ: asset->_updatedAt — used to bust Next.js image cache when asset changes */
  assetUpdatedAt?: string
}

export interface SanitySlug {
  _type: 'slug'
  current: string
}

export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  title?: string
  tagline?: string
  heroHeading?: string
  heroBody?: string
  heroImage?: SanityImage
  phone?: string
  email?: string
  address?: string
  nnh?: boolean
  facebookUrl?: string
  metaDescription?: string
}

export interface Service {
  _id: string
  _type: 'service'
  title: string
  slug: SanitySlug
  shortDescription?: string
  body?: PortableTextBlock[]
  image?: SanityImage
  order?: number
}

export interface CourseSession {
  _key?: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  capacity?: number
}

export interface Course {
  _id: string
  _type: 'course'
  title: string
  slug: SanitySlug
  sessions?: CourseSession[]
  startDate?: string
  endDate?: string
  location?: string
  price?: number
  registrationOpen?: boolean
  shortDescription?: string
  body?: PortableTextBlock[]
  coverImage?: SanityImage
  active?: boolean
}

export interface Book {
  _id: string
  _type: 'book'
  title: string
  slug?: SanitySlug
  coverImage?: SanityImage
  isbn?: string
  publishedDate?: string
  price?: number
  pages?: number
  description?: PortableTextBlock[]
  order?: number
}

export interface Article {
  _id: string
  _type: 'article'
  title: string
  slug: SanitySlug
  publishedAt?: string
  excerpt?: string
  coverImage?: SanityImage
  body?: PortableTextBlock[]
}

export interface PagePriceItem {
  label: string
  price: string
}

export interface Page {
  _id: string
  _type: 'page'
  title: string
  slug: SanitySlug
  body?: PortableTextBlock[]
  sidebarImages?: SanityImage[]
  priceList?: PagePriceItem[]
}

export interface ServiceListItem {
  _id: string
  title: string
  slug: SanitySlug
  shortDescription?: string
  image?: SanityImage
}

export interface CourseListItem {
  _id: string
  title: string
  slug: SanitySlug
  sessions?: CourseSession[]
  startDate?: string
  endDate?: string
  location?: string
  price?: number
  shortDescription?: string
  coverImage?: SanityImage
}

export interface BookListItem {
  _id: string
  _updatedAt?: string
  title: string
  slug?: SanitySlug
  coverImage?: SanityImage
  isbn?: string
  price?: number
  publishedDate?: string
  description?: PortableTextBlock[]
  pages?: number
}

export interface ArticleListItem {
  _id: string
  title: string
  slug: SanitySlug
  publishedAt?: string
  excerpt?: string
  coverImage?: SanityImage
}
