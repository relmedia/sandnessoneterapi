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
      select: { title: 'title', slug: 'slug.current', documentId: '_id' },
      resolve: (doc) => {
        const knownRoutes: Record<string, string> = {
          priser: '/priser',
          foredrag: '/foredrag',
          salgsvilkar: '/salgsvilkar',
          personvern: '/personvern',
          'om-meg': '/om-meg',
        }
        const href =
          (doc?.documentId && knownRoutes[doc.documentId]) ||
          (doc?.slug ? `/${doc.slug}` : '/')

        return {
          locations: [
            {
              title: doc?.title ?? 'Side',
              href,
            },
          ],
        }
      },
    }),
    course: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Kurs',
            href: doc?.slug ? `/kurs/${doc.slug}` : '/kurs',
          },
          { title: 'Kurs', href: '/kurs' },
        ],
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
