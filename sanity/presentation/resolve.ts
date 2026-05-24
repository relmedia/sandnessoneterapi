import { defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    siteSettings: defineLocations({
      select: { title: 'title' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title ?? 'Forside', href: '/' }],
      }),
    }),
    service: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Behandling',
            href: doc?.slug ? `/behandling/${doc.slug}` : '/',
          },
          { title: 'Forside', href: '/' },
        ],
      }),
    }),
    article: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Artikkel',
            href: doc?.slug ? `/artikler/${doc.slug}` : '/artikler',
          },
          { title: 'Artikler', href: '/artikler' },
        ],
      }),
    }),
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Side',
            href: doc?.slug ? `/${doc.slug}` : '/',
          },
        ],
      }),
    }),
    course: defineLocations({
      select: { title: 'title' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title ?? 'Kurs', href: '/kurs' }],
      }),
    }),
    book: defineLocations({
      select: { title: 'title' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title ?? 'Bøker', href: '/boker' }],
      }),
    }),
  },
}
