'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { nbNOLocale } from '@sanity/locale-nb-no'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './sanity/schemas'
import { resolve } from './sanity/presentation/resolve'
import { draftModeCleanupPlugin } from './sanity/plugins/draftModeCleanup'
import { DeleteBookingAction } from './sanity/plugins/bookingRequestActions'

const singletonTypes = new Set(['siteSettings'])

export default defineConfig({
  name: 'default',
  title: 'Sandnes Soneterapi',

  basePath: '/studio',

  // Inlined at build time (browser-safe). Falls back to NEXT_PUBLIC_* for Vercel.
  projectId:
    process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:
    process.env.SANITY_STUDIO_DATASET ??
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    'production',

  i18n: {
    locales: (prev) => {
      const nbNO = prev.find((locale) => locale.id === 'nb-NO')
      return nbNO ? [nbNO] : prev
    },
  },

  plugins: [
    draftModeCleanupPlugin(),
    nbNOLocale(),
    structureTool({
      name: 'innhold',
      title: 'Innhold',
      structure: (S, context) =>
        S.list()
          .title('Innhold')
          .items([
            S.listItem()
              .title('Nettstedinnstillinger')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            S.documentTypeListItem('service').title('Behandlinger'),
            S.documentTypeListItem('article').title('Artikler'),
            S.listItem()
              .title('Priser')
              .id('priser')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('priser')
                  .title('Priser')
              ),
            S.listItem()
              .title('Foredrag')
              .id('foredrag')
              .child(
                S.document()
                  .schemaType('page')
                  .documentId('foredrag')
                  .title('Foredrag')
              ),
            S.documentTypeListItem('page').title('Andre sider'),
            orderableDocumentListDeskItem({ type: 'course', title: 'Kurs', S, context }),
            S.documentTypeListItem('book').title('Bøker'),
            S.divider(),
            S.documentTypeListItem('availabilityDay').title('Ledige dager'),
            S.listItem()
              .title('Timebestillinger')
              .schemaType('bookingRequest')
              .child(
                S.documentTypeList('bookingRequest')
                  .title('Timebestillinger')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('Kurspåmeldinger')
              .schemaType('courseRegistration')
              .child(
                S.documentTypeList('courseRegistration')
                  .title('Kurspåmeldinger')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),
          ]),
    }),
    presentationTool({
      name: 'forhandsvisning',
      title: 'Forhåndsvisning',
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
      {
        id: 'page-priser',
        title: 'Priser-side',
        schemaType: 'page',
        value: {
          title: 'Priser',
          slug: { _type: 'slug', current: 'priser' },
          priceList: [
            { _type: 'priceItem', label: 'Soneterapi – 1 time', price: '660 kr' },
            { _type: 'priceItem', label: 'Øreakupunktur', price: 'Kontakt for pris' },
            { _type: 'priceItem', label: 'Tankefeltterapi', price: 'Kontakt for pris' },
          ],
        },
      },
      {
        id: 'page-foredrag',
        title: 'Foredrag-side',
        schemaType: 'page',
        value: {
          title: 'Foredrag',
          slug: { _type: 'slug', current: 'foredrag' },
        },
      },
    ],
  },

  document: {
    actions: (input, context) => {
      if (context.schemaType === 'bookingRequest') {
        return input
          .filter(({ action }) => action !== 'duplicate' && action !== 'delete')
          .concat(DeleteBookingAction)
      }

      if (singletonTypes.has(context.schemaType)) {
        return input.filter(({ action }) => action !== 'delete' && action !== 'duplicate')
      }

      return input
    },
  },
})
